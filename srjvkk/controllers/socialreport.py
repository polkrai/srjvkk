import logging

import simplejson

from srjvkk.lib.base import *

log = logging.getLogger(__name__)

import srutil
from datetime import datetime, timedelta
from sqlalchemy.sql import and_, or_, not_

class SocialreportController(BaseController):
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
    
    def report_main(self):
        return render('/social/report/reportmain.html')
    
    def bgprobsummary_page(self):
        s = model.Session()
        return render('/social/report/bgprobsummary.html')
    
    def supportsummary_page(self):
        s = model.Session()
        return render('/social/report/supportsummary.html')
    
    def background(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        bg_id = int(request.params.get("bg_id"))
        c.bg = s.query(model.PatientBackground).get(bg_id)
        bgUserId = c.bg.updated_by if c.bg.updated_by else c.bg.created_by
        bgUserId = -1 if not bgUserId else bgUserId
        c.bg_user = s.query(model.User).get(bgUserId)
        c.bg_date = model.DateUtil.toLongFormatDate(c.bg.updated_date) if c.bg.updated_date \
            else model.DateUtil.toLongFormatDate(c.bg.created_date)
        return render('/social/report/rptbackground.html')
    
    def niti(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        niti_id = int(request.params.get("niti_id"))
        c.niti = s.query(model.PatientNiti).get(niti_id)
        nitiUserId = c.niti.updated_by if c.niti.updated_by else c.niti.created_by
        nitiUserId = -1 if not nitiUserId else nitiUserId
        c.niti_user = s.query(model.User).get(nitiUserId)
        c.niti_date = model.DateUtil.toLongFormatDate(c.niti.updated_date) if c.niti.updated_date \
            else model.DateUtil.toLongFormatDate(c.niti.created_date)
        c.admit_date = model.DateUtil.toLongFormatDate(c.niti.admit_date)
        c.commit_date = model.DateUtil.toLongFormatDate(c.niti.commit_date)
        c.surrender_date = model.DateUtil.toLongFormatDate(c.niti.surrender_date)
        c.hospital_date = model.DateUtil.toLongFormatDate(c.niti.hospital_date)
        return render('/social/report/rptniti.html')
    
    def background_problem_summary(self):
        s = model.Session()
        start_date = model.DateUtil.parseDate(request.params.get('start_date'), True)
        end_date = model.DateUtil.parseDate(request.params.get('end_date'), True)
        start_date = model.DateUtil.startOfTheDay(start_date)
        end_date = model.DateUtil.endOfTheDay(end_date)
                
        rs = model.BackgroundProblem.count_by_type(start_date, end_date)
        results = []
        
        for r in rs:
            results.append({
                'code':r.code,
                'count':r.count
            })
            
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'results': results})
    
    def print_bgprobsummary(self):
        c.start_date = request.params.get('start_date')
        c.end_date = request.params.get('end_date')
        c.total = float(request.params.get('total'))
        c.results = simplejson.loads(request.params.get('results'))
        c.type = request.params.get('type')
        user_id = session.get('sr_user_id')
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        if c.type == 'excel':
            response.headers['content-type'] = 'application/octet-stream'
            response.headers['Content-Disposition'] = 'attachment;filename=bgprob.xls'    
        return render('/social/report/printbgprobsummary.html')
    
    def get_support_summary(self):
        s = model.Session()
        start_date = model.DateUtil.parseDate(request.params.get('start_date'), True)
        end_date = model.DateUtil.parseDate(request.params.get('end_date'), True)
        start_date = model.DateUtil.startOfTheDay(start_date)
        end_date = model.DateUtil.endOfTheDay(end_date)
        patient_type = request.params.get('patient_type')
                
        support = model.SocialSupport.sum_support(start_date, end_date, patient_type)
        count = model.SocialSupport.count_by_sex(start_date, end_date, patient_type)
        result = {
            'male':0,
            'female':0
        }
        
        for co in count:
            if co.pa_sex == "1":
                result['male'] = int(co.count) if co.count else 0
            else:
                result['female'] = int(co.count) if co.count else 0
        
        result['totalprice'] = float(support[0].total) if support[0].total else 0
        result['canpay'] = float(support[0].canpay) if support[0].canpay else 0
        result['support'] = float(support[0].support) if support[0].support else 0
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(result)
