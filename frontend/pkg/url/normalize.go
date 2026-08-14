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
	u.RawQuery = u.Query().Encode()

	return u.String(), nil
}

func Hash(normalizedURL string) string {
	hash := sha256.Sum256([]byte(normalizedURL))

	return base64.RawURLEncoding.EncodeToString(hash[:])[:12]
}
