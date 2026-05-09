package repository

import (
	"context"
	"devflow-scheduler/config"
	"devflow-scheduler/model"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func EnsureUserIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := mongo.IndexModel{
		Keys:    bson.M{"email": 1},
		Options: options.Index().SetUnique(true),
	}

	_, err := config.UserCollection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		// Just log the error, don't crash
		// log.Println("Failed to create email index:", err)
	}
}

func CreateUser(user model.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user.CreatedAt = time.Now()
	_, err := config.UserCollection.InsertOne(ctx, user)
	return err
}

func GetUserByEmail(email string) (*model.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user model.User
	err := config.UserCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Not found
		}
		return nil, err
	}
	return &user, nil
}

func UpdateUserProfiles(email, leetcode, codechef, github string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"leetcode_username": leetcode,
			"codechef_username": codechef,
			"github_username":   github,
		},
	}
	_, err := config.UserCollection.UpdateOne(ctx, bson.M{"email": email}, update)
	return err
}

func GetAllUsers() ([]model.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var users []model.User
	cursor, err := config.UserCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}
	return users, nil
}
