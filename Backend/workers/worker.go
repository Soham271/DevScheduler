// What is a Worker System?
// Instead of doing the work, the Event Head should grab the task off the clipboard and hand it to a volunteer.

// A Worker System (Worker Pool) is a group of dedicated volunteers (Goroutines) sitting around waiting for instructions.
//  The Scheduler's only job is to fetch tasks from Redis and toss them to the workers.
// This allows the Scheduler to immediately go back to checking Redis, keeping the system lighting fast.

package workers

import (
	"fmt"
	"log"

	"devflow-scheduler/model"

	"github.com/redis/go-redis/v9"
)

// define the job type
const (
	JobTypeLeetCodeDaily   = "leetcode_daily"
	JobTypeLeetCodeContest = "leetcode_contest"
	JobTypeCodeChefContest = "codechef_contest"
	JobTypeEmail           = "email_notification"
	// JobTypeUserAnalysis is defined in analysis_worker.go

	// New notification job types
	JobTypeDelayedEmail       = "delayed_email"
	JobTypeLeetCodeInactivity = "leetcode_inactivity_reminder"
	JobTypeContestReminder    = "contest_reminder"
)

// JobQueue is a channel (queue) where Scheduler puts the jobs
// and the workers pick them up and execute them.
// It can hold up to 100 jobs at a time waiting for a worker.
var JobQueue = make(chan model.Job, 100)

// WorkerRDB is the Redis client used by worker handlers for activity emission.
var WorkerRDB *redis.Client

// StartPool creates the worker pool with the specified number of workers.
// It also stores the Redis client reference for activity feed emission.
func StartPool(numberOfWorkers int, rdb *redis.Client) {
	WorkerRDB = rdb
	for i := 1; i <= numberOfWorkers; i++ {
		go worker(i)
	}
	log.Printf("👷 Started Worker Pool with %d workers\n", numberOfWorkers)
}

func worker(workerID int) {
	// infinite loop to keep the worker running and waiting for jobs
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

		// New notification job types
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
