import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  IRouter,
} from '@jupyterlab/application';

import { ServerConnection } from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

import '@jupyterlab/application/style/buttons.css';

import '../style/index.css';

const stopServerPluginId = 'jupyterlab-topbar-stop-server:plugin';

const extension: JupyterFrontEndPlugin<void> = {
  id: stopServerPluginId,
  autoStart: true,
  requires: [IRouter],
  activate: async (app: JupyterFrontEnd, router: IRouter): Promise<void> => {
    console.log('jupyterlab-topbar-stop-server extension is activated!');

    // Get app commands
    const { commands } = app;

    const namespace = 'jupyterlab-topbar';
    const command = namespace + ':stop-server';

    commands.addCommand(command, {
      label: 'Stop Server',
      execute: async (args: any) => {
        const settings = ServerConnection.makeSettings();
        const url = URLExt.join(settings.baseUrl, 'api/shutdown');

        try {
          // Ask the Jupyter server to shut itself down. The connection
          // often errors out as the process exits mid-response, which is
          // expected and not a failure.
          await ServerConnection.makeRequest(url, { method: 'POST' }, settings);
        } catch (error) {
          console.warn(
            'jupyterlab-topbar-stop-server: shutdown request did not complete cleanly, the server may still have stopped.',
            error
          );
        }

        router.navigate('/logout', { hard: true });
      },
    });
  },
};

export default extension;
