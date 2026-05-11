package config

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

// Initialize a background context for Redis
var Ctx = context.Background()

func ConnectRedis() *redis.Client {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Ping Redis to ensure the connection is alive
	_, err := client.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("✅ Successfully connected to Redis!")
	return client
}
