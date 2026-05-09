package model

import "time"

// UserProfile is the enriched profile returned by the platform service.
// It contains all the data needed by the analysis engine.
type UserProfile struct {
	Username         string    `json:"username"`
	Platform         string    `json:"platform"` // "leetcode", "codechef", "codeforces", or "gfg"
	TotalSolved      int       `json:"total_solved"`
	Rating           int       `json:"rating"`
	SubmissionsToday bool      `json:"submissions_today"` // true if user submitted today
	IsInactiveToday  bool      `json:"is_inactive_today"` // true if 0 submissions today (from API)
	LastActiveAt     time.Time `json:"last_active_at"`
	FetchedAt        time.Time `json:"fetched_at"`   // when this data was obtained
	IsMockData       bool      `json:"is_mock_data"` // true if data is simulated
}

// AnalysisResult holds the complete output of the analysis engine.
type AnalysisResult struct {
	Username         string           `json:"username"`
	Platform         string           `json:"platform"`
	PerformanceLevel string           `json:"performance_level"` // beginner, intermediate, advanced
	RatingLevel      string           `json:"rating_level"`      // low, medium, high
	IsInactiveToday  bool             `json:"is_inactive_today"`
	Messages         []DynamicMessage `json:"messages"`
	Contests         []ContestInfo    `json:"contests"`
	Profile          UserProfile      `json:"profile"`
}

// DynamicMessage is a single generated message with a category.
type DynamicMessage struct {
	Category string `json:"category"` // motivation, warning, suggestion
	Text     string `json:"text"`
}

// ContestInfo holds upcoming contest details with a human-readable countdown.
type ContestInfo struct {
	Name          string `json:"name"`
	Platform      string `json:"platform"`
	ScheduledAt   string `json:"scheduled_at"`   // human-readable date string
	TimeRemaining string `json:"time_remaining"` // e.g. "5 days left" or "5h 20m 10s left"
}

// User represents the registered user in the system stored in MongoDB.
type User struct {
	Email              string    `json:"email" bson:"email"`
	Name               string    `json:"name" bson:"name"`
	Password           string    `json:"-" bson:"password,omitempty"`
	LeetcodeUsername   string    `json:"leetcode_username" bson:"leetcode_username"`
	CodechefUsername   string    `json:"codechef_username" bson:"codechef_username"`
	CodeforcesUsername string    `json:"codeforces_username" bson:"codeforces_username"`
	GfgUsername        string    `json:"gfg_username" bson:"gfg_username"`
	GithubUsername     string    `json:"github_username" bson:"github_username"`
	CreatedAt          time.Time `json:"created_at" bson:"created_at"`
}
