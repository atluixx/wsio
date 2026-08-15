package handlers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	urlutil "github.com/atluixx/wsio/pkg/url"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type LinkHandler struct {
	repository    repositories.LinkRepository
	analyticsRepo repositories.AnalyticsRepository
}

func NewLinkHandler(repository repositories.LinkRepository, analyticsRepo ...repositories.AnalyticsRepository) *LinkHandler {
	var aRepo repositories.AnalyticsRepository
	if len(analyticsRepo) > 0 {
		aRepo = analyticsRepo[0]
	}
	return &LinkHandler{
		repository:    repository,
		analyticsRepo: aRepo,
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

	resp := gin.H{
		"id":   link.ID,
		"code": link.Code,
		"url":  link.URL,
	}
	if link.UserID != nil {
		resp["userId"] = link.UserID.String()
	}

	c.JSON(http.StatusCreated, resp)
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

	// Extract referrer from HTTP header or query parameters (?ref=..., ?utm_source=..., ?referrer=...)
	referrer := c.GetHeader("Referer")
	if referrer == "" {
		if customRef := c.Query("ref"); customRef != "" {
			referrer = customRef
		} else if utmSource := c.Query("utm_source"); utmSource != "" {
			referrer = utmSource
		} else if queryRef := c.Query("referrer"); queryRef != "" {
			referrer = queryRef
		}
	}

	// Record click asynchronously if analytics repository is available
	if h.analyticsRepo != nil {
		go func(lID uuid.UUID, cCode, ref, ua, ip string) {
			_ = h.analyticsRepo.RecordClick(&domain.LinkClick{
				ID:        uuid.New(),
				LinkID:    lID,
				Code:      cCode,
				Referrer:  ref,
				UserAgent: ua,
				IP:        ip,
				Timestamp: time.Now(),
			})
		}(link.ID, link.Code, referrer, c.GetHeader("User-Agent"), c.ClientIP())
	}

	if c.Query("json") == "true" || strings.Contains(c.GetHeader("Accept"), "application/json") {
		resp := gin.H{
			"id":   link.ID,
			"code": link.Code,
			"url":  link.URL,
		}
		if link.UserID != nil {
			resp["userId"] = link.UserID.String()
		}
		c.JSON(http.StatusOK, resp)
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
