package main

import (
	"fmt"

	"github.com/gobuffalo/packr"
)

func main() {
	box := packr.NewBox("../../frontend/build")

	f, err := box.Find("index.html")
	if err != nil {
		panic(err)
	}
	fmt.Printf("%s\n", f)
}
