package main

import (
	"encoding/json"
	"log"
	"os"
	"os/user"
	"path/filepath"
	"strings"
)

type Preferences struct {
	Profile struct {
		Name string `json:"name"`
	} `json:"profile"`
}

func main() {
	paths := []string{
		clean("~/AppData/Local/Microsoft/Edge/User Data/"),
		clean("~/AppData/Local/Google/Chrome/User Data/"),
	}

	directories := enumerateDirectories(paths)

	for _, directory := range directories {
		path := filepath.Join(directory, "Preferences")
		profileName := parseProfileName(path)
		log.Printf("ディレクトリ: %s, プロファイル名: %s", directory, profileName)
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

// preferencesファイルを読み込み、
// プロファイル名を返す。
func parseProfileName(path string) string {
	text, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	var prefs Preferences
	if err := json.Unmarshal(text, &prefs); err != nil {
		log.Fatal(err)
	}

	// profile -> name
	profileName := prefs.Profile.Name
	return profileName
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
