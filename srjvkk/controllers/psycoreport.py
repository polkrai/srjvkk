import logging

from srjvkk.lib.base import *
import srutil

log = logging.getLogger(__name__)

class PsycoreportController(BaseController):
    def __before__(self):
        if config['jvkk.login'] != 'yes':
            # now that we have no login controller.
            session['sr_user_id'] = 157
            session['sr_session_id'] = '__dummy__'
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
        # Return a rendered template
        #   return render('/some/template.mako')
        # or, Return a response
        return 'Hello World'

    def test_result(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        res_id = int(request.params.get("res_id"))
        c.test_result = s.query(model.PsycoTestResult).get(res_id)
        resUserId = c.test_result.updated_by if c.test_result.updated_by else c.test_result.created_by
        resUserId = -1 if not resUserId else resUserId
        c.req_reason = s.query(model.PsycoReqTestReason).filter_by(order_id=c.test_result.order.id).all()
        c.psyco_user = s.query(model.User).get(resUserId)
        res_date = c.test_result.updated_date if c.test_result.updated_date else c.test_result.created_date
        order_date = c.test_result.order.order_date
        c.order_date = str(order_date.day) + "/" + str(order_date.month) + "/" + str(order_date.year + 543)
        if res_date:
            c.res_date = str(res_date.day) + "/" + str(res_date.month) + "/" + str(res_date.year + 543)
        else:
            c.res_date = '........./........./.........'
        if c.test_result.type == model.PsycoTestResult.TYPE_TEST:            
            return render('/psyco/report/rpttestresult.html')
        else:
            return render('/psyco/report/rptcureresult.html')
