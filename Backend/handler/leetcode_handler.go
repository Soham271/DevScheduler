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
//  LeetCode Intelligence Handler
//  Handles all dedicated LeetCode platform endpoints.
// ═══════════════════════════════════════════════════════════════

// LeetCodeAnalyze handles POST /platforms/leetcode/analyze
// Fetches comprehensive LeetCode profile data for the intelligence page.
func LeetCodeAnalyze(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Username is required",
			})
			return
		}

		log.Printf("🔍 [LeetCode Intelligence] Analyzing %s...", req.Username)

		profile, err := services.FetchLeetCodeFullProfile(req.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch LeetCode profile: %v", err),
			})
			return
		}

		log.Printf("✅ [LeetCode Intelligence] Analysis complete for %s: %d solved, %d contests",
			req.Username, profile.TotalSolved, profile.ContestCount)

		c.JSON(http.StatusOK, gin.H{
			"message": "LeetCode analysis complete",
			"profile": profile,
		})
	}
}

// LeetCodeGetProfile handles GET /platforms/leetcode/profile?username=xxx
func LeetCodeGetProfile(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username query param is required"})
			return
		}

		profile, err := services.FetchLeetCodeFullProfile(username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch profile: %v", err),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"profile": profile,
		})
	}
}

// LeetCodeGetHeatmap handles GET /platforms/leetcode/heatmap?username=xxx
func LeetCodeGetHeatmap(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username query param is required"})
			return
		}

		profile, err := services.FetchLeetCodeFullProfile(username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch heatmap: %v", err),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"username":            username,
			"submission_calendar": profile.SubmissionCalendar,
			"active_days":         profile.ActiveDays,
			"current_streak":      profile.CurrentStreak,
			"max_streak":          profile.MaxStreak,
			"is_active_today":     profile.IsActiveToday,
		})
	}
}

// LeetCodeGetSubmissions handles GET /platforms/leetcode/submissions?username=xxx
func LeetCodeGetSubmissions(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username query param is required"})
			return
		}

		profile, err := services.FetchLeetCodeFullProfile(username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch submissions: %v", err),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"username":    username,
			"submissions": profile.RecentSubmissions,
		})
	}
}

// LeetCodeGetContests handles GET /platforms/leetcode/contests?username=xxx
func LeetCodeGetContests(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username query param is required"})
			return
		}

		profile, err := services.FetchLeetCodeFullProfile(username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch contests: %v", err),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"username":       username,
			"contest_rating": profile.ContestRating,
			"contest_count":  profile.ContestCount,
			"contests":       profile.ContestHistory,
		})
	}
}
