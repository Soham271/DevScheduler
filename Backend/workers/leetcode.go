package workers

import (
	"devflow-scheduler/model"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

func handleLeetCodeDaily(job model.Job) {
	var payload LeetCodeDailyPayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		log.Printf("Failed to parse payload for job %s: %v", job.ID, err)
		return
	}

	fmt.Printf("🔍 [LeetCode Daily] Checking status for %s...\n", payload.Username)
	// delay of 1 second to simulate the checking process
	time.Sleep(1 * time.Second)

	hasSolvedToday := false
	if !hasSolvedToday {
		fmt.Printf("🚨 [LeetCode Daily] ALERT: %s, you haven't solved today's problem yet!\n", payload.Username)
	} else {
		fmt.Printf("✅ [LeetCode Daily] %s already solved today's problem.\n", payload.Username)
	}
}

func handleLeetCodeContest(job model.Job) {
	var payload ContestPayload
	json.Unmarshal([]byte(job.Payload), &payload)

	fmt.Printf("🏆 [LeetCode Contest] Preparing environment for %s...\n", payload.ContestName)
	time.Sleep(500 * time.Millisecond)
	fmt.Printf("📧 [LeetCode Contest] Sent 1-hour warning to %s.\n", payload.NotifyEmail)
}
