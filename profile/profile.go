package profile

import (
	"encoding/json"
	"log"
	"os"
	"os/user"
	"path/filepath"
)

type localState struct {
	Profile struct {
		InfoCache     map[string]profile `json:"info_cache"`
		ProfilesOrder []string           `json:"profiles_order"`
	} `json:"profile"`
}

type profile struct {
	Name         string `json:"name"`
	ShortcutName string `json:"shortcut_name"`
	Browser      string
	Directory    string
	IcoPath      string
}

func List() []profile {
	paths := map[string]string{
		"chrome": expand("~/AppData/Local/Google/Chrome/User Data/"),
		"msedge": expand("~/AppData/Local/Microsoft/Edge/User Data/"),
	}
	iconName := map[string]string{
		"chrome": "Google Profile.ico",
		"msedge": "Edge Profile.ico",
	}

	var profiles []profile
	for b, path := range paths {
		p := parseProfiles(path)
		for i, v := range p {
			p[i].Browser = b
			p[i].IcoPath = filepath.Join(path, v.Directory, iconName[b])
		}
		profiles = append(profiles, p...)
	}
	return profiles
}

func expand(path string) string {
	if len(path) > 1 && path[0:2] == "~/" {
		my, err := user.Current()
		if err != nil {
			panic(err)
		}
		path = my.HomeDir + path[1:]
	}
	path = os.ExpandEnv(path)
	return filepath.Clean(path)
}

// Local Stateファイルを読み込み、
// プロファイル構造体を返す。
func parseProfiles(directory string) []profile {
	path := filepath.Join(directory, "Local State")
	text, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	var data localState
	err = json.Unmarshal(text, &data)
	if err != nil {
		log.Fatal("Local Stateファイルのjsonデコードに失敗:", err)
	}

	profiles := make([]profile, len(data.Profile.InfoCache))
	for i, v := range data.Profile.ProfilesOrder {
		profiles[i] = data.Profile.InfoCache[v]
		profiles[i].Directory = v
	}
	return profiles
}
