package repositories

import (
	"errors"
	"sort"
	"sync"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
)

type inMemoryUserRepository struct {
	mu    sync.RWMutex
	users map[uuid.UUID]*domain.User
}

func NewInMemoryUserRepository() UserRepository {
	return &inMemoryUserRepository{
		users: make(map[uuid.UUID]*domain.User),
	}
}

func (r *inMemoryUserRepository) Create(user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, u := range r.users {
		if u.Email == user.Email {
			return errors.New("user already exists")
		}
	}

	r.users[user.ID] = user
	return nil
}

func (r *inMemoryUserRepository) FindByID(id uuid.UUID) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, ok := r.users[id]
	if !ok {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (r *inMemoryUserRepository) FindByEmail(email string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, ErrUserNotFound
}

func (r *inMemoryUserRepository) FindAll() ([]*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var users []*domain.User
	for _, u := range r.users {
		users = append(users, u)
	}
	return users, nil
}

// --- Link-in-bio in-memory repositories ---

type inMemoryProfileRepository struct {
	mu       sync.RWMutex
	profiles map[uuid.UUID]*domain.Profile // keyed by UserID
}

func NewInMemoryProfileRepository() ProfileRepository {
	return &inMemoryProfileRepository{
		profiles: make(map[uuid.UUID]*domain.Profile),
	}
}

func (r *inMemoryProfileRepository) Create(profile *domain.Profile) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	profile.Username = NormalizeUsername(profile.Username)
	for _, p := range r.profiles {
		if p.Username == profile.Username {
			return errors.New("username already taken")
		}
	}
	r.profiles[profile.UserID] = profile
	return nil
}

func (r *inMemoryProfileRepository) Update(profile *domain.Profile) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	profile.Username = NormalizeUsername(profile.Username)
	existing, ok := r.profiles[profile.UserID]
	if !ok {
		return ErrProfileNotFound
	}
	for _, p := range r.profiles {
		if p.UserID != profile.UserID && p.Username == profile.Username {
			return errors.New("username already taken")
		}
	}
	existing.Username = profile.Username
	existing.DisplayName = profile.DisplayName
	existing.Bio = profile.Bio
	existing.AvatarURL = profile.AvatarURL
	existing.Theme = profile.Theme
	existing.DiscordUserID = profile.DiscordUserID
	existing.UseDiscordAvatar = profile.UseDiscordAvatar
	return nil
}

func (r *inMemoryProfileRepository) FindByUserID(userID uuid.UUID) (*domain.Profile, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	profile, ok := r.profiles[userID]
	if !ok {
		return nil, ErrProfileNotFound
	}
	return profile, nil
}

func (r *inMemoryProfileRepository) FindByUsername(username string) (*domain.Profile, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	username = NormalizeUsername(username)
	for _, p := range r.profiles {
		if p.Username == username {
			return p, nil
		}
	}
	return nil, ErrProfileNotFound
}

func (r *inMemoryProfileRepository) UsernameTaken(username string, excludeUserID uuid.UUID) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	username = NormalizeUsername(username)
	for _, p := range r.profiles {
		if p.Username == username && p.UserID != excludeUserID {
			return true, nil
		}
	}
	return false, nil
}

func (r *inMemoryProfileRepository) FindAll() ([]*domain.Profile, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var profiles []*domain.Profile
	for _, p := range r.profiles {
		profiles = append(profiles, p)
	}
	return profiles, nil
}

type inMemoryProfileLinkRepository struct {
	mu    sync.RWMutex
	links map[uuid.UUID]*domain.ProfileLink
}

func NewInMemoryProfileLinkRepository() ProfileLinkRepository {
	return &inMemoryProfileLinkRepository{
		links: make(map[uuid.UUID]*domain.ProfileLink),
	}
}

func (r *inMemoryProfileLinkRepository) Create(link *domain.ProfileLink) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.links[link.ID] = link
	return nil
}

func (r *inMemoryProfileLinkRepository) Update(link *domain.ProfileLink) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	existing, ok := r.links[link.ID]
	if !ok {
		return ErrProfileLinkNotFound
	}
	existing.Label = link.Label
	existing.URL = link.URL
	existing.Icon = link.Icon
	existing.Section = link.Section
	existing.Active = link.Active
	return nil
}

func (r *inMemoryProfileLinkRepository) Delete(id uuid.UUID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.links, id)
	return nil
}

func (r *inMemoryProfileLinkRepository) FindByID(id uuid.UUID) (*domain.ProfileLink, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	link, ok := r.links[id]
	if !ok {
		return nil, ErrProfileLinkNotFound
	}
	return link, nil
}

func (r *inMemoryProfileLinkRepository) ListByProfile(profileID uuid.UUID, activeOnly bool) ([]*domain.ProfileLink, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var links []*domain.ProfileLink
	for _, l := range r.links {
		if l.ProfileID != profileID {
			continue
		}
		if activeOnly && !l.Active {
			continue
		}
		links = append(links, l)
	}
	sort.SliceStable(links, func(i, j int) bool {
		if links[i].Position != links[j].Position {
			return links[i].Position < links[j].Position
		}
		return links[i].CreatedAt.Before(links[j].CreatedAt)
	})
	return links, nil
}

func (r *inMemoryProfileLinkRepository) Reorder(profileID uuid.UUID, orderedIDs []uuid.UUID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for position, id := range orderedIDs {
		if l, ok := r.links[id]; ok && l.ProfileID == profileID {
			l.Position = position
		}
	}
	return nil
}

func (r *inMemoryProfileLinkRepository) NextPosition(profileID uuid.UUID) (int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	next := 0
	for _, l := range r.links {
		if l.ProfileID == profileID && l.Position >= next {
			next = l.Position + 1
		}
	}
	return next, nil
}

