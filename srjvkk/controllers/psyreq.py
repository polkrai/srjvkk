import logging

from srjvkk.lib.base import *

log = logging.getLogger(__name__)

class PsyreqController(BaseController):
    def __before__(self):
        if config['jvkk.login'] != 'yes':
            # now that we have no login controller.
            session['sr_user_id'] = config['jvkk.login.userid']
            session['sr_session_id'] = config['jvkk.login.sessionid']
            session.save()
        else:
            # real environment
            if request.path_info == h.url_for(action='login'):
                return
            if not srutil.check_session(request, session, model.Session()):
                session.clear()
                session.save()
                return redirect_to(config['pylons.g'].loginurl)
                
    def index(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.actions = actions(s)
        return render('/psyco/request.html')