package handler

import (
	"log"
	"net/http"
	"os"

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
)

func init() {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = os.Getenv("DATABASE_URL")
	}

	if dsn != "" {
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			_ = db.AutoMigrate(&domain.User{}, &domain.Link{}, &domain.LinkClick{}, &domain.UserSubscription{}, &domain.GuestUsageTrack{})
			userRepo = repositories.NewUserRepository(db)
			linkRepo = repositories.NewLinkRepository(db)
			analyticsRepo = repositories.NewAnalyticsRepository(db)
			log.Println("Initialized PostgreSQL database repositories")
			return
		}
		log.Printf("Failed to connect to PostgreSQL DSN: %v, falling back to memory repository", err)
	}

	userRepo = repositories.NewInMemoryUserRepository()
	linkRepo = repositories.NewInMemoryLinkRepository()
	analyticsRepo = repositories.NewInMemoryAnalyticsRepository()
	log.Println("Initialized In-Memory repositories fallback")
}

func Handler(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "*")
	}

	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, X-User-ID")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Set-Cookie")
	w.Header().Set("Vary", "Origin")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	userHandler := handlers.NewUserHandler(userRepo)
	linkHandler := handlers.NewLinkHandler(linkRepo, analyticsRepo)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsRepo, linkRepo)

	app.SetupRoutes(router, linkHandler, userHandler, analyticsHandler, analyticsRepo)

	router.ServeHTTP(w, r)
}
