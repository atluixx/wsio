package handlers

import (
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	urlutil "github.com/atluixx/wsio/pkg/url"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const maxLinksPerProfile = 50

var usernamePattern = regexp.MustCompile(`^[a-z0-9_-]{2,32}$`)

var allowedThemes = map[string]bool{
	"minimal":  true,
	"midnight": true,
	"paper":    true,
	"sunset":   true,
}

// reservedUsernames cannot be claimed because they collide with app routes or
// are otherwise confusing as a public handle.
var reservedUsernames = map[string]bool{
	"api": true, "admin": true, "dashboard": true, "login": true, "register": true,
	"logout": true, "settings": true, "profile": true, "me": true, "pricing": true,
	"privacy": true, "terms": true, "about": true, "help": true, "support": true,
	"contact": true, "blog": true, "docs": true, "static": true, "assets": true,
	"public": true, "_next": true, "favicon.ico": true, "robots.txt": true,
	"sitemap.xml": true, "l": true, "u": true, "go": true, "click": true,
	"www": true, "app": true, "mail": true, "null": true, "undefined": true,
}

type ProfileHandler struct {
	profiles  repositories.ProfileRepository
	links     repositories.ProfileLinkRepository
	analytics repositories.ProfileAnalyticsRepository
}

func NewProfileHandler(
	profiles repositories.ProfileRepository,
	links repositories.ProfileLinkRepository,
	analytics repositories.ProfileAnalyticsRepository,
) *ProfileHandler {
	return &ProfileHandler{profiles: profiles, links: links, analytics: analytics}
}

// --- response DTOs ---

type publicLinkDTO struct {
	ID    uuid.UUID `json:"id"`
	Label string    `json:"label"`
	URL   string    `json:"url"`
	Icon  string    `json:"icon,omitempty"`
}

type publicProfileDTO struct {
	Username         string          `json:"username"`
	DisplayName      string          `json:"displayName"`
	Bio              string          `json:"bio"`
	AvatarURL        string          `json:"avatarUrl"`
	Theme            string          `json:"theme"`
	DiscordUserID    string          `json:"discordUserId"`
	UseDiscordAvatar bool            `json:"useDiscordAvatar"`
	Links            []publicLinkDTO `json:"links"`
}

type ownerLinkDTO struct {
	ID       uuid.UUID `json:"id"`
	Label    string    `json:"label"`
	URL      string    `json:"url"`
	Icon     string    `json:"icon,omitempty"`
	Position int       `json:"position"`
	Active   bool      `json:"active"`
}

type ownerProfileDTO struct {
	ID               uuid.UUID      `json:"id"`
	Username         string         `json:"username"`
	DisplayName      string         `json:"displayName"`
	Bio              string         `json:"bio"`
	AvatarURL        string         `json:"avatarUrl"`
	Theme            string         `json:"theme"`
	DiscordUserID    string         `json:"discordUserId"`
	UseDiscordAvatar bool           `json:"useDiscordAvatar"`
	Links            []ownerLinkDTO `json:"links"`
}

func toOwnerLinkDTO(l *domain.ProfileLink) ownerLinkDTO {
	return ownerLinkDTO{
		ID:       l.ID,
		Label:    l.Label,
		URL:      l.URL,
		Icon:     l.Icon,
		Position: l.Position,
		Active:   l.Active,
	}
}

// --- public endpoints ---

// GetPublicProfile serves a profile and its visible links for the public page,
// and records a page view.
func (h *ProfileHandler) GetPublicProfile(c *gin.Context) {
	username := repositories.NormalizeUsername(c.Param("username"))

	profile, err := h.profiles.FindByUsername(username)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load profile"})
		return
	}

	links, err := h.links.ListByProfile(profile.ID, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load links"})
		return
	}

	if c.Query("track") != "false" {
		_ = h.analytics.RecordView(&domain.ProfileView{
			ID:        uuid.New(),
			ProfileID: profile.ID,
			Referrer:  extractReferrer(c),
			UserAgent: c.GetHeader("User-Agent"),
			IP:        c.ClientIP(),
			Timestamp: time.Now(),
		})
	}

	out := publicProfileDTO{
		Username:         profile.Username,
		DisplayName:      profile.DisplayName,
		Bio:              profile.Bio,
		AvatarURL:        profile.AvatarURL,
		Theme:            profile.Theme,
		DiscordUserID:    profile.DiscordUserID,
		UseDiscordAvatar: profile.UseDiscordAvatar,
		Links:            make([]publicLinkDTO, 0, len(links)),
	}
	for _, l := range links {
		out.Links = append(out.Links, publicLinkDTO{ID: l.ID, Label: l.Label, URL: l.URL, Icon: l.Icon})
	}

	c.JSON(http.StatusOK, out)
}

