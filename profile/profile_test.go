package profile

import (
	"testing"
)

func TestList(t *testing.T) {
	profiles := List()

	// List() が正常に実行できることを確認
	t.Logf("Found %d profiles", len(profiles))

	for i, p := range profiles {
		t.Logf("Profile[%d]: Browser=%s, Name=%s, Directory=%s", i, p.Browser, p.Name, p.Directory)
	}
}
