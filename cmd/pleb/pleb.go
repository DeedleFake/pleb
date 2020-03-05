// The pleb command runs the pleb server.
//
// The pleb server runs a very simple HTTP server. It has support for
// HTTPS, but that's about it in terms of fancy features. All frontend
// assets are embedded into the binary, so there's no need to run it
// in any particular location.
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
	tlscert := flag.String("tls.cert", "", "TLS certificate to use. Specifying activates HTTPS mode.")
	tlskey := flag.String("tls.key", "", "TLS key to use. Specifiying activates HTTPS mode.")
	videos := flag.String("videos", "videos", "Directory containing the videos.")
	flag.Parse()

	http.Handle("/thumbnail/", logHandler(errorHandler(http.StripPrefix("/thumbnail/", thumbnailHandler(*videos)))))
	http.Handle("/videos/", logHandler(errorHandler(http.StripPrefix("/videos/", videoHandler(*videos)))))
	http.Handle("/videos.json", logHandler(errorHandler(videoListHandler(*videos))))
	http.Handle("/", logHandler(pubHandler()))

	listen := func() error {
		return http.ListenAndServe(*addr, nil)
	}
	if *tlscert != *tlskey {
		listen = func() error {
			return http.ListenAndServeTLS(*addr, *tlscert, *tlskey, nil)
		}
	}

	log.Println("Starting server...")
	err := listen()
	fmt.Fprintf(os.Stderr, "Error: %v\n", err)
	os.Exit(1)
}
