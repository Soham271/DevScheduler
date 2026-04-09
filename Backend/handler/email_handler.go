package handler

import (
	"net/http"

	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
)

type EmailRequest struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

func SendEmailHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req EmailRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := services.SendEmail(req.To, req.Subject, req.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Email sent successfully ✅"})
	}
}
