package main

import (
	"chrome-profile-selector/profile"
	"context"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
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
