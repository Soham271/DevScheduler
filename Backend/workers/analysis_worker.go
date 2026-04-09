package workers

import (
	"devflow-scheduler/model"
	"encoding/json"
	"fmt"
	"log"
	"strings"
)

const JobTypeUserAnalysis = "user_analysis"

// AnalysisPayload is the rich payload carried by user_analysis jobs.
// It includes all analysis results so the worker has full context.
type AnalysisPayload struct {
	Username    string                `json:"username"`
	Platform    string                `json:"platform"`
	TotalSolved int                   `json:"total_solved"`
	Rating      int                   `json:"rating"`
	PerfLevel   string                `json:"performance_level"`
	RatingLevel string                `json:"rating_level"`
	Inactive    bool                  `json:"is_inactive"`
	Messages    []model.DynamicMessage `json:"messages"`
	Contests    []model.ContestInfo    `json:"contests"`
	IsMockData  bool                  `json:"is_mock_data"`
}

// handleUserAnalysis processes a rich analysis job and logs the results.
func handleUserAnalysis(job model.Job) {
	var payload AnalysisPayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		log.Printf("❌ [Analysis Worker] Failed to parse payload for job %s: %v", job.ID, err)
		return
	}

	// Header
	dataSource := "LIVE"
	if payload.IsMockData {
		dataSource = "MOCK"
	}
	fmt.Printf("\n╔══════════════════════════════════════════════════════════════╗\n")
	fmt.Printf("║  🧠 INTELLIGENT ANALYSIS — %s@%s [%s DATA]           \n", payload.Username, payload.Platform, dataSource)
	fmt.Printf("╠══════════════════════════════════════════════════════════════╣\n")

	// Profile stats
	fmt.Printf("║  📊 Problems Solved : %d\n", payload.TotalSolved)
	fmt.Printf("║  ⭐ Rating          : %d\n", payload.Rating)
	fmt.Printf("║  🏷️  Performance     : %s\n", strings.ToUpper(payload.PerfLevel))
	fmt.Printf("║  🎯 Rating Tier     : %s\n", strings.ToUpper(payload.RatingLevel))
	fmt.Printf("║  💤 Inactive Today  : %v\n", payload.Inactive)

	// Messages
	if len(payload.Messages) > 0 {
		fmt.Printf("╠══════════════════════════════════════════════════════════════╣\n")
		fmt.Printf("║  📬 MESSAGES (%d):\n", len(payload.Messages))
		for i, msg := range payload.Messages {
			fmt.Printf("║    %d. [%s] %s\n", i+1, strings.ToUpper(msg.Category), msg.Text)
		}
	}

	// Contests
	if len(payload.Contests) > 0 {
		fmt.Printf("╠══════════════════════════════════════════════════════════════╣\n")
		fmt.Printf("║  🏁 UPCOMING CONTESTS (%d):\n", len(payload.Contests))
		for i, c := range payload.Contests {
			fmt.Printf("║    %d. %s — %s (%s)\n", i+1, c.Name, c.TimeRemaining, c.ScheduledAt)
		}
	}

	fmt.Printf("╚══════════════════════════════════════════════════════════════╝\n\n")
}
