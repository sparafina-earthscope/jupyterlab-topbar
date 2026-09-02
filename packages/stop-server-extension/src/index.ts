import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import '@jupyterlab/application/style/buttons.css';

import '../style/index.css';

const stopServerPluginId = 'jupyterlab-topbar-stop-server:plugin';

const extension: JupyterFrontEndPlugin<void> = {
  id: stopServerPluginId,
  autoStart: true,
  activate: async (app: JupyterFrontEnd): Promise<void> => {
    console.log('jupyterlab-topbar-stop-server extension is activated!');

    // Get app commands
    const { commands } = app;

    const namespace = 'jupyterlab-topbar';
    const command = namespace + ':stop-server';

    commands.addCommand(command, {
      label: 'Stop Server',
      execute: (args: any) => {
        const hubHost = PageConfig.getOption('hub_host');
        const hubPrefix = PageConfig.getOption('hub_prefix');

        if (!hubPrefix) {
          console.warn(
            'jupyterlab-topbar-stop-server: not running under JupyterHub, hub_prefix is not set.'
          );
          return;
        }

        // Send the user to the Hub Control Panel, where JupyterHub's own
        // "Stop My Server" button lives.
        window.location.href = hubHost + URLExt.join(hubPrefix, 'home');
      },
    });
  },
};

export default extension;
