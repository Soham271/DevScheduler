package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gocolly/colly"
)






type GitHubFullProfile struct {
	Username         string              `json:"username"`
	Name             string              `json:"name"`
	Bio              string              `json:"bio"`
	AvatarURL        string              `json:"avatar_url"`
	ProfileURL       string              `json:"profile_url"`
	Location         string              `json:"location"`
	Company          string              `json:"company"`
	Blog             string              `json:"blog"`
	PublicRepos      int                 `json:"public_repos"`
	PublicGists      int                 `json:"public_gists"`
	Followers        int                 `json:"followers"`
	Following        int                 `json:"following"`
	CreatedAt        string              `json:"created_at"`
	TotalContributions int              `json:"total_contributions"`
	ContributionGraph  []ContributionDay `json:"contribution_graph"`
	OpenPRs          int                 `json:"open_prs"`
	MergedPRs        int                 `json:"merged_prs"`
	ClosedPRs        int                 `json:"closed_prs"`
	TotalPRs         int                 `json:"total_prs"`
	TopLanguages     []LanguageStat      `json:"top_languages"`
	RecentRepos      []RepoInfo          `json:"recent_repos"`
	FetchedAt        time.Time           `json:"fetched_at"`
}

type ContributionDay struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
	Level int    `json:"level"` 
}

type LanguageStat struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type RepoInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Language    string `json:"language"`
	Stars       int    `json:"stars"`
	Forks       int    `json:"forks"`
	UpdatedAt   string `json:"updated_at"`
	HTMLURL     string `json:"html_url"`
	IsForked    bool   `json:"is_forked"`
}


func FetchGitHubFullProfile(username string) (*GitHubFullProfile, error) {
	profile := &GitHubFullProfile{
		Username:  username,
		FetchedAt: time.Now(),
	}

	
	if err := fetchGitHubUserAPI(username, profile); err != nil {
		return nil, fmt.Errorf("failed to fetch GitHub user: %w", err)
	}

	
	fetchGitHubRepos(username, profile)

	
	fetchGitHubPRStats(username, profile)

	
	fetchGitHubContributions(username, profile)

	log.Printf("📊 [GitHub] %s: repos=%d, followers=%d, contributions=%d, PRs=%d",
		username, profile.PublicRepos, profile.Followers, profile.TotalContributions, profile.TotalPRs)

	return profile, nil
}


