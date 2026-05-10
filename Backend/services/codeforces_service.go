package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"
	"time"
)

// ═══════════════════════════════════════════════════════════════
//  Codeforces Intelligence Service
//  Comprehensive data fetching for the dedicated Codeforces page.
// ═══════════════════════════════════════════════════════════════

type CodeforcesFullProfile struct {
	Username       string                    `json:"username"`
	Rating         int                       `json:"rating"`
	MaxRating      int                       `json:"max_rating"`
	Rank           string                    `json:"rank"`
	MaxRank        string                    `json:"max_rank"`
	TotalSolved    int                       `json:"total_solved"`
	Contribution   int                       `json:"contribution"`
	FriendCount    int                       `json:"friend_count"`
	ActiveDays     int                       `json:"active_days"`
	CurrentStreak  int                       `json:"current_streak"`
	MaxStreak      int                       `json:"max_streak"`
	IsActiveToday  bool                      `json:"is_active_today"`
	SubmissionCalendar map[string]int         `json:"submission_calendar"`
	RecentSubmissions  []CFSubmission         `json:"recent_submissions"`
	ContestHistory     []CFContest            `json:"contest_history"`
	ContestCount   int                       `json:"contest_count"`
	TagStats       map[string]int            `json:"tag_stats"`
	FetchedAt      time.Time                 `json:"fetched_at"`
}

type CFSubmission struct {
	Title       string `json:"title"`
	ProblemURL  string `json:"problem_url"`
	Verdict     string `json:"verdict"`
	Language    string `json:"language"`
	Timestamp   int64  `json:"timestamp"`
	TimeAgo     string `json:"time_ago"`
	ContestID   int    `json:"contest_id"`
	Index       string `json:"index"`
}

type CFContest struct {
	ContestID   int     `json:"contest_id"`
	ContestName string  `json:"contest_name"`
	Rank        int     `json:"rank"`
	OldRating   int     `json:"old_rating"`
	NewRating   int     `json:"new_rating"`
	RatingChange int    `json:"rating_change"`
	Timestamp   int64   `json:"timestamp"`
}

// FetchCodeforcesFullProfile fetches comprehensive Codeforces data.
func FetchCodeforcesFullProfile(username string) (*CodeforcesFullProfile, error) {
	profile := &CodeforcesFullProfile{
		Username:  username,
		FetchedAt: time.Now(),
	}

	// Step 1: Fetch user info (rating, rank, etc.)
	if err := fetchCFUserInfo(username, profile); err != nil {
		return nil, fmt.Errorf("failed to fetch user info: %w", err)
	}

	// Step 2: Fetch all submissions (for heatmap, recent, tag stats, solved count)
	fetchCFAllSubmissions(username, profile)

	// Step 3: Calculate streaks from calendar
	calculateCFStreaks(profile)

	// Step 4: Fetch contest/rating history
	fetchCFRatingHistory(username, profile)

	// Step 5: Check if active today
	now := time.Now().In(leetcodeIST)
	todayStr := now.Format("2006-01-02")
	if count, ok := profile.SubmissionCalendar[todayStr]; ok && count > 0 {
		profile.IsActiveToday = true
	}

	return profile, nil
}

