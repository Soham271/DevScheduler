package services

import (
	"bytes"
	"context"
	"devflow-scheduler/config"
	"devflow-scheduler/model"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

var IST *time.Location

func init() {
	var err error
	IST, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		IST = time.FixedZone("IST", 5*3600+30*60)
	}
}

// GetUpcomingContests fetches real live contest + hackathon data from platform APIs.
func GetUpcomingContests(platform string) []model.ContestInfo {
	var mu sync.Mutex
	var contests []model.ContestInfo
	var wg sync.WaitGroup

	fetch := func(fn func() []model.ContestInfo) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			result := fn()
			mu.Lock()
			contests = append(contests, result...)
			mu.Unlock()
		}()
	}

	// ── Coding Contests ───────────────────────────────────────
	if platform == "" || platform == "codeforces" {
		fetch(fetchCodeforcesContests)
	}
	if platform == "" || platform == "leetcode" {
		fetch(fetchLeetCodeContests)
	}
	if platform == "" || platform == "codechef" {
		fetch(fetchCodeChefContests)
	}

	// ── Hackathons ────────────────────────────────────────────
	if platform == "" || platform == "devpost" {
		fetch(fetchDevpostHackathons)
	}
	if platform == "" || platform == "hackerearth" {
		fetch(fetchHackerEarthEvents)
	}
	if platform == "" || platform == "unstop" || platform == "devfolio" || platform == "local" {
		fetch(func() []model.ContestInfo {
			return fetchCustomHackathons(platform)
		})
	}

	wg.Wait()
	return contests
}

// ─── Codeforces ──────────────────────────────────────────────────────────────

