// +build !dev

package main

import (
	"bytes"
	"fmt"
	"net/http"
	"os"

	"github.com/spkg/zipfs"
)

//go:generate go run ../../internal/cmd/embed -o embed.go ../../frontend/build

func pubHandler() http.Handler {
	pub, err := zipfs.NewFromReaderAt(bytes.NewReader(embed[:]), int64(len(embed)), nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	return http.FileServer(&notFoundRedirector{fs: pub, target: "/index.html"})
}

type notFoundRedirector struct {
	fs     http.FileSystem
	target string
}

func (r notFoundRedirector) Open(path string) (http.File, error) {
	f, err := r.fs.Open(path)
	if os.IsNotExist(err) {
		return r.fs.Open(r.target)
	}
	return f, err
}
