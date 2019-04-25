# this is where you point you wsgi script to in mod_wsgi

import os, sys

# location of the application
sys.path.append('C:/Apache24/wsgi/srjvkk/')

from paste.deploy import loadapp

application = loadapp('config:C:/Apache24/wsgi/srjvkk/production.ini')
       