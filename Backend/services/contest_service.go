package services

import (
	"devflow-scheduler/model"
	"fmt"
	"time"
)

// IST is the Indian Standard Time location used for contest scheduling.
var IST *time.Location

func init() {
	var err error
	IST, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		// Fallback: IST is UTC+5:30
		IST = time.FixedZone("IST", 5*3600+30*60)
	}
}

// GetUpcomingContests returns the next upcoming contests for a given platform
// with calculated countdowns. Returns contests for all platforms if platform is empty.
func GetUpcomingContests(platform string) []model.ContestInfo {
	now := time.Now().In(IST)
	var contests []model.ContestInfo

	if platform == "" || platform == "codechef" {
		// CodeChef Starters — every Wednesday at 20:00 IST
		nextWed := nextWeekdayAt(now, time.Wednesday, 20, 0)
		contests = append(contests, model.ContestInfo{
			Name:          "CodeChef Starters",
			Platform:      "codechef",
			ScheduledAt:   nextWed.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextWed)),
		})
	}

	if platform == "" || platform == "leetcode" {
		// LeetCode Weekly Contest — every Sunday at 08:00 IST
		nextSun := nextWeekdayAt(now, time.Sunday, 8, 0)
		contests = append(contests, model.ContestInfo{
			Name:          "LeetCode Weekly Contest",
			Platform:      "leetcode",
			ScheduledAt:   nextSun.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextSun)),
		})

		// LeetCode Biweekly Contest — every alternate Saturday at 20:00 IST
		nextBiweekly := nextBiweeklySaturday(now, 20, 0)
		contests = append(contests, model.ContestInfo{
			Name:          "LeetCode Biweekly Contest",
			Platform:      "leetcode",
			ScheduledAt:   nextBiweekly.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextBiweekly)),
		})
	}

	return contests
}

// nextWeekdayAt calculates the next occurrence of a given weekday at a specific time.
// If today is that weekday and the time hasn't passed yet, it returns today.
func nextWeekdayAt(now time.Time, day time.Weekday, hour, minute int) time.Time {
	// Calculate days until the target weekday
	daysUntil := int(day) - int(now.Weekday())
	if daysUntil < 0 {
		daysUntil += 7
	}

	target := time.Date(now.Year(), now.Month(), now.Day()+daysUntil, hour, minute, 0, 0, IST)

	// If target is in the past (same day but time already passed), move to next week
	if target.Before(now) {
		target = target.AddDate(0, 0, 7)
	}

	return target
}

// nextBiweeklySaturday finds the next Saturday that falls on an even ISO week.
func nextBiweeklySaturday(now time.Time, hour, minute int) time.Time {
	for i := 0; i < 14; i++ { // check next 2 weeks
		candidate := now.AddDate(0, 0, i)

		if candidate.Weekday() == time.Saturday {
			// calculate week of month
			day := candidate.Day()
			weekOfMonth := (day-1)/7 + 1

			// only even weeks: 2 or 4
			if weekOfMonth%2 == 0 {
				return time.Date(
					candidate.Year(),
					candidate.Month(),
					candidate.Day(),
					hour, minute, 0, 0,
					IST,
				)
			}
		}
	}

	// fallback (should not happen)
	return now.AddDate(0, 0, 7)
}

// formatDuration converts a time.Duration into a human-readable countdown.
//   - If > 48h:  "X days left"
//   - If > 24h:  "1 day Xh left"
//   - If <= 24h: "Xh Ym Zs left"
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
