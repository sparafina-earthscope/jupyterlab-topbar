# jupyterlab-topbar-stop-server

Stop Server button for JupyterLab, similar to the [Log Out](../logout-extension) button.

## Features

### Stop Server button

Adds a "Stop Server" button to the top bar. It shows its own confirmation
dialog (Cancel truly cancels, unlike delegating to JupyterLab's
`filemenu:shutdown` command, whose promise resolves the same way on Cancel
as on confirm), then shuts down running sessions/terminals and calls the
server's `api/shutdown` endpoint. Once that completes it navigates to the
Hub's own logout endpoint (`paths.urls.hubHost` + `paths.urls.hubPrefix` +
`logout`) directly, rather than this server's own `/logout` route, since
that route only works while the single-user server is still alive to
answer it -- which, right after shutdown, it may no longer be.

### Version label (0.2.0 and later)

Shows `Version: <GEOLAB_VERSION>` in the top bar, just before the Stop Server
button. `GEOLAB_VERSION` is an environment variable set in the GeoLab images
(geolab_base, geolab_gpu, geolab_gmt). It must be set in the environment of
the single-user Jupyter server, not only on the Hub.

The browser can't read the server's environment, so this package also
includes a Jupyter server extension. It serves the value at
`<base_url>/jupyterlab-topbar-stop-server/geolab-version` (login required),
which returns `{"geolab_version": "<value or null>"}`.

The label reads `Version: UNKNOWN` when:

- `GEOLAB_VERSION` is unset or empty, or
- the request fails, for example because the server extension isn't
  installed or enabled.

## Requirements

- Python 3.9 or later. CI tests 3.10 and 3.13.
- JupyterLab 4.x
- `jupyter_server` 2.x (for the server extension, 0.2.0 and later)

## Compatibility

- **0.2.0** adds the version label and the server extension. `pip install`
  enables the server extension automatically. It is installed into
  `etc/jupyter/jupyter_server_config.d/`. If an image only copies the
  front-end files (`share/jupyter/labextensions/`) instead of pip-installing
  the package, the label shows `Version: UNKNOWN`. The Stop Server button
  behaves the same as in 0.1.x.
- A running server must be restarted to pick up the server extension after
  upgrading from 0.1.x.

## Installation

### JupyterLab 4.x

```bash
pip install jupyterlab-topbar-stop-server
```

Check that both parts are enabled:

```bash
jupyter labextension list       # jupyterlab-topbar-stop-server  enabled  OK
jupyter server extension list   # jupyterlab_topbar_stop_server  enabled  OK
```

## Contributing

### Development install

Note: You will need Node.js (20 to 24) to build the extension package. Build
with JupyterLab 4.0 to 4.5 (`pip install "jupyterlab>=4.0.0,<4.6"`). See
[Build toolchain](../../README.md#build-toolchain) for why.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the stop-server-extension directory
cd packages/stop-server-extension
jlpm install
# Install package in development mode (also enables the server extension)
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal, with a test version string
GEOLAB_VERSION=test-1.2.3 jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

Changes to the server extension (`jupyterlab_topbar_stop_server/handlers.py`)
need a restart of `jupyter lab`, not just a browser refresh.

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall jupyterlab-topbar-stop-server
```
