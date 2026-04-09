package services

import (
	"devflow-scheduler/model"
	"fmt"
)

// GenerateMessages produces a list of dynamic, personalized messages
// based on the user's profile and analysis results. No hardcoded values —
// every message is assembled from the actual data.
func GenerateMessages(
	profile *model.UserProfile,
	perfLevel, ratingLevel string,
	inactive bool,
) []model.DynamicMessage {
	var messages []model.DynamicMessage

	// --- Warning messages ---

	if inactive {
		messages = append(messages, model.DynamicMessage{
			Category: "warning",
			Text: fmt.Sprintf(
				"⚠️ %s, you haven't solved anything on %s today! Don't let your progress slip.",
				profile.Username, profile.Platform,
			),
		})
	}


	// --- Suggestion messages based on performance level ---

	switch perfLevel {
	case "beginner":
		messages = append(messages, model.DynamicMessage{
			Category: "suggestion",
			Text: fmt.Sprintf(
				"💡 You've solved %d problems so far. Try focusing on Easy-level problems to build consistency.",
				profile.TotalSolved,
			),
		})
	case "intermediate":
		messages = append(messages, model.DynamicMessage{
			Category: "suggestion",
			Text: fmt.Sprintf(
				"📊 With %d problems solved, you're making great progress! Start tackling Medium-level problems and topic tags you're weak in.",
				profile.TotalSolved,
			),
		})
	case "advanced":
		messages = append(messages, model.DynamicMessage{
			Category: "suggestion",
			Text: fmt.Sprintf(
				"🏆 Impressive — %d problems solved! Consider participating in weekly contests and exploring Hard-level problems.",
				profile.TotalSolved,
			),
		})
	}

	// --- Suggestion messages based on rating level ---

	switch ratingLevel {
	case "low":
		messages = append(messages, model.DynamicMessage{
			Category: "suggestion",
			Text: fmt.Sprintf(
				"📈 Your current rating is %d. Focus on Div 2/3 contests and practice contest-style problems to improve.",
				profile.Rating,
			),
		})
	case "medium":
		messages = append(messages, model.DynamicMessage{
			Category: "suggestion",
			Text: fmt.Sprintf(
				"🎯 Rating %d — you're solidly mid-tier. Push into Div 1 territory by mastering advanced topics like graphs, DP, and segment trees.",
				profile.Rating,
			),
		})
	case "high":
		messages = append(messages, model.DynamicMessage{
			Category: "motivation",
			Text: fmt.Sprintf(
				"🌟 Rating %d — you're in the elite tier! Keep competing to maintain your edge.",
				profile.Rating,
			),
		})
	}

	// --- General motivation (always included) ---

	messages = append(messages, model.DynamicMessage{
		Category: "motivation",
		Text: fmt.Sprintf(
			"💪 Keep pushing, %s! You've solved %d problems on %s so far.",
			profile.Username, profile.TotalSolved, profile.Platform,
		),
	})

	return messages
}
