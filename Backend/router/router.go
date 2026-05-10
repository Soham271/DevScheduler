package router

import (
	"devflow-scheduler/handler"
	"devflow-scheduler/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// SetupRouter configures all API routes.
func SetupRouter(rdb *redis.Client) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check (public)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "DevFlow Scheduler is running 🚀"})
	})

	// ─── Auth routes (public) ───────────────────
	r.POST("/signup", handler.Signup())
	r.POST("/login", handler.Login())
	r.POST("/auth/google", handler.GoogleLogin())

	// ─── Protected routes (require JWT) ─────────
	protected := r.Group("/")
	protected.Use(middleware.JWTAuth())
	{
		// Legacy endpoint
		protected.POST("/jobs", handler.CreateJob(rdb))

		// Analyze a user: POST /analyze/leetcode/tourist
		protected.POST("/analyze/:platform/:username", handler.AnalyzeUser(rdb))

		// Register a user for monitoring: POST /register/leetcode/tourist
		protected.POST("/register/:platform/:username", handler.RegisterUser(rdb))

		// Schedule a one-time delayed email
		protected.POST("/schedule-email", handler.ScheduleEmail(rdb))

		// Send email
		protected.POST("/send-email", handler.SendEmailHandler())

		// Update profile
		protected.POST("/user/profile", handler.UpdateUserProfile())
	}

	// ─── LeetCode Intelligence Platform ─────────
	leetcode := protected.Group("/platforms/leetcode")
	{
		leetcode.POST("/analyze", handler.LeetCodeAnalyze(rdb))
	}
	// Public LeetCode read endpoints
	r.GET("/platforms/leetcode/profile", handler.LeetCodeGetProfile(rdb))
	r.GET("/platforms/leetcode/heatmap", handler.LeetCodeGetHeatmap(rdb))
	r.GET("/platforms/leetcode/submissions", handler.LeetCodeGetSubmissions(rdb))
	r.GET("/platforms/leetcode/contests", handler.LeetCodeGetContests(rdb))

	// ─── Codeforces Intelligence Platform ─────────
	codeforces := protected.Group("/platforms/codeforces")
	{
		codeforces.POST("/analyze", handler.CodeforcesAnalyze(rdb))
	}

	// ─── CodeChef Intelligence Platform ─────────
	codechef := protected.Group("/platforms/codechef")
	{
		codechef.POST("/analyze", handler.CodeChefAnalyze(rdb))
	}

	// ─── GeeksForGeeks Intelligence Platform ─────────
	gfg := protected.Group("/platforms/gfg")
	{
		gfg.POST("/analyze", handler.GFGAnalyze(rdb))
	}

	// ─── Public read-only routes ────────────────
	r.GET("/users", handler.ListUsers(rdb))
	r.GET("/contests/:platform", handler.GetContests(rdb))

	// ─── Activity Feed (public read, protected write) ─────
	r.GET("/activities", handler.GetActivities(rdb))
	r.GET("/activities/stream", handler.StreamActivities())
	protected.POST("/activities/:id/read", handler.MarkActivityRead(rdb))
	protected.POST("/activities/clear", handler.ClearActivities(rdb))

	return r
}
