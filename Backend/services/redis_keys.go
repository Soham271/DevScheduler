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


const MaxInactivityReminders = 50


const ReminderIntervalMinutes = 60


const MonitoringTTL = 30 * 24 * time.Hour





func GetUserActivity(rdb *redis.Client, platform, username string) int {
	key := fmt.Sprintf("user_activity:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return 0
	}
	count, _ := strconv.Atoi(val)
	return count
}


func SetUserActivity(rdb *redis.Client, platform, username string, solvedCount int) {
	key := fmt.Sprintf("user_activity:%s:%s", platform, username)
	rdb.Set(rctx, key, strconv.Itoa(solvedCount), 24*time.Hour)
}




func GetInactivityCount(rdb *redis.Client, platform, username string) int {
	key := fmt.Sprintf("inactivity_count:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return 0
	}
	count, _ := strconv.Atoi(val)
	return count
}


func IncrInactivityCount(rdb *redis.Client, platform, username string) int {
	key := fmt.Sprintf("inactivity_count:%s:%s", platform, username)
	val, err := rdb.Incr(rctx, key).Result()
	if err != nil {
		log.Printf("❌ Failed to increment inactivity count for %s@%s: %v", username, platform, err)
		return 0
	}
	
	rdb.ExpireAt(rctx, key, nextMidnightIST())
	return int(val)
}


func ResetInactivityCount(rdb *redis.Client, platform, username string) {
	key := fmt.Sprintf("inactivity_count:%s:%s", platform, username)
	rdb.Del(rctx, key)
}




func GetInactivityDate(rdb *redis.Client, platform, username string) string {
	key := fmt.Sprintf("inactivity_date:%s:%s", platform, username)
	val, _ := rdb.Get(rctx, key).Result()
	return val
}


func SetInactivityDate(rdb *redis.Client, platform, username string, date string) {
	key := fmt.Sprintf("inactivity_date:%s:%s", platform, username)
	rdb.Set(rctx, key, date, 24*time.Hour)
}





func GetLastReminderSent(rdb *redis.Client, platform, username string) time.Time {
	key := fmt.Sprintf("last_reminder_sent:%s:%s", platform, username)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return time.Time{}
	}
	ts, _ := strconv.ParseInt(val, 10, 64)
	return time.Unix(ts, 0)
}


func SetLastReminderSent(rdb *redis.Client, platform, username string) {
	key := fmt.Sprintf("last_reminder_sent:%s:%s", platform, username)
	rdb.Set(rctx, key, strconv.FormatInt(time.Now().Unix(), 10), 24*time.Hour)
}




func IsContestReminderSent(rdb *redis.Client, platform, contest string, minutesBefore int) bool {
	key := fmt.Sprintf("contest_reminder_sent:%s:%s:%d", platform, contest, minutesBefore)
	val, err := rdb.Get(rctx, key).Result()
	if err != nil {
		return false
	}
	return val == "1"
}



func MarkContestReminderSent(rdb *redis.Client, platform, contest string, minutesBefore int) {
	key := fmt.Sprintf("contest_reminder_sent:%s:%s:%d", platform, contest, minutesBefore)
	rdb.Set(rctx, key, "1", 24*time.Hour)
}





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
