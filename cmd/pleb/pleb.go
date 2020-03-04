package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
)

func logHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		log.Printf("%v %v", req.Method, req.URL.Path)
		h.ServeHTTP(rw, req)
	})
}

func errorHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		defer func() {
			switch err := recover().(type) {
			case nil:
				return

			case runtime.Error:
				log.Printf("Runtime error: %v", err)
				http.Error(rw, "Internal error", http.StatusInternalServerError)

			default:
				log.Printf("Error: %v", err)
				http.Error(rw, fmt.Sprint(err), http.StatusInternalServerError)
			}
		}()

		h.ServeHTTP(rw, req)
	})
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

func main() {
	videos := flag.String("videos", "videos", "Directory containing the videos.")
	flag.Parse()

	http.Handle("/videos/", logHandler(errorHandler(http.StripPrefix("/videos/", videoHandler(*videos)))))
	http.Handle("/videos.json", logHandler(errorHandler(videoListHandler(*videos))))
	http.Handle("/", logHandler(pubHandler()))

	log.Println("Starting server...")
	err := http.ListenAndServe(":8080", nil)
	fmt.Fprintf(os.Stderr, "Error: %v\n", err)
	os.Exit(1)
}
