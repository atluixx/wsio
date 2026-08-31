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
		{
			name:     "mailto passthrough",
			input:    "mailto:hi@example.com",
			expected: "mailto:hi@example.com",
			wantErr:  false,
		},
		{
			name:     "tel passthrough",
			input:    "tel:+15551234567",
			expected: "tel:+15551234567",
			wantErr:  false,
		},
		{
			name:    "empty mailto rejected",
			input:   "mailto:",
			wantErr: true,
		},
		{
			name:    "javascript scheme rejected",
			input:   "javascript:alert(1)",
			wantErr: true,
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
