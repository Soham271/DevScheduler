package workers

import (
	"devflow-scheduler/model"
	"devflow-scheduler/services"
	"encoding/json"
	"log"
)

// handleDelayedEmail processes a one-time delayed email job.
// It parses the payload, sends the email via SMTP, and logs the result.
// After execution, the scheduler has already removed the job from Redis — no repetition.
func handleDelayedEmail(job model.Job) {
	var payload DelayedEmailPayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		log.Printf("❌ [Delayed Email] Failed to parse payload for job %s: %v", job.ID, err)
		return
	}

	log.Printf("📨 [Delayed Email] Sending to %s — Subject: %q", payload.To, payload.Subject)

	// Build a formatted email body
	body := services.BuildDelayedEmailBody(payload.Subject, payload.Body)

	err := services.SendEmail(payload.To, payload.Subject, body)
	if err != nil {
		log.Printf("❌ [Delayed Email] FAILED to send to %s: %v", payload.To, err)
		return
	}

	log.Printf("✅ [Delayed Email] Successfully sent to %s (job %s)", payload.To, job.ID)
}

// handleInactivityReminder processes a LeetCode inactivity reminder job.
// It sends a motivational reminder email with the user's current stats.
func handleInactivityReminder(job model.Job) {
	var payload InactivityReminderPayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		log.Printf("❌ [Inactivity Reminder] Failed to parse payload for job %s: %v", job.ID, err)
		return
	}

	log.Printf("🔔 [Inactivity Reminder] Sending reminder #%d to %s for %s@%s",
		payload.ReminderNum, payload.Email, payload.Username, payload.Platform)

	subject := services.BuildInactivityReminderSubject(payload.Username, payload.ReminderNum)
	body := services.BuildInactivityReminderBody(payload.Username, payload.Platform, payload.ReminderNum, payload.TotalSolved)

	err := services.SendEmail(payload.Email, subject, body)
	if err != nil {
		log.Printf("❌ [Inactivity Reminder] FAILED to send to %s: %v", payload.Email, err)
		return
	}

	log.Printf("✅ [Inactivity Reminder] Reminder #%d sent to %s (job %s)", payload.ReminderNum, payload.Email, job.ID)
}

// handleContestReminder processes a contest countdown reminder job.
// It sends an email with contest details and time remaining.
func handleContestReminder(job model.Job) {
	var payload ContestReminderPayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		log.Printf("❌ [Contest Reminder] Failed to parse payload for job %s: %v", job.ID, err)
		return
	}

	log.Printf("🏁 [Contest Reminder] Sending %d-min reminder for %s to %s",
		payload.MinutesBefore, payload.ContestName, payload.Email)

	subject := services.BuildContestReminderSubject(payload.ContestName, payload.MinutesBefore)
	body := services.BuildContestReminderBody(payload.ContestName, payload.Platform, payload.StartTime, payload.TimeRemaining, payload.MinutesBefore)

	err := services.SendEmail(payload.Email, subject, body)
	if err != nil {
		log.Printf("❌ [Contest Reminder] FAILED to send to %s: %v", payload.Email, err)
		return
	}

	log.Printf("✅ [Contest Reminder] %d-min reminder sent for %s to %s (job %s)",
		payload.MinutesBefore, payload.ContestName, payload.Email, job.ID)
}
