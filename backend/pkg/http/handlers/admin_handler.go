package handlers

import (
	"net/http"
	"time"

	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	userRepo    repositories.UserRepository
	profileRepo repositories.ProfileRepository
	linkRepo    repositories.ProfileLinkRepository
}

func NewAdminHandler(
	userRepo repositories.UserRepository,
	profileRepo repositories.ProfileRepository,
	linkRepo repositories.ProfileLinkRepository,
) *AdminHandler {
	return &AdminHandler{userRepo: userRepo, profileRepo: profileRepo, linkRepo: linkRepo}
}

func (h *AdminHandler) GetSystemStats(c *gin.Context) {
	var totalUsers int
	if users, err := h.userRepo.FindAll(); err == nil {
		totalUsers = len(users)
	}

	var totalProfiles int
	if profiles, err := h.profileRepo.FindAll(); err == nil {
		totalProfiles = len(profiles)
	}

	var totalLinks int64
	if count, err := h.linkRepo.CountAll(); err == nil {
		totalLinks = count
	}

	c.JSON(http.StatusOK, gin.H{
		"systemStatus":  "Operational",
		"dbStatus":      "Connected",
		"totalUsers":    totalUsers,
		"totalProfiles": totalProfiles,
		"totalLinks":    totalLinks,
		"timestamp":     time.Now().Format(time.RFC3339),
	})
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	users, err := h.userRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list users"})
		return
	}

	type userDTO struct {
		ID        uuid.UUID `json:"id"`
		Email     string    `json:"email"`
		Role      string    `json:"role"`
		CreatedAt time.Time `json:"createdAt"`
	}

	dtos := make([]userDTO, 0, len(users))
	for _, u := range users {
		dtos = append(dtos, userDTO{ID: u.ID, Email: u.Email, Role: u.Role, CreatedAt: u.CreatedAt})
	}

	c.JSON(http.StatusOK, dtos)
}
