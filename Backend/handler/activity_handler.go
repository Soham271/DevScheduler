package handler

import (
	"log"
	"net/http"
	"strconv"

	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)












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



func StreamActivities() gin.HandlerFunc {
	return func(c *gin.Context) {
		
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")
		origin := c.Request.Header.Get("Origin")
		if origin == "https://dev-scheduler.vercel.app" || origin == "http://localhost:5173" {
			c.Header("Access-Control-Allow-Origin", origin)
		} else {
			c.Header("Access-Control-Allow-Origin", "*")
		}
		c.Header("Access-Control-Allow-Credentials", "true")

		
		clientChan := make(chan string, 10)

		
		if services.ActivityHub == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "SSE hub not initialized"})
			return
		}
		services.ActivityHub.Register(clientChan)

		
		defer services.ActivityHub.Unregister(clientChan)

		
		clientGone := c.Request.Context().Done()

		
		c.Writer.Write([]byte(": connected\n\n"))
		c.Writer.Flush()

		log.Println("📡 [SSE] Client connected to activity stream")

		
		for {
			select {
			case <-clientGone:
				log.Println("📡 [SSE] Client disconnected from activity stream")
				return

			case msg, ok := <-clientChan:
				if !ok {
					
					return
				}
				
				c.Writer.Write([]byte("data: " + msg + "\n\n"))
				c.Writer.(http.Flusher).Flush()
			}
		}
	}
}


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


func ClearActivities(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		services.ClearActivities(rdb)
		c.JSON(http.StatusOK, gin.H{"message": "Activity feed cleared"})
	}
}
