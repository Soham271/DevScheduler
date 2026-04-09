package scheduler

import (
	"context"
	"encoding/json"
	"log"
	"strconv"
	"time"

	"devflow-scheduler/model"

	"devflow-scheduler/workers"

	"github.com/redis/go-redis/v9"
)

func Start(rdb *redis.Client) {
	// create timer to run loop every 1 second
	ticker := time.NewTicker(1 * time.Second)

	ctx := context.Background()

	log.Println("⚙️ Scheduler Engine started. Waiting for jobs...")

	for range ticker.C {
		// to check which job is ready to execute
		now := time.Now().Unix()
		// execute the whose execute_time or score<=now
		// ZrangeByscore help us to get that's job
		jobs, err := rdb.ZRangeByScore(ctx, "jobs", &redis.ZRangeBy{
			Min: "-inf",
			Max: strconv.FormatInt(now, 10),
		}).Result()

		if err != nil {
			log.Printf("Error fetching jobs from Redis: %v", err)
			continue
		}
		// loop through the ready jobs and execute them
		for _, jobJSON := range jobs {
			// delete it from redis after execute it
			rdb.ZRem(ctx, "jobs", jobJSON)

			var job model.Job
			err := json.Unmarshal([]byte(jobJSON), &job)
			if err != nil {
				log.Printf("Failed to decode job JSON: %v", err)
				continue
			}
			// put the job in the queue 
			workers.JobQueue <- job
		}
	}
}
