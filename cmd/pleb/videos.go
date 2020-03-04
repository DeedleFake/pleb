package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/DeedleFake/pleb/internal/vidutil"
)

func videoListHandler(root string) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		dir, err := os.Open(root)
		if err != nil {
			panic(err)
		}
		defer dir.Close()

		files, err := dir.Readdir(-1)
		if err != nil {
			panic(err)
		}

		data := make([]map[string]interface{}, 0, len(files))
		for _, file := range files {
			if file.IsDir() {
				continue
			}
			switch filepath.Ext(file.Name()) {
			case ".mp4", ".webm", ".avi":
			default:
				continue
			}

			data = append(data, map[string]interface{}{
				"time": file.ModTime(),
				"file": file.Name(),
			})
		}

		e := json.NewEncoder(rw)
		err = e.Encode(data)
		if err != nil {
			panic(err)
		}
	})
}

func videoHandler(root string) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		http.ServeFile(rw, req, filepath.Join(root, req.URL.Path))
	})
}

func thumbnailHandler(root string) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		file := filepath.Join(root, req.URL.Path)

		d, err := vidutil.Duration(req.Context(), file)
		if err != nil {
			var eerr *exec.ExitError
			if errors.As(err, &eerr) {
				log.Printf("%s", eerr.Stderr)
			}

			panic(err)
		}

		err = vidutil.Frame(req.Context(), rw, file, d/3)
		if err != nil {
			var eerr *exec.ExitError
			if errors.As(err, &eerr) {
				log.Printf("%s", eerr.Stderr)
			}

			panic(err)
		}
	})
}
