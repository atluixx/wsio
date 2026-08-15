package handlers

import (
	"net/http"

	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	apiKeyRepo repositories.ApiKeyRepository
	userRepo   repositories.UserRepository
}

func NewAdminHandler(apiKeyRepo repositories.ApiKeyRepository, userRepo repositories.UserRepository) *AdminHandler {
	return &AdminHandler{
		apiKeyRepo: apiKeyRepo,
		userRepo:   userRepo,
	}
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
