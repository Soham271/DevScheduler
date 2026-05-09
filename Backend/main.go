package main

import (
	"devflow-scheduler/config"
	"devflow-scheduler/events"
	"devflow-scheduler/repository"
	"devflow-scheduler/router"
	"devflow-scheduler/scheduler"
	"devflow-scheduler/services"
	"devflow-scheduler/workers"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// use for env file
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Error loading .env file:", err)
	}

	wd, _ := os.Getwd()
	log.Println("Working dir:", wd)

	log.Println("EMAIL_SENDER:", os.Getenv("EMAIL_SENDER"))
	// 1. Load config
	cfg := config.LoadConfig()

	// 2. Connect to Redis & MongoDB
	rdb := config.ConnectRedis()
	config.ConnectMongoDB()

	// Create indexes (like unique email)
	repository.EnsureUserIndexes()

	// Initialize the SSE hub for live activity feed broadcasting
	services.ActivityHub = services.NewSSEHub()
	log.Println("📡 SSE Activity Hub initialized")

	// start with the 5 workers in the Background
	workers.StartPool(5, rdb)

	// close connections when the main function exit
	defer rdb.Close()
	defer config.DisconnectMongoDB()

	// 3. Setup Router (passing the Redis client)
	r := router.SetupRouter(rdb)
	// start the scheduler engine in a separate goroutine so it runs concurrently with the API server
	go scheduler.Start(rdb)
	// start the simulated monitors
	go events.StartSimulatedMonitors(rdb)
	// 4. Start Server
	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting DevFlow Scheduler API Server on port %s...\n", cfg.Port)

	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Server crashed: %v", err)
	}
}
