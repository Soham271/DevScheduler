package services

import (
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/gocolly/colly"
)

// ═══════════════════════════════════════════════════════════════
//  CodeChef Intelligence Service
//  Comprehensive data fetching for the dedicated CodeChef page.
// ═══════════════════════════════════════════════════════════════

type CodeChefFullProfile struct {
	Username       string              `json:"username"`
	Rating         int                 `json:"rating"`
	MaxRating      int                 `json:"max_rating"`
	Stars          string              `json:"stars"`
	GlobalRank     int                 `json:"global_rank"`
	CountryRank    int                 `json:"country_rank"`
	TotalSolved    int                 `json:"total_solved"`
	IsActiveToday  bool                `json:"is_active_today"`
	ContestCount   int                 `json:"contest_count"`
	ContestHistory []CodeChefContest   `json:"contest_history"`
	FetchedAt      time.Time           `json:"fetched_at"`
}

type CodeChefContest struct {
	ContestName  string `json:"contest_name"`
	ContestCode  string `json:"contest_code"`
	Rank         int    `json:"rank"`
	OldRating    int    `json:"old_rating"`
	NewRating    int    `json:"new_rating"`
	RatingChange int    `json:"rating_change"`
}

// FetchCodeChefFullProfile fetches comprehensive CodeChef data via scraping.
func FetchCodeChefFullProfile(username string) (*CodeChefFullProfile, error) {
	profile := &CodeChefFullProfile{
		Username:  username,
		FetchedAt: time.Now(),
	}

	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)

	var foundRating bool

	// Rating
	c.OnHTML(".rating-number", func(e *colly.HTMLElement) {
		if !foundRating {
			txt := strings.TrimSpace(e.Text)
			fmt.Sscanf(txt, "%d", &profile.Rating)
			foundRating = true
		}
	})

	// Stars (rating star badges)
	c.OnHTML(".rating-star span", func(e *colly.HTMLElement) {
		if profile.Stars == "" {
			profile.Stars = strings.TrimSpace(e.Text)
		}
	})

	// Max Rating, Global Rank, Country Rank from the rating detail section
	c.OnHTML(".rating-header .small", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		if strings.Contains(txt, "Highest Rating") {
			parts := strings.Split(txt, "(")
			if len(parts) > 1 {
				numStr := strings.TrimRight(parts[1], ")")
				numStr = strings.TrimSpace(numStr)
				fmt.Sscanf(numStr, "%d", &profile.MaxRating)
			}
		}
	})

	// Total Problems Solved
	c.OnHTML("h3", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		if strings.Contains(txt, "Total Problems Solved:") {
			fmt.Sscanf(txt, "Total Problems Solved: %d", &profile.TotalSolved)
		}
	})

	// Global Rank
	c.OnHTML(".inline-list li", func(e *colly.HTMLElement) {
		txt := strings.TrimSpace(e.Text)
		if strings.Contains(txt, "Global Rank") {
			parts := strings.Fields(txt)
			for _, p := range parts {
				if n, err := strconv.Atoi(p); err == nil {
					profile.GlobalRank = n
					break
				}
			}
		}
		if strings.Contains(txt, "Country Rank") {
			parts := strings.Fields(txt)
			for _, p := range parts {
				if n, err := strconv.Atoi(p); err == nil {
					profile.CountryRank = n
					break
				}
			}
		}
	})

	// Contest participation rows
	c.OnHTML(".contest-rating-table tbody tr", func(e *colly.HTMLElement) {
		var cols []string
		e.ForEach("td", func(_ int, td *colly.HTMLElement) {
			cols = append(cols, strings.TrimSpace(td.Text))
		})
		if len(cols) >= 4 {
			contestName := cols[0]
			contestCode := ""
			e.ForEach("td:first-child a", func(_ int, a *colly.HTMLElement) {
				href := a.Attr("href")
				parts := strings.Split(href, "/")
				if len(parts) > 0 {
					contestCode = parts[len(parts)-1]
				}
			})

			rank, _ := strconv.Atoi(cols[1])
			oldR, _ := strconv.Atoi(cols[2])
			newR, _ := strconv.Atoi(cols[3])

			profile.ContestHistory = append(profile.ContestHistory, CodeChefContest{
				ContestName:  contestName,
				ContestCode:  contestCode,
				Rank:         rank,
				OldRating:    oldR,
				NewRating:    newR,
				RatingChange: newR - oldR,
			})
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

	log.Printf("📊 [CodeChef] %s: rating=%d, solved=%d, contests=%d",
		username, profile.Rating, profile.TotalSolved, profile.ContestCount)

	return profile, nil
}
