import json
import os

import tornado
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join


class GeolabVersionHandler(APIHandler):
    """Expose the server's GEOLAB_VERSION environment variable.

    The browser can't read the single-user server's environment directly,
    so the frontend asks for it here.
    """

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"geolab_version": os.environ.get("GEOLAB_VERSION")}))


def setup_handlers(web_app):
    base_url = web_app.settings["base_url"]
    route = url_path_join(base_url, "jupyterlab-topbar-stop-server", "geolab-version")
    web_app.add_handlers(".*$", [(route, GeolabVersionHandler)])
