package repositories

import (
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProfileAnalyticsRepository records and aggregates profile views and profile
// link clicks. It is the link-in-bio successor of AnalyticsRepository and
// reuses its 24h / 7d / referrer rollup logic.
type ProfileAnalyticsRepository interface {
	RecordClick(click *domain.ProfileLinkClick) error
	RecordView(view *domain.ProfileView) error
	GetLinkAnalytics(profileLinkID uuid.UUID) (*domain.ProfileLinkAnalytics, error)
	GetProfileSummary(profileID uuid.UUID) (*domain.ProfileAnalyticsSummary, error)
}

type profileAnalyticsRepository struct {
	db *gorm.DB
}

func NewProfileAnalyticsRepository(db *gorm.DB) ProfileAnalyticsRepository {
	return &profileAnalyticsRepository{db: db}
}

func (r *profileAnalyticsRepository) RecordClick(click *domain.ProfileLinkClick) error {
	if click.ID == uuid.Nil {
		click.ID = uuid.New()
	}
	if click.Timestamp.IsZero() {
		click.Timestamp = time.Now()
	}
	return r.db.Create(click).Error
}

func (r *profileAnalyticsRepository) RecordView(view *domain.ProfileView) error {
	if view.ID == uuid.Nil {
		view.ID = uuid.New()
	}
	if view.Timestamp.IsZero() {
		view.Timestamp = time.Now()
	}
	return r.db.Create(view).Error
}

func (r *profileAnalyticsRepository) GetLinkAnalytics(profileLinkID uuid.UUID) (*domain.ProfileLinkAnalytics, error) {
	now := time.Now()
	since24h := now.Add(-24 * time.Hour)
	since7d := now.Add(-7 * 24 * time.Hour)

	var total, clicks24h, clicks7d int64
	r.db.Model(&domain.ProfileLinkClick{}).Where("profile_link_id = ?", profileLinkID).Count(&total)
	r.db.Model(&domain.ProfileLinkClick{}).Where("profile_link_id = ? AND timestamp >= ?", profileLinkID, since24h).Count(&clicks24h)
	r.db.Model(&domain.ProfileLinkClick{}).Where("profile_link_id = ? AND timestamp >= ?", profileLinkID, since7d).Count(&clicks7d)

	type referrerCount struct {
		Referrer string
		Count    int64
	}
	var rows []referrerCount
	r.db.Model(&domain.ProfileLinkClick{}).
		Select("COALESCE(NULLIF(referrer, ''), 'Direct / Unknown') as referrer, count(*) as count").
		Where("profile_link_id = ?", profileLinkID).
		Group("referrer").
		Order("count desc").
		Limit(10).
		Scan(&rows)

	referrers := make(map[string]int64, len(rows))
	for _, row := range rows {
		referrers[row.Referrer] = row.Count
	}

	return &domain.ProfileLinkAnalytics{
		ProfileLinkID: profileLinkID,
		TotalClicks:   total,
		Clicks24h:     clicks24h,
		Clicks7d:      clicks7d,
		Referrers:     referrers,
	}, nil
}

func (r *profileAnalyticsRepository) GetProfileSummary(profileID uuid.UUID) (*domain.ProfileAnalyticsSummary, error) {
	now := time.Now()
	since24h := now.Add(-24 * time.Hour)
	since7d := now.Add(-7 * 24 * time.Hour)

	var totalViews, views24h, views7d, totalClicks int64
	r.db.Model(&domain.ProfileView{}).Where("profile_id = ?", profileID).Count(&totalViews)
	r.db.Model(&domain.ProfileView{}).Where("profile_id = ? AND timestamp >= ?", profileID, since24h).Count(&views24h)
	r.db.Model(&domain.ProfileView{}).Where("profile_id = ? AND timestamp >= ?", profileID, since7d).Count(&views7d)
	r.db.Model(&domain.ProfileLinkClick{}).Where("profile_id = ?", profileID).Count(&totalClicks)

	type linkCount struct {
		ProfileLinkID uuid.UUID
		Count         int64
	}
	var rows []linkCount
	r.db.Model(&domain.ProfileLinkClick{}).
		Select("profile_link_id, count(*) as count").
		Where("profile_id = ?", profileID).
		Group("profile_link_id").
		Scan(&rows)

	links := make([]domain.ProfileLinkAnalytics, 0, len(rows))
	for _, row := range rows {
		links = append(links, domain.ProfileLinkAnalytics{
			ProfileLinkID: row.ProfileLinkID,
			TotalClicks:   row.Count,
		})
	}

	return &domain.ProfileAnalyticsSummary{
		ProfileID:   profileID,
		TotalViews:  totalViews,
		Views24h:    views24h,
		Views7d:     views7d,
		TotalClicks: totalClicks,
		Links:       links,
	}, nil
}
