package repositories

import (
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProfileReportRepository persists visitor reports against profiles.
type ProfileReportRepository interface {
	Create(r *domain.ProfileReport) error
	// CountRecentByReporter counts a reporter's reports against one profile since
	// `since`, used to rate-limit duplicate flags.
	CountRecentByReporter(profileID uuid.UUID, ip string, since time.Time) (int64, error)
	List(status string, limit int) ([]*domain.ProfileReport, error)
	CountByStatus(status string) (int64, error)
	UpdateStatus(id uuid.UUID, status string) error
}

type profileReportRepository struct {
	db *gorm.DB
}

func NewProfileReportRepository(db *gorm.DB) ProfileReportRepository {
	return &profileReportRepository{db: db}
}

func (r *profileReportRepository) Create(rep *domain.ProfileReport) error {
	if rep.ID == uuid.Nil {
		rep.ID = uuid.New()
	}
	return r.db.Create(rep).Error
}

func (r *profileReportRepository) CountRecentByReporter(profileID uuid.UUID, ip string, since time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&domain.ProfileReport{}).
		Where("profile_id = ? AND reporter_ip = ? AND created_at > ?", profileID, ip, since).
		Count(&count).Error
	return count, err
}

func (r *profileReportRepository) List(status string, limit int) ([]*domain.ProfileReport, error) {
	if limit <= 0 || limit > 500 {
		limit = 200
	}
	var out []*domain.ProfileReport
	q := r.db.Order("created_at desc").Limit(limit)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	return out, q.Find(&out).Error
}

func (r *profileReportRepository) CountByStatus(status string) (int64, error) {
	var count int64
	q := r.db.Model(&domain.ProfileReport{})
	if status != "" {
		q = q.Where("status = ?", status)
	}
	return count, q.Count(&count).Error
}

func (r *profileReportRepository) UpdateStatus(id uuid.UUID, status string) error {
	updates := map[string]any{"status": status}
	if status != "open" {
		now := time.Now()
		updates["reviewed_at"] = &now
	} else {
		updates["reviewed_at"] = nil
	}
	return r.db.Model(&domain.ProfileReport{}).Where("id = ?", id).Updates(updates).Error
}
