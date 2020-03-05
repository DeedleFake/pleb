pleb
====

[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/deedlefake/pleb)](https://hub.docker.com/r/deedlefake/pleb/builds)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/DeedleFake/pleb?label=version)](https://pkg.go.dev/github.com/DeedleFake/pleb?tab=overview)

Pleb is a very simple local-network oriented video streaming site. All you have to do is throw an MP4 or other compatible video file into a specified directory, and it will show up in a list of streamable videos in the browser interface. That's it. No fancy client. No fancy database. Nothing. Just stick a file in a directory and watch it in your browser.

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
