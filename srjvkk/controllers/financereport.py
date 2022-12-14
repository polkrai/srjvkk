# -*- encoding: utf-8 -*-
import logging

import simplejson

from srjvkk.lib.base import *
from sqlalchemy.sql import and_, or_, not_, select, func, join, between

log = logging.getLogger(__name__)

import srutil

import string

class FinancereportController(BaseController):

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
        return render('/finance/report/reportmain.html')

    def print_send_money(self):
        send_id = int(request.params.get('send_id'))
        s = model.Session()
        c.send_money = s.query(model.SendMoney).get(send_id)
        c.send_month = model.DateUtil.getMonth(c.send_money.send_date)        
        c.send_by = s.query(model.User).get(c.send_money.created_by)
        c.send_items = c.send_money.send_items
        c.extra_items = []
        if c.send_money.deposit > 0:
            c.extra_items.append({
                'item':u'* หักค่ามัดจำการรักษา',
                'amount':c.send_money.deposit
            })
        if c.send_money.discount > 0:
            c.extra_items.append({
                'item':u'* หักส่วนลด',
                'amount':c.send_money.discount
            })
            
        c.send_str = ThaiNum.sayMoney(c.send_money.send_amount)
        return render('/finance/report/sendmoney.html')
    
    def receipt_page(self):
        s = model.Session()
        c.stations = model.Station.all(s)
        return render('/finance/report/historyreceipts.html')
    
    def get_receipts(self):
        station_id = int(request.params.get('station_id'))
        cancelled = request.params.get('cancelled')
        if cancelled == 'true':
            cancelled = True
        elif cancelled == 'false':
            cancelled = False
        else:
            cancelled = None
                    
        start_date = model.DateUtil.parseDate(request.params.get('start_date'), True)
        end_date = model.DateUtil.parseDate(request.params.get('end_date'), True)
        start_date = model.DateUtil.startOfTheDay(start_date)
        end_date = model.DateUtil.endOfTheDay(end_date)
        
        s = model.Session()
        receipts = model.ReceiptH.getReceipts(start_date, end_date, cancelled, station_id)
        results = []
        count = 1;
        for r in receipts:
            user = s.query(model.User).get(r.cancelled_by) if r.cancelled_by else None
            results.append({
                'id':r.id,
                'no':count,
                'code':r.code,
                'date':model.DateUtil.toShortFormatDate(r.receipt_date),
                'receive_amount':float(r.receive_amount),
                'support_amount':float(r.support_amount),
                'subsidy_amount':float(r.subsidy_amount),
                'discount':float(r.discount),
                'deposit':float(r.deposit),
                'hn':r.visit.hn,
                'an':r.visit.an if r.visit.an else '',
                'patient_type':'ผู้ป่วยใน' if r.visit.an else 'ผู้ป่วยนอก',
                'privilege':r.visit.privilege.name,
                'printno':r.printno,
                'sent':r.sent,
                'cancelled':r.cancelled,
                'cancelled_date':model.DateUtil.toShortFormatDate(r.cancelled_date) if r.cancelled_date else '',
                'cancelled_by':user.fullname if user else '',
                'cancel_reason':r.cancel_reason if r.cancel_reason else ''
            })
            count += 1
        
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'receipts':results})
    
    def print_receipts(self):
        c.station = request.params.get('station')
        c.start_date = request.params.get('start_date')
        c.end_date = request.params.get('end_date')
        c.total = float(request.params.get('total'))
        c.receipts = simplejson.loads(request.params.get('receipts'))
        c.total_str = ThaiNum.sayMoney(c.total)
        user_id = session.get('sr_user_id')
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        return render('/finance/report/printreceipts.html')
    
    def bill_page(self):
        s = model.Session()
        c.privileges = model.Privilege.all(s)
        c.provinces = model.Province.all(s)
        return render('/finance/report/billbyprivilege.html')
    
    def print_bill(self):
        c.privilege = request.params.get('privilege')
        c.province_code = request.params.get('province_code')
        c.colspan = 15
        if c.province_code == 'all':
            c.colspan = 16
        c.province = request.params.get('province')
        c.start_date = request.params.get('start_date')
        c.end_date = request.params.get('end_date')
        c.total = float(request.params.get('total'))
        c.bills = simplejson.loads(request.params.get('bills'))
        c.total_str = ThaiNum.sayMoney(c.total)
        c.type = request.params.get('type')
        c.patient_type = request.params.get('patient_type')
        user_id = session.get('sr_user_id')
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        if c.type == 'excel':
            response.headers['content-type'] = 'application/octet-stream'
            response.headers['Content-Disposition'] = 'attachment;filename=bills.xls'    
        return render('/finance/report/printbill.html')
    
    def bill_by_privilege(self):
        s = model.Session()
        privilege_id = int(request.params.get('privilege_id'))
        province_code = request.params.get('province_code')
        start_date = model.DateUtil.parseDate(request.params.get('start_date'), True)
        end_date = model.DateUtil.parseDate(request.params.get('end_date'), True)
        start_date = model.DateUtil.startOfTheDay(start_date)
        end_date = model.DateUtil.endOfTheDay(end_date)
        patient_type = request.params.get('patient_type')
        
        visits = model.Visit.visit_to_bill_super(privilege_id, province_code, start_date, end_date, patient_type)
        bills = []
        count = 1
        total = 0
        for visit in visits:
            bills.append({
                'vn_id': visit.id,
                'no':count,
                'visit_date':model.DateUtil.toShortFormatDate(visit.time_add),
				'visit_time':visit.time_add.strftime("%H:%M"),
				'vn':visit.vn,
				'hn':visit.hn,
                'name':stringornone(visit.pa_pre_name) + visit.pa_name + ' ' + visit.pa_lastname,
                'province':stringornone(visit.ad_province),
                'hospital':stringornone(visit.refer_hosp),
                'prcardid':stringornone(visit.prcard_id),
                'refer_no':stringornone(visit.refer_no),
				'refer_hosp_code':stringornone(visit.refer_hosp_code),
				'number_licensed':stringornone(visit.number_licensed),
                'personalid':stringornone(visit.pa_people_number),
                'sex':u'ช' if visit.pa_sex == '1' else u'ญ',
                'age':model.DateUtil.calculateAge(visit.pa_birthdate),
                'icd10':visit.icd10,
                'med':float(visit.med),
                'lab':float(visit.lab),
                'eeg':float(visit.eeg),
                'other':float(visit.other),
                'subtotal': float(visit.med + visit.lab + visit.eeg + visit.other)
            })
            count += 1
            
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'bill': {'total':total, 'details':bills}})
    
    def ipdsummary_page(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.pa_id = int(request.params.get('pa_id'))
        visit = s.query(model.Visit).filter_by(id_patient=c.pa_id, time_toclose=None).first()
        c.vn_id = visit.id if visit else -1
        return render('/finance/report/ipdsummary.html')

    def admit_history(self):
        results = {}
        history = []
        pa_id = int(request.params.get('pa_id'))
        s = model.Session()
        patient = s.query(model.Patient).get(pa_id)
        if patient:
            for m in patient.ipd_mains:
                history.append({
                    'vn_id':m.visit.id,
                    'an':m.an,
                    'building':m.ipdbuilding.building_name,
                    'admit_date':m.admit_date.strftime('%d/%m/%Y'),
                    'discharge_date':m.dc_date.strftime('%d/%m/%Y') if m.dc_date else '',
                    'privilege':m.visit.privilege.name,
                    'dc_status':'',
                    'dc_type':'',
                    'doctor':m.visit.doctor.fullname if m.visit.doctor else '',
                    'days':m.admitDays(),
                    'home_days':m.homeVisitDays(),
                    'claim_code':m.visit.claim_code if m.visit.claim_code else '',
                    'refer_hosp':m.visit.refer_hosp if m.visit.refer_hosp else ''
                })
        results['admit_history'] = history
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)
    
    def get_diags(self):
        results = []
        vn_id = int(request.params.get('vn_id'))
        s = model.Session()
        visit = s.query(model.Visit).get(vn_id)
        if visit:
            
            if visit.ipd_main:
                if visit.ipd_main.final_diagnosis:
                    d = s.query(model.NeuralIcd10).filter_by(code=visit.ipd_main.final_diagnosis).first()
                    results.append({
                        'code':d.code,
                        'name':d.name
                    })
                for i in range(1,11):
                    code = visit.ipd_main.__getattribute__('aux_diag' + str(i))
                    if code:
                        d = s.query(model.NeuralIcd10).filter_by(code=code).first()
                        results.append({
                            'code':d.code if d else code,
                            'name':d.name if d else ''
                        })
            #diags = visit.getDiags()
            #if diags:
            #    for d in diags:
            #        results.append({
            #            'code':d.code,
            #            'name':d.icd10.name
            #        })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'diagnostics':results})
    
    def get_home_visits(self):
        results = []
        vn_id = int(request.params.get('vn_id'))
        s = model.Session()
        visit = s.query(model.Visit).get(vn_id)
        if visit:
            for v in visit.home_visits:
                if v.delete==False:
                    results.append({
                        'start_date':v.hv_date.strftime('%d/%m/%Y'),
                        'end_date':v.hv_back_date.strftime('%d/%m/%Y')
                    })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'diagnostics':results})
    
    def get_total_expense(self):
        results = []
        vn_id = int(request.params.get('vn_id'))
        s = model.Session()
        visit = s.query(model.Visit).get(vn_id)
        homemedin = 0
        homemedout = 0
        hospmedin = 0
        hospmedout = 0
        if visit:
            homemedin = visit.getHomeMedInExpense().amount
            homemedout = visit.getHomeMedOutExpense().amount
            hospmedin = visit.getHospitalMedInExpense().amount
            hospmedout = visit.getHospitalMedOutExpense().amount
            others = visit.getOtherExpense()
            for o in others:
                results.append({
                    'group':o.group_name,
                    'item':o.item_name,
                    'qty':float(o.qty),
                    'unit':o.unit_name,
                    'totalprice':float(o.totalprice)
                })

        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({
           'expense':{
                'homemedin':homemedin,
                'homemedout':homemedout,
                'hospmedin':hospmedin,
                'hospmedout':hospmedout,
                'others':results
            }
        })
        
    def get_visit_receipts(self):
        results = []
        vn_id = int(request.params.get('vn_id'))
        s = model.Session()
        visit = s.query(model.Visit).get(vn_id)
        moresupport = 0
        morediscount = 0
        if visit:
            receipts = visit.get_receipts()
            for r in receipts:
                results.append({
                    'code':r.code,
                    'discount':float(r.discount),
                    'receive':float(r.receive_amount),
                    'support':float(r.support_amount)
                })
            receipts = visit.get_supported_receipts()
            
            for r in receipts:
                moresupport += float(r.support_amount)
                morediscount += float(r.discount)
                
        result = {
            'moresupport': moresupport,
            'morediscount': morediscount,
            'receipts': results
        }
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'result':result})
    
    def print_expense(self):
        s = model.Session()
        user_id = session["sr_user_id"]
        c.user = s.query(model.User).get(user_id)
        vn_id = int(request.params.get('vn_id'))
        c.visit = s.query(model.Visit).get(vn_id)
        c.others = c.visit.getOtherExpense()
        return render('/finance/report/printexpense.html')
    
    def print_ipdsummary(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        vn_id = int(request.params.get('vn_id'))
        c.visit = s.query(model.Visit).get(vn_id)
        
        #c.first_home_visit = s.query(model.IpdHomeVisit).filter_by(an=c.visit.an, delete=False).order_by(model.IpdHomeVisit.hv_date).first()
        #c.last_home_visit = s.query(model.IpdHomeVisit).filter_by(an=c.visit.an, delete=False).order_by(model.IpdHomeVisit.hv_back_date.desc()).first()
        c.diags = []#c.visit.getDiags()
        #c.diags = c.visit.getDiags()
        if c.visit:
            if c.visit.ipd_main:
                if c.visit.ipd_main.final_diagnosis:
                    d = s.query(model.NeuralIcd10).filter_by(code=c.visit.ipd_main.final_diagnosis).first()
                    c.diags.append({
                        'code':d.code if d else c.visit.ipd_main.final_diagnosis,
                        'name':d.name if d else ''
                    })
                for i in range(1,11):
                    code = c.visit.ipd_main.__getattribute__('aux_diag' + str(i))
                    if code:
                        d = s.query(model.NeuralIcd10).filter_by(code=code).first()
                        c.diags.append({
                            'code':d.code if d else code,
                            'name':d.name if d else ''
                        })
        c.activities = s.query(model.DischargeActivity).filter_by(vn_id=c.visit.id, item_status=1).all()
        c.receipts = c.visit.get_receipts()
        c.support_receipts = c.visit.get_supported_receipts()
        #c.homemedin = c.visit.getHomeMedInExpense().amount
        #c.homemedout = c.visit.getHomeMedOutExpense().amount
        #c.hospmedin = c.visit.getHospitalMedInExpense().amount
        #c.hospmedout = c.visit.getHospitalMedOutExpense().amount
        c.homemiex = c.visit.getHomeMedInExp()
        c.homemoex = c.visit.getHomeMedOutExp()
        c.hospmiex = c.visit.getHospMedInExp()
        c.hospmoex = c.visit.getHospMedOutExp()
        c.others = c.visit.getOtherExpense()
        c.tothomemiex = 0
        c.tothomemisub = 0
        for o in c.homemiex:
            c.tothomemiex += float(o.totalprice)
            c.tothomemisub += float(o.subsidy_amount)
            
        c.tothomemoex = 0
        c.tothomemosub = 0
        for o in c.homemoex:
            c.tothomemoex += float(o.totalprice)
            c.tothomemosub += float(o.subsidy_amount)
            
        c.tothospmiex = 0
        c.tothospmisub = 0
        for o in c.hospmiex:
            c.tothospmiex += float(o.totalprice)
            c.tothospmisub += float(o.subsidy_amount)
            
        c.tothospmoex = 0
        c.tothospmosub = 0
        for o in c.hospmoex:
            c.tothospmoex += float(o.totalprice)
            c.tothospmosub += float(o.subsidy_amount)
        rItems = []
        groups = []
        c.totothere = 0
        c.totothersub = 0
        for o in c.others:
            o.subsidy_amount = c.visit.privilege.subsidy_amount(s, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime)
            c.totothere += float(o.totalprice)
            c.totothersub += float(o.subsidy_amount)
            if groups.__contains__(o.group_id):
                index = groups.index(o.group_id)
                rItems[index]['amount'] += float(o.totalprice)#ceil(float(rd.qty) * float(rd.price))
                rItems[index]['subsidy'] += float(o.subsidy_amount)            
            else:
                group_id = o.group_id
                groups.append(group_id)
                item_name = o.group_name                
                item_amount = float(o.totalprice)#ceil(float(rd.qty) * float(rd.price))
                item_qty = o.qty
                rItems.append({
                    'group_id': group_id,
                    'group_name': item_name,
                    'qty': item_qty,
                    'amount': item_amount,
                    'subsidy': float(o.subsidy_amount)
                })
        c.otherItems = rItems
        c.totdiscount = 0
        c.totreceive = 0
        c.totsupport = 0
        for o in c.receipts:
            c.totdiscount += float(o.discount)
            c.totreceive += float(o.receive_amount)
            c.totsupport += float(o.support_amount)
        for o in c.support_receipts:
            c.totsupport += float(o.support_amount)
            c.totdiscount += float(o.discount)
        c.totexp = c.tothospmiex + c.tothospmoex + c.tothomemiex + c.tothomemoex + c.totothere
        c.netexp = c.totexp - c.totdiscount - c.totreceive - c.totsupport
        c.netexp_str = ThaiNum.sayMoney(c.netexp)
        c.visit_days = c.visit.ipd_main.homeVisitDays()
        c.admit_days = c.visit.ipd_main.admitDays()
        #c.dc_reasons = s.query(model.DischargeSelect).filter_by(dc_select_field='dc_reason_detail_code').all()
        #c.dc_types = s.query(model.DischargeSelect).filter_by(dc_select_field='discharge_type_code').all()
        return render('/finance/report/rptipdsummary.html')
    
    def receipt_summary_page(self):
        s = model.Session()
        return render('/finance/report/receiptbyprivilege.html')
    
    def receipt_by_privilege(self):
        s = model.Session()
        start_date = model.DateUtil.parseDate(request.params.get('start_date'), True)
        end_date = model.DateUtil.parseDate(request.params.get('end_date'), True)
        start_date = model.DateUtil.startOfTheDay(start_date)
        end_date = model.DateUtil.endOfTheDay(end_date)
        patient_type = request.params.get('patient_type')
        
        results = model.ReceiptH.getSummaryByPrivilege(start_date, end_date, patient_type)
        results_array = []
        count = 1
        total = 0
        for result in results:
            results_array.append({
                'no':count,
                'privilege_name':result.name,
                'receive':float(result.receive),
                'subsidy':float(result.subsidy),
                'support':float(result.support),
                'discount':float(result.discount),
                'deposit':float(result.deposit),
                'visit_count':result.visit_count,
                'subtotal': float(result.receive + result.subsidy + result.support +
                                  result.discount + result.deposit)
            })
            count += 1
            
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'results': results_array})
    
    def print_receipt_by_privilege(self):
        c.start_date = request.params.get('start_date')
        c.end_date = request.params.get('end_date')
        c.patient_type = request.params.get('patient_type')
        c.results = simplejson.loads(request.params.get('results'))
        user_id = session.get('sr_user_id')
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        return render('/finance/report/printreceiptbyprivilege.html')
    
        
    def print_lab_view(self):
        c.vn_id = request.params.get('vn_id')
        return render('/finance/report/printlabview.html')
    
    def print_labs(self):
        c.vn_id = request.params.get('vn_id')
        s = model.Session()
        user_id = session.get("sr_user_id")
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.visit = s.query(model.Visit).get(c.vn_id)
        stmt = select([model.Item.item_code, model.Item.name,
                       func.sum(model.NeuralRecord.qty).label('qty'),
                       model.NeuralRecord.price,
                       func.sum(model.NeuralRecord.qty * model.NeuralRecord.price).label('total')
                       ], 
                       (model.NeuralOrder.deleted == False) & 
                       (model.NeuralOrderItem.deleted==False) &
                       (model.NeuralOrder.order_type=='lab') &
                       (model.NeuralOrder.vn_id==c.vn_id), 
                       from_obj=[join(model.NeuralRecord, model.NeuralOrderItem, 
                                      model.NeuralRecord.order_item_id==model.NeuralOrderItem.id).\
                                 join(model.NeuralOrder, model.NeuralOrderItem.order_id==model.NeuralOrder.id).\
                                 join(model.Item, model.NeuralOrderItem.item_id==model.Item.id)])\
                        .group_by(model.Item.item_code, model.Item.name, model.NeuralRecord.price)
        rs = stmt.execute()
        c.items = rs.fetchall()
        rs.close()
        c.max_items = 20;
        c.item_height = 0.6;
        return render('/finance/report/printlabs.html')
    
    def print_restore_view(self):
        c.vn_id = request.params.get('vn_id')
        return render('/finance/report/printrestoreview.html')
    
    def print_restores(self):
        c.vn_id = request.params.get('vn_id')
        s = model.Session()
        user_id = session.get("sr_user_id")
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.visit = s.query(model.Visit).get(c.vn_id)
        c.records = s.query(model.NeuralRecord).select_from(model.neural_record_tb.\
                    join(model.neural_order_item_tb, model.neural_record_tb.c.order_item_id==model.neural_order_item_tb.c.id).\
                    join(model.neural_order_tb, model.neural_order_item_tb.c.order_id==model.neural_order_tb.c.id).\
                    join(model.item_tb, model.neural_order_item_tb.c.item_id==model.item_tb.c.id)).\
                    filter(model.Item.group_id==30).filter(model.NeuralOrder.vn_id==c.vn_id).\
                    filter(model.NeuralOrder.deleted==False).\
                    order_by(model.Item.name.desc(), model.NeuralRecord.created_date)#.all()
        
        c.max_items = 20;
        c.item_height = 0.6;
        return render('/finance/report/printrestores.html')
    
    def print_items_view(self):
        c.vn_id = request.params.get('vn_id')
        return render('/finance/report/printitemsview.html')
    
    def print_items(self):
        c.vn_id = request.params.get('vn_id')
        s = model.Session()
        user_id = session.get("sr_user_id")
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.items = self.get_items(c.vn_id)
        c.visit = s.query(model.Visit).get(c.vn_id)
