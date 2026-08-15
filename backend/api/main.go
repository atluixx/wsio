package handler

import (
	"log"
	"net/http"
	"os"
	"strings"

	app "github.com/atluixx/wsio/pkg/http"
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)


var (
	userRepo      repositories.UserRepository
	linkRepo      repositories.LinkRepository
	analyticsRepo repositories.AnalyticsRepository
	apiKeyRepo    repositories.ApiKeyRepository
)

func init() {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = os.Getenv("DATABASE_URL")
	}

	if dsn != "" {
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			_ = db.AutoMigrate(&domain.User{}, &domain.Link{}, &domain.LinkClick{}, &domain.UserSubscription{}, &domain.GuestUsageTrack{}, &domain.ApiKey{})
			userRepo = repositories.NewUserRepository(db)
			linkRepo = repositories.NewLinkRepository(db)
			analyticsRepo = repositories.NewAnalyticsRepository(db)
			apiKeyRepo = repositories.NewPostgresApiKeyRepository(db)
			log.Println("Initialized PostgreSQL database repositories")
			return
		}
		log.Printf("Failed to connect to PostgreSQL DSN: %v, falling back to memory repository", err)
	}

	userRepo = repositories.NewInMemoryUserRepository()
	linkRepo = repositories.NewInMemoryLinkRepository()
	analyticsRepo = repositories.NewInMemoryAnalyticsRepository()
	apiKeyRepo = repositories.NewInMemoryApiKeyRepository()
	log.Println("Initialized In-Memory repositories fallback")
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// Fix Vercel Next.js rewrite path normalization
	if pathParam := r.URL.Query().Get("path"); pathParam != "" {
		r.URL.Path = "/api/v1/" + strings.TrimPrefix(pathParam, "/")
	} else if strings.HasPrefix(r.URL.Path, "/api/main") {
		r.URL.Path = strings.Replace(r.URL.Path, "/api/main.go", "/api/v1", 1)
		r.URL.Path = strings.Replace(r.URL.Path, "/api/main", "/api/v1", 1)
	}

	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())


	userHandler := handlers.NewUserHandler(userRepo)
	linkHandler := handlers.NewLinkHandler(linkRepo, analyticsRepo)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsRepo, linkRepo)
	stripeHandler := handlers.NewStripeHandler()
	apiKeyHandler := handlers.NewApiKeyHandler(apiKeyRepo)
	adminHandler := handlers.NewAdminHandler(apiKeyRepo, userRepo)

	app.SetupRoutes(router, linkHandler, userHandler, analyticsHandler, analyticsRepo, apiKeyRepo, stripeHandler, apiKeyHandler, adminHandler)

	router.ServeHTTP(w, r)
}

