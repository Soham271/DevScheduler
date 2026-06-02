package services

import (
	"devflow-scheduler/model"
)




func AnalyzeUser(profile *model.UserProfile) *model.AnalysisResult {
	perfLevel := classifyPerformance(profile.TotalSolved)
	ratingLevel := classifyRating(profile.Rating)

	
	
	
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
