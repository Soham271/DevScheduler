package services

import (
	"devflow-scheduler/model"
	"fmt"
	"time"
)


var IST *time.Location

func init() {
	var err error
	IST, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		
		IST = time.FixedZone("IST", 5*3600+30*60)
	}
}



func GetUpcomingContests(platform string) []model.ContestInfo {
	now := time.Now().In(IST)
	var contests []model.ContestInfo

	if platform == "" || platform == "codechef" {
		
		nextWed := nextWeekdayAt(now, time.Wednesday, 20, 0)
		contests = append(contests, model.ContestInfo{
			Name:          "CodeChef Starters",
			Platform:      "codechef",
			ScheduledAt:   nextWed.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextWed)),
		})
	}

	if platform == "" || platform == "leetcode" {
		
		nextSun := nextWeekdayAt(now, time.Sunday, 8, 0)
		contests = append(contests, model.ContestInfo{
			Name:          "LeetCode Weekly Contest",
			Platform:      "leetcode",
			ScheduledAt:   nextSun.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextSun)),
		})

		
		nextBiweekly := nextBiweeklySaturday(now, 20, 0)
		contests = append(contests, model.ContestInfo{
			Name:          "LeetCode Biweekly Contest",
			Platform:      "leetcode",
			ScheduledAt:   nextBiweekly.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextBiweekly)),
		})
	}

	if platform == "" || platform == "codeforces" {
		
		nextSat := nextWeekdayAt(now, time.Saturday, 20, 35)
		contests = append(contests, model.ContestInfo{
			Name:          "Codeforces Div 2",
			Platform:      "codeforces",
			ScheduledAt:   nextSat.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextSat)),
		})

		
		nextThu := nextWeekdayAt(now, time.Thursday, 20, 5)
		contests = append(contests, model.ContestInfo{
			Name:          "CF Educational Round",
			Platform:      "codeforces",
			ScheduledAt:   nextThu.Format("Mon, 02 Jan 2006 03:04 PM IST"),
			TimeRemaining: formatDuration(time.Until(nextThu)),
		})
	}

	return contests
}



func nextWeekdayAt(now time.Time, day time.Weekday, hour, minute int) time.Time {
	
	daysUntil := int(day) - int(now.Weekday())
	if daysUntil < 0 {
		daysUntil += 7
	}

	target := time.Date(now.Year(), now.Month(), now.Day()+daysUntil, hour, minute, 0, 0, IST)

	
	if target.Before(now) {
		target = target.AddDate(0, 0, 7)
	}

	return target
}


func nextBiweeklySaturday(now time.Time, hour, minute int) time.Time {
	for i := 0; i < 14; i++ { 
		candidate := now.AddDate(0, 0, i)

		if candidate.Weekday() == time.Saturday {
			
			day := candidate.Day()
			weekOfMonth := (day-1)/7 + 1

			
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

	
	return now.AddDate(0, 0, 7)
}





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
