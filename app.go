package main

import (
	"browser-profile-launcher/profile"
	"context"
	_ "embed"
	"errors"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"syscall"

	"github.com/fsnotify/fsnotify"
	"github.com/tidwall/gjson"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/exp/slices"
)

//go:embed wails.json
var wailsJSON string

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// プロファイルの変更監視
	go watchProfiles(ctx)
}

func (a *App) Run(browser string, directory string, options []string) string {
	err := profile.Run(browser, directory, options)
	if err != nil {
		return err.Error()
	}
	return ""
}

func (a *App) List() []profile.Profile {
	return profile.List()
}

func (a *App) LoadConfig() (string, error) {
	return Load()
}

func (a *App) SaveConfig(text string) error {
	return Save(text)
}

func (a *App) GetVersion() string {
	version := gjson.Get(wailsJSON, "Info.productVersion")
	return version.String()
}

func (a *App) OnSecondInstanceLaunch(secondInstanceData options.SecondInstanceData) {
	runtime.WindowUnminimise(a.ctx)
	runtime.Show(a.ctx)
}

func watchProfiles(ctx context.Context) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Print(err)
	}
	defer watcher.Close()

	// 変更対象のファイル
	files := profile.FilesForWatch()

	go func() {
		old := profile.List()
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					log.Println("Profile watcher closed.")
					return
				}
				if !slices.Contains(files, event.Name) {
					continue
				}
				if event.Op == fsnotify.Remove || event.Op == fsnotify.Chmod {
					continue
				}
				now := profile.List()
				if now == nil {
					continue
				}
				// プロファイルが変更された場合だけ、イベントを発行
				if !reflect.DeepEqual(old, now) {
					old = now
					log.Println("Profile changed: ", event.Name)
					runtime.EventsEmit(ctx, "profileChanged", now)
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("error:", err)
			}
		}
	}()

	// 監視対象に追加
	for _, p := range files {
		if !exists(p) {
			continue
		}
		log.Println("Add watch: ", filepath.Dir(p))
		err = watcher.Add(filepath.Dir(p))
		if err != nil {
			if errors.Is(err, syscall.EOPNOTSUPP) {
				// サポートされていない操作に対する処理
				log.Println("Operation not supported on socket")
				continue
			}
			log.Fatal(err)
		}
	}

	log.Println("Watching start...")
	<-make(chan struct{})
}

func exists(filename string) bool {
	_, err := os.Stat(filename)
	return err == nil
}