// recordClick looks up an active link by the :id path param and stores a click
// event for it. It returns the link (for callers that need the destination) and
// ok=false after writing an error response.
func (h *ProfileHandler) recordClick(c *gin.Context) (*domain.ProfileLink, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid link id"})
		return nil, false
	}

	link, err := h.links.FindByID(id)
	if err != nil || !link.Active {
		c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
		return nil, false
	}

	_ = h.analytics.RecordClick(&domain.ProfileLinkClick{
		ID:            uuid.New(),
		ProfileLinkID: link.ID,
		ProfileID:     link.ProfileID,
		Referrer:      extractReferrer(c),
		UserAgent:     c.GetHeader("User-Agent"),
		IP:            c.ClientIP(),
		Timestamp:     time.Now(),
	})
	return link, true
}

// RecordClick stores a click and returns 204. Used by the public page's
// fire-and-forget beacon, so the link itself can point straight at its target.
func (h *ProfileHandler) RecordClick(c *gin.Context) {
	if _, ok := h.recordClick(c); !ok {
		return
	}
	c.Status(http.StatusNoContent)
}

// TrackAndRedirect records a click and 302s to the destination. Kept as the
// no-JavaScript / QR-code fallback path.
func (h *ProfileHandler) TrackAndRedirect(c *gin.Context) {
	link, ok := h.recordClick(c)
	if !ok {
		return
	}

	target := link.URL
	if target == "" {
		target = "/"
	}
	c.Redirect(http.StatusFound, target)
}

// --- owner endpoints (require middleware.Auth) ---

// GetMyProfile returns the current user's profile with every link, including
// hidden ones.
func (h *ProfileHandler) GetMyProfile(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	profile, err := h.profiles.FindByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "profile not found", "code": "no_profile"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load profile"})
		return
	}

	h.respondOwnerProfile(c, http.StatusOK, profile)
}

// UpsertMyProfile creates the current user's profile or edits it in place.
func (h *ProfileHandler) UpsertMyProfile(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req domain.UpsertProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	username := repositories.NormalizeUsername(req.Username)
	if !usernamePattern.MatchString(username) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username must be 2-32 characters, lowercase letters, numbers, hyphen or underscore"})
		return
	}
	if reservedUsernames[username] {
		c.JSON(http.StatusConflict, gin.H{"error": "that username is reserved"})
		return
	}

	taken, err := h.profiles.UsernameTaken(username, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check username"})
		return
	}
	if taken {
		c.JSON(http.StatusConflict, gin.H{"error": "username already taken"})
		return
	}

	theme := strings.ToLower(strings.TrimSpace(req.Theme))
	if !allowedThemes[theme] {
		theme = "minimal"
	}

	discordID := sanitizeDiscordID(req.DiscordUserID)

	avatarURL, err := sanitizeAvatarURL(req.AvatarURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing, err := h.profiles.FindByUserID(userID)
	switch {
	case errors.Is(err, repositories.ErrProfileNotFound):
		profile := &domain.Profile{
			ID:               uuid.New(),
			UserID:           userID,
			Username:         username,
			DisplayName:      strings.TrimSpace(req.DisplayName),
			Bio:              strings.TrimSpace(req.Bio),
			AvatarURL:        avatarURL,
			Theme:            theme,
			DiscordUserID:    discordID,
			UseDiscordAvatar: req.UseDiscordAvatar != nil && *req.UseDiscordAvatar,
		}
		if err := h.profiles.Create(profile); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create profile"})
			return
		}
		h.respondOwnerProfile(c, http.StatusCreated, profile)
	case err != nil:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load profile"})
	default:
		existing.Username = username
		existing.DisplayName = strings.TrimSpace(req.DisplayName)
		existing.Bio = strings.TrimSpace(req.Bio)
		existing.AvatarURL = avatarURL
		existing.Theme = theme
		existing.DiscordUserID = discordID
		if req.UseDiscordAvatar != nil {
			existing.UseDiscordAvatar = *req.UseDiscordAvatar
		}
		if err := h.profiles.Update(existing); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
			return
		}
		h.respondOwnerProfile(c, http.StatusOK, existing)
	}
}

