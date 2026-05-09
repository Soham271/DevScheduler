package model

import (
	"time"

	"github.com/google/uuid"
)

// ═══════════════════════════════════════════════════════════════
//  Activity Model — Represents a single event in the live feed.
//  Stored in Redis as a JSON-encoded list item.
// ═══════════════════════════════════════════════════════════════

// Activity types
const (
	ActivityTypeContest      = "contest"
	ActivityTypeReminder     = "reminder"
	ActivityTypeProductivity = "productivity"
	ActivityTypeEmail        = "email"
	ActivityTypeAI           = "ai"
	ActivityTypeSystem       = "system"
	ActivityTypeGithub       = "github"
)

// Activity priority levels
const (
	PriorityInfo     = "info"
	PrioritySuccess  = "success"
	PriorityWarning  = "warning"
	PriorityCritical = "critical"
)

// Activity represents a single event in the live activity feed.
type Activity struct {
	ID        string            `json:"id"`
	UserID    string            `json:"user_id"`  // email, username, or "system"
	Type      string            `json:"type"`     // contest, reminder, productivity, email, ai, system
	Priority  string            `json:"priority"` // info, success, warning, critical
	Title     string            `json:"title"`
	Message   string            `json:"message"`
	Metadata  map[string]string `json:"metadata"` // flexible key-value pairs for extra context
	Read      bool              `json:"read"`
	CreatedAt int64             `json:"created_at"` // unix timestamp
}

// NewActivity creates a new Activity with a generated UUID and current timestamp.
func NewActivity(userID, actType, priority, title, message string, metadata map[string]string) *Activity {
	if metadata == nil {
		metadata = make(map[string]string)
	}
	return &Activity{
		ID:        uuid.New().String(),
		UserID:    userID,
		Type:      actType,
		Priority:  priority,
		Title:     title,
		Message:   message,
		Metadata:  metadata,
		Read:      false,
		CreatedAt: time.Now().Unix(),
	}
}
