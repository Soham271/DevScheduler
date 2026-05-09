package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"devflow-scheduler/model"

	"github.com/redis/go-redis/v9"
)

// ═══════════════════════════════════════════════════════════════
//  Activity Service — CRUD operations for the live activity feed.
//  Activities are stored in a Redis List (newest first via LPUSH).
//  Redis Key: "activities:global"
//  Max stored: 200 items (auto-trimmed on insert).
// ═══════════════════════════════════════════════════════════════

const (
	activitiesKey    = "activities:global"
	maxActivities    = 200
)

var actCtx = context.Background()

// CreateActivity stores a new activity in Redis and broadcasts it via SSE.
func CreateActivity(rdb *redis.Client, activity *model.Activity) {
	data, err := json.Marshal(activity)
	if err != nil {
		log.Printf("❌ [Activity] Failed to marshal activity: %v", err)
		return
	}

	// Push to the front of the list (newest first)
	if err := rdb.LPush(actCtx, activitiesKey, string(data)).Err(); err != nil {
		log.Printf("❌ [Activity] Failed to store in Redis: %v", err)
		return
	}

	// Trim to keep only the latest N activities
	rdb.LTrim(actCtx, activitiesKey, 0, maxActivities-1)

	// Broadcast to all connected SSE clients
	if ActivityHub != nil {
		ActivityHub.Broadcast(activity)
	}

	log.Printf("📢 [Activity] Created: [%s/%s] %s", activity.Type, activity.Priority, activity.Title)
}

// GetRecentActivities fetches activities from Redis with pagination.
// offset=0, limit=20 returns the 20 most recent activities.
func GetRecentActivities(rdb *redis.Client, offset, limit int) ([]model.Activity, error) {
	start := int64(offset)
	end := int64(offset + limit - 1)

	results, err := rdb.LRange(actCtx, activitiesKey, start, end).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch activities: %w", err)
	}

	activities := make([]model.Activity, 0, len(results))
	for _, item := range results {
		var a model.Activity
		if err := json.Unmarshal([]byte(item), &a); err != nil {
			log.Printf("⚠️ [Activity] Failed to unmarshal item: %v", err)
			continue
		}
		activities = append(activities, a)
	}

	return activities, nil
}

// GetActivityCount returns the total number of stored activities.
func GetActivityCount(rdb *redis.Client) int64 {
	count, err := rdb.LLen(actCtx, activitiesKey).Result()
	if err != nil {
		return 0
	}
	return count
}

// MarkActivityRead finds an activity by ID and marks it as read.
// This re-serializes the activity back into the list at the same position.
func MarkActivityRead(rdb *redis.Client, activityID string) error {
	results, err := rdb.LRange(actCtx, activitiesKey, 0, -1).Result()
	if err != nil {
		return fmt.Errorf("failed to fetch activities: %w", err)
	}

	for i, item := range results {
		var a model.Activity
		if err := json.Unmarshal([]byte(item), &a); err != nil {
			continue
		}
		if a.ID == activityID {
			a.Read = true
			updated, _ := json.Marshal(a)
			rdb.LSet(actCtx, activitiesKey, int64(i), string(updated))
			return nil
		}
	}

	return fmt.Errorf("activity %s not found", activityID)
}

// ClearActivities deletes all activities from the feed.
func ClearActivities(rdb *redis.Client) {
	rdb.Del(actCtx, activitiesKey)
	log.Println("🗑️ [Activity] Feed cleared")
}

// ═══════════════════════════════════════════════════════════════
//  Convenience Constructors — Used by workers and monitors
//  to create activities without repeating boilerplate.
// ═══════════════════════════════════════════════════════════════

// EmitContestActivity creates and stores a contest-related activity.
func EmitContestActivity(rdb *redis.Client, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeContest, model.PriorityInfo, title, message, metadata)
	CreateActivity(rdb, a)
}

// EmitReminderActivity creates and stores a reminder/inactivity activity.
func EmitReminderActivity(rdb *redis.Client, priority, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeReminder, priority, title, message, metadata)
	CreateActivity(rdb, a)
}

// EmitProductivityActivity creates and stores a productivity/analysis activity.
func EmitProductivityActivity(rdb *redis.Client, priority, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeProductivity, priority, title, message, metadata)
	CreateActivity(rdb, a)
}

// EmitEmailActivity creates and stores an email-related activity.
func EmitEmailActivity(rdb *redis.Client, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeEmail, model.PrioritySuccess, title, message, metadata)
	CreateActivity(rdb, a)
}

// EmitSystemActivity creates and stores a general system activity.
func EmitSystemActivity(rdb *redis.Client, title, message string) {
	a := model.NewActivity("system", model.ActivityTypeSystem, model.PriorityInfo, title, message, nil)
	CreateActivity(rdb, a)
}

// EmitGithubActivity creates and stores a GitHub push/PR activity.
func EmitGithubActivity(rdb *redis.Client, priority, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeGithub, priority, title, message, metadata)
	CreateActivity(rdb, a)
}
