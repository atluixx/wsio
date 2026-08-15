package middleware

import (
	"net/http"
	"strings"

	"github.com/atluixx/wsio/pkg/auth"
	"github.com/gin-gonic/gin"
)

const SessionCookie = "session"

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

		c.Next()
	}
}

// OptionalAuth extracts user credentials if a valid session cookie or Authorization header exists
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := getToken(c)
		if err == nil && token != "" {
			if claims, err := auth.ParseToken(token); err == nil {
				c.Set("userID", claims.UserID)
			}
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
