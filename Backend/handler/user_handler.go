package handler

import (
	"devflow-scheduler/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UpdateProfileRequest struct {
	LeetcodeUsername   string `json:"leetcode_username"`
	CodechefUsername   string `json:"codechef_username"`
	CodeforcesUsername string `json:"codeforces_username"`
	GfgUsername        string `json:"gfg_username"`
	GithubUsername     string `json:"github_username"`
}

func UpdateUserProfile() gin.HandlerFunc {
	return func(c *gin.Context) {
		email, exists := c.Get("user_email")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		var req UpdateProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		err := repository.UpdateUserProfiles(email.(string), req.LeetcodeUsername, req.CodechefUsername, req.CodeforcesUsername, req.GfgUsername, req.GithubUsername)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
	}
}
