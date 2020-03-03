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

	return zipfs.FileServer(pub)
}
