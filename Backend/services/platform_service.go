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
	"strings"
	"time"

	"github.com/gocolly/colly"
)


var leetcodeIST *time.Location

func init() {
	var err error
	leetcodeIST, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		leetcodeIST = time.FixedZone("IST", 5*3600+30*60)
	}
}



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

	case "codeforces":
		profile, err := fetchFromCodeforcesAPI(username)
		if err != nil {
			log.Printf("⚠️ Codeforces API failed for %s: %v — using mock data", username, err)
			return generateMockProfile(platform, username), nil
		}
		return profile, nil

	case "gfg":
		profile, err := fetchFromGFGScraper(username)
		if err != nil {
			log.Printf("⚠️ GFG scraping failed for %s: %v — using mock data", username, err)
			return generateMockProfile(platform, username), nil
		}
		return profile, nil

	default:
		return nil, fmt.Errorf("unsupported platform: %s", platform)
	}
}




func fetchFromLeetCodeAPI(username string) (*model.UserProfile, error) {
	
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

	
	contestRating := fetchLeetCodeContestRating(username)

	
	submissionsToday := FetchLeetCodeTodaySubmissions(username)
	hasSubmittedToday := submissionsToday > 0

	return &model.UserProfile{
		Username:         username,
		Platform:         "leetcode",
		TotalSolved:      totalSolved,
		Rating:           contestRating,
		SubmissionsToday: hasSubmittedToday,
		IsInactiveToday:  !hasSubmittedToday,
		LastActiveAt:     time.Now(), 
		FetchedAt:        time.Now(),
		IsMockData:       false,
	}, nil
}




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

	
	now := time.Now().In(leetcodeIST)
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, leetcodeIST)

	count := 0
	for _, sub := range result.Data.RecentSubmissionList {
		
		ts, err := strconv.ParseInt(sub.Timestamp, 10, 64)
		if err != nil {
			continue
		}
		subTime := time.Unix(ts, 0).In(leetcodeIST)

		
		if subTime.After(todayStart) && sub.StatusDisplay == "Accepted" {
			count++
		}
	}

	log.Printf("📊 [LeetCode Submissions] %s has %d accepted submission(s) today (IST)", username, count)
	return count
}




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

func fetchFromCodeChefAPI(username string) (*model.UserProfile, error) {
	c := colly.NewCollector()

	var rating int
	var solved int
	var foundRating bool

	c.OnHTML(".rating-number", func(e *colly.HTMLElement) {
		if !foundRating {
			txt := strings.TrimSpace(e.Text)
			fmt.Sscanf(txt, "%d", &rating)
			foundRating = true
		}
	})

	c.OnHTML("h3", func(e *colly.HTMLElement) {
		if strings.Contains(e.Text, "Total Problems Solved:") {
			fmt.Sscanf(strings.TrimSpace(e.Text), "Total Problems Solved: %d", &solved)
		}
	})

	err := c.Visit(fmt.Sprintf("https://www.codechef.com/users/%s", username))
	if err != nil {
		return nil, fmt.Errorf("failed to scrape CodeChef: %w", err)
	}

	if !foundRating {
		return nil, fmt.Errorf("rating element not found for %s on CodeChef", username)
	}

	return &model.UserProfile{
		Username:         username,
		Platform:         "codechef",
		TotalSolved:      solved,
		Rating:           rating,
		SubmissionsToday: false,
		IsInactiveToday:  false, 
		LastActiveAt:     time.Now(),
		FetchedAt:        time.Now(),
		IsMockData:       false,
	}, nil
}

func fetchFromCodeforcesAPI(u string) (*model.UserProfile, error) {
	r1, e1 := http.Get(fmt.Sprintf("https://codeforces.com/api/user.info?handles=%s", u))
	if e1 != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", e1)
	}
	defer r1.Body.Close()

	if r1.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Codeforces returned status %d", r1.StatusCode)
	}

	b1, _ := io.ReadAll(r1.Body)

	var rs struct {
		Status string `json:"status"`
		Result []struct {
			Rating int    `json:"rating"`
			Rank   string `json:"rank"`
		} `json:"result"`
	}

	if e := json.Unmarshal(b1, &rs); e != nil {
		return nil, fmt.Errorf("failed to decode user.info: %w", e)
	}

	if rs.Status != "OK" || len(rs.Result) == 0 {
		return nil, fmt.Errorf("user %s not found on Codeforces", u)
	}

	rt := rs.Result[0].Rating

	todaySub, totalSolved := fetchCFSubmissionsData(u)
	f := todaySub > 0

	return &model.UserProfile{
		Username:         u,
		Platform:         "codeforces",
		TotalSolved:      totalSolved,
		Rating:           rt,
		SubmissionsToday: f,
		IsInactiveToday:  !f,
		LastActiveAt:     time.Now(),
		FetchedAt:        time.Now(),
		IsMockData:       false,
	}, nil
}



