package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Email        string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Role         string    `gorm:"type:varchar(32);not null;default:'user'" json:"role"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	Links []Link `gorm:"foreignKey:UserID;references:ID" json:"links"`
}

