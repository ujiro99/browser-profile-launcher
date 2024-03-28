package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"browser-profile-launcher/profile"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

type IcoLoader struct {
	http.Handler
}

func NewIcoLoader() *IcoLoader {
	return &IcoLoader{}
}

func (h *IcoLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var err error
	if !strings.HasSuffix(req.URL.Path, ".ico") {
		return
	}
	if req.URL.Path == "/favicon.ico" {
		return
	}
	log.Println("Req: ", req.URL.Path)

	query := req.URL.Query()
	browser := query.Get("browser")
	directory := query.Get("directory")
	var filePath string
	for _, p := range profile.List() {
		if p.Browser == browser && p.Directory == directory {
			filePath = p.IcoPath
			break
		}
	}
	if filePath == "" {
		res.WriteHeader(http.StatusNotFound)
	}

	fileData, err := os.ReadFile(filePath)
	if err != nil {
		res.WriteHeader(http.StatusBadRequest)
		res.Write([]byte(fmt.Sprintf("Could not load file %s", req.URL)))
	}

	res.Write(fileData)
}

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "Browser Profile Launcher",
		Width:  420,
		Height: 580,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: NewIcoLoader(),
		},
		Logger:             logger.NewFileLogger("browser-profile-launcher.log"),
		LogLevel:           logger.DEBUG,
		LogLevelProduction: logger.ERROR,
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId:               "3ebf5e8f-9955-4a4d-8865-d10f4de79392",
			OnSecondInstanceLaunch: app.OnSecondInstanceLaunch,
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
