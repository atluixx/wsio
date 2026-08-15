package domain

import (
	"time"

	"github.com/google/uuid"
)

type Link struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    *uuid.UUID `gorm:"type:uuid;index;nullable" json:"userId,omitempty"`
	Code      string     `gorm:"type:varchar(32);not null;index" json:"code"`
	URL       string     `gorm:"type:text;not null" json:"url"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`

	User *User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}

type CreateLinkRequest struct {
	URL string `json:"url" binding:"required,url"`
}