var discordIDRe = regexp.MustCompile(`\d{15,25}`)

// sanitizeDiscordID accepts a raw ID, an <@id> mention, or empty.
func sanitizeDiscordID(raw string) string {
	return discordIDRe.FindString(raw)
}

// maxAvatarLen bounds an inline (data:) avatar — a ~400px square encodes well
// under this even before we account for base64's 4/3 overhead.
const maxAvatarLen = 700_000

var avatarDataRe = regexp.MustCompile(`^data:image/(?:png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=\s]+$`)

// sanitizeAvatarURL accepts an empty value, an http(s) URL, or an inline
// base64 image data URI within the size cap. Anything else is rejected so a
// hostile value can't reach an <img src>.
func sanitizeAvatarURL(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", nil
	}
	if len(raw) > maxAvatarLen {
		return "", errors.New("avatar image is too large — use a smaller one")
	}
	low := strings.ToLower(raw)
	if strings.HasPrefix(low, "http://") || strings.HasPrefix(low, "https://") {
		return raw, nil
	}
	if avatarDataRe.MatchString(raw) {
		return raw, nil
	}
	return "", errors.New("avatar must be an image file or an https link")
}

// CreateMyProfileLink appends a link to the current user's profile.
func (h *ProfileHandler) CreateMyProfileLink(c *gin.Context) {
	profile, ok := h.requireProfile(c)
	if !ok {
		return
	}

	var req domain.CreateProfileLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	normalized, err := urlutil.Normalize(req.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid URL"})
		return
	}

	count, err := h.links.CountByProfile(profile.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count links"})
		return
	}
	if count >= maxLinksPerProfile {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "link limit reached"})
		return
	}

	position, err := h.links.NextPosition(profile.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to place link"})
		return
	}

	link := &domain.ProfileLink{
		ID:        uuid.New(),
		ProfileID: profile.ID,
		Label:     strings.TrimSpace(req.Label),
		URL:       normalized,
		Icon:      strings.TrimSpace(req.Icon),
		Position:  position,
		Active:    true,
	}
	if err := h.links.Create(link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create link"})
		return
	}

	c.JSON(http.StatusCreated, toOwnerLinkDTO(link))
}

// UpdateMyProfileLink applies a partial update to one of the user's links.
func (h *ProfileHandler) UpdateMyProfileLink(c *gin.Context) {
	link, ok := h.requireOwnedLink(c)
	if !ok {
		return
	}

	var req domain.UpdateProfileLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Label != nil {
		link.Label = strings.TrimSpace(*req.Label)
	}
	if req.URL != nil {
		normalized, err := urlutil.Normalize(*req.URL)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid URL"})
			return
		}
		link.URL = normalized
	}
	if req.Icon != nil {
		link.Icon = strings.TrimSpace(*req.Icon)
	}
	if req.Active != nil {
		link.Active = *req.Active
	}

	if err := h.links.Update(link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update link"})
		return
	}

	c.JSON(http.StatusOK, toOwnerLinkDTO(link))
}

