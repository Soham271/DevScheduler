package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var rctx = context.Background()

type MonitoredRegistration struct {
	Email        string `json:"email"`
	RegisteredAt string `json:"registered_at"`
	ExpiresAt    string `json:"expires_at"`
}

// MaxInactivityReminders is the maximum number of inactivity reminders per user per day.
const MaxInactivityReminders = 50

// ReminderIntervalMinutes is the gap between consecutive inactivity reminders.
const ReminderIntervalMinutes = 60

// MonitoringTTL defines how long a monitored handle remains active.
const MonitoringTTL = 30 * 24 * time.Hour

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
	registration, ok := GetMonitoredRegistration(rdb, platform, username)
	if !ok {
		return ""
	}
	return registration.Email
}

// SaveMonitoredRegistration stores monitoring metadata and auto-expires it after 30 days.
func SaveMonitoredRegistration(rdb *redis.Client, platform, username, email string, now time.Time) (*MonitoredRegistration, error) {
	key := fmt.Sprintf("registered_user:%s:%s", platform, username)
	expiresAt := now.Add(MonitoringTTL)
	registration := &MonitoredRegistration{
		Email:        email,
		RegisteredAt: now.UTC().Format(time.RFC3339),
		ExpiresAt:    expiresAt.UTC().Format(time.RFC3339),
	}
	payload, err := json.Marshal(registration)
	if err != nil {
		return nil, err
	}
	if err := rdb.Set(rctx, key, payload, MonitoringTTL).Err(); err != nil {
		return nil, err
	}
	return registration, nil
}

// GetMonitoredRegistration returns monitoring metadata for a user.
// Legacy values that stored only a raw email remain supported.
func GetMonitoredRegistration(rdb *redis.Client, platform, username string) (*MonitoredRegistration, bool) {
	key := fmt.Sprintf("registered_user:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return nil, false
	}

	var registration MonitoredRegistration
	if err := json.Unmarshal([]byte(val), &registration); err == nil && registration.Email != "" {
		return &registration, true
	}

	return &MonitoredRegistration{Email: val}, true
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
