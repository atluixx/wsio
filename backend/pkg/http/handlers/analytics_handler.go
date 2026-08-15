package handlers

import (
	"net/http"
	"strings"

	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	analyticsRepo repositories.AnalyticsRepository
	linkRepo      repositories.LinkRepository
}

func NewAnalyticsHandler(analyticsRepo repositories.AnalyticsRepository, linkRepo repositories.LinkRepository) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsRepo: analyticsRepo,
		linkRepo:      linkRepo,
	}
}

func (h *AnalyticsHandler) GetAnalytics(c *gin.Context) {
	code := strings.TrimSpace(c.Param("code"))
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid link code",
		})
		return
	}

	stats, err := h.analyticsRepo.GetAnalyticsByCode(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch analytics",
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}
