package handler

import (
	"context"
	"devflow-scheduler/config"
	"devflow-scheduler/model"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TrackHackathon allows authenticated users to track a hackathon
func TrackHackathon() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			HackathonName string `json:"hackathon_name" binding:"required"`
			Platform      string `json:"platform" binding:"required"`
			EndDate       string `json:"end_date" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
			return
		}

		email, exists := c.Get("user_email")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		endDate, err := time.Parse(time.RFC3339, req.EndDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format. Use ISO8601 (RFC3339)."})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		filter := bson.M{
			"email":          email.(string),
			"hackathon_name": req.HackathonName,
			"platform":       req.Platform,
		}

		// Check if already tracked
		count, _ := config.HackathonTrackingCollection.CountDocuments(ctx, filter)
		if count > 0 {
			c.JSON(http.StatusOK, gin.H{"message": "Already tracking this hackathon"})
			return
		}

		tracking := model.HackathonTracking{
			ID:            primitive.NewObjectID().Hex(),
			Email:         email.(string),
			HackathonName: req.HackathonName,
			Platform:      req.Platform,
			Status:        "interested", // Default status
			EndDate:       endDate,
			TrackedAt:     time.Now(),
		}

		_, err = config.HackathonTrackingCollection.InsertOne(ctx, tracking)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track hackathon"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Hackathon tracked successfully",
		})
	}
}

// UpdateHackathonStatus allows users to update their tracking status (applied, submitted)
func UpdateHackathonStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			HackathonName string `json:"hackathon_name" binding:"required"`
			Platform      string `json:"platform" binding:"required"`
			Status        string `json:"status" binding:"required"` // "applied" or "submitted"
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
			return
		}

		email, exists := c.Get("user_email")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		filter := bson.M{
			"email":          email.(string),
			"hackathon_name": req.HackathonName,
			"platform":       req.Platform,
		}

		update := bson.M{
			"$set": bson.M{
				"status": req.Status,
			},
		}

		result, err := config.HackathonTrackingCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tracking record not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Status updated successfully",
		})
	}
}

// GetTrackedHackathons returns the user's tracked hackathons
func GetTrackedHackathons() gin.HandlerFunc {
	return func(c *gin.Context) {
		email, exists := c.Get("user_email")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		filter := bson.M{"email": email.(string)}
		cursor, err := config.HackathonTrackingCollection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tracked hackathons"})
			return
		}
		defer cursor.Close(ctx)

		var tracked []model.HackathonTracking
		if err = cursor.All(ctx, &tracked); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tracked hackathons"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"tracked": tracked,
		})
	}
}
