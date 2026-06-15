package events

import (
	"context"
	"fmt"
	"log"
	"time"

	"devflow-scheduler/config"
	"devflow-scheduler/model"
	"devflow-scheduler/repository"
	"devflow-scheduler/services"

	"github.com/redis/go-redis/v9"
)


var monitorIST *time.Location

func init() {
	var err error
	monitorIST, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		monitorIST = time.FixedZone("IST", 5*3600+30*60)
	}
}




func StartSimulatedMonitors(rdb *redis.Client) {
	
	go func() {
		
		ticker := time.NewTicker(5 * time.Minute)
		log.Println("🔍 [Monitor] Started periodic user analysis monitor (every 5 min)")

		for range ticker.C {
			users := GetRegisteredUsers(rdb)
			if len(users) == 0 {
				log.Println("📋 [Monitor] No registered users found — register via POST /register/:platform/:username")
				continue
			}

			log.Printf("📋 [Monitor] Running analysis for %d registered users", len(users))
			for _, u := range users {
				HandleUserAnalysis(rdb, u.Platform, u.Username)
			}
		}
	}()

	
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		log.Println("🏁 [Monitor] Started contest reminder monitor (every 1 min)")

		for range ticker.C {
			now := time.Now()

			users := GetRegisteredUsers(rdb)
			if len(users) == 0 {
				continue
			}

			
			if now.Weekday() == time.Wednesday {
				for _, u := range users {
					if u.Platform == "codechef" {
						HandleContestEvent(rdb, "CodeChef", "CodeChef Starters", u.Username+"@devflow", 2*time.Hour)
					}
				}
			}

			
			if now.Weekday() == time.Sunday {
				for _, u := range users {
					if u.Platform == "leetcode" {
						HandleContestEvent(rdb, "LeetCode", "Weekly Contest", u.Username+"@devflow", 1*time.Hour)
					}
				}
			}

			
			_, week := now.ISOWeek()
			if now.Weekday() == time.Saturday && week%2 == 0 {
				for _, u := range users {
					if u.Platform == "leetcode" {
						HandleContestEvent(rdb, "LeetCode", "Biweekly Contest", u.Username+"@devflow", 1*time.Hour)
					}
				}
			}

			
			if now.Weekday() == time.Saturday {
				for _, u := range users {
					if u.Platform == "codeforces" {
						HandleContestEvent(rdb, "Codeforces", "Div 2 Contest", u.Username+"@devflow", 1*time.Hour)
					}
				}
			}

			
			if now.Weekday() == time.Thursday {
				for _, u := range users {
					if u.Platform == "codeforces" {
						HandleContestEvent(rdb, "Codeforces", "Educational Round", u.Username+"@devflow", 1*time.Hour)
					}
				}
			}
		}
	}()

	
	
	
	go func() {
		
		ticker := time.NewTicker(10 * time.Minute)
		log.Println("🐙 [Monitor] Started GitHub Dev Pulse monitor (every 10 min)")

		for range ticker.C {
			users, err := repository.GetAllUsers()
			if err != nil || len(users) == 0 {
				continue
			}

			for _, u := range users {
				if u.GithubUsername == "" {
					continue
				}

				events, err := services.FetchRecentGithubActivity(rdb, u.GithubUsername)
				if err != nil {
					log.Printf("⚠️ [GitHub Monitor] Failed to fetch for %s: %v", u.GithubUsername, err)
					continue
				}

				if len(events) == 0 {
					continue
				}

				var pushCount, prCount int
				var lastRepo string

				for _, event := range events {
					if event.Type == "PushEvent" {
						pushCount++
						lastRepo = event.Repo.Name
					} else if event.Type == "PullRequestEvent" {
						prCount++
						lastRepo = event.Repo.Name
					}
				}

				title := fmt.Sprintf("Code Pushed — %s", u.Name)
				message := ""

				if pushCount > 0 && prCount > 0 {
					message = fmt.Sprintf("Pushed code %d time(s) and opened %d PR(s) on GitHub, mostly in %s. Great hustle!", pushCount, prCount, lastRepo)
				} else if pushCount > 0 {
					message = fmt.Sprintf("Pushed code %d time(s) to %s. Keeping the streak alive!", pushCount, lastRepo)
				} else if prCount > 0 {
					message = fmt.Sprintf("Opened %d Pull Request(s) on %s. Collaboration in progress!", prCount, lastRepo)
				}

				if message != "" {
					services.EmitGithubActivity(rdb, "info", title, message, map[string]string{
						"username": u.Name,
						"github":   u.GithubUsername,
						"repo":     lastRepo,
						"pushes":   fmt.Sprintf("%d", pushCount),
						"prs":      fmt.Sprintf("%d", prCount),
					})
					log.Printf("✅ [GitHub Monitor] Emitted activity for %s", u.GithubUsername)
				}
			}
		}
	}()

	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		log.Println("💤 [Monitor] Started inactivity reminder monitor (every 1 min)")

		for range ticker.C {
			now := time.Now().In(monitorIST)
			todayDate := now.Format("2006-01-02")

			if now.Hour() < 10 {
				continue
			}

			users := GetRegisteredUsers(rdb)
			if len(users) == 0 {
				continue
			}

			for _, u := range users {
				email := u.Email
				if email == "" {
					email = services.GetUserEmail(rdb, u.Platform, u.Username)
				}
				if email == "" {
					continue
				}

				trackedDate := services.GetInactivityDate(rdb, u.Platform, u.Username)
				if trackedDate != todayDate {
					services.ResetInactivityCount(rdb, u.Platform, u.Username)
					services.SetInactivityDate(rdb, u.Platform, u.Username, todayDate)
				}

				reminderCount := services.GetInactivityCount(rdb, u.Platform, u.Username)
				if reminderCount >= services.MaxInactivityReminders {
					continue
				}

				profile, err := services.FetchUserProfile(u.Platform, u.Username)
				if err != nil {
					log.Printf("❌ [Inactivity Monitor] Failed to fetch profile for %s@%s: %v", u.Username, u.Platform, err)
					continue
				}

				var submissionsToday int
				if u.Platform == "leetcode" {
					submissionsToday = services.FetchLeetCodeTodaySubmissions(u.Username)
				} else if u.Platform == "codeforces" {
					submissionsToday = services.FetchCFTodaySubmissionsPublic(u.Username)
				} else {
					if profile.SubmissionsToday {
						submissionsToday = 1
					} else {
						lastSolvedKey := fmt.Sprintf("last_solved:%s:%s", u.Platform, u.Username)
						val, err := rdb.Get(context.Background(), lastSolvedKey).Int()
						if err == nil && profile.TotalSolved > val {
							submissionsToday = profile.TotalSolved - val
						}
						// Always update the last_solved for future checks
						if profile.TotalSolved > 0 {
							rdb.Set(context.Background(), lastSolvedKey, profile.TotalSolved, 24 * time.Hour)
						}
					}
				}

				if submissionsToday > 0 {
					log.Printf("✅ [Inactivity Monitor] %s@%s has %d submission(s) today — clearing reminders",
						u.Username, u.Platform, submissionsToday)
					services.ResetInactivityCount(rdb, u.Platform, u.Username)

					services.EmitProductivityActivity(rdb, "success",
						fmt.Sprintf("Streak Maintained — %s@%s", u.Username, u.Platform),
						fmt.Sprintf("%s solved %d problem(s) today on %s 🔥", u.Username, submissionsToday, u.Platform),
						map[string]string{"username": u.Username, "platform": u.Platform, "submissions": fmt.Sprintf("%d", submissionsToday)},
					)

					continue
				}

				intervalMinutes := 60
				if now.Hour() >= 20 {
					intervalMinutes = 15
				}

				lastSent := services.GetLastReminderSent(rdb, u.Platform, u.Username)
				if !lastSent.IsZero() {
					elapsed := time.Since(lastSent).Minutes()
					if elapsed < float64(intervalMinutes) {
						continue
					}
				}

				newCount := services.IncrInactivityCount(rdb, u.Platform, u.Username)
				HandleInactivityReminder(rdb, u.Platform, u.Username, email, newCount, profile.TotalSolved)

				log.Printf("📧 [Inactivity Monitor] Sent reminder #%d to %s@%s (%s)",
					newCount, u.Username, u.Platform, email)
			}
		}
	}()

	
	
	
	
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		log.Println("⏰ [Monitor] Started contest countdown reminder monitor (every 1 min)")

		
		countdownSlots := []int{60, 30, 15, 5, 1}

		for range ticker.C {
			
			contests := services.GetUpcomingContests("")
			if len(contests) == 0 {
				continue
			}

			users := GetRegisteredUsers(rdb)
			if len(users) == 0 {
				continue
			}

			for _, contest := range contests {
				// Parse the scheduled time
				contestTime, err := parseContestTime(contest.ScheduledAt)
				if err != nil {
					continue
				}

				minutesUntil := int(time.Until(contestTime).Minutes())

				// Check each countdown slot
				for _, slot := range countdownSlots {
					// Allow a 2-minute window for matching (ticker runs every minute)
					if minutesUntil >= slot-1 && minutesUntil <= slot+1 {
						// Send to all users on this platform
						for _, u := range users {
							if u.Platform != contest.Platform {
								continue
							}

							email := u.Email
							if email == "" {
								email = services.GetUserEmail(rdb, u.Platform, u.Username)
							}
							if email == "" {
								continue
							}

							timeRemaining := fmt.Sprintf("%d minutes", minutesUntil)
							created := HandleContestReminderEvent(
								rdb,
								contest.Platform,
								contest.Name,
								email,
								contest.ScheduledAt,
								timeRemaining,
								slot,
							)
							if created {
								log.Printf("⏰ [Contest Monitor] Created %d-min reminder for %s → %s",
									slot, contest.Name, email)
							}
						}
					}
				}
			}
		}
	}()

	// ─── Hackathon Tracking Monitor ───
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		log.Println("🚀 [Monitor] Started hackathon tracking monitor (every 1 hour)")

		for range ticker.C {
			if config.HackathonTrackingCollection == nil {
				continue
			}

			now := time.Now()
			
			// Only send emails at roughly 10 AM
			if now.Hour() != 10 {
				continue
			}

			ctx := context.Background()
			
			// Find hackathons that are tracked and NOT yet submitted
			filter := map[string]interface{}{
				"status": map[string]interface{}{"$ne": "submitted"},
			}
			
			cursor, err := config.HackathonTrackingCollection.Find(ctx, filter)
			if err != nil {
				continue
			}

			var tracked []model.HackathonTracking
			cursor.All(ctx, &tracked)

			for _, t := range tracked {
				daysUntil := int(time.Until(t.EndDate).Hours() / 24)

				// 5 days before deadline: "Reminder to Apply/Submit"
				// Every day after that: "Daily Reminder"
				if daysUntil <= 5 && daysUntil >= 0 {
					subject := fmt.Sprintf("⚠️ Hackathon Reminder: %s ends in %d days!", t.HackathonName, daysUntil)
					body := fmt.Sprintf("Hi there,\n\nThe hackathon %s on %s is ending in %d days.\n\nCurrent Status: %s\n\nPlease make sure to submit your project before the deadline.\n\nHappy Hacking,\nDevFlow Scheduler", t.HackathonName, t.Platform, daysUntil, t.Status)
					
					// Use delayed email with 0 delay just to enqueue it
					HandleDelayedEmail(rdb, t.Email, subject, body, 0)
					log.Printf("🚀 [Hackathon Monitor] Sent reminder to %s for %s", t.Email, t.HackathonName)
				}
			}
		}
	}()
}


func parseContestTime(scheduledAt string) (time.Time, error) {
	
	layout := "Mon, 02 Jan 2006 03:04 PM MST"
	t, err := time.Parse(layout, scheduledAt)
	if err != nil {
		
		loc, _ := time.LoadLocation("Asia/Kolkata")
		if loc == nil {
			loc = time.FixedZone("IST", 5*3600+30*60)
		}
		
		layout2 := "Mon, 02 Jan 2006 03:04 PM"
		t, err = time.ParseInLocation(layout2+" MST", scheduledAt, loc)
		if err != nil {
			return time.Time{}, err
		}
	}
	return t, nil
}
