package repositories

import (
	"errors"
	"sync"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrApiKeyNotFound = errors.New("api key not found")

type ApiKeyRepository interface {
	Create(key *domain.ApiKey) error
	FindByHash(hash string) (*domain.ApiKey, error)
	FindByUserID(userID uuid.UUID) ([]*domain.ApiKey, error)
	FindAll() ([]*domain.ApiKey, error)
	Delete(id uuid.UUID) error
	UpdateLastUsed(id uuid.UUID) error
}

type postgresApiKeyRepository struct {
	db *gorm.DB
}

func NewPostgresApiKeyRepository(db *gorm.DB) ApiKeyRepository {
	return &postgresApiKeyRepository{db: db}
}

func (r *postgresApiKeyRepository) Create(key *domain.ApiKey) error {
	return r.db.Create(key).Error
}

func (r *postgresApiKeyRepository) FindByHash(hash string) (*domain.ApiKey, error) {
	var key domain.ApiKey
	err := r.db.Where("key_hash = ?", hash).First(&key).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrApiKeyNotFound
		}
		return nil, err
	}
	return &key, nil
}

func (r *postgresApiKeyRepository) FindByUserID(userID uuid.UUID) ([]*domain.ApiKey, error) {
	var keys []*domain.ApiKey
	err := r.db.Where("user_id = ?", userID).Order("created_at desc").Find(&keys).Error
	return keys, err
}

func (r *postgresApiKeyRepository) FindAll() ([]*domain.ApiKey, error) {
	var keys []*domain.ApiKey
	err := r.db.Order("created_at desc").Find(&keys).Error
	return keys, err
}

func (r *postgresApiKeyRepository) Delete(id uuid.UUID) error {
	return r.db.Where("id = ?", id).Delete(&domain.ApiKey{}).Error
}

func (r *postgresApiKeyRepository) UpdateLastUsed(id uuid.UUID) error {
	now := time.Now()
	return r.db.Model(&domain.ApiKey{}).Where("id = ?", id).Update("last_used_at", &now).Error
}

// In-Memory Fallback Implementation
type inMemoryApiKeyRepository struct {
	mu   sync.RWMutex
	keys map[uuid.UUID]*domain.ApiKey
}

func NewInMemoryApiKeyRepository() ApiKeyRepository {
	return &inMemoryApiKeyRepository{
		keys: make(map[uuid.UUID]*domain.ApiKey),
	}
}

func (r *inMemoryApiKeyRepository) Create(key *domain.ApiKey) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.keys[key.ID] = key
	return nil
}

func (r *inMemoryApiKeyRepository) FindByHash(hash string) (*domain.ApiKey, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, k := range r.keys {
		if k.KeyHash == hash {
			return k, nil
		}
	}
	return nil, ErrApiKeyNotFound
}

func (r *inMemoryApiKeyRepository) FindByUserID(userID uuid.UUID) ([]*domain.ApiKey, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*domain.ApiKey
	for _, k := range r.keys {
		if k.UserID != nil && *k.UserID == userID {
			result = append(result, k)
		}
	}
	return result, nil
}

func (r *inMemoryApiKeyRepository) FindAll() ([]*domain.ApiKey, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*domain.ApiKey
	for _, k := range r.keys {
		result = append(result, k)
	}
	return result, nil
}

func (r *inMemoryApiKeyRepository) Delete(id uuid.UUID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.keys, id)
	return nil
}

func (r *inMemoryApiKeyRepository) UpdateLastUsed(id uuid.UUID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if key, ok := r.keys[id]; ok {
		now := time.Now()
		key.LastUsedAt = &now
	}
	return nil
}
