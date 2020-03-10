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

func validFile(fi os.FileInfo) bool {
	switch filepath.Ext(fi.Name()) {
	case ".mp4", ".webm", ".avi":
		return true
	default:
		return false
	}
}

func handleSub(path string) (sub []string) {
	dir, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer dir.Close()

	files, err := dir.Readdir(-1)
	if err != nil {
		panic(err)
	}

	for _, file := range files {
		if file.IsDir() || !validFile(file) {
			continue
		}

		sub = append(sub, file.Name())
	}

	return sub
}

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
			var sub []string
			if file.IsDir() {
				sub = handleSub(filepath.Join(root, file.Name()))
			}

			if (sub == nil) && !validFile(file) {
				continue
			}

			data = append(data, map[string]interface{}{
				"time": file.ModTime(),
				"file": file.Name(),
				"sub":  sub,
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

		info, err := os.Stat(file)
		if err != nil {
			panic(err)
		}
		if info.IsDir() {
			dir, err := os.Open(file)
			if err != nil {
				panic(err)
			}
			defer dir.Close()

			files, err := dir.Readdir(-1)
			if err != nil {
				panic(err)
			}

			var found bool
			for _, sub := range files {
				if !validFile(sub) {
					continue
				}

				file = filepath.Join(file, sub.Name())
				found = true
				break
			}
			if !found {
				panic(os.ErrNotExist)
			}
		}

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
