import os, sys

# location of the application
sys.path.append('/home/shiftright/wsgi/srjvkk/')

from paste.deploy import loadapp

# location of ini file
application = loadapp('config:/home/shiftright/wsgi/srjvkk/production.ini')