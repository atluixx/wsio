package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReportHandler struct {
	reports  repositories.ProfileReportRepository
	profiles repositories.ProfileRepository
}

func NewReportHandler(
	reports repositories.ProfileReportRepository,
	profiles repositories.ProfileRepository,
) *ReportHandler {
	return &ReportHandler{reports: reports, profiles: profiles}
}

// Submit records a public report against a profile. It always answers 202 so a
// reporter can't probe which usernames exist or whether a duplicate was kept.
func (h *ReportHandler) Submit(c *gin.Context) {
	username := repositories.NormalizeUsername(c.Param("username"))

	var req domain.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	reason := strings.ToLower(strings.TrimSpace(req.Reason))
	if !domain.ReportReasons[reason] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unknown reason"})
		return
	}

	profile, err := h.profiles.FindByUsername(username)
	if err != nil {
		c.JSON(http.StatusAccepted, gin.H{"ok": true})
		return
	}

	ip := c.ClientIP()
	if recent, _ := h.reports.CountRecentByReporter(profile.ID, ip, time.Now().Add(-24*time.Hour)); recent >= 3 {
		c.JSON(http.StatusAccepted, gin.H{"ok": true})
		return
	}

	_ = h.reports.Create(&domain.ProfileReport{
		ID:         uuid.New(),
		ProfileID:  profile.ID,
		Username:   profile.Username,
		Reason:     reason,
		Details:    clip(strings.TrimSpace(req.Details), 1000),
		Status:     "open",
		ReporterIP: ip,
		UserAgent:  clip(c.GetHeader("User-Agent"), 300),
		CreatedAt:  time.Now(),
	})
	c.JSON(http.StatusAccepted, gin.H{"ok": true})
}

// List returns reports for the admin console, newest first.
func (h *ReportHandler) List(c *gin.Context) {
	status := strings.ToLower(strings.TrimSpace(c.Query("status")))
	if status != "" && !domain.ReportStatuses[status] {
		status = ""
	}
	reports, err := h.reports.List(status, 200)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list reports"})
		return
	}
	open, _ := h.reports.CountByStatus("open")
	c.JSON(http.StatusOK, gin.H{"reports": reports, "openCount": open})
}

// Update triages a single report.
func (h *ReportHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report id"})
		return
	}
	var req domain.UpdateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	status := strings.ToLower(strings.TrimSpace(req.Status))
	if !domain.ReportStatuses[status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unknown status"})
		return
	}
	if err := h.reports.UpdateStatus(id, status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update report"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func clip(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}
