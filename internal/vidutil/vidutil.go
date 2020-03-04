package vidutil

import (
	"bytes"
	"context"
	"io"
	"os/exec"
	"strconv"
	"time"
)

func Duration(ctx context.Context, file string) (time.Duration, error) {
	ffprobe := exec.CommandContext(
		ctx,
		"ffprobe",
		"-v",
		"error",
		"-select_streams",
		"v:0",
		"-show_entries",
		"stream=duration",
		"-of",
		"default=noprint_wrappers=1:nokey=1",
		file,
	)

	out, err := ffprobe.Output()
	if err != nil {
		return 0, err
	}

	sec, err := strconv.ParseFloat(string(bytes.TrimSpace(out)), 64)
	if err != nil {
		return 0, err
	}

	return time.Duration(sec * float64(time.Second)), nil
}

func Frame(ctx context.Context, w io.Writer, file string, timestamp time.Duration) error {
	ffmpeg := exec.CommandContext(
		ctx,
		"ffmpeg",
		"-ss",
		strconv.FormatFloat(timestamp.Seconds(), 'f', 3, 64),
		"-i",
		file,
		"-vframes",
		"1",
		"-c:v",
		"png",
		"-f",
		"image2pipe",
		"-",
	)
	ffmpeg.Stdout = w

	return ffmpeg.Run()
}
