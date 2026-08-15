package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ApiKeyHandler struct {
	repository repositories.ApiKeyRepository
}

func NewApiKeyHandler(repository repositories.ApiKeyRepository) *ApiKeyHandler {
	return &ApiKeyHandler{repository: repository}
}

type CreateApiKeyRequest struct {
	Name     string `json:"name" binding:"required"`
	PlanType string `json:"planType"` // "guest", "starter", "diamond"
}

func generateRandomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func computeSHA256(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func (h *ApiKeyHandler) CreateKey(c *gin.Context) {
	var req CreateApiKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	val, exists := c.Get("userID")
	var userPtr *uuid.UUID
	if exists {
		if uid, ok := val.(uuid.UUID); ok && uid != uuid.Nil {
			userPtr = &uid
		}
	}

	plan := strings.ToLower(strings.TrimSpace(req.PlanType))
	if plan == "" {
		if userPtr != nil {
			plan = "starter"
		} else {
			plan = "guest"
		}
	}

	// Calculate expiration based on plan
	var expirationDuration time.Duration
	switch plan {
	case "diamond", "pro":
		expirationDuration = 365 * 24 * time.Hour // 365 days
	case "starter":
		expirationDuration = 90 * 24 * time.Hour  // 90 days
	default:
		expirationDuration = 7 * 24 * time.Hour   // 7 days (guest)
	}

	rawSecret := "wsio_live_" + generateRandomHex(16)
	hashed := computeSHA256(rawSecret)
	masked := "wsio_live_..." + rawSecret[len(rawSecret)-6:]

	expiresAt := time.Now().Add(expirationDuration)

	apiKey := &domain.ApiKey{
		ID:        uuid.New(),
		UserID:    userPtr,
		KeyHash:   hashed,
		KeyMasked: masked,
		Name:      strings.TrimSpace(req.Name),
		PlanType:  plan,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now(),
	}

	if err := h.repository.Create(apiKey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create api key"})
		return
	}

	// Plaintext key returned ONCE in the creation response
	c.JSON(http.StatusCreated, gin.H{
		"id":        apiKey.ID,
		"key":       rawSecret,
		"keyMasked": apiKey.KeyMasked,
		"name":      apiKey.Name,
		"planType":  apiKey.PlanType,
		"expiresAt": apiKey.ExpiresAt,
		"createdAt": apiKey.CreatedAt,
		"message":   "Save this API key safely! It will NOT be shown again.",
	})
}

func (h *ApiKeyHandler) ListKeys(c *gin.Context) {
	val, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	userID, ok := val.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	keys, err := h.repository.FindByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch api keys"})
		return
	}

	c.JSON(http.StatusOK, keys)
}

func (h *ApiKeyHandler) DeleteKey(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid key ID"})
		return
	}

	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to revoke api key"})
		return
	}

	c.Status(http.StatusNoContent)
}
