package events

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"devflow-scheduler/model"
	"devflow-scheduler/services"
	"devflow-scheduler/workers"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

// ═══════════════════════════════════════════════════════════════
//  Existing Event Handlers (unchanged)
// ═══════════════════════════════════════════════════════════════

// HandleUserAnalysis is the main orchestrator for the intelligent analysis pipeline.
// It fetches user data → analyzes performance → generates messages → creates a job.
// This is the function that replaces all hardcoded event handlers.
func HandleUserAnalysis(rdb *redis.Client, platform, username string) {
	log.Printf("🔔 [Event] Triggering intelligent analysis for %s@%s", username, platform)

	// Step 1: Fetch user data (real API or mock fallback)
	profile, err := services.FetchUserProfile(platform, username)
	if err != nil {
		log.Printf("❌ [Event] Failed to fetch profile for %s@%s: %v", username, platform, err)
		return
	}

	// Step 2: Run the analysis engine
	result := services.AnalyzeUser(profile)

	// Step 3: Build the rich payload
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

	// Step 4: Create and queue the job (execute immediately, delay = 0)
	newJob := model.NewJob(workers.JobTypeUserAnalysis, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// HandleContestEvent creates a contest reminder job for a specific platform and user.
// Unlike the old version, email and contest details come from the caller (no hardcoding).
func HandleContestEvent(rdb *redis.Client, platform string, contestName string, userEmail string, delay time.Duration) {
	log.Printf("🔔 [Event] Contest approaching: %s on %s", contestName, platform)

	payloadObj := workers.ContestPayload{
		ContestName: contestName,
		Platform:    platform,
		NotifyEmail: userEmail,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	// decide job type based on platform
	jobType := workers.JobTypeLeetCodeContest
	if platform == "CodeChef" {
		jobType = workers.JobTypeCodeChefContest
	}

	newJob := model.NewJob(jobType, delay, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// HandleUserInactivity creates a legacy-style LeetCode daily reminder.
// Kept for backward compatibility with existing jobs.
func HandleUserInactivity(rdb *redis.Client, username string) {
	log.Printf("🔔 [Event] User inactivity detected for: %s", username)

	payloadObj := workers.LeetCodeDailyPayload{
		Username: username,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	newJob := model.NewJob(workers.JobTypeLeetCodeDaily, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)
}

// ═══════════════════════════════════════════════════════════════
//  New Notification Event Handlers
// ═══════════════════════════════════════════════════════════════

// HandleDelayedEmail creates a one-time delayed email job in Redis.
// The email will be sent once after the specified delay — no repetition.
func HandleDelayedEmail(rdb *redis.Client, to, subject, body string, delay time.Duration) {
	log.Printf("🔔 [Event] Creating delayed email job → to: %s, delay: %s", to, delay)

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
// This is used by the POST /schedule-email API with send_at.
func HandleScheduledEmail(rdb *redis.Client, to, subject, body string, sendAt time.Time) {
	log.Printf("🔔 [Event] Creating scheduled email job → to: %s, send_at: %s", to, sendAt.Format(time.RFC3339))

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
// Deduplication and rate-limiting are handled by the caller (monitor).
func HandleInactivityReminder(rdb *redis.Client, platform, username, email string, reminderNum, totalSolved int) {
	log.Printf("🔔 [Event] Creating inactivity reminder #%d for %s@%s", reminderNum, username, platform)

	payloadObj := workers.InactivityReminderPayload{
		Username:    username,
		Platform:    platform,
		Email:       email,
		ReminderNum: reminderNum,
		TotalSolved: totalSolved,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	// Execute immediately — the monitor already calculated the timing
	newJob := model.NewJob(workers.JobTypeLeetCodeInactivity, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)

	// Update tracking state
	services.SetLastReminderSent(rdb, platform, username)
}

// HandleContestReminderEvent creates a contest_reminder job if not already sent.
// Returns true if the job was created, false if it was a duplicate.
func HandleContestReminderEvent(rdb *redis.Client, platform, contestName, email, startTime, timeRemaining string, minutesBefore int) bool {
	// Deduplication: check if this time slot was already sent
	if services.IsContestReminderSent(rdb, platform, contestName, minutesBefore) {
		return false
	}

	log.Printf("🔔 [Event] Creating %d-min contest reminder for %s on %s", minutesBefore, contestName, platform)

	payloadObj := workers.ContestReminderPayload{
		ContestName:   contestName,
		Platform:      platform,
		Email:         email,
		StartTime:     startTime,
		TimeRemaining: timeRemaining,
		MinutesBefore: minutesBefore,
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	// Execute immediately — the monitor triggers this at the right time
	newJob := model.NewJob(workers.JobTypeContestReminder, 0, string(payloadBytes))
	saveJobToRedis(rdb, newJob)

	// Mark this time slot as sent
	services.MarkContestReminderSent(rdb, platform, contestName, minutesBefore)
	return true
}

// ═══════════════════════════════════════════════════════════════
//  Shared Helpers
// ═══════════════════════════════════════════════════════════════

func saveJobToRedis(rdb *redis.Client, job *model.Job) {
	jobJSON, _ := json.Marshal(job)
	err := rdb.ZAdd(ctx, "jobs", redis.Z{
		Score:  float64(job.ExecuteAt),
		Member: jobJSON,
	}).Err()

	if err != nil {
		log.Printf("❌ Redis Save Error: %v\n", err)
		return
	}
	log.Printf("✅ Job %s [%s] stored in Redis queue\n", job.ID, job.Type)
}

// GetRegisteredUsers reads all users registered via the /register API from Redis.
func GetRegisteredUsers(rdb *redis.Client) []struct {
	Platform string
	Username string
} {
	// Pattern: registered_user:<platform>:<username>
	keys, err := rdb.Keys(ctx, "registered_user:*").Result()
	if err != nil {
		log.Printf("❌ Failed to fetch registered users: %v", err)
		return nil
	}

	var users []struct {
		Platform string
		Username string
	}

	for _, key := range keys {
		// Parse "registered_user:leetcode:tourist"
		var platform, username string
		_, err := fmt.Sscanf(key, "registered_user:%s", &platform)
		if err != nil {
			continue
		}
		// Manual parsing since Sscanf doesn't handle : well
		parts := splitKey(key)
		if len(parts) == 3 {
			platform = parts[1]
			username = parts[2]
			users = append(users, struct {
				Platform string
				Username string
			}{Platform: platform, Username: username})
		}
	}

	return users
}

// splitKey splits a Redis key by ":"
func splitKey(key string) []string {
	var parts []string
	current := ""
	for _, ch := range key {
		if ch == ':' {
			parts = append(parts, current)
			current = ""
		} else {
			current += string(ch)
		}
	}
	if current != "" {
		parts = append(parts, current)
	}
	return parts
}
