package main

import (
	"log"

	"github.com/ujiro99/chrome-profile-selector/profile"
)

func main() {
	for _, p := range profile.List() {
		log.Printf("ディレクトリ: %s, プロファイル名: %s", p.Directory, p.ShortcutName)
	}
}
