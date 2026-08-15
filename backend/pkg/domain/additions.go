package domain

import (
	"time"

	"github.com/google/uuid"
)

// LinkClick represents a single click event recorded on link redirection.
type LinkClick struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	LinkID    uuid.UUID `gorm:"type:uuid;index;not null" json:"linkId"`
	Code      string    `gorm:"type:varchar(32);index;not null" json:"code"`
	Referrer  string    `gorm:"type:varchar(512)" json:"referrer"`
	UserAgent string    `gorm:"type:varchar(512)" json:"userAgent"`
	IP        string    `gorm:"type:varchar(64)" json:"ip"`
	Timestamp time.Time `gorm:"index;not null" json:"timestamp"`
}

// LinkAnalyticsSummary presents aggregated click statistics for a short code.
type LinkAnalyticsSummary struct {
	Code        string           `json:"code"`
	TotalClicks int64            `json:"totalClicks"`
	Clicks24h   int64            `json:"clicks24h"`
	Clicks7d    int64            `json:"clicks7d"`
	Referrers   map[string]int64 `json:"referrers"`
}

// UserSubscription is an additive model representing a user's subscription tier without modifying User core struct.
type UserSubscription struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID         uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"userId"`
	PlanType       string    `gorm:"type:varchar(32);not null;default:'guest'" json:"planType"` // "guest", "starter", "diamond"
	MaxDailyLinks  int       `gorm:"default:3" json:"maxDailyLinks"`
	HasAnalytics   bool      `gorm:"default:false" json:"hasAnalytics"`
	HasCustomAlias bool      `gorm:"default:false" json:"hasCustomAlias"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// GuestUsageTrack tracks daily link creations per guest identifier (IP / client token).
type GuestUsageTrack struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Identifier string    `gorm:"type:varchar(128);index:idx_ident_date;not null" json:"identifier"`
	Date       string    `gorm:"type:varchar(10);index:idx_ident_date;not null" json:"date"` // YYYY-MM-DD
	Count      int       `gorm:"default:1" json:"count"`
}
