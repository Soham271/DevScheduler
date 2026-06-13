package router

import (
	"devflow-scheduler/handler"
	"devflow-scheduler/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)


func SetupRouter(rdb *redis.Client) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "DevFlow Scheduler is running 🚀"})
	})

	
	r.POST("/signup", handler.Signup())
	r.POST("/login", handler.Login())
	r.POST("/auth/google", handler.GoogleLogin())

	
	protected := r.Group("/")
	protected.Use(middleware.JWTAuth())
	{
		
		protected.POST("/jobs", handler.CreateJob(rdb))

		
		protected.POST("/analyze/:platform/:username", handler.AnalyzeUser(rdb))

		
		protected.POST("/register/:platform/:username", handler.RegisterUser(rdb))

		
		protected.POST("/chat", handler.ChatProxy())

		
		protected.POST("/schedule-email", handler.ScheduleEmail(rdb))

		
		protected.POST("/send-email", handler.SendEmailHandler())

		
		protected.POST("/user/profile", handler.UpdateUserProfile())

		// Hackathon Submission
		protected.POST("/hackathons/submit", handler.SubmitHackathon())
	}

	
	leetcode := protected.Group("/platforms/leetcode")
	{
		leetcode.POST("/analyze", handler.LeetCodeAnalyze(rdb))
	}
	
	r.GET("/platforms/leetcode/profile", handler.LeetCodeGetProfile(rdb))
	r.GET("/platforms/leetcode/heatmap", handler.LeetCodeGetHeatmap(rdb))
	r.GET("/platforms/leetcode/submissions", handler.LeetCodeGetSubmissions(rdb))
	r.GET("/platforms/leetcode/contests", handler.LeetCodeGetContests(rdb))

	
	codeforces := protected.Group("/platforms/codeforces")
	{
		codeforces.POST("/analyze", handler.CodeforcesAnalyze(rdb))
	}

	
	codechef := protected.Group("/platforms/codechef")
	{
		codechef.POST("/analyze", handler.CodeChefAnalyze(rdb))
	}

	
	gfg := protected.Group("/platforms/gfg")
	{
		gfg.POST("/analyze", handler.GFGAnalyze(rdb))
	}

	
	github := protected.Group("/platforms/github")
	{
		github.POST("/analyze", handler.GitHubAnalyze(rdb))
	}

	
	r.GET("/users", handler.ListUsers(rdb))
	r.GET("/contests/:platform", handler.GetContests(rdb))

	
	r.GET("/activities", handler.GetActivities(rdb))
	r.GET("/activities/stream", handler.StreamActivities())
	protected.POST("/activities/:id/read", handler.MarkActivityRead(rdb))
	protected.POST("/activities/clear", handler.ClearActivities(rdb))

	return r
}
