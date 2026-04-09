package services

import (
	"bytes"
	"devflow-scheduler/model"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gocolly/colly"
)

// IST location for today's submission check
var leetcodeIST *time.Location

func init() {
	var err error
	leetcodeIST, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		leetcodeIST = time.FixedZone("IST", 5*3600+30*60)
	}
}

// FetchUserProfile is the single entry point for getting user data.
// It tries the real API first; if that fails, it falls back to deterministic mock data.
func FetchUserProfile(platform, username string) (*model.UserProfile, error) {
	switch platform {
	case "leetcode":
		profile, err := fetchFromLeetCodeAPI(username)
		if err != nil {
			log.Printf("⚠️ LeetCode API failed for %s: %v — using mock data", username, err)
			return generateMockProfile(platform, username), nil
		}
		return profile, nil

	case "codechef":
		profile, err := fetchFromCodeChefAPI(username)
		if err != nil {
			log.Printf("⚠️ CodeChef API failed for %s: %v — using mock data", username, err)
			return generateMockProfile(platform, username), nil
		}
		return profile, nil

	default:
		return nil, fmt.Errorf("unsupported platform: %s", platform)
	}
}

// fetchFromLeetCodeAPI uses the LeetCode GraphQL endpoint for problem stats,
// the contest ranking API for the real contest rating,
// and recentSubmissionList for today's activity check.
func fetchFromLeetCodeAPI(username string) (*model.UserProfile, error) {
	// --- Step 1: Fetch problem stats via GraphQL ---
	query := fmt.Sprintf(`{
		"query": "query { matchedUser(username: \"%s\") { submitStats { acSubmissionNum { count } } } }"
	}`, username)

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBufferString(query))
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("LeetCode returned status %d", resp.StatusCode)
	}

	var result struct {
		Data struct {
			MatchedUser *struct {
				SubmitStats struct {
					AcSubmissionNum []struct{ Count int } `json:"acSubmissionNum"`
				} `json:"submitStats"`
			} `json:"matchedUser"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if result.Data.MatchedUser == nil {
		return nil, fmt.Errorf("user %s not found on LeetCode", username)
	}

	totalSolved := 0
	if len(result.Data.MatchedUser.SubmitStats.AcSubmissionNum) > 0 {
		totalSolved = result.Data.MatchedUser.SubmitStats.AcSubmissionNum[0].Count
	}

	// --- Step 2: Fetch real contest rating via the contest API ---
	contestRating := fetchLeetCodeContestRating(username)

	// --- Step 3: Fetch today's submissions via recentSubmissionList ---
	submissionsToday := FetchLeetCodeTodaySubmissions(username)
	hasSubmittedToday := submissionsToday > 0

	return &model.UserProfile{
		Username:         username,
		Platform:         "leetcode",
		TotalSolved:      totalSolved,
		Rating:           contestRating,
		SubmissionsToday: hasSubmittedToday,
		IsInactiveToday:  !hasSubmittedToday,
		LastActiveAt:     time.Now(), // kept for backward compat, but NOT used for inactivity
		FetchedAt:        time.Now(),
		IsMockData:       false,
	}, nil
}

// FetchLeetCodeTodaySubmissions uses the recentSubmissionList GraphQL query
// to count how many accepted submissions the user has made TODAY (IST).
// This is the source of truth for LeetCode inactivity — no timestamp guessing.
func FetchLeetCodeTodaySubmissions(username string) int {
	query := fmt.Sprintf(`{
		"query": "query recentSubmissions($username: String!, $limit: Int!) { recentSubmissionList(username: $username, limit: $limit) { title timestamp statusDisplay } }",
		"variables": {"username": "%s", "limit": 20}
	}`, username)

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBufferString(query))
	if err != nil {
		log.Printf("⚠️ [LeetCode Submissions] HTTP request failed for %s: %v", username, err)
		return 0
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Data struct {
			RecentSubmissionList []struct {
				Title         string `json:"title"`
				Timestamp     string `json:"timestamp"`
				StatusDisplay string `json:"statusDisplay"`
			} `json:"recentSubmissionList"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("⚠️ [LeetCode Submissions] Failed to decode for %s: %v", username, err)
		return 0
	}

	// Get today's date in IST
	now := time.Now().In(leetcodeIST)
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, leetcodeIST)

	count := 0
	for _, sub := range result.Data.RecentSubmissionList {
		// Parse the unix timestamp string
		ts, err := strconv.ParseInt(sub.Timestamp, 10, 64)
		if err != nil {
			continue
		}
		subTime := time.Unix(ts, 0).In(leetcodeIST)

		// Only count accepted submissions from today (IST)
		if subTime.After(todayStart) && sub.StatusDisplay == "Accepted" {
			count++
		}
	}

	log.Printf("📊 [LeetCode Submissions] %s has %d accepted submission(s) today (IST)", username, count)
	return count
}

