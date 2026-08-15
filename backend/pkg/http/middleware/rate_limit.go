package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateCounter struct {
	mu       sync.Mutex
	counters map[string]int
	resetAt  time.Time
}

var globalRateLimiter = &rateCounter{
	counters: make(map[string]int),
	resetAt:  time.Now().Add(time.Minute),
}

// ApiKeyRateLimitMiddleware enforces plan-based rate limits for API Key requests:
// - Starter Plan: 30 requests per minute (10,000 per month quota)
// - Diamond Plan: 300 requests per minute (100,000 per month quota)
func ApiKeyRateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		planVal, exists := c.Get("planType")
		if !exists {
			c.Next()
			return
		}

		planType, ok := planVal.(string)
		if !ok || planType == "" {
			c.Next()
			return
		}

		// Determine per-minute threshold based on plan
		var minuteLimit int
		switch planType {
		case "diamond", "pro":
			minuteLimit = 300
		case "starter":
			minuteLimit = 30
		default:
			minuteLimit = 10
		}

		// Create rate-limiting identifier key
		rawKey := getApiKeyHeader(c)
		if rawKey == "" {
			c.Next()
			return
		}

		keyIdentifier := planType + ":" + hashKey(rawKey)

		globalRateLimiter.mu.Lock()
		now := time.Now()
		if now.After(globalRateLimiter.resetAt) {
			globalRateLimiter.counters = make(map[string]int)
			globalRateLimiter.resetAt = now.Add(time.Minute)
		}

		count := globalRateLimiter.counters[keyIdentifier]
		if count >= minuteLimit {
			globalRateLimiter.mu.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":        "API key rate limit exceeded for your subscription plan.",
				"planType":     planType,
				"limit":        minuteLimit,
				"window":       "1 minute",
				"retryAfterSec": int(time.Until(globalRateLimiter.resetAt).Seconds()),
			})
			return
		}

		globalRateLimiter.counters[keyIdentifier] = count + 1
		globalRateLimiter.mu.Unlock()

		c.Next()
	}
}
