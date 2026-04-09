package services

import (
	"devflow-scheduler/model"
)

// AnalyzeUser is the main entry point for the analysis engine.
// Given a user profile, it produces a full AnalysisResult with performance classification,
// inactivity detection (from API submissions, not timestamps), dynamic messages, and contest countdowns.
func AnalyzeUser(profile *model.UserProfile) *model.AnalysisResult {
	perfLevel := classifyPerformance(profile.TotalSolved)
	ratingLevel := classifyRating(profile.Rating)

	// For LeetCode: use IsInactiveToday from the API (based on recentSubmissionList).
	// For other platforms: fallback to false (not tracked).
	// NO more last_active_at timestamp guessing.
	inactive := profile.IsInactiveToday

	messages := GenerateMessages(profile, perfLevel, ratingLevel, inactive)
	contests := GetUpcomingContests(profile.Platform)

	return &model.AnalysisResult{
		Username:         profile.Username,
		Platform:         profile.Platform,
		PerformanceLevel: perfLevel,
		RatingLevel:      ratingLevel,
		IsInactiveToday:  inactive,
		Messages:         messages,
		Contests:         contests,
		Profile:          *profile,
	}
}

// classifyPerformance determines the user's level based on total problems solved.
//   - beginner:     < 100 problems
//   - intermediate: 100–500 problems
//   - advanced:     > 500 problems
func classifyPerformance(totalSolved int) string {
	switch {
	case totalSolved < 100:
		return "beginner"
	case totalSolved <= 500:
		return "intermediate"
	default:
		return "advanced"
	}
}

// classifyRating determines the user's competitive rating tier.
//   - low:    < 1400
//   - medium: 1400–1800
//   - high:   > 1800
func classifyRating(rating int) string {
	switch {
	case rating < 1400:
		return "low"
	case rating <= 1800:
		return "medium"
	default:
		return "high"
	}
}
