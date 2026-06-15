package services

import "fmt"







const emailFooter = `
---
🚀 DevFlow Scheduler — Automated Notification Engine
This is an automated email. Do not reply to this message.
`




func BuildDelayedEmailBody(subject, body string) string {
	return fmt.Sprintf(`📬 Scheduled Email — DevFlow Scheduler
═══════════════════════════════════════

%s

%s`, body, emailFooter)
}




func BuildInactivityReminderSubject(username string, reminderNum int) string {
	if reminderNum == 1 {
		return fmt.Sprintf("⚠️ %s — You haven't solved anything today!", username)
	}
	return fmt.Sprintf("🔴 Reminder #%d — %s, still no problems solved today!", reminderNum, username)
}


func BuildInactivityReminderBody(username, platform string, reminderNum, totalSolved int) string {
	urgency := "📌"
	message := "Don't forget to solve at least one problem today!"
	if reminderNum >= 3 {
		urgency = "🚨"
		message = "This is getting serious — your streak is at risk!"
	} else if reminderNum >= 2 {
		urgency = "⚠️"
		message = "Time is running out — solve a problem before midnight!"
	}

	return fmt.Sprintf(`%s %s Inactivity Reminder — DevFlow Scheduler
═══════════════════════════════════════════════════

Hey %s! 👋

%s

📊 Your Stats:
   • Platform    : %s
   • Total Solved : %d problems
   • Status      : ❌ No problems solved today

💡 Quick tip: Even solving one Easy problem keeps your momentum going!

🔔 This is reminder #%d of %d.
   Reminders will stop once you solve a problem or after %d alerts.

%s`, urgency, platform, username, message, platform, totalSolved, reminderNum, MaxInactivityReminders, MaxInactivityReminders, emailFooter)
}




func BuildContestReminderSubject(contestName string, minutesBefore int) string {
	if minutesBefore <= 5 {
		return fmt.Sprintf("🚨 %s starts in %d minute(s)!", contestName, minutesBefore)
	}
	return fmt.Sprintf("🏁 %s starts in %d minutes!", contestName, minutesBefore)
}


func BuildContestReminderBody(contestName, platform, startTime, timeRemaining string, minutesBefore int) string {
	urgency := "📋"
	action := "Get ready — review your setup and templates."
	if minutesBefore <= 1 {
		urgency = "🚨"
		action = "STARTING NOW — Open your browser and join immediately!"
	} else if minutesBefore <= 15 {
		urgency = "⏰"
		action = "Almost time! Open the contest page and get ready."
	} else if minutesBefore <= 45 {
		urgency = "⚡"
		action = "Last chance to prepare — review your templates and setup."
	}

	return fmt.Sprintf(`%s Contest Reminder — DevFlow Scheduler
═══════════════════════════════════════════════

🏆 Contest   : %s
🌐 Platform  : %s
📅 Start Time: %s
⏱️  Countdown : %s

%s

📌 What to do:
   1. Open the contest page on %s
   2. Make sure you're logged in
   3. Prepare your IDE / code templates
   4. Stay focused and give it your best!

Good luck! 💪

%s`, urgency, contestName, platform, startTime, timeRemaining, action, platform, emailFooter)
}
