# -*- encoding: utf-8 -*-

"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to both as 'h'.
"""
from webhelpers import *

def stringornone(str):
    return str if str else '' #'''u'ไม่ทราบ'''