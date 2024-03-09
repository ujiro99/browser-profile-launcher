package main

import (
	"embed"
	"fmt"
	"net/http"
	"os"
	"strings"

	"chrome-profile-selector/profile"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

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
	println("Req: ", req.URL.Path)

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
		Title:  "chrome-profile-selector",
		Width:  320,
		Height: 580,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: NewIcoLoader(),
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
