package workers

// --- Legacy payloads (kept for backward compatibility) ---

type LeetCodeDailyPayload struct {
	Username string `json:"username"`
}

type ContestPayload struct {
	ContestName string `json:"contest_name"`
	Platform    string `json:"platform"`
	NotifyEmail string `json:"notify_email"`
}

type EmailPayload struct {
	ToAddress string `json:"to_address"`
	Subject   string `json:"subject"`
	Body      string `json:"body"`
}

// --- New notification payloads ---

// DelayedEmailPayload is used for one-time scheduled email jobs.
type DelayedEmailPayload struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

// InactivityReminderPayload is used for LeetCode inactivity reminder jobs.
type InactivityReminderPayload struct {
	Username    string `json:"username"`
	Platform    string `json:"platform"`
	Email       string `json:"email"`
	ReminderNum int    `json:"reminder_num"`
	TotalSolved int    `json:"total_solved"`
}

// ContestReminderPayload is used for countdown-style contest reminder jobs.
type ContestReminderPayload struct {
	ContestName   string `json:"contest_name"`
	Platform      string `json:"platform"`
	Email         string `json:"email"`
	StartTime     string `json:"start_time"`
	TimeRemaining string `json:"time_remaining"`
	MinutesBefore int    `json:"minutes_before"`
}
