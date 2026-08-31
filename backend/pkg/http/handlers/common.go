package handlers

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// getUserID returns the authenticated user's ID from the gin context, as set by
// middleware.Auth.
func getUserID(c *gin.Context) (uuid.UUID, error) {
	value, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, errors.New("user ID not found")
	}

	userID, ok := value.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return uuid.Nil, errors.New("invalid user ID")
	}

	return userID, nil
}
