package middleware

import (
	"net/http"

	"github.com/atluixx/wsio/pkg/auth"
	"github.com/gin-gonic/gin"
)

const SessionCookie = "session"

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(SessionCookie)
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
