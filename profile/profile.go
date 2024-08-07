package profile

import (
	"encoding/json"
	"log"
	"os"
	"os/user"
	"path/filepath"
	"sort"
	"time"
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

const localStateFile = "Local State"

func List() []Profile {
	profiles := []Profile{}
	for b, path := range paths {
		retries := 10
		for i := 0; i < retries; i++ {
			p, err := parseProfiles(path)
			if err != nil {
				// エラーの場合、10msec待つ
				// ブラウザが起動中の場合、Local Stateファイルがロックされることがある
				time.Sleep(10 * time.Millisecond)
				continue
			}
			// 取得成功したら、結果用の配列に追加
			for i, v := range p {
				p[i].Browser = b
				var iconPath = filepath.Join(path, v.Directory, iconName[b])
				if exists(iconPath) {
					p[i].IcoPath = iconPath
				}
			}
			// sort by ShortcutName
			sort.SliceStable(p, func(i, j int) bool { return p[i].ShortcutName < p[j].ShortcutName })
			profiles = append(profiles, p...)
			break
		}
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

func exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// Local Stateファイルを読み込み、
// プロファイル構造体を返す。
func parseProfiles(directory string) ([]Profile, error) {
	path := filepath.Join(directory, localStateFile)
	text, err := os.ReadFile(path)
	if err != nil {
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

// プロファイルの変更を監視するためのファイルパスを返す
func FilesForWatch() []string {
	arr := [...]string{
		filepath.Join(chromeDir, localStateFile),
		filepath.Join(edgeDir, localStateFile),
	}
	return arr[:]
}
