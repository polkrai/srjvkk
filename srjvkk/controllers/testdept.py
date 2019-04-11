# -*- encoding: utf-8 -*-
import logging
import simplejson
from srjvkk.lib.base import *

log = logging.getLogger(__name__)

import srutil
from datetime import datetime, timedelta
from sqlalchemy.sql import and_, or_, not_
from math import ceil

class TestdeptController(BaseController):
	
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
		
		session['sr_com'] = 'social'
		session.save()
					
	def index(self):
		user_id = session["sr_user_id"]
		s = model.Session()
		c.user = s.query(model.User).get(user_id)
		c.com_id = model.Component.SocialId
		c.com_name = s.query(model.Component).get(c.com_id).com_name
		return render('/testdept.html')
