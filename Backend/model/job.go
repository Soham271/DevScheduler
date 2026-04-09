package model

import (
	"time"

	"github.com/google/uuid"
)

type Job struct {
	ID        string `json:"id"`
	Type      string `json:"type"`
	ExecuteAt int64  `json:"execute_at"`
	Payload   string `json:"payload"`
	Status    string `json:"status"`
}

func NewJob(jobType string, delay time.Duration, payload string) *Job {
	return &Job{
		ID:        uuid.New().String(),
		Type:      jobType,
		ExecuteAt: time.Now().Add(delay).Unix(),
		Payload:   payload,
		Status:    "pending",
	}
}

// NewJobAt creates a job that executes at an exact timestamp.
// Used for scheduling emails at a specific datetime (send_at).
func NewJobAt(jobType string, executeAt time.Time, payload string) *Job {
	return &Job{
		ID:        uuid.New().String(),
		Type:      jobType,
		ExecuteAt: executeAt.Unix(),
		Payload:   payload,
		Status:    "pending",
	}
}
