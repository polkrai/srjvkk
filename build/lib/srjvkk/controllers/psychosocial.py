# -*- encoding: utf-8 -*-

import logging

import simplejson

from srjvkk.lib.base import *

log = logging.getLogger(__name__)

import srutil
from datetime import datetime, timedelta
from sqlalchemy.sql import and_, or_, not_, select, func
from math import ceil

log = logging.getLogger(__name__)

class PsychosocialController(BaseController):

    def __before__(self):
        if config['jvkk.login'] != 'yes':
            # now that we have no login controller.
            session['sr_user_id'] = 157
            session['sr_session_id'] = '__dummy__'
            session['sr_com'] = 'ps'
            s = model.Session()
            session['sr_user'] = s.query(model.User).get(session['sr_user_id']) 
            session['sr_component'] = s.query(model.Component).get(model.Component.PsId);
            session.save()
        else:
            # real environment
            if request.path_info == h.url_for(action='login'):
                return
            if not srutil.check_session(request, session, model.Session()):
                action = request.environ.get('PATH_INFO').split('/')[-1]
                if action not in ['background']:
                    session.clear()
                    session.save()
                    return redirect_to(config['pylons.g'].loginurl)
            session['sr_com'] = 'ps'
            s = model.Session()
            session['sr_user'] = s.query(model.User).get(session['sr_user_id']) 
            session['sr_component'] = s.query(model.Component).get(model.Component.PsId);
            session.save()
    
    def index(self):
        s = model.Session()
        c.sendcoms = model.Component.sendcoms(s)
        return render('/ps/main.html')
    
    def setup_main(self):
        return render('/ps/setup_main.html')
    
    def setup_entrance(self):
        return render('/ps/setup_entrance.html')
    
    def get_entrances(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSEntrance).filter_by(deleted=False).\
                filter(model.PSEntrance.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSEntrance.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'entrances':results})
    
    def save_entrance(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSEntrance()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSEntrance).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSEntrance).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_assessment(self):
        return render('/ps/setup_assessment.html')
    
    def get_assessments(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSAssessment).filter_by(deleted=False).\
                filter(model.PSAssessment.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSAssessment.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'assessments':results})
    
    def save_assessment(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSAssessment()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSAssessment).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSAssessment).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_type(self):
        return render('/ps/setup_type.html')
    
    def get_types(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSType).filter_by(deleted=False).\
                filter(model.PSType.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSType.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'types':results})
    
    def save_type(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSType()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSType).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSType).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_drug(self):
        return render('/ps/setup_drug.html')
    
    def get_drugs(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSDrug).filter_by(deleted=False).\
                filter(model.PSDrug.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSDrug.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'types':results})
    
    def save_drug(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSDrug()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSDrug).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSDrug).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()

    def setup_method(self):
        return render('/ps/setup_method.html')
    
    def get_methods(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        parent_id = request.params.get('parent_id')
        data = []
        if query:
            q = s.query(model.PSMethod).filter_by(deleted=False).\
                filter(model.PSMethod.description.like(query + '%'))
            if (parent_id != 'all'):
                q.filter_by(parent_id=parent_id)
            data = q.limit(int(limit)).all()
        else:
            q = s.query(model.PSMethod).filter_by(deleted=False)
            if (parent_id != 'all'):
                q.filter_by(parent_id=parent_id)
            data = q.all()
        results = []
        for p in data:
            results.append({
                'id': p.id, 
                'description': p.description, 
                'parent_id': p.parent_id, 
                'parent_desc': p.parent.description if p.parent else '',
                'value': p.id,
                'label': p.description
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'methods':results})
    
    def save_method(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSMethod()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSMethod).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            obj.parent_id = d['parent_id']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSMethod).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_result(self):
        return render('/ps/setup_result.html')
    
    def get_results(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSResult).filter_by(deleted=False).\
                filter(model.PSResult.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSResult.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'results':results})
    
    def save_result(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSResult()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSResult).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSResult).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_cancel(self):
        return render('/ps/setup_cancel.html')
    
    def get_cancels(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSCancelReason).filter_by(deleted=False).\
                filter(model.PSCancelReason.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSCancelReason.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'cancels':results})
    
    def save_cancel(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSCancelReason()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSCancelReason).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSCancelReason).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_follow(self):
        return render('/ps/setup_follow.html')
    
    def get_follows(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSFollowup).filter_by(deleted=False).\
                filter(model.PSFollowup.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSFollowup.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'follows':results})
    
    def save_follow(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSFollowup()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSFollowup).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSFollowup).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_number(self):
        return render('/ps/setup_number.html')
    
    def get_numbers(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.PSNumber).filter_by(deleted=False).\
                filter(model.PSNumber.number.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.PSNumber.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'number': p.number})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def save_number(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.PSNumber()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.PSNumber).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.number = d['number']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.PSNumber).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
    
    def assessment(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        return render('/ps/assessment.html')
    
    def get_patient_assessments(self):
        s = model.Session()
        pa_id = request.params.get('pa_id')
        data = s.query(model.PSPatientAssessment).filter_by(deleted=False, pa_id=pa_id).\
                order_by(model.ps_patient_assessment_tb.c.assess_date).all()
        results = []
        for p in data:
            number = None
            treatment_result = None
            follow = None
            if p.as_result:
                number = s.query(model.PSPatientTreatment).filter_by(assessment_result_id=p.as_result.id,\
                                                            deleted=False).count()
                if p.as_result.is_complete:
                    treatment_result = 'ครบโปรแกรม'
                elif p.as_result.is_complete == False:
                    treatment_result = 'ไม่ครบโปรแกรม'
                
                follow_count = s.query(model.PSPatientFollowup).filter_by(assessment_result_id=p.as_result.id,\
                                                           deleted=False).count()
                if follow_count > 0:
                    follow = follow_count
                
            results.append({
                'id': p.id, 
                'assess_date': model.DateUtil.toShortFormatDate(p.assess_date),
                'entrance': p.entrance.description,
                'user': p.user.fullname,
                'is_ready': p.as_result.is_ready if p.as_result else None,
                'ar_id': p.as_result.id if p.as_result else None,
                'total_number': p.as_result.number.number if p.as_result and p.as_result.number else None,
                'method': p.as_result.method.description if p.as_result and p.as_result.method else None,
                'number': number,
                'treatment_result': treatment_result,
                'follow': follow
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def add_assessment(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        s = model.Session()
        c.entrances = s.query(model.PSEntrance).filter_by(deleted=False).all()
        c.assessments = s.query(model.PSAssessment).filter_by(deleted=False).all()
        c.drugs = s.query(model.PSDrug).filter_by(deleted=False).all()
        return render('/ps/add_assessment.html')
    
    def view_assessment(self):
        id = request.params.get('id')
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        s = model.Session()
        c.pas = s.query(model.PSPatientAssessment).get(id)
        c.entrances = s.query(model.PSEntrance).filter_by(deleted=False).all()
        c.assessments = s.query(model.PSAssessment).filter_by(deleted=False).all()
        c.drugs = s.query(model.PSDrug).filter_by(deleted=False).all()
        return render('/ps/view_assessment.html')
    
    def save_patient_assessment(self):
        s = model.Session()
        pa_id = request.params.get('pa_id') 
        vn_id = request.params.get('vn_id') 
        drug_type = request.params.get('drug_type')
        drug_period = request.params.get('drug_period')
        drug_qty = request.params.get('drug_qty')
        drug_freq = request.params.get('drug_freq')
        entrance = request.params.get('entrance')
        assessments = request.params.getall('assessments')
        drug_id = request.params.get('drug_id')
        
        paa = model.PSPatientAssessment()
        paa.pa_id = pa_id
        paa.vn_id = vn_id
        paa.drug_id = drug_id
        paa.drug_type = drug_type
        paa.drug_period = drug_period
        paa.drug_qty = drug_qty
        paa.drug_freq = drug_freq
        paa.entrance_id = entrance
        paa.assess_date = datetime.now()
        paa.updated_by = session['sr_user_id']
        paa.updated_date = paa.assess_date
        s.save_or_update(paa)
        
        for a in assessments:
            pt = model.PSTreatmentAssessment()
            pt.pa_assessment = paa
            pt.assessment_id = a
            pt.updated_by = paa.updated_by
            pt.updated_date = paa.updated_date
            s.save_or_update(pt)
        s.commit()
        
    def edit_assessment_result(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.pa_as_id = request.params.get('pa_as_id') if request.params.get('pa_as_id') else -1
        s = model.Session()
        c.types = s.query(model.PSType).filter_by(deleted=False).all()
        c.methods = s.query(model.PSMethod).filter_by(deleted=False, parent_id=None).all()
        c.numbers = s.query(model.PSNumber).filter_by(deleted=False).all()
        return render('/ps/edit_assessment_result.html')
    
    def view_assessment_result(self):
        c.pa_id = request.params.get('pa_id') 
        c.vn_id = request.params.get('vn_id') 
        id = request.params.get('id') 
        s = model.Session()
        c.types = s.query(model.PSType).filter_by(deleted=False).all()
        c.methods = s.query(model.PSMethod).filter_by(deleted=False, parent_id=None).all()
        c.numbers = s.query(model.PSNumber).filter_by(deleted=False).all()
        c.ar = s.query(model.PSAssessmentResult).get(id)
        c.du = model.DateUtil
        return render('/ps/view_assessment_result.html')
    
    def save_assessment_result(self):
        s = model.Session()
        pa_id = request.params.get('pa_id') 
        vn_id = request.params.get('vn_id')
        pa_as_id = request.params.get('pa_as_id')  
        is_ready = request.params.get('is_ready')
        type = request.params.get('type')
        number = request.params.get('number')
        method = request.params.get('method')
        result = request.params.get('result')
        conclustion = request.params.get('conclusion')
        #appoint_date = request.params.get('appoint_date')
        
        #t_date = request.params.get('treatment_date')
        #a_date = request.params.get('assessment_date')
        #time = request.params.get('time')
        
        par = model.PSAssessmentResult()
        par.patient_assessment_id = pa_as_id
        par.pa_id = pa_id
        par.vn_id = vn_id
        par.is_ready = True if is_ready == '1' else False
        if par.is_ready:
            par.type_id = type
            par.number_id = number
            par.method_id = method
        par.updated_by = session['sr_user_id']
        par.updated_date = datetime.now()
        par.assess_date = par.updated_date
        #par.appoint_date = model.DateUtil.parseDate(appoint_date, True) if appoint_date != '' else None
        par.result = result
        par.conclusion = conclustion
        s.save_or_update(par)
        
        #for m in methods:
        #    pm = model.PSAssessmentResultMethod()
        #    pm.result = par
        #    pm.method_id = m
        #    pm.updated_by = par.updated_by
        #    pm.updated_date = par.updated_date
        #    s.save_or_update(pm)
        
        #pa = model.PSAppointment()
        #pa.pa_id = pa_id
        #appoint_date = a_date
        #remark = u'นัดเข้ารับการประเมินก่อนเข้ารับการบำบัด'
        #if is_ready == '1':
        #    appoint_date = t_date
        #    remark = u'นัดเข้ารับการบำบัด'
        #pa.appoint_date = datetime.combine(model.DateUtil.parseDate(appoint_date, True), model.DateUtil.parseTime(time))
        #pa.remark = remark
        #pa.updated_by = par.updated_by
        #pa.updated_date = par.updated_date
        #s.save_or_update(pa)
        s.commit()
        
    def edit_patient_treatment(self):
        c.pa_id = request.params.get('pa_id')
        c.vn_id = request.params.get('vn_id')
        c.ar_id = request.params.get('ar_id')
        s = model.Session()
        as_rs = s.query(model.PSAssessmentResult).get(c.ar_id)
        c.methods = s.query(model.PSMethod).filter_by(deleted=False, parent_id=as_rs.method.id).all()
        if (len(c.methods) == 0):
            c.methods = s.query(model.PSMethod).filter_by(id=as_rs.method_id).all()
        return render('/ps/edit_patient_treatment.html')
    
    def view_patient_treatment(self):
        c.pa_id = request.params.get('pa_id')
        c.vn_id = request.params.get('vn_id')
        c.ar_id = request.params.get('ar_id')
        s = model.Session()
        c.pts = s.query(model.PSPatientTreatment).filter_by(assessment_result_id=c.ar_id)\
            .order_by(model.ps_patient_treatment_tb.c.treatment_date).all()
        c.date_util = model.DateUtil
        return render('/ps/view_patient_treatment.html')
    
    def save_patient_treatment(self):
        s = model.Session()
        pa_id = request.params.get('pa_id') 
        vn_id = request.params.get('vn_id')
        ar_id = request.params.get('ar_id')  
        methods = request.params.getall('methods')
        now = datetime.now()
        
        visit = s.query(model.Visit).get(vn_id)
        user = s.query(model.User).get(session['sr_user_id'])
        item = model.Item.get_ps(s)
        pt = model.PSPatientTreatment()
        pt.pa_id = pa_id
        pt.vn_id = vn_id
        pt.assessment_result_id = ar_id
        pt.treatment_date = now
        pt.updated_by = session['sr_user_id']
        pt.updated_date = now
        s.save_or_update(pt)
        
        for m in methods:
            tm = model.PSTreatmentMethod()
            tm.pa_treatment = pt
            tm.method_id = m
            tm.updated_by = session['sr_user_id']
            tm.updated_date = now
            s.save_or_update(tm)
            
        model.NeuralOrder.make_order(s, visit, user, 'ps', item, 1)
        s.commit()
        
    def edit_treatment_result(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.ar_id = request.params.get('ar_id') if request.params.get('ar_id') else -1
        s = model.Session()
        c.cancels = s.query(model.PSCancelReason).filter_by(deleted=False).all()
        return render('/ps/edit_treatment_result.html')
    
    def view_treatment_result(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.ar_id = request.params.get('ar_id') if request.params.get('ar_id') else -1
        s = model.Session()
        c.cancels = s.query(model.PSCancelReason).filter_by(deleted=False).all()
        c.ar = s.query(model.PSAssessmentResult).get(c.ar_id)
        return render('/ps/view_treatment_result.html')
    
    def save_treatment_result(self):
        s = model.Session()
        pa_id = request.params.get('pa_id') 
        vn_id = request.params.get('vn_id')
        ar_id = request.params.get('ar_id')  
        result = request.params.get('result')
        cancel = request.params.get('cancel')
        cancel_remark = request.params.get('cancel_remark')
        goal = request.params.get("goal")
        concentrate = request.params.get("concentrate")
        
        now = datetime.now()
        ar = s.query(model.PSAssessmentResult).get(ar_id)
        ar.goal = goal
        ar.concentrate = concentrate
        ar.is_complete = True if result == '1' else False        
        if (cancel):
            ar.cancel_id = cancel
            ar.cancel_remark = cancel_remark
        ar.complete_date = now
        ar.updated_by = session['sr_user_id']
        ar.updated_date = now
        
        plans = simplejson.loads(request.params.get('plans'))
        for p in plans:
            rp = None
            if p['id'] == -1:
                rp = model.PSFollowingPlan()
            else:
                rp = s.query(model.PSFollowingPlan).get(int(p['id']))
                
            
            rp.result = ar;
            rp.month = p['month'];
            rp.year = p['year']
            s.save_or_update(rp)

        s.save_or_update(ar)
        s.commit()
        
    def get_plans(self):
        s = model.Session()
        ar_id = request.params.get('ar_id')
        data = s.query(model.PSFollowingPlan).filter_by(ar_id=ar_id).\
                order_by(model.ps_following_plan_tb.c.id).all()
        results = []
        for d in data: 
            results.append({
                'id': d.id, 
                'ar_id': d.ar_id,
                'month': d.month,
                'year': d.year,
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
        
    def edit_treatment_followup(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.ar_id = request.params.get('ar_id') if request.params.get('ar_id') else -1
        s = model.Session()
        c.followups = s.query(model.PSFollowup).filter_by(deleted=False).all()
        stmt = select([func.max(model.ps_patient_followup_tb.c.followup_no)], \
                       (model.ps_patient_followup_tb.c.assessment_result_id==c.ar_id) &\
                       (model.ps_patient_followup_tb.c.deleted==False))
        rs = stmt.execute()
        c.no = rs.scalar()
        c.no = c.no + 1 if c.no else 1
        return render('/ps/edit_treatment_followup.html')
    
    def view_treatment_followup(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.ar_id = request.params.get('ar_id') if request.params.get('ar_id') else -1
        s = model.Session()
        c.date_util = model.DateUtil
        c.pfs = s.query(model.PSPatientFollowup).filter_by(deleted=False,\
                        assessment_result_id=c.ar_id).order_by(model.PSPatientFollowup.followup_no).all()
        return render('/ps/view_treatment_followup.html')
    
    def save_treatment_followup(self):
        s = model.Session()
        pa_id = request.params.get('pa_id') 
        vn_id = request.params.get('vn_id')
        ar_id = request.params.get('ar_id')
        followup_no = request.params.get('followup_no')  
        followups = request.params.getall('followups')
        now = datetime.now()
        pf = model.PSPatientFollowup()
        pf.pa_id = pa_id
        pf.vn_id = vn_id
        pf.assessment_result_id = ar_id
        pf.followup_no = followup_no
        pf.followup_date = now         
        pf.updated_by = session['sr_user_id']
        pf.updated_date = now
        s.save_or_update(pf)
        
        for f in followups:
            tf = model.PSTreatmentFollowup()
            tf.pa_follow = pf
            tf.followup_id = f
            tf.updated_by = session['sr_user_id']
            tf.updated_date = now
            s.save_or_update(tf)
        s.commit()
    
    def report_main(self):
        return render('ps/report_main.html')
    
    def rptjobresult(self):
        return render('ps/report/jobresult.html')
    
    def rptfollow(self):
        return render('ps/report/follow.html')