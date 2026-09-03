import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  IRouter,
} from '@jupyterlab/application';

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
    const shutdownCommand = 'filemenu:shutdown';

    commands.addCommand(command, {
      label: 'Stop Server',
      execute: async () => {
        // Delegate to JupyterLab's own "Shut Down" command
        // (@jupyterlab/mainmenu-extension), which already handles the
        // confirmation dialog, session/terminal cleanup, and the
        // api/shutdown request.
        // https://jupyterlab.readthedocs.io/en/4.6.x/api/variables/mainmenu-extension.CommandIDs.shutdown.html
        if (!commands.hasCommand(shutdownCommand)) {
          console.warn(
            `jupyterlab-topbar-stop-server: '${shutdownCommand}' command is not available.`
          );
          return;
        }
        await commands.execute(shutdownCommand);
        // The server is already shut down at this point, so suppress any
        // "leave site?" beforeunload prompt (e.g. from unsaved-changes
        // handlers) before the hard navigation below.
        window.onbeforeunload = null;
        router.navigate('/logout', { hard: true });
      },
    });
  },
};

export default extension;
