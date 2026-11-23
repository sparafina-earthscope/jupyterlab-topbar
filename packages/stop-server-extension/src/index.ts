import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabStatus,
  IRouter,
} from '@jupyterlab/application';

import {
  Dialog,
  IToolbarWidgetRegistry,
  showDialog,
} from '@jupyterlab/apputils';

import { ServerConnection } from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

import { Widget } from '@lumino/widgets';

import '@jupyterlab/application/style/buttons.css';

import '../style/index.css';

const stopServerPluginId = 'jupyterlab-topbar-stop-server:plugin';

const GEOLAB_VERSION_CLASS = 'jp-TopBar-GeolabVersion';

/**
 * Ask this extension's server handler for the server's GEOLAB_VERSION
 * environment variable (the browser can't read it directly). Resolves to
 * null if it's unset or the request fails.
 */
async function fetchGeolabVersion(): Promise<string | null> {
  const settings = ServerConnection.makeSettings();
  try {
    const response = await ServerConnection.makeRequest(
      URLExt.join(
        settings.baseUrl,
        'jupyterlab-topbar-stop-server',
        'geolab-version'
      ),
      { method: 'GET' },
      settings
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.geolab_version || null;
  } catch (error) {
    console.warn(
      'jupyterlab-topbar-stop-server: failed to fetch GEOLAB_VERSION.',
      error
    );
    return null;
  }
}

const extension: JupyterFrontEndPlugin<void> = {
  id: stopServerPluginId,
  autoStart: true,
  requires: [
    ILabStatus,
    IRouter,
    JupyterFrontEnd.IPaths,
    IToolbarWidgetRegistry,
  ],
  activate: async (
    app: JupyterFrontEnd,
    status: ILabStatus,
    router: IRouter,
    paths: JupyterFrontEnd.IPaths,
    toolbarRegistry: IToolbarWidgetRegistry
  ): Promise<void> => {
    console.log('jupyterlab-topbar-stop-server extension is activated!');

    // Show GEOLAB_VERSION just before the Stop Server button. The label stays
    // hidden until the lookup finishes, then shows UNKNOWN if the variable
    // is unset/empty or the lookup failed.
    const versionNode = document.createElement('div');
    versionNode.style.display = 'none';
    toolbarRegistry.addFactory('TopBar', 'geolab-version', () => {
      const versionWidget = new Widget({ node: versionNode });
      versionWidget.addClass(GEOLAB_VERSION_CLASS);
      return versionWidget;
    });
    void fetchGeolabVersion().then((version) => {
      const shown = version || 'UNKNOWN';
      versionNode.textContent = `GeoLab ${shown}`;
      versionNode.title = `GEOLAB_VERSION: ${shown}`;
      versionNode.style.display = '';
    });

    // Get app commands
    const { commands, serviceManager } = app;

    const namespace = 'jupyterlab-topbar';
    const command = namespace + ':stop-server';

    commands.addCommand(command, {
      label: 'Stop Server',
      execute: async () => {
        // Confirm ourselves rather than delegating to JupyterLab's
        // filemenu:shutdown command: its returned promise resolves the
        // same way whether the user clicks "Shut Down" or "Cancel" on its
        // own confirmation dialog, so a caller can't tell them apart and
        // would end up navigating away even on Cancel.
        const result = await showDialog({
          title: 'Stop server?',
          body: 'This will stop your Jupyter server and log you out. Any unsaved changes will be lost.',
          buttons: [
            Dialog.cancelButton(),
            Dialog.warnButton({ label: 'Stop Server' }),
          ],
        });

        if (!result.button.accept) {
          return;
        }

        try {
          await Promise.all([
            serviceManager.sessions.shutdownAll(),
            serviceManager.terminals.shutdownAll(),
          ]);
        } catch (error) {
          console.warn(
            'jupyterlab-topbar-stop-server: failed to shut down sessions/terminals cleanly.',
            error
          );
        }

        const settings = ServerConnection.makeSettings();
        try {
          // The connection often drops as the process exits mid-response;
          // that's expected and not itself a failure.
          await ServerConnection.makeRequest(
            URLExt.join(settings.baseUrl, 'api/shutdown'),
            { method: 'POST' },
            settings
          );
        } catch (error) {
          console.warn(
            'jupyterlab-topbar-stop-server: shutdown request did not complete cleanly, the server may still have stopped.',
            error
          );
        }

        // JupyterLab's own "leave site?" confirmation (@jupyterlab/
        // application-extension) is registered via
        // window.addEventListener('beforeunload', ...), not the
        // window.onbeforeunload property, so setting that property has no
        // effect on it. It fires whenever ILabStatus.isDirty is true, a
        // private counter with no public reset method, so clear it
        // directly -- the server is already stopping, so any "unsaved
        // changes" warning no longer applies.
        try {
          (status as any)._dirtyCount = 0;
        } catch (error) {
          console.warn(
            'jupyterlab-topbar-stop-server: failed to clear dirty state before navigating.',
            error
          );
        }

        // The single-user server we were just talking to is now shutting
        // down. Its own /logout route just clears the hub-auth cookie and
        // redirects to the Hub's logout endpoint (see
        // JupyterHubLogoutHandlerMixin in jupyterhub/singleuser/mixins.py),
        // but it can only do that while the process is still alive to
        // answer the request -- which, right after api/shutdown, it may no
        // longer be. Skip the now-unreliable middleman and go straight to
        // the Hub's logout endpoint, which is served by the Hub itself (a
        // separate, still-running process) when available.
        //
        // These come from paths.urls (populated from the hubPrefix/hubHost
        // page config keys -- @jupyterlab/hub-extension reads the same
        // way), not PageConfig.getOption('hub_prefix')/('hub_host'), which
        // are the wrong (snake_case) keys and always read back empty.
        const hubHost = paths.urls.hubHost || '';
        const hubPrefix = paths.urls.hubPrefix || '';

        if (hubPrefix) {
          window.location.href = hubHost + URLExt.join(hubPrefix, 'logout');
        } else {
          router.navigate('/logout', { hard: true });
        }
      },
    });
  },
};

export default extension;
