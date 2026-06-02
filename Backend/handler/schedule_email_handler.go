package handler

import (
	"net/http"
	"time"

	"devflow-scheduler/events"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)



type ScheduleEmailRequest struct {
	To      string `json:"to" binding:"required,email"`
	Subject string `json:"subject" binding:"required"`
	Body    string `json:"body" binding:"required"`
	SendAt  string `json:"send_at" binding:"required"`
}



















func ScheduleEmail(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ScheduleEmailRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Invalid request body",
				"detail": err.Error(),
			})
			return
		}

		
		sendAt, err := time.Parse(time.RFC3339, req.SendAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Invalid send_at format. Use RFC3339, e.g. 2026-04-04T20:15:00+05:30",
				"detail": err.Error(),
			})
			return
		}

		
		if sendAt.Before(time.Now()) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "send_at must be a future datetime",
			})
			return
		}

		
		events.HandleScheduledEmail(rdb, req.To, req.Subject, req.Body, sendAt)

		c.JSON(http.StatusCreated, gin.H{
			"message": "Email scheduled successfully ✅",
			"job": gin.H{
				"to":      req.To,
				"subject": req.Subject,
				"send_at": sendAt.Format(time.RFC3339),
			},
		})
	}
}
