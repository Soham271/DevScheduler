package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"
)

// ═══════════════════════════════════════════════════════════════
//  LeetCode Intelligence Service
//  Comprehensive data fetching for the dedicated LeetCode page.
// ═══════════════════════════════════════════════════════════════

// LeetCodeFullProfile holds the complete LeetCode analysis data.
type LeetCodeFullProfile struct {
	Username        string                 `json:"username"`
	TotalSolved     int                    `json:"total_solved"`
	EasySolved      int                    `json:"easy_solved"`
	MediumSolved    int                    `json:"medium_solved"`
	HardSolved      int                    `json:"hard_solved"`
	EasyTotal       int                    `json:"easy_total"`
	MediumTotal     int                    `json:"medium_total"`
	HardTotal       int                    `json:"hard_total"`
	AcceptanceRate  float64                `json:"acceptance_rate"`
	Ranking         int                    `json:"ranking"`
	ContestRating   int                    `json:"contest_rating"`
	ContestCount    int                    `json:"contest_count"`
	GlobalRanking   int                    `json:"global_ranking"`
	TopPercentage   float64                `json:"top_percentage"`
	CurrentStreak   int                    `json:"current_streak"`
	MaxStreak       int                    `json:"max_streak"`
	ActiveDays      int                    `json:"active_days"`
	TotalSubmissions int                   `json:"total_submissions"`
	IsActiveToday   bool                   `json:"is_active_today"`
	SubmissionCalendar map[string]int       `json:"submission_calendar"`
	RecentSubmissions  []LeetCodeSubmission `json:"recent_submissions"`
	ContestHistory     []LeetCodeContest    `json:"contest_history"`
	FetchedAt       time.Time              `json:"fetched_at"`
}

// LeetCodeSubmission represents a single recent submission.
type LeetCodeSubmission struct {
	Title         string `json:"title"`
	TitleSlug     string `json:"title_slug"`
	Status        string `json:"status"`
	Language      string `json:"language"`
	Timestamp     int64  `json:"timestamp"`
	TimeAgo       string `json:"time_ago"`
}

// LeetCodeContest represents a single contest entry.
type LeetCodeContest struct {
	Title          string  `json:"title"`
	StartTime      int64   `json:"start_time"`
	Rating         float64 `json:"rating"`
	Ranking        int     `json:"ranking"`
	ProblemsSolved int     `json:"problems_solved"`
	TotalProblems  int     `json:"total_problems"`
	FinishTime     int64   `json:"finish_time"`
}

// FetchLeetCodeFullProfile fetches comprehensive LeetCode data for the intelligence page.
func FetchLeetCodeFullProfile(username string) (*LeetCodeFullProfile, error) {
	profile := &LeetCodeFullProfile{
		Username:  username,
		FetchedAt: time.Now(),
	}

	// Step 1: Fetch problem stats + acceptance + ranking
	if err := fetchLCProfileStats(username, profile); err != nil {
		return nil, fmt.Errorf("failed to fetch profile stats: %w", err)
	}

	// Step 2: Fetch submission calendar (heatmap data)
	fetchLCSubmissionCalendar(username, profile)

	// Step 3: Calculate streaks from calendar
	calculateStreaks(profile)

	// Step 4: Fetch recent submissions
	fetchLCRecentSubmissions(username, profile)

	// Step 5: Fetch contest history
	fetchLCContestHistory(username, profile)

	// Step 6: Check if active today
	now := time.Now().In(leetcodeIST)
	todayStr := now.Format("2006-01-02")
	if count, ok := profile.SubmissionCalendar[todayStr]; ok && count > 0 {
		profile.IsActiveToday = true
	}

	return profile, nil
}

