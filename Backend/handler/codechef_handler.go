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
//  CodeChef Intelligence Handler
// ═══════════════════════════════════════════════════════════════

func CodeChefAnalyze(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
			return
		}

		log.Printf("🔍 [CodeChef Intelligence] Analyzing %s...", req.Username)

		profile, err := services.FetchCodeChefFullProfile(req.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch CodeChef profile: %v", err),
			})
			return
		}

		log.Printf("✅ [CodeChef Intelligence] Analysis complete for %s: rating=%d, solved=%d",
			req.Username, profile.Rating, profile.TotalSolved)

		c.JSON(http.StatusOK, gin.H{
			"message": "CodeChef analysis complete",
			"profile": profile,
		})
	}
}
