package repositories

import (
	"errors"
	"sync"

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
	if !ok || link.UserID != userID {
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