func (r *inMemoryProfileLinkRepository) CountByProfile(profileID uuid.UUID) (int64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var count int64
	for _, l := range r.links {
		if l.ProfileID == profileID {
			count++
		}
	}
	return count, nil
}

func (r *inMemoryProfileLinkRepository) CountAll() (int64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return int64(len(r.links)), nil
}

type inMemoryProfileAnalyticsRepository struct {
	mu     sync.RWMutex
	clicks []*domain.ProfileLinkClick
	views  []*domain.ProfileView
}

func NewInMemoryProfileAnalyticsRepository() ProfileAnalyticsRepository {
	return &inMemoryProfileAnalyticsRepository{
		clicks: make([]*domain.ProfileLinkClick, 0),
		views:  make([]*domain.ProfileView, 0),
	}
}

func (r *inMemoryProfileAnalyticsRepository) RecordClick(click *domain.ProfileLinkClick) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if click.ID == uuid.Nil {
		click.ID = uuid.New()
	}
	if click.Timestamp.IsZero() {
		click.Timestamp = time.Now()
	}
	r.clicks = append(r.clicks, click)
	return nil
}

func (r *inMemoryProfileAnalyticsRepository) RecordView(view *domain.ProfileView) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if view.ID == uuid.Nil {
		view.ID = uuid.New()
	}
	if view.Timestamp.IsZero() {
		view.Timestamp = time.Now()
	}
	r.views = append(r.views, view)
	return nil
}

func (r *inMemoryProfileAnalyticsRepository) GetLinkAnalytics(profileLinkID uuid.UUID) (*domain.ProfileLinkAnalytics, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	now := time.Now()
	since24h := now.Add(-24 * time.Hour)
	since7d := now.Add(-7 * 24 * time.Hour)

	out := &domain.ProfileLinkAnalytics{
		ProfileLinkID: profileLinkID,
		Referrers:     make(map[string]int64),
	}
	for _, c := range r.clicks {
		if c.ProfileLinkID != profileLinkID {
			continue
		}
		out.TotalClicks++
		if c.Timestamp.After(since24h) {
			out.Clicks24h++
		}
		if c.Timestamp.After(since7d) {
			out.Clicks7d++
		}
		ref := c.Referrer
		if ref == "" {
			ref = "Direct / Unknown"
		}
		out.Referrers[ref]++
	}
	return out, nil
}

func (r *inMemoryProfileAnalyticsRepository) GetProfileSummary(profileID uuid.UUID) (*domain.ProfileAnalyticsSummary, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	now := time.Now()
	since24h := now.Add(-24 * time.Hour)
	since7d := now.Add(-7 * 24 * time.Hour)

	summary := &domain.ProfileAnalyticsSummary{ProfileID: profileID}
	perLink := make(map[uuid.UUID]int64)

	for _, v := range r.views {
		if v.ProfileID != profileID {
			continue
		}
		summary.TotalViews++
		if v.Timestamp.After(since24h) {
			summary.Views24h++
		}
		if v.Timestamp.After(since7d) {
			summary.Views7d++
		}
	}

	for _, c := range r.clicks {
		if c.ProfileID != profileID {
			continue
		}
		summary.TotalClicks++
		perLink[c.ProfileLinkID]++
	}

	for id, count := range perLink {
		summary.Links = append(summary.Links, domain.ProfileLinkAnalytics{
			ProfileLinkID: id,
			TotalClicks:   count,
		})
	}
	return summary, nil
}

type inMemoryProfileReportRepository struct {
	mu      sync.RWMutex
	reports []*domain.ProfileReport
}

func NewInMemoryProfileReportRepository() ProfileReportRepository {
	return &inMemoryProfileReportRepository{reports: make([]*domain.ProfileReport, 0)}
}

func (r *inMemoryProfileReportRepository) Create(rep *domain.ProfileReport) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if rep.ID == uuid.Nil {
		rep.ID = uuid.New()
	}
	if rep.CreatedAt.IsZero() {
		rep.CreatedAt = time.Now()
	}
	r.reports = append(r.reports, rep)
	return nil
}

func (r *inMemoryProfileReportRepository) CountRecentByReporter(profileID uuid.UUID, ip string, since time.Time) (int64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var count int64
	for _, rep := range r.reports {
		if rep.ProfileID == profileID && rep.ReporterIP == ip && rep.CreatedAt.After(since) {
			count++
		}
	}
	return count, nil
}

func (r *inMemoryProfileReportRepository) List(status string, limit int) ([]*domain.ProfileReport, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if limit <= 0 || limit > 500 {
		limit = 200
	}
	sorted := append([]*domain.ProfileReport(nil), r.reports...)
	sort.Slice(sorted, func(i, j int) bool { return sorted[i].CreatedAt.After(sorted[j].CreatedAt) })
	out := make([]*domain.ProfileReport, 0, limit)
	for _, rep := range sorted {
		if status != "" && rep.Status != status {
			continue
		}
		out = append(out, rep)
		if len(out) >= limit {
			break
		}
	}
	return out, nil
}

func (r *inMemoryProfileReportRepository) CountByStatus(status string) (int64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var count int64
	for _, rep := range r.reports {
		if status == "" || rep.Status == status {
			count++
		}
	}
	return count, nil
}

func (r *inMemoryProfileReportRepository) UpdateStatus(id uuid.UUID, status string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, rep := range r.reports {
		if rep.ID == id {
			rep.Status = status
			if status != "open" {
				now := time.Now()
				rep.ReviewedAt = &now
			} else {
				rep.ReviewedAt = nil
			}
			return nil
		}
	}
	return nil
}