// DeleteMyProfileLink removes one of the user's links.
func (h *ProfileHandler) DeleteMyProfileLink(c *gin.Context) {
	link, ok := h.requireOwnedLink(c)
	if !ok {
		return
	}

	if err := h.links.Delete(link.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete link"})
		return
	}

	c.Status(http.StatusNoContent)
}

// ReorderMyProfileLinks rewrites the position of every link on the profile.
func (h *ProfileHandler) ReorderMyProfileLinks(c *gin.Context) {
	profile, ok := h.requireProfile(c)
	if !ok {
		return
	}

	var req domain.ReorderProfileLinksRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if err := h.links.Reorder(profile.ID, req.OrderedIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reorder links"})
		return
	}

	links, err := h.links.ListByProfile(profile.ID, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load links"})
		return
	}
	out := make([]ownerLinkDTO, 0, len(links))
	for _, l := range links {
		out = append(out, toOwnerLinkDTO(l))
	}
	c.JSON(http.StatusOK, out)
}

// GetMyProfileAnalytics returns the dashboard rollup for the whole profile.
func (h *ProfileHandler) GetMyProfileAnalytics(c *gin.Context) {
	profile, ok := h.requireProfile(c)
	if !ok {
		return
	}

	summary, err := h.analytics.GetProfileSummary(profile.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load analytics"})
		return
	}
	c.JSON(http.StatusOK, summary)
}

// GetMyProfileLinkAnalytics returns click stats for a single owned link.
func (h *ProfileHandler) GetMyProfileLinkAnalytics(c *gin.Context) {
	link, ok := h.requireOwnedLink(c)
	if !ok {
		return
	}

	stats, err := h.analytics.GetLinkAnalytics(link.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load analytics"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// --- helpers ---

func (h *ProfileHandler) respondOwnerProfile(c *gin.Context, status int, profile *domain.Profile) {
	links, err := h.links.ListByProfile(profile.ID, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load links"})
		return
	}

	out := ownerProfileDTO{
		ID:               profile.ID,
		Username:         profile.Username,
		DisplayName:      profile.DisplayName,
		Bio:              profile.Bio,
		AvatarURL:        profile.AvatarURL,
		Theme:            profile.Theme,
		DiscordUserID:    profile.DiscordUserID,
		UseDiscordAvatar: profile.UseDiscordAvatar,
		Links:            make([]ownerLinkDTO, 0, len(links)),
	}
	for _, l := range links {
		out.Links = append(out.Links, toOwnerLinkDTO(l))
	}
	c.JSON(status, out)
}

// requireProfile resolves the authenticated user's profile or writes an error
// response and returns ok=false.
func (h *ProfileHandler) requireProfile(c *gin.Context) (*domain.Profile, bool) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return nil, false
	}

	profile, err := h.profiles.FindByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "profile not found", "code": "no_profile"})
			return nil, false
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load profile"})
		return nil, false
	}
	return profile, true
}

// requireOwnedLink resolves the :id path param to a link owned by the
// authenticated user, or writes an error response and returns ok=false.
func (h *ProfileHandler) requireOwnedLink(c *gin.Context) (*domain.ProfileLink, bool) {
	profile, ok := h.requireProfile(c)
	if !ok {
		return nil, false
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid link id"})
		return nil, false
	}

	link, err := h.links.FindByID(id)
	if err != nil || link.ProfileID != profile.ID {
		c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
		return nil, false
	}
	return link, true
}

func extractReferrer(c *gin.Context) string {
	if ref := c.GetHeader("Referer"); ref != "" {
		return ref
	}
	for _, key := range []string{"ref", "utm_source", "referrer"} {
		if v := c.Query(key); v != "" {
			return v
		}
	}
	return ""
}
