






package workers

import (
	"fmt"
	"log"

	"devflow-scheduler/model"

	"github.com/redis/go-redis/v9"
)


const (
	JobTypeLeetCodeDaily   = "leetcode_daily"
	JobTypeLeetCodeContest = "leetcode_contest"
	JobTypeCodeChefContest = "codechef_contest"
	JobTypeEmail           = "email_notification"
	

	
	JobTypeDelayedEmail       = "delayed_email"
	JobTypeLeetCodeInactivity = "leetcode_inactivity_reminder"
	JobTypeContestReminder    = "contest_reminder"
)




var JobQueue = make(chan model.Job, 100)


var WorkerRDB *redis.Client



func StartPool(numberOfWorkers int, rdb *redis.Client) {
	WorkerRDB = rdb
	for i := 1; i <= numberOfWorkers; i++ {
		go worker(i)
	}
	log.Printf("👷 Started Worker Pool with %d workers\n", numberOfWorkers)
}

func worker(workerID int) {
	
	for job := range JobQueue {
		fmt.Printf("[Worker %d] Picked up job: %s\n", workerID, job.Type)

		switch job.Type {

		case JobTypeLeetCodeDaily:
			handleLeetCodeDaily(job)
		case JobTypeLeetCodeContest:
			handleLeetCodeContest(job)
		case JobTypeCodeChefContest:
			handleCodeChefContest(job)
		case JobTypeEmail:
			handleEmailNotification(job)
		case JobTypeUserAnalysis:
			handleUserAnalysis(job)

		
		case JobTypeDelayedEmail:
			handleDelayedEmail(job)
		case JobTypeLeetCodeInactivity:
			handleInactivityReminder(job)
		case JobTypeContestReminder:
			handleContestReminder(job)

		default:
			log.Printf("[Worker %d] Unknown job type: %s\n", workerID, job.Type)
		}

		fmt.Printf("[Worker %d] Finished job: %s\n", workerID, job.ID)
	}
}
