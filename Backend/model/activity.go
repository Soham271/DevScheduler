package model

import (
	"time"

	"github.com/google/uuid"
)







const (
	ActivityTypeContest      = "contest"
	ActivityTypeReminder     = "reminder"
	ActivityTypeProductivity = "productivity"
	ActivityTypeEmail        = "email"
	ActivityTypeAI           = "ai"
	ActivityTypeSystem       = "system"
	ActivityTypeGithub       = "github"
)


const (
	PriorityInfo     = "info"
	PrioritySuccess  = "success"
	PriorityWarning  = "warning"
	PriorityCritical = "critical"
)


type Activity struct {
	ID        string            `json:"id"`
	UserID    string            `json:"user_id"`  
	Type      string            `json:"type"`     
	Priority  string            `json:"priority"` 
	Title     string            `json:"title"`
	Message   string            `json:"message"`
	Metadata  map[string]string `json:"metadata"` 
	Read      bool              `json:"read"`
	CreatedAt int64             `json:"created_at"` 
}


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
