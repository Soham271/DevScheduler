package events

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"time"

	"devflow-scheduler/model"
	"devflow-scheduler/repository"
	"devflow-scheduler/services"
	"devflow-scheduler/workers"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

// HandleUserAnalysis runs the analysis pipeline and queues a worker job.
func HandleUserAnalysis(rdb *redis.Client, platform, username string) {
	log.Printf("[Event] Triggering intelligent analysis for %s@%s", username, platform)

	profile, err := services.FetchUserProfile(platform, username)
	if err != nil {
		log.Printf("[Event] Failed to fetch profile for %s@%s: %v", username, platform, err)
		return
	}

	result := services.AnalyzeUser(profile)

	payload := workers.AnalysisPayload{
		Username:    result.Username,
		Platform:    result.Platform,
		TotalSolved: result.Profile.TotalSolved,
		Rating:      result.Profile.Rating,
		PerfLevel:   result.PerformanceLevel,
		RatingLevel: result.RatingLevel,
		Inactive:    result.IsInactiveToday,
		Messages:    result.Messages,
		Contests:    result.Contests,
		IsMockData:  result.Profile.IsMockData,
	}

	payloadBytes, _ := json.Marshal(payload)
	newJob := model.NewJob(workers.JobTypeUserAnalysis, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// HandleContestEvent creates a legacy contest reminder job.
func HandleContestEvent(rdb *redis.Client, platform, contestName, userEmail string, delay time.Duration) {
	log.Printf("[Event] Contest approaching: %s on %s", contestName, platform)

	payloadObj := workers.ContestPayload{
		ContestName: contestName,
		Platform:    platform,
		NotifyEmail: userEmail,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	jobType := workers.JobTypeLeetCodeContest
	if platform == "CodeChef" {
		jobType = workers.JobTypeCodeChefContest
	}

	newJob := model.NewJob(jobType, delay, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// HandleUserInactivity creates a legacy LeetCode daily reminder job.
func HandleUserInactivity(rdb *redis.Client, username string) {
	log.Printf("[Event] User inactivity detected for: %s", username)

	payloadObj := workers.LeetCodeDailyPayload{Username: username}
	payloadBytes, _ := json.Marshal(payloadObj)

	newJob := model.NewJob(workers.JobTypeLeetCodeDaily, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// HandleDelayedEmail creates a one-time delayed email job in Redis.
func HandleDelayedEmail(rdb *redis.Client, to, subject, body string, delay time.Duration) {
	log.Printf("[Event] Creating delayed email job to %s with delay %s", to, delay)

	payloadObj := workers.DelayedEmailPayload{
		To:      to,
		Subject: subject,
		Body:    body,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	newJob := model.NewJob(workers.JobTypeDelayedEmail, delay, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// HandleScheduledEmail creates a one-time email job scheduled at an exact datetime.
func HandleScheduledEmail(rdb *redis.Client, to, subject, body string, sendAt time.Time) {
	log.Printf("[Event] Creating scheduled email job to %s at %s", to, sendAt.Format(time.RFC3339))

	payloadObj := workers.DelayedEmailPayload{
		To:      to,
		Subject: subject,
		Body:    body,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	newJob := model.NewJobAt(workers.JobTypeDelayedEmail, sendAt, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// HandleInactivityReminder creates an inactivity reminder job for immediate execution.
func HandleInactivityReminder(rdb *redis.Client, platform, username, email string, reminderNum, totalSolved int) {
	log.Printf("[Event] Creating inactivity reminder #%d for %s@%s", reminderNum, username, platform)

	payloadObj := workers.InactivityReminderPayload{
		Username:    username,
		Platform:    platform,
		Email:       email,
		ReminderNum: reminderNum,
		TotalSolved: totalSolved,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	newJob := model.NewJob(workers.JobTypeLeetCodeInactivity, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
	services.SetLastReminderSent(rdb, platform, username)
}

// HandleContestReminderEvent creates a contest reminder job if the slot is not duplicated.
func HandleContestReminderEvent(rdb *redis.Client, platform, contestName, email, startTime, timeRemaining string, minutesBefore int) bool {
	if services.IsContestReminderSent(rdb, platform, contestName, minutesBefore) {
		return false
	}

	log.Printf("[Event] Creating %d-min contest reminder for %s on %s", minutesBefore, contestName, platform)

	payloadObj := workers.ContestReminderPayload{
		ContestName:   contestName,
		Platform:      platform,
		Email:         email,
		StartTime:     startTime,
		TimeRemaining: timeRemaining,
		MinutesBefore: minutesBefore,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	newJob := model.NewJob(workers.JobTypeContestReminder, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
	services.MarkContestReminderSent(rdb, platform, contestName, minutesBefore)
	return true
}

func saveJobToRedis(rdb *redis.Client, job *model.Job) {
	jobJSON, _ := json.Marshal(job)
	err := rdb.ZAdd(ctx, "jobs", redis.Z{
		Score:  float64(job.ExecuteAt),
		Member: jobJSON,
	}).Err()
	if err != nil {
		log.Printf("Redis save error: %v", err)
		return
	}
	log.Printf("Job %s [%s] stored in Redis queue", job.ID, job.Type)
}

// GetRegisteredUsers reads all monitored users from MongoDB and fallbacks/complements with Redis.
func GetRegisteredUsers(rdb *redis.Client) []struct {
	Platform string
	Username string
} {
	registrations, err := repository.GetAllMonitoringRegistrations()
	if err != nil {
		log.Printf("Failed to fetch monitored users: %v", err)
		return nil
	}

	var users []struct {
		Platform string
		Username string
	}
	seen := make(map[string]bool)

	for _, reg := range registrations {
		key := reg.Platform + ":" + reg.Username
		if !seen[key] {
			users = append(users, struct {
				Platform string
				Username string
			}{
				Platform: reg.Platform,
				Username: reg.Username,
			})
			seen[key] = true
		}
	}

	keys, err := rdb.Keys(ctx, "registered_user:*").Result()
	if err == nil {
		for _, k := range keys {
			parts := strings.Split(k, ":")
			if len(parts) == 3 {
				platform := parts[1]
				username := parts[2]
				key := platform + ":" + username
				if !seen[key] {
					users = append(users, struct {
						Platform string
						Username string
					}{
						Platform: platform,
						Username: username,
					})
					seen[key] = true
				}
			}
		}
	}

	return users
}
