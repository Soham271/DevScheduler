package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

// GithubEvent represents a minimal structure for GitHub's public event API.
type GithubEvent struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Repo      GithubRepo      `json:"repo"`
	Payload   json.RawMessage `json:"payload"`
	CreatedAt string          `json:"created_at"`
}

type GithubRepo struct {
	Name string `json:"name"`
}

type PushPayload struct {
	Commits []struct {
		Message string `json:"message"`
	} `json:"commits"`
}

type PullRequestPayload struct {
	Action      string `json:"action"`
	PullRequest struct {
		Title string `json:"title"`
	} `json:"pull_request"`
}

// FetchRecentGithubActivity checks a user's recent public GitHub events.
// It returns a list of new events that haven't been seen before.
func FetchRecentGithubActivity(rdb *redis.Client, username string) ([]GithubEvent, error) {
	url := fmt.Sprintf("https://api.github.com/users/%s/events/public", username)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	// Add user-agent as required by GitHub API
	req.Header.Set("User-Agent", "DevFlow-AI-OS")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var events []GithubEvent
	if err := json.Unmarshal(body, &events); err != nil {
		return nil, err
	}

	// Filter and find new events
	var newEvents []GithubEvent
	lastSeenKey := fmt.Sprintf("github:last_seen:%s", username)
	lastSeenID, _ := rdb.Get(context.Background(), lastSeenKey).Result()

	// GitHub returns events newest first. We iterate until we hit the last seen event.
	for _, event := range events {
		if event.ID == lastSeenID {
			break
		}

		// Only care about Push and PullRequest events happening today
		if event.Type == "PushEvent" || event.Type == "PullRequestEvent" {
			eventTime, err := time.Parse(time.RFC3339, event.CreatedAt)
			if err == nil && time.Since(eventTime) < 24*time.Hour {
				newEvents = append(newEvents, event)
			}
		}
	}

	// Update the last seen ID to the newest event (if any exist)
	if len(events) > 0 {
		rdb.Set(context.Background(), lastSeenKey, events[0].ID, 7*24*time.Hour)
	}

	return newEvents, nil
}
