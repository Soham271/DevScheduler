package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gocolly/colly"
)






type GFGFullProfile struct {
	Username         string               `json:"username"`
	CodingScore      int                  `json:"coding_score"`
	TotalSolved      int                  `json:"total_solved"`
	MonthlyCoding    int                  `json:"monthly_coding"`
	Institute        string               `json:"institute"`
	InstituteRank    int                  `json:"institute_rank"`
	LanguagesUsed    []string             `json:"languages_used"`
	CurrentStreak    int                  `json:"current_streak"`
	MaxStreak        int                  `json:"max_streak"`
	EasySolved       int                  `json:"easy_solved"`
	MediumSolved     int                  `json:"medium_solved"`
	HardSolved       int                  `json:"hard_solved"`
	IsActiveToday    bool                 `json:"is_active_today"`
	FetchedAt        time.Time            `json:"fetched_at"`
}


func FetchGFGFullProfile(username string) (*GFGFullProfile, error) {
	profile := &GFGFullProfile{
		Username:  username,
		FetchedAt: time.Now(),
	}

	
	if err := fetchGFGAPIData(username, profile); err != nil {
		log.Printf("⚠️ [GFG API] Failed for %s: %v, falling back to scraper", username, err)
		
		if err2 := fetchGFGScraperData(username, profile); err2 != nil {
			return nil, fmt.Errorf("both GFG API and scraper failed: %v / %v", err, err2)
		}
	}

	log.Printf("📊 [GFG] %s: score=%d, solved=%d, streak=%d/%d",
		username, profile.CodingScore, profile.TotalSolved, profile.CurrentStreak, profile.MaxStreak)

	return profile, nil
}


func fetchGFGAPIData(username string, profile *GFGFullProfile) error {
	url := fmt.Sprintf("https://geeks-for-geeks-stats-api.vercel.app/?userName=%s", username)
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GFG API returned status %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		TotalProblemsSolved int    `json:"totalProblemsSolved"`
		EasyProblemsSolved  int    `json:"School"`
		MediumProblemsSolved int   `json:"Medium"`
		HardProblemsSolved  int    `json:"Hard"`
		BasicProblemsSolved int    `json:"Basic"`
		UserName            string `json:"userName"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("failed to decode GFG API: %w", err)
	}

	profile.TotalSolved = result.TotalProblemsSolved
	profile.EasySolved = result.EasyProblemsSolved + result.BasicProblemsSolved
	profile.MediumSolved = result.MediumProblemsSolved
	profile.HardSolved = result.HardProblemsSolved

	
	fetchGFGScraperData(username, profile)

	return nil
}


func fetchGFGScraperData(username string, profile *GFGFullProfile) error {
	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)

	scoreIndex := 0

	
	c.OnHTML(".score_card_value, .scoreCard_head_left--score__oSi_x", func(e *colly.HTMLElement) {
		val := strings.TrimSpace(e.Text)
		var n int
		fmt.Sscanf(val, "%d", &n)

		switch scoreIndex {
		case 0:
			if profile.CodingScore == 0 {
				profile.CodingScore = n
			}
		case 1:
			if profile.TotalSolved == 0 {
				profile.TotalSolved = n
			}
		case 2:
			profile.MonthlyCoding = n
		}
		scoreIndex++
	})

	
	c.OnHTML(".solvedProblemContainer_head", func(e *colly.HTMLElement) {
		if profile.TotalSolved == 0 {
			fmt.Sscanf(strings.TrimSpace(e.Text), "%d", &profile.TotalSolved)
		}
	})

	
	c.OnHTML(".streakCnt", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		var n int
		fmt.Sscanf(txt, "%d", &n)
		if profile.CurrentStreak == 0 {
			profile.CurrentStreak = n
		} else if profile.MaxStreak == 0 {
			profile.MaxStreak = n
		}
	})

	
	c.OnHTML(".educationDetails_head_left--text__tgi9B", func(e *colly.HTMLElement) {
		if profile.Institute == "" {
			profile.Institute = strings.TrimSpace(e.Text)
		}
	})

	// Languages
	c.OnHTML(".educationDetails_head_left--text__tgi9B", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		if strings.Contains(txt, ",") {
			profile.LanguagesUsed = strings.Split(txt, ",")
			for i, l := range profile.LanguagesUsed {
				profile.LanguagesUsed[i] = strings.TrimSpace(l)
			}
		}
	})

	err := c.Visit(fmt.Sprintf("https://www.geeksforgeeks.org/user/%s/", username))
	if err != nil {
		return fmt.Errorf("failed to scrape GFG: %w", err)
	}

	return nil
}
