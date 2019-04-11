# -*- encoding: utf-8 -*-

import logging

import simplejson

from srjvkk.lib.base import *
from datetime import datetime, timedelta
from time import mktime
from sqlalchemy.sql import and_, or_, not_, func
from sqlalchemy.orm import eagerload

import srjvkk.model as model

from pylons import config

log = logging.getLogger(__name__)

class SrutilController(BaseController):
    def __before__(self):
        if config['jvkk.login'] != 'yes':
            # now that we have no login controller.
            session['sr_user_id'] = 157
            session['sr_session_id'] = 'dummysessionvalue'
            session.save()
        else:
            # real environment
            if request.path_info == h.url_for(action='login'):
                return
            if not check_session(request, session, model.Session()):
                session.clear()
                session.save()
                return redirect_to(config['pylons.g'].loginurl)

    def login(self):
        session['sr_user_id'] = 1
        session['sr_session_id'] = 'abcde'
        session.save()
        s = model.Session()
        us = model.UserSession()
        us.session_user_id = 1
        us.id_sess = 'abcde'
        us.session_time_login = unix_time(datetime.now())
        us.session_time_expire = unix_time(datetime.now() + timedelta(seconds=300))
        us.session_ip_address = ipaddress(request)
        s.save(us)
        s.commit()
        return """<html><body><a href="/srutil/queue">queue</a></body></html>"""
    
    def index(self):
        return redirect_to(config['pylons.g'].loginurl)
    
    def logout(self):
        user_id = session.get('sr_user_id')
        if user_id == None: return
        user_id = int(user_id)
        s = model.Session()
        s.execute(model.session_tb.delete(model.session_tb.c.session_user_id == user_id))
        s.commit()
        return redirect_to(config['pylons.g'].loginurl)
            
    def queue(self):
        response.headers['content-type'] = 'text/plain'
        results = {}
        comp = request.params.get('comp')
        type_ = request.params.get('type')
        station_type = request.params.get('station_type')
        station_id = request.params.get('station_id')
        if station_id: 
            station_id = int(station_id)
        if(comp is None or type_ is None):
            results['Error'] = 'Invalid GET parameters'
            results['Description'] = 'Not enough parameter'
            return simplejson.dumps({'QueueResult':results})
        if comp == 'social':
            comp = model.Component.SocialId
        elif comp == 'finance':
            comp = model.Component.FinanceId
        elif comp == 'psyco':
            comp = model.Component.PsycoId
        elif comp == 'zone':
            comp = model.Component.ZoneId
        elif comp == 'ps':
            comp = model.Component.PsId
        elif comp == 'xray':
            comp = model.Component.XrayId
        else:
            results['Error'] = 'Invalid GET parameters'
            results['Description'] = 'Invalid component'
            return simplejson.dumps({'QueueResult':results})
        
        s = model.Session()
        queues = []
        cp = s.query(model.Component).filter_by(id=comp).first()
        if cp == None:
            results['Error'] = 'Invalid GET parameters:'
            results['Description'] = 'Comp with that id not found'
            return simplejson.dumps({'QueueResult':results})
        user_id = session['sr_user_id']
        results['UserID'] = user_id
        user = s.query(model.User).get(user_id)
        if type_ == "wait":
            if comp == model.Component.FinanceId:
                qs  = user.waitqueuefinance(station_type)
            else:
                qs  = user.waitqueue(comp)
        else:
            if comp == model.Component.FinanceId:
                qs  = user.donequeuefinance(station_type, station_id)
            else:
                qs  = user.donequeue(comp)
        for pq in qs:
            pa_id = pq.visit.id_patient
            appointment = model.NeuralAppointment.get_appointment(s, pq.visit.id_patient, comp)
            queues.append({
                'pa_id':pq.visit.id_patient,
                'name':stringornone(pq.visit.patient.pa_pre_name) + pq.visit.patient.pa_name + ' ' + pq.visit.patient.pa_lastname,
                'hn':pq.visit.patient.hn,
                'an':(pq.visit.an if pq.visit.an else ''),
                'appointed':True if appointment  else False,
                'appointment_date':appointment.appointment_date.strftime('%d/%m/%Y') if appointment else '',
                'appointed_to':appointment.appointto.fullname if appointment and appointment.appointto else '',
                'appointment_comment':appointment.comment if appointment and appointment.comment else '', 
                'oitype':('in' if pq.an else 'out'),
                'vn':pq.visit.vn,
                'vn_id':pq.vn_id,
                'q_id': pq.id,
                'com1id':pq.com1o.id,
                'com1':pq.com1o.com_name,
                'action_id': pq.action_id,
                'action': pq.action if pq.action else '',
                'transfer_to': pq.comto.com_name if type(pq) is model.DoneQueue else None,
                'transfer_time': pq.transfer_time.strftime('%H:%M') if type(pq) is model.DoneQueue else None,
                'queuetime':pq.time_send.strftime('%H:%M'),
                'com_id3':pq.com_id3 if type(pq) is model.PatientQueue and pq.com_id3 else '',
                'com3':pq.com3o.com_name if type(pq) is model.PatientQueue and pq.com3o else '',
                'action_id3':pq.action_id3 if type(pq) is model.PatientQueue and pq.action_id3 else '',
                'action3':pq.action3 if type(pq) is model.PatientQueue and pq.action3 else '',
                'id_station':model.Station.getStation(s, session['sr_client_ip']).id,
                'q4u_ip':model.Q4utoken.getQ4utoken(s).q4u_ip,
                'token':model.Q4utoken.getQ4utoken(s).token
            })
        results['Queue'] = queues
        return simplejson.dumps({'QueueResult':results})
    
    def test(self):
        vn = request.params.get('vn')
        if (vn is None):
            results['Error'] = 'Invalid GET parameters'
        else:            
            
            
            v = s.query(model.Visit).filter(model.visit_tb.c.vn == vn).first()
            pa = s.query(model.Patient).filter(model.patient_tb.c.id == v.patient.id).first()
            privilege = ''
            if v:
                privilege = v.privilege.name
            elif pa:
                privilege = pa.privilege.name if pa.privilege else ''
            address = None;            
            patient = {
                'id':stringornone(pa.id),
                'hn':stringornone(pa.hn),
                'name':stringornone(pa.pa_name) + ' ' + stringornone(pa.pa_lastname),
                'age':self.calculateAge(pa.pa_birthdate),
                'origin':stringornone(pa.pa_origin),
                'nationality':stringornone(pa.pa_nationality),
                'religion':stringornone(pa.pa_religion),
                'status':stringornone(pa.pa_status),
                'job':stringornone(pa.pa_job),
                'picture':stringornone(pa.pa_picture),
                'privilege': privilege
            }
            if (pa.addresses):
                address = pa.addresses[0]
                patient['address'] = stringornone(address.ad_ban) + u' หมู่บ้าน' + stringornone(address.ad_banname) + u' หมู่ที่ ' + stringornone(address.ad_moo) +\
                    u' ต.' + stringornone(address.ad_tambol) + u' อ.' + stringornone(address.ad_ampher) + u' จ.' + stringornone(address.ad_province)
            else:
                patient['address'] = stringornone(None);
            
            
        response.headers['content-type'] = 'text/plain'
        results['ImportantInfo'] = patient
        return simplejson.dumps({'ImportantInfoResult':results})
    
    def important_info(self):
        s = model.Session()
        results = {}
        pa_id = int(request.params.get('pa_id'))
        pa = s.query(model.Patient).get(pa_id)
        v = s.query(model.Visit).filter_by(id_patient=pa_id, closed=False).first()
        privilege = ''
        priv_id = -1
        if v and v.privilege:
            privilege = v.privilege.name
            priv_id = v.privilege.id
        elif pa:
            privilege = pa.privilege.name if pa.privilege else ''
            priv_id = pa.privilege.id if pa.privilege else ''
        address = None;            
        patient = {
            'id':stringornone(pa.id),
            'vn':stringornone(v.vn) if v else '',
            'vn_id':(v.id if v else -1),
            'an':stringornone(v.an if v else ''),
            'hn':stringornone(pa.hn),
            'name':stringornone(pa.pa_pre_name) + stringornone(pa.pa_name) + ' ' + stringornone(pa.pa_lastname),
            'age':self.calculateAge(pa.pa_birthdate),
            'origin':stringornone(pa.pa_origin),
            'nationality':stringornone(pa.pa_nationality),
            'education':stringornone(pa.education),
            'religion':stringornone(pa.pa_religion),
            'status':stringornone(pa.pa_status),
            'job':stringornone(pa.pa_job),
            'picture':stringornone(pa.pa_picture),
            'privilege': privilege,
            'privilege_id':priv_id,
            'allergic':pa.allergic if pa.allergic else ''  + ' ' + pa.allergic2 if pa.allergic2 else '',
            'congenital':pa.congenital if pa.congenital else '',
            'building': v.admit_main.building.building_name if v and v.admit_main else '',
            'queue':v.queue.com2o.com_name if v and v.queue else '',
            'risk':stringornone(pa.risk),
            'warning':stringornone(pa.warning)
        }
        patient['address'] = pa.addrpart if pa.addrpart else ''
        address = s.query(model.PatientAddress).filter_by(hn=pa.hn, ad_type_address='1').first()
        if (address):
            patient['address'] += u' ต.' + stringornone(address.ad_tambol) + u' อ.' + stringornone(address.ad_ampher) + u' จ.' + stringornone(address.ad_province)
        else:
            patient['address'] = stringornone(None);
            
            
        response.headers['content-type'] = 'text/plain'
        results['ImportantInfo'] = patient
        return simplejson.dumps({'ImportantInfoResult':results})
                
    def calculateAge(self, born):
        if not born:
            return ''
        today = datetime.today()
        year_diff  = today.year - born.year
        month_diff = today.month - born.month
        day_diff   = today.day - born.day
        if (day_diff < 0 or month_diff < 0):
            year_diff -= 1
        return year_diff
    
    def take_queue(self):
        """Call to take ownership of a queue.
        return result if taking is success or not
        params:q_id"""
        user_id = int(session['sr_user_id'])
        q_id = request.params.get('q_id', '')
        if(q_id == ''): return '{"Error":"no queue"}'
        s = model.Session()
        q = s.query(model.PatientQueue).get(int(q_id))
        if(q == None): return '{"Error":"invalid queue id"}'
        if(q.user2 == None):
            q.take_ownership(user_id)
            s.update(q)
            if try_commit(s):
                return simplejson.dumps({
                    'Success':{'q_id': q.id, 'name': q.visit.patient.name, 'time': q.time_receive.strftime('%H:%M:%S')}
                    })
            else:
                return '{"Error":"try again"}'
        elif(q.user2 == user_id):
            return simplejson.dumps({
                    'Success':{'q_id': q.id, 'name': q.visit.patient.name, 'time': q.time_receive.strftime('%H:%M:%S')}
                    })
        else:
            return '{"Error":"queue taken"}'
    
    def transfer(self):
        """Transfer a queue to another department and action"""
        user_id = int(session['sr_user_id'])
        s = model.Session()
        #action_id = int(request.params.get('action', ''))
        q_id = int(request.params.get('q_id', ''))
        comp1 = request.params.get('src', '')
        comid = request.params.get('comid')
        comid = int(comid) if comid else None
        actionid = request.params.get('action_id')
        actionid = int(actionid) if actionid else None
        oAction = s.query(model.NeuralAction).get(actionid) if actionid else None
        if not comid:
            comid = oAction.com_id if oAction else None
        actiontext = request.params.get("action")
        #if(action_id == '' or q_id == '' or comp1 == ''): return '{"Error": "no action/queue/source"}'
        if(comid== None or comid == '' or q_id == '' or comp1 == ''): return '{"Error": "no action/queue/source"}'
        station_id = request.params.get('station_id')
        if station_id: station_id = int(station_id)
        
        q = s.query(model.PatientQueue).get(int(q_id))
        if(comp1 == 'social'):
            comp1 = model.Component.SocialId
        elif(comp1 == 'finance'):
            comp1 = model.Component.FinanceId
        elif comp1 == 'psyco':
            comp1 = model.Component.PsycoId
        elif comp1 == 'ps':
            comp1 = model.Component.PsId
        elif comp1 == 'zone':
            comp1 = model.Component.ZoneId
        elif comp1 == 'xray':
            comp1 = model.Component.XrayId
        else:
            return '{"Error":"invalid source department"}'
        if(q == None): return '{"Error":"invalid queue id"}'
        if(q.user2 != user_id): return '{"Error":"not queue owner ' + q.user2 + ':' + user_id + '"}'
        
        #act = s.query(model.Module).get(action_id)
        #if(act == None): return '{"Error":"invalid action"}'
        user = s.query(model.User).get(user_id)
        if(user is None): return '{"Error":"invalid user"}'
        
        transfer_time = datetime.now()#.strftime('%H:%M:%S')
        qdone = model.DoneQueue()
        #qdone.copy(q, act.components[0].id, transfer_time)
        
        comto = s.query(model.Component).get(comid)
        qdone.copy(q, comto, oAction, transfer_time, station_id)        
        s.save_or_update(qdone)
        qlog = model.QueueLog()
        qlog.copy(q, comto, oAction, transfer_time)
        s.save_or_update(qlog)
        c1 = s.query(model.Component).get(comp1)
        c2 = s.query(model.Component).get(comid)
        q.user1 = user.id
        q.com_id1 = comp1
        q.com1 = c1.com_name
        q.action_id = actionid#act.id
        q.action = actiontext if actiontext else (oAction.name if oAction else None)
        q.time_send = transfer_time
        q.time_receive = None
        q.user2 = None
        q.com_id2 = comid#act.components[0].id
        q.com2 = c2.com_name
        
        s.update(q)
        try:
            s.commit()
            return simplejson.dumps({
                'Success':{'q_id': q.id, 'name': q.visit.patient.name, 'time': transfer_time.strftime('%H:%M:%S')}
                })
        except:
            s.rollback()
            return '{"Error":"please try again"}'
    
    def actions(self):
        """List of action not in this component"""
        s = model.Session()
        components = s.query(model.Component).options(eagerload("modules")).filter_by(com_status='1').all()
        results = []
        for comp in components:
            for m in comp.modules:
                results.append({'cname': comp.com_name, 'c_id': comp.id, 'mname':m.mod_title, 'm_id': m.id})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'Resuls': results})
    
    def get_allowed_actions(self):
        s = model.Session()
        comid = int(request.params.get('com_id'))
        actions = model.NeuralComponentAction.allowed_actions(s, comid)
        results = []
        for a in actions:
            results.append({'cname': a.com_name, 'cid': a.com_id, 'aname':a.action_name, 'aid': a.action_id})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)
    
    def get_permmod(self):
        s = model.Session()
        comid = int(request.params.get('comid'));
        modules = model.Module.sendmods(s, comid)
        results = []
        for mod in modules:
            results.append({'modid': mod.permmod_mod, 'modtitle': mod.module.mod_title})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)
        
    def get_actions(self):
        s = model.Session()
        comid = int(request.params.get('comid'));
        actions = model.NeuralAction.actions_by_com(s, comid)
        results = []
        for action in actions:
            results.append({'action_id': action.id, 'action_name': action.name})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)
    
    def lookups(self):
        response.headers['content-type'] = 'text/plain'
        cat_id = request.params.get('action', '')
        if(cat_id == ''): return '{"Results":[], "Error":"no group"}'
        s = model.Session()
        group = s.query(model.CompletionGroup).get(int(cat_id))
        if(group == None): return '{"Results":[], "Error":"invalid group"}'
        results = [{'name':cpl.name, 'id':cpl.id} for cpl in group.completions]
        return {'Results:': results}
    
    def get_provinces(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        provinces = []
        if query:
            provinces = s.query(model.Province).\
                filter(model.Province.pro_detail.like(query + '%')).limit(int(limit)).all()
        else:
            provinces = model.Province.all(s)
        results = []
        for p in provinces:
            results.append({'id': p.pro_id, 'code':p.pro_code, 'name': p.pro_detail})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'provinces':results}) 
    
    def get_educations(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        educations = []
        if query:
            educations = s.query(model.Education).\
                filter(model.Education.name.like(query + '%')).limit(int(limit)).all()
        else:
            educations = model.Education.all(s)
        results = []
        for e in educations:
            results.append({'id': e.id, 'name':e.name})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'educations':results})
    
    def get_occupations(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        occupations = []
        if query:
            occupations = s.query(model.Occupation).\
                filter(model.Occupation.name.like(query + '%')).limit(int(limit)).all()
        else:
            occupations = model.Occupation.all(s)
        results = []
        for o in occupations:
            results.append({'id': o.id, 'name':o.name})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'occupations':results}) 
    
    def get_marriage_status(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        status = []
        if query:
            status = s.query(model.MarriageStatus).filter_by(deleted=False).\
                filter(model.MarriageStatus.name.like(query + '%')).limit(int(limit)).all()
        else:
            status = model.MarriageStatus.all(s)
        results = []
        for o in status:
            results.append({'id': o.id, 'name':o.name})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'status':results})  
    
    def get_users(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        users = []
        if query:
            users = s.query(model.User).filter_by(status='1').\
                filter(func.lower(model.User.name).like(str(query.lower().encode('UTF-8')) + '%')).limit(int(limit)).all()
        else:
            users = model.User.all(s)
        
        results = []
        for p in users:
            results.append({'id': p.id, 'name': p._get_fullname()})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'users':results})
    
    def test(self):
        return model.NeuralRecord.unpaid_records_by_orders([1,2])
    