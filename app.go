package main

import (
	"chrome-profile-selector/profile"
	"context"
	"log"
	"path/filepath"
	"reflect"

	"github.com/fsnotify/fsnotify"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/exp/slices"
)

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

func (a *App) Run(browser string, directory string) string {
	err := profile.Run(browser, directory)
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

	for _, p := range files {
		log.Println("Add watch: ", filepath.Dir(p))
		err = watcher.Add(filepath.Dir(p))
		if err != nil {
			log.Fatal(err)
		}
	}

	log.Println("Watching start...")
	<-make(chan struct{})
}
