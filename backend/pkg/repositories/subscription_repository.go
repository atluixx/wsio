package repositories

import (
	"errors"
	"sync"
	"time"

	"github.com/atluixx/wsio/pkg/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var ErrSubscriptionNotFound = errors.New("subscription not found")

type SubscriptionRepository interface {
	GetByUserID(userID uuid.UUID) (*domain.UserSubscription, error)
	Upsert(sub *domain.UserSubscription) error
	GetByStripeCustomerID(customerID string) (*domain.UserSubscription, error)
	FindAll() ([]*domain.UserSubscription, error)
}

type postgresSubscriptionRepository struct {
	db *gorm.DB
}

func NewPostgresSubscriptionRepository(db *gorm.DB) SubscriptionRepository {
	return &postgresSubscriptionRepository{db: db}
}

func (r *postgresSubscriptionRepository) GetByUserID(userID uuid.UUID) (*domain.UserSubscription, error) {
	var sub domain.UserSubscription
	err := r.db.Where("user_id = ?", userID).First(&sub).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrSubscriptionNotFound
	}
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *postgresSubscriptionRepository) GetByStripeCustomerID(customerID string) (*domain.UserSubscription, error) {
	var sub domain.UserSubscription
	err := r.db.Where("stripe_customer_id = ?", customerID).First(&sub).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrSubscriptionNotFound
	}
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *postgresSubscriptionRepository) Upsert(sub *domain.UserSubscription) error {
	sub.UpdatedAt = time.Now()
	if sub.ID == uuid.Nil {
		sub.ID = uuid.New()
		sub.CreatedAt = time.Now()
	}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"plan_type", "status", "stripe_customer_id", "stripe_subscription_id", "has_analytics", "has_custom_alias", "updated_at"}),
	}).Create(sub).Error
}

func (r *postgresSubscriptionRepository) FindAll() ([]*domain.UserSubscription, error) {
	var subs []*domain.UserSubscription
	err := r.db.Order("created_at desc").Find(&subs).Error
	return subs, err
}

type inMemorySubscriptionRepository struct {
	mu            sync.RWMutex
	subscriptions map[uuid.UUID]*domain.UserSubscription
}

func NewInMemorySubscriptionRepository() SubscriptionRepository {
	return &inMemorySubscriptionRepository{
		subscriptions: make(map[uuid.UUID]*domain.UserSubscription),
	}
}

func (r *inMemorySubscriptionRepository) GetByUserID(userID uuid.UUID) (*domain.UserSubscription, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	sub, ok := r.subscriptions[userID]
	if !ok {
		return nil, ErrSubscriptionNotFound
	}
	return sub, nil
}

func (r *inMemorySubscriptionRepository) GetByStripeCustomerID(customerID string) (*domain.UserSubscription, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, sub := range r.subscriptions {
		if sub.StripeCustomerId == customerID {
			return sub, nil
		}
	}
	return nil, ErrSubscriptionNotFound
}

func (r *inMemorySubscriptionRepository) Upsert(sub *domain.UserSubscription) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	sub.UpdatedAt = time.Now()
	if sub.ID == uuid.Nil {
		sub.ID = uuid.New()
		sub.CreatedAt = time.Now()
	}
	r.subscriptions[sub.UserID] = sub
	return nil
}

func (r *inMemorySubscriptionRepository) FindAll() ([]*domain.UserSubscription, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var subs []*domain.UserSubscription
	for _, sub := range r.subscriptions {
		subs = append(subs, sub)
	}
	return subs, nil
}