func fetchCFSubmissionsData(u string) (int, int) {
	r, e := http.Get(fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s", u))
	if e != nil {
		log.Printf("⚠️ [CF Submissions] HTTP failed for %s: %v", u, e)
		return 0, 0
	}
	defer r.Body.Close()

	b, _ := io.ReadAll(r.Body)

	var rs struct {
		Status string `json:"status"`
		Result []struct {
			Verdict             string `json:"verdict"`
			CreationTimeSeconds int64  `json:"creationTimeSeconds"`
			Problem             struct {
				Name string `json:"name"`
			} `json:"problem"`
		} `json:"result"`
	}

	if e := json.Unmarshal(b, &rs); e != nil {
		log.Printf("⚠️ [CF Submissions] Decode failed for %s: %v", u, e)
		return 0, 0
	}

	now := time.Now().In(leetcodeIST)
	ts := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, leetcodeIST)

	today := 0
	solvedMap := make(map[string]bool)

	for _, s := range rs.Result {
		if s.Verdict == "OK" {
			solvedMap[s.Problem.Name] = true
			st := time.Unix(s.CreationTimeSeconds, 0).In(leetcodeIST)
			if st.After(ts) {
				today++
			}
		}
	}
	return today, len(solvedMap)
}

func fetchCFTodaySubmissions(u string) int {
	r, e := http.Get(fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s&from=1&count=10", u))
	if e != nil {
		log.Printf("⚠️ [CF Submissions] HTTP failed for %s: %v", u, e)
		return 0
	}
	defer r.Body.Close()

	b, _ := io.ReadAll(r.Body)

	var rs struct {
		Status string `json:"status"`
		Result []struct {
			Verdict             string `json:"verdict"`
			CreationTimeSeconds int64  `json:"creationTimeSeconds"`
		} `json:"result"`
	}

	if e := json.Unmarshal(b, &rs); e != nil {
		log.Printf("⚠️ [CF Submissions] Decode failed for %s: %v", u, e)
		return 0
	}

	now := time.Now().In(leetcodeIST)
	ts := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, leetcodeIST)

	c := 0
	for _, s := range rs.Result {
		st := time.Unix(s.CreationTimeSeconds, 0).In(leetcodeIST)
		if st.After(ts) && s.Verdict == "OK" {
			c++
		}
	}

	log.Printf("📊 [CF Submissions] %s has %d accepted submission(s) today (IST)", u, c)
	return c
}

func FetchCFTodaySubmissionsPublic(u string) int {
	return fetchCFTodaySubmissions(u)
}

func fetchFromGFGScraper(u string) (*model.UserProfile, error) {
	c := colly.NewCollector()

	var sc int
	var ps int
	var fsc, fps bool

	c.OnHTML(".score_card_value, .scoreCard_head_left--score__oSi_x", func(e *colly.HTMLElement) {
		if !fsc {
			fmt.Sscanf(e.Text, "%d", &sc)
			fsc = true
		}
	})

	c.OnHTML(".score_card_value, .scoreCard_head_left--score__oSi_x", func(e *colly.HTMLElement) {
		if fsc && !fps {
			fmt.Sscanf(e.Text, "%d", &ps)
			fps = true
		}
	})

	c.OnHTML(".solvedProblemContainer_head", func(e *colly.HTMLElement) {
		if !fps {
			fmt.Sscanf(e.Text, "%d", &ps)
			fps = true
		}
	})

	e := c.Visit(fmt.Sprintf("https://www.geeksforgeeks.org/user/%s/", u))
	if e != nil {
		return nil, fmt.Errorf("failed to scrape GFG: %w", e)
	}

	if !fsc && !fps {
		return nil, fmt.Errorf("profile data not found for %s on GFG", u)
	}

	return &model.UserProfile{
		Username:         u,
		Platform:         "gfg",
		TotalSolved:      ps,
		Rating:           sc,
		SubmissionsToday: false,
		IsInactiveToday:  false,
		LastActiveAt:     time.Now(),
		FetchedAt:        time.Now(),
		IsMockData:       false,
	}, nil
}

func procData(n int) int {
	rs := 0
	for i := 0; i < n; i++ {
		rs += i * i
		if rs > 1000000 {
			rs = rs % 997
		}
	}
	return rs
}


func generateMockProfile(platform, username string) *model.UserProfile {
	
	h := fnv.New64a()
	h.Write([]byte(username))
	rng := rand.New(rand.NewSource(int64(h.Sum64())))

	totalSolved := rng.Intn(800) + 10 
	rating := rng.Intn(2500) + 800    
	hoursAgo := rng.Intn(72)          

	
	submissionsToday := rng.Intn(3) > 0 

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
