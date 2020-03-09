FROM node:alpine AS frontend

COPY frontend /src

WORKDIR /src
RUN yarn install
RUN yarn build

FROM golang:alpine AS backend

COPY . /src

COPY --from=frontend /src/build /src/frontend/build

WORKDIR /src
RUN go generate -v ./...
RUN CGO_ENABLED=0 go build -v -o pleb ./cmd/pleb

FROM alpine

COPY --from=backend /src/pleb /usr/local/bin/pleb

RUN apk add --no-cache ffmpeg

EXPOSE 8080
VOLUME /videos
ENTRYPOINT ["/usr/local/bin/pleb", "-videos", "/videos"]
