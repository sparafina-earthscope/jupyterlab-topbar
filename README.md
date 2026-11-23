# JupyterLab Top Bar Extensions

[![Extension status](https://img.shields.io/badge/status-ready-success 'ready to be used')](https://jupyterlab-contrib.github.io/)
[![Github Actions Status](https://github.com/jupyterlab-contrib/jupyterlab-topbar/workflows/Build/badge.svg)](https://github.com/jupyterlab-contrib/jupyterlab-topbar/actions/workflows/build.yml)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/sparafina-earthscope/jupyterlab-topbar/main?urlpath=lab)
[![PyPI](https://img.shields.io/pypi/v/jupyterlab-topbar.svg)](https://pypi.org/project/jupyterlab-topbar)

Monorepo to experiment with the top bar space in JupyterLab.

Similar to the [status bar](https://github.com/jupyterlab/jupyterlab/tree/master/packages/statusbar-extension), the top bar can be used to place a few indicators and optimize the overall space.

Inspired by Gnome Shell Top Bar indicators.

![a screenshot of the topbar extensions in JupyterLab](https://github.com/jupyterlab-contrib/jupyterlab-topbar/assets/591645/b620d58e-869d-4b8a-9e7c-47143116cc99)

### Extensions

- [jupyterlab-topbar-text](./packages/topbar-text-extension): add and edit custom text
- [jupyterlab-logout](./packages/logout-extension): add a "Log Out" button
- [jupyterlab-topbar-stop-server](./packages/stop-server-extension): add a "Stop Server" button that shuts down the server and logs out of JupyterHub, plus a "Version:" label showing the server's `GEOLAB_VERSION`
- [jupyterlab-theme-toggle](./packages/theme-toggler-extension): switch between the Light and Dark themes

## Try it online

Try the extensions in your browser with Binder:

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/sparafina-earthscope/jupyterlab-topbar/main?urlpath=lab)

## Requirements and compatibility

- **Python:** 3.9 or later (`requires-python = ">=3.9"`). CI tests Python 3.10
  and 3.13. Python 3.9 is end-of-life and is no longer tested: GitHub's
  `ubuntu-latest` runner (Ubuntu 26.04) has no Python 3.9.
- **JupyterLab:** 4.0 or later, below 5. CI installs each extension into the
  latest JupyterLab 4.x and checks that it loads.

Extension versions for JupyterLab 4.x:

| Extension                       | Minimum for JupyterLab 4.x            | Tested with JupyterLab 4.6 |
| ------------------------------- | ------------------------------------- | -------------------------- |
| `jupyterlab-topbar-text`        | 1.0.0                                 | 1.1.0                      |
| `jupyterlab-logout`             | 1.0.0                                 | 1.1.0                      |
| `jupyterlab-topbar-stop-server` | 0.1.0                                 | 0.2.0                      |
| `jupyterlab-theme-toggler`      | 1.0.0 (**1.1.1** for JupyterLab 4.6+) | 1.1.1                      |

- **`jupyterlab-theme-toggler` before 1.1.1 does not load in JupyterLab 4.6+.**
  JupyterLab 4.6 ships `@jupyter/react-components` 0.17, and older releases
  only accepted 0.16, so `jupyter labextension list` marks them incompatible.
  1.1.1 accepts both, so it works with every JupyterLab 4.x.
- **`jupyterlab-topbar-stop-server` 0.2.0 adds a Jupyter server extension**
  (for the "Version:" label) and depends on `jupyter_server` 2.x. `pip install`
  enables it automatically. Without the server extension, for example when
  only the front-end files are copied into an environment, the label shows
  "Version: UNKNOWN" and the Stop Server button still works.

## Installation

### JupyterLab 4.x

Use latest versions of the extensions. **Note** that `jupyterlab-system-monitor`
extension will be distributed along with `jupyter-resource-usage` package for
JupyterLab 4.x

```bash
# topbar text extension
pip install jupyterlab-topbar-text

# logout extension
pip install jupyterlab-logout

# stop server extension
pip install jupyterlab-topbar-stop-server

# theme toggler extension
pip install jupyterlab-theme-toggler
```

### JupyterLab 3.0

Use pinned versions as the latest version is incompatible with JupyterLab 3.x

```bash
# topbar text extension
pip install jupyterlab-topbar-text==0.6.2

# system monitor extension
pip install jupyterlab-system-monitor==0.8.0

# logout extension
pip install jupyterlab-logout==0.5.0

# theme toggler extension. Install it as labextension
jupyter labextension install jupyterlab-topbar-extension jupyterlab-theme-toggle
```

### JupyterLab 1.x and 2.x

```bash
# container extension
jupyter labextension install jupyterlab-topbar-extension

# system metrics
jupyter labextension install jupyterlab-system-monitor
pip install jupyter-resource-usage

# custom text in the top bar
jupyter labextension install jupyterlab-topbar-text

# add a logout button
jupyter labextension install jupyterlab-logout

# theme toggling extension
jupyter labextension install jupyterlab-theme-toggle
```

All-in-one install:

```bash
jupyter labextension install jupyterlab-topbar-extension \
                             jupyterlab-system-monitor \
                             jupyterlab-topbar-text \
                             jupyterlab-logout \
                             jupyterlab-theme-toggle
```

## Development

### Build toolchain

- **Node.js:** 20 to 24 (CI uses 24, Binder uses 20). The repository-wide
  `lerna` scripts (`jlpm run build:prod` at the repository root) fail on
  Node.js 26. Building inside a single package still works there.
- **JupyterLab for building: 4.0 to 4.5.** Build the extensions with
  `pip install "jupyterlab>=4.0.0,<4.6"`. The built extensions still run in
  JupyterLab 4.6 and later.

  JupyterLab 4.6 builds extensions with a new tool, `jupyter_builder`, which
  needs the `@jupyterlab/core-meta` package. These packages use the older
  `@jupyterlab/builder` (a devDependency), which doesn't install it, so
  `jupyter_builder` downloads it from GitHub during every build. That download
  fails often (timeouts, rate limits) with errors such as
  `Could not resolve @jupyterlab/core-meta for requested version '4.0.x'`.
  The build pin is set in three places, which should stay in sync:

  - `[build-system] requires` in each `packages/*/pyproject.toml`, used by
    `pip install .` and `python -m build`
  - each package's `[tool.jupyter-releaser.hooks]` in its `pyproject.toml`
  - the `before-build-npm` hook in the root `package.json`

  Moving to `@jupyter/builder` would remove the download, but it builds
  against JupyterLab 4.6 metadata, which could stop the extensions loading in
  older JupyterLab 4.x versions. Check that before switching.

### Development install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Create an environment with a build-compatible JupyterLab and Node.js
conda create -n topbar-dev -c conda-forge python=3.12 "jupyterlab>=4.0.0,<4.6" nodejs=24
conda activate topbar-dev
# Clone the repo to your local environment
# Change directory into the package that we want to develop
cd packages/<extension_name>
# Install package in development mode
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
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall jupyterlab_topbar_text jupyterlab_logout jupyterlab_topbar_stop_server jupyterlab_theme_toggler
```
