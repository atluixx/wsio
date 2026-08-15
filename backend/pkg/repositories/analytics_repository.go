package repositories

import (
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnalyticsRepository interface {
	RecordClick(click *domain.LinkClick) error
	GetAnalyticsByCode(code string) (*domain.LinkAnalyticsSummary, error)
	GetGuestUsage(identifier string, date string) (int, error)
	IncrementGuestUsage(identifier string, date string) error
}

type analyticsRepository struct {
	db *gorm.DB
}

func NewAnalyticsRepository(db *gorm.DB) AnalyticsRepository {
	return &analyticsRepository{
		db: db,
	}
}

func (r *analyticsRepository) RecordClick(click *domain.LinkClick) error {
	if click.ID == uuid.Nil {
		click.ID = uuid.New()
	}
	if click.Timestamp.IsZero() {
		click.Timestamp = time.Now()
	}
	return r.db.Create(click).Error
}

func (r *analyticsRepository) GetAnalyticsByCode(code string) (*domain.LinkAnalyticsSummary, error) {
	var totalClicks int64
	var clicks24h int64
	var clicks7d int64

	now := time.Now()
	since24h := now.Add(-24 * time.Hour)
	since7d := now.Add(-7 * 24 * time.Hour)

	r.db.Model(&domain.LinkClick{}).Where("LOWER(code) = LOWER(?) OR code = ?", code, code).Count(&totalClicks)
	r.db.Model(&domain.LinkClick{}).Where("(LOWER(code) = LOWER(?) OR code = ?) AND timestamp >= ?", code, code, since24h).Count(&clicks24h)
	r.db.Model(&domain.LinkClick{}).Where("(LOWER(code) = LOWER(?) OR code = ?) AND timestamp >= ?", code, code, since7d).Count(&clicks7d)

	type ReferrerCount struct {
		Referrer string
		Count    int64
	}
	var referrerCounts []ReferrerCount
	r.db.Model(&domain.LinkClick{}).
		Select("COALESCE(NULLIF(referrer, ''), 'Direct / Unknown') as referrer, count(*) as count").
		Where("LOWER(code) = LOWER(?) OR code = ?", code, code).
		Group("referrer").
		Limit(10).
		Scan(&referrerCounts)

	referrersMap := make(map[string]int64)
	for _, rc := range referrerCounts {
		referrersMap[rc.Referrer] = rc.Count
	}

	return &domain.LinkAnalyticsSummary{
		Code:        code,
		TotalClicks: totalClicks,
		Clicks24h:   clicks24h,
		Clicks7d:    clicks7d,
		Referrers:   referrersMap,
	}, nil
}

func (r *analyticsRepository) GetGuestUsage(identifier string, date string) (int, error) {
	var track domain.GuestUsageTrack
	err := r.db.Where("identifier = ? AND date = ?", identifier, date).First(&track).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, nil
		}
		return 0, err
	}
	return track.Count, nil
}

func (r *analyticsRepository) IncrementGuestUsage(identifier string, date string) error {
	var track domain.GuestUsageTrack
	err := r.db.Where("identifier = ? AND date = ?", identifier, date).First(&track).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			track = domain.GuestUsageTrack{
				ID:         uuid.New(),
				Identifier: identifier,
				Date:       date,
				Count:      1,
			}
			return r.db.Create(&track).Error
		}
		return err
	}

	return r.db.Model(&track).Update("count", track.Count+1).Error
}
