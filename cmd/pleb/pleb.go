package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
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

func main() {
	addr := flag.String("addr", ":8080", "Address to listen on.")
	videos := flag.String("videos", "videos", "Directory containing the videos.")
	flag.Parse()

	http.Handle("/thumbnail/", logHandler(errorHandler(http.StripPrefix("/thumbnail/", thumbnailHandler(*videos)))))
	http.Handle("/videos/", logHandler(errorHandler(http.StripPrefix("/videos/", videoHandler(*videos)))))
	http.Handle("/videos.json", logHandler(errorHandler(videoListHandler(*videos))))
	http.Handle("/", logHandler(pubHandler()))

	log.Println("Starting server...")
	err := http.ListenAndServe(*addr, nil)
	fmt.Fprintf(os.Stderr, "Error: %v\n", err)
	os.Exit(1)
}
