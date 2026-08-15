package main

import (
	"log"
	"os"

	"github.com/atluixx/wsio/pkg/domain"
	app "github.com/atluixx/wsio/pkg/http"
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found")
	}

	router := gin.Default()

	db, err := gorm.Open(
		postgres.Open(os.Getenv("DATABASE_URL")),
		&gorm.Config{},
	)

	if err != nil {
		log.Fatalf("failed to open database: %s", err)
	}

	_ = db.AutoMigrate(&domain.User{}, &domain.Link{}, &domain.LinkClick{}, &domain.UserSubscription{}, &domain.GuestUsageTrack{}, &domain.ApiKey{})

	linkRepository := repositories.NewLinkRepository(db)
	userRepository := repositories.NewUserRepository(db)
	analyticsRepository := repositories.NewAnalyticsRepository(db)
	apiKeyRepository := repositories.NewPostgresApiKeyRepository(db)

	linkHandler := handlers.NewLinkHandler(linkRepository, analyticsRepository)
	userHandler := handlers.NewUserHandler(userRepository)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsRepository, linkRepository)
	stripeHandler := handlers.NewStripeHandler()
	apiKeyHandler := handlers.NewApiKeyHandler(apiKeyRepository)
	adminHandler := handlers.NewAdminHandler(apiKeyRepository, userRepository)

	app.SetupRoutes(router, linkHandler, userHandler, analyticsHandler, analyticsRepository, apiKeyRepository, stripeHandler, apiKeyHandler, adminHandler)

	if err := router.Run(); err != nil {
		log.Fatalf("failed to start the API: %s", err)
	}
}

