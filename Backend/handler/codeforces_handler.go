package handler

import (
	"fmt"
	"log"
	"net/http"

	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// ═══════════════════════════════════════════════════════════════
//  Codeforces Intelligence Handler
// ═══════════════════════════════════════════════════════════════

func CodeforcesAnalyze(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
			return
		}

		log.Printf("🔍 [Codeforces Intelligence] Analyzing %s...", req.Username)

		profile, err := services.FetchCodeforcesFullProfile(req.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch Codeforces profile: %v", err),
			})
			return
		}

		log.Printf("✅ [Codeforces Intelligence] Analysis complete for %s: %d solved, %d contests",
			req.Username, profile.TotalSolved, profile.ContestCount)

		c.JSON(http.StatusOK, gin.H{
			"message": "Codeforces analysis complete",
			"profile": profile,
		})
	}
}
