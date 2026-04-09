package config

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

// Initialize a background context for Redis
var Ctx = context.Background()

func ConnectRedis() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	// Ping Redis to ensure the connection is alive
	_, err := client.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("✅ Successfully connected to Redis!")
	return client
}