// fetchCFUserInfo fetches basic user info from Codeforces API.
func fetchCFUserInfo(username string, profile *CodeforcesFullProfile) error {
	resp, err := http.Get(fmt.Sprintf("https://codeforces.com/api/user.info?handles=%s", username))
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Codeforces returned status %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Status string `json:"status"`
		Result []struct {
			Rating       int    `json:"rating"`
			MaxRating    int    `json:"maxRating"`
			Rank         string `json:"rank"`
			MaxRank      string `json:"maxRank"`
			Contribution int    `json:"contribution"`
			FriendOfCount int   `json:"friendOfCount"`
		} `json:"result"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("failed to decode user.info: %w", err)
	}

	if result.Status != "OK" || len(result.Result) == 0 {
		return fmt.Errorf("user %s not found on Codeforces", username)
	}

	u := result.Result[0]
	profile.Rating = u.Rating
	profile.MaxRating = u.MaxRating
	profile.Rank = u.Rank
	profile.MaxRank = u.MaxRank
	profile.Contribution = u.Contribution
	profile.FriendCount = u.FriendOfCount

	return nil
}

// fetchCFAllSubmissions fetches ALL submissions for heatmap, recent list, tag stats, etc.
func fetchCFAllSubmissions(username string, profile *CodeforcesFullProfile) {
	resp, err := http.Get(fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s", username))
	if err != nil {
		log.Printf("⚠️ [CF Submissions] HTTP failed for %s: %v", username, err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Status string `json:"status"`
		Result []struct {
			Verdict             string `json:"verdict"`
			CreationTimeSeconds int64  `json:"creationTimeSeconds"`
			ProgrammingLanguage string `json:"programmingLanguage"`
			Problem             struct {
				ContestID int      `json:"contestId"`
				Index     string   `json:"index"`
				Name      string   `json:"name"`
				Tags      []string `json:"tags"`
			} `json:"problem"`
		} `json:"result"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("⚠️ [CF Submissions] Decode failed for %s: %v", username, err)
		return
	}

	now := time.Now()
	solvedMap := make(map[string]bool)
	tagStats := make(map[string]int)
	calendar := make(map[string]int)

	// Collect recent submissions (last 20)
	recentCount := 0
	for _, s := range result.Result {
		subTime := time.Unix(s.CreationTimeSeconds, 0).In(leetcodeIST)
		dateStr := subTime.Format("2006-01-02")

		// Calendar for heatmap
		if s.Verdict == "OK" {
			calendar[dateStr]++
		}

		// Unique solved problems
		if s.Verdict == "OK" {
			key := fmt.Sprintf("%d-%s", s.Problem.ContestID, s.Problem.Index)
			if !solvedMap[key] {
				solvedMap[key] = true
				// Tag stats
				for _, tag := range s.Problem.Tags {
					tagStats[tag]++
				}
			}
		}

		// Recent submissions (first 20)
		if recentCount < 20 {
			problemURL := fmt.Sprintf("https://codeforces.com/contest/%d/problem/%s", s.Problem.ContestID, s.Problem.Index)
			profile.RecentSubmissions = append(profile.RecentSubmissions, CFSubmission{
				Title:     s.Problem.Name,
				ProblemURL: problemURL,
				Verdict:   s.Verdict,
				Language:  s.ProgrammingLanguage,
				Timestamp: s.CreationTimeSeconds,
				TimeAgo:   timeAgo(subTime, now),
				ContestID: s.Problem.ContestID,
				Index:     s.Problem.Index,
			})
			recentCount++
		}
	}

	profile.TotalSolved = len(solvedMap)
	profile.TagStats = tagStats
	profile.SubmissionCalendar = calendar

	// Count active days
	activeDays := 0
	for _, count := range calendar {
		if count > 0 {
			activeDays++
		}
	}
	profile.ActiveDays = activeDays

	log.Printf("📊 [CF Submissions] %s: %d solved, %d active days, %d recent submissions",
		username, profile.TotalSolved, activeDays, len(profile.RecentSubmissions))
}

// calculateCFStreaks calculates current and max streaks from submission calendar.
func calculateCFStreaks(profile *CodeforcesFullProfile) {
	if len(profile.SubmissionCalendar) == 0 {
		return
	}

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

	sort.Slice(dates, func(i, j int) bool {
		return dates[i].Before(dates[j])
	})

	// Max streak
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

	// Current streak (from today backwards)
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
			if streak == 0 && checkDate.Equal(todayDate) {
				checkDate = checkDate.AddDate(0, 0, -1)
				continue
			}
			break
		}
	}
	profile.CurrentStreak = streak
}

// fetchCFRatingHistory fetches contest rating change history.
func fetchCFRatingHistory(username string, profile *CodeforcesFullProfile) {
	resp, err := http.Get(fmt.Sprintf("https://codeforces.com/api/user.rating?handle=%s", username))
	if err != nil {
		log.Printf("⚠️ [CF Rating] HTTP failed for %s: %v", username, err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Status string `json:"status"`
		Result []struct {
			ContestID            int    `json:"contestId"`
			ContestName          string `json:"contestName"`
			Rank                 int    `json:"rank"`
			OldRating            int    `json:"oldRating"`
			NewRating            int    `json:"newRating"`
			RatingUpdateTimeSeconds int64 `json:"ratingUpdateTimeSeconds"`
		} `json:"result"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("⚠️ [CF Rating] Decode failed for %s: %v", username, err)
		return
	}

	for _, c := range result.Result {
		profile.ContestHistory = append(profile.ContestHistory, CFContest{
			ContestID:    c.ContestID,
			ContestName:  c.ContestName,
			Rank:         c.Rank,
			OldRating:    c.OldRating,
			NewRating:    c.NewRating,
			RatingChange: c.NewRating - c.OldRating,
			Timestamp:    c.RatingUpdateTimeSeconds,
		})
	}

	profile.ContestCount = len(profile.ContestHistory)

	log.Printf("📊 [CF Rating] Fetched %d contest entries for %s", profile.ContestCount, username)
}