#        c.medin = self.get_items(c.vn_id, 1)
#        c.medout = self.get_items(c.vn_id, 2)
#        c.lab = self.get_items(c.vn_id, 4)
#        c.xray = self.get_items(c.vn_id, 29)
#        c.service = self.get_items(c.vn_id, 12)
        
        return render('/finance/report/printitems.html')
    
    def get_items(self, vn_id):
        stmt = select([model.ItemGroup.id.label('group_id'), model.ItemGroup.name.label('group_name'), model.Item.name, model.Item.item_code, func.sum(model.ReceiptD.qty).label('qty'), \
                       model.ReceiptD.price, func.sum(model.ReceiptD.subsidy_amount).label('subsidy_amount'), \
                       func.sum(model.ReceiptD.total_amount-model.ReceiptD.subsidy_amount).label('pay_amount'), \
                       func.sum(model.ReceiptD.total_amount).label('total_amount')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (model.ReceiptH.vn_id==vn_id) & (model.ReceiptH.cancelled==False), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(model.ReceiptD, model.ReceiptH, model.ReceiptD.receipt_h_id==model.ReceiptH.id)\
                         .join(model.Item, model.ReceiptD.item_id==model.Item.id)\
                         .join(model.ItemGroup, model.Item.group_id==model.ItemGroup.id)])\
                .group_by(model.ItemGroup.id, model.ItemGroup.name, model.Item.name, model.Item.item_code, model.ReceiptD.price)\
                .order_by(model.ItemGroup.id, model.Item.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result