package url

import (
	"errors"
	"net/url"
	"strings"
)

// passthroughSchemes are non-web URL schemes that link-in-bio pages legitimately
// use (email, phone, SMS). They are returned untouched apart from trimming.
var passthroughSchemes = []string{"mailto:", "tel:", "sms:"}

// blockedSchemes are rejected outright to keep link targets from executing in a
// visitor's browser.
var blockedSchemes = []string{"javascript:", "data:", "vbscript:", "file:"}

func Normalize(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", errors.New("invalid URL")
	}

	lower := strings.ToLower(raw)

	for _, s := range blockedSchemes {
		if strings.HasPrefix(lower, s) {
			return "", errors.New("unsupported URL scheme")
		}
	}

	for _, s := range passthroughSchemes {
		if strings.HasPrefix(lower, s) {
			if strings.TrimSpace(raw[len(s):]) == "" {
				return "", errors.New("invalid URL")
			}
			return raw, nil
		}
	}

	if !strings.HasPrefix(lower, "http://") && !strings.HasPrefix(lower, "https://") {
		raw = "https://" + raw
	}

	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}

	if u.Scheme == "" || u.Host == "" {
		return "", errors.New("invalid URL")
	}

	u.Scheme = strings.ToLower(u.Scheme)
	u.Host = strings.ToLower(u.Host)
	u.Fragment = ""

	return u.String(), nil
}
