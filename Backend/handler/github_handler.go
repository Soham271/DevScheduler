package handler

import (
	"fmt"
	"log"
	"net/http"

	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)





func GitHubAnalyze(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
			return
		}

		log.Printf("🔍 [GitHub Intelligence] Analyzing %s...", req.Username)

		profile, err := services.FetchGitHubFullProfile(req.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch GitHub profile: %v", err),
			})
			return
		}

		log.Printf("✅ [GitHub Intelligence] Analysis complete for %s: repos=%d, contributions=%d, PRs=%d",
			req.Username, profile.PublicRepos, profile.TotalContributions, profile.TotalPRs)

		c.JSON(http.StatusOK, gin.H{
			"message": "GitHub analysis complete",
			"profile": profile,
		})
	}
}
