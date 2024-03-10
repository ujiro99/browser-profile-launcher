package profile

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"sort"
)

type localState struct {
	Profile struct {
		InfoCache     map[string]Profile `json:"info_cache"`
		ProfilesOrder []string           `json:"profiles_order"`
	} `json:"profile"`
}

type Profile struct {
	Name         string `json:"name"`
	ShortcutName string `json:"shortcut_name"`
	Browser      string `json:"browser"`
	Directory    string `json:"directory"`
	IcoPath      string `json:"ico_path"`
}

func List() []Profile {
	paths := map[string]string{
		"chrome": expand("~/AppData/Local/Google/Chrome/User Data/"),
		"msedge": expand("~/AppData/Local/Microsoft/Edge/User Data/"),
	}
	iconName := map[string]string{
		"chrome": "Google Profile.ico",
		"msedge": "Edge Profile.ico",
	}

	var profiles []Profile
	for b, path := range paths {
		p, err := parseProfiles(path)
		if err != nil {
			break
		}
		for i, v := range p {
			p[i].Browser = b
			p[i].IcoPath = filepath.Join(path, v.Directory, iconName[b])
		}
		// sort by ShortcutName
		sort.SliceStable(p, func(i, j int) bool { return p[i].ShortcutName < p[j].ShortcutName })
		profiles = append(profiles, p...)
	}
	return profiles
}

func expand(path string) string {
	if len(path) > 1 && path[0:2] == "~/" {
		my, err := user.Current()
		if err != nil {
			log.Println("ユーザーが見つかりません", err)
		} else {
			path = my.HomeDir + path[1:]
		}
	}
	path = os.ExpandEnv(path)
	return filepath.Clean(path)
}

// Local Stateファイルを読み込み、
// プロファイル構造体を返す。
func parseProfiles(directory string) ([]Profile, error) {
	path := filepath.Join(directory, "Local State")
	text, err := os.ReadFile(path)
	if err != nil {
		log.Println("Local Stateファイルが見つかりません:", err)
		return nil, err
	}

	var data localState
	err = json.Unmarshal(text, &data)
	if err != nil {
		log.Println("Local Stateファイルのjsonデコードに失敗:", err)
		return nil, err
	}

	profiles := make([]Profile, len(data.Profile.InfoCache))
	for i, v := range data.Profile.ProfilesOrder {
		profiles[i] = data.Profile.InfoCache[v]
		profiles[i].Directory = v
	}
	return profiles, nil
}

func Run(browser string, directory string) error {
	var cmd *exec.Cmd
	if browser == "chrome" {
		args := []string{"/c", "start", "chrome", "--profile-directory=" + directory}
		cmd = exec.Command("cmd", args...)
	} else if browser == "msedge" {
		args := []string{"/c", "start", "msedge", "--profile-directory=" + directory}
		cmd = exec.Command("cmd", args...)
	}
	if cmd == nil {
		return errors.New("Invalid browser")
	}
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}