// fetchLCProfileStats fetches problem counts, acceptance rate, and ranking.
func fetchLCProfileStats(username string, profile *LeetCodeFullProfile) error {
	query := fmt.Sprintf(`{
		"query": "query getUserProfile($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { submitStats: submitStatsGlobal { acSubmissionNum { difficulty count submissions } } profile { ranking } } userContestRanking(username: $username) { attendedContestsCount rating globalRanking topPercentage } }",
		"variables": {"username": "%s"}
	}`, username)

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBufferString(query))
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Data struct {
			AllQuestionsCount []struct {
				Difficulty string `json:"difficulty"`
				Count      int    `json:"count"`
			} `json:"allQuestionsCount"`
			MatchedUser *struct {
				SubmitStats struct {
					AcSubmissionNum []struct {
						Difficulty  string `json:"difficulty"`
						Count       int    `json:"count"`
						Submissions int    `json:"submissions"`
					} `json:"acSubmissionNum"`
				} `json:"submitStats"`
				Profile struct {
					Ranking int `json:"ranking"`
				} `json:"profile"`
			} `json:"matchedUser"`
			UserContestRanking *struct {
				AttendedContestsCount int     `json:"attendedContestsCount"`
				Rating                float64 `json:"rating"`
				GlobalRanking         int     `json:"globalRanking"`
				TopPercentage         float64 `json:"topPercentage"`
			} `json:"userContestRanking"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	if result.Data.MatchedUser == nil {
		return fmt.Errorf("user %s not found on LeetCode", username)
	}

	// Parse total question counts
	for _, q := range result.Data.AllQuestionsCount {
		switch q.Difficulty {
		case "Easy":
			profile.EasyTotal = q.Count
		case "Medium":
			profile.MediumTotal = q.Count
		case "Hard":
			profile.HardTotal = q.Count
		}
	}

	// Parse solved counts
	totalSubmissions := 0
	for _, s := range result.Data.MatchedUser.SubmitStats.AcSubmissionNum {
		switch s.Difficulty {
		case "All":
			profile.TotalSolved = s.Count
			totalSubmissions = s.Submissions
		case "Easy":
			profile.EasySolved = s.Count
		case "Medium":
			profile.MediumSolved = s.Count
		case "Hard":
			profile.HardSolved = s.Count
		}
	}
	profile.TotalSubmissions = totalSubmissions

	// Acceptance rate
	if totalSubmissions > 0 {
		profile.AcceptanceRate = float64(profile.TotalSolved) / float64(totalSubmissions) * 100
	}

	profile.Ranking = result.Data.MatchedUser.Profile.Ranking

	// Contest data
	if result.Data.UserContestRanking != nil {
		profile.ContestRating = int(result.Data.UserContestRanking.Rating)
		profile.ContestCount = result.Data.UserContestRanking.AttendedContestsCount
		profile.GlobalRanking = result.Data.UserContestRanking.GlobalRanking
		profile.TopPercentage = result.Data.UserContestRanking.TopPercentage
	}

	return nil
}

// fetchLCSubmissionCalendar fetches the submission calendar (heatmap data).
func fetchLCSubmissionCalendar(username string, profile *LeetCodeFullProfile) {
	query := fmt.Sprintf(`{
		"query": "query userProfileCalendar($username: String!) { matchedUser(username: $username) { userCalendar { submissionCalendar activeYears } } }",
		"variables": {"username": "%s"}
	}`, username)

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBufferString(query))
	if err != nil {
		log.Printf("⚠️ [LC Calendar] HTTP request failed for %s: %v", username, err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Data struct {
			MatchedUser *struct {
				UserCalendar struct {
					SubmissionCalendar string `json:"submissionCalendar"`
				} `json:"userCalendar"`
			} `json:"matchedUser"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("⚠️ [LC Calendar] Decode failed for %s: %v", username, err)
		return
	}

	if result.Data.MatchedUser == nil {
		return
	}

	// Parse the submission calendar JSON string (unix_timestamp -> count)
	rawCal := make(map[string]int)
	if err := json.Unmarshal([]byte(result.Data.MatchedUser.UserCalendar.SubmissionCalendar), &rawCal); err != nil {
		log.Printf("⚠️ [LC Calendar] Calendar parse failed for %s: %v", username, err)
		return
	}

	// Convert unix timestamps to date strings
	profile.SubmissionCalendar = make(map[string]int)
	activeDays := 0
	for tsStr, count := range rawCal {
		ts, err := strconv.ParseInt(tsStr, 10, 64)
		if err != nil {
			continue
		}
		date := time.Unix(ts, 0).In(leetcodeIST).Format("2006-01-02")
		profile.SubmissionCalendar[date] = count
		if count > 0 {
			activeDays++
		}
	}
	profile.ActiveDays = activeDays

	log.Printf("📊 [LC Calendar] %s has %d active days in calendar", username, activeDays)
}

// calculateStreaks calculates current and max streaks from the submission calendar.
func calculateStreaks(profile *LeetCodeFullProfile) {
	if len(profile.SubmissionCalendar) == 0 {
		return
	}

	// Collect all dates with submissions
	var dates []time.Time
	for dateStr, count := range profile.SubmissionCalendar {
		if count > 0 {
			t, err := time.Parse("2006-01-02", dateStr)
			if err != nil {
				continue
			}
			dates = append(dates, t)
		}
	}

	if len(dates) == 0 {
		return
	}

	// Sort dates
	sort.Slice(dates, func(i, j int) bool {
		return dates[i].Before(dates[j])
	})

	// Calculate max streak
	maxStreak := 1
	currentStreak := 1
	for i := 1; i < len(dates); i++ {
		diff := dates[i].Sub(dates[i-1]).Hours() / 24
		if diff == 1 {
			currentStreak++
			if currentStreak > maxStreak {
				maxStreak = currentStreak
			}
		} else if diff > 1 {
			currentStreak = 1
		}
	}
	profile.MaxStreak = maxStreak

	// Calculate current streak (from today backwards)
	today := time.Now().In(leetcodeIST)
	todayDate := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, leetcodeIST)

	streak := 0
	checkDate := todayDate
	for {
		dateStr := checkDate.Format("2006-01-02")
		if count, ok := profile.SubmissionCalendar[dateStr]; ok && count > 0 {
			streak++
			checkDate = checkDate.AddDate(0, 0, -1)
		} else {
			// If today has no submissions, check from yesterday
			if streak == 0 && checkDate.Equal(todayDate) {
				checkDate = checkDate.AddDate(0, 0, -1)
				continue
			}
			break
		}
	}
	profile.CurrentStreak = streak
}

