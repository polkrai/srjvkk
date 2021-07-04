"""Pylons environment configuration"""
import os
from pylons import config

import srjvkk.lib.app_globals as app_globals
import srjvkk.lib.helpers
from srjvkk.config.routing import make_map

import sqlalchemy as sa
import sqlalchemy.pool as pool

def load_environment(global_conf, app_conf):
    """Configure the Pylons environment via the ``pylons.config``
    object
    """
    # Pylons paths
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths = dict(root=root, controllers=os.path.join(root, 'controllers'), static_files=os.path.join(root, 'public'), templates=[os.path.join(root, 'templates')])

    # Initialize config with the basic options
    config.init_app(global_conf, app_conf, package='srjvkk', template_engine='mako', paths=paths)

    config['routes.map'] = make_map()
    config['pylons.g'] = app_globals.Globals()
    config['pylons.h'] = srjvkk.lib.helpers

    # Customize templating options via this variable
    tmpl_options = config['buffet.template_options']

    # CONFIGURATION OPTIONS HERE (note: all config options will override
    # any Pylons config options)
    #import psycopg2.extensions
    #psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
    
    config['pylons.g'].sa_engine = sa.engine_from_config(config, 'sqlalchemy.')
    
    #config['pylons.g'].sa_engine.connect().connection.set_client_encoding("utf8")
    engine = config['pylons.g'].sa_engine
    
    from srjvkk import model
    
    model.init_model(config, engine)
    
    import psycopg2 as psycopg
    
    psycopg = pool.manage(psycopg)