func fetchCodeforcesContests() []model.ContestInfo {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get("https://codeforces.com/api/contest.list?gym=false")
	if err != nil {
		log.Printf("⚠️ [Codeforces Contests] HTTP error: %v", err)
		return nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var apiResp struct {
		Status string `json:"status"`
		Result []struct {
			ID               int    `json:"id"`
			Name             string `json:"name"`
			Phase            string `json:"phase"`
			StartTimeSeconds int64  `json:"startTimeSeconds"`
		} `json:"result"`
	}

	if err := json.Unmarshal(body, &apiResp); err != nil || apiResp.Status != "OK" {
		log.Printf("⚠️ [Codeforces Contests] Decode error: %v", err)
		return nil
	}

	var contests []model.ContestInfo
	for _, c := range apiResp.Result {
		if c.Phase != "BEFORE" {
			continue
		}
		startTime := time.Unix(c.StartTimeSeconds, 0).In(IST)
		timeLeft := time.Until(startTime)
		if timeLeft < 0 || timeLeft > 14*24*time.Hour {
			continue
		}
		contests = append(contests, model.ContestInfo{
			Name:          c.Name,
			Platform:      "codeforces",
			Type:          "contest",
			URL:           fmt.Sprintf("https://codeforces.com/contest/%d", c.ID),
			ScheduledAt:   startTime.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(timeLeft),
		})
	}

	log.Printf("✅ [Codeforces Contests] Fetched %d upcoming contests", len(contests))
	return contests
}

// ─── LeetCode ────────────────────────────────────────────────────────────────

func fetchLeetCodeContests() []model.ContestInfo {
	query := `{"query": "{ upcomingContests { title titleSlug startTime duration } }"}`

	req, err := http.NewRequest("POST", "https://leetcode.com/graphql", bytes.NewBufferString(query))
	if err != nil {
		log.Printf("⚠️ [LeetCode Contests] Request build error: %v", err)
		return nil
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("Referer", "https://leetcode.com")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("⚠️ [LeetCode Contests] HTTP error: %v", err)
		return nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var apiResp struct {
		Data struct {
			UpcomingContests []struct {
				Title     string `json:"title"`
				TitleSlug string `json:"titleSlug"`
				StartTime int64  `json:"startTime"`
			} `json:"upcomingContests"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Printf("⚠️ [LeetCode Contests] Decode error: %v", err)
		return nil
	}

	var contests []model.ContestInfo
	for _, c := range apiResp.Data.UpcomingContests {
		startTime := time.Unix(c.StartTime, 0).In(IST)
		timeLeft := time.Until(startTime)
		if timeLeft < 0 {
			continue
		}
		contests = append(contests, model.ContestInfo{
			Name:          c.Title,
			Platform:      "leetcode",
			Type:          "contest",
			URL:           fmt.Sprintf("https://leetcode.com/contest/%s", c.TitleSlug),
			ScheduledAt:   startTime.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(timeLeft),
		})
	}

	log.Printf("✅ [LeetCode Contests] Fetched %d upcoming contests", len(contests))
	return contests
}

// ─── CodeChef ────────────────────────────────────────────────────────────────

func fetchCodeChefContests() []model.ContestInfo {
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", "https://www.codechef.com/api/list/contests/all?sort_by=start&sorting_order=asc&offset=0&mode=all", nil)
	if err != nil {
		log.Printf("⚠️ [CodeChef Contests] Request build error: %v", err)
		return nil
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("⚠️ [CodeChef Contests] HTTP error: %v", err)
		return nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var apiResp struct {
		FutureContests []struct {
			ContestCode  string `json:"contest_code"`
			ContestName  string `json:"contest_name"`
			ContestStart string `json:"contest_start_date_iso"`
		} `json:"future_contests"`
		PresentContests []struct {
			ContestCode  string `json:"contest_code"`
			ContestName  string `json:"contest_name"`
			ContestStart string `json:"contest_start_date_iso"`
		} `json:"present_contests"`
	}

	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Printf("⚠️ [CodeChef Contests] Decode error: %v, body: %.200s", err, string(body))
		return nil
	}

	var contests []model.ContestInfo
	addContest := func(code, name, startStr string) {
		startTime, err := time.Parse(time.RFC3339, startStr)
		if err != nil {
			startTime, err = time.Parse("2006-01-02T15:04:05+05:30", startStr)
			if err != nil {
				return
			}
		}
		startTimeIST := startTime.In(IST)
		timeLeft := time.Until(startTimeIST)
		if timeLeft < -2*time.Hour || timeLeft > 14*24*time.Hour {
			return
		}
		contests = append(contests, model.ContestInfo{
			Name:          name,
			Platform:      "codechef",
			Type:          "contest",
			URL:           fmt.Sprintf("https://www.codechef.com/%s", code),
			ScheduledAt:   startTimeIST.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(timeLeft),
		})
	}

	for _, c := range apiResp.PresentContests {
		addContest(c.ContestCode, c.ContestName, c.ContestStart)
	}
	for _, c := range apiResp.FutureContests {
		addContest(c.ContestCode, c.ContestName, c.ContestStart)
	}

	log.Printf("✅ [CodeChef Contests] Fetched %d upcoming contests", len(contests))
	return contests
}

// ─── Devpost Hackathons ───────────────────────────────────────────────────────
// Devpost has a free public JSON API — no key required.

func fetchDevpostHackathons() []model.ContestInfo {
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", "https://devpost.com/api/hackathons.json?status[]=open&status[]=upcoming&order_by=deadline&per_page=15", nil)
	if err != nil {
		log.Printf("⚠️ [Devpost] Request build error: %v", err)
		return nil
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("⚠️ [Devpost] HTTP error: %v", err)
		return nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	// Use RawMessage for fields that Devpost returns inconsistently (string vs object)
	var apiResp struct {
		Hackathons []struct {
			Title                 string          `json:"title"`
			URL                   string          `json:"url"`
			SubmissionPeriodDates string          `json:"submission_period_dates"`
			DisplayablePrize      string          `json:"displayable_prize_amount"`
			OpenState             string          `json:"open_state"`
			TimeLeftRaw           json.RawMessage `json:"time_left_to_submission"` // can be string OR object — ignore safely
		} `json:"hackathons"`
	}

	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Printf("⚠️ [Devpost] Decode error: %v, body: %.200s", err, string(body))
		return nil
	}

	var contests []model.ContestInfo
	for _, h := range apiResp.Hackathons {
		// Determine time remaining label from open_state
		var timeLeft string
		switch h.OpenState {
		case "open":
			timeLeft = "Open now"
		case "upcoming":
			timeLeft = "Coming soon"
		default:
			timeLeft = "Check site"
		}

		name := h.Title
		if h.DisplayablePrize != "" {
			name = fmt.Sprintf("%s 🏆 %s", h.Title, h.DisplayablePrize)
		}

		contests = append(contests, model.ContestInfo{
			Name:          name,
			Platform:      "devpost",
			Type:          "hackathon",
			URL:           h.URL,
			ScheduledAt:   h.SubmissionPeriodDates,
			TimeRemaining: timeLeft,
		})
	}

	log.Printf("✅ [Devpost] Fetched %d hackathons", len(contests))
	return contests
}

// ─── Custom Database Hackathons (Unstop, Devfolio, Local) ────────────────────

func fetchCustomHackathons(platform string) []model.ContestInfo {
	if config.CustomHackathonCollection == nil {
		log.Println("⚠️ [Custom Hackathons] Collection not initialized")
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Only fetch hackathons that haven't ended yet
	filter := bson.M{
		"end_date": bson.M{"$gte": time.Now()},
	}
	if platform != "" && platform != "all" {
		filter["platform"] = platform
	}

	cursor, err := config.CustomHackathonCollection.Find(ctx, filter)
	if err != nil {
		log.Printf("⚠️ [Custom Hackathons] DB error: %v", err)
		return nil
	}
	defer cursor.Close(ctx)

	var dbEvents []model.CustomHackathon
	if err := cursor.All(ctx, &dbEvents); err != nil {
		log.Printf("⚠️ [Custom Hackathons] Decode error: %v", err)
		return nil
	}

	var contests []model.ContestInfo
	for _, e := range dbEvents {
		var timeLeftStr string
		
		// If ScheduledAt can be parsed, calculate time left.
		// Otherwise, default to "Check site" or "Ongoing" if end date hasn't passed
		startTime, err := time.Parse(time.RFC3339, e.ScheduledAt)
		if err == nil {
			startTimeIST := startTime.In(IST)
			timeLeft := time.Until(startTimeIST)
			if timeLeft < 0 {
				timeLeftStr = "Ongoing"
			} else {
				timeLeftStr = formatDuration(timeLeft)
			}
		} else {
			// Best guess if start time is not RFC3339
			timeLeftStr = "Check site"
			if e.EndDate.After(time.Now()) {
				timeLeftStr = "Ongoing"
			}
		}

		contests = append(contests, model.ContestInfo{
			Name:          e.Name,
			Platform:      e.Platform,
			Type:          "hackathon",
			URL:           e.URL,
			ScheduledAt:   e.ScheduledAt, // Might be a display string
			TimeRemaining: timeLeftStr,
		})
	}

	log.Printf("✅ [Custom Hackathons] Fetched %d events", len(contests))
	return contests
}

// ─── HackerEarth Events ───────────────────────────────────────────────────────
// Requires HACKEREARTH_API_KEY in .env

func fetchHackerEarthEvents() []model.ContestInfo {
	apiKey := os.Getenv("HACKEREARTH_API_KEY")
	if apiKey == "" {
		log.Printf("ℹ️ [HackerEarth] HACKEREARTH_API_KEY not set, skipping")
		return nil
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", "https://www.hackerearth.com/api/v2/events/?type=HACKATHON&status=ongoing,upcoming", nil)
	if err != nil {
		log.Printf("⚠️ [HackerEarth] Request build error: %v", err)
		return nil
	}
	req.Header.Set("client-secret", apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("⚠️ [HackerEarth] HTTP error: %v", err)
		return nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var apiResp struct {
		Response []struct {
			Title     string `json:"title"`
			URL       string `json:"url"`
			StartTime string `json:"start_time"`
			EndTime   string `json:"end_time"`
			Status    string `json:"status"`
		} `json:"response"`
	}

	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Printf("⚠️ [HackerEarth] Decode error: %v, body: %.200s", err, string(body))
		return nil
	}

	var contests []model.ContestInfo
	for _, e := range apiResp.Response {
		startTime, err := time.Parse("2006-01-02T15:04:05", e.StartTime)
		if err != nil {
			startTime, err = time.Parse(time.RFC3339, e.StartTime)
			if err != nil {
				continue
			}
		}
		startTimeIST := startTime.In(IST)
		timeLeft := time.Until(startTimeIST)

		var timeLeftStr string
		if timeLeft < 0 {
			timeLeftStr = "Ongoing"
		} else {
			timeLeftStr = formatDuration(timeLeft)
		}

		contests = append(contests, model.ContestInfo{
			Name:          e.Title,
			Platform:      "hackerearth",
			Type:          "hackathon",
			URL:           e.URL,
			ScheduledAt:   startTimeIST.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: timeLeftStr,
		})
	}

	log.Printf("✅ [HackerEarth] Fetched %d hackathons", len(contests))
	return contests
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func formatDuration(d time.Duration) string {
	if d <= 0 {
		return "starting now!"
	}

	totalHours := int(d.Hours())
	days := totalHours / 24
	hours := totalHours % 24
	minutes := int(d.Minutes()) % 60
	seconds := int(d.Seconds()) % 60

	switch {
	case days > 1:
		return fmt.Sprintf("%d days %dh left", days, hours)
	case days == 1:
		return fmt.Sprintf("1 day %dh left", hours)
	default:
		return fmt.Sprintf("%dh %dm %ds left", hours, minutes, seconds)
	}
}
