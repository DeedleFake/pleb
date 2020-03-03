// +build dev

package main

import "net/http"

func pubHandler() http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
	})
}
