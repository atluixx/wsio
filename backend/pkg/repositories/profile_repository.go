package repositories

import (
	"errors"
	"strings"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrProfileNotFound = errors.New("profile not found")

// ProfileRepository persists the one-per-user link-in-bio profile.
type ProfileRepository interface {
	Create(profile *domain.Profile) error
	Update(profile *domain.Profile) error
	FindByUserID(userID uuid.UUID) (*domain.Profile, error)
	FindByUsername(username string) (*domain.Profile, error)
	FindAll() ([]*domain.Profile, error)
	// UsernameTaken reports whether username belongs to a different user than
	// excludeUserID (pass uuid.Nil to check against every user).
	UsernameTaken(username string, excludeUserID uuid.UUID) (bool, error)
}

// NormalizeUsername lowercases and trims a username so lookups and uniqueness
// checks are case-insensitive.
func NormalizeUsername(username string) string {
	return strings.ToLower(strings.TrimSpace(username))
}

type profileRepository struct {
	db *gorm.DB
}

func NewProfileRepository(db *gorm.DB) ProfileRepository {
	return &profileRepository{db: db}
}

func (r *profileRepository) Create(profile *domain.Profile) error {
	profile.Username = NormalizeUsername(profile.Username)
	return r.db.Create(profile).Error
}

func (r *profileRepository) Update(profile *domain.Profile) error {
	profile.Username = NormalizeUsername(profile.Username)
	return r.db.Model(profile).
		Select(
			"username", "display_name", "bio", "avatar_url", "theme",
			"music_url", "music_kind", "music_source_url", "music_title",
			"music_artwork_url", "music_stream_url",
			"discord_user_id", "use_discord_avatar",
		).
		Updates(profile).Error
}

func (r *profileRepository) FindByUserID(userID uuid.UUID) (*domain.Profile, error) {
	var profile domain.Profile
	err := r.db.Where("user_id = ?", userID).First(&profile).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProfileNotFound
	}
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *profileRepository) FindByUsername(username string) (*domain.Profile, error) {
	var profile domain.Profile
	err := r.db.Where("username = ?", NormalizeUsername(username)).First(&profile).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProfileNotFound
	}
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *profileRepository) FindAll() ([]*domain.Profile, error) {
	var profiles []*domain.Profile
	err := r.db.Order("created_at desc").Find(&profiles).Error
	return profiles, err
}

func (r *profileRepository) UsernameTaken(username string, excludeUserID uuid.UUID) (bool, error) {
	var count int64
	q := r.db.Model(&domain.Profile{}).Where("username = ?", NormalizeUsername(username))
	if excludeUserID != uuid.Nil {
		q = q.Where("user_id <> ?", excludeUserID)
	}
	if err := q.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
