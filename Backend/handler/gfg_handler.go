package handler

import (
	"fmt"
	"log"
	"net/http"

	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)





func GFGAnalyze(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
			return
		}

		log.Printf("🔍 [GFG Intelligence] Analyzing %s...", req.Username)

		profile, err := services.FetchGFGFullProfile(req.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch GFG profile: %v", err),
			})
			return
		}

		log.Printf("✅ [GFG Intelligence] Analysis complete for %s: score=%d, solved=%d",
			req.Username, profile.CodingScore, profile.TotalSolved)

		c.JSON(http.StatusOK, gin.H{
			"message": "GFG analysis complete",
			"profile": profile,
		})
	}
}
