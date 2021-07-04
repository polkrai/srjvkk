# -*- encoding: utf-8 -*-

"""The base Controller API

Provides the BaseController class for subclassing, and other objects
utilized by Controllers.
"""
from pylons import c, cache, config, g, request, response, session
from pylons.controllers import WSGIController
from pylons.controllers.util import abort, etag_cache, redirect_to
from pylons.decorators import jsonify, validate
from pylons.i18n import _, ungettext, N_
from pylons.templating import render
from datetime import datetime, date

from sqlalchemy.orm import eagerload
from sqlalchemy import and_

import srjvkk.lib.helpers as h
import srjvkk.model as model
import time
import math

class BaseController(WSGIController):

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        try:
            config['pylons.g'].loginurl = 'http://' + environ['HTTP_HOST'] + config['jvkk.login.url']
            return WSGIController.__call__(self, environ, start_response)
        finally:
            model.Session.close()
            model.Session.remove()

def try_commit(session):
    try:
        session.commit()
        return True
    except:
        session.rollback()
        return False

def check_session(request, websession, dbsession):
    id_sess = websession.get('sr_session_id', '')
    #id_sess = request.params.get('id_sess', '')
    if(id_sess == ""):
        #return False
        #try retreive user from session table
        id_sess = request.params.get('id_sess', '')
        if id_sess == '': return False
        sess = dbsession.query(model.UserSession).filter_by(id_sess=id_sess).first()
    else:
        sess = dbsession.query(model.UserSession).filter_by(id_sess=id_sess).first()
    if(sess is None): 
        return False
    curtime = unix_time(datetime.now())
    if(curtime > float(sess.session_time_expire)): return False
    clientip = ipaddress(request)
    if(sess.session_ip_address != clientip): return False
    
    #dbsession.execute(model.session_tb.delete(and_(model.session_tb.c.session_user_id==sess.session_user_id,
    #    model.session_tb.c.id_sess!=id_sess)))
    #dbsession.commit()
    
    websession['sr_user_id'] = sess.session_user_id
    websession['sr_session_id'] = sess.id_sess
    websession['sr_client_ip'] = sess.session_ip_address
    #websession['sr_client_id'] = sess.session_ip_address
    websession.save()
    
    return True
    
def unix_time(t):
    return time.mktime(t.timetuple())
    
def date_from_string(dstr, sep):
    dstr = str.split(str(dstr), sep)
    return date(int(dstr[2]), int(dstr[1]), int(dstr[0]))

def ipaddress(request):
    clientip = request.environ.get("X_FORWARDED_FOR", None)
    if not clientip: clientip = request.environ.get("HTTP_X_FORWARDED_FOR", None)
    if not clientip: clientip = request.environ["REMOTE_ADDR"]
    return clientip

def stringornone(str):
    return str if str else '' #'''u'ไม่ทราบ'''

def actions(s):
    components = s.query(model.Component).options(eagerload("modules")).filter_by(com_status='1').all()
    results = []
    for comp in components:
        for m in comp.modules:
            results.append({'cname': comp.com_name, 'c_id': comp.id, 'mname':m.mod_title, 'm_id': m.id})
    return results

def mark_delete(modelobj, user_id):
    modelobj.deleted = True
    modelobj.deleted_by = user_id
    modelobj.deleted_date = datetime.now()

def mark_time(modelobj, user_id):
    """Mark create time if created_time is not yet set,
         else mark update time"""
    if modelobj.created_date:
        modelobj.created_date = datetime.now()
        modelobj.created_by = user_id
    else:
        modelobj.updated_date = datetime.now()
        modelobj.updated_by = user_id
        
def float_format(num):
    return "%.2f" % num
    
def number_format(num, places=0):
   """Format a number with grouped thousands and given decimal places"""
   places = max(0,places)
   tmp = "%.*f" % (places, num)
   point = tmp.find(".")
   integer = (point == -1) and tmp or tmp[:point]
   decimal = (point != -1) and tmp[point:] or ""

   count =  0
   formatted = []
   for i in range(len(integer), 0, -1):
       count += 1
       formatted.append(integer[i - 1])
       if count % 3 == 0 and i - 1:
           formatted.append(",")

   integer = "".join(formatted[::-1])
   return integer+decimal 

class ThaiNum(object):
    @staticmethod
    def sayMoney(number):
            prefix = ""
            if (number < 0):
                prefix = u"ลบ"
                number = -number
            number = round(number, 2)
            text = ""
            baht = int(number)
            satang = int((number - int(number)) * 100)
            text += ThaiNum.sayInt(baht) + u"บาท"
            if (satang > 0): text += ThaiNum.sayInt(satang) + u"สตางค์"
            else: text += u"ถ้วน"
            return prefix + text
            
    @staticmethod
    def sayPosition(n):
        np = n % 6
        if np == 1: return u"สิบ"
        if np == 2: return u"ร้อย"
        if np == 3: return u"พัน"
        if np == 4: return u"หมื่น"
        if np == 5: return u"แสน"
        return ""

    g_digits = [ u"ศูนย์", u"หนึ่ง", u"สอง", u"สาม", u"สี่",  u"ห้า", u"หก", u"เจ็ด", u"แปด", u"เก้า"]
    
    @staticmethod
    def sayDigit(number):
        return ThaiNum.g_digits[number]
    
    @staticmethod
    def sayPlace(number, position, digitCount):
        if (digitCount == 1): return ThaiNum.sayDigit(number)
        if (number == 0): return ""
        if (position % 6 == 0 and position + 1 < digitCount and number == 1): return u"เอ็ด"
        if (position % 6 == 1 and number == 1): return u"สิบ"
        if (position % 6 == 1 and number == 2): return u"ยี่สิบ"
        return ThaiNum.sayDigit(number) + ThaiNum.sayPosition(position)
    
    
    @staticmethod
    def sayInt(integer):
        text = ""
        if integer == 0:
            return u"ศูนย์"
        minus = integer < 0
        abs(integer)
        digitCount = int(math.log10(integer)) + 1
        position = 0
        def do_each_digit(integer):
            value = integer % 10
            str = ThaiNum.sayPlace(value, position, digitCount)
            if(position % 6 == 0):
                millionCount = int(position / 6)
                for i in range(millionCount):
                    str += u"ล้าน"
            return str
        text = do_each_digit(integer) + text
        integer = int(integer / 10)
        position += 1
        while (position < digitCount):
            text = do_each_digit(integer) + text
            integer = int(integer / 10)
            position += 1
        if (minus): text = u"ลบ" + text
        return text
    

# Include the '_' function in the public names
__all__ = [__name for __name in locals().keys() if not __name.startswith('_') or __name == '_']
