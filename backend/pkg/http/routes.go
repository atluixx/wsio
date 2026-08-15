package http

import (
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/http/middleware"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	r *gin.Engine,
	linkHandler *handlers.LinkHandler,
	userHandler *handlers.UserHandler,
	analyticsHandler *handlers.AnalyticsHandler,
	analyticsRepo repositories.AnalyticsRepository,
	apiKeyRepo repositories.ApiKeyRepository,
	stripeHandler *handlers.StripeHandler,
	apiKeyHandler *handlers.ApiKeyHandler,
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
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, X-User-ID, X-API-Key")
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
		if analyticsHandler != nil {
			links.GET("/:code/analytics", analyticsHandler.GetAnalytics)
		}

		if analyticsRepo != nil {
			links.POST("", middleware.OptionalAuth(apiKeyRepo), middleware.GuestLimitMiddleware(analyticsRepo), linkHandler.NewLink)
		} else {
			links.POST("", middleware.OptionalAuth(apiKeyRepo), linkHandler.NewLink)
		}

		protected := links.Group("")
		protected.Use(middleware.Auth(apiKeyRepo))

		protected.DELETE("/:code", linkHandler.DeleteLink)
	}

	if stripeHandler != nil {
		stripe := base.Group("/stripe")
		{
			stripe.POST("/create-checkout-session", stripeHandler.CreateCheckoutSession)
			stripe.POST("/webhook", stripeHandler.HandleWebhook)
			stripe.GET("/subscription", middleware.OptionalAuth(apiKeyRepo), stripeHandler.GetUserSubscription)
		}
	}

	if apiKeyHandler != nil {
		keys := base.Group("/keys")
		{
			keys.POST("", middleware.OptionalAuth(apiKeyRepo), apiKeyHandler.CreateKey)
			keys.GET("", middleware.Auth(apiKeyRepo), apiKeyHandler.ListKeys)
			keys.DELETE("/:id", middleware.Auth(apiKeyRepo), apiKeyHandler.DeleteKey)
		}
	}

	if adminHandler != nil {
		admin := base.Group("/admin")
		admin.Use(middleware.Auth(apiKeyRepo), middleware.RequireAdmin())
		{
			admin.GET("/keys", adminHandler.ListKeys)
			admin.POST("/keys", apiKeyHandler.CreateKey)
			admin.DELETE("/keys/:id", adminHandler.DeleteKey)
		}
	}

	r.GET("/:code", linkHandler.RedirectLink)
}

