# -*- coding: utf-8 -*-
import logging

from srjvkk.lib.base import *
import simplejson
log = logging.getLogger(__name__)
import srutil
from datetime import datetime, timedelta
from sqlalchemy.sql import and_, or_, not_, func

class PsycoController(BaseController):
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
            if not srutil.check_session(request, session, model.Session()):
                action = request.environ.get('PATH_INFO').split('/')[-1]
                if action not in ['get_result', 'test_result', 'cure_result', 'get_used_tools',
                                  'get_req_test_reason', 'get_req_test_item']:
                    session.clear()
                    session.save()
                    return redirect_to(config['pylons.g'].loginurl)
                
    def index(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        c.sendcoms = model.Component.sendcoms(s)
        c.id_sess = session['sr_session_id']
        c.com_id = model.Component.PsycoId
        return render('/psyco.html')
    
    def done_test(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        done_tests = simplejson.loads(request.params.get('done_tests'))
        for test in done_tests:
            order_item = s.query(model.NeuralOrderItem).get(int(test['id']))
            if (order_item.record):
                continue
            rec = model.NeuralRecord()
            rec.order_item_id = int(test['id'])
            rec.vn_id = vn_id
            rec.qty = int(test['qty'])
            rec.price = float(test['price'])
            rec.paid = False
            rec.deleted = False
            s.save_or_update(rec)
            
    def delete_reqtest(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        del_orders = simplejson.loads(request.params.get('del-orders'))
        for order in del_orders:
            order = s.query(model.NeuralOrder).get(int(order['id']))
            order.deleted = True
            order.deleted_by = user_id
            order.deleted_date = datetime.now()
            s.save_or_update(order)
        
        s.commit();
        
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'response':{'error':False}})
            
    def save_reqtest(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        pa_id = int(request.params.get('pa_id'))
        vn_id = int(request.params.get('vn_id'))
        req_id = int(request.params.get('order-id'))
        remark = request.params.get('remark')
        order_date = datetime.now()
        order_done = True if request.params.get('order-done') == "true" else False
        
#        del_orders = simplejson.loads(request.params.get('del-orders'))
#        for order in del_orders:
#            order = s.query(model.NeuralOrder).get(int(order['id']))
#            order.deleted = True
#            order.deleted_by = user_id
#            order.deleted_date = datetime.now()
#            s.save_or_update(order)
        
        req = s.query(model.NeuralOrder).get(req_id)
        if (req == None):
            req = model.NeuralOrder()
            req.order_date = order_date
            req.order_type = model.NeuralOrder.PsycoTestType
            req.vn_id = vn_id
            req.pa_id = pa_id
        
        #model.DateUtil.parseDate(order_date, False)
        req.user_id = user_id
        req.remark = remark
        req.stop = order_done
        s.save_or_update(req);
        
        tests = simplejson.loads(request.params.get('tests'))
        for test in tests:
            item = model.NeuralOrderItem()
            item.type = model.NeuralOrder.PsycoTestType
            item.item_id = int(test['item_id'])
            item.unit_id = int(test['unit_id'])
            item.qty = int(test['qty'])
            item.price = float(test['price'])
            item.order = req
            item.start_date = datetime.now()
            item.end_date = item.start_date
            item.date_add = item.start_date
            item.frequency = 0
            item.vn_id = vn_id
            item.user_id = user_id
            item.med_status = 0
            item.drug_status = 0
            item.check_start_date = item.start_date
            item.check_end_date = item.start_date
            s.save_or_update(item)
            if test['done']:
                rec = model.NeuralRecord()
                rec.order_item = item
                rec.vn_id = vn_id
                rec.qty = item.qty
                rec.price = item.price
                rec.paid = False
                rec.deleted = False
                s.save_or_update(rec)
        
        done_tests = simplejson.loads(request.params.get('done_tests'))
        for test in done_tests:
            order_item = s.query(model.NeuralOrderItem).get(int(test['id']))
            if (len(order_item.records) > 0):
                continue
            rec = model.NeuralRecord()
            rec.order_item_id = int(test['id'])
            rec.vn_id = vn_id
            rec.qty = int(test['qty'])
            rec.price = float(test['price'])
            rec.paid = False
            rec.deleted = False
            s.save_or_update(rec)

        del_tests = simplejson.loads(request.params.get('del_tests'))
        for test in del_tests:
            item = s.query(model.NeuralOrderItem).get(int(test['id']))
            item.deleted = True
            item.deleted_by = user_id
            item.deleted_date = datetime.now()
            s.save_or_update(item)
        
        
#        reasons = simplejson.loads(request.params.get('reasons'))
#        for reason in reasons:
#            oReason = model.PsycoReqTestReason()
#            if reason['id'] == -1:
#                oReason.updated_by = user_id
#                oReason.updated_date = order_date
#            else:
#                oReason = s.query(model.PsycoReqTestReason).get(int(reason['id']))
#                oReason.updated_by = user_id
#                oReason.updated_date = datetime.now()
#            
#            oReason.order = req
#            oReason.reason_id = int(reason['reason_id'])
#            oReason.remark = reason['remark']
#            s.save_or_update(oReason)
#        
#        del_reasons = simplejson.loads(request.params.get('del_reasons'))
#        for reason in del_reasons:
#            oReason = s.query(model.PsycoReqTestReason).get(int(reason['id']))
#            oReason.deleted = True
#            oReason.deleted_by = user_id
#            oReason.deleted_date = datetime.now()
#            s.save_or_update(oReason)
            
        s.commit()
        s.refresh(req);
        return str(req.id);
    
    def test_result(self):
        user_id = session.get("sr_user_id")
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.qcalled = request.params.get('qcalled')
        c.vn_id = request.params.get('vn_id')
        c.vn_id = int(c.vn_id) if c.vn_id else -1
        c.order_id = int(request.params.get('order_id'))
        
        visit = s.query(model.Visit).get(c.vn_id)
        c.vn = visit.vn if visit != None else ''
        c.pa_id = visit.id_patient if visit != None else -1
        order = s.query(model.NeuralOrder).get(c.order_id)
        c.result_type = model.PsycoTestResult.TYPE_TEST
        
        c.test_result = s.query(model.PsycoTestResult).filter_by(order_id=c.order_id, type=model.PsycoTestResult.TYPE_TEST).first()
        if c.test_result == None:        
            c.test_result = model.PsycoTestResult()
            c.test_result.order_id = c.order_id

        tools = s.query(model.PsycoTool).all()
        c.item_tools = tools
        c.req_reason = order.remark if order else ''
        c.req_person = order.user.name + ' ' + order.user.lastname if order and order.user else ''
        #sess_id = session['sr_session_id']
        sess_id = request.params.get('id_sess', '')
        usersess = s.query(model.UserSession).filter_by(id_sess=sess_id).first()
        c.editable = False
        if usersess:
            c.editable = usersess.editable_page(s, model.Component.PsycoId)
        if session.get('sr_session_id') == 'dummysessionvalue':
            c.editable = True
        return render('/psyco/testresult.html')
    
    def cure_result(self):
        user_id = session.get("sr_user_id")
        s = model.Session()
        c.user = s.query(model.User).get(user_id) if user_id else None
        c.qcalled = request.params.get('qcalled')
        c.vn_id = request.params.get('vn_id')
        c.vn_id = int(c.vn_id) if c.vn_id else -1
        c.order_id = int(request.params.get('order_id'))
        visit = s.query(model.Visit).get(c.vn_id)
        c.vn = visit.vn if visit != None else ''
        c.pa_id = visit.id_patient if visit != None else -1
        order = s.query(model.NeuralOrder).get(c.order_id)
        c.result_type = model.PsycoTestResult.TYPE_CURE
        
        c.test_result = s.query(model.PsycoTestResult).filter_by(order_id=c.order_id, type=model.PsycoTestResult.TYPE_CURE).first()
        if c.test_result == None:        
            c.test_result = model.PsycoTestResult()
            c.test_result.order_id = c.order_id
        tools = s.query(model.PsycoTool).all()
        c.item_tools = tools
        c.req_reason = order.remark if order else ''
        c.req_person = order.user.name + ' ' + order.user.lastname if order else ''
        
        #sess_id = session['sr_session_id']
        sess_id = request.params.get('id_sess', '')
        usersess = s.query(model.UserSession).filter_by(id_sess=sess_id).first()
        c.editable = False
        if usersess:
            c.editable = usersess.editable_page(s, model.Component.PsycoId)
        if session.get('sr_session_id') == 'dummysessionvalue':
            c.editable = True
        return render('/psyco/cureresult.html')

    def get_result(self):
        s = model.Session()
        order_id = int(request.params.get('order_id'))
        order = s.query(model.NeuralOrder).get(order_id)
        result_type = request.params.get('result_type')
        test_result = s.query(model.PsycoTestResult).\
            filter_by(order_id=order_id, type=result_type).first()
        user = None
        created_date = None
        if test_result and test_result.created_by:
            user = s.query(model.User).get(test_result.created_by)
            created_date = test_result.created_date if test_result.created_date else None
        result = {
            'req_reason': order.remark if order else '',
            'req_person_id':order.user.id if order and order.user else '',
            'req_person': order.user._get_fullname() if order and order.user else '',
            'id': -1,
            'behaviour':'',
            'result':'',
            'conclusion':'',
            'suggestion':'',
            'completed':False,
            'created_by':srutil.stringornone(user.title) + \
                ' ' + srutil.stringornone(user.name) + ' ' + \
                srutil.stringornone(user.lastname) if user else '',
            'created_date':model.DateUtil.toShortFormatDate(created_date) if created_date else ''
        }
        if test_result:        
            result['id'] = test_result.id
            result['behaviour'] = test_result.behaviour,
            result['result'] = test_result.result,
            result['conclusion'] = test_result.conclusion,
            result['suggestion'] = test_result.suggestion,
            result['completed'] = test_result.completed
            
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(result)
    
    def save_result(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        vn_id = int(request.params.get('vn_id'))
        res_id = int(request.params.get('res_id'))
        order_id = int(request.params.get('order_id'))
        result_type = request.params.get('result_type')
        req_person_id = request.params.get('req_person_id')
        req_person_id = None if req_person_id == '' else int(req_person_id)
        
        order = s.query(model.NeuralOrder).get(order_id)
        order.user_id = req_person_id
        s.save_or_update(order)
        completed = request.params.get('completed')
        behaviour = request.params.get('behaviour')
        result = request.params.get('result')
        conclusion = request.params.get('conclusion')
        suggestion = request.params.get('suggestion')
        
        
        reasons = simplejson.loads(request.params.get('reasons'))
        for reason in reasons:
            oReason = model.PsycoReqTestReason()
            if reason['id'] == -1:
                oReason.updated_by = user_id
                oReason.updated_date = datetime.now()
            else:
                oReason = s.query(model.PsycoReqTestReason).get(int(reason['id']))
#                oReason.updated_by = user_id
#                oReason.updated_date = datetime.now()
            
            oReason.order_id = order_id
            oReason.reason_id = int(reason['reason_id'])
            oReason.remark = reason['remark']
            s.save_or_update(oReason)
        
        del_reasons = simplejson.loads(request.params.get('del_reasons'))
        for reason in del_reasons:
            oReason = s.query(model.PsycoReqTestReason).get(int(reason['id']))
            oReason.deleted = True
            oReason.deleted_by = user_id
            oReason.deleted_date = datetime.now()
            s.save_or_update(oReason)
        
        order_done = True if request.params.get('order-done') == "true" else False
        if order_done:
            order.stop = True
            s.save_or_update(order)
        done_tests = simplejson.loads(request.params.get('done-tests'))
        for test in done_tests:
            order_item = s.query(model.NeuralOrderItem).get(int(test['id']))
            if (len(order_item.records) > 0):
                continue
            rec = model.NeuralRecord()
            rec.order_item_id = int(test['id'])
            rec.vn_id = order.vn_id if vn_id == -1 else vn_id
            rec.created_by = user_id
            rec.qty = int(test['qty'])
            rec.price = float(test['price'])
            rec.paid = False
            rec.deleted = False
            s.save_or_update(rec)
        
        if res_id == -1:
            test_result = model.PsycoTestResult()
            test_result.created_by = user_id
            test_result.created_date = datetime.now()
            test_result.deleted = False
        else:
            test_result = s.query(model.PsycoTestResult).get(res_id)
            test_result.updated_by = user_id
            test_result.updated_date = datetime.now()
        
        test_result.order_id = order_id
        test_result.behaviour = behaviour
        test_result.result = result
        test_result.conclusion = conclusion
        test_result.suggestion = suggestion
        test_result.type = result_type
        
        if (completed == "true"):
            test_result.completed = True
        else:
            test_result.completed = False
        
        s.save_or_update(test_result)
        
        tools = simplejson.loads(request.params.get('tools'))
        for tool in tools:
            newTool = model.PsycoTestToolUsed()
            newTool.result = test_result
            newTool.tool_id = int(tool['tool_id'])
            newTool.created_by = user_id
            newTool.created_date = datetime.now()
            newTool.deleted = False
            s.save_or_update(newTool)
            
        delTools = simplejson.loads(request.params.get('del_tools'))
        for tool in delTools:
            oTool = s.query(model.PsycoTestToolUsed).get(int(tool['id']))
            oTool.deleted = True
            oTool.deleted_by = c.user.id
            oTool.deleted_date = datetime.now()
            s.save_or_update(oTool)
        s.commit()
        
        order.psyco_result = test_result
        s.save_or_update(order)
        s.commit()
        s.refresh(test_result)
        return str(test_result.id)
        
    def get_used_tools(self):
        s = model.Session()
        result_id = int(request.params.get("res_id"));
        all_usedtools = s.query(model.PsycoTestToolUsed).filter_by(result_id=result_id, deleted=False).all()
        arr_usedtools = []
        for tool in all_usedtools:
            arr_usedtools.append({
                'id':tool.id,
                'result_id':tool.result_id,
                'tool_id':tool.tool_id,
                'name':tool.tool.name
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'usedtools':arr_usedtools})
        
    def req_test(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        #c.pa_id = int(request.params.get('pa_id'))
        c.qcalled = request.params.get('qcalled')
        c.vn_id = int(request.params.get('vn_id'))
        visit = s.query(model.Visit).get(c.vn_id)
        c.vn = visit.vn if visit != None else ''
        c.pa_id = visit.id_patient if visit != None else -1
        items = s.query(model.Item).filter(model.item_tb.c.group_id==model.ItemGroup.PsycoTestGroupId).all()
        #results = []
        #for item in items:
        #    results.append({'id': item.id, 'name': item.name, 'code':item.item_code})
        c.item_tests = items
        return render('/psyco/reqtest.html')
    
    def get_req_test(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        pa_id = int(request.params.get('pa_id'))
#        orders = s.query(model.NeuralOrder).filter(and_(model.neural_order_tb.c.order_type==model.NeuralOrder.PsycoTestType, model.neural_order_tb.c.pa_id==pa_id)).all()
        orders = s.query(model.NeuralOrder).filter_by(\
                    order_type=model.NeuralOrder.PsycoTestType,\
                    pa_id=pa_id, deleted=False).\
                    order_by(model.neural_order_tb.c.order_date.desc(),\
                             model.neural_order_tb.c.id.desc()).all()
        arr_orders = []
        for order in orders:
            testResult = s.query(model.PsycoTestResult).filter_by(order_id=order.id,\
                            type=model.PsycoTestResult.TYPE_TEST).first()
            cureResult = s.query(model.PsycoTestResult).filter_by(order_id=order.id,\
                            type=model.PsycoTestResult.TYPE_CURE).first()
            arr_orders.append({
                'id':order.id,
                'order_date':order.order_date.strftime('%d/%m/%Y'),
                'result_id':order.psyco_result_id,
                'vn_id':order.vn_id,
                'vn':order.visit.vn,
                'pa_id':order.pa_id,
                'remark':order.remark,
                'stop':order.stop,
                'paid':order.paid,
                'test_complete':True if testResult and testResult.completed else False,
                'cure_complete':True if cureResult and cureResult.completed else False
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'orders':arr_orders})
    
    def get_req_test_d(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        req_id = int(request.params.get('req_id'))
        items = s.query(model.NeuralOrderItem).filter_by(\
                        order_id=req_id, deleted=False).all()
        arr_items = []
        for item in items:
            totalprice = float(item.qty) * float(item.price)
            record = s.query(model.NeuralRecord).filter_by(\
                            order_item_id=item.id).first()
            arr_items.append({
                'id':item.id,
                'item_id':item.item_id,
                'item':item.item.name,
                'unit_id':item.unit_id,
                'unit':item.unit.name,
                'order_id':item.order_id,
                'qty':int(item.qty),
                'price':float(item.price),
                'totalprice':totalprice,
                'done': True if record else False
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'items':arr_items})
    
    def get_psyco_items(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        items = []
        if query:
            items = s.query(model.Item).filter_by(deleted=False).filter(\
                        or_(model.Item.group_id==model.ItemGroup.PsycoTestGroupId, \
                        model.Item.group_id==model.ItemGroup.PsycoCureGroupId, \
						model.Item.group_id==model.ItemGroup.PsySmcGroupId)).\
                        filter(func.lower(model.Item.name).like(str(query.lower().encode('UTF-8')) + '%')).limit(int(limit)).all()
        else:
            items = s.query(model.Item).filter_by(deleted=False).filter(\
                        or_(model.Item.group_id==model.ItemGroup.PsycoTestGroupId, \
                        model.Item.group_id==model.ItemGroup.PsycoCureGroupId, \
						model.Item.group_id==model.ItemGroup.PsySmcGroupId)).limit(int(limit)).all()
        results = []
        for i in items:
            results.append({
                'id': i.id, 
                'name': i.name, 
                'code': i.item_code,
                'unit_id': i.unit_id,
                'unit_name': i.unit.name,
                'price': float(i.price)
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'items':results})
        
    def get_item_detail(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        item_id = int(request.params.get('item_id'))
        item = s.query(model.Item).get(item_id)
        jsonitem = {}
        if item != None:
            jsonitem = {
                'item_id':item.id,
                'item':item.name,
                'price':float(item.price),
                'unit_id':item.unit_id,
                'unit':item.unit.name
            }
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps(jsonitem)
    
    def get_req_test_reason(self):
        s = model.Session()
        order_id = int(request.params.get("order_id"));
        req_reasons = s.query(model.PsycoReqTestReason).filter_by(\
                                    order_id=order_id, deleted=False).all()
        arr_req_reasons = []
        for rs in req_reasons:
            arr_req_reasons.append({
                'id':rs.id,
                'order_id':rs.order_id,
                'reason_id':rs.reason_id,
                'reason':rs.reason.name,
                'remark':rs.remark
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'reasons':arr_req_reasons})
    
    def get_req_test_item(self):
        s = model.Session()
        order_id = int(request.params.get('order_id'))
        items = s.query(model.NeuralOrderItem).filter_by(\
                        order_id=order_id, deleted=False).all()
        arr_items = []
        for item in items:
            totalprice = float(item.qty) * float(item.price)
#            record = s.query(model.NeuralRecord).filter_by(\
#                            order_item_id=item.id).first()
            arr_items.append({
                'id':item.id,
                'item_id':item.item_id,
                'item':item.item.name,
                'unit_id':item.unit_id,
                'unit':item.unit.name,
                'order_id':item.order_id,
                'qty':int(item.qty),
                'price':float(item.price),
                'totalprice':totalprice,
                'done': True if len(item.records) > 0 else False,
                'donedate': item.records[0].created_date.strftime('%d/%m/%Y') if len(item.records) > 0 else ''
            })
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'items':arr_items})
    
    def setup_reason(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        return render('/psyco/setupreason.html') 
    
    def get_reasons(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        reasons = []
        if query:
            reasons = s.query(model.PsycoTestReason).filter_by(deleted=False).\
                filter(func.lower(model.PsycoTestReason.name).like(str(query.lower().encode('UTF-8')) + '%')).limit(int(limit)).all()
        else:
            reasons = model.PsycoTestReason.all(s)
        
        results = []
        for p in reasons:
            results.append({'id': p.id, 'name': p.name})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'reasons':results})
    
    def save_reason(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        reasons = simplejson.loads(request.params.get('reasons'))
        delReasons = simplejson.loads(request.params.get('del-reasons'))
        for reason in reasons:
            oReason = model.PsycoTestReason()
            if reason['id'] == -1:
                oReason.deleted = False
                oReason.created_by = c.user.id
                oReason.created_date = datetime.now()
            else:
                oReason = s.query(model.PsycoTestReason).get(int(reason['id']))
                oReason.updated_by = c.user.id
                oReason.updated_date = datetime.now()
            oReason.name = reason['name']
            s.save_or_update(oReason)
        
        for reason in delReasons:
            oReason = s.query(model.PsycoTestReason).get(int(reason['id']))
            oReason.deleted = True
            oReason.deleted_by = c.user.id
            oReason.deleted_date = datetime.now()
            s.save_or_update(oReason)
        s.commit()
        
    def get_tools(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        limit = request.params.get('limit')
        query = request.params.get('query')
        tools = []
        if query:
            tools = s.query(model.PsycoTool).filter_by(deleted=False).\
                filter(func.lower(model.PsycoTool.name).like(str(query.lower().encode('UTF-8')) + '%')).limit(int(limit)).all()
        else:
            tools = model.PsycoTool.all(s)
        
        results = []
        for p in tools:
            results.append({'id': p.id, 'name': p.name})
        response.headers['content-type'] = 'text/plain'
        return simplejson.dumps({'tools':results})
    
    def setup_tool(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        return render('/psyco/setuptool.html') 
    
    def save_tool(self):
        user_id = session["sr_user_id"]
        s = model.Session()
        c.user = s.query(model.User).get(user_id)
        tools = simplejson.loads(request.params.get('tools'))
        delTools = simplejson.loads(request.params.get('del-tools'))
        for tool in tools:
            oTool = model.PsycoTool()
            if tool['id'] == -1:
                oTool.deleted = False
                oTool.created_by = c.user.id
                oTool.created_date = datetime.now()
            else:
                oTool = s.query(model.PsycoTool).get(int(tool['id']))
                oTool.updated_by = c.user.id
                oTool.updated_date = datetime.now()
            oTool.name = tool['name']
            s.save_or_update(oTool)
        
        for tool in delTools:
            oTool = s.query(model.PsycoTool).get(int(tool['id']))
            oTool.deleted = True
            oTool.deleted_by = c.user.id if c.user else None
            oTool.deleted_date = datetime.now()
            s.save_or_update(oTool)
        s.commit()
        
    def setup_main(self):
        return render('/psyco/setupmain.html')