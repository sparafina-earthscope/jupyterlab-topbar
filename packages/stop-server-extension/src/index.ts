import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import '@jupyterlab/application/style/buttons.css';

import '../style/index.css';

const stopServerPluginId = 'jupyterlab-stop-server:plugin';

const extension: JupyterFrontEndPlugin<void> = {
  id: stopServerPluginId,
  autoStart: true,
  activate: async (app: JupyterFrontEnd): Promise<void> => {
    console.log('jupyterlab-stop-server extension is activated!');

    // Get app commands
    const { commands } = app;

    const namespace = 'jupyterlab-topbar';
    const command = namespace + ':stop-server';

    commands.addCommand(command, {
      label: 'Stop Server',
      execute: async (args: any) => {
        const hubHost = PageConfig.getOption('hub_host');
        const hubPrefix = PageConfig.getOption('hub_prefix');
        const hubUser = PageConfig.getOption('hub_user');
        const hubServerName = PageConfig.getOption('hub_server_name');

        if (!hubPrefix) {
          console.warn(
            'jupyterlab-stop-server: not running under the JupyterHub Control Panel, hub_prefix is not set.'
          );
          return;
        }

        // Mirror the JupyterHub Control Panel "Stop My Server" action:
        // https://api.jupyterhub.org - DELETE /users/{name}/server
        const serverPath = hubServerName
          ? URLExt.join('api/users', hubUser, 'servers', hubServerName)
          : URLExt.join('api/users', hubUser, 'server');
        const stopUrl = hubHost + URLExt.join(hubPrefix, serverPath);

        const response = await fetch(stopUrl, {
          method: 'DELETE',
          credentials: 'same-origin',
        });

        if (!response.ok && response.status !== 202) {
          console.error(
            `jupyterlab-stop-server: failed to stop the server (${response.status} ${response.statusText}).`
          );
        }

        // Send the user back to the Hub Control Panel, same as clicking
        // "Hub Control Panel" would.
        window.location.href = hubHost + URLExt.join(hubPrefix, 'home');
      },
    });
  },
};

export default extension;
