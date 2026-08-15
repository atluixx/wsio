package repositories

import (
	"errors"
	"strings"
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

type inMemoryLinkRepository struct {
	mu    sync.RWMutex
	links map[string]*domain.Link
}

func NewInMemoryLinkRepository() LinkRepository {
	return &inMemoryLinkRepository{
		links: make(map[string]*domain.Link),
	}
}

func (r *inMemoryLinkRepository) Create(link *domain.Link) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.links[link.Code] = link
	return nil
}

func (r *inMemoryLinkRepository) FindByCode(code string) (*domain.Link, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	link, ok := r.links[code]
	if !ok {
		return nil, ErrLinkNotFound
	}
	return link, nil
}

func (r *inMemoryLinkRepository) FindByCodeAndUser(code string, userID uuid.UUID) (*domain.Link, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	link, ok := r.links[code]
	if !ok || link.UserID == nil || *link.UserID != userID {
		return nil, ErrLinkNotFound
	}
	return link, nil
}

func (r *inMemoryLinkRepository) Delete(link *domain.Link) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.links, link.Code)
	return nil
}

func (r *inMemoryLinkRepository) FindAll() ([]*domain.Link, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var links []*domain.Link
	for _, l := range r.links {
		links = append(links, l)
	}
	return links, nil
}

type inMemoryAnalyticsRepository struct {
	mu         sync.RWMutex
	clicks     []*domain.LinkClick
	guestUsage map[string]int // key: "ident:date"
}

func NewInMemoryAnalyticsRepository() AnalyticsRepository {
	return &inMemoryAnalyticsRepository{
		clicks:     make([]*domain.LinkClick, 0),
		guestUsage: make(map[string]int),
	}
}

func (r *inMemoryAnalyticsRepository) RecordClick(click *domain.LinkClick) error {
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

func (r *inMemoryAnalyticsRepository) GetAnalyticsByCode(code string) (*domain.LinkAnalyticsSummary, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var totalClicks int64
	var clicks24h int64
	var clicks7d int64
	referrersMap := make(map[string]int64)

	now := time.Now()
	since24h := now.Add(-24 * time.Hour)
	since7d := now.Add(-7 * 24 * time.Hour)

	for _, c := range r.clicks {
		if c.Code == code || strings.EqualFold(c.Code, code) {
			totalClicks++
			if c.Timestamp.After(since24h) {
				clicks24h++
			}
			if c.Timestamp.After(since7d) {
				clicks7d++
			}

			ref := c.Referrer
			if ref == "" {
				ref = "Direct / Unknown"
			}
			referrersMap[ref]++
		}
	}

	return &domain.LinkAnalyticsSummary{
		Code:        code,
		TotalClicks: totalClicks,
		Clicks24h:   clicks24h,
		Clicks7d:    clicks7d,
		Referrers:   referrersMap,
	}, nil
}

func (r *inMemoryAnalyticsRepository) GetGuestUsage(identifier string, date string) (int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	key := identifier + ":" + date
	return r.guestUsage[key], nil
}

func (r *inMemoryAnalyticsRepository) IncrementGuestUsage(identifier string, date string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	key := identifier + ":" + date
	r.guestUsage[key]++
	return nil
}
