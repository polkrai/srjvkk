# -*- encoding: utf-8 -*-

import logging

import simplejson

from srjvkk.lib.base import *
from sqlalchemy.sql.expression import join, func, select, outerjoin
from sqlalchemy.sql import and_, or_, not_, select, func, join, between
import srutil
from datetime import datetime, timedelta
from math import ceil

log = logging.getLogger(__name__)

class FinanceController(BaseController):
    def __before__(self):
        if config['jvkk.login'] != 'yes':
            # now that we have no login controller.
            session['sr_user_id'] = 157
            session['sr_session_id'] = 'dummysessionvalue'
            session['sr_client_ip'] = '127.0.0.1'
            session.save()
        else:
            # real environment
            if request.path_info == h.url_for(action='login'):
                return
            if not srutil.check_session(request, session, model.Session()):
                action = request.environ.get('PATH_INFO').split('/')[-1]
                if action not in ['payment_page', 'unpaid_orders', 'unpaid_records',
                                  'get_patient_deposit', 'get_patient_support']:
                    session.clear()
                    session.save()
                    return redirect_to(config['pylons.g'].loginurl)

    def index(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.sendcoms = model.Component.sendcoms(s)
        c.station = model.Station.getStation(s, session['sr_client_ip'])
        c.com_id = model.Component.FinanceId
        #c.ip_server_q4u = config['ip_server_q4u']
        #c.token = config['token']
        return render('/finance.html')

    def check_payment(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        order_id = int(request.params.get('order_id'))
        order = s.query(model.NeuralOrder).get(order_id)
        records = model.NeuralRecord.records_by_order(order_id, order.pa_id)
        privilege = order.visit.privilege
        passPayment = True
        total_subsidy = 0
        for o in records:
            subsidy_amount = privilege.subsidy_amount(s, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime) if privilege else 0.0
            total_subsidy += subsidy_amount
#            if subsidy_amount < ceil(float(o.qty) * float(o.price)):
            if subsidy_amount < float(float(o.qty) * float(o.price)):
                passPayment = False

        if passPayment:
            model.ReceiptH.genReceipt(s, [{'id':order_id}], 0, 0, total_subsidy, \
                                      0, 0, None, order.visit, -1, -1)

        response.headers['content-type'] = 'text/plain'
        return str(passPayment).lower()

    def make_deposit_order(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(vn_id)
#        sess_id = request.params.get('id_sess')
#        usersess = s.query(model.UserSession).filter_by(id_sess=sess_id).first()
        user = s.query(model.User).get(session['sr_user_id'])
        deposit = float(request.params.get('deposit'))
        order_id = model.NeuralOrder.make_deposit(s, visit, deposit, user)
        return str(order_id)

    def make_service_charge_order(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(vn_id)
        user_id = session.get('sr_user_id')
#        sess_id = request.params.get('id_sess')
#        usersess = s.query(model.UserSession).filter_by(id_sess=sess_id).first()
        user = s.query(model.User).get(user_id)
        return str(model.NeuralOrder.make_service_charge(s, visit, user)).lower()

    def make_room_charge_order(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(vn_id)
        user_id = session.get('sr_user_id')
        user = s.query(model.User).get(user_id)
        building_id = int(request.params.get('building_id'))
        room_special = True if request.params.get('room_special') == 'true' else False
        room_separate = True if request.params.get('room_separate') == 'true' else False
        change = True if request.params.get('change') == 'true' else False
        str_admit_date = request.params.get('admit_date')
        admit_date = datetime.now()
        if str_admit_date != None:
            arr_admit_date = str_admit_date.split('-')
            if len(arr_admit_date) == 3:
                admit_date = datetime(int(arr_admit_date[0]), int(arr_admit_date[1]), int(arr_admit_date[2]))

        return str(model.NeuralOrder.make_room_charge(s, visit, user, building_id, room_special, change, admit_date, room_separate)).lower()

    def add_special_food_charge(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(vn_id)
        user_id = session.get('sr_user_id')
        user = s.query(model.User).get(user_id)
        qty = int(request.params.get('qty'))
        order = s.query(model.NeuralOrder).filter_by(vn_id=visit.id,
                    order_type=u'room', deleted=False, stop=False).first()
        if not order:
            return 'false'
        order.add_special_food_charge(qty)
        return 'true'

    def update_room_charge(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(vn_id)
        user_id = session.get('sr_user_id')
        user = s.query(model.User).get(user_id)
        discharge = True if request.params.get('discharge') == 'true' else False
        order = s.query(model.NeuralOrder).filter_by(vn_id=visit.id,
                    order_type=u'room', deleted=False, stop=False).first()
        if not order:
            return 'false'
        model.NeuralOrder.updateRoomCharge(s, order, discharge)
        return 'true'

    def payment_page(self):
        user_id = session.get("sr_user_id")
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.pa_id = int(request.params.get('pa_id'))
        visit = s.query(model.Visit).filter_by(id_patient=c.pa_id, time_toclose=None).first()
        c.vn_id = visit.id if visit else -1
        #c.vn_id = request.params.get('vn_id')
        #c.vn_id = int(c.vn_id) if c.vn_id else -1
        c.qcalled = request.params.get('qcalled')
        c.qcalled = c.qcalled if c.qcalled else False

#        sess_id = request.params.get("id_sess")
        id_sess = request.params.get('id_sess', '')
        usersess = s.query(model.UserSession).filter_by(id_sess=id_sess).first()
        c.editable = False
        if usersess:
            c.editable = usersess.editable_page(s, model.Component.FinanceId)
        if session.get('sr_session_id') == 'dummysessionvalue':
            c.editable = True
        return render('/finance/payment.html')

    def payment_history_page(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.pa_id = int(request.params.get('pa_id'))
        visit = s.query(model.Visit).filter_by(id_patient=c.pa_id, time_toclose=None).first()
        c.vn_id = visit.id if visit else -1
        c.qcalled = request.params.get('qcalled')
        c.qcalled = c.qcalled if c.qcalled else False
        #c.vn_id = int(request.params.get('vn_id'))
        #visit = s.query(model.Visit).get(c.vn_id)
        #c.pa_id = visit.patient.id if visit else -1
        #c.qcalled = request.params.get('qcalled')
        return render('/finance/payment-history.html')


    def payment_history(self):
        results = {}
        history = []
        pa_id = int(request.params.get('pa_id'))
        s = model.Session()
        receipts = []
        query = request.params.get('query')
        if query:
            receipts = s.query(model.ReceiptH).filter_by(cancelled=False).\
                filter(model.ReceiptH.code.like('%' + query.upper() + '%')).\
                join('visit').filter_by(id_patient=pa_id).order_by(\
                model.ReceiptH.code.desc()).all()
        else:
            receipts = s.query(model.ReceiptH).filter_by(cancelled=False).\
                join('visit').filter_by(id_patient=pa_id).order_by(\
                model.ReceiptH.receipt_date.desc()).all()
        for r in receipts:
            history.append({
                'id':r.id,
                'no':r.code,
                'date':r.receipt_date.strftime('%d/%m/%Y'),
                'receive_amount':float(r.receive_amount),
                'support_amount':float(r.support_amount),
                'subsidy_amount':float(r.subsidy_amount),
                'discount':float(r.discount),
                'deposit':float(r.deposit),
                'patient_type':'ผู้ป่วยใน' if r.visit.an else 'ผู้ป่วยนอก',
                'privilege':r.privilege.name,
                'printno':r.printno,
                'sent':r.sent
            })
        results['payment_history'] = history
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)

    def payment_history_item(self):
        results = {}
        items = []
        s = model.Session()
        rid = int(request.params.get('receipth_id'))
        rds = s.query(model.ReceiptD).filter_by(receipt_h_id=rid).all()
        for rd in rds:
            items.append({
                'item':rd.item.name,
                'code':rd.item.item_code,
                'amount':ceil(rd.total_amount),#ceil(float(rd.qty) * float(rd.price)),
                'subsidy':ceil(rd.subsidy_amount)
            })
#        item_names = []
#        for rd in rds:
#            if item_names.__contains__(rd.record.order_item.item.group.name):
#                index = item_names.index(rd.record.order_item.item.group.name)
#                items[index]['amount'] += float(rd.record.qty) * float(rd.record.price)
#            elif item_names.__contains__(rd.record.order_item.item.name):
#                index = item_names.index(rd.record.order_item.item.name)
#                items[index]['amount'] += float(rd.record.qty) * float(rd.record.price)
#            else:
#                item_name = rd.record.order_item.item.name
#                if rd.record.order_item.item.group.show:
#                    item_name = rd.record.order_item.item.group.name
#                    item_names.append(rd.record.order_item.item.group.name)
#                else:
#                    item_names.append(rd.record.order_item.item.name)
#                items.append({
#                    'item': item_name,
#                    'amount': float(rd.record.qty) * float(rd.record.price)
#                })

        results['items'] = items
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)

    def get_patient_deposit(self):
        s = model.Session()
        pa_id = int(request.params.get('pa_id'))
        patient = s.query(model.Patient).get(pa_id)
        return str(patient.deposit) if patient else str(0)


    def get_patient_support(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        support = model.SocialSupport.patient_support(s, vn_id)
        jsonSupport = {}
        if support:
            jsonSupport = {
                'id':support.id,
                'support_amount':float(support.support_amount)
            }
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(jsonSupport)

    def get_subsidy_amount(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(vn_id)
        item_id = int(request.params.get('item_id'))
        item = s.query(model.Item).get(item_id)
        qty = float(request.params.get('qty'))
        frequency = float(request.params.get('frequency'))
        pertime = float(request.params.get('pertime'))
        return visit.privilege.subsidy_amount(s, item_id, qty, item.price, frequency, pertime)

    def unpaid_orders(self):
        s = model.Session()
        pa_id = int(request.params.get('pa_id'))
        patient = s.query(model.Patient).get(pa_id)
        #vn_id = int(request.params.get('vn_id'))
        #visit = s.query(model.Visit).get(vn_id)
        #visit = patient.visit if patient else None
        visit = s.query(model.Visit).filter_by(id_patient=pa_id, time_toclose=None).first()
        #orders = s.query(model.NeuralOrder).filter_by(pa_id=visit.id_patient if visit else -1)\
        #    .join(model.NeuralOrder.order_items).join(model.NeuralOrderItem.record)\
        #    .filter_by(deleted=False, paid=False).all()
        #orders = s.query(model.NeuralOrder).filter_by(pa_id=pa_id if patient else -1, deleted=False)\
        #    .join(model.NeuralOrder.order_items).join(model.NeuralOrderItem.record)\
        #    .filter_by(deleted=False, paid=False).all()
        orders = s.query(model.NeuralOrder).filter_by(pa_id=pa_id if patient else -1, \
                        paid=False, pt_leave=False, deleted=False).all()
        arrOrders = []
#        privilege = None
#        if visit:
#            privilege = visit.privilege
#        elif patient:
#            privilege = patient.privilege
        for o in orders:
            records = model.NeuralRecord.records_by_order(o.id, pa_id)
            record_amount = 0
#            subsidy_amount = 0
            for rec in records:
#                subsidy_amount += privilege.subsidy_amount(s, rec.item_id,\
#                                rec.qty, rec.price, rec.frequency, \
#                                rec.pertime) if privilege else 0.0
                record_amount += math.ceil(float(rec.qty) * float(rec.price))

            arrOrders.append({
                'id':o.id,
                'vn':visit.vn if visit else '',
                'vn_id':visit.id if visit else '',
                'order_date':o.order_date.strftime('%d/%m/%Y'),
                'record_amount': math.ceil(record_amount),
                #'record_amount':float(record_amount),
                'type':o.order_type,
#                'subsidy_amount':float(subsidy_amount),
#                'remain_amount':float(record_amount) - float(subsidy_amount),
                'stop':o.stop
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'orders':arrOrders})

    def unpaid_records(self):
        s = model.Session()
		#order_id = int(request.params.get('order_id'))
        orders = simplejson.loads(request.params.get('orders'))
        pa_id = int(request.params.get('pa_id'))
        patient = s.query(model.Patient).get(pa_id)
        visit = s.query(model.Visit).filter_by(id_patient=pa_id, closed=False).first()
        #vn_id = int(request.params.get('vn_id'))
        #visit = s.query(model.Visit).get(vn_id)
        #records = s.query(model.NeuralRecord).join(model.NeuralRecord.order_item).join(model.NeuralOrderItem.order).filter_by(deleted=False, id=order_id).sum(qty).all()
        #tt = s.query(model.NeuralRecord, func.sum('price').label('test')).group_by(model.NeuralRecord.id).all()
        records = model.NeuralRecord.unpaid_records_by_orders(orders, pa_id)
        support = None
        if visit:
            support = model.SocialSupport.patient_support(s, visit.id)
        result = {
            'support_id': support.id if support else -1,
            'support_amount': float(support.support_amount) if support else 0,
            'deposit': float(patient.deposit) if patient else 0
        }
        arrRecords = []
        privilege = None
        if visit:
            privilege = visit.privilege
        elif patient:
            privilege = patient.privilege

        for o in records:
            subsidy_amount = 0.0
            if o.reason != 'F':
                if privilege:
                    subsidy_amount = privilege.subsidy_amount(s, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime)
            qtyPerDay = o.frequency * o.pertime
            qtyPerDay = 1 if qtyPerDay == 0 else qtyPerDay
            drug = s.query(model.Drug).filter_by(item_id=o.item_id).first()
            qty = float(o.qty)
            if drug:
                qty = float(o.qty) * drug.dose_capacity
            arrRecords.append({
                #'id':o.id,
                'item_id':o.item_id,
                'item':o.item_name,
                #'unit_id':o.order_item.unit_id,
                'unit':o.unit_name,
                'qty':float(o.qty),
                'price':float(o.price),
                'totalprice': ceil(float(o.qty) * float(o.price)),
                #'totalprice':float(float(o.qty) * float(o.price)),
                #'paid': o.paid,
                'itemtype': o.group_name,
                'subsidy_amount': float(subsidy_amount),
                'day_qty': ceil(qty / qtyPerDay),
				'reason': o.reason
            })
        result['records'] = arrRecords
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'result':result})

    def patient_payment(self):
        results = {}
        pa_id = int(request.params.get('pa_id'))
        s = model.Session()
        visits = s.query(model.Visit).filter_by(id_patient=pa_id).all()
        patient_payment = []
        for v in visits:
            #paid = len(s.query(model.ItemOrder).filter_by(vn_id=v.id, paid=False).all()) == 0
            paid =  len(s.query(model.NeuralRecord).filter_by(vn_id=v.id, paid=False).all()) == 0
            if paid:
                continue
            patient_payment.append({
                'id':v.id,
                'visit':v.vn,
                'visit_date':v.time_add.strftime('%d/%m/%Y'),
                'paid':paid
            })
        results['patient_payment'] = patient_payment
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)

    def visit_charge(self):
        results = {}
        orders = []
        vn_id = request.params.get('vn_id')
        if (vn_id is None):
            if request.params.get('empty'):
                orders.append({
                    'id': -1,
                    'item_id':'',
                    'item':'',
                    'unit_id':'',
                    'unit':'',
                    'qty':0.0,
                    'price':0.0,
                    'totalprice': 0.0,
                    'paid': True
                })
            else:
                results['Error'] = 'Invalid GET parameters'
        else:
            vn_id = int(vn_id)
            s = model.Session()
            #qo = s.query(model.ItemOrder).filter(and_(model.item_order_tb.c.vn_id == vn_id,
            #    model.item_order_tb.c.deleted == False)).all()
            qo = s.query(model.NeuralRecord).filter(and_(model.neural_record_tb.c.vn_id == vn_id,
                model.neural_record_tb.c.deleted == False))
            for ord in qo:
                #if ord.paid: continue
                orders.append({
                    'id':ord.id,
                    'item_id':ord.order_item.item.id,
                    'item':ord.order_item.item.name,
                    'unit_id':ord.order_item.unit_id,
                    'unit':ord.order_item.unit.name,
                    'qty':float(ord.qty),
                    'price':float(ord.price),
                    'totalprice': float(ord.qty) * float(ord.price),
                    'paid': ord.paid,
                    'itemtype': ord.order_item.item.group.name
                })
        results['Orders'] = orders
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'VisitCharge':results})

    def mark_patient_leave(self):
        s = model.Session()
        orders = simplejson.loads(request.params.get('orders'))
        for order in orders:
            o = s.query(model.NeuralOrder).get(order)
            o.pt_leave = True
            s.update(o)
        s.commit()

    def submit_payment(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(vn_id)
        pa_id = int(request.params.get('pa_id'))
        station_id = int(request.params.get('station_id'))
        receive_amount = float(request.params.get('totalamount').replace(',', ''))
        support_amount = float(request.params.get('support-amount'))
        subsidy_amount = float(request.params.get('subsidy-amount'))
        deposit = float(request.params.get('deposit'))
        discount = float(request.params.get('discount'))
        support_id = int(request.params.get('support-id'))
        support = s.query(model.SocialSupport).get(support_id)

        orders = simplejson.loads(request.params.get('orders'))
        receipt_id = model.ReceiptH.genReceipt(s, orders, receive_amount, support_amount, \
                                  subsidy_amount, deposit, discount, support, visit, user_id, station_id)

        return str(receipt_id)

    def submit_deposit(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        vn_id = int(request.params.get('dvn_id'))
        station_id = int(request.params.get('dstation_id'))
        visit = s.query(model.Visit).get(vn_id)
#        sess_id = request.params.get('id_sess')
#        usersess = s.query(model.UserSession).filter_by(id_sess=sess_id).first()
        user = s.query(model.User).get(user_id)
        deposit = float(request.params.get('depositamount'))
        order_id =model.NeuralOrder.make_deposit(s, visit, deposit, user)

        orders = [order_id]
        receipt_id = model.ReceiptH.genReceipt(s, orders, deposit, 0, \
                                  0, 0, 0, None, visit, user_id, station_id)

        return str(receipt_id)

    def print_receipt(self):
        s = model.Session()
        receiptId = int(request.params.get('receipt_id'))
        c.station = model.Station.getStation(s, session['sr_client_ip'])
        c.receipt = s.query(model.ReceiptH).get(receiptId)
        c.receipt.printno += 1
        s.save_or_update(c.receipt)
        c.rec_month = model.DateUtil.getMonth(c.receipt.receipt_date)
#        receipt_items = c.receipt.receipt_items()
        c.receive_by = s.query(model.User).get(c.receipt.created_by)

#        for item in receipt_items:
#            item.subsidy_amount = c.receipt.privilege.subsidy_amount(s, item.item_id,\
#                    item.qty, item.price, item.frequency, item.pertime) if c.receipt.privilege else 0.0

#        c.receipt = simplejson.loads(request.params.get('receipt'))
        rItems = []
        item_names = []
        c.total_amount = 0
        for rd in c.receipt.receiptds:
            #if float(item.qty * item.price) - item.subsidy_amount == 0: continue
            if item_names.__contains__(rd.item.group.name):
                index = item_names.index(rd.item.group.name)
#                if item.group_id == model.ItemGroup.MedInId:
#                    rItems[index]['subsidy'] += (float(item.qty) * float(item.price)) - item.subsidy_amount
#                    c.total_subsidy += rItems[index]['subsidy']
#                else:
                #rItems[index]['amount'] += (float(item.qty) * float(item.price)) - item.subsidy_amount

                rItems[index]['amount'] += math.ceil(rd.total_amount)#ceil(float(rd.qty) * float(rd.price))
                #if rd.item.item_code and rItems[index]['code'].find(rd.item.item_code) == -1:
                #    rItems[index]['code'] += "," + rd.item.item_code
                #rItems[index]['amount'] += float(item['qty'] * item['price'])
                rItems[index]['subsidy'] += math.ceil(rd.subsidy_amount)
            elif item_names.__contains__(rd.item.name):
                index = item_names.index(rd.item.name)
                #rItems[index]['amount'] += float(item['qty'] * item['price'])
                #rItems[index]['subsidy'] += item['subsidy_amount']
                #rItems[index]['subsidy'] += (float(item.qty) * float(item.price)) - item.subsidy_amount
                rItems[index]['qty'] += rd.qty
                rItems[index]['amount'] += math.ceil(rd.total_amount)#ceil(float(rd.qty) * float(rd.price))
                rItems[index]['subsidy'] += math.ceil(rd.subsidy_amount)
            else:
                item_name = rd.item.name
                item_code = None
                #item_code = rd.item.item_code if rd.item.item_code else ''
                item_qty = 0
                item_amount = 0
                #item_subsidy = 0
#                if (item.group_id == model.ItemGroup.MedInId) or \
#                    (item.group_id == model.ItemGroup.MedOutId):
                if rd.item.group.show:
                    item_name = rd.item.group.name
                    item_names.append(item_name)
#                    if item.group_id == model.ItemGroup.MedInId:
#                        item_subsidy = (float(item.qty * item.price)) - item.subsidy_amount
#                        c.total_subsidy += item_subsidy
#                    else:
#                    item_amount = (float(item.qty * item.price)) - item.subsidy_amount
                else:
                    item_names.append(item_name)
                    item_code = rd.item.item_code
                    #item_subsidy = (float(item.qty) * float(item.price)) - item.subsidy_amount
                    #c.total_subsidy += item_subsidy
                item_amount = math.ceil(rd.total_amount)#ceil(float(rd.qty) * float(rd.price))
                item_qty = rd.qty
                rItems.append({
                    'code': item_code,
                    'item': item_name,
                    'qty': item_qty,
                    'amount': item_amount,
                    'subsidy': math.ceil(rd.subsidy_amount)
                    #'subsidy': item_subsidy
                })

        for item in rItems:
            c.total_amount += item['amount']
            item['amount'] = math.ceil(item['amount'])#math.ceil(item['amount'])

        c.discounts = []
        if c.receipt.deposit > 0:
            c.discounts.append({
                'item':u'* มัดจำการรักษา',
                'amount':c.receipt.deposit
            })
            c.total_amount -= float(c.receipt.deposit)
        if c.receipt.support_amount > 0:
            c.discounts.append({
                'item':u'* สงเคราะห์',
                'amount':c.receipt.support_amount
            })
            c.total_amount -= math.ceil(c.receipt.support_amount)
        if c.receipt.subsidy_amount > 0:
            c.discounts.append({
                'item':u'* ใช้สิทธิบัตร',
                'amount': math.ceil(c.receipt.subsidy_amount)
            })
            c.total_amount -= math.ceil(c.receipt.subsidy_amount)
        if c.receipt.discount > 0:
            c.discounts.append({
                'item':u'* ส่วนลด',
                'amount':c.receipt.discount
            })
            c.total_amount -= math.ceil(c.receipt.discount)
        c.total_amount = math.ceil(c.total_amount)#math.ceil(c.total_amount)
        c.receipt_items = rItems
        c.receive_str = ThaiNum.sayMoney(c.total_amount)
        s.commit()
        c.max_items = 11
        c.item_height = 0.75
        c.discount_height = len(c.discounts) * c.item_height
        return render('/finance/receipt-print.html')

    def setup_main(self):
        return render('/finance/setupmain.html')

    def setup_privilege(self):
        return render('/finance/setupprivilege.html')

    def get_privileges(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        privileges = s.query(model.Privilege).filter_by(deleted=False).order_by(model.Privilege.name).all()
        arrPriv = []
        for p in privileges:
            arrPriv.append({
                'id':p.id,
                'name':p.name,
                'privileged':p.privileged,
                'max_med_period':p.max_med_period,
                'max_med_amount':float(p.max_med_amount),
                'med_in':p.med_in,
                'med_out':p.med_out,
                'special':p.special
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'privileges':arrPriv})

    def save_privilege(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        privilege = simplejson.loads(request.params.get('privilege'))
        delPrivileges = simplejson.loads(request.params.get('del-privileges'))
        specials = simplejson.loads(request.params.get('specials'))
        delSpecials = simplejson.loads(request.params.get('del-specials'))

        oPrivilege = None
        if privilege != '':
            if privilege['id'] == -1:
                oPrivilege = model.Privilege()
                oPrivilege.deleted = False
                oPrivilege.created_by = c.user.id
                oPrivilege.created_date = datetime.now()
            else:
                oPrivilege = s.query(model.Privilege).get(int(privilege['id']))
                oPrivilege.updated_by = c.user.id
                oPrivilege.updated_date = datetime.now()
            oPrivilege.name = privilege['name']
            oPrivilege.privileged = privilege['privileged']
            oPrivilege.max_med_period = int(privilege['max_med_period'])
            oPrivilege.max_med_amount = float(privilege['max_med_amount'])
            oPrivilege.special = privilege['special']
            oPrivilege.med_in = privilege['med_in']
            oPrivilege.med_out = privilege['med_out']
            s.save_or_update(oPrivilege)

            for special in specials:
                oSpecial = None
                if special['id'] == -1:
                    oSpecial = model.SpecialItemSubsidy()
                    oSpecial.created_by = c.user.id
                    oSpecial.created_date = datetime.now()
                else:
                    oSpecial = s.query(model.SpecialItemSubsidy).get(int(special['id']))
                    oSpecial.updated_by = c.user.id
                    oSpecial.updated_date = datetime.now()
                oSpecial.deleted = False
                oSpecial.item_id = int(special['item_id'])
                oSpecial.subsidy_amount = float(special['subsidy_amount'])
                oSpecial.max_day_allowed = int(special['max_day_allowed'])
                oSpecial.privilege = oPrivilege
                s.save_or_update(oSpecial)

        for p in delPrivileges:
            oPrivilege = s.query(model.Privilege).get(int(p['id']))
            oPrivilege.deleted = True
            oPrivilege.deleted_by = c.user.id
            oPrivilege.deleted_date = datetime.now()
            s.save_or_update(oPrivilege)

        for special in delSpecials:
            oSpecial = s.query(model.SpecialItemSubsidy).get(int(special['id']))
            oSpecial.deleted = True
            oSpecial.deleted_by = c.user.id
            oSpecial.deleted_date = datetime.now()
            s.save_or_update(oSpecial)
        s.commit()

    def get_specials(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        privId = int(request.params.get('privilege_id'))
        specials = s.query(model.SpecialItemSubsidy).filter_by(deleted=False, privilege_id=privId).all()
        arrSpecials = []
        for s in specials:
            arrSpecials.append({
                'id':s.id,
                'group_id':s.item.group_id,
                'group':s.item.group.name,
                'item_id':s.item_id,
                'item':s.item.name,
                'unit':s.item.unit.name,
                'subsidy_amount':float(s.subsidy_amount),
                'max_day_allowed': s.max_day_allowed
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'specials':arrSpecials})

    def setup_item(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.groups = s.query(model.ItemGroup).filter_by(deleted=False).order_by(model.item_group_tb.c.name).all()
        return render('/finance/setupitem.html')

    def get_special_items(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        limit = request.params.get('limit')
        query = request.params.get('query')
        items = s.query(model.Item).filter_by(deleted=False, special=True, pay=True).\
            filter(func.lower(model.Item.name).like(str(query.lower().encode('UTF-8')) + '%')).limit(int(limit)).order_by(model.item_tb.c.id).all()
        arr_items = []
        for item in items:
            arr_items.append({
               'id':item.id,
               'code':item.item_code,
               'name':item.name,
               'unit_id':item.unit_id,
               'unit':item.unit.name,
               'group_id':item.group_id,
               'group':item.group.name,
               'price':float(item.price),
               'special':item.special,
               'pay':item.pay
            })

        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'items':arr_items})

    def get_items(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        groupId = request.params.get('group_id')
        if groupId == 'null':
            groupId = None
        else:
            groupId = int(groupId)
        pSpecial = request.params.get('special')
        items = []
        if pSpecial == None:
            items = s.query(model.Item).filter_by(deleted=False, group_id=groupId).order_by(model.item_tb.c.id).all()
        else:
            pSpecial = True if pSpecial == 'true' else False
            items = s.query(model.Item).filter_by(deleted=False, group_id=groupId, special=pSpecial).order_by(model.item_tb.c.id).all()
        arr_items = []
        for item in items:
            arr_items.append({
               'id':item.id,
               'code':item.item_code,
               'name':item.name,
               'unit_id':item.unit_id,
               'unit':item.unit.name,
               'group_id':item.group_id,
               'price':float(item.price),
               'special':item.special,
               'pay':item.pay,
               'ipd':item.ipd
            })

        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'items':arr_items})

    def save_item(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        items = simplejson.loads(request.params.get('items'))
        delItems = simplejson.loads(request.params.get('del-items'))
        for item in items:
            oItem = model.Item()
            if item['id'] == -1:
                oItem.deleted = False
                oItem.created_by = c.user.id
                oItem.created_date = datetime.now()
            else:
                oItem = s.query(model.Item).get(int(item['id']))
                oItem.updated_by = c.user.id
                oItem.updated_date = datetime.now()
            oItem.name = item['name'].strip()
            oItem.item_code = item['code'].strip() if item['code'] and item['code'] != '' else None
            group_id = item['group_id']
            oItem.group_id = int(group_id) if group_id else None
            oItem.unit_id = int(item['unit_id'])
            oItem.price = float(item['price'])
            oItem.special = item['special']
            oItem.pay = item['pay']
            oItem.ipd = item['ipd']
            s.save_or_update(oItem)

        for item in delItems:
            oItem = s.query(model.Item).get(int(item['id']))
            oItem.deleted = True
            oItem.deleted_by = c.user.id
            oItem.deleted_date = datetime.now()
            s.save_or_update(oItem)
        s.commit()

    def setup_item_unit(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        return render('/finance/setupunit.html')

    def get_item_units(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        units = s.query(model.ItemUnit).filter_by(deleted=False).order_by(model.item_unit_tb.c.name).all()
        arr_units = []
        for unit in units:
            arr_units.append({
               'id':unit.id,
               'name':unit.name,
               'label':unit.name,
               'value':unit.id
            })

        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'units':arr_units})

    def save_item_unit(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        units = simplejson.loads(request.params.get('units'))
        delUnits = simplejson.loads(request.params.get('del-units'))
        for unit in units:
            oUnit = model.ItemUnit()
            if unit['id'] == -1:
                oUnit.deleted = False
                oUnit.created_by = c.user.id
                oUnit.created_date = datetime.now()
            else:
                oUnit = s.query(model.ItemUnit).get(int(unit['id']))
                oUnit.updated_by = c.user.id
                oUnit.updated_date = datetime.now()
            oUnit.name = unit['name']
            s.save_or_update(oUnit)

        for unit in delUnits:
            oUnit = s.query(model.ItemUnit).get(int(unit['id']))
            oUnit.deleted = True
            oUnit.deleted_by = c.user.id
            oUnit.deleted_date = datetime.now()
            s.save_or_update(oUnit)
        s.commit()

    def setup_item_group(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.grpMedIn = model.ItemGroup.MedInId
        c.grpMedOut = model.ItemGroup.MedOutId
        return render('/finance/setupgroup.html')

    def get_item_groups(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        groups = s.query(model.ItemGroup).filter_by(deleted=False).order_by(model.item_group_tb.c.name).all()
        arr_groups = []
        for group in groups:
            arr_groups.append({
               'id':group.id,
               'name':group.name,
               'show':group.show,
               'value':group.id,
               'label':group.name
            })

        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'groups':arr_groups})

    def save_item_group(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        groups = simplejson.loads(request.params.get('groups'))
        delGroups = simplejson.loads(request.params.get('del-groups'))
        for group in groups:
            oGroup = model.ItemGroup()
            if group['id'] == -1:
                oGroup.deleted = False
                oGroup.created_by = c.user.id
                oGroup.created_date = datetime.now()
            else:
                oGroup = s.query(model.ItemGroup).get(int(group['id']))
                oGroup.updated_by = c.user.id
                oGroup.updated_date = datetime.now()
            oGroup.show = group['show']
            oGroup.name = group['name']
            s.save_or_update(oGroup)

        for group in delGroups:
            oGroup = s.query(model.ItemGroup).get(int(group['id']))
            oGroup.deleted = True
            oGroup.deleted_by = c.user.id
            oGroup.deleted_date = datetime.now()
            s.save_or_update(oGroup)
        s.commit()

    def setup_station(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.station_opd = model.Station.OPD
        c.station_ipd = model.Station.IPD
        c.station_dental = model.Station.DENTAL
        c.station_alternative = model.Station.ALTERNATIVE
        return render('/finance/setupstation.html')

    def get_stations(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        stations = s.query(model.Station).filter_by(deleted=False).order_by(model.station_tb.c.name).all()
        arr_stations = []
        for station in stations:
            arr_stations.append({
               'id':station.id,
               'name':station.name,
               'ip':station.ip,
               'type':station.type
            })

        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'stations':arr_stations})

    def save_station(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        stations = simplejson.loads(request.params.get('stations'))
        delStations = simplejson.loads(request.params.get('del-stations'))
        for station in stations:
            oStation = model.Station()
            if station['id'] == -1:
                oStation.deleted = False
                oStation.created_by = c.user.id
                oStation.created_date = datetime.now()
            else:
                oStation = s.query(model.Station).get(int(station['id']))
                oStation.updated_by = c.user.id
                oStation.updated_date = datetime.now()
            oStation.name = station['name']
            oStation.ip = station['ip']
            oStation.type = station['type']
            s.save_or_update(oStation)

        for station in delStations:
            oStation = s.query(model.Station).get(int(station['id']))
            oStation.deleted = True
            oStation.deleted_by = c.user.id
            oStation.deleted_date = datetime.now()
            s.save_or_update(oStation)
        s.commit()

    def cancel_receipt(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        receipt_id = int(request.params.get('receipt-id'))
        cancel_reason = request.params.get('cancel-reason')
        oReceipt = s.query(model.ReceiptH).get(receipt_id)

        for ro in oReceipt.receipt_orders:
            ro.order.paid = False
            if ro.order.order_type == 'deposit':
                oReceipt.patient.deposit -= float(oReceipt.receive_amount)
                s.save_or_update(oReceipt.patient)
                ro.order.deleted = True
            s.save_or_update(ro.order)

        if oReceipt.support:
            oReceipt.support.receipt_id = None
            s.save_or_update(oReceipt.support)

        oReceipt.cancelled = True
        oReceipt.cancelled_by = user_id
        oReceipt.cancelled_date = datetime.now()
        oReceipt.cancel_reason = cancel_reason
        s.save_or_update(oReceipt)
        total_cancel_amount = 0
        if oReceipt.sent and oReceipt.sendmoney:
            items = oReceipt.group_receipt_items()
            for item in items:
                si = oReceipt.sendmoney.getSendMoneyItem(item['group_id'])
                if si == None: continue
                cancel_amount = (item['amount'] - item['subsidy'])
                if oReceipt.support:
                    supitem = oReceipt.support.getSupportItem(item['group_id'])
                    cancel_amount -= supitem.support_amount
                si.amount -= cancel_amount
                total_cancel_amount += cancel_amount
                s.save_or_update(si)
            oReceipt.sendmoney.send_amount -= total_cancel_amount
            oReceipt.sendmoney.deposit -= oReceipt.deposit
            oReceipt.sendmoney.discount -= oReceipt.discount
        s.commit()

    def add_item(self):
        s = model.Session()
#        sess_id = request.params.get('id_sess')
#        usersess = s.query(model.UserSession).filter_by(id_sess=sess_id).first()
        user = s.query(model.User).get(session['sr_user_id'])
        item = request.params.get('item')
        unit_id = int(request.params.get('unit_id'))
        group_id = int(request.params.get('group_id'))
        price = float(request.params.get('price'))
        newitem = model.Item()
        newitem.group_id = group_id
        newitem.name = item
        newitem.unit_id = unit_id
        newitem.price = price
        newitem.pay = False if price == 0 else True
        newitem.created_by = user.id
        newitem.created_date = datetime.now()
        s.save(newitem)
        s.commit()
        s.refresh(newitem)
        return str(newitem.id)

    def send_money_page(self):
        station_id = request.params.get('station_id')
        c.station_id = int(station_id) if station_id else -1
        return render('/finance/sendmoney.html')

    def get_send_moneys(self):
        sends = []
        s = model.Session()
        start_date = model.DateUtil.parseDate(request.params.get('start_date'), True)
        end_date = model.DateUtil.parseDate(request.params.get('end_date'), True)
        start_date = model.DateUtil.startOfTheDay(start_date)
        end_date = model.DateUtil.endOfTheDay(end_date)
        station_id = int(request.params.get('station_id'))
        sms = s.query(model.SendMoney).filter(\
                    and_(between(model.SendMoney.send_date, start_date, end_date),\
                         model.SendMoney.station_id==station_id)).all()
        for sm in sms:
            sends.append({
                'id': sm.id,
                'senddate': sm.send_date.strftime('%d/%m/%Y'),
                'sendtime': sm.send_date.strftime('%H:%M'),
                'amount':float(sm.send_amount),
                'start_receipt':sm.start_receipt,
                'end_receipt':sm.end_receipt,
                'patient_count':sm.patient_count
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'send_money':sends})

    def get_send_money_items(self):
        items = []
        s = model.Session()
        send_id = int(request.params.get('send_id'))
        smItems = s.query(model.SendMoneyItem).filter_by(send_money_id=send_id).all()
        for i in smItems:
            items.append({
                'item': i.group.name,
                'amount': float(i.amount)
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'items':items})

    def send_money(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        station_id = int(request.params.get('station_id'))
        start_receipt = ''
        end_receipt = ''
        receipts = s.query(model.ReceiptH).filter_by(cancelled=False, sent=False, station_id=station_id).\
            filter(model.ReceiptH.code!=None).all()
        count = 0
        if len(receipts) == 0:
            return 'NO RECEIPTS'
        receiptids = []
        deposit = 0
        discount = 0
        send_money = model.SendMoney()
        for receipt in receipts:
            receiptids.append(receipt.id)
            deposit += receipt.deposit
            discount += receipt.discount
            receipt.sent = True
            receipt.sendmoney = send_money
            s.save_or_update(receipt)
            if count == 0:
                start_receipt = receipt.code
            if count == len(receipts) - 1:
                end_receipt = receipt.code
            count += 1
        receipt_items = model.ReceiptH.unsent_items(s, station_id)
        patient_count = model.ReceiptH.getPatientCount(s, receiptids)

        send_money.send_date = datetime.now()
        send_money.station_id = station_id
        send_money.start_receipt = start_receipt
        send_money.end_receipt = end_receipt
        send_money.deposit = deposit
        send_money.discount = discount
        send_money.patient_count = patient_count
        send_money.created_by = user_id
        send_money.created_date = datetime.now()
        amount = 0
        for ri in receipt_items:
            support_amount = model.SocialSupport.get_unsent_support(s, receiptids, ri['group_id'])
            if not support_amount:
                support_amount = 0
            if ri['amount'] - ri['subsidy'] - support_amount <= 0: continue
            send_money_item = model.SendMoneyItem()
            send_money_item.send_money = send_money
            send_money_item.group_id = ri['group_id']
            send_money_item.amount = ri['amount'] - ri['subsidy'] - support_amount
            s.save_or_update(send_money_item)
            amount += send_money_item.amount

        send_money.send_amount = amount - discount - deposit
        s.save_or_update(send_money)
        s.commit()
        response.headers['content-type'] = 'text/plain'
        return 'SUCCESS'

    def add_free_item(self):
        user_id = session.get("sr_user_id")
        s = model.Session()
        user = s.query(model.User).get(user_id)
        item_name = request.params.get('item_name')
        ipd = True if request.params.get('ipd') == 'true' else False
        oItem = model.Item()
        oItem.deleted = False
        oItem.created_by = user.id
        oItem.created_date = datetime.now()
        oItem.name = item_name.strip()
        oItem.group_id = model.ItemGroup.FreeId
        oItem.unit_id = model.ItemUnit.DEFAULT_ID
        oItem.price = 0
        oItem.special = False
        oItem.pay = False
        oItem.ipd = ipd
        s.save_or_update(oItem)
        s.commit()
        return 'true'

    def confirm_priv_page(self):
        s = model.Session()
        c.pa_id = int(request.params.get('pa_id'))
        visit = s.query(model.Visit).filter_by(id_patient=c.pa_id, time_toclose=None).first()
        c.vn_id = visit.id if visit else -1
        c.qcalled = request.params.get('qcalled')
        c.qcalled = c.qcalled if c.qcalled else False
        c.privileges = model.Privilege.all(s)
        return render('/finance/confirmpriv.html')

    def get_confirm_privilege(self):
        s = model.Session()
        vn_id = int(request.params.get('vn_id'))
        v = s.query(model.Visit).get(vn_id)
        response.headers['content-type'] = 'text/plain'
        if(not v):
            return simplejson.dumps({
                    'an':'', 'people_number':'', 'prcard_id':'',
                    'refer_no':'', 'refer_date':'', 'refer_hosp':'',
                    'claim_code':'', 'claim_date':'', 'claim_person':''
                    })
        info = {
            'an': v.an,
            'people_number': stringornone(v.patient.pa_people_number),
            'prcard_id': stringornone(v.prcard_id),
            'refer_no': stringornone(v.refer_no),
            'refer_date': model.DateUtil.toShortFormatDate(v.refer_date),
            'refer_hosp': stringornone(v.refer_hosp),
            'claim_code': stringornone(v.claim_code),
            'claim_date':model.DateUtil.toShortFormatDate(v.claim_date),
            'claim_person': stringornone(v.claim_person),
            'birth_date': model.DateUtil.toShortFormatDate(v.patient.pa_birthdate) if v.patient.pa_birthdate else '',
            'admit_date': model.DateUtil.toShortFormatDate(v.admit_main.ad_date) if v.admit_main else ''
        }
        admit = s.query(model.AdmitMain).filter_by(an=v.an).first()
        if(admit and not admit.privilege_confirm):
            user_id = session["sr_user_id"]
            user = s.query(model.User).get(user_id)
            if(user):
                info['claim_person'] = user.fullname
        return simplejson.dumps(info)

    def confirm_privilege(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        user = s.query(model.User).get(user_id)
        vn_id = int(request.params.get('vn_id'))
        v = s.query(model.Visit).get(vn_id)
        v.privilege_id = int(request.params.get('selectPriv'))
        v.prcard_id = request.params.get('cardno')
        v.refer_no = request.params.get('referno')
        v.refer_date = model.DateUtil.parseDate(request.params.get('referdate'), True)
        v.refer_hosp = request.params.get('referhosp')
        v.claim_code = request.params.get('claimcode')
        v.claim_date = model.DateUtil.parseDate(request.params.get('claimdate'), True)
        v.claim_person = request.params.get('claimperson')
        admit = s.query(model.AdmitMain).filter_by(an=v.an).first()
        admit.privilege_confirm = True
        s.update(admit)
        s.update(v)
        s.commit()

    def lab_page(self):
        user_id = session.get("sr_user_id")
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.pa_id = int(request.params.get('pa_id'))
        c.visits = s.query(model.Visit).filter_by(id_patient=c.pa_id).first()
        return render('/finance/lab.html')

    def get_labs(self):
        results = {}
        pa_id = int(request.params.get('pa_id'))
        s = model.Session()
        visits = []
        user_id = session.get("sr_user_id")
        c.user = s.query(model.User).get(user_id) if user_id else None
        visits = s.query(model.Visit).select_from(model.visit_tb.\
                    join(model.neural_order_tb, model.visit_tb.c.id==model.neural_order_tb.c.vn_id)).\
                    filter(model.NeuralOrder.order_type=='lab').filter(model.Visit.id_patient==pa_id).\
                    filter(model.NeuralOrder.deleted==False).\
                    order_by(model.Visit.time_add.desc()).all()
        data = []
        for v in visits:
            data.append({
                'id':v.id,
                'vn':v.vn,
                'time_add':v.time_add.strftime('%d/%m/%Y'),
                'patient_type':'ผู้ป่วยใน' if v.an else 'ผู้ป่วยนอก',
                'privilege':v.privilege.name,
            })
        results['labs'] = data
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)

    def restore_page(self):
        user_id = session.get("sr_user_id")
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.pa_id = int(request.params.get('pa_id'))
        c.visit = s.query(model.Visit).filter_by(id_patient=c.pa_id).first()
        return render('/finance/restore.html')

    def get_restores(self):
        results = {}
        pa_id = int(request.params.get('pa_id'))
        s = model.Session()
        visits = []
        user_id = session.get("sr_user_id")
        c.user = s.query(model.User).get(user_id) if user_id else None
        visits = s.query(model.Visit).select_from(model.visit_tb.\
                    join(model.neural_order_tb, model.visit_tb.c.id==model.neural_order_tb.c.vn_id).\
                    join(model.neural_order_item_tb, model.neural_order_item_tb.c.order_id==model.neural_order_tb.c.id).\
                    join(model.neural_record_tb, model.neural_record_tb.c.order_item_id==model.neural_order_item_tb.c.id).\
                    join(model.item_tb, model.neural_order_item_tb.c.item_id==model.item_tb.c.id)).\
                    filter(model.Item.group_id==30).filter(model.Visit.id_patient==pa_id).\
                    filter(model.NeuralOrder.deleted==False).\
                    order_by(model.Visit.time_add.desc()).all()
        data = []
        for v in visits:
            data.append({
                'id':v.id,
                'vn':v.vn,
                'time_add':v.time_add.strftime('%d/%m/%Y'),
                'patient_type':'ผู้ป่วยใน' if v.an else 'ผู้ป่วยนอก',
                'privilege':v.privilege.name,
            })
        results['restores'] = data
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)

    def item_page(self):
        user_id = session.get("sr_user_id")
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.pa_id = int(request.params.get('pa_id'))
        c.visit = s.query(model.Visit).filter_by(id_patient=c.pa_id).first()
        return render('/finance/item.html')

    def get_print_items(self):
        results = {}
        pa_id = int(request.params.get('pa_id'))
        s = model.Session()
        visits = []
        user_id = session.get("sr_user_id")
        c.user = s.query(model.User).get(user_id) if user_id else None
        visits = s.query(model.Visit).filter_by(id_patient=pa_id, an=None).\
                    order_by(model.Visit.time_add.desc()).all()
        data = []
        for v in visits:
            data.append({
                'id':v.id,
                'vn':v.vn,
                'time_add':v.time_add.strftime('%d/%m/%Y'),
                'patient_type':'ผู้ป่วยใน' if v.an else 'ผู้ป่วยนอก',
                'privilege':v.privilege.name,
            })
        results['restores'] = data
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)

    def check_visit_orders(self):
        return render('/finance/check-visit-orders.html')

    def get_visit_orders(self):
        s = model.Session()

        d = datetime.now()
        stmt = select([model.Visit.id, model.Visit.vn, model.Visit.time_add, model.Visit.hn,\
                       model.Patient.pa_pre_name, model.Patient.pa_name, model.Patient.pa_lastname], \
               (model.Visit.an==None) & (between(model.Visit.time_add, model.DateUtil.startOfTheDay(d), model.DateUtil.startOfTheDay(d))) & \
               (model.NeuralOrder.id==None) & (model.Visit.closed==False), \
               from_obj=[outerjoin(model.Visit, model.NeuralOrder,\
                    (model.Visit.id==model.NeuralOrder.vn_id) &
                    (model.NeuralOrder.order_type=='visit') &
                    (model.NeuralOrder.deleted==False))\
                    .join(model.Patient, model.Visit.id_patient==model.Patient.id)]).distinct()

        rs = stmt.execute()
        visits = rs.fetchall()
        data = []
        results = {}
        for v in visits:
            data.append({
                'id':v.id,
                'vn':v.vn,
                'time_add':v.time_add.strftime('%d/%m/%Y'),
                'hn': v.hn,
                'name':v.pa_pre_name + v.pa_name + ' ' + v.pa_lastname,
            })
        results['data'] = data
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(results)
