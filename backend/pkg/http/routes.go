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
	base := r.Group("/api/v1")

	auth := base.Group("/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
	}

	links := base.Group("/links")
	{
		links.GET("/:code", linkHandler.RedirectLink)

		protected := links.Group("")
		protected.Use(middleware.Auth())

		protected.POST("", linkHandler.NewLink)
		protected.DELETE("/:code", linkHandler.DeleteLink)
	}
}
