package repositories

import (
	"errors"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrProfileLinkNotFound = errors.New("profile link not found")

// ProfileLinkRepository persists the ordered links belonging to a profile.
type ProfileLinkRepository interface {
	Create(link *domain.ProfileLink) error
	Update(link *domain.ProfileLink) error
	Delete(id uuid.UUID) error
	FindByID(id uuid.UUID) (*domain.ProfileLink, error)
	// ListByProfile returns links ordered by position ascending. When
	// activeOnly is true, hidden links are excluded.
	ListByProfile(profileID uuid.UUID, activeOnly bool) ([]*domain.ProfileLink, error)
	// Reorder sets each link's position to its index in orderedIDs. IDs that
	// do not belong to profileID are ignored.
	Reorder(profileID uuid.UUID, orderedIDs []uuid.UUID) error
	// NextPosition returns the position to assign to a newly appended link.
	NextPosition(profileID uuid.UUID) (int, error)
	CountByProfile(profileID uuid.UUID) (int64, error)
	CountAll() (int64, error)
}

type profileLinkRepository struct {
	db *gorm.DB
}

func NewProfileLinkRepository(db *gorm.DB) ProfileLinkRepository {
	return &profileLinkRepository{db: db}
}

func (r *profileLinkRepository) Create(link *domain.ProfileLink) error {
	return r.db.Create(link).Error
}

func (r *profileLinkRepository) Update(link *domain.ProfileLink) error {
	return r.db.Model(link).
		Select("label", "url", "icon", "active").
		Updates(link).Error
}

func (r *profileLinkRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.ProfileLink{ID: id}).Error
}

func (r *profileLinkRepository) FindByID(id uuid.UUID) (*domain.ProfileLink, error) {
	var link domain.ProfileLink
	err := r.db.Where("id = ?", id).First(&link).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProfileLinkNotFound
	}
	if err != nil {
		return nil, err
	}
	return &link, nil
}

func (r *profileLinkRepository) ListByProfile(profileID uuid.UUID, activeOnly bool) ([]*domain.ProfileLink, error) {
	var links []*domain.ProfileLink
	q := r.db.Where("profile_id = ?", profileID)
	if activeOnly {
		q = q.Where("active = ?", true)
	}
	err := q.Order("position asc").Order("created_at asc").Find(&links).Error
	return links, err
}

func (r *profileLinkRepository) Reorder(profileID uuid.UUID, orderedIDs []uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for position, id := range orderedIDs {
			if err := tx.Model(&domain.ProfileLink{}).
				Where("id = ? AND profile_id = ?", id, profileID).
				Update("position", position).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *profileLinkRepository) NextPosition(profileID uuid.UUID) (int, error) {
	var max *int
	err := r.db.Model(&domain.ProfileLink{}).
		Where("profile_id = ?", profileID).
		Select("MAX(position)").
		Scan(&max).Error
	if err != nil {
		return 0, err
	}
	if max == nil {
		return 0, nil
	}
	return *max + 1, nil
}

func (r *profileLinkRepository) CountByProfile(profileID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&domain.ProfileLink{}).Where("profile_id = ?", profileID).Count(&count).Error
	return count, err
}

func (r *profileLinkRepository) CountAll() (int64, error) {
	var count int64
	err := r.db.Model(&domain.ProfileLink{}).Count(&count).Error
	return count, err
}
