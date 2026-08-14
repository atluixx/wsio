package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/atluixx/wsio/pkg/auth"
	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	repository repositories.UserRepository
}

func NewUserHandler(repository repositories.UserRepository) *UserHandler {
	return &UserHandler{
		repository: repository,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *UserHandler) Register(c *gin.Context) {
	var request RegisterRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(request.Email))

	_, err := h.repository.FindByEmail(email)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "email already registered",
		})
		return
	}

	if !errors.Is(err, repositories.ErrUserNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to check user",
		})
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to process password",
		})
		return
	}

	user := &domain.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(passwordHash),
	}

	if err := h.repository.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create user",
		})
		return
	}

	token, err := auth.NewToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create session",
		})
		return
	}

	setSessionCookie(c, token)

	c.JSON(http.StatusCreated, gin.H{
		"id":    user.ID,
		"email": user.Email,
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	var request LoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(request.Email))

	user, err := h.repository.FindByEmail(email)

	if errors.Is(err, repositories.ErrUserNotFound) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to find user",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(request.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}

	token, err := auth.NewToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create session",
		})
		return
	}

	setSessionCookie(c, token)

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": user.Email,
	})
}

func setSessionCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteLaxMode)

	c.SetCookie(
		"session",
		token,
		60*60*24,
		"/",
		"",
		true,
		true,
	)
}
