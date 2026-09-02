package handler

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/atluixx/wsio/pkg/domain"
	app "github.com/atluixx/wsio/pkg/http"
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	userRepo             repositories.UserRepository
	profileRepo          repositories.ProfileRepository
	profileLinkRepo      repositories.ProfileLinkRepository
	profileAnalyticsRepo repositories.ProfileAnalyticsRepository
	profileReportRepo    repositories.ProfileReportRepository
)

func init() {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = os.Getenv("DATABASE_URL")
	}

	if dsn != "" {
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			_ = db.AutoMigrate(
				&domain.User{},
				&domain.Profile{},
				&domain.ProfileLink{},
				&domain.ProfileLinkClick{},
				&domain.ProfileView{},
				&domain.ProfileReport{},
			)
			userRepo = repositories.NewUserRepository(db)
			profileRepo = repositories.NewProfileRepository(db)
			profileLinkRepo = repositories.NewProfileLinkRepository(db)
			profileAnalyticsRepo = repositories.NewProfileAnalyticsRepository(db)
			profileReportRepo = repositories.NewProfileReportRepository(db)
			log.Println("Initialized PostgreSQL database repositories")
			return
		}
		log.Printf("Failed to connect to PostgreSQL DSN: %v, falling back to memory repository", err)
	}

	userRepo = repositories.NewInMemoryUserRepository()
	profileRepo = repositories.NewInMemoryProfileRepository()
	profileLinkRepo = repositories.NewInMemoryProfileLinkRepository()
	profileAnalyticsRepo = repositories.NewInMemoryProfileAnalyticsRepository()
	profileReportRepo = repositories.NewInMemoryProfileReportRepository()
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
	profileHandler := handlers.NewProfileHandler(profileRepo, profileLinkRepo, profileAnalyticsRepo)
	adminHandler := handlers.NewAdminHandler(userRepo, profileRepo, profileLinkRepo)
	reportHandler := handlers.NewReportHandler(profileReportRepo, profileRepo)

	app.SetupRoutes(router, userHandler, profileHandler, adminHandler, reportHandler)

	router.ServeHTTP(w, r)
}
