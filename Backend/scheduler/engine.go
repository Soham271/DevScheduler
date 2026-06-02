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

	ticker := time.NewTicker(30 * time.Second)

	ctx := context.Background()

	log.Println("⚙️ Scheduler Engine started. Waiting for jobs...")

	for range ticker.C {

		now := time.Now().Unix()

		jobs, err := rdb.ZRangeByScore(ctx, "jobs", &redis.ZRangeBy{
			Min: "-inf",
			Max: strconv.FormatInt(now, 10),
		}).Result()

		if err != nil {
			log.Printf("Error fetching jobs from Redis: %v", err)
			continue
		}

		for _, jobJSON := range jobs {

			rdb.ZRem(ctx, "jobs", jobJSON)

			var job model.Job
			err := json.Unmarshal([]byte(jobJSON), &job)
			if err != nil {
				log.Printf("Failed to decode job JSON: %v", err)
				continue
			}

			workers.JobQueue <- job
		}
	}
}
