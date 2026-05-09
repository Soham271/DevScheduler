package handler

import (
	"log"
	"net/http"
	"strconv"

	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// ═══════════════════════════════════════════════════════════════
//  Activity Handler — HTTP endpoints for the live activity feed.
//
//  GET  /activities         — Fetch recent activities (paginated)
//  GET  /activities/stream  — SSE endpoint for real-time push
//  POST /activities/:id/read — Mark a single activity as read
//  POST /activities/clear    — Clear all activities
// ═══════════════════════════════════════════════════════════════

// GetActivities returns recent activities with pagination.
// Query params: ?offset=0&limit=20
func GetActivities(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

		if limit <= 0 || limit > 100 {
			limit = 20
		}
		if offset < 0 {
			offset = 0
		}

		activities, err := services.GetRecentActivities(rdb, offset, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		total := services.GetActivityCount(rdb)

		c.JSON(http.StatusOK, gin.H{
			"activities": activities,
			"total":      total,
			"offset":     offset,
			"limit":      limit,
		})
	}
}

// StreamActivities is the SSE endpoint.
// It keeps the connection open and streams new activities as they arrive.
func StreamActivities() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Set SSE headers
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Credentials", "true")

		// Create a channel for this client
		clientChan := make(chan string, 10)

		// Register with the SSE hub
		if services.ActivityHub == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "SSE hub not initialized"})
			return
		}
		services.ActivityHub.Register(clientChan)

		// Ensure cleanup on disconnect
		defer services.ActivityHub.Unregister(clientChan)

		// Detect client disconnect
		clientGone := c.Request.Context().Done()

		// Send an initial keepalive comment so the client knows the connection is open
		c.Writer.Write([]byte(": connected\n\n"))
		c.Writer.Flush()

		log.Println("📡 [SSE] Client connected to activity stream")

		// Stream loop
		for {
			select {
			case <-clientGone:
				log.Println("📡 [SSE] Client disconnected from activity stream")
				return

			case msg, ok := <-clientChan:
				if !ok {
					// Channel was closed
					return
				}
				// Write SSE event
				c.Writer.Write([]byte("data: " + msg + "\n\n"))
				c.Writer.(http.Flusher).Flush()
			}
		}
	}
}

// MarkActivityRead marks a single activity as read by its ID.
func MarkActivityRead(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Activity ID required"})
			return
		}

		err := services.MarkActivityRead(rdb, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Activity marked as read"})
	}
}

// ClearActivities deletes all activities from the feed.
func ClearActivities(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		services.ClearActivities(rdb)
		c.JSON(http.StatusOK, gin.H{"message": "Activity feed cleared"})
	}
}
