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

	var (
		userRepo      repositories.UserRepository
		profileRepo   repositories.ProfileRepository
		linkRepo      repositories.ProfileLinkRepository
		analyticsRepo repositories.ProfileAnalyticsRepository
	)

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("DATABASE_DSN")
	}

	if db := openDB(dsn); db != nil {
		_ = db.AutoMigrate(
			&domain.User{},
			&domain.Profile{},
			&domain.ProfileLink{},
			&domain.ProfileLinkClick{},
			&domain.ProfileView{},
		)
		userRepo = repositories.NewUserRepository(db)
		profileRepo = repositories.NewProfileRepository(db)
		linkRepo = repositories.NewProfileLinkRepository(db)
		analyticsRepo = repositories.NewProfileAnalyticsRepository(db)
		log.Println("using PostgreSQL repositories")
	} else {
		userRepo = repositories.NewInMemoryUserRepository()
		profileRepo = repositories.NewInMemoryProfileRepository()
		linkRepo = repositories.NewInMemoryProfileLinkRepository()
		analyticsRepo = repositories.NewInMemoryProfileAnalyticsRepository()
		log.Println("DATABASE_URL not set / unreachable — using in-memory repositories (data is not persisted)")
	}

	userHandler := handlers.NewUserHandler(userRepo)
	profileHandler := handlers.NewProfileHandler(profileRepo, linkRepo, analyticsRepo)
	adminHandler := handlers.NewAdminHandler(userRepo, profileRepo, linkRepo)

	app.SetupRoutes(router, userHandler, profileHandler, adminHandler)

	if err := router.Run(); err != nil {
		log.Fatalf("failed to start the API: %s", err)
	}
}

func openDB(dsn string) *gorm.DB {
	if dsn == "" {
		return nil
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("failed to open database: %s", err)
		return nil
	}
	return db
}
