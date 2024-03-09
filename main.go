package main

import (
	"encoding/json"
	"log"
	"os"
	"os/user"
	"path/filepath"
	"strings"
)

type LocalState struct {
	Profile struct {
		InfoCache     map[string]Profile `json:"info_cache"`
		ProfilesOrder []string           `json:"profiles_order"`
	} `json:"profile"`
}

type Profile struct {
	Directory    string
	Name         string `json:"name"`
	ShortcutName string `json:"shortcut_name"`
}

func main() {
	paths := []string{
		clean("~/AppData/Local/Microsoft/Edge/User Data/"),
		clean("~/AppData/Local/Google/Chrome/User Data/"),
	}

	// directories := enumerateDirectories(paths)

	for _, path := range paths {
		profiles := parseProfiles(path)
		for _, p := range profiles {
			log.Printf("ディレクトリ: %s, プロファイル名: %s", p.Directory, p.ShortcutName)
		}
	}
}

func clean(path string) string {
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
func parseProfiles(directory string) []Profile {
	path := filepath.Join(directory, "Local State")
	text, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	var data LocalState
	err = json.Unmarshal(text, &data)
	if err != nil {
		log.Fatal("Local Stateファイルのjsonデコードに失敗:", err)
	}

	profiles := make([]Profile, len(data.Profile.InfoCache))
	for i, v := range data.Profile.ProfilesOrder {
		profiles[i] = data.Profile.InfoCache[v]
		profiles[i].Directory = v
	}
	return profiles
}

// 指定されたパス配列内のディレクトリから、
// "Default"または"Profile"で始まるディレクトリ名を列挙する。
func enumerateDirectories(paths []string) []string {
	var directories []string
	for _, path := range paths {
		files, err := os.ReadDir(path)
		if err != nil {
			log.Printf("ディレクトリ %s の読み込みに失敗しました: %v", path, err)
			continue
		}
		for _, file := range files {
			if file.IsDir() && (strings.HasPrefix(file.Name(), "Default") || strings.HasPrefix(file.Name(), "Profile")) {
				fullPath := filepath.Join(path, file.Name())
				directories = append(directories, fullPath)
			}
		}
	}
	return directories
}
