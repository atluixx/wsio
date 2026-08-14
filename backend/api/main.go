package handler

import (
	"net/http"
	"os"

	app "github.com/atluixx/wsio/pkg/http"
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(gin.Recovery())

	db, err := gorm.Open(
		postgres.Open(os.Getenv("DATABASE_URL")),
		&gorm.Config{},
	)

	if err != nil {
		http.Error(w, "database connection failed", http.StatusInternalServerError)
		return
	}

	linkRepository := repositories.NewLinkRepository(db)
	userRepository := repositories.NewUserRepository(db)

	linkHandler := handlers.NewLinkHandler(linkRepository)
	userHandler := handlers.NewUserHandler(userRepository)

	app.SetupRoutes(router, linkHandler, userHandler)

	router.ServeHTTP(w, r)
}