func fetchGitHubUserAPI(username string, profile *GitHubFullProfile) error {
	url := fmt.Sprintf("https://api.github.com/users/%s", username)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "DevFlow-AI-OS")
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GitHub API returned status %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Login       string `json:"login"`
		Name        string `json:"name"`
		Bio         string `json:"bio"`
		AvatarURL   string `json:"avatar_url"`
		HTMLURL     string `json:"html_url"`
		Location    string `json:"location"`
		Company     string `json:"company"`
		Blog        string `json:"blog"`
		PublicRepos int    `json:"public_repos"`
		PublicGists int    `json:"public_gists"`
		Followers   int    `json:"followers"`
		Following   int    `json:"following"`
		CreatedAt   string `json:"created_at"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("failed to decode GitHub user: %w", err)
	}

	profile.Name = result.Name
	profile.Bio = result.Bio
	profile.AvatarURL = result.AvatarURL
	profile.ProfileURL = result.HTMLURL
	profile.Location = result.Location
	profile.Company = result.Company
	profile.Blog = result.Blog
	profile.PublicRepos = result.PublicRepos
	profile.PublicGists = result.PublicGists
	profile.Followers = result.Followers
	profile.Following = result.Following
	profile.CreatedAt = result.CreatedAt

	return nil
}


func fetchGitHubRepos(username string, profile *GitHubFullProfile) {
	url := fmt.Sprintf("https://api.github.com/users/%s/repos?sort=updated&per_page=100", username)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "DevFlow-AI-OS")
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("⚠️ [GitHub Repos] Failed: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return
	}

	body, _ := io.ReadAll(resp.Body)

	var repos []struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Language    string `json:"language"`
		Stars       int    `json:"stargazers_count"`
		Forks       int    `json:"forks_count"`
		UpdatedAt   string `json:"updated_at"`
		HTMLURL     string `json:"html_url"`
		Fork        bool   `json:"fork"`
	}

	if err := json.Unmarshal(body, &repos); err != nil {
		return
	}

	
	langMap := make(map[string]int)

	for i, r := range repos {
		if i < 15 {
			profile.RecentRepos = append(profile.RecentRepos, RepoInfo{
				Name:        r.Name,
				Description: r.Description,
				Language:    r.Language,
				Stars:       r.Stars,
				Forks:       r.Forks,
				UpdatedAt:   r.UpdatedAt,
				HTMLURL:     r.HTMLURL,
				IsForked:    r.Fork,
			})
		}
		if r.Language != "" {
			langMap[r.Language]++
		}
	}

	// Convert language map to sorted slice
	for name, count := range langMap {
		profile.TopLanguages = append(profile.TopLanguages, LanguageStat{
			Name:  name,
			Count: count,
		})
	}
}

// fetchGitHubPRStats fetches PR counts using the GitHub search API.
func fetchGitHubPRStats(username string, profile *GitHubFullProfile) {
	client := &http.Client{Timeout: 10 * time.Second}

	fetchCount := func(query string) int {
		url := fmt.Sprintf("https://api.github.com/search/issues?q=%s", query)
		req, _ := http.NewRequest("GET", url, nil)
		req.Header.Set("User-Agent", "DevFlow-AI-OS")
		req.Header.Set("Accept", "application/vnd.github.v3+json")

		resp, err := client.Do(req)
		if err != nil {
			return 0
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return 0
		}

		body, _ := io.ReadAll(resp.Body)
		var result struct {
			TotalCount int `json:"total_count"`
		}
		json.Unmarshal(body, &result)
		return result.TotalCount
	}

	
	profile.OpenPRs = fetchCount(fmt.Sprintf("author:%s+type:pr+state:open", username))
	
	totalClosed := fetchCount(fmt.Sprintf("author:%s+type:pr+state:closed", username))
	
	profile.MergedPRs = fetchCount(fmt.Sprintf("author:%s+type:pr+is:merged", username))
	
	profile.ClosedPRs = totalClosed - profile.MergedPRs
	if profile.ClosedPRs < 0 {
		profile.ClosedPRs = 0
	}
	profile.TotalPRs = profile.OpenPRs + totalClosed
}


func fetchGitHubContributions(username string, profile *GitHubFullProfile) {
	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)

	
	c.OnHTML("h2.f4.text-normal.mb-2", func(e *colly.HTMLElement) {
		text := strings.TrimSpace(e.Text)
		re := regexp.MustCompile(`([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year`)
		matches := re.FindStringSubmatch(text)
		if len(matches) > 1 {
			numStr := strings.ReplaceAll(matches[1], ",", "")
			n, err := strconv.Atoi(numStr)
			if err == nil {
				profile.TotalContributions = n
			}
		}
	})

	// Parse contribution calendar cells
	c.OnHTML("td.ContributionCalendar-day", func(e *colly.HTMLElement) {
		date := e.Attr("data-date")
		levelStr := e.Attr("data-level")
		if date == "" {
			return
		}

		level := 0
		if levelStr != "" {
			l, err := strconv.Atoi(levelStr)
			if err == nil {
				level = l
			}
		}

		// Try to extract count from aria-label or tooltip
		count := 0
		label := e.Attr("aria-label")
		if label != "" {
			// Example: "3 contributions on January 15, 2026"
			re := regexp.MustCompile(`(\d+)\s+contribution`)
			matches := re.FindStringSubmatch(label)
			if len(matches) > 1 {
				n, err := strconv.Atoi(matches[1])
				if err == nil {
					count = n
				}
			}
		}

		
		if count == 0 && level > 0 {
			levelCounts := []int{0, 1, 3, 6, 10}
			if level < len(levelCounts) {
				count = levelCounts[level]
			}
		}

		profile.ContributionGraph = append(profile.ContributionGraph, ContributionDay{
			Date:  date,
			Count: count,
			Level: level,
		})
	})

	err := c.Visit(fmt.Sprintf("https://github.com/%s", username))
	if err != nil {
		log.Printf("⚠️ [GitHub Contributions] Scrape failed: %v", err)
	}

	
	if profile.TotalContributions == 0 {
		fetchGitHubContributionsAPI(username, profile)
	}
}


func fetchGitHubContributionsAPI(username string, profile *GitHubFullProfile) {
	url := fmt.Sprintf("https://github-contributions-api.jogruber.de/v4/%s?y=last", username)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "DevFlow-AI-OS")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return
	}

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Total map[string]int `json:"total"`
		Contributions []struct {
			Date  string `json:"date"`
			Count int    `json:"count"`
			Level int    `json:"level"`
		} `json:"contributions"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return
	}

	
	if total, ok := result.Total["lastYear"]; ok && profile.TotalContributions == 0 {
		profile.TotalContributions = total
	}

	
	if len(profile.ContributionGraph) == 0 && len(result.Contributions) > 0 {
		for _, c := range result.Contributions {
			profile.ContributionGraph = append(profile.ContributionGraph, ContributionDay{
				Date:  c.Date,
				Count: c.Count,
				Level: c.Level,
			})
		}
	}
}
