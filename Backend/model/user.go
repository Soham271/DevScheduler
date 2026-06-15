package model

import "time"

type UserProfile struct {
	Username         string    `json:"username"`
	Platform         string    `json:"platform"`
	TotalSolved      int       `json:"total_solved"`
	Rating           int       `json:"rating"`
	SubmissionsToday bool      `json:"submissions_today"`
	IsInactiveToday  bool      `json:"is_inactive_today"`
	LastActiveAt     time.Time `json:"last_active_at"`
	FetchedAt        time.Time `json:"fetched_at"`
	IsMockData       bool      `json:"is_mock_data"`
}

type AnalysisResult struct {
	Username         string           `json:"username"`
	Platform         string           `json:"platform"`
	PerformanceLevel string           `json:"performance_level"`
	RatingLevel      string           `json:"rating_level"`
	IsInactiveToday  bool             `json:"is_inactive_today"`
	Messages         []DynamicMessage `json:"messages"`
	Contests         []ContestInfo    `json:"contests"`
	Profile          UserProfile      `json:"profile"`
}

type DynamicMessage struct {
	Category string `json:"category"`
	Text     string `json:"text"`
}

type ContestInfo struct {
	Name          string `json:"name"`
	Platform      string `json:"platform"`
	Type          string `json:"type"` // "contest" or "hackathon"
	URL           string `json:"url"`  // Direct link to the event
	ScheduledAt   string `json:"scheduled_at"`
	TimeRemaining string `json:"time_remaining"`
}

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

type MonitoredRegistration struct {
	Email        string    `json:"email" bson:"email"`
	Platform     string    `json:"platform" bson:"platform"`
	Username     string    `json:"username" bson:"username"`
	RegisteredAt time.Time `json:"registered_at" bson:"registered_at"`
	ExpiresAt    time.Time `json:"expires_at" bson:"expires_at"`
}

type CustomHackathon struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	Name        string    `json:"name" bson:"name"`
	Platform    string    `json:"platform" bson:"platform"` // devfolio, unstop, local
	URL         string    `json:"url" bson:"url"`
	ScheduledAt string    `json:"scheduled_at" bson:"scheduled_at"`
	EndDate     time.Time `json:"end_date" bson:"end_date"`
	SubmittedBy string    `json:"submitted_by" bson:"submitted_by"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
}

type HackathonTracking struct {
	ID            string    `json:"id" bson:"_id,omitempty"`
	Email         string    `json:"email" bson:"email"`
	HackathonName string    `json:"hackathon_name" bson:"hackathon_name"`
	Platform      string    `json:"platform" bson:"platform"`
	Status        string    `json:"status" bson:"status"` // "interested", "applied", "submitted"
	EndDate       time.Time `json:"end_date" bson:"end_date"`
	TrackedAt     time.Time `json:"tracked_at" bson:"tracked_at"`
}
