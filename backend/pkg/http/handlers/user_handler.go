package handlers

import (
	"errors"
	"net/http"
	"os"
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

	role := "user"
	adminEmail := os.Getenv("ADMIN_INITIAL_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@wsio.lol"
	}
	if strings.EqualFold(email, adminEmail) {
		role = "admin"
	}

	user := &domain.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(passwordHash),
		Role:         role,
	}

	if err := h.repository.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create user",
		})
		return
	}

	token, err := auth.NewToken(user.ID, user.Role)
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
		"role":  user.Role,
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

	// Auto promote to admin if matches ADMIN_INITIAL_EMAIL
	adminEmail := os.Getenv("ADMIN_INITIAL_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@wsio.lol"
	}
	if strings.EqualFold(user.Email, adminEmail) && user.Role != "admin" {
		user.Role = "admin"
	}

	token, err := auth.NewToken(user.ID, user.Role)
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
		"role":  user.Role,
	})
}

func (h *UserHandler) Me(c *gin.Context) {
	val, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := val.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, err := h.repository.FindByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	})
}

// Logout clears the session cookie. It is intentionally unauthenticated and
// idempotent — calling it without (or with an expired) session still succeeds.
func (h *UserHandler) Logout(c *gin.Context) {
	clearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func sessionCookieDomain(c *gin.Context) string {
	if domain := os.Getenv("COOKIE_DOMAIN"); domain != "" {
		return domain
	}
	if strings.Contains(c.Request.Host, "wsio.lol") {
		return ".wsio.lol"
	}
	return ""
}

func setSessionCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("session", token, 60*60*24, "/", sessionCookieDomain(c), true, true)
}

// clearSessionCookie writes an already-expired cookie with the same attributes
// setSessionCookie uses, so the browser drops it.
func clearSessionCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("session", "", -1, "/", sessionCookieDomain(c), true, true)
}
