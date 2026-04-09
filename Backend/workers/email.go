package workers

import (
	"devflow-scheduler/model"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

func handleEmailNotification(job model.Job) {
	var payload EmailPayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		log.Printf("Invalid payload")
		return
	}

	fmt.Printf("📨 [Email] Connecting to SMTP server...\n")
	time.Sleep(2 * time.Second)
	fmt.Printf("📨 [Email] SUCCESS: Sent '%s' to %s\n", payload.Subject, payload.ToAddress)
}
