package main

import (
	"log"
	"os"

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

	linkRepository := repositories.NewLinkRepository(db)
	userRepository := repositories.NewUserRepository(db)

	linkHandler := handlers.NewLinkHandler(linkRepository)
	userHandler := handlers.NewUserHandler(userRepository)

	app.SetupRoutes(router, linkHandler, userHandler)

	if err := router.Run(); err != nil {
		log.Fatalf("failed to start the API: %s", err)
	}
}
