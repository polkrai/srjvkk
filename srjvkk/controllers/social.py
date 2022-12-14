# -*- encoding: utf-8 -*-

import logging

import simplejson

from srjvkk.lib.base import *

log = logging.getLogger(__name__)

import srutil
from datetime import datetime, timedelta
from sqlalchemy.sql import and_, or_, not_
from math import ceil

class SocialController(BaseController):

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
                action = request.environ.get('PATH_INFO').split('/')[-1]
                if action not in ['background']:
                    session.clear()
                    session.save()
                    return redirect_to(config['pylons.g'].loginurl)
                
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
        c.com_id = model.Component.SocialId
        return render('/social.html')
        
    def niti(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.pa_id = int(request.params.get("pa_id"))

        problems = s.query(model.SocialProblem).all()
        results = []
        for p in problems:
            results.append({'id': p.id, 'description': p.description, 'code':p.code})
        c.problems = results

        helps = s.query(model.HelpMethod).all()        
        results = []
        for h in helps:
            results.append({'id': h.id, 'description': h.description, 'code':h.code})
        c.helps = results
        c.niti = model.PatientNiti()
        c.qcalled = request.params.get("qcalled")
        return render('/niti.html')
       
    def support(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.cur_pa_id = int(request.params.get("pa_id"))
        c.cur_vn_id = int(request.params.get("vn_id"))
        #visit = s.query(model.Visit).get(c.cur_vn_id)
        #c.cur_pa_id = visit.patient.id if visit else -1
        c.support = model.SocialSupport()
        c.qcalled = request.params.get("qcalled")
        return render('/social/support.html')
        
    def get_support(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        pa_id = int(request.params.get("pa_id"));
        supports = s.query(model.SocialSupport).filter_by(patient_id=pa_id, 
                deleted=False).order_by(model.SocialSupport.created_date).all()
        arr_supports = []
        no = 1
        for support in supports:
            arr_supports.append({
                'id':support.id,
                'no':no,
                'date':(support.request_date.strftime('%d/%m/%Y')),
                'support_amount':float(support.support_amount),
                'canpay_amount':float(support.canpay_amount),
                'totalprice':float(support.totalprice),
                'deposit':float(support.deposit),
                #'domicile':(support.domicile),
                #'education':(support.education),
                #'marriage_status':(support.marriage_status),
                #'job':(support.job),
                #'income':float(support.income),
                'request_person':(support.request_person),
                'request_relation':(support.request_relation),
                #'history_family':(support.history_family),
                #'family_relationship':(support.family_relationship),
                'request_reason':(support.request_reason),
                'support_reason':(support.support_reason),
                'receipt_no':support.receipt.code if support.receipt else ''
            })
            no += 1
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'supports':arr_supports})

    def get_support_d(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        support_id = int(request.params.get("support_id"));
        supportItems = s.query(model.SocialSupportItem).filter_by(support_id=support_id).all()
        arr_items = []
        for sItem in supportItems:
            arr_items.append({
                'id':sItem.id,
                'totalprice':float(sItem.total_price),
                'item':sItem.group.name,
                'group_id':sItem.group_id,
                'subsidy_amount':float(sItem.subsidy_amount),
                'support_amount':float(sItem.support_amount)
                
            })
        #support = s.query(model.SocialSupport).get(support_id)
        #arr_items = []
        #if support and support.receipt:            
        #    for rd in support.receipt.receiptds:
        #        arr_items.append({
        #            'id':rd.record.id,
        #            'unit_id':rd.record.order_item.item.unit_id,
        #            'unit':rd.record.order_item.item.unit.name,
        #            'item_id':rd.record.order_item.item_id,
        #            'totalprice':float(rd.record.price*rd.record.qty),
        #            'item':rd.record.order_item.item.name,
        #            'qty':float(rd.record.qty),
        #            'price':float(rd.record.price)
        #        })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'supports':arr_items})
    
    def get_unpaid_records(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        pa_id = int(request.params.get("pa_id"));
        patient = s.query(model.Patient).get(pa_id)
        visit = s.query(model.Visit).filter_by(id_patient=pa_id, closed=False).first()
        privilege = None
        if visit:
            privilege = visit.privilege
        elif patient:
            privilege = patient.privilege
        arr_items = []
        unpaidRecords = model.NeuralRecord.unpaid_records(pa_id) 
        item_names = []  
        for uRec in unpaidRecords:
            subsidy_amount = privilege.subsidy_amount(s, uRec.item_id,\
                                uRec.qty, uRec.price, uRec.frequency, \
                                uRec.pertime)
            if item_names.__contains__(uRec.group_name):
                index = item_names.index(uRec.group_name)
                arr_items[index]['totalprice'] += ceil(float(uRec.qty * uRec.price)) 
                arr_items[index]['subsidy_amount'] += float(subsidy_amount)
            else:
                item_names.append(uRec.group_name)
                arr_items.append({
                    #'id':uRec.id,
                    #'unit_id':uRec.unit_id,
                    #'unit':uRec.unit_name,
                    #'item_id':uRec.item_id,
                    'id':-1,
                    'totalprice':ceil(float(uRec.qty * uRec.price)),
                    'item':uRec.group_name,
                    'group_id':uRec.group_id,
                    'subsidy_amount':float(subsidy_amount),
                    'support_amount':0
                    #'qty':float(uRec.qty),
                    #'price':float(uRec.price)
                })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'supports':arr_items})
    
    def get_social_patient_info(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        pa_id = int(request.params.get("pa_id"));
        rsInfo = s.query(model.SocialPatientInfo).filter_by(\
                        patient_id=pa_id, deleted=False).first()
        patient = s.query(model.Patient).get(pa_id)
        info = {
            'id':rsInfo.id if rsInfo else -1,
            'province_id':rsInfo.province.pro_id if rsInfo and rsInfo.province else '',
            'province':rsInfo.province.pro_detail if rsInfo and rsInfo.province else '',
            #'domicile':(rsInfo.domicile) if rsInfo else '',
            'education_id':rsInfo.education.id if rsInfo and rsInfo.education else '',
            'education':rsInfo.education.name if rsInfo and rsInfo.education else '',
            
            'occupation_id':rsInfo.occupation.id if rsInfo and rsInfo.occupation else '',
            'occupation':rsInfo.occupation.name if rsInfo and rsInfo.occupation else '',
            
            'status_id':rsInfo.status.id if rsInfo and rsInfo.status else '',
            'status':rsInfo.status.name if rsInfo and rsInfo.status else '',
            
            'income':float(rsInfo.income) if rsInfo else 0,
            'history_family':(rsInfo.history_family) if rsInfo else '',
            'family_relationship':(rsInfo.family_relationship) if rsInfo else '',
            'current_deposit':patient.deposit if patient else 0
        }
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(info)
    
    def delete_support(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        support_id = simplejson.loads(request.params.get('support_id')) 
        sup = s.query(model.SocialSupport).get(support_id)
        sup.deleted = True
        sup.deleted_by = user_id
        sup.deleted_date = datetime.now()
        s.save_or_update(sup)
        if try_commit(s):
            return str(True)
        else:
            return str(False)
    
    def save_support(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        patient_id = int(request.params.get('cur_pa_id', '-1'))
        vn_id = int(request.params.get('cur_vn_id', '-1'))
        #request_no = int(request.params.get('request_no'))
        request_date = datetime.now()
        province_id = request.params.get('province-id')
        province_id = int(province_id) if province_id else None
        education_id = request.params.get('education-id')
        education_id = int(education_id) if education_id else None
        occupation_id = request.params.get('occupation-id')
        occupation_id = int(occupation_id) if occupation_id else None
        status_id = request.params.get('status-id')
        status_id = int(status_id) if status_id else None
        request_reason = request.params.get('request_reason')
        support_reason = request.params.get('support_reason')
        income = float(request.params.get('income').replace(',', ''))
        request_person = request.params.get('request_person')
        request_relation = request.params.get('request_relation')
        history_family = request.params.get('history_family')
        family_relationship = request.params.get('family_relationship')
        support_amount = float(request.params.get('support_amount'))
        canpay_amount = float(request.params.get('canpay_amount'))
        totalprice = float(request.params.get('totalprice'))
        deposit = float(request.params.get('deposit'))
        
        patientInfo = s.query(model.SocialPatientInfo).filter_by(patient_id=patient_id).first()
        if patientInfo == None:
            patientInfo = model.SocialPatientInfo()
            patientInfo.created_by = user_id
            patientInfo.created_date = datetime.now()
        else:
            patientInfo.updated_by = user_id
            patientInfo.updated_date = datetime.now()
        
        patientInfo.patient_id = patient_id
        patientInfo.province_id = province_id
        patientInfo.education_id = education_id
        patientInfo.occupation_id = occupation_id
        patientInfo.marriage_status_id = status_id
        patientInfo.income = income
        patientInfo.history_family = history_family
        patientInfo.family_relationship = family_relationship
        s.save_or_update(patientInfo)
        
        support = model.SocialSupport()
        support.patient_id = patient_id
        support.vn_id = vn_id
        #support.request_no = request_no
        support.request_date = request_date
        support.request_reason = request_reason
        support.support_reason = support_reason
        support.request_person = request_person
        support.request_relation = request_relation
        support.support_amount = support_amount
        support.canpay_amount = canpay_amount
        support.totalprice = totalprice
        support.deposit = deposit
        
        support.created_by = c.user.id
        support.created_date = datetime.now()
        support.deleted = False
        s.save_or_update(support)
        
        supportItems = simplejson.loads(request.params.get('support_items'))
        for item in supportItems:
            sItem = model.SocialSupportItem()
            sItem.support = support
            sItem.group_id = item['group_id']
            sItem.total_price = float(item['totalprice'])
            sItem.subsidy_amount = float(item['subsidy_amount'])
            sItem.support_amount = float(item['support_amount'])
            s.save_or_update(sItem)
        
        s.commit()
        return ''
    
    def background(self):
        
        s = model.Session()
        c.bg_pa_id = int(request.params.get("pa_id"))
        if c.bg_pa_id == None:
            c.bg_pa_id = -1
        c.qcalled = request.params.get("qcalled")
        user_id = session.get("sr_user_id")
        c.user = s.query(model.User).get(user_id) if user_id else None
        
        patient = s.query(model.Patient).filter(model.patient_tb.c.id == c.bg_pa_id).first()
        if patient:
            if patient.background:        
                pb = patient.background
            else:
                pb = model.PatientBackground()
                pb.patient = patient
                patient.background = pb
            c.pt_bg = pb;  
        if (not c.pt_bg):
            c.pt_bg = model.PatientBackground()
        #id_sess = session['sr_session_id']
        id_sess = request.params.get('id_sess', '')
        usersess = s.query(model.UserSession).filter_by(id_sess=id_sess).first()
        c.bg_editable = False
        if usersess:
            c.bg_editable = usersess.editable_page(s, model.Component.SocialId)
        if session.get('sr_session_id') == '__dummy__':
            c.bg_editable = True
        return render('/background.html')
    
    def get_problems(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        problems = []
        if query:
            problems = s.query(model.SocialProblem).filter_by(deleted=False).\
                filter(model.SocialProblem.code.like(query + '%')).limit(int(limit)).all()
        else:
            problems = model.SocialProblem.all(s)
        results = []
        for p in problems:
            results.append({'id': p.id, 'code':p.code, 'description': p.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'problems':results})
    
    def get_helps(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        helps = []
        if query:
            helps = s.query(model.HelpMethod).filter_by(deleted=False).\
                filter(model.HelpMethod.code.like(query + '%')).limit(int(limit)).all()
        else:
            helps = model.HelpMethod.all(s)
        results = []
        for h in helps:
            results.append({'id': h.id, 'code':h.code, 'description': h.description})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'helps':results})
        
    def get_health_stations(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        if query:
            stations = s.query(model.HealthStation).filter_by(deleted=False).\
                filter(model.HealthStation.name.like(query + '%')).limit(int(limit)).all()
        else:
            stations = model.HealthStation.all(s)
        arr_stations = []
        for station in stations:
            arr_stations.append({
                'id':station.id,
                'code':station.code,
                'name':station.name
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'stations':arr_stations})
    
    def get_niti_problems(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        niti_id = int(request.params.get("niti_id"));
        all_problems = s.query(model.NitiProblem).filter_by(niti_id=niti_id, deleted=False).all()
        arr_problems = []
        for problem in all_problems:
            arr_problems.append({
                'id':problem.id,
                'niti_id':problem.niti_id,
                'problem_id':problem.problem_id,
                'code':problem.problem.code,
                'description':problem.problem.description,
                'more_problem_info':problem.more_problem_info
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'problems':arr_problems})
        
    def get_niti_helps(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        niti_id = int(request.params.get("niti_id"));
        all_helps = s.query(model.NitiHelp).filter_by(niti_id=niti_id, deleted=False).all()
        arr_helps = []
        for help in all_helps:
            arr_helps.append({
                'id':help.id,
                'niti_id':help.niti_id,
                'help_id':help.help_id,
                'code':help.help.code if help.help else '',
                'description':help.help.description if help.help else '',
                'more_help_info':help.more_help_info
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'helps':arr_helps})
        
    def get_bg_problems(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        bg_id = int(request.params.get("bg_id"));
        all_bg_problems = s.query(model.BackgroundProblem).filter_by(background_id=bg_id, deleted=False).all()
        arr_bg_problems = []
        for bg_problem in all_bg_problems:
            arr_bg_problems.append({
                'id':bg_problem.id,
                'background_id':bg_problem.background_id,
                'problem_id':bg_problem.problem_id,
                'code':bg_problem.problem.code,
                'description':bg_problem.problem.description,
                'more_problem_info':bg_problem.more_problem_info
            })
        '''
        if len(arr_bg_problems) == 0:
            arr_bg_problems.append({
                'id':'',
                'background_id':'',
                'problem_id':'',
                'description':''
            })
        '''    
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'bg_problems':arr_bg_problems})
    
    def get_bg_helps(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        bg_id = int(request.params.get("bg_id"))
        all_bg_helps = s.query(model.BackgroundHelp).filter_by(background_id=bg_id, deleted=False).all()
        arr_bg_helps = []
        for bg_help in all_bg_helps:
            arr_bg_helps.append({
                'id':bg_help.id,
                'background_id':bg_help.background_id,
                'help_id':bg_help.help_id,
                'code':bg_help.help.code if bg_help.help else '',
                'description':bg_help.help.description if bg_help.help else '',
                'more_help_info':bg_help.more_help_info
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'bg_helps':arr_bg_helps})
    
    def get_nitis(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        pa_id = int(request.params.get("pa_id"))
        all_nitis = s.query(model.PatientNiti).filter_by(patient_id=pa_id, deleted=False).all()
        arr_nitis = []
        for niti in all_nitis:
            arr_nitis.append({
                'crime': niti.crime,
                'commit_date': niti.commit_date.strftime('%d/%m/%Y'),
                'surrender_date': niti.surrender_date.strftime('%d/%m/%Y'),
                'hospital_date': niti.hospital_date.strftime('%d/%m/%Y'),
                'patient_id': pa_id,
                'id': niti.id,
                'hospital_reason':niti.hospital_reason,
                'personality':niti.personality,
                'history_physical':niti.history_physical,
                'history_mental':niti.history_mental,
                'history_crime':niti.history_crime,
                'drug_usage':niti.drug_usage,
                'history_accident':niti.history_accident,
                'sex_experience':niti.sex_experience,
                'heredity':niti.heredity,
                'history_family':niti.history_family,
                'social_analysis_text':niti.social_analysis_text,
                'admit_date': niti.admit_date.strftime('%d/%m/%Y'),
                'info_provider': niti.info_provider,
                'personality_from_family': niti.personality_from_family
            })
        
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'nitis':arr_nitis})
    
    def save_niti(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        patient_id = int(request.params.get('pa_id', ''))
        crime = request.params.get('crime')
        hospital_reason = request.params.get('hospital_reason','')
        history_crime = request.params.get('history_crime','')
        history_physical = request.params.get('history_physical','')
        history_mental = request.params.get('history_mental','')
        history_accident = request.params.get('history_accident','')
        sex_experience = request.params.get('sex_experience','')
        personality = request.params.get('personality','')
        heredity = request.params.get('heredity','')
        drug_usage = request.params.get('drug_usage','')
        history_family = request.params.get('history_family','')
        social_analysis_text = request.params.get('social_analysis_text','')
        commit_date = model.DateUtil.parseDate(request.params.get('commit_date'), True)
        surrender_date = model.DateUtil.parseDate(request.params.get('surrender_date'), True)
        hospital_date = model.DateUtil.parseDate(request.params.get('hospital_date'), True)
        admit_date = model.DateUtil.parseDate(request.params.get('admit_date'), True)
        personality_from_family = request.params.get('personality_from_family', '')
        info_provider = request.params.get('info_provider')

        delNitis = simplejson.loads(request.params.get('del-nitis'))
        for niti in delNitis:
            oNiti = s.query(model.PatientNiti).get(int(niti['id']))
            oNiti.deleted = True
            oNiti.deleted_by = user_id
            s.save_or_update(oNiti)
        niti_id = int(request.params.get('niti_id'))
        niti = s.query(model.PatientNiti).filter(model.niti_tb.c.id==niti_id).first()
        #patient = s.query(model.Patient).filter(model.patient_tb.c.id == patient_id).first()
        if niti == None:        
            niti = model.PatientNiti()
            niti.created_by = user_id
            niti.created_date = datetime.now()
            niti.patient_id = patient_id
        else:
            niti.updated_by = user_id
            niti.updated_date = datetime.now()
        niti.crime = crime
        niti.commit_date = commit_date
        niti.surrender_date = surrender_date
        niti.hospital_date = hospital_date
        niti.hospital_reason = hospital_reason
        niti.history_crime = history_crime
        niti.history_physical = history_physical
        niti.history_mental = history_mental
        niti.history_accident = history_accident
        niti.sex_experience = sex_experience
        niti.personality = personality
        niti.heredity = heredity
        niti.drug_usage = drug_usage
        niti.history_family = history_family
        niti.social_analysis_text = social_analysis_text
        niti.info_provider = info_provider
        niti.admit_date = admit_date
        niti.personality_from_family = personality_from_family
        
        s.save_or_update(niti)
        
        del_problems = simplejson.loads(request.params.get('del_problems')) 
        for problem in del_problems:
            prb = s.query(model.NitiProblem).get(problem['id'])
            prb.deleted = True
            prb.deleted_by = user_id
            prb.deleted_date = datetime.now()
            s.save_or_update(prb)
        
        problems = simplejson.loads(request.params.get('problems'))
        for problem in problems:
            np = None
            if problem['id'] == -1:
                np = model.NitiProblem()
                np.created_by = user_id
                np.created_date = datetime.now()
            else:
                np = s.query(model.NitiProblem).get(int(problem['id']))
                np.updated_by = user_id
                np.updated_date = datetime.now()
            np.niti = niti;
            np.problem_id = int(problem['problem_id']);
            np.more_problem_info = problem['more_problem_info']
            
            s.save_or_update(np)
            
        del_helps = simplejson.loads(request.params.get('del_helps'))
        for help in del_helps:
            hlp = s.query(model.NitiHelp).get(help['id'])
            hlp.deleted = True
            hlp.deleted_by = user_id
            hlp.deleted_date = datetime.now()
            s.save_or_update(hlp)
        
        helps = simplejson.loads(request.params.get('helps'))
        for help in helps:
            np = None
            if help['id'] == -1:
                np = model.NitiHelp()
                np.created_by = user_id
                np.created_date = datetime.now()
            else:
                np = s.query(model.NitiHelp).get(int(help['id']))
                np.updated_by = user_id
                np.updated_date = datetime.now()
            np.niti = niti;
            np.help_id = int(help['help_id']);
            np.more_help_info = help['more_help_info']
            s.save_or_update(np)
            
        s.commit()
        c.niti = niti;        
        return 'SUCCESS'
    
    def load_background(self):
        patient_id = int(request.params.get('pa_id', '-1'));
        s = model.Session()      
        patient = s.query(model.Patient).filter(model.patient_tb.c.id == patient_id).first()
        if patient == None:
            patient = model.Patient()
        if patient.background:        
            pb = patient.background
        else:
            pb = model.PatientBackground()
            pb.patient = patient
            patient.background = pb        
        
        user = None
        created_date = None
        if pb.updated_by:
            user = s.query(model.User).get(pb.updated_by)
            created_date = pb.updated_date
        elif pb.created_by:
            user = s.query(model.User).get(pb.created_by)
            created_date = pb.created_date
            
        created_by = srutil.stringornone(user.title) + ' ' + \
            srutil.stringornone(user.name) + ' ' + srutil.stringornone(user.lastname) \
            if user else ''
        position = user.group.name if user and user.group else ''
        created_date = model.DateUtil.toShortFormatDate(created_date) if created_date else ''
        background = {
            'background_id':pb.id if pb.id else -1,
            'info_provider':srutil.stringornone(pb.info_provider),
            'provider_relation':srutil.stringornone(pb.provider_relation),
            'important_symptom':srutil.stringornone(pb.important_symptom),
            'period':srutil.stringornone(pb.period),
            #'health_station_id': pb.health_station_id,
            'health_station':srutil.stringornone(pb.health_station) if pb.health_station else '',
            'history_physical':srutil.stringornone(pb.history_physical),
            'history_mental':srutil.stringornone(pb.history_mental),
            'history_accident':srutil.stringornone(pb.history_accident),
            'history_med_alergy':srutil.stringornone(pb.history_med_alergy),
            'personality':srutil.stringornone(pb.personality),
            'heredity':srutil.stringornone(pb.heredity),
            'drug_usage':srutil.stringornone(pb.drug_usage),
            'history_family':srutil.stringornone(pb.history_family),
            'social_analysis_text':srutil.stringornone(pb.social_analysis_text),
            'created_by':created_by,
            'position':position,
            'created_date':created_date
        }
        return simplejson.dumps(background)
        
    def save_background(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        patient_id = int(request.params.get('pa_id', ''))
        info_provider = request.params.get('info_provider','')
        provider_relation = request.params.get('provider_relation','')
        important_symptom = request.params.get('important_symptom','')
        period = request.params.get('period','')
        #health_station_id = request.params.get('health_station_id')
        #health_station_id = None if health_station_id == "" else int(health_station_id)
        health_station = request.params.get('inpHs')
        history_physical = request.params.get('history_physical','')
        history_mental = request.params.get('history_mental','')
        history_accident = request.params.get('history_accident','')
        history_med_alergy = request.params.get('history_med_alergy','')
        personality = request.params.get('personality','')
        heredity = request.params.get('heredity','')
        drug_usage = request.params.get('drug_usage','')
        history_family = request.params.get('history_family','')
        social_analysis_text = request.params.get('social_analysis_text','')  
        rdo_physical = request.params.get('rdo-physical')
        rdo_heredity = request.params.get('rdo-heredity')
        rdo_drug = request.params.get('rdo-drug') 
        patient = s.query(model.Patient).filter(model.patient_tb.c.id == patient_id).first()
        if patient.background:        
            pb = patient.background
            pb.updated_by = user_id
            pb.updated_date = datetime.now()
        else:
            pb = model.PatientBackground()
            pb.created_by = user_id
            pb.created_date = datetime.now()
            pb.patient = patient
            patient.background = pb
        pb.info_provider = info_provider
        pb.provider_relation = provider_relation
        pb.important_symptom = important_symptom
        pb.period = period;
        #pb.health_station_id = health_station_id
        pb.health_station = health_station
        pb.history_physical = history_physical if  rdo_physical == 'true' else None
        pb.history_mental = history_mental
        pb.history_accident = history_accident
        pb.history_med_alergy = history_med_alergy
        pb.personality = personality
        pb.heredity = heredity if rdo_heredity == 'true' else None
        pb.drug_usage = drug_usage if rdo_drug == 'true' else None
        pb.history_family = history_family
        pb.social_analysis_text = social_analysis_text
        
        s.save_or_update(pb)
        if history_med_alergy != '':
            patient.allergic2 += (history_med_alergy + u"(ซักประวัติ)")
            s.save_or_update(patient)
        
        del_problems = simplejson.loads(request.params.get('del_bg_problems')) 
        for problem in del_problems:
            prb = s.query(model.BackgroundProblem).get(problem['id'])
            prb.deleted = True
            prb.deleted_by = user_id
            prb.deleted_date = datetime.now()
            s.save_or_update(prb)
        
        bg_problems = simplejson.loads(request.params.get('bg_problems'))
        for problem in bg_problems:
            np = None
            if problem['id'] == -1:
                np = model.BackgroundProblem()
                np.created_by = user_id
                np.created_date = datetime.now()
            else:
                np = s.query(model.BackgroundProblem).get(int(problem['id']))
                np.updated_by = user_id
                np.updated_date = datetime.now()
            np.background = pb;
            np.problem_id = int(problem['problem_id']);
            np.more_problem_info = problem['more_problem_info']
            s.save_or_update(np)
            
        del_helps = simplejson.loads(request.params.get('del_bg_helps'))
        for help in del_helps:
            hlp = s.query(model.BackgroundHelp).get(help['id'])
            hlp.deleted = True
            hlp.deleted_by = user_id
            hlp.deleted_date = datetime.now()
            s.save_or_update(hlp)
        
        bg_helps = simplejson.loads(request.params.get('bg_helps'))
        for help in bg_helps:
            np = None
            if help['id'] == -1:
                np = model.BackgroundHelp()
                np.created_by = user_id
                np.created_date = datetime.now()
            else:
                np = s.query(model.BackgroundHelp).get(int(help['id']))
                np.updated_by = user_id
                np.updated_date = datetime.now()
            np.background = pb;
            np.help_id = int(help['help_id']);
            np.more_help_info = help['more_help_info']

            s.save_or_update(np)
            
        s.commit()
        c.pt_bg = pb;        
        return 'SUCCESS'
    
    def setup_problem(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        return render('/social/setupproblem.html') 
    
    def save_problem(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        problems = simplejson.loads(request.params.get('problems'))
        delProblems = simplejson.loads(request.params.get('del-problems'))
        for problem in problems:
            oProblem = model.SocialProblem()
            if problem['id'] == -1:
                oProblem.deleted = False
                oProblem.created_by = c.user.id
                oProblem.created_date = datetime.now()
            else:
                oProblem = s.query(model.SocialProblem).get(int(problem['id']))
                oProblem.updated_by = c.user.id
                oProblem.updated_date = datetime.now()
            oProblem.code = problem['code']
            oProblem.description = problem['description']
            s.save_or_update(oProblem)
        
        for problem in delProblems:
            oProblem = s.query(model.SocialProblem).get(int(problem['id']))
            oProblem.deleted = True
            oProblem.deleted_by = c.user.id
            s.save_or_update(oProblem)
        s.commit()
        
    def setup_help(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        return render('/social/setuphelp.html') 
    
    def save_help(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        helps = simplejson.loads(request.params.get('helps'))
        delHelps = simplejson.loads(request.params.get('del-helps'))
        for help in helps:
            oHelp = model.HelpMethod()
            if help['id'] == -1:
                oHelp.deleted = False
                oHelp.created_by = c.user.id
                oHelp.created_date = datetime.now()
            else:
                oHelp = s.query(model.HelpMethod).get(int(help['id']))
                oHelp.updated_by = c.user.id
                oHelp.updated_date = datetime.now()
            oHelp.code = help['code']
            oHelp.description = help['description']
            s.save_or_update(oHelp)
        
        for help in delHelps:
            oHelp = s.query(model.HelpMethod).get(int(help['id']))
            oHelp.deleted = True
            oHelp.deleted_by = c.user.id
            s.save_or_update(oHelp)
        s.commit()
        
    def setup_health_station(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        return render('/social/setuphealthstation.html') 
    
    def save_health_station(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        stations = simplejson.loads(request.params.get('stations'))
        delStations = simplejson.loads(request.params.get('del-stations'))
        for station in stations:
            oStation = model.HealthStation()
            if station['id'] == -1:
                oStation.deleted = False
                oStation.created_by = c.user.id
                oStation.created_date = datetime.now()
            else:
                oStation = s.query(model.HealthStation).get(int(station['id']))
                oStation.updated_by = c.user.id
                oStation.updated_date = datetime.now()
            oStation.code = station['code']
            oStation.name = station['name']
            s.save_or_update(oStation)
        
        for station in delStations:
            oStation = s.query(model.HealthStation).get(int(station['id']))
            oStation.deleted = True
            oStation.deleted_by = c.user.id
            s.save_or_update(oStation)
        s.commit()
        
    def setup_main(self):
        return render('/social/setupmain.html')
    
    def background_exist(self):
        pa_id = int(request.params.get("pa_id"))
        s = model.Session()
        bg = s.query(model.PatientBackground).filter_by(patient_id=pa_id).first()
        return "1" if bg else "0"
        