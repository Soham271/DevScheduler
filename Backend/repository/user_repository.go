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
		
		
	}

	monitoringUniqueIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "platform", Value: 1}, {Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	_, _ = config.MonitoringCollection.Indexes().CreateOne(ctx, monitoringUniqueIndex)

	monitoringTTLIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "expires_at", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0),
	}
	_, _ = config.MonitoringCollection.Indexes().CreateOne(ctx, monitoringTTLIndex)
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
			return nil, nil 
		}
		return nil, err
	}
	return &user, nil
}

func UpdateUserProfiles(email, leetcode, codechef, codeforces, gfg, github string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"leetcode_username":   leetcode,
			"codechef_username":   codechef,
			"codeforces_username": codeforces,
			"gfg_username":        gfg,
			"github_username":     github,
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

func UpsertMonitoringRegistration(reg model.MonitoredRegistration) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"platform": reg.Platform,
		"username": reg.Username,
	}
	update := bson.M{
		"$set": bson.M{
			"email":         reg.Email,
			"platform":      reg.Platform,
			"username":      reg.Username,
			"registered_at": reg.RegisteredAt,
			"expires_at":    reg.ExpiresAt,
		},
	}

	_, err := config.MonitoringCollection.UpdateOne(ctx, filter, update, options.Update().SetUpsert(true))
	return err
}

func GetMonitoringRegistration(platform, username string) (*model.MonitoredRegistration, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var reg model.MonitoredRegistration
	err := config.MonitoringCollection.FindOne(ctx, bson.M{
		"platform": platform,
		"username": username,
	}).Decode(&reg)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &reg, nil
}

func GetAllMonitoringRegistrations() ([]model.MonitoredRegistration, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var regs []model.MonitoredRegistration
	cursor, err := config.MonitoringCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &regs); err != nil {
		return nil, err
	}
	return regs, nil
}
