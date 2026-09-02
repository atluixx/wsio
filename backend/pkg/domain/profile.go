package domain

import (
	"time"

	"github.com/google/uuid"
)

// Profile is a user's public link-in-bio page. Exactly one per user.
type Profile struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"userId"`
	Username    string    `gorm:"type:varchar(32);uniqueIndex;not null" json:"username"`
	DisplayName string    `gorm:"type:varchar(80)" json:"displayName"`
	Bio         string    `gorm:"type:varchar(500)" json:"bio"`
	AvatarURL   string    `gorm:"type:text" json:"avatarUrl"`
	Theme       string    `gorm:"type:varchar(32);not null;default:'minimal'" json:"theme"`

	// Discord: live status/username/avatar are fetched client-side from Lanyard
	// using this ID.
	DiscordUserID    string `gorm:"type:varchar(32)" json:"discordUserId"`
	UseDiscordAvatar bool   `gorm:"not null;default:false" json:"useDiscordAvatar"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	Links []ProfileLink `gorm:"foreignKey:ProfileID;references:ID" json:"links"`
}

// ProfileLink is a single entry in a profile's ordered link list.
type ProfileLink struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ProfileID uuid.UUID `gorm:"type:uuid;index;not null" json:"profileId"`
	Label     string    `gorm:"type:varchar(80);not null" json:"label"`
	URL       string    `gorm:"type:text;not null" json:"url"`
	Icon      string    `gorm:"type:varchar(32)" json:"icon,omitempty"`
	Section   string    `gorm:"type:varchar(60)" json:"section,omitempty"`
	Position  int       `gorm:"not null;default:0" json:"position"`
	Active    bool      `gorm:"not null;default:true" json:"active"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// UpsertProfileRequest is the payload for creating or editing the current
// user's profile.
type UpsertProfileRequest struct {
	Username         string `json:"username" binding:"required,min=2,max=32"`
	DisplayName      string `json:"displayName" binding:"max=80"`
	Bio              string `json:"bio" binding:"max=500"`
	AvatarURL        string `json:"avatarUrl"`
	Theme            string `json:"theme" binding:"max=32"`
	DiscordUserID    string `json:"discordUserId" binding:"max=32"`
	UseDiscordAvatar *bool  `json:"useDiscordAvatar"`
}

// CreateProfileLinkRequest is the payload for appending a link to a profile.
type CreateProfileLinkRequest struct {
	Label   string `json:"label" binding:"required,max=80"`
	URL     string `json:"url" binding:"required"`
	Icon    string `json:"icon" binding:"max=32"`
	Section string `json:"section" binding:"max=60"`
}

// UpdateProfileLinkRequest is a partial update; nil fields are left unchanged.
type UpdateProfileLinkRequest struct {
	Label   *string `json:"label"`
	URL     *string `json:"url"`
	Icon    *string `json:"icon"`
	Section *string `json:"section"`
	Active  *bool   `json:"active"`
}

// ReorderProfileLinksRequest carries the full ordered list of link IDs for a
// profile.
type ReorderProfileLinksRequest struct {
	OrderedIDs []uuid.UUID `json:"orderedIds" binding:"required"`
}
