package events

import (
	"fmt"
	"log"
	"time"

	"devflow-scheduler/services"

	"github.com/redis/go-redis/v9"
)

// IST timezone for scheduling
var monitorIST *time.Location

func init() {
	var err error
	monitorIST, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		monitorIST = time.FixedZone("IST", 5*3600+30*60)
	}
}

// StartSimulatedMonitors runs background monitoring goroutines.
// Instead of hardcoded usernames, it reads registered users from Redis
// and runs the intelligent analysis pipeline for each one.
func StartSimulatedMonitors(rdb *redis.Client) {
	// Monitor 1: Periodic intelligent analysis for all registered users
	go func() {
		// Run every 5 minutes (configurable)
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

	// Monitor 2: Contest reminders — checks if contests are approaching (legacy)
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		log.Println("🏁 [Monitor] Started contest reminder monitor (every 1 min)")

		for range ticker.C {
			now := time.Now()

			users := GetRegisteredUsers(rdb)
			if len(users) == 0 {
				continue
			}

			// CodeChef Starters — Wednesday
			if now.Weekday() == time.Wednesday {
				for _, u := range users {
					if u.Platform == "codechef" {
						HandleContestEvent(rdb, "CodeChef", "CodeChef Starters", u.Username+"@devflow", 2*time.Hour)
					}
				}
			}

			// LeetCode Weekly — Sunday
			if now.Weekday() == time.Sunday {
				for _, u := range users {
					if u.Platform == "leetcode" {
						HandleContestEvent(rdb, "LeetCode", "Weekly Contest", u.Username+"@devflow", 1*time.Hour)
					}
				}
			}

			// LeetCode Biweekly — alternate Saturday (even ISO weeks)
			_, week := now.ISOWeek()
			if now.Weekday() == time.Saturday && week%2 == 0 {
				for _, u := range users {
					if u.Platform == "leetcode" {
						HandleContestEvent(rdb, "LeetCode", "Biweekly Contest", u.Username+"@devflow", 1*time.Hour)
					}
				}
			}
		}
	}()

	// ═════════════════════════════════════════════════════════════
	//  Monitor 3: LeetCode Inactivity Reminder Monitor
	//  Checks every minute if it's past 8 PM IST and users are inactive.
	//  Uses recentSubmissionList (today's submissions) as the source of truth.
	// ═════════════════════════════════════════════════════════════
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		log.Println("💤 [Monitor] Started inactivity reminder monitor (every 1 min)")

		for range ticker.C {
			now := time.Now().In(monitorIST)
			todayDate := now.Format("2006-01-02")

			// Only activate after 8:00 PM IST
			cutoffHour := 20 // 8 PM
			if now.Hour() < cutoffHour {
				continue
			}

			users := GetRegisteredUsers(rdb)
			if len(users) == 0 {
				continue
			}

			for _, u := range users {
				// Currently only monitoring LeetCode users for inactivity
				if u.Platform != "leetcode" {
					continue
				}

				email := services.GetUserEmail(rdb, u.Platform, u.Username)
				if email == "" {
					continue
				}

				// Check if today's date differs from tracked date → reset counters
				trackedDate := services.GetInactivityDate(rdb, u.Platform, u.Username)
				if trackedDate != todayDate {
					services.ResetInactivityCount(rdb, u.Platform, u.Username)
					services.SetInactivityDate(rdb, u.Platform, u.Username, todayDate)
				}

				// Check if max reminders already sent
				reminderCount := services.GetInactivityCount(rdb, u.Platform, u.Username)
				if reminderCount >= services.MaxInactivityReminders {
					continue
				}

				// Fetch today's submissions directly via GraphQL recentSubmissionList
				// This is the single source of truth — no baseline comparison needed
				submissionsToday := services.FetchLeetCodeTodaySubmissions(u.Username)

				if submissionsToday > 0 {
					// User solved something today → active, clear reminders
					log.Printf("✅ [Inactivity Monitor] %s@%s has %d submission(s) today — clearing reminders",
						u.Username, u.Platform, submissionsToday)
					services.ResetInactivityCount(rdb, u.Platform, u.Username)
					continue
				}

				// User has 0 submissions today — check if enough time passed since last reminder
				lastSent := services.GetLastReminderSent(rdb, u.Platform, u.Username)
				if !lastSent.IsZero() {
					elapsed := time.Since(lastSent).Minutes()
					if elapsed < float64(services.ReminderIntervalMinutes) {
						continue // Too soon for next reminder
					}
				}

				// Fetch profile for total_solved count (used in the email body)
				profile, err := services.FetchUserProfile(u.Platform, u.Username)
				if err != nil {
					log.Printf("❌ [Inactivity Monitor] Failed to fetch profile for %s@%s: %v", u.Username, u.Platform, err)
					continue
				}

				// Send the reminder
				newCount := services.IncrInactivityCount(rdb, u.Platform, u.Username)
				HandleInactivityReminder(rdb, u.Platform, u.Username, email, newCount, profile.TotalSolved)

				log.Printf("📧 [Inactivity Monitor] Sent reminder #%d to %s@%s (%s)",
					newCount, u.Username, u.Platform, email)
			}
		}
	}()

	// ═════════════════════════════════════════════════════════════
	//  Monitor 4: Contest Countdown Reminder Monitor
	//  Checks every minute if any contest is within countdown range
	// ═════════════════════════════════════════════════════════════
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		log.Println("⏰ [Monitor] Started contest countdown reminder monitor (every 1 min)")

		// Countdown slots in minutes
		countdownSlots := []int{60, 30, 15, 5, 1}

		for range ticker.C {
			// Get upcoming contests from both platforms
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

							email := services.GetUserEmail(rdb, u.Platform, u.Username)
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
}

// parseContestTime attempts to parse the contest scheduled time string.
func parseContestTime(scheduledAt string) (time.Time, error) {
	// The contest service formats as: "Mon, 02 Jan 2006 03:04 PM IST"
	layout := "Mon, 02 Jan 2006 03:04 PM MST"
	t, err := time.Parse(layout, scheduledAt)
	if err != nil {
		// Try with IST timezone explicitly
		loc, _ := time.LoadLocation("Asia/Kolkata")
		if loc == nil {
			loc = time.FixedZone("IST", 5*3600+30*60)
		}
		// Try without timezone
		layout2 := "Mon, 02 Jan 2006 03:04 PM"
		t, err = time.ParseInLocation(layout2+" MST", scheduledAt, loc)
		if err != nil {
			return time.Time{}, err
		}
	}
	return t, nil
}
