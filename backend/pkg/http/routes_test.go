package http_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	app "github.com/atluixx/wsio/pkg/http"
	"github.com/atluixx/wsio/pkg/http/handlers"
	"github.com/atluixx/wsio/pkg/repositories"
	"github.com/gin-gonic/gin"
)

// newTestRouter wires the real routes against in-memory repositories.
func newTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	userRepo := repositories.NewInMemoryUserRepository()
	profileRepo := repositories.NewInMemoryProfileRepository()
	linkRepo := repositories.NewInMemoryProfileLinkRepository()
	analyticsRepo := repositories.NewInMemoryProfileAnalyticsRepository()

	app.SetupRoutes(
		r,
		handlers.NewUserHandler(userRepo),
		handlers.NewProfileHandler(profileRepo, linkRepo, analyticsRepo),
		handlers.NewAdminHandler(userRepo, profileRepo, linkRepo),
	)
	return r
}

func do(t *testing.T, r *gin.Engine, method, path, cookie string, body any) *httptest.ResponseRecorder {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("encode body: %v", err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	if cookie != "" {
		req.Header.Set("Cookie", "session="+cookie)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// TestRoutesRegister ensures SetupRoutes does not panic (e.g. the static
// "reorder" vs ":id" segment must coexist).
func TestRoutesRegister(t *testing.T) {
	newTestRouter()
}

func TestProfileLifecycle(t *testing.T) {
	r := newTestRouter()

	// register -> get session cookie
	w := do(t, r, http.MethodPost, "/api/v1/auth/register", "", map[string]string{
		"email": "creator@example.com", "password": "supersecret",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("register: got %d body %s", w.Code, w.Body)
	}
	var session string
	for _, c := range w.Result().Cookies() {
		if c.Name == "session" {
			session = c.Value
		}
	}
	if session == "" {
		t.Fatal("no session cookie issued")
	}

	// no profile yet
	if w := do(t, r, http.MethodGet, "/api/v1/me/profile", session, nil); w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 before profile creation, got %d", w.Code)
	}

	// create profile
	w = do(t, r, http.MethodPut, "/api/v1/me/profile", session, map[string]string{
		"username": "Creator", "displayName": "The Creator", "bio": "hi", "theme": "midnight",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("create profile: got %d body %s", w.Code, w.Body)
	}

	// reserved username rejected
	if w := do(t, r, http.MethodPut, "/api/v1/me/profile", session, map[string]string{"username": "admin"}); w.Code != http.StatusConflict {
		t.Fatalf("expected 409 for reserved username, got %d", w.Code)
	}

	// add two links
	var link1 struct {
		ID string `json:"id"`
	}
	w = do(t, r, http.MethodPost, "/api/v1/me/profile/links", session, map[string]string{"label": "GitHub", "url": "github.com/creator"})
	if w.Code != http.StatusCreated {
		t.Fatalf("create link: got %d body %s", w.Code, w.Body)
	}
	json.Unmarshal(w.Body.Bytes(), &link1)
	w = do(t, r, http.MethodPost, "/api/v1/me/profile/links", session, map[string]string{"label": "Site", "url": "https://creator.dev"})
	if w.Code != http.StatusCreated {
		t.Fatalf("create link 2: got %d", w.Code)
	}
	var link2 struct {
		ID string `json:"id"`
	}
	json.Unmarshal(w.Body.Bytes(), &link2)

	// reorder (exercises the static "reorder" path segment)
	w = do(t, r, http.MethodPut, "/api/v1/me/profile/links/reorder", session, map[string][]string{
		"orderedIds": {link2.ID, link1.ID},
	})
	if w.Code != http.StatusOK {
		t.Fatalf("reorder: got %d body %s", w.Code, w.Body)
	}

	// hide link1
	active := false
	w = do(t, r, http.MethodPut, "/api/v1/me/profile/links/"+link1.ID, session, map[string]*bool{"active": &active})
	if w.Code != http.StatusOK {
		t.Fatalf("update link: got %d body %s", w.Code, w.Body)
	}

	// public profile shows only the visible link
	w = do(t, r, http.MethodGet, "/api/v1/profiles/creator", "", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("public profile: got %d body %s", w.Code, w.Body)
	}
	var pub struct {
		Username string `json:"username"`
		Links    []struct {
			ID    string `json:"id"`
			Label string `json:"label"`
		} `json:"links"`
	}
	json.Unmarshal(w.Body.Bytes(), &pub)
	if pub.Username != "creator" || len(pub.Links) != 1 || pub.Links[0].Label != "Site" {
		t.Fatalf("unexpected public profile: %+v", pub)
	}

	// click redirect + analytics
	w = do(t, r, http.MethodGet, "/api/v1/click/"+link2.ID, "", nil)
	if w.Code != http.StatusFound {
		t.Fatalf("click redirect: got %d", w.Code)
	}
	if loc := w.Header().Get("Location"); loc != "https://creator.dev" {
		t.Fatalf("click redirect location: %q", loc)
	}

	w = do(t, r, http.MethodGet, "/api/v1/me/profile/analytics", session, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("analytics: got %d body %s", w.Code, w.Body)
	}
	var summary struct {
		TotalViews  int64 `json:"totalViews"`
		TotalClicks int64 `json:"totalClicks"`
	}
	json.Unmarshal(w.Body.Bytes(), &summary)
	if summary.TotalClicks != 1 || summary.TotalViews != 1 {
		t.Fatalf("unexpected analytics summary: %+v", summary)
	}
}

// TestLogout: the endpoint is unauthenticated, idempotent, and expires the
// session cookie so the browser drops it.
func TestLogout(t *testing.T) {
	r := newTestRouter()

	assertClears := func(w *httptest.ResponseRecorder) {
		t.Helper()
		if w.Code != http.StatusOK {
			t.Fatalf("logout: got %d body %s", w.Code, w.Body)
		}
		var cleared bool
		for _, c := range w.Result().Cookies() {
			if c.Name == "session" && c.Value == "" && c.MaxAge <= 0 {
				cleared = true
			}
		}
		if !cleared {
			t.Fatalf("logout did not expire the session cookie: %v", w.Result().Cookies())
		}
	}

	// works with no session at all
	assertClears(do(t, r, http.MethodPost, "/api/v1/auth/logout", "", nil))

	// and with a real one
	w := do(t, r, http.MethodPost, "/api/v1/auth/register", "", map[string]string{
		"email": "bye@example.com", "password": "supersecret",
	})
	var session string
	for _, c := range w.Result().Cookies() {
		if c.Name == "session" {
			session = c.Value
		}
	}
	assertClears(do(t, r, http.MethodPost, "/api/v1/auth/logout", session, nil))
}
