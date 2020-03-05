pleb
====

[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/deedlefake/pleb)](https://hub.docker.com/r/deedlefake/pleb/builds)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/DeedleFake/pleb?label=version)](https://pkg.go.dev/mod/github.com/DeedleFake/pleb)

Pleb is a very simple local-network oriented video streaming site. All you have to do is throw an MP4 or other compatible video file into a specified directory, and it will show up in a list of streamable videos in the browser interface. That's it. No fancy client. No fancy database. Nothing. Just stick a file in a directory and watch it in your browser.

![Screenshot](https://user-images.githubusercontent.com/326750/76006704-e1a83480-5eda-11ea-9581-84b62f44c1d4.png)

It even looks nice on phones, although your mileage may vary in Chrome due to WebKit, and by extension Blink, being a buggy flaming garbage fire, especially when it comes to flexbox. This particular screenshot was taken in Brave, so it seems to be working for now at least.

<img width="300" alt="Phone Screenshot" src="https://user-images.githubusercontent.com/326750/76007439-09e46300-5edc-11ea-9190-35e7625788c2.jpg" />

Dependencies
------------

<dl>
	<dt>ffmpeg and ffprobe</dt>
	<dd>Used for generating thumbnails. If these aren't found, thumbnails won't work, but everything should still function fine.</dd>
</dl>

Installation
------------

To install for simple command-line usage, use

```bash
go get -u -v github.com/DeedleFake/pleb/cmd/pleb
```

For Docker, a container is provided as `deedlefake/pleb`:

```bash
docker run -it --rm -v "/srv/videos:/videos:ro" -p 8080:8080 deedlefake/pleb
```

Usage
-----

To use, simply point pleb at a directory that has videos in it:

```bash
pleb -videos /srv/videos
```

By default, pleb serves to port `8080`, so open http://localhost:8080 in your browser.

Video titles are pulled directly from the filenames by simply stripping the extension, so name the file something that's descriptive. Times, which can be used for sorting, are simply the modification time of the video file.
