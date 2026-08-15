package middleware

import (
	"net/http"
	"time"

	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
)

// GuestLimitMiddleware limits unauthenticated guest link creation to 3 links per day.
func GuestLimitMiddleware(analyticsRepo repositories.AnalyticsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// If the user is authenticated (userID set in context), skip guest rate limiting
		if _, exists := c.Get("userID"); exists {
			c.Next()
			return
		}

		// Extract guest identifier (Client IP or X-Forwarded-For or X-User-ID header)
		ident := c.ClientIP()
		if customIdent := c.GetHeader("X-User-ID"); customIdent != "" {
			ident = customIdent
		}
		if ident == "" {
			ident = "unknown_guest"
		}

		today := time.Now().Format("2006-01-02")

		count, err := analyticsRepo.GetGuestUsage(ident, today)
		if err == nil && count >= 3 {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":        "Guest daily link creation limit reached (3/3). Register or upgrade your plan for unlimited links.",
				"limitReached": true,
				"dailyLimit":   3,
				"currentCount": count,
			})
			return
		}

		c.Next()

		// If creation was successful (StatusCreated 201), increment count
		if c.Writer.Status() == http.StatusCreated {
			_ = analyticsRepo.IncrementGuestUsage(ident, today)
		}
	}
}
