package main

import (
	"log"
	"os"
	"path"

	"github.com/adrg/xdg"
)

var configFile = "config.json"
var packageName = "chrome-profile-selector"

func Load() (string, error) {
	configFilePath, err := xdg.ConfigFile(path.Join(packageName, configFile))
	if err != nil {
		log.Println("コンフィグファイルが見つかりません:", configFilePath)
	}

	text, err := os.ReadFile(configFilePath)
	if err != nil {
		log.Println("コンフィグファイルを読み込めません:", err)
		return "", err
	}
	return string(text), nil
}

func Save(text string) error {
	configFilePath, err := xdg.ConfigFile(path.Join(packageName, configFile))
	if err != nil {
		log.Println("コンフィグファイルが見つかりません:", configFilePath)
	}

	if err := os.WriteFile(configFilePath, []byte(text), 0666); err != nil {
		log.Fatal(err)
	}

	return nil
}
