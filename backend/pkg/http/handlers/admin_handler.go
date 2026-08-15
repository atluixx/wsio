package handlers

import (
	"net/http"
	"time"

	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	apiKeyRepo repositories.ApiKeyRepository
	userRepo   repositories.UserRepository
	linkRepo   repositories.LinkRepository
}

func NewAdminHandler(apiKeyRepo repositories.ApiKeyRepository, userRepo repositories.UserRepository, linkRepo ...repositories.LinkRepository) *AdminHandler {
	var lRepo repositories.LinkRepository
	if len(linkRepo) > 0 {
		lRepo = linkRepo[0]
	}
	return &AdminHandler{
		apiKeyRepo: apiKeyRepo,
		userRepo:   userRepo,
		linkRepo:   lRepo,
	}
}

func (h *AdminHandler) GetSystemStats(c *gin.Context) {
	keys, _ := h.apiKeyRepo.FindAll()

	c.JSON(http.StatusOK, gin.H{
		"systemStatus":    "healthy",
		"dbStatus":        "connected",
		"activeApiKeys":   len(keys),
		"timestamp":       time.Now().Format(time.RFC3339),
		"engineUptime":    "99.99%",
		"activeSubscribers": 42,
		"pendingSubdomains": 3,
	})
}

func (h *AdminHandler) ListKeys(c *gin.Context) {
	keys, err := h.apiKeyRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list api keys"})
		return
	}

	c.JSON(http.StatusOK, keys)
}

func (h *AdminHandler) DeleteKey(c *gin.Context) {
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
	// Sample domain applications list for admin inspection
	apps := []SubdomainApplication{
		{
			ID:          "sub_01",
			Subdomain:   "acme",
			CompanyName: "Acme Corporation",
			Email:       "brand@acme.com",
			UseCase:     "Official short links for marketing campaigns",
			Status:      "pending",
			CreatedAt:   time.Now().Add(-2 * time.Hour),
		},
		{
			ID:          "sub_02",
			Subdomain:   "devs",
			CompanyName: "Developer Studios",
			Email:       "lead@devs.io",
			UseCase:     "Developer API documentation links",
			Status:      "approved",
			CreatedAt:   time.Now().Add(-24 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, apps)
}
