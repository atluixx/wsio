package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	urlutil "github.com/atluixx/wsio/pkg/url"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type LinkHandler struct {
	repository repositories.LinkRepository
}

func NewLinkHandler(repository repositories.LinkRepository) *LinkHandler {
	return &LinkHandler{
		repository: repository,
	}
}

func (h *LinkHandler) NewLink(c *gin.Context) {
	var request domain.CreateLinkRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid URL",
		})
		return
	}

	userID, err := getUserID(c)
	var userPtr *uuid.UUID
	if err == nil && userID != uuid.Nil {
		userPtr = &userID
	}

	normalized, err := urlutil.Normalize(request.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid URL",
		})
		return
	}

	code := urlutil.Hash(normalized)
	if existing, err := h.repository.FindByCode(code); err == nil && existing != nil && existing.URL != normalized {
		code = urlutil.Hash(normalized + uuid.New().String())
	}

	link := &domain.Link{
		ID:     uuid.New(),
		UserID: userPtr,
		Code:   code,
		URL:    normalized,
	}

	if err := h.repository.Create(link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create link",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":   link.ID,
		"code": link.Code,
		"url":  link.URL,
	})
}

func (h *LinkHandler) RedirectLink(c *gin.Context) {
	code := strings.TrimSpace(c.Param("code"))

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid link code",
		})
		return
	}

	link, err := h.repository.FindByCode(code)
	if err != nil {
		if errors.Is(err, repositories.ErrLinkNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "link not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to find link",
		})
		return
	}

	c.Redirect(http.StatusFound, link.URL)
}

func (h *LinkHandler) DeleteLink(c *gin.Context) {
	code := strings.TrimSpace(c.Param("code"))

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid link code",
		})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	link, err := h.repository.FindByCodeAndUser(code, userID)
	if err != nil {
		if errors.Is(err, repositories.ErrLinkNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "link not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to find link",
		})
		return
	}

	if err := h.repository.Delete(link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete link",
		})
		return
	}

	c.Status(http.StatusNoContent)
}

func getUserID(c *gin.Context) (uuid.UUID, error) {
	value, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, errors.New("user ID not found")
	}

	userID, ok := value.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return uuid.Nil, errors.New("invalid user ID")
	}

	return userID, nil
}
