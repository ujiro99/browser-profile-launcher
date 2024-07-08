//go:build windows

package profile

import (
	"errors"
	"os/exec"
	"syscall"
)

var (
	chromeDir = expand("~/AppData/Local/Google/Chrome/User Data/")
	edgeDir   = expand("~/AppData/Local/Microsoft/Edge/User Data/")
)

var paths = map[string]string{
	"chrome": chromeDir,
	"msedge": edgeDir,
}

var iconName = map[string]string{
	"chrome": "Google Profile.ico",
	"msedge": "Edge Profile.ico",
}

// 指定したプロファイルのブラウザを起動する
func Run(browser string, directory string, options []string) error {
	var cmd *exec.Cmd
	if browser == "chrome" || browser == "msedge" {
		args := []string{"/c", "start", browser, "--profile-directory=" + directory}
		args = append(args, options...)
		cmd = exec.Command("cmd", args...)
	}
	if cmd == nil {
		return errors.New("Invalid browser: " + browser)
	}
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}
