package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"devflow-scheduler/model"

	"github.com/redis/go-redis/v9"
)








const (
	activitiesKey    = "activities:global"
	maxActivities    = 200
)

var actCtx = context.Background()


func CreateActivity(rdb *redis.Client, activity *model.Activity) {
	data, err := json.Marshal(activity)
	if err != nil {
		log.Printf("❌ [Activity] Failed to marshal activity: %v", err)
		return
	}

	
	if err := rdb.LPush(actCtx, activitiesKey, string(data)).Err(); err != nil {
		log.Printf("❌ [Activity] Failed to store in Redis: %v", err)
		return
	}

	
	rdb.LTrim(actCtx, activitiesKey, 0, maxActivities-1)

	
	if ActivityHub != nil {
		ActivityHub.Broadcast(activity)
	}

	log.Printf("📢 [Activity] Created: [%s/%s] %s", activity.Type, activity.Priority, activity.Title)
}



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


func GetActivityCount(rdb *redis.Client) int64 {
	count, err := rdb.LLen(actCtx, activitiesKey).Result()
	if err != nil {
		return 0
	}
	return count
}



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


func ClearActivities(rdb *redis.Client) {
	rdb.Del(actCtx, activitiesKey)
	log.Println("🗑️ [Activity] Feed cleared")
}







func EmitContestActivity(rdb *redis.Client, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeContest, model.PriorityInfo, title, message, metadata)
	CreateActivity(rdb, a)
}


func EmitReminderActivity(rdb *redis.Client, priority, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeReminder, priority, title, message, metadata)
	CreateActivity(rdb, a)
}


func EmitProductivityActivity(rdb *redis.Client, priority, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeProductivity, priority, title, message, metadata)
	CreateActivity(rdb, a)
}


func EmitEmailActivity(rdb *redis.Client, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeEmail, model.PrioritySuccess, title, message, metadata)
	CreateActivity(rdb, a)
}


func EmitSystemActivity(rdb *redis.Client, title, message string) {
	a := model.NewActivity("system", model.ActivityTypeSystem, model.PriorityInfo, title, message, nil)
	CreateActivity(rdb, a)
}


func EmitGithubActivity(rdb *redis.Client, priority, title, message string, metadata map[string]string) {
	a := model.NewActivity("system", model.ActivityTypeGithub, priority, title, message, metadata)
	CreateActivity(rdb, a)
}
