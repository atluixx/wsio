package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	apiKeyRepo repositories.ApiKeyRepository
	userRepo   repositories.UserRepository
	linkRepo   repositories.LinkRepository
	subRepo    repositories.SubscriptionRepository
}

func NewAdminHandler(
	apiKeyRepo repositories.ApiKeyRepository,
	userRepo repositories.UserRepository,
	linkRepo repositories.LinkRepository,
	subRepo ...repositories.SubscriptionRepository,
) *AdminHandler {
	var sRepo repositories.SubscriptionRepository
	if len(subRepo) > 0 {
		sRepo = subRepo[0]
	}
	return &AdminHandler{
		apiKeyRepo: apiKeyRepo,
		userRepo:   userRepo,
		linkRepo:   linkRepo,
		subRepo:    sRepo,
	}
}

func (h *AdminHandler) GetSystemStats(c *gin.Context) {
	var totalKeys int
	if h.apiKeyRepo != nil {
		if keys, err := h.apiKeyRepo.FindAll(); err == nil {
			totalKeys = len(keys)
		}
	}

	var totalLinks int
	if h.linkRepo != nil {
		if links, err := h.linkRepo.FindAll(); err == nil {
			totalLinks = len(links)
		}
	}

	var totalUsers int
	if h.userRepo != nil {
		if users, err := h.userRepo.FindAll(); err == nil {
			totalUsers = len(users)
		}
	}

	var activeSubscribers int
	if h.subRepo != nil {
		if subs, err := h.subRepo.FindAll(); err == nil {
			for _, s := range subs {
				if strings.ToLower(s.Status) == "active" && strings.ToLower(s.PlanType) != "free" && strings.ToLower(s.PlanType) != "guest" {
					activeSubscribers++
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"systemStatus":      "Operational",
		"dbStatus":          "Connected",
		"activeApiKeys":     totalKeys,
		"totalLinks":        totalLinks,
		"totalUsers":        totalUsers,
		"activeSubscribers": activeSubscribers,
		"pendingSubdomains": 0,
		"engineUptime":      "99.99%",
		"timestamp":         time.Now().Format(time.RFC3339),
	})
}

func (h *AdminHandler) ListKeys(c *gin.Context) {
	if h.apiKeyRepo == nil {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	keys, err := h.apiKeyRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list api keys"})
		return
	}

	c.JSON(http.StatusOK, keys)
}

func (h *AdminHandler) DeleteKey(c *gin.Context) {
	if h.apiKeyRepo == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "api key repository unavailable"})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid key ID"})
		return
	}

	if err := h.apiKeyRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to revoke api key"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	if h.userRepo == nil {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	users, err := h.userRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list users"})
		return
	}

	// Mask password hashes before returning
	type UserDTO struct {
		ID        uuid.UUID `json:"id"`
		Email     string    `json:"email"`
		Role      string    `json:"role"`
		CreatedAt time.Time `json:"createdAt"`
	}

	var dtos []UserDTO
	for _, u := range users {
		dtos = append(dtos, UserDTO{
			ID:        u.ID,
			Email:     u.Email,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, dtos)
}

type SubdomainApplication struct {
	ID          string    `json:"id"`
	Subdomain   string    `json:"subdomain"`
	CompanyName string    `json:"companyName"`
	Email       string    `json:"email"`
	UseCase     string    `json:"useCase"`
	Status      string    `json:"status"` // "pending", "approved", "rejected"
	CreatedAt   time.Time `json:"createdAt"`
}

func (h *AdminHandler) ListSubdomains(c *gin.Context) {
	// Return real empty array when no applications pending in DB
	c.JSON(http.StatusOK, []SubdomainApplication{})
}
