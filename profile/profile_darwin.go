//go:build darwin

package profile

import (
	"errors"
	"os/exec"
)

var (
	chromeDir = expand("~/Library/Application Support/Google/Chrome/")
	edgeDir   = expand("~/Library/Application Support/Microsoft Edge/")
)

var paths = map[string]string{
	"Google Chrome":  chromeDir,
	"Microsoft Edge": edgeDir,
}

var iconName = map[string]string{
	"Google Chrome":  "Google Profile Picture.png",
	"Microsoft Edge": "Edge Profile Picture.png",
}

// 指定したプロファイルのブラウザを起動する
func Run(browser string, directory string, options []string) error {
	var cmd *exec.Cmd
	if browser == "Google Chrome" || browser == "Microsoft Edge" {
		args := []string{"-n", "-a", browser, "--args", "--profile-directory=" + directory}
		args = append(args, options...)
		cmd = exec.Command("open", args...)
	}
	if cmd == nil {
		return errors.New("Invalid browser: " + browser)
	}
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}
