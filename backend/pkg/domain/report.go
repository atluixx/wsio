package domain

import (
	"time"

	"github.com/google/uuid"
)

// ProfileReport is a visitor-submitted flag against a public profile.
type ProfileReport struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	ProfileID  uuid.UUID  `gorm:"type:uuid;index;not null" json:"profileId"`
	Username   string     `gorm:"type:varchar(32);index" json:"username"`
	Reason     string     `gorm:"type:varchar(24);not null" json:"reason"`
	Details    string     `gorm:"type:varchar(1000)" json:"details"`
	Status     string     `gorm:"type:varchar(16);not null;default:'open'" json:"status"`
	ReporterIP string     `gorm:"type:varchar(64)" json:"-"`
	UserAgent  string     `gorm:"type:varchar(300)" json:"-"`
	CreatedAt  time.Time  `json:"createdAt"`
	ReviewedAt *time.Time `json:"reviewedAt,omitempty"`
}

// ReportReasons are the flags a visitor can pick.
var ReportReasons = map[string]bool{
	"spam":          true,
	"impersonation": true,
	"harassment":    true,
	"adult":         true,
	"hate":          true,
	"malware":       true,
	"other":         true,
}

// ReportStatuses are the states an admin can move a report through.
var ReportStatuses = map[string]bool{
	"open":      true,
	"reviewed":  true,
	"dismissed": true,
	"actioned":  true,
}

// CreateReportRequest is the public payload for flagging a profile.
type CreateReportRequest struct {
	Reason  string `json:"reason" binding:"required"`
	Details string `json:"details" binding:"max=1000"`
}

// UpdateReportRequest is the admin payload for triaging a report.
type UpdateReportRequest struct {
	Status string `json:"status" binding:"required"`
}
