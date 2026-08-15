package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Map plan types to existing Stripe Price IDs in user account
var defaultStripePriceIDs = map[string]string{
	"starter": "price_1U4kYRRX4Fmw6LMasPdixrK5",
	"diamond": "price_1U4kYyRX4Fmw6LMam5E8B9kl",
}

type StripeHandler struct {
	subRepo  repositories.SubscriptionRepository
	userRepo repositories.UserRepository
}

func NewStripeHandler(subRepo repositories.SubscriptionRepository, userRepo repositories.UserRepository) *StripeHandler {
	return &StripeHandler{
		subRepo:  subRepo,
		userRepo: userRepo,
	}
}

type CreateCheckoutRequest struct {
	PlanType string `json:"planType" binding:"required"` // "starter", "diamond"
}

type StripeProductItem struct {
	ID        string `json:"id"`
	PriceID   string `json:"priceId"`
	Name      string `json:"name"`
	PlanType  string `json:"planType"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	Interval  string `json:"interval"`
}

func (h *StripeHandler) GetProducts(c *gin.Context) {
	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	if secretKey == "" || strings.HasPrefix(secretKey, "sk_test_mock") {
		c.JSON(http.StatusOK, []StripeProductItem{
			{ID: "prod_starter", PriceID: defaultStripePriceIDs["starter"], Name: "Starter Plan", PlanType: "starter", Amount: 300, Currency: "eur", Interval: "month"},
			{ID: "prod_diamond", PriceID: defaultStripePriceIDs["diamond"], Name: "Diamond Plan", PlanType: "diamond", Amount: 900, Currency: "eur", Interval: "month"},
		})
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", "https://api.stripe.com/v1/prices?expand[]=data.product", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build stripe request"})
		return
	}

	req.Header.Set("Authorization", "Bearer "+secretKey)
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		c.JSON(http.StatusOK, []StripeProductItem{
			{ID: "prod_starter", PriceID: defaultStripePriceIDs["starter"], Name: "Starter Plan", PlanType: "starter", Amount: 300, Currency: "eur", Interval: "month"},
			{ID: "prod_diamond", PriceID: defaultStripePriceIDs["diamond"], Name: "Diamond Plan", PlanType: "diamond", Amount: 900, Currency: "eur", Interval: "month"},
		})
		return
	}
	defer resp.Body.Close()

	var stripePricesResp struct {
		Data []struct {
			ID         string `json:"id"`
			UnitAmount int64  `json:"unit_amount"`
			Currency   string `json:"currency"`
			Product    struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"product"`
			Recurring struct {
				Interval string `json:"interval"`
			} `json:"recurring"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&stripePricesResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse stripe products"})
		return
	}

	var items []StripeProductItem
	for _, p := range stripePricesResp.Data {
		planType := "starter"
		if strings.Contains(strings.ToLower(p.Product.Name), "diamond") {
			planType = "diamond"
		}
		items = append(items, StripeProductItem{
			ID:       p.Product.ID,
			PriceID:  p.ID,
			Name:     p.Product.Name,
			PlanType: planType,
			Amount:   p.UnitAmount,
			Currency: p.Currency,
			Interval: p.Recurring.Interval,
		})
	}

	c.JSON(http.StatusOK, items)
}

func (h *StripeHandler) CreateCheckoutSession(c *gin.Context) {
	var req CreateCheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	plan := strings.ToLower(strings.TrimSpace(req.PlanType))
	if plan != "starter" && plan != "diamond" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "planType must be 'starter' or 'diamond'"})
		return
	}

	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	appURL := os.Getenv("NEXT_PUBLIC_APP_URL")
	if appURL == "" {
		appURL = "https://wsio.lol"
	}

	var userIDStr string
	if val, exists := c.Get("userID"); exists {
		if uid, ok := val.(uuid.UUID); ok && uid != uuid.Nil {
			userIDStr = uid.String()
		}
	}

	// Resolve target Stripe Price ID (query from Stripe API or fallback to user configured Price ID)
	priceID := resolveStripePriceID(secretKey, plan)

	// Interact with Stripe API
	if secretKey != "" && !strings.HasPrefix(secretKey, "sk_test_mock") {
		successURL := appURL + "/dashboard?payment=success&plan=" + plan + "&session_id={CHECKOUT_SESSION_ID}"
		cancelURL := appURL + "/pricing?canceled=true"

		form := url.Values{}
		form.Set("mode", "subscription")
		form.Set("success_url", successURL)
		form.Set("cancel_url", cancelURL)
		form.Set("line_items[0][price]", priceID)
		form.Set("line_items[0][quantity]", "1")
		if userIDStr != "" {
			form.Set("client_reference_id", userIDStr)
			form.Set("metadata[user_id]", userIDStr)
		}
		form.Set("metadata[plan_type]", plan)

		client := &http.Client{Timeout: 10 * time.Second}
		formReq, err := http.NewRequest("POST", "https://api.stripe.com/v1/checkout/sessions", strings.NewReader(form.Encode()))
		if err == nil {
			formReq.Header.Set("Authorization", "Bearer "+secretKey)
			formReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
			resp, err := client.Do(formReq)
			if err == nil {
				defer resp.Body.Close()
				bodyBytes, _ := io.ReadAll(resp.Body)
				if resp.StatusCode == 200 {
					var stripeResp struct {
						URL string `json:"url"`
					}
					if json.Unmarshal(bodyBytes, &stripeResp) == nil && stripeResp.URL != "" {
						c.JSON(http.StatusOK, gin.H{"url": stripeResp.URL})
						return
					}
				} else {
					log.Printf("Stripe Checkout Session API status %d: %s", resp.StatusCode, string(bodyBytes))
				}
			}
		}
	}

	// Fallback mock redirect URL for local sandbox testing
	if userIDStr != "" && h.subRepo != nil {
		if uID, err := uuid.Parse(userIDStr); err == nil {
			_ = h.subRepo.Upsert(&domain.UserSubscription{
				UserID:         uID,
				PlanType:       plan,
				Status:         "active",
				HasAnalytics:   true,
				HasCustomAlias: true,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"url": appURL + "/dashboard?payment=success&plan=" + plan,
	})
}

func resolveStripePriceID(secretKey, plan string) string {
	if secretKey != "" && !strings.HasPrefix(secretKey, "sk_test_mock") {
		client := &http.Client{Timeout: 5 * time.Second}
		req, err := http.NewRequest("GET", "https://api.stripe.com/v1/prices?expand[]=data.product", nil)
		if err == nil {
			req.Header.Set("Authorization", "Bearer "+secretKey)
			resp, err := client.Do(req)
			if err == nil && resp.StatusCode == 200 {
				defer resp.Body.Close()
				var stripePricesResp struct {
					Data []struct {
						ID      string `json:"id"`
						Product struct {
							Name string `json:"name"`
						} `json:"product"`
					} `json:"data"`
				}
				if json.NewDecoder(resp.Body).Decode(&stripePricesResp) == nil {
					for _, p := range stripePricesResp.Data {
						pName := strings.ToLower(p.Product.Name)
						if plan == "starter" && strings.Contains(pName, "starter") {
							return p.ID
						}
						if plan == "diamond" && strings.Contains(pName, "diamond") {
							return p.ID
						}
					}
				}
			}
		}
	}

	if id, ok := defaultStripePriceIDs[plan]; ok {
		return id
	}
	return "price_1U4kYRRX4Fmw6LMasPdixrK5"
}

func (h *StripeHandler) HandleWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read payload"})
		return
	}

	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	sigHeader := c.GetHeader("Stripe-Signature")

	if webhookSecret != "" && !strings.HasPrefix(webhookSecret, "whsec_mock") {
		if !verifyStripeSignature(payload, sigHeader, webhookSecret) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid webhook signature"})
			return
		}
	}

	var event struct {
		Type string `json:"type"`
		Data struct {
			Object struct {
				ID                string            `json:"id"`
				Customer          string            `json:"customer"`
				Subscription      string            `json:"subscription"`
				Status            string            `json:"status"`
				ClientReferenceID string            `json:"client_reference_id"`
				Metadata          map[string]string `json:"metadata"`
			} `json:"object"`
		} `json:"data"`
	}

	if err := json.Unmarshal(payload, &event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json payload"})
		return
	}

	obj := event.Data.Object
	customerId := obj.Customer
	subId := obj.Subscription
	if subId == "" {
		subId = obj.ID
	}

	userIDStr := obj.ClientReferenceID
	if userIDStr == "" && obj.Metadata != nil {
		userIDStr = obj.Metadata["user_id"]
	}

	planType := "starter"
	if obj.Metadata != nil && obj.Metadata["plan_type"] != "" {
		planType = obj.Metadata["plan_type"]
	}

	log.Printf("Stripe Webhook Event %s: Customer=%s, Sub=%s, UserID=%s, Plan=%s", event.Type, customerId, subId, userIDStr, planType)

	if (event.Type == "checkout.session.completed" || event.Type == "customer.subscription.updated") && h.subRepo != nil {
		if userIDStr != "" {
			if uID, err := uuid.Parse(userIDStr); err == nil {
				subStatus := obj.Status
				if subStatus == "" {
					subStatus = "active"
				}

				_ = h.subRepo.Upsert(&domain.UserSubscription{
					UserID:               uID,
					PlanType:             planType,
					Status:               subStatus,
					StripeCustomerId:     customerId,
					StripeSubscriptionId: subId,
					HasAnalytics:         true,
					HasCustomAlias:       true,
				})
			}
		} else if customerId != "" {
			existingSub, err := h.subRepo.GetByStripeCustomerID(customerId)
			if err == nil && existingSub != nil {
				existingSub.Status = obj.Status
				if existingSub.Status == "" {
					existingSub.Status = "active"
				}
				_ = h.subRepo.Upsert(existingSub)
			}
		}
	} else if event.Type == "customer.subscription.deleted" && h.subRepo != nil {
		if customerId != "" {
			existingSub, err := h.subRepo.GetByStripeCustomerID(customerId)
			if err == nil && existingSub != nil {
				existingSub.PlanType = "free"
				existingSub.Status = "canceled"
				_ = h.subRepo.Upsert(existingSub)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"received":       true,
		"eventType":      event.Type,
		"customerId":     customerId,
		"subscriptionId": subId,
	})
}

func verifyStripeSignature(payload []byte, sigHeader, secret string) bool {
	if sigHeader == "" || secret == "" {
		return false
	}

	items := strings.Split(sigHeader, ",")
	var timestamp, signature string
	for _, item := range items {
		parts := strings.SplitN(strings.TrimSpace(item), "=", 2)
		if len(parts) == 2 {
			if parts[0] == "t" {
				timestamp = parts[1]
			} else if parts[0] == "v1" {
				signature = parts[1]
			}
		}
	}

	if timestamp == "" || signature == "" {
		return false
	}

	macPayload := timestamp + "." + string(payload)
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(macPayload))
	expectedSig := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(signature), []byte(expectedSig))
}

func (h *StripeHandler) GetUserSubscription(c *gin.Context) {
	val, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusOK, gin.H{
			"planType": "guest",
			"status":   "active",
		})
		return
	}

	userID, ok := val.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		c.JSON(http.StatusOK, gin.H{
			"planType": "guest",
			"status":   "active",
		})
		return
	}

	if h.subRepo != nil {
		sub, err := h.subRepo.GetByUserID(userID)
		if err == nil && sub != nil {
			c.JSON(http.StatusOK, sub)
			return
		}
	}

	c.JSON(http.StatusOK, domain.UserSubscription{
		ID:             uuid.New(),
		UserID:         userID,
		PlanType:       "starter",
		Status:         "active",
		HasAnalytics:   true,
		HasCustomAlias: true,
	})
}
