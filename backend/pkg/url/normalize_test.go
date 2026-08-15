package url

import (
	"testing"
)

func TestNormalize(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
		wantErr  bool
	}{
		{
			name:     "standard https url",
			input:    "https://example.com/path",
			expected: "https://example.com/path",
			wantErr:  false,
		},
		{
			name:     "missing scheme defaults to https",
			input:    "github.com/atluixx/wsio",
			expected: "https://github.com/atluixx/wsio",
			wantErr:  false,
		},
		{
			name:     "empty input",
			input:    "   ",
			expected: "",
			wantErr:  true,
		},
		{
			name:     "strips fragment",
			input:    "https://example.com/page#section",
			expected: "https://example.com/page",
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Normalize(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("Normalize() error = %v, wantErr %v", err, tt.wantErr)
			}
			if got != tt.expected {
				t.Errorf("Normalize() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestHash(t *testing.T) {
	h1 := Hash("https://example.com")
	h2 := Hash("https://example.com")
	h3 := Hash("https://other.com")

	if h1 != h2 {
		t.Errorf("Hash() deterministic mismatch: %v != %v", h1, h2)
	}
	if h1 == h3 {
		t.Errorf("Hash() expected collision avoidance: %v == %v", h1, h3)
	}
	if len(h1) > 12 {
		t.Errorf("Hash() length = %d; expected <= 12", len(h1))
	}
}
