# -*- encoding: utf-8 -*-

import logging

import simplejson

from srjvkk.lib.base import *

log = logging.getLogger(__name__)

import srutil
from datetime import datetime, timedelta
from sqlalchemy.sql import and_, or_, not_, select, join, func
from math import ceil

log = logging.getLogger(__name__)

class ZoneController(BaseController):

    def __before__(self):
        if config['jvkk.login'] != 'yes':
            # now that we have no login controller.
            session['sr_user_id'] = 157
            session['sr_session_id'] = '__dummy__'
            session['sr_com'] = 'zone'
            s = model.Session()
            session['sr_user'] = s.query(model.User).get(session['sr_user_id']) 
            session['sr_component'] = s.query(model.Component).get(model.Component.ZoneId);
            session.save()
        else:
            # real environment
            session['sr_com'] = 'zone'
            if request.path_info == h.url_for(action='login'):
                return
            if not srutil.check_session(request, session, model.Session()):
                action = request.environ.get('PATH_INFO').split('/')[-1]
                if action not in ['background']:
                    session.clear()
                    session.save()
                    return redirect_to(config['pylons.g'].loginurl)
            s = model.Session()
            session['sr_user'] = s.query(model.User).get(session['sr_user_id']) 
            session['sr_component'] = s.query(model.Component).get(model.Component.ZoneId);
            session.save()
                
    def index(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        if (not c.pt_bg):
            c.pt_bg = model.PatientBackground()
        #c.actions = actions(s)
        
        problems = s.query(model.SocialProblem).all()
        results = [{'id': p.id, 'description': p.description, 'code':p.code} for p in problems]
        c.problems = results

        helps = s.query(model.HelpMethod).all()        
        results = []
        for h in helps:
            results.append({'id': h.id, 'description': h.description, 'code':h.code})
        c.helps = results
        c.health_stations = model.HealthStation.all(s)
        c.sendcoms = model.Component.sendcoms(s)
        c.com_id = model.Component.ZoneId
        c.com_name = s.query(model.Component).get(c.com_id).com_name
        return render('/zone/main.html')
    
    def setup_main(self):
        return render('/zone/setup_main.html')
    
    def setup_symptom(self):
        return render('/zone/setup_symptom.html')
    
    def get_symptoms(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        symptoms = []
        if query:
            symptoms = s.query(model.ZoneSymptom).filter_by(deleted=False).\
                filter(model.ZoneSymptom.description.like(query + '%')).limit(int(limit)).all()
        else:
            symptoms = model.ZoneSymptom.all(s)
        results = []
        for p in symptoms:
            results.append({'id': p.id, 'description': p.description, 'type': p.type})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'symptoms':results})
    
    def save_symptom(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('symptoms'))
        delData = simplejson.loads(request.params.get('del-symptoms'))
        for d in data:
            obj = model.ZoneSymptom()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneSymptom).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.type = d['type']
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneSymptom).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_personality(self):
        return render('/zone/setup_personality.html')
    
    def get_personalities(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZonePersonality).filter_by(deleted=False).\
                filter(model.ZonePersonality.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.ZonePersonality.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description, 'order':p.order})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'personalities':results})
    
    def save_personality(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('personalities'))
        delData = simplejson.loads(request.params.get('del-personalities'))
        for d in data:
            obj = model.ZonePersonality()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZonePersonality).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            obj.order = d['order']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZonePersonality).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()

    def setup_stress_management(self):
        return render('/zone/setup_stress.html')
    
    def get_stress_managements(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZoneStressManagement).filter_by(deleted=False).\
                filter(model.ZoneStressManagement.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.ZoneStressManagement.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description, 'order':p.order})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'stress':results})
    
    def save_stress_management(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('stress'))
        delData = simplejson.loads(request.params.get('del-stress'))
        for d in data:
            obj = model.ZoneStressManagement()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneStressManagement).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            obj.order = d['order']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneStressManagement).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_reason(self):
        return render('/zone/setup_reason.html')
    
    def get_reasons(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZoneReason).filter_by(deleted=False).\
                filter(model.ZoneReason.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.ZoneReason.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description, 'order':p.order})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'reasons':results})
    
    def save_reason(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('reasons'))
        delData = simplejson.loads(request.params.get('del-reasons'))
        for d in data:
            obj = model.ZoneReason()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneReason).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            obj.order = d['order']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneReason).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_visit_symptom(self):
        return render('/zone/setup_visit_symptom.html')
    
    def get_visit_symptoms(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZoneVisitSymptom).filter_by(deleted=False).\
                filter(model.ZoneVisitSymptom.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.ZoneVisitSymptom.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'symptoms':results})
    
    def save_visit_symptom(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('symptoms'))
        delData = simplejson.loads(request.params.get('del-symptoms'))
        for d in data:
            obj = model.ZoneVisitSymptom()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneVisitSymptom).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneVisitSymptom).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_monitoring(self):
        return render('/zone/setup_monitoring.html')
    
    def get_monitoring(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZoneMonitoring).filter_by(deleted=False).\
                filter(model.ZoneMonitoring.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.ZoneMonitoring.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def save_monitoring(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.ZoneMonitoring()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneMonitoring).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneMonitoring).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_objective(self):
        return render('/zone/setup_objective.html')
    
    def get_objectives(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZoneObjective).filter_by(deleted=False).\
                filter(model.ZoneObjective.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.ZoneObjective.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description, 'order':p.order})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def save_objective(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.ZoneObjective()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneObjective).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            obj.order = d['order']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneObjective).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_condition(self):
        return render('/zone/setup_condition.html')
    
    def get_conditions(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZoneCondition).filter_by(deleted=False).\
                filter(model.ZoneCondition.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.ZoneCondition.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def save_condition(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.ZoneCondition()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneCondition).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneCondition).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def setup_problem(self):
        return render('/zone/setup_problem.html')
    
    def get_problems(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.ZoneProblem).filter_by(deleted=False).\
                filter(model.ZoneProblem.description.like(query + '%')).\
                order_by(model.ZoneProblem.order).limit(int(limit)).all()
        else:
            data = model.ZoneProblem.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description, 'order':p.order})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def save_problem(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.ZoneProblem()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.ZoneProblem).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            obj.order = d['order']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.ZoneProblem).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
        
    def refer_patients(self):
        return render('/zone/refer_patients.html')
    
    def get_refer_patients(self):
        s = model.Session()
        refers = s.query(model.ZoneRefer).filter_by(deleted=False).all()
        results = []
        for r in refers:
            n = s.query(model.ZoneReferNetwork).filter_by(deleted=False, refer_id=r.id).order_by(model.ZoneReferNetwork.refer_date.desc()).all()
            if len(n) == 3:
                continue
            if len(n) == 1:
                next_refer_date = r.created_date.date() + timedelta(90)
            elif len(n) == 2:
                next_refer_date = r.created_date.date() + timedelta(180)
            else:
                next_refer_date = r.created_date.date() + timedelta(30)
            
            today = date.today()
            if (today > next_refer_date):
                color = "red"
            elif (today >= next_refer_date - timedelta(3) and today < next_refer_date):
                color = "yellow"
            elif (today == next_refer_date):
                color = "orange"
            else:
                color = "white"
            results.append({
                'id': r.id,
                'pa_id': r.pa_id,
                'hn': r.patient.hn,
                'patient': r.patient.name, 
                'created_date': model.DateUtil.toShortFormatDate(r.created_date),
                'refer_date': model.DateUtil.toShortFormatDate(n[0].refer_date) if len(n) > 0 else '',
                'next_refer_date': model.DateUtil.toShortFormatDate(next_refer_date),
                'refer_number': len(n), 
                'is_permitted': r.is_permitted,
                'monitor': r.monitor.description if r.monitor else '',
                'score_9q': r.score_9q,
                'score_8q': r.score_8q,
                'color': color,
                'conclude_number': s.query(model.ZoneReferResult).filter_by(refer_id=r.id, deleted=False).count()
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def visit_patients(self):
        return render('/zone/visit_patients.html')
    
    def get_visit_patients(self):
        s = model.Session()
        visits = s.query(model.ZoneVisitRequest).filter_by(deleted=False).order_by(model.ZoneVisitRequest.request_date.desc()).all()
        results = []
        for v in visits:
            results.append({
                'id': v.id,
                'pa_id': v.pa_id,
                'hn': v.patient.hn,
                'patient': v.patient.name, 
                'request_date': model.DateUtil.toShortFormatDate(v.request_date),
                'is_permitted': v.is_permitted,
                'request_no': v.request_no
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
        
    def refer(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        return render('/zone/refer.html')
    
    def save_refer(self):
        s = model.Session()
        user_id = session['sr_user_id']
        now = datetime.now()
        c.pa_id = request.params.get('pa_id') 
        #c.vn_id = request.params.get('vn_id')
        id = request.params.get('id')
        is_municipality = request.params.get('is_municipality')
        landmark = request.params.get('landmark')
        monitor = request.params.get('monitor')
        monitor_remark = request.params.get('monitor_remark')
        is_permitted = request.params.get('is_permitted')
        relative_name = request.params.get('relative')
        relationship = request.params.get('relationship')
        is_same = request.params.get('is_same')
        addr_no = request.params.get('addr_no')
        moo = request.params.get('moo')
        village = request.params.get('village')
        tambon = request.params.get('tambon')
        ampur = request.params.get('ampur')
        province = request.params.get('province')
        tel = request.params.get('tel')
        
        last_visit_date = request.params.get('last_visit_date')
        last_admit_date = request.params.get('last_admit_date')
        last_discharge_date = request.params.get('last_discharge_date')
        symptom = request.params.get('symptom')
        diag = request.params.get('diag')
        homemed_month = request.params.get('homemed_month')
        homemed = request.params.get('homemed')
        help = request.params.get('help')
        help_opd = request.params.get('help_opd')
        score_9q = request.params.get('score_9q')
        score_8q = request.params.get('score_8q')
        dis_score_8q = request.params.get('dis_score_8q')
        ds8 = request.params.get('ds8')
        dis_ds8 = request.params.get('dis_ds8')
        remed_date = request.params.get('remed_date')
        suggestion = request.params.get('suggestion')
        network_name = request.params.get('network_name')
        network_unit = request.params.get('network_unit')
        network_ampur = request.params.get('network_ampur')
        network_province = request.params.get('network_province')
        network_tel = request.params.get('network_tel')
        
        refer = model.ZoneRefer()
        if id and id != "-1":
            refer = s.query(model.ZoneRefer).get(id)
            refer.updated_by = user_id
            refer.updated_date = now
        else:
            refer.created_by = user_id
            refer.created_date = now
        #refer.vn_id = c.vn_id
        refer.pa_id = c.pa_id
        refer.is_municipality = True if is_municipality == '1' else False
        refer.landmark = landmark
        refer.monitor_id = monitor
        refer.monitor_remark = monitor_remark
        refer.is_permitted = True if is_permitted == '1' else False
        refer.last_visit_date = model.DateUtil.parseDate(last_visit_date, True) if last_visit_date != '' and last_visit_date != None else None
        refer.last_admit_date = model.DateUtil.parseDate(last_admit_date, True) if last_admit_date != '' and last_admit_date != None else None
        refer.last_discharge_date = model.DateUtil.parseDate(last_discharge_date, True) if last_discharge_date != '' and last_discharge_date != None else None
        refer.symptom = symptom
        refer.diag = diag
        refer.homemed_month = homemed_month if homemed_month != '' else None
        refer.homemed = homemed
        refer.help = help
        refer.score_9q = score_9q if score_9q != '' else None
        refer.score_8q = score_8q if score_8q != '' else None
        refer.dis_score_8q = dis_score_8q
        refer.ds8 = ds8
        refer.dis_ds8 = dis_ds8
        refer.help_opd = help_opd
        refer.remed_date = model.DateUtil.parseDate(remed_date, True) if remed_date != '' else None
        refer.suggestion = suggestion
        refer.network_name = network_name
        refer.network_unit = network_unit
        refer.network_ampur = network_ampur
        refer.network_province = network_province
        refer.network_tel = network_tel
        
        s.save_or_update(refer)
        
        relative = model.ZoneReferRelative()
        if id and id != "-1":
            relative = refer.relative
        else:
            relative.refer = refer
        relative.addr_no = addr_no
        relative.name = relative_name
        relative.relationship = relationship
        relative.is_same = True if is_same == '1' else False
        relative.moo = moo
        relative.village = village
        relative.tambon = tambon
        relative.ampur = ampur
        relative.province = province
        relative.tel = tel
        relative.updated_by = user_id
        relative.updated_date = now
        s.save_or_update(relative)
        
        networks = simplejson.loads(request.params.get('networks'))
        for n in networks:
            rn = None
            if n['id'] == -1:
                rn = model.ZoneReferNetwork()
            else:
                rn = s.query(model.ZoneReferNetwork).get(int(n['id']))
                
            rn.updated_by = user_id
            rn.updated_date = now
            rn.refer = refer;
            #rn.network_name = n['network_name'];
            #rn.network_unit = n['network_unit']
            #rn.network_ampur = n['ampur']
            #rn.network_province = n['province']
            rn.refer_date = model.DateUtil.parseDate(n['refer_date'], True) if n['refer_date'] != '' else None
            s.save_or_update(rn)
            
        del_networks = simplejson.loads(request.params.get('del_networks'))
        for n in del_networks:
            rn = s.query(model.ZoneReferNetwork).get(n['id'])
            rn.deleted = True
            rn.deleted_by = user_id
            rn.deleted_date = now
            s.save_or_update(rn)
            
        tools = simplejson.loads(request.params.get('tools'))
        for n in tools:
            rn = None
            if n['id'] == -1:
                rn = model.ZoneReferTool()
            else:
                rn = s.query(model.ZoneReferTool).get(int(n['id']))
                
            rn.updated_by = user_id
            rn.updated_date = now
            rn.refer = refer;
            rn.tool_id = n['tool_id'];
            rn.before = n['before']
            rn.remark = n['remark']
            #rn.network_province = n['province']
            s.save_or_update(rn)
            
        del_tools = simplejson.loads(request.params.get('del_tools'))
        for n in del_tools:
            rn = s.query(model.ZoneReferTool).get(n['id'])
            rn.deleted = True
            rn.deleted_by = user_id
            rn.deleted_date = now
            s.save_or_update(rn)
        
        s.commit()
    
    def add_refer(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') 
        #c.vn_id = request.params.get('vn_id') 
        c.refer_id = request.params.get('id')
        c.monitors = model.ZoneMonitoring.all(s)
        c.patient = s.query(model.Patient).get(c.pa_id)
        c.address = s.query(model.PatientAddress).filter_by(hn=c.patient.hn, ad_type_address='1').first()
        c.tools = model.ZoneTool.all(s)

        if c.refer_id:
            c.refer = s.query(model.ZoneRefer).get(c.refer_id)
        else:
            c.imain = s.query(model.IpdMain).filter_by(hn=c.patient.hn).order_by(model.IpdMain.admit_date.desc()).first()
            c.visit = s.query(model.Visit).filter_by(an=c.imain.an).first() if c.imain else None
            
            c.last_visit = s.query(model.Visit).filter_by(id_patient=c.pa_id).order_by(model.Visit.time_add.desc()).first()
            c.order = s.query(model.NeuralOrder).filter_by(vn_id=c.last_visit.id, order_type='drug', deleted=False).order_by(model.NeuralOrder.order_date.desc()).first() if c.last_visit else None
            c.icd10s = s.query(model.NeuralOrderIcd10).filter_by(order_id=c.order.id).order_by(model.NeuralOrderIcd10.priority).all() if c.order else []
            c.items = [];
            if (c.order):
                #stmt = select([model.Item.name], \
                #       (model.NeuralOrder.deleted==False) & (model.NeuralOrder.vn_id==c.visit.id) &\
                #       (model.NeuralOrder.order_type=='drug'), \
                #       from_obj=[join(model.NeuralOrderItem, model.NeuralOrder, model.NeuralOrderItem.order_id==model.NeuralOrder.id)\
                #                 .join(model.Item, model.NeuralOrderItem.item_id==model.Item.id)])\
                #        .distinct()
                #stmt = select([model.Drug.initial_name, model.NeuralOrderItem.dose, func.sum(model.NeuralOrderItem.qty).label('qty'), model.Drug.pay_unit_name], \
                #   (model.NeuralOrder.deleted==False) & (model.NeuralOrder.vn_id==c.last_visit.id) &\
                #   (model.NeuralOrder.order_type=='drug'), \
                #   from_obj=[join(model.NeuralOrderItem, model.NeuralOrder, model.NeuralOrderItem.order_id==model.NeuralOrder.id)\
                #             .join(model.Drug, model.NeuralOrderItem.drug_id==model.Drug.id)])\
                #    .group_by(model.Drug.initial_name, model.NeuralOrderItem.dose, model.Drug.pay_unit_name)
                stmt = select([model.Drug.initial_name, model.NeuralOrderItem.dose, func.sum(model.NeuralOrderItem.qty).label('qty'), model.Drug.pay_unit_name], \
                   (model.NeuralOrder.deleted==False) & (model.NeuralOrder.id==c.order.id) &\
                   (model.NeuralOrder.order_type=='drug'), \
                   from_obj=[join(model.NeuralOrderItem, model.NeuralOrder, model.NeuralOrderItem.order_id==model.NeuralOrder.id)\
                             .join(model.Drug, model.NeuralOrderItem.drug_id==model.Drug.id)])\
                    .group_by(model.Drug.initial_name, model.NeuralOrderItem.dose, model.Drug.pay_unit_name)
                rs = stmt.execute()
                c.items = rs.fetchall()
        c.du = model.DateUtil
        return render('/zone/add_refer.html')
    
    def print_refer(self):
        s = model.Session()
        c.refer = s.query(model.ZoneRefer).get(request.params.get('refer_id'))
        c.monitors = model.ZoneMonitoring.all(s)
        c.address = s.query(model.PatientAddress).filter_by(hn=c.refer.patient.hn, ad_type_address='1').first()
        c.du = model.DateUtil
        c.hu = model.HTMLUtil
        return render('/zone/print_refer.html')
    
    def get_refers(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        refers = s.query(model.ZoneRefer).filter_by(pa_id=c.pa_id, deleted=False).all()
        results = []
        for r in refers:
            n = s.query(model.ZoneReferNetwork).filter_by(deleted=False, refer_id=r.id).order_by(model.ZoneReferNetwork.refer_date.desc()).first()
            results.append({
                'id': r.id, 
                'created_date': model.DateUtil.toShortFormatDate(r.created_date),
                'refer_date': model.DateUtil.toShortFormatDate(n.refer_date) if n else '', 
                'is_permitted': r.is_permitted,
                'monitor': r.monitor.description if r.monitor else '',
                'score_9q': r.score_9q,
                'score_8q': r.score_8q,
                'conclude_number': s.query(model.ZoneReferResult).filter_by(refer_id=r.id, deleted=False).count()
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def get_refer_networks(self):
        s = model.Session()
        refer_id = request.params.get('refer_id') if request.params.get('refer_id') else -1
        refers = s.query(model.ZoneReferNetwork).filter_by(refer_id=refer_id, deleted=False).all()
        results = []
        for r in refers:
            results.append({
                'id': r.id, 
                'refer_date': model.DateUtil.toShortFormatDate(r.refer_date), 
                #'network_unit': r.network_unit,
                #'network_name': r.network_name,
                #'ampur': r.network_ampur,
                #'province': r.network_province
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def get_refer_tools(self):
        s = model.Session()
        refer_id = request.params.get('refer_id') if request.params.get('refer_id') else -1
        tools = s.query(model.ZoneReferTool).filter_by(refer_id=refer_id, deleted=False).all()
        results = []
        for t in tools:
            results.append({
                'id': t.id, 
                'tool_id': t.tool_id,
                'tool': t.tool.description,
                'remark': t.remark,
                'before': t.before
                #'network_unit': r.network_unit,
                #'network_name': r.network_name,
                #'ampur': r.network_ampur,
                #'province': r.network_province
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def refer_result(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.refer_id = request.params.get('refer_id') if request.params.get('refer_id') else -1
        return render('/zone/refer_result.html')
    
    def get_refer_results(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.refer_id = request.params.get('refer_id') if request.params.get('refer_id') else -1
        refers = s.query(model.ZoneReferResult).filter_by(pa_id=c.pa_id, refer_id=c.refer_id, deleted=False).all()
        results = []
        for r in refers:
            results.append({
                'id': r.id, 
                'visit_date': model.DateUtil.toShortFormatDate(r.visit_date),
                'no': r.no, 
                'score_9q': r.score_9q,
                'score_8q': r.score_8q,
                'lack': r.lack,
                'problem': r.problem,
                'help': r.help,
                'drug_effect': r.drug_effect,
                'refer_id': r.refer_id
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def delete_refer_result(self):
        s = model.Session()
        id = request.params.get('result_id')
        r = s.query(model.ZoneReferResult).get(id)
        r.deleted = True
        r.deleted_by = session['sr_user_id']
        r.deleted_date = datetime.now()
        s.commit()
    
    def add_refer_result(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.refer_id = request.params.get('refer_id') if request.params.get('refer_id') else -1
        c.id = request.params.get('id') if request.params.get('id') else -1
        if (c.id and c.id != -1):
            c.result = s.query(model.ZoneReferResult).get(c.id)
        else:
            stmt = select([func.max(model.zone_refer_result_tb.c.no)], \
                           (model.zone_refer_result_tb.c.refer_id==c.refer_id) &\
                           (model.zone_refer_result_tb.c.deleted==False))
            rs = stmt.execute()
            c.no = rs.scalar()
            c.no = c.no + 1 if c.no else 1
        c.du = model.DateUtil
        return render('/zone/add_refer_result.html')
    
    def save_refer_result(self):
        s = model.Session()
        now = datetime.now()
        user_id = session['sr_user_id']
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.refer_id = request.params.get('refer_id') if request.params.get('refer_id') else -1
        id = request.params.get('id')
        no = request.params.get('no')
        visit_date = request.params.get('visit_date')
        score_9q = request.params.get('score_9q')
        score_8q = request.params.get('score_8q')
        lack = request.params.get('lack')
        drug_effect = request.params.get('drug_effect')
        problem = request.params.get('problem')
        help = request.params.get('help')
        result = model.ZoneReferResult()
        if (id != '-1'):
            result = s.query(model.ZoneReferResult).get(id)
        result.refer_id = c.refer_id
        #result.vn_id = c.vn_id
        result.pa_id = c.pa_id
        result.no = no
        result.visit_date = model.DateUtil.parseDate(visit_date, True) if visit_date != '' else None
        result.score_9q = score_9q
        result.score_8q = score_8q
        result.lack = True if lack == '1' else False
        result.drug_effect = drug_effect
        result.problem = problem
        result.help = help
        result.updated_by = user_id
        result.updated_date = now
        s.save_or_update(result)
        s.commit()
    
    def visit_request(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        return render('/zone/visit_request.html')
    
    def get_visit_requests(self):
        s = model.Session()
        pa_id = request.params.get('pa_id')
        data = s.query(model.ZoneVisitRequest).filter_by(deleted=False, pa_id=pa_id).\
                order_by(model.zone_visit_request_tb.c.request_date).all()
        results = []
        for p in data: 
            results.append({
                'id': p.id, 
                'request_no': p.request_no,
                'request_date': model.DateUtil.toShortFormatDate(p.request_date),
                'symptom': p.symptom,
                'last_admit_date': model.DateUtil.toShortFormatDate(p.last_admit_date) if p.last_admit_date else None,
                'last_discharge_date': model.DateUtil.toShortFormatDate(p.last_discharge_date) if p.last_discharge_date else None,
                'user': p.user.fullname,
                'result': len(p.results)
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def add_visit_request(self):
        c.pa_id = request.params.get('pa_id') 
        #c.vn_id = request.params.get('vn_id') 
        c.req_id = request.params.get('id')
        c.request = None
        s = model.Session()
        
        if (c.req_id):
            c.request = s.query(model.ZoneVisitRequest).get(c.req_id)
            c.pa_id = c.request.pa_id
        else:
            c.req_id = -1
            #c.vn_id = c.request.vn_id
        c.patient = s.query(model.Patient).get(c.pa_id)
        c.address = s.query(model.PatientAddress).filter_by(hn=c.patient.hn, ad_type_address='1').first()
        c.imain = s.query(model.IpdMain).filter_by(hn=c.patient.hn).order_by(model.IpdMain.admit_date.desc()).first()
        c.visit = s.query(model.Visit).filter_by(an=c.imain.an).first() if c.imain else None
#        c.order = s.query(model.NeuralOrder).filter_by(vn_id=c.visit.id, order_type='drug', deleted=False).order_by(model.NeuralOrder.order_date.desc()).first() if c.visit else None
#        c.icd10s = s.query(model.NeuralOrderIcd10).filter_by(order_id=c.order.id).order_by(model.NeuralOrderIcd10.priority).all() if c.order else []
        c.last_visit = s.query(model.Visit).filter_by(id_patient=c.pa_id).order_by(model.Visit.time_add.desc()).first()
        c.order = s.query(model.NeuralOrder).filter_by(vn_id=c.last_visit.id, order_type='drug', mode='homemed', deleted=False).join('visit').filter_by(an=None).order_by(model.NeuralOrder.order_date.desc()).first() if c.last_visit else None
        c.icd10s = s.query(model.NeuralOrderIcd10).filter_by(order_id=c.order.id).order_by(model.NeuralOrderIcd10.priority).all() if c.order else []
        c.items = [];
        if (c.order):
            stmt = select([model.Drug.initial_name, model.NeuralOrderItem.dose, func.sum(model.NeuralOrderItem.qty).label('qty'), model.Drug.pay_unit_name], \
                   (model.NeuralOrder.deleted==False) & (model.NeuralOrder.id==c.order.id) &\
                   (model.NeuralOrder.order_type=='drug'), \
                   from_obj=[join(model.NeuralOrderItem, model.NeuralOrder, model.NeuralOrderItem.order_id==model.NeuralOrder.id)\
                             .join(model.Drug, model.NeuralOrderItem.drug_id==model.Drug.id)])\
                    .group_by(model.Drug.initial_name, model.NeuralOrderItem.dose, model.Drug.pay_unit_name)
                
            #stmt = select([model.Drug.initial_name, model.NeuralOrderItem.dose, func.sum(model.NeuralOrderItem.qty).label('qty'), model.Drug.pay_unit_name], \
            #       (model.NeuralOrder.deleted==False) & (model.NeuralOrder.vn_id==c.last_visit.id) &\
            #       (model.NeuralOrder.order_type=='drug'), \
            #       from_obj=[join(model.NeuralOrderItem, model.NeuralOrder, model.NeuralOrderItem.order_id==model.NeuralOrder.id)\
            #                 .join(model.Drug, model.NeuralOrderItem.drug_id==model.Drug.id)])\
            #        .group_by(model.Drug.initial_name, model.NeuralOrderItem.dose, model.Drug.pay_unit_name)
            rs = stmt.execute()
            c.items = rs.fetchall()
        c.problems = model.ZoneProblem.all(s)
        c.conditions = model.ZoneCondition.all(s)
        c.new_problems = model.ZoneNewProblem.all(s)
        c.tools = model.ZoneTool.all(s)
        c.du = model.DateUtil        
        return render('/zone/add_visit_request.html')
    
    def save_visit_request(self):
        user_id = session['sr_user_id']
        s = model.Session()
        req_id = request.params.get('id')
        pa_id = request.params.get('pa_id') 
        #vn_id = request.params.get('vn_id')
        is_permitted =  request.params.get('is_permitted')
        cond_remark =  request.params.get('condition_remark')
        request_no = request.params.get('request_no')
        symptom = request.params.get('symptom')
        last_admit_date = request.params.get('last_admit_date')
        last_discharge_date = request.params.get('last_discharge_date')
        diag = request.params.get('diag')
        lab_result = request.params.get('lab_result')
        med = request.params.get('med')
        #remark = request.params.get('remark')
        reason = request.params.get('reason')
        problem_date = request.params.getall('problem_date')
        problem_remark = request.params.getall('problem_remark')
        activity = request.params.getall('activity')
        result = request.params.getall('result')
        employee = request.params.getall('employee')
        problems = simplejson.loads(request.params.get('problem_data'))
        conditions = request.params.getall('conditions')
        new_problems = request.params.getall('newproblems')
        first_8q = request.params.get('first_8q')
        first_9q = request.params.get('first_9q')
        last_8q = request.params.get('last_8q')
        last_9q = request.params.get('last_9q')
        discharge_symptom = request.params.get('discharge_symptom')
        self_harm_method = request.params.get('self_harm_method')
        self_harm = request.params.get('self_harm')
        want_self_harm = request.params.get('want_self_harm')
        officer_limit =  request.params.get('officer_limit')
        
        relative_name = request.params.get('relative_name')
        relationship = request.params.get('relationship')
        is_same = request.params.get('is_same')
        addr_no = request.params.get('addr_no')
        moo = request.params.get('moo')
        village = request.params.get('village')
        tambon = request.params.get('tambon')
        ampur = request.params.get('ampur')
        province = request.params.get('province')
        tel = request.params.get('tel')
        
        network_name = request.params.get('network_name')
        network_unit = request.params.get('network_unit')
        network_ampur = request.params.get('network_ampur')
        network_province = request.params.get('network_province')
        network_tel = request.params.get('network_tel')
        
        complicated_problem = request.params.get('complicated_problem')
        suggestion = request.params.get('suggestion')
        
        now = datetime.now()
        
        vr = model.ZoneVisitRequest()
        if req_id and req_id != '-1':
            vr = s.query(model.ZoneVisitRequest).get(req_id)
        else:
            vr.request_date = now
        #vr.vn_id = vn_id
        vr.pa_id = pa_id
        
        vr.symptom = symptom
        vr.last_admit_date = model.DateUtil.parseDate(last_admit_date, True) if last_admit_date != '' else None
        vr.last_discharge_date = model.DateUtil.parseDate(last_discharge_date, True) if last_discharge_date != '' else None
        vr.diag = diag
        vr.lab_result = lab_result
        #vr.remark = remark
        vr.request_no = request_no
        vr.med = med
        vr.reason = reason
        vr.is_permitted = True if is_permitted=='1' else False
        vr.cond_remark = cond_remark
        vr.officer_limit = True if officer_limit=='1' else False
        vr.first_8q = first_8q
        vr.first_9q = first_9q
        vr.last_8q = last_8q
        vr.last_9q = last_9q
        vr.discharge_symptom = discharge_symptom
        vr.self_harm_method = self_harm_method
        vr.self_harm = self_harm
        vr.want_self_harm = want_self_harm
        
        vr.complicated_problem = complicated_problem
        vr.suggestion = suggestion
        vr.network_name = network_name
        vr.network_unit = network_unit
        vr.network_ampur = network_ampur
        vr.network_province = network_province
        vr.network_tel = network_tel
        
        vr.addr_no = addr_no
        vr.relative_name = relative_name
        vr.relationship = relationship
        vr.is_same = True if is_same == '1' else False
        vr.moo = moo
        vr.village = village
        vr.tambon = tambon
        vr.ampur = ampur
        vr.province = province
        vr.tel = tel
        
        vr.updated_by = session['sr_user_id']
        vr.updated_date = now
        vr.problem_date = model.DateUtil.parseDate(problem_date[0], True) if problem_date[0] != '' else None
        s.save_or_update(vr)
        for i in range(len(problems)):
            if problems[i]['checked']:
                if req_id:
                    rp = s.query(model.ZoneRequestProblem).filter_by(req_id=req_id, problem_id=problems[i]['id']).first()
                rp = model.ZoneRequestProblem() if rp == None else rp
                
                rp.request = vr
                rp.problem_id = problems[i]['id']
                #rp.problem_date = model.DateUtil.parseDate(problem_date[i], True) if problem_date[i] != '' else None
                rp.remark = problem_remark[i]
                rp.activity = activity[i]
                rp.result = result[i]
                rp.employee = employee[i]
                rp.updated_by = session['sr_user_id']
                rp.updated_date = now
                s.save_or_update(rp)
                
        if req_id:
            dels = s.query(model.ZoneVisitCondition).filter_by(request_id=req_id).all()
            for d in dels:
                s.delete(d)
        
        for cd in conditions:
            ob = model.ZoneVisitCondition()
            ob.request = vr
            ob.condition_id = cd
            ob.updated_by = user_id
            ob.updated_date = now
            s.save_or_update(ob)
            
        if req_id:
            dels = s.query(model.ZoneVisitProblem).filter_by(request_id=req_id).all()
            for d in dels:
                s.delete(d)
        
        for p in new_problems:
            ob = model.ZoneVisitProblem()
            ob.request = vr
            ob.problem_id = p
            ob.updated_by = user_id
            ob.updated_date = now
            s.save_or_update(ob)
            
        tools = simplejson.loads(request.params.get('tools'))
        for n in tools:
            rn = None
            if n['id'] == -1:
                rn = model.ZoneRequestTool()
            else:
                rn = s.query(model.ZoneRequestTool).get(int(n['id']))
                
            rn.updated_by = user_id
            rn.updated_date = now
            rn.request = vr;
            rn.tool_id = n['tool_id'];
            rn.before = n['before']
            rn.remark = n['remark']
            #rn.network_province = n['province']
            s.save_or_update(rn)
            
        del_tools = simplejson.loads(request.params.get('del_tools'))
        for n in del_tools:
            rn = s.query(model.ZoneRequestTool).get(n['id'])
            rn.deleted = True
            rn.deleted_by = user_id
            rn.deleted_date = now
            s.save_or_update(rn)
    
        s.commit()
        
    def print_request(self):
        s = model.Session()
        c.request = s.query(model.ZoneVisitRequest).get(request.params.get('request_id'))
        c.problems = model.ZoneProblem.all(s)
        c.conditions = model.ZoneCondition.all(s)
        c.new_problems = model.ZoneNewProblem.all(s)
        c.address = s.query(model.PatientAddress).filter_by(hn=c.request.patient.hn, ad_type_address='1').first()
        c.du = model.DateUtil
        c.hu = model.HTMLUtil
        return render('/zone/print_request.html')
        
    def get_request_tools(self):
        s = model.Session()
        req_id = request.params.get('req_id') if request.params.get('req_id') else -1
        tools = s.query(model.ZoneRequestTool).filter_by(req_id=req_id, deleted=False).all()
        results = []
        for t in tools:
            results.append({
                'id': t.id, 
                'tool_id': t.tool_id,
                'tool': t.tool.description,
                'remark': t.remark,
                'before': t.before
                #'network_unit': r.network_unit,
                #'network_name': r.network_name,
                #'ampur': r.network_ampur,
                #'province': r.network_province
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def get_result_visitors(self):
        s = model.Session()
        res_id = request.params.get('res_id')
        data = s.query(model.ZoneResultVisitor).filter_by(deleted=False, result_id=res_id).\
                order_by(model.zone_result_visitor_tb.c.id).all()
        results = []
        for d in data: 
            results.append({
                'id': d.id, 
                'result_id': d.result_id,
                'visitor': d.visitor,
                'position': d.position,
                'workplace': d.workplace,
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def get_visit_leaders(self):
        s = model.Session()
        res_id = request.params.get('res_id')
        data = s.query(model.ZoneVisitLeader).filter_by(deleted=False, result_id=res_id).\
                order_by(model.zone_visit_leader_tb.c.id).all()
        results = []
        for d in data: 
            results.append({
                'id': d.id, 
                'result_id': d.result_id,
                'name': d.name,
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def get_visit_relatives(self):
        s = model.Session()
        res_id = request.params.get('res_id')
        data = s.query(model.ZoneVisitFamily).filter_by(deleted=False, result_id=res_id).\
                order_by(model.zone_visit_family_tb.c.id).all()
        results = []
        for d in data: 
            results.append({
                'id': d.id, 
                'result_id': d.result_id,
                'name': d.name,
                'relationship': d.relationship,
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def get_visit_helps(self):
        s = model.Session()
        res_id = request.params.get('res_id')
        data = s.query(model.ZoneVisitHelp).filter_by(deleted=False, result_id=res_id).\
                order_by(model.zone_visit_help_tb.c.id).all()
        results = []
        for d in data: 
            results.append({
                'id': d.id, 
                'result_id': d.result_id,
                'problem': d.problem,
                'help': d.help,
                'assessment': d.assessment,
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def visit_result(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.req_id = request.params.get('req_id') if request.params.get('req_id') else -1
        return render('/zone/visit_result.html')
    
    def get_visit_results(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.req_id = request.params.get('req_id') if request.params.get('req_id') else -1
        vrs = s.query(model.ZoneVisitResult).filter_by(pa_id=c.pa_id, request_id=c.req_id, deleted=False).all()
        results = []
        for r in vrs:
            results.append({
                'id': r.id, 
                'visit_date': model.DateUtil.toShortFormatDate(r.visit_date),
                'no': r.no, 
                'score_9q': r.score_9q,
                'score_8q': r.score_8q,
                'is_rated': r.is_rated,
                'is_stop': r.is_stop,
                'req_no': r.request.request_no,
                'req_id': r.request_id
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def add_visit_result(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        #c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.req_id = request.params.get('req_id') if request.params.get('req_id') else -1
        c.id = request.params.get('id') if request.params.get('id') else -1
        s = model.Session()
        c.reasons = model.ZoneReason.all(s)
        c.objectives = model.ZoneObjective.all(s)
        c.personalities = model.ZonePersonality.all(s)
        c.stresses = model.ZoneStressManagement.all(s)
        
        c.request = s.query(model.ZoneVisitRequest).get(c.req_id)
        if c.id and c.id != -1:
            c.result = s.query(model.ZoneVisitResult).get(c.id)
        else:
            stmt = select([func.max(model.zone_visit_result_tb.c.no)], \
                           (model.zone_visit_result_tb.c.request_id==c.req_id) &\
                           (model.zone_visit_result_tb.c.deleted==False))
            rs = stmt.execute()
            c.no = rs.scalar()
            c.no = c.no + 1 if c.no else 1
        c.du = model.DateUtil
        return render('/zone/add_visit_result.html')
    
    def delete_visit_result(self):
        s = model.Session()
        id = request.params.get('result_id')
        r = s.query(model.ZoneVisitResult).get(id)
        r.deleted = True
        r.deleted_by = session['sr_user_id']
        r.deleted_date = datetime.now()
        s.commit()
    
    def save_visit_result(self):
        s = model.Session()
        now = datetime.now()
        user_id = session["sr_user_id"]
        #vn_id = request.params.get('vn_id')
        pa_id = request.params.get('pa_id')
        req_id = request.params.get('req_id')
        res_id = request.params.get('id')
        
        visit_date = request.params.get('visit_date')
        no = request.params.get('no')
        from_time = request.params.get('from_time')
        to_time = request.params.get('to_time')
        is_rated = request.params.get('is_rated')
        informant = request.params.get('informant')
        relationship = request.params.get('relationship')
        environment = request.params.get('environment')
        history_family = request.params.get('history_family')
        heredity = request.params.get('heredity')
        family_relationship = request.params.get('family_relationship')
        community_relationship = request.params.get('community_relationship')
        factor = request.params.get('factor')
        drug_usage = request.params.get('drug_usage')
        history_mental = request.params.get('history_mental')
        history_physical = request.params.get('history_physical')
        current_symptom = request.params.get('current_symptom')
        score_8q = request.params.get('score_8q')
        score_9q = request.params.get('score_9q')
        problem_patient = request.params.get('problem_patient')
        problem_relative = request.params.get('problem_relative')
        problem_other = request.params.get('problem_other')
        support = request.params.get('support')
        remark = request.params.get('remark')
        reason_remark = request.params.get('reason_remark')
        objective_remark = request.params.get('objective_remark')
        personality_remark = request.params.get('personality_remark')
        stress_remark = request.params.get('stress_remark')
        is_stop = request.params.get('is_stop')
        reasons = request.params.getall('reasons')
        objectives = request.params.getall('objectives')
        personalities = request.params.getall('personalities')
        stresses = request.params.getall('stresses')
        
        vr = model.ZoneVisitResult()
        if res_id and res_id != '-1':
            vr = s.query(model.ZoneVisitResult).get(res_id)
        vr.visit_date = model.DateUtil.parseDate(visit_date, True) if visit_date != '' else None
        #vr.vn_id = vn_id
        vr.pa_id = pa_id
        vr.request_id = req_id
        vr.no = no
        vr.from_time = from_time
        vr.to_time = to_time
        vr.is_rated = True if is_rated == '1' else False 
        vr.informant = informant
        vr.relationship = relationship
        vr.environment = environment
        vr.history_family = history_family
        vr.heredity = heredity
        vr.family_relationship = family_relationship
        vr.community_relationship = community_relationship
        vr.factor = factor
        vr.drug_usage = drug_usage
        vr.history_mental = history_mental
        vr.history_physical = history_physical
        vr.current_symptom = current_symptom
        vr.score_8q = score_8q
        vr.score_9q = score_9q
        vr.problem_patient = problem_patient
        vr.problem_relative = problem_relative
        vr.problem_other = problem_other
        vr.support = support
        vr.remark = remark
        vr.reason_remark = reason_remark
        vr.objective_remark = objective_remark
        vr.personality_remark = personality_remark
        vr.stress_remark = stress_remark
        vr.is_stop = True if is_stop == '1' else False
        vr.updated_by = user_id
        vr.updated_date = now
        s.save_or_update(vr)
        
        if res_id:
            dels = s.query(model.ZoneVisitReason).filter_by(result_id=res_id).all()
            for d in dels:
                s.delete(d)
        
        for rs in reasons:
            ob = model.ZoneVisitReason()
            ob.result = vr
            ob.reason_id = rs
            ob.updated_by = user_id
            ob.updated_date = now
            s.save_or_update(ob)
            
        if res_id:
            dels = s.query(model.ZoneVisitObjective).filter_by(result_id=res_id).all()
            for d in dels:
                s.delete(d)
        
        for rs in personalities:
            ob = model.ZoneVisitObjective()
            ob.result = vr
            ob.objective_id = rs
            ob.updated_by = user_id
            ob.updated_date = now
            s.save_or_update(ob)
        
        if res_id:
            dels = s.query(model.ZoneVisitStress).filter_by(result_id=res_id).all()
            for d in dels:
                s.delete(d)
        
        for rs in personalities:
            ob = model.ZoneVisitStress()
            ob.result = vr
            ob.stress_id = rs
            ob.updated_by = user_id
            ob.updated_date = now
            s.save_or_update(ob)
            
        if res_id:
            dels = s.query(model.ZoneVisitPersonality).filter_by(result_id=res_id).all()
            for d in dels:
                s.delete(d)
        
        for rs in personalities:
            ob = model.ZoneVisitPersonality()
            ob.result = vr
            ob.personality_id = rs
            ob.updated_by = user_id
            ob.updated_date = now
            s.save_or_update(ob)

        visitors = simplejson.loads(request.params.get('visitors'))
        for v in visitors:
            rv = None
            if v['id'] == -1:
                rv = model.ZoneResultVisitor()
            else:
                rv = s.query(model.ZoneResultVisitor).get(int(v['id']))
                
            rv.updated_by = user_id
            rv.updated_date = now
            rv.result = vr;
            rv.visitor = v['visitor'];
            rv.position = v['position']
            rv.workplace = v['workplace']
            s.save_or_update(rv)
            
        del_visitors = simplejson.loads(request.params.get('del_visitors'))
        for v in del_visitors:
            rv = s.query(model.ZoneResultVisitor).get(v['id'])
            rv.deleted = True
            rv.deleted_by = user_id
            rv.deleted_date = now
            s.save_or_update(rv)
            
        relatives = simplejson.loads(request.params.get('relatives'))
        for r in relatives:
            rl = None
            if r['id'] == -1:
                rl = model.ZoneVisitFamily()
            else:
                rl = s.query(model.ZoneVisitFamily).get(int(r['id']))
                
            rl.updated_by = user_id
            rl.updated_date = now
            rl.result = vr;
            rl.name = r['name'];
            rl.relationship = r['relationship']
            s.save_or_update(rl)
            
        del_relatives = simplejson.loads(request.params.get('del_relatives'))
        for r in del_relatives:
            rl = s.query(model.ZoneVisitFamily).get(r['id'])
            rl.deleted = True
            rl.deleted_by = user_id
            rl.deleted_date = now
            s.save_or_update(rl)
    
        leaders = simplejson.loads(request.params.get('leaders'))
        for l in leaders:
            vl = None
            if l['id'] == -1:
                vl = model.ZoneVisitLeader()
            else:
                vl = s.query(model.ZoneVisitLeader).get(int(l['id']))
                
            vl.updated_by = user_id
            vl.updated_date = now
            vl.result = vr;
            vl.name = l['name'];
            s.save_or_update(vl)
            
        del_leaders = simplejson.loads(request.params.get('del_leaders'))
        for l in del_leaders:
            vl = s.query(model.ZoneVisitLeader).get(l['id'])
            vl.deleted = True
            vl.deleted_by = user_id
            vl.deleted_date = now
            s.save_or_update(vl)
            
        helps = simplejson.loads(request.params.get('helps'))
        for h in helps:
            vh = None
            if h['id'] == -1:
                vh = model.ZoneVisitHelp()
            else:
                vh = s.query(model.ZoneVisitHelp).get(int(h['id']))
                
            vh.updated_by = user_id
            vh.updated_date = now
            vh.result = vr;
            vh.problem = h['problem'];
            vh.help = h['help']
            vh.help = h['assessment']
            s.save_or_update(vh)
            
        del_helps = simplejson.loads(request.params.get('del_helps'))
        for h in del_helps:
            vh = s.query(model.ZoneVisitHelp).get(h['id'])
            vh.deleted = True
            vh.deleted_by = user_id
            vh.deleted_date = now
            s.save_or_update(vh)
        
        s.commit()
    
    def diag_map(self):
        s = model.Session()
        #start_date = model.DateUtil.parseDate(request.params.get('start_date'), True)
        #end_date = model.DateUtil.parseDate(request.params.get('end_date'), True)
        
        c.diags = s.query(model.NeuralIcd10).filter(model.NeuralIcd10.name!=None).\
            filter(model.NeuralIcd10.name!='').filter(func.length(model.NeuralIcd10.code)==3).order_by(model.NeuralIcd10.code).all() 
        return render('/zone/diag_map.html') 
        
    def get_diag_map_data(self):
        data = []
        diag = request.params.get('diag')
        stmt = select([model.NeuralOrderIcd10.visit_id, model.Patient.tmbpart, model.Patient.amppart, 
                       model.Patient.chwpart, model.ZoneTambon.lat, model.ZoneTambon.long], \
               (model.NeuralOrderIcd10.priority==1) & (model.NeuralOrderIcd10.icd10_id==diag), \
               from_obj=[join(model.NeuralOrderIcd10, model.NeuralIcd10, model.NeuralOrderIcd10.icd10_id==model.NeuralIcd10.id)\
                         .join(model.Visit, model.NeuralOrderIcd10.visit_id==model.Visit.id)\
                         .join(model.Patient, model.Visit.id_patient==model.Patient.id)\
                         .join(model.ZoneTambon, model.Patient.chwpart + model.Patient.amppart + model.Patient.tmbpart==model.ZoneTambon.tambon_id)])\
                .distinct()
        rs = stmt.execute()
        results = rs.fetchall()
        
        for r in results: 
            data.append({
                'visit_id': r.visit_id,
                'chwpart': r.chwpart if r.chwpart else '', 
                'amppart': r.amppart if r.amppart else '',
                'tmbpart': r.tmbpart if r.tmbpart else '',
                'latitude': r.lat,
                'longitude': r.long
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':data})