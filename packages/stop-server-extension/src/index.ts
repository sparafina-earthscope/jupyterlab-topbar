import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabStatus,
  IRouter,
} from '@jupyterlab/application';

import '@jupyterlab/application/style/buttons.css';

import '../style/index.css';

const stopServerPluginId = 'jupyterlab-topbar-stop-server:plugin';

const extension: JupyterFrontEndPlugin<void> = {
  id: stopServerPluginId,
  autoStart: true,
  requires: [ILabStatus, IRouter],
  activate: async (
    app: JupyterFrontEnd,
    status: ILabStatus,
    router: IRouter
  ): Promise<void> => {
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

        router.navigate('/logout', { hard: true });
      },
    });
  },
};

export default extension;
