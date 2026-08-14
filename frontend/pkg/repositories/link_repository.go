package repositories

import (
	"errors"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrLinkNotFound = errors.New("link not found")

type LinkRepository interface {
	Create(link *domain.Link) error
	FindByCode(code string) (*domain.Link, error)
	FindByCodeAndUser(code string, userID uuid.UUID) (*domain.Link, error)
	Delete(link *domain.Link) error
}

type linkRepository struct {
	db *gorm.DB
}

func NewLinkRepository(db *gorm.DB) LinkRepository {
	return &linkRepository{
		db: db,
	}
}

func (r *linkRepository) Create(link *domain.Link) error {
	return r.db.Create(link).Error
}

func (r *linkRepository) FindByCode(code string) (*domain.Link, error) {
	var link domain.Link

	err := r.db.
		Where("code = ?", code).
		First(&link).
		Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrLinkNotFound
	}

	if err != nil {
		return nil, err
	}

	return &link, nil
}

func (r *linkRepository) FindByCodeAndUser(code string, userID uuid.UUID) (*domain.Link, error) {
	var link domain.Link

	err := r.db.
		Where("code = ? AND user_id = ?", code, userID).
		First(&link).
		Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrLinkNotFound
	}

	if err != nil {
		return nil, err
	}

	return &link, nil
}

func (r *linkRepository) Delete(link *domain.Link) error {
	return r.db.Delete(link).Error
}
