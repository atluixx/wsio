package http

import (
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/http/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	r *gin.Engine,
	linkHandler *handlers.LinkHandler,
	userHandler *handlers.UserHandler,
) {
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin != "" {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"service": "wsio API engine",
			"version": "1.0",
		})
	})

	base := r.Group("/api/v1")

	auth := base.Group("/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
	}

	links := base.Group("/links")
	{
		links.GET("/:code", linkHandler.RedirectLink)
		links.POST("", linkHandler.NewLink)

		protected := links.Group("")
		protected.Use(middleware.Auth())

		protected.DELETE("/:code", linkHandler.DeleteLink)
	}

	r.GET("/:code", linkHandler.RedirectLink)
}
