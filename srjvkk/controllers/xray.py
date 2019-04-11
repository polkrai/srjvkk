# -*- encoding: utf-8 -*-

import logging

import simplejson

from srjvkk.lib.base import *

log = logging.getLogger(__name__)

import srutil
from datetime import datetime, timedelta
from sqlalchemy.sql import and_, or_, not_, select, join, between
from math import ceil

class XrayController(BaseController):

    def __before__(self):
        if config['jvkk.login'] != 'yes':
            # now that we have no login controller.
            session['sr_user_id'] = 157
            session['sr_session_id'] = '__dummy__'
            session['sr_com'] = 'xray'
            s = model.Session()
            session['sr_user'] = s.query(model.User).get(session['sr_user_id']) 
            session['sr_component'] = s.query(model.Component).get(model.Component.XrayId);
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
            session['sr_com'] = 'xray'
            s = model.Session()
            session['sr_user'] = s.query(model.User).get(session['sr_user_id']) 
            session['sr_component'] = s.query(model.Component).get(model.Component.XrayId);
            session.save()    
            
                
    def index(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.sendcoms = model.Component.sendcoms(s)
        c.com_id = model.Component.XrayId
        c.com_name = s.query(model.Component).get(c.com_id).com_name
        return render('/xray/main.html')
    
    def setup_main(self):
        return render('/xray/setup_main.html')
    
    def setup_part(self):
        return render('/xray/setup_part.html')
    
    def get_parts(self):        
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        data = []
        if query:
            data = s.query(model.XrayPart).filter_by(deleted=False).\
                filter(model.XrayPart.description.like(query + '%')).limit(int(limit)).all()
        else:
            data = model.XrayPart.all(s)
        results = []
        for p in data:
            results.append({'id': p.id, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def save_part(self):
        s = model.Session()
        data = simplejson.loads(request.params.get('data'))
        delData = simplejson.loads(request.params.get('del-data'))
        for d in data:
            obj = model.XrayPart()
            if d['id'] == -1:
                obj.deleted = False
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            else:
                obj = s.query(model.XrayPart).get(int(d['id']))
                obj.updated_by = session['sr_user_id']
                obj.updated_date = datetime.now()
            obj.description = d['description']
            s.save_or_update(obj)
        
        for d in delData:
            obj = s.query(model.XrayPart).get(int(d['id']))
            obj.deleted = True
            obj.deleted_date = datetime.now()
            obj.deleted_by = session['sr_user_id']
            s.save_or_update(obj)
        s.commit()
    
    def eeg(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        return render('/xray/eeg.html')
    
    def add_eeg(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.id = request.params.get('id') if request.params.get('id') else -1
        if c.id != -1:
            s = model.Session()
            c.eeg = s.query(model.XrayEEG).get(c.id) 
        c.du = model.DateUtil
        return render('/xray/add_eeg.html')
    
    def save_eeg(self):
        params = request.params
        user_id = session['sr_user_id']
        id = params['id']
        now = datetime.now()
        s = model.Session()
        user = s.query(model.User).get(user_id)
        eeg = model.XrayEEG()
        eeg.eeg_date = now
        if id != '-1':
            eeg = s.query(model.XrayEEG).get(id)
            
        eeg.pa_id = params['pa_id']
        eeg.vn_id = params['vn_id']
        eeg.eeg_no = params['eeg_no']
        eeg.symptom = params['symptom']
        eeg.diag = params['diag']
        eeg.doctor_send = params['doctor_send']
        eeg.doctor_read = params['doctor_read']
        if params.has_key('is_done'):
            eeg.is_done = True
            eeg.done_date = now
            visit = s.query(model.Visit).get(params['vn_id'])
            item = model.Item.get_eeg(s)
            order_id = model.NeuralOrder.make_order(s, visit, user, 'eeg', item, 1)
            eeg.order_id = order_id
        else:
            eeg.is_done = False
            eeg.done_date = None
        eeg.updated_by = user_id
        eeg.updated_date = now
        s.save_or_update(eeg)
        s.commit()
        
    def delete_eeg(self):
        id = request.params['eeg_id']
        s = model.Session()
        eeg = s.query(model.XrayEEG).get(id)
        eeg.deleted = True
        eeg.deleted_by = session['sr_user_id']
        eeg.deleted_date = datetime.now()
        s.save_or_update(eeg)
        s.commit()
    
    def get_eegs(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        data = s.query(model.XrayEEG).filter_by(pa_id=c.pa_id, deleted=False).order_by(model.XrayEEG.eeg_date.desc()).all()
        results = []
        for d in data:
            results.append({
                'id': d.id, 
                'eeg_date': model.DateUtil.toShortFormatDate(d.eeg_date), 
                'eeg_no': d.eeg_no,
                'result': d.result,
                'doctor_send': d.doctor_send,
                'is_done': d.is_done,
                'done_date': model.DateUtil.toShortFormatDate(d.done_date)
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def search_eeg(self): 
        s = model.Session()
        from_date = model.DateUtil.parseDate(request.params.get('from_date'), True)
        to_date = model.DateUtil.parseDate(request.params.get('to_date'), True)
        from_date = model.DateUtil.startOfTheDay(from_date)
        to_date = model.DateUtil.endOfTheDay(to_date)
        data = s.query(model.XrayEEG).filter(between(model.xray_eeg_tb.c.eeg_date, 
                        from_date, to_date)).filter_by(deleted=False).order_by(model.XrayEEG.eeg_date.desc()).all()
        results = []
        for d in data:
            results.append({
                'id': d.id, 
                'eeg_date': model.DateUtil.toShortFormatDate(d.eeg_date), 
                'eeg_no': d.eeg_no,
                'result': d.result,
                'doctor_send': d.doctor_send,
                'is_done': d.is_done,
                'done_date': model.DateUtil.toShortFormatDate(d.done_date),
                'hn': d.patient.hn,
                'an': d.visit.an if d.visit.an else '',
                'name': d.patient._get_name(),
                'sex': u'ชาย' if d.patient.pa_sex == '1' else u'หญิง',
                'age':model.DateUtil.calculateAge(d.patient.pa_birthdate),
                'privilege': d.visit.privilege.name,
                'building': d.visit.admit_main.building.building_name if d.visit.admit_main else '',
                'remark': d.remark
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def ekg(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        return render('/xray/ekg.html')
    
    def add_ekg(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        c.id = request.params.get('id') if request.params.get('id') else -1
        if c.id != -1:
            s = model.Session()
            c.ekg = s.query(model.XrayEKG).get(c.id) 
        c.du = model.DateUtil
        return render('/xray/add_ekg.html')
    
    def save_ekg(self):
        params = request.params
        user_id = session['sr_user_id']
        id = params['id']
        now = datetime.now()
        s = model.Session()
        user = s.query(model.User).get(user_id)
        ekg = model.XrayEKG()
        ekg.ekg_date = now
        if id != '-1':
            ekg = s.query(model.XrayEKG).get(id)
            
        ekg.pa_id = params['pa_id']
        ekg.vn_id = params['vn_id']
        ekg.ekg_no = params['ekg_no']
        ekg.symptom = params['symptom']
        ekg.diag = params['diag']
        ekg.doctor_send = params['doctor_send']
        ekg.doctor_read = params['doctor_read']
        if params.has_key('is_done'):
            ekg.is_done = True
            ekg.done_date = now
            visit = s.query(model.Visit).get(params['vn_id'])
            item = model.Item.get_ekg(s)
            order_id = model.NeuralOrder.make_order(s, visit, user, 'ekg', item, 1)
            ekg.order_id = order_id
        else:
            ekg.is_done = False
            ekg.done_date = None
        ekg.updated_by = user_id
        ekg.updated_date = now
        s.save_or_update(ekg)
        s.commit()
        
    def delete_ekg(self):
        id = request.params['ekg_id']
        s = model.Session()
        ekg = s.query(model.XrayEKG).get(id)
        ekg.deleted = True
        ekg.deleted_by = session['sr_user_id']
        ekg.deleted_date = datetime.now()
        s.save_or_update(ekg)
        s.commit()
    
    def get_ekgs(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        data = s.query(model.XrayEKG).filter_by(pa_id=c.pa_id, deleted=False).order_by(model.XrayEKG.ekg_date.desc()).all()
        results = []
        for d in data:
            results.append({
                'id': d.id, 
                'ekg_date': model.DateUtil.toShortFormatDate(d.ekg_date), 
                'ekg_no': d.ekg_no,
                'result': d.result,
                'doctor_send': d.doctor_send,
                'is_done': d.is_done,
                'done_date': model.DateUtil.toShortFormatDate(d.done_date)
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    def search_ekg(self): 
        s = model.Session()
        from_date = model.DateUtil.parseDate(request.params.get('from_date'), True)
        to_date = model.DateUtil.parseDate(request.params.get('to_date'), True)
        from_date = model.DateUtil.startOfTheDay(from_date)
        to_date = model.DateUtil.endOfTheDay(to_date)
        data = s.query(model.XrayEKG).filter(between(model.xray_ekg_tb.c.ekg_date, 
                        from_date, to_date)).filter_by(deleted=False).order_by(model.XrayEKG.ekg_date.desc()).all()
        results = []
        for d in data:
            results.append({
                'id': d.id, 
                'ekg_date': model.DateUtil.toShortFormatDate(d.ekg_date), 
                'ekg_no': d.ekg_no,
                'result': d.result,
                'doctor_send': d.doctor_send,
                'is_done': d.is_done,
                'done_date': model.DateUtil.toShortFormatDate(d.done_date),
                'hn': d.patient.hn,
                'an': d.visit.an if d.visit.an else '',
                'name': d.patient._get_name(),
                'sex': u'ชาย' if d.patient.pa_sex == '1' else u'หญิง',
                'age':model.DateUtil.calculateAge(d.patient.pa_birthdate),
                'privilege': d.visit.privilege.name,
                'building': d.visit.admit_main.building.building_name if d.visit.admit_main else '',
                'remark': d.remark
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})
    
    
    def xray(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        return render('/xray/xray.html')
    
    def get_xrays(self):
        s = model.Session()
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        data = s.query(model.XrayXray).filter_by(pa_id=c.pa_id, deleted=False).order_by(model.XrayXray.xray_date.desc()).all()
        results = []
        for d in data:
            part = ''
            for p in d.parts:
                if part != '':
                    part += ', '
                part += p.part.description
            results.append({
                'id': d.id, 
                'xray_date': model.DateUtil.toShortFormatDate(d.xray_date), 
                'xray_no': d.xray_no,
                'part': part,
                'film_size': d.film_size,
                'film_number': d.film_number,
                'result': d.result,
                'doctor_send': d.doctor_send,
                'is_done': d.is_done,
                'done_date': model.DateUtil.toShortFormatDate(d.done_date)
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'data':results})

    def add_xray(self):
        c.pa_id = request.params.get('pa_id') if request.params.get('pa_id') else -1
        c.vn_id = request.params.get('vn_id') if request.params.get('vn_id') else -1
        s = model.Session()
        c.parts = s.query(model.XrayPart).filter_by(deleted=False).all()
        c.id = request.params.get('id') if request.params.get('id') else -1
        if c.id != -1:
            c.xray = s.query(model.XrayXray).get(c.id) 
        c.du = model.DateUtil
        return render('/xray/add_xray.html')
    
    def save_xray(self):
        params = request.params
        user_id = session['sr_user_id']
        now = datetime.now()
        s = model.Session()
        user = s.query(model.User).get(user_id)
        xray = model.XrayXray()
        xray.pa_id = params['pa_id']
        xray.vn_id = params['vn_id']
        id = params['id']
        if id and id!='-1':
            xray = s.query(model.XrayXray).get(id)
        xray.xray_no = params['xray_no']
        xray.xray_date = now
        parts = params.getall('part')
        if id and id!='-1':
            dels = s.query(model.XrayXrayPart).filter_by(xray_id=id).all()
            for d in dels:
                s.delete(d)
        
        for p in parts:
            ob = model.XrayXrayPart()
            ob.xray = xray
            ob.part_id = p
            ob.updated_by = user_id
            ob.updated_date = now
            s.save_or_update(ob)
        
        xray.doctor_send = params['doctor_send']
        xray.doctor_read = params['doctor_read']
        xray.film_size = params['film_size']
        xray.film_number = params['film_number']
        
        if params.has_key('is_done'):
            xray.is_done = True
            xray.done_date = now
            visit = s.query(model.Visit).get(params['vn_id'])
            item = model.Item.get_xray(s)
            order_id = model.NeuralOrder.make_order(s, visit, user, 'xray', item, xray.film_number)
            xray.order_id = order_id
        else:
            xray.is_done = False
            xray.done_date = None
        
        xray.result = params['result']
        xray.updated_by = user_id
        xray.updated_date = now
        s.save_or_update(xray)
        s.commit()
        
    def delete_xray(self):
        id = request.params['xray_id']
        s = model.Session()
        xray = s.query(model.XrayXray).get(id)
        xray.deleted = True
        xray.deleted_by = session['sr_user_id']
        xray.deleted_date = datetime.now()
        s.save_or_update(xray)
        s.commit()
        
    def report_main(self):
        return render('/xray/report/reportmain.html')
        
    def eeg_report(self):
        c.du = model.DateUtil
        c.now = datetime.now()
        return render('/xray/report/rpteeg.html')
    
    def ekg_report(self):
        c.du = model.DateUtil
        c.now = datetime.now()
        return render('/xray/report/rptekg.html')
        