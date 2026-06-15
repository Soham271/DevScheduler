package config

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()

func ConnectRedis() *redis.Client {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "redis://localhost:6379"
	}

	opts, err := redis.ParseURL(redisAddr)
	if err != nil {

		opts = &redis.Options{Addr: redisAddr}
	}

	client := redis.NewClient(opts)

	_, err = client.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("✅ Successfully connected to Redis!")
	return client
}
