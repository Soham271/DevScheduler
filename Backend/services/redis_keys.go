package services

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// ═══════════════════════════════════════════════════════════════
//  Redis Key Strategy for Notification Deduplication
// ═══════════════════════════════════════════════════════════════
//
//  Key Pattern                                          | Purpose
//  ─────────────────────────────────────────────────────+────────────────────────────────
//  user_activity:<platform>:<username>                  | Last known solve count (int)
//  inactivity_count:<platform>:<username>               | Reminders sent today (int)
//  inactivity_date:<platform>:<username>                | Date of current tracking (string "2006-01-02")
//  last_reminder_sent:<platform>:<username>             | Unix timestamp of last reminder
//  contest_reminder_sent:<platform>:<contest>:<minutes> | Whether this slot was sent ("1")
//
// ═══════════════════════════════════════════════════════════════

var rctx = context.Background()

// MaxInactivityReminders is the maximum number of inactivity reminders per user per day.
const MaxInactivityReminders = 8

// ReminderIntervalMinutes is the gap between consecutive inactivity reminders.
const ReminderIntervalMinutes = 60

// ─── User Activity (solve count tracking) ───────────────────

// GetUserActivity returns the last known solve count from Redis.
// Returns 0 if not set.
func GetUserActivity(rdb *redis.Client, platform, username string) int {
	key := fmt.Sprintf("user_activity:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return 0
	}
	count, _ := strconv.Atoi(val)
	return count
}

// SetUserActivity saves the current solve count to Redis.
func SetUserActivity(rdb *redis.Client, platform, username string, solvedCount int) {
	key := fmt.Sprintf("user_activity:%s:%s", platform, username)
	rdb.Set(rctx, key, strconv.Itoa(solvedCount), 24*time.Hour)
}

// ─── Inactivity Counter ─────────────────────────────────────

// GetInactivityCount returns how many reminders have been sent today.
func GetInactivityCount(rdb *redis.Client, platform, username string) int {
	key := fmt.Sprintf("inactivity_count:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return 0
	}
	count, _ := strconv.Atoi(val)
	return count
}

// IncrInactivityCount increments the reminder count and returns the new value.
func IncrInactivityCount(rdb *redis.Client, platform, username string) int {
	key := fmt.Sprintf("inactivity_count:%s:%s", platform, username)
	val, err := rdb.Incr(rctx, key).Result()
	if err != nil {
		log.Printf("❌ Failed to increment inactivity count for %s@%s: %v", username, platform, err)
		return 0
	}
	// Auto-expire at midnight to reset daily
	rdb.ExpireAt(rctx, key, nextMidnightIST())
	return int(val)
}

// ResetInactivityCount clears the reminder counter for a user.
func ResetInactivityCount(rdb *redis.Client, platform, username string) {
	key := fmt.Sprintf("inactivity_count:%s:%s", platform, username)
	rdb.Del(rctx, key)
}

// ─── Inactivity Date Tracking ───────────────────────────────

// GetInactivityDate returns the date string for which inactivity is being tracked.
func GetInactivityDate(rdb *redis.Client, platform, username string) string {
	key := fmt.Sprintf("inactivity_date:%s:%s", platform, username)
	val, _ := rdb.Get(rctx, key).Result()
	return val
}

// SetInactivityDate sets the current date as the tracking date.
func SetInactivityDate(rdb *redis.Client, platform, username string, date string) {
	key := fmt.Sprintf("inactivity_date:%s:%s", platform, username)
	rdb.Set(rctx, key, date, 24*time.Hour)
}

// ─── Last Reminder Timestamp ────────────────────────────────

// GetLastReminderSent returns the time when the last reminder was sent.
// Returns zero time if not set.
func GetLastReminderSent(rdb *redis.Client, platform, username string) time.Time {
	key := fmt.Sprintf("last_reminder_sent:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return time.Time{}
	}
	ts, _ := strconv.ParseInt(val, 10, 64)
	return time.Unix(ts, 0)
}

// SetLastReminderSent records the current time as the last reminder sent time.
func SetLastReminderSent(rdb *redis.Client, platform, username string) {
	key := fmt.Sprintf("last_reminder_sent:%s:%s", platform, username)
	rdb.Set(rctx, key, strconv.FormatInt(time.Now().Unix(), 10), 24*time.Hour)
}

// ─── Contest Reminder Deduplication ─────────────────────────

// IsContestReminderSent checks if a reminder for a specific contest time slot has been sent.
func IsContestReminderSent(rdb *redis.Client, platform, contest string, minutesBefore int) bool {
	key := fmt.Sprintf("contest_reminder_sent:%s:%s:%d", platform, contest, minutesBefore)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return false
	}
	return val == "1"
}

// MarkContestReminderSent marks a contest time slot as sent.
// The key auto-expires after 24 hours to allow future contests.
func MarkContestReminderSent(rdb *redis.Client, platform, contest string, minutesBefore int) {
	key := fmt.Sprintf("contest_reminder_sent:%s:%s:%d", platform, contest, minutesBefore)
	rdb.Set(rctx, key, "1", 24*time.Hour)
}

// ─── User Email Lookup ──────────────────────────────────────

// GetUserEmail retrieves the email for a registered user.
// The email is stored as the value of the registered_user key.
func GetUserEmail(rdb *redis.Client, platform, username string) string {
	key := fmt.Sprintf("registered_user:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return ""
	}
	return val
}

// ─── Helper ─────────────────────────────────────────────────

// nextMidnightIST returns the next midnight in IST timezone.
func nextMidnightIST() time.Time {
	loc, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		loc = time.FixedZone("IST", 5*3600+30*60)
	}
	now := time.Now().In(loc)
	midnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, loc)
	return midnight
}
