package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/atluixx/wsio/pkg/auth"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
)

const SessionCookie = "session"

func hashKey(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func Auth(apiKeyRepo ...repositories.ApiKeyRepository) gin.HandlerFunc {
	var akRepo repositories.ApiKeyRepository
	if len(apiKeyRepo) > 0 {
		akRepo = apiKeyRepo[0]
	}

	return func(c *gin.Context) {
		// 1. Check API Key Header (X-API-Key or Bearer wsio_live_...)
		rawKey := getApiKeyHeader(c)
		if rawKey != "" && akRepo != nil {
			hashed := hashKey(rawKey)
			keyObj, err := akRepo.FindByHash(hashed)
			if err == nil && keyObj != nil {
				if time.Now().After(keyObj.ExpiresAt) {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
						"error": "API key expired",
					})
					return
				}
				if keyObj.UserID != nil {
					c.Set("userID", *keyObj.UserID)
				}
				c.Set("planType", keyObj.PlanType)
				_ = akRepo.UpdateLastUsed(keyObj.ID)
				c.Next()
				return
			}
		}

		// 2. Check JWT Session Token
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

// OptionalAuth extracts user credentials if a valid session cookie, Bearer token, or API key exists
func OptionalAuth(apiKeyRepo ...repositories.ApiKeyRepository) gin.HandlerFunc {
	var akRepo repositories.ApiKeyRepository
	if len(apiKeyRepo) > 0 {
		akRepo = apiKeyRepo[0]
	}

	return func(c *gin.Context) {
		rawKey := getApiKeyHeader(c)
		if rawKey != "" && akRepo != nil {
			hashed := hashKey(rawKey)
			if keyObj, err := akRepo.FindByHash(hashed); err == nil && keyObj != nil {
				if !time.Now().After(keyObj.ExpiresAt) {
					if keyObj.UserID != nil {
						c.Set("userID", *keyObj.UserID)
					}
					c.Set("planType", keyObj.PlanType)
					_ = akRepo.UpdateLastUsed(keyObj.ID)
					c.Next()
					return
				}
			}
		}

		token, err := getToken(c)
		if err == nil && token != "" {
			if claims, err := auth.ParseToken(token); err == nil {
				c.Set("userID", claims.UserID)
				c.Set("userRole", claims.Role)
			}
		}
		c.Next()
	}
}

func getApiKeyHeader(c *gin.Context) string {
	apiKey := c.GetHeader("X-API-Key")
	if apiKey != "" {
		return strings.TrimSpace(apiKey)
	}

	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(authHeader, "Bearer wsio_live_") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}

	return ""
}

func getToken(c *gin.Context) (string, error) {
	token, err := c.Cookie(SessionCookie)
	if err == nil && token != "" {
		return token, nil
	}

	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") && !strings.HasPrefix(authHeader, "Bearer wsio_live_") {
		return strings.TrimPrefix(authHeader, "Bearer "), nil
	}

	return "", nil
}

