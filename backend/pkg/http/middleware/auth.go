package middleware

import (
	"net/http"
	"strings"

	"github.com/atluixx/wsio/pkg/auth"
	"github.com/gin-gonic/gin"
)

const SessionCookie = "session"

// Auth requires a valid JWT session (cookie or Bearer token) and sets "userID"
// and "userRole" on the context.
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := getToken(c)
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized",
			})
			return
		}

		claims, err := auth.ParseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired session",
			})
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userRole", claims.Role)

		c.Next()
	}
}

// RequireAdmin must run after Auth; it rejects non-admin sessions.
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("userRole")
		if !exists || roleVal != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "forbidden: admin role required",
			})
			return
		}
		c.Next()
	}
}

func getToken(c *gin.Context) (string, error) {
	token, err := c.Cookie(SessionCookie)
	if err == nil && token != "" {
		return token, nil
	}

	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer "), nil
	}

	return "", nil
}
