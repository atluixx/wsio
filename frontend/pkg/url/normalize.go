package url

import (
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"net/url"
	"strings"
)

func Normalize(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", errors.New("invalid URL")
	}

	if !strings.HasPrefix(raw, "http://") && !strings.HasPrefix(raw, "https://") {
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

func Hash(normalizedURL string) string {
	hash := sha256.Sum256([]byte(normalizedURL))
	encoded := base64.RawURLEncoding.EncodeToString(hash[:])
	if len(encoded) > 12 {
		return encoded[:12]
	}
	return encoded
}
