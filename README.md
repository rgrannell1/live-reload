# live-reload

`live-reload` runs an arbitrary build process (e.g `webpack --watch`) and automatically reloads a website on localhost whenever files change. This helps bypass the completely frustrating process of setting up live-website reloading.

- Triggers the site to reload on change via a websocket connection
- Detects and disables service-workers, clears application-caches

![example image](example.png)

## Usage

```
Usage:
  live-reload [--build=<command>] (--site=<path>) (--public_folder=<path>) [--hide-build-stdout] [--hide-build-stderr] [-
-http_port=<port>] [--wss_port=<port>]

Author:
  Róisin Grannell

Description:
  live-reload is a build-frameworld agnostic method of live-reloading a website when changes are made.

Options:
  --build=<command>         a shell command.
  --hide-build-stderr       should the build's stderr be hidden?
  --hide-build-stdout       should the build's stdout be hidden?
  --http_port=<port>        the static-server port [default: 4000].
  --public_folder=<path>    the root of the public folder for your static-site. Mandatory.
  --site=<path>             the site to load, relative to the public folder. Mandatory.
  --wss_port=<port>         the websocket-server port [default: 4001].
```
