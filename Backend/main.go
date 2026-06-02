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

	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Error loading .env file:", err)
	}

	wd, _ := os.Getwd()
	log.Println("Working dir:", wd)

	log.Println("EMAIL_SENDER:", os.Getenv("EMAIL_SENDER"))

	cfg := config.LoadConfig()

	rdb := config.ConnectRedis()
	config.ConnectMongoDB()

	repository.EnsureUserIndexes()

	services.ActivityHub = services.NewSSEHub()
	log.Println("📡 SSE Activity Hub initialized")

	workers.StartPool(5, rdb)

	defer rdb.Close()
	defer config.DisconnectMongoDB()

	r := router.SetupRouter(rdb)

	go scheduler.Start(rdb)

	go events.StartSimulatedMonitors(rdb)

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting DevFlow Scheduler API Server on port %s...\n", cfg.Port)

	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Server crashed: %v", err)
	}
}
