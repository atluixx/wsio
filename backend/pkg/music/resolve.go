// Package music turns a raw string the profile owner pasted — a YouTube,
// Spotify or SoundCloud link, a direct audio URL, or a plain song name — into a
// playable "featured track" with a title and artwork. Nothing here downloads or
// rehosts copyrighted audio: platform links stay as links (played through their
// own embeds), and song-name lookups use Apple's public iTunes Search API, which
// only returns a ~30-second preview clip.
package music

import (
	"encoding/json"
	"net/http"
	"net/url"
	"path"
	"regexp"
	"strings"
	"time"
)

// Kind identifies how the public page should play a track.
const (
	KindNone       = ""
	KindYouTube    = "youtube"
	KindSpotify    = "spotify"
	KindSoundCloud = "soundcloud"
	KindAudio      = "audio" // direct file or an iTunes preview clip
)

// Track is the resolved result stored on the profile.
type Track struct {
	Kind       string
	SourceURL  string // the URL an embed player loads (empty for KindAudio)
	Title      string
	ArtworkURL string
	StreamURL  string // a directly playable audio URL (KindAudio only)
}

var (
	client         = &http.Client{Timeout: 5 * time.Second}
	audioExtRe     = regexp.MustCompile(`(?i)\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)(\?.*)?$`)
	appleTrackIDRe = regexp.MustCompile(`i=(\d+)`)
	appleAlbumIDRe = regexp.MustCompile(`/(?:album|song)/[^/]+/(\d+)`)
)

// Resolve classifies raw and enriches it with a title and artwork. It never
// errors: on any failure it returns the best Track it could build (often just a
// Kind and SourceURL), so saving a profile always succeeds.
func Resolve(raw string) Track {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return Track{}
	}

	if u, err := url.Parse(raw); err == nil && (u.Scheme == "http" || u.Scheme == "https") {
		host := strings.ToLower(strings.TrimPrefix(u.Host, "www."))
		switch {
		case host == "youtube.com" || host == "m.youtube.com" || host == "youtu.be" || host == "music.youtube.com":
			return oembedTrack(KindYouTube, raw, "https://www.youtube.com/oembed?format=json&url=")
		case host == "open.spotify.com":
			return oembedTrack(KindSpotify, raw, "https://open.spotify.com/oembed?url=")
		case strings.HasSuffix(host, "soundcloud.com"):
			return oembedTrack(KindSoundCloud, raw, "https://soundcloud.com/oembed?format=json&url=")
		case host == "music.apple.com" || host == "itunes.apple.com":
			return appleLookup(raw)
		case audioExtRe.MatchString(u.Path):
			return Track{Kind: KindAudio, StreamURL: raw, Title: titleFromPath(u.Path)}
		default:
			// An unknown link — assume it points straight at an audio stream.
			return Track{Kind: KindAudio, StreamURL: raw, Title: titleFromPath(u.Path)}
		}
	}

	// Not a URL: treat it as a search query.
	return appleSearch(raw)
}

func titleFromPath(p string) string {
	base := path.Base(p)
	base = strings.TrimSuffix(base, path.Ext(base))
	base = strings.ReplaceAll(base, "-", " ")
	base = strings.ReplaceAll(base, "_", " ")
	return strings.TrimSpace(base)
}

type oembedResponse struct {
	Title        string `json:"title"`
	AuthorName   string `json:"author_name"`
	ThumbnailURL string `json:"thumbnail_url"`
}

func oembedTrack(kind, sourceURL, endpoint string) Track {
	t := Track{Kind: kind, SourceURL: sourceURL}
	var r oembedResponse
	if getJSON(endpoint+url.QueryEscape(sourceURL), &r) == nil {
		t.Title = strings.TrimSpace(r.Title)
		if t.Title == "" {
			t.Title = strings.TrimSpace(r.AuthorName)
		}
		t.ArtworkURL = r.ThumbnailURL
	}
	return t
}

type itunesResponse struct {
	Results []struct {
		TrackName     string `json:"trackName"`
		ArtistName    string `json:"artistName"`
		PreviewURL    string `json:"previewUrl"`
		ArtworkURL100 string `json:"artworkUrl100"`
	} `json:"results"`
}

func appleLookup(raw string) Track {
	id := ""
	if m := appleTrackIDRe.FindStringSubmatch(raw); m != nil {
		id = m[1]
	} else if m := appleAlbumIDRe.FindStringSubmatch(raw); m != nil {
		id = m[1]
	}
	if id == "" {
		return Track{Kind: KindAudio, SourceURL: raw}
	}
	return itunesResult("https://itunes.apple.com/lookup?id=" + id)
}

func appleSearch(term string) Track {
	return itunesResult("https://itunes.apple.com/search?media=music&entity=song&limit=1&term=" + url.QueryEscape(term))
}

func itunesResult(endpoint string) Track {
	var r itunesResponse
	if getJSON(endpoint, &r) != nil || len(r.Results) == 0 {
		return Track{}
	}
	res := r.Results[0]
	title := strings.TrimSpace(res.TrackName)
	if res.ArtistName != "" {
		title = strings.TrimSpace(res.ArtistName + " – " + res.TrackName)
	}
	return Track{
		Kind:       KindAudio,
		Title:      title,
		StreamURL:  res.PreviewURL,
		ArtworkURL: strings.Replace(res.ArtworkURL100, "100x100bb", "300x300bb", 1),
	}
}

func getJSON(endpoint string, out any) error {
	req, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "wsio-linkinbio/1.0 (+https://wsio.lol)")
	req.Header.Set("Accept", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errStatus(resp.StatusCode)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

type errStatus int

func (e errStatus) Error() string { return "unexpected status" }
