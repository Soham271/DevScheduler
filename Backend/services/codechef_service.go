package services

import (
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gocolly/colly"
)






type CodeChefFullProfile struct {
	Username       string            `json:"username"`
	Rating         int               `json:"rating"`
	MaxRating      int               `json:"max_rating"`
	Stars          string            `json:"stars"`
	GlobalRank     int               `json:"global_rank"`
	CountryRank    int               `json:"country_rank"`
	TotalSolved    int               `json:"total_solved"`
	IsActiveToday  bool              `json:"is_active_today"`
	ContestCount   int               `json:"contest_count"`
	ContestHistory []CodeChefContest `json:"contest_history"`
	FetchedAt      time.Time         `json:"fetched_at"`
}

type CodeChefContest struct {
	ContestName  string `json:"contest_name"`
	ContestCode  string `json:"contest_code"`
	Rank         int    `json:"rank"`
	OldRating    int    `json:"old_rating"`
	NewRating    int    `json:"new_rating"`
	RatingChange int    `json:"rating_change"`
}


func FetchCodeChefFullProfile(username string) (*CodeChefFullProfile, error) {
	profile := &CodeChefFullProfile{
		Username:  username,
		FetchedAt: time.Now(),
	}

	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)

	var foundRating bool

	
	c.OnHTML(".rating-number", func(e *colly.HTMLElement) {
		if !foundRating {
			txt := strings.TrimSpace(e.Text)
			fmt.Sscanf(txt, "%d", &profile.Rating)
			foundRating = true
		}
	})

	
	c.OnHTML(".rating-star span", func(e *colly.HTMLElement) {
		if profile.Stars == "" {
			profile.Stars = strings.TrimSpace(e.Text)
		}
	})

	// Max Rating, Global Rank, Country Rank from the rating detail section
	c.OnHTML(".rating-header .small", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		if strings.Contains(txt, "Highest Rating") {
			
			re := regexp.MustCompile(`Highest Rating\s*\(?(\d+)\)?`)
			matches := re.FindStringSubmatch(txt)
			if len(matches) > 1 {
				if n, err := strconv.Atoi(matches[1]); err == nil {
					profile.MaxRating = n
				}
			}
		}
	})

	
	c.OnHTML("h3", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		if strings.Contains(txt, "Total Problems Solved:") {
			fmt.Sscanf(txt, "Total Problems Solved: %d", &profile.TotalSolved)
		}
	})

	
	c.OnHTML(".inline-list li", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		if strings.Contains(txt, "Global Rank") {
			re := regexp.MustCompile(`Global Rank.*?(\d+)`)
			if m := re.FindStringSubmatch(txt); len(m) > 1 {
				profile.GlobalRank, _ = strconv.Atoi(m[1])
			}
		}
		if strings.Contains(txt, "Country Rank") {
			re := regexp.MustCompile(`Country Rank.*?(\d+)`)
			if m := re.FindStringSubmatch(txt); len(m) > 1 {
				profile.CountryRank, _ = strconv.Atoi(m[1])
			}
		}
	})

	
	c.OnHTML("script", func(e *colly.HTMLElement) {
		txt := e.Text
		if strings.Contains(txt, "var all_rating = ") {
			re := regexp.MustCompile(`var all_rating = (\[.*?\]);`)
			matches := re.FindStringSubmatch(txt)
			if len(matches) > 1 {
				jsonStr := matches[1]
				var rawContests []struct {
					Code   string `json:"code"`
					Rating string `json:"rating"`
					Rank   string `json:"rank"`
					Name   string `json:"name"`
				}
				if err := json.Unmarshal([]byte(jsonStr), &rawContests); err == nil {
					prevRating := 1500
					for _, rc := range rawContests {
						r, _ := strconv.Atoi(rc.Rating)
						rank, _ := strconv.Atoi(rc.Rank)
						profile.ContestHistory = append(profile.ContestHistory, CodeChefContest{
							ContestName:  rc.Name,
							ContestCode:  rc.Code,
							Rank:         rank,
							OldRating:    prevRating,
							NewRating:    r,
							RatingChange: r - prevRating,
						})
						prevRating = r
					}
				}
			}
		}
	})

	err := c.Visit(fmt.Sprintf("https://www.codechef.com/users/%s", username))
	if err != nil {
		return nil, fmt.Errorf("failed to scrape CodeChef: %w", err)
	}

	if !foundRating {
		return nil, fmt.Errorf("profile data not found for %s on CodeChef", username)
	}

	profile.ContestCount = len(profile.ContestHistory)
	if profile.ContestCount > 0 && profile.MaxRating == 0 {
		maxR := 0
		for _, c := range profile.ContestHistory {
			if c.NewRating > maxR {
				maxR = c.NewRating
			}
		}
		profile.MaxRating = maxR
	}

	
	if profile.Rating < 1400 {
		profile.Stars = "1★"
	} else if profile.Rating < 1600 {
		profile.Stars = "2★"
	} else if profile.Rating < 1800 {
		profile.Stars = "3★"
	} else if profile.Rating < 2000 {
		profile.Stars = "4★"
	} else if profile.Rating < 2200 {
		profile.Stars = "5★"
	} else if profile.Rating < 2500 {
		profile.Stars = "6★"
	} else {
		profile.Stars = "7★"
	}

	log.Printf("📊 [CodeChef] %s: rating=%d, stars=%s, max_rating=%d, solved=%d, contests=%d",
		username, profile.Rating, profile.Stars, profile.MaxRating, profile.TotalSolved, profile.ContestCount)

	return profile, nil
}
