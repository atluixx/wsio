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
	userRepo repositories.UserRepository
	linkRepo repositories.LinkRepository
)

func init() {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = os.Getenv("DATABASE_URL")
	}

	if dsn != "" {
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			_ = db.AutoMigrate(&domain.User{}, &domain.Link{})
			userRepo = repositories.NewUserRepository(db)
			linkRepo = repositories.NewLinkRepository(db)
			log.Println("Initialized PostgreSQL database repositories")
			return
		}
		log.Printf("Failed to connect to PostgreSQL DSN: %v, falling back to memory repository", err)
	}

	userRepo = repositories.NewInMemoryUserRepository()
	linkRepo = repositories.NewInMemoryLinkRepository()
	log.Println("Initialized In-Memory repositories fallback")
}

func Handler(w http.ResponseWriter, r *http.Request) {
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(gin.Recovery())

	userHandler := handlers.NewUserHandler(userRepo)
	linkHandler := handlers.NewLinkHandler(linkRepo)

	app.SetupRoutes(router, linkHandler, userHandler)

	router.ServeHTTP(w, r)
}
