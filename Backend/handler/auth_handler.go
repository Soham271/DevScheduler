package handler

import (
	"net/http"

	"devflow-scheduler/services"

	"github.com/gin-gonic/gin"
)


type AuthRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}



func Signup() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req AuthRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Invalid request body",
				"detail": err.Error(),
			})
			return
		}

		if err := services.CreateUser(req.Email, req.Password); err != nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "User created successfully",
			"email":   req.Email,
		})
	}
}



func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req AuthRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Invalid request body",
				"detail": err.Error(),
			})
			return
		}

		token, err := services.AuthenticateUser(req.Email, req.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"token":   token,
			"email":   req.Email,
		})
	}
}






type GoogleLoginRequest struct {
	IDToken string `json:"id_token" binding:"required"`
}



func GoogleLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req GoogleLoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "id_token is required",
				"detail": err.Error(),
			})
			return
		}

		token, userInfo, err := services.GoogleLogin(req.IDToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Google login successful",
			"token":   token,
			"email":   userInfo.Email,
			"name":    userInfo.Name,
		})
	}
}
