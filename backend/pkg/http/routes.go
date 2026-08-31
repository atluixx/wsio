package http

import (
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/http/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	r *gin.Engine,
	userHandler *handlers.UserHandler,
	profileHandler *handlers.ProfileHandler,
	adminHandler *handlers.AdminHandler,
) {
	r.HandleMethodNotAllowed = true

	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if origin != "" {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
		} else {
			c.Header("Access-Control-Allow-Origin", "*")
		}
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, X-User-ID")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Set-Cookie")
		c.Header("Vary", "Origin")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"service": "wsio link-in-bio API",
			"version": "2.0",
		})
	})

	base := r.Group("/api/v1")

	auth := base.Group("/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
		auth.GET("/me", middleware.Auth(), userHandler.Me)
	}

	// Public profile surface
	base.GET("/profiles/:username", profileHandler.GetPublicProfile)
	base.POST("/click/:id", profileHandler.RecordClick)
	base.GET("/click/:id", profileHandler.TrackAndRedirect)

	// Current user's profile management
	me := base.Group("/me")
	me.Use(middleware.Auth())
	{
		me.GET("/profile", profileHandler.GetMyProfile)
		me.PUT("/profile", profileHandler.UpsertMyProfile)
		me.GET("/profile/analytics", profileHandler.GetMyProfileAnalytics)

		me.POST("/profile/links", profileHandler.CreateMyProfileLink)
		me.PUT("/profile/links/reorder", profileHandler.ReorderMyProfileLinks)
		me.PUT("/profile/links/:id", profileHandler.UpdateMyProfileLink)
		me.DELETE("/profile/links/:id", profileHandler.DeleteMyProfileLink)
		me.GET("/profile/links/:id/analytics", profileHandler.GetMyProfileLinkAnalytics)
	}

	if adminHandler != nil {
		admin := base.Group("/admin")
		admin.Use(middleware.Auth(), middleware.RequireAdmin())
		{
			admin.GET("/stats", adminHandler.GetSystemStats)
			admin.GET("/users", adminHandler.ListUsers)
		}
	}
}
