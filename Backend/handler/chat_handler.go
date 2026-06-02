package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"devflow-scheduler/repository"
	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
)


type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}


type ChatResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}


func ChatProxy() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ChatRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format. 'message' is required."})
			return
		}

		
		userEmail := c.GetString("user_email")
		user, _ := repository.GetUserByEmail(userEmail)
		contests := services.GetUpcomingContests("")

		contextStr := "Personal User Profile (Use this if asked about user IDs or if they are active):\n"
		if user != nil {
			contextStr += fmt.Sprintf("Name: %s\nLeetCode ID: %s\nCodeforces ID: %s\nCodeChef ID: %s\nGeeksForGeeks ID: %s\nGitHub ID: %s\n",
				user.Name, user.LeetcodeUsername, user.CodeforcesUsername, user.CodechefUsername, user.GfgUsername, user.GithubUsername)
		} else {
			contextStr += "No user profile found.\n"
		}

		contextStr += "\nUpcoming Contests Schedule (Use this if asked about when next contests are):\n"
		for _, contest := range contests {
			contextStr += fmt.Sprintf("- %s (%s): %s (Time Remaining: %s)\n", contest.Name, contest.Platform, contest.ScheduledAt, contest.TimeRemaining)
		}

		type NodePayload struct {
			Message     string `json:"message"`
			UserContext string `json:"userContext"`
		}

		
		payload := NodePayload{
			Message:     req.Message,
			UserContext: contextStr,
		}
		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process request payload"})
			return
		}

		
		nodeServiceURL := os.Getenv("CHATBOT_SERVICE_URL")
		if nodeServiceURL == "" {
			nodeServiceURL = "http://localhost:3001/api/chat"
		}
		resp, err := http.Post(nodeServiceURL, "application/json", bytes.NewBuffer(payloadBytes))
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Chatbot service is currently unavailable. Please ensure it is running."})
			return
		}
		defer resp.Body.Close()

		
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response from chatbot service"})
			return
		}

		if resp.StatusCode != http.StatusOK {
			c.JSON(resp.StatusCode, gin.H{"error": "Chatbot service returned an error", "details": string(bodyBytes)})
			return
		}

		var chatResp ChatResponse
		if err := json.Unmarshal(bodyBytes, &chatResp); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse chatbot response"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"response": chatResp.Response})
	}
}
