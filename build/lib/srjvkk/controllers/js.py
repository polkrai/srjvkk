import logging

from srjvkk.lib.base import *

log = logging.getLogger(__name__)

class JsController(BaseController):

    def view(self):
        # Return a rendered template
        #   return render('/some/template.mako')
        # or, Return a response
        return render(request.environ['PATH_INFO'])