// fetchLeetCodeContestRating calls the LeetCode contest ranking API to get the
// real contest rating (e.g., 1872) instead of the global rank.
// Falls back to 1500 if the API fails or the user has no contest history.
func fetchLeetCodeContestRating(username string) int {
	const defaultRating = 1500

	query := fmt.Sprintf(`{
		"query": "query getUserContestRanking($username: String!) { userContestRanking(username: $username) { rating } }",
		"variables": {"username":"%s"}
	}`, username)

	resp, err := http.Post(
		"https://leetcode.com/graphql",
		"application/json",
		bytes.NewBufferString(query),
	)
	if err != nil {
		log.Printf("contest rating request failed for %s: %v", username, err)
		return defaultRating
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	log.Printf("LeetCode rating raw response for %s: %s", username, string(body))

	var result struct {
		Data struct {
			UserContestRanking *struct {
				Rating float64 `json:"rating"`
			} `json:"userContestRanking"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("decode failed for %s: %v", username, err)
		return defaultRating
	}

	if result.Data.UserContestRanking == nil {
		return defaultRating
	}

	return int(result.Data.UserContestRanking.Rating)
}

// fetchFromCodeChefAPI scrapes the CodeChef profile page for rating.
func fetchFromCodeChefAPI(username string) (*model.UserProfile, error) {
	c := colly.NewCollector()

	var rating int
	var found bool

	c.OnHTML(".rating-number", func(e *colly.HTMLElement) {
		fmt.Sscanf(e.Text, "%d", &rating)
		found = true
	})

	err := c.Visit(fmt.Sprintf("https://www.codechef.com/users/%s", username))
	if err != nil {
		return nil, fmt.Errorf("failed to scrape CodeChef: %w", err)
	}

	if !found {
		return nil, fmt.Errorf("rating element not found for %s on CodeChef", username)
	}

	return &model.UserProfile{
		Username:         username,
		Platform:         "codechef",
		TotalSolved:      0, // CodeChef scraping for solved count is unreliable
		Rating:           rating,
		SubmissionsToday: false,
		IsInactiveToday:  false, // CodeChef inactivity not tracked
		LastActiveAt:     time.Now(),
		FetchedAt:        time.Now(),
		IsMockData:       false,
	}, nil
}

// generateMockProfile creates realistic, deterministic mock data seeded by username.
// The same username always produces the same profile, making tests reproducible.
func generateMockProfile(platform, username string) *model.UserProfile {
	// Seed RNG deterministically from the username
	h := fnv.New64a()
	h.Write([]byte(username))
	rng := rand.New(rand.NewSource(int64(h.Sum64())))

	totalSolved := rng.Intn(800) + 10 // 10 to 810
	rating := rng.Intn(2500) + 800    // 800 to 3300
	hoursAgo := rng.Intn(72)          // last active 0-72 hours ago

	// Mock: randomly determine if the user solved something today
	submissionsToday := rng.Intn(3) > 0 // true if submitted today

	return &model.UserProfile{
		Username:         username,
		Platform:         platform,
		TotalSolved:      totalSolved,
		Rating:           rating,
		SubmissionsToday: submissionsToday,
		IsInactiveToday:  !submissionsToday,
		LastActiveAt:     time.Now().Add(-time.Duration(hoursAgo) * time.Hour),
		FetchedAt:        time.Now(),
		IsMockData:       true,
	}
}
