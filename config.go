package main

import (
	"errors"
	"log"
	"os"
	"path"

	"github.com/adrg/xdg"
)

var configFile = "config.json"
var packageName = "browser-profile-launcher"
var packageNameOld = "chrome-profile-selector"

func Load() (string, error) {
	configFilePath, err := xdg.ConfigFile(path.Join(packageName, configFile))
	if err != nil {
		log.Println("コンフィグファイルが見つかりません:", configFilePath)
	}
	ret, err := loadFile(configFilePath)
	if err == nil {
		return ret, nil
	}

	oldFilePath, err := xdg.ConfigFile(path.Join(packageNameOld, configFile))
	if err != nil {
		log.Println("コンフィグファイルが見つかりません:", oldFilePath)
	}
	ret, err = loadFile(oldFilePath)
	if err == nil {
		return ret, nil
	}

	log.Println("コンフィグファイルの読み込み失敗")
	return "", errors.New("Failed to load config file")
}

func loadFile(filePath string) (string, error) {
	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		log.Println("コンフィグファイルが存在しません:", err)
		return "", err
	}

	text, err := os.ReadFile(filePath)
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
