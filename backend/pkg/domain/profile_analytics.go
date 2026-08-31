package domain

import (
	"time"

	"github.com/google/uuid"
)

// ProfileLinkClick records a single click on a profile link. It is the
// link-in-bio successor of the shortener's LinkClick event.
type ProfileLinkClick struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ProfileLinkID uuid.UUID `gorm:"type:uuid;index;not null" json:"profileLinkId"`
	ProfileID     uuid.UUID `gorm:"type:uuid;index;not null" json:"profileId"`
	Referrer      string    `gorm:"type:varchar(512)" json:"referrer"`
	UserAgent     string    `gorm:"type:varchar(512)" json:"userAgent"`
	IP            string    `gorm:"type:varchar(64)" json:"ip"`
	Timestamp     time.Time `gorm:"index;not null" json:"timestamp"`
}

// ProfileView records a single visit to a public profile page.
type ProfileView struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ProfileID uuid.UUID `gorm:"type:uuid;index;not null" json:"profileId"`
	Referrer  string    `gorm:"type:varchar(512)" json:"referrer"`
	UserAgent string    `gorm:"type:varchar(512)" json:"userAgent"`
	IP        string    `gorm:"type:varchar(64)" json:"ip"`
	Timestamp time.Time `gorm:"index;not null" json:"timestamp"`
}

// ProfileLinkAnalytics is aggregated click statistics for a single link.
type ProfileLinkAnalytics struct {
	ProfileLinkID uuid.UUID        `json:"profileLinkId"`
	TotalClicks   int64            `json:"totalClicks"`
	Clicks24h     int64            `json:"clicks24h"`
	Clicks7d      int64            `json:"clicks7d"`
	Referrers     map[string]int64 `json:"referrers"`
}

// ProfileAnalyticsSummary is the dashboard rollup for an entire profile.
type ProfileAnalyticsSummary struct {
	ProfileID   uuid.UUID              `json:"profileId"`
	TotalViews  int64                  `json:"totalViews"`
	Views24h    int64                  `json:"views24h"`
	Views7d     int64                  `json:"views7d"`
	TotalClicks int64                  `json:"totalClicks"`
	Links       []ProfileLinkAnalytics `json:"links"`
}