// fetchLCRecentSubmissions fetches the user's recent submissions.
func fetchLCRecentSubmissions(username string, profile *LeetCodeFullProfile) {
	query := fmt.Sprintf(`{
		"query": "query recentSubmissions($username: String!, $limit: Int!) { recentSubmissionList(username: $username, limit: $limit) { title titleSlug statusDisplay lang timestamp } }",
		"variables": {"username": "%s", "limit": 15}
	}`, username)

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBufferString(query))
	if err != nil {
		log.Printf("⚠️ [LC Submissions] HTTP request failed for %s: %v", username, err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Data struct {
			RecentSubmissionList []struct {
				Title         string `json:"title"`
				TitleSlug     string `json:"titleSlug"`
				StatusDisplay string `json:"statusDisplay"`
				Lang          string `json:"lang"`
				Timestamp     string `json:"timestamp"`
			} `json:"recentSubmissionList"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("⚠️ [LC Submissions] Decode failed for %s: %v", username, err)
		return
	}

	now := time.Now()
	for _, sub := range result.Data.RecentSubmissionList {
		ts, err := strconv.ParseInt(sub.Timestamp, 10, 64)
		if err != nil {
			continue
		}
		profile.RecentSubmissions = append(profile.RecentSubmissions, LeetCodeSubmission{
			Title:     sub.Title,
			TitleSlug: sub.TitleSlug,
			Status:    sub.StatusDisplay,
			Language:  sub.Lang,
			Timestamp: ts,
			TimeAgo:   timeAgo(time.Unix(ts, 0), now),
		})
	}

	log.Printf("📊 [LC Submissions] Fetched %d recent submissions for %s", len(profile.RecentSubmissions), username)
}

// fetchLCContestHistory fetches the user's contest history.
func fetchLCContestHistory(username string, profile *LeetCodeFullProfile) {
	query := fmt.Sprintf(`{
		"query": "query userContestRankingInfo($username: String!) { userContestRankingHistory(username: $username) { contest { title startTime } rating ranking problemsSolved totalProblems finishTimeInSeconds } }",
		"variables": {"username": "%s"}
	}`, username)

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBufferString(query))
	if err != nil {
		log.Printf("⚠️ [LC Contests] HTTP request failed for %s: %v", username, err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Data struct {
			UserContestRankingHistory []struct {
				Contest struct {
					Title     string `json:"title"`
					StartTime int64  `json:"startTime"`
				} `json:"contest"`
				Rating                float64 `json:"rating"`
				Ranking               int     `json:"ranking"`
				ProblemsSolved        int     `json:"problemsSolved"`
				TotalProblems         int     `json:"totalProblems"`
				FinishTimeInSeconds   int64   `json:"finishTimeInSeconds"`
			} `json:"userContestRankingHistory"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("⚠️ [LC Contests] Decode failed for %s: %v", username, err)
		return
	}

	for _, c := range result.Data.UserContestRankingHistory {
		if c.Rating == 0 && c.Ranking == 0 {
			continue // skip non-attended entries
		}
		profile.ContestHistory = append(profile.ContestHistory, LeetCodeContest{
			Title:          c.Contest.Title,
			StartTime:      c.Contest.StartTime,
			Rating:         c.Rating,
			Ranking:        c.Ranking,
			ProblemsSolved: c.ProblemsSolved,
			TotalProblems:  c.TotalProblems,
			FinishTime:     c.FinishTimeInSeconds,
		})
	}

	log.Printf("📊 [LC Contests] Fetched %d contest entries for %s", len(profile.ContestHistory), username)
}

// timeAgo returns a human-readable "time ago" string.
func timeAgo(t time.Time, now time.Time) string {
	d := now.Sub(t)
	switch {
	case d < time.Minute:
		return "just now"
	case d < time.Hour:
		m := int(d.Minutes())
		if m == 1 {
			return "1 minute ago"
		}
		return fmt.Sprintf("%d minutes ago", m)
	case d < 24*time.Hour:
		h := int(d.Hours())
		if h == 1 {
			return "1 hour ago"
		}
		return fmt.Sprintf("%d hours ago", h)
	default:
		days := int(d.Hours() / 24)
		if days == 1 {
			return "yesterday"
		}
		if days < 30 {
			return fmt.Sprintf("%d days ago", days)
		}
		return t.Format("Jan 2, 2006")
	}
}
