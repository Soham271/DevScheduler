package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"devflow-scheduler/config"
	"devflow-scheduler/events"
	"devflow-scheduler/model"
	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// CreateJob handles the POST /jobs request (legacy endpoint, kept for backward compat)
func CreateJob(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var newJob model.Job

		if err := c.ShouldBindJSON(&newJob); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		newJob.ID = uuid.New().String()
		newJob.Status = "pending"

		jobJSON, err := json.Marshal(newJob)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to format job data"})
			return
		}

		err = rdb.ZAdd(config.Ctx, "jobs", redis.Z{
			Score:  float64(newJob.ExecuteAt),
			Member: jobJSON,
		}).Err()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save job to Redis"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Job scheduled successfully!",
			"job":     newJob,
		})
	}
}

func f1(a, b int) int {
	return a * b
}

func genMsg(u, p string) string {
	return fmt.Sprintf("%s, you haven't solved any problem on %s today! Please solve at least one problem to keep your streak going.", u, p)
}

func AnalyzeUser(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		platform := c.Param("platform")
		username := c.Param("username")

		if platform != "leetcode" && platform != "codechef" && platform != "codeforces" && platform != "gfg" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Unsupported platform. Use 'leetcode', 'codechef', 'codeforces', or 'gfg'.",
			})
			return
		}

		if username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
			return
		}

		// Step 1: Fetch user profile (includes today's submission count for LeetCode)
		profile, err := services.FetchUserProfile(platform, username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to fetch profile: %v", err),
			})
			return
		}

		if (platform == "leetcode" || platform == "codeforces") && profile.IsInactiveToday {
			m := c.GetString("user_email")
			if m != "" {
				s := fmt.Sprintf("⚠️ %s Inactivity Reminder!", platform)
				b := fmt.Sprintf("Hi %s,\n\nYou haven't solved any problems on %s today. Please solve at least one problem to keep your streak going!\n\nHappy Coding,\nDevFlow Scheduler", username, platform)
				events.HandleDelayedEmail(rdb, m, s, b, 5*time.Minute)
			}

			c.JSON(http.StatusOK, gin.H{
				"message":           "⚠️ You are inactive today!",
				"is_inactive_today": true,
				"submissions_today": false,
				"username":          username,
				"platform":          platform,
				"profile_hidden":    true,
				"warning":           genMsg(username, platform),
				"suggestion":        "Try solving one Easy-level problem right now to get started. Even one submission counts! 💪",
			})

			go events.HandleUserAnalysis(rdb, platform, username)
			return
		}

		// Step 3: User is active (or not LeetCode) — run full analysis
		result := services.AnalyzeUser(profile)

		// Step 4: Queue a background job via the event system
		go events.HandleUserAnalysis(rdb, platform, username)

		// Step 5: Return the full analysis result
		c.JSON(http.StatusOK, gin.H{
			"message":           "Analysis complete",
			"is_inactive_today": profile.IsInactiveToday,
			"submissions_today": profile.SubmissionsToday,
			"analysis":          result,
		})
	}
}

// RegisterRequest holds the email for user registration.
type RegisterRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// RegisterUser handles POST /register/:platform/:username
// It registers a user for periodic monitoring by the background monitors.
// Request body: {"email": "user@gmail.com"}
// The email is stored as the value so the notification system can look it up.
func RegisterUser(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		platform := c.Param("platform")
		username := c.Param("username")

		if platform != "leetcode" && platform != "codechef" && platform != "codeforces" && platform != "gfg" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Unsupported platform. Use 'leetcode', 'codechef', 'codeforces', or 'gfg'.",
			})
			return
		}

		if username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
			return
		}

		var req RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Request body must include a valid email",
				"detail": err.Error(),
			})
			return
		}

		// Store in Redis: registered_user:<platform>:<username> = email
		key := fmt.Sprintf("registered_user:%s:%s", platform, username)
		err := rdb.Set(config.Ctx, key, req.Email, 0).Err()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to register user in Redis",
			})
			return
		}

		log.Printf("✅ Registered user %s@%s (%s) for periodic monitoring", username, platform, req.Email)

		c.JSON(http.StatusCreated, gin.H{
			"message":  "User registered for monitoring",
			"platform": platform,
			"username": username,
			"email":    req.Email,
		})
	}
}

// ListUsers handles GET /users
// It returns all registered users being monitored.
func ListUsers(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		users := events.GetRegisteredUsers(rdb)

		type UserEntry struct {
			Platform string `json:"platform"`
			Username string `json:"username"`
		}

		var userList []UserEntry
		for _, u := range users {
			userList = append(userList, UserEntry{
				Platform: u.Platform,
				Username: u.Username,
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"total_users": len(userList),
			"users":       userList,
		})
	}
}

// GetContests handles GET /contests/:platform
// It returns upcoming contests with countdown timers.
func GetContests(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		platform := c.Param("platform")

		if platform != "leetcode" && platform != "codechef" && platform != "codeforces" && platform != "gfg" && platform != "all" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Use 'leetcode', 'codechef', 'codeforces', 'gfg', or 'all'.",
			})
			return
		}

		p := platform
		if platform == "all" {
			p = ""
		}

		contests := services.GetUpcomingContests(p)

		c.JSON(http.StatusOK, gin.H{
			"platform": platform,
			"contests": contests,
		})
	}
}
