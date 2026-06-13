package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoDB *mongo.Client
var UserCollection *mongo.Collection
var MonitoringCollection *mongo.Collection
var CustomHackathonCollection *mongo.Collection

func ConnectMongoDB() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Println("MONGO_URI not set, fallback to default")
		mongoURI = "mongodb://localhost:27017/devscheduler"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	MongoDB = client
	UserCollection = client.Database("devflow").Collection("users")
	MonitoringCollection = client.Database("devflow").Collection("monitored_registrations")
	CustomHackathonCollection = client.Database("devflow").Collection("custom_hackathons")
	log.Println("✅ Successfully connected to MongoDB")
}

func DisconnectMongoDB() {
	if MongoDB != nil {
		if err := MongoDB.Disconnect(context.Background()); err != nil {
			log.Println("Error disconnecting MongoDB:", err)
		}
	}
}
