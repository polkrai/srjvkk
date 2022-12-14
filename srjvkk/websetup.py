"""Setup the srjvkk application"""
import logging

from paste.deploy import appconfig
from pylons import config

from srjvkk.config.environment import load_environment

log = logging.getLogger(__name__)

def setup_config(command, filename, section, vars):
    """Place any commands to setup onlinecare here"""
    log.info("config with filename %s" % filename)
    conf = appconfig('config:' + filename)
    load_environment(conf.global_conf, conf.local_conf)
    log.info("Creating database tables")
    from srjvkk import model
    model.meta.create_all(bind=model.engine)
    log.info("Finished creating database tables")

