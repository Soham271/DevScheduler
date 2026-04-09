package workers

import (
	"devflow-scheduler/model"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

func handleCodeChefContest(job model.Job) {
	var payload ContestPayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		log.Printf("Invalid payload")
		return
	}

	fmt.Printf("👨‍🍳 [CodeChef] Fetching Starters details for %s...\n", payload.ContestName)
	time.Sleep(500 * time.Millisecond)
	fmt.Printf("📧 [CodeChef] Sent rating-change warning to %s.\n", payload.NotifyEmail)
}
