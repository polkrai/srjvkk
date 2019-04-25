from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553486948.852109
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/check-visit-orders.html'
_template_uri='/finance/check-visit-orders.html'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        h = context.get('h', UNDEFINED)
        # SOURCE LINE 2
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html style="background-color:#edf5ff">\n<head>\n    <title>\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js" ></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n    <link rel="stylesheet" type="text/css" href="/yui/grids/grids-min.css"> \n    <script type="text/javascript" src="')
        # SOURCE LINE 11
        context.write(unicode(h.url_for('/js/finance/check-visit-orders.js')))
        context.write(u'"></script>\n    \n</head>\n<body class="yui-skin-sam" style="text-align: left;">\n    <div id="header_pane">\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n            <div id="toolbar_pane" class="toolbar_pane" >\n            \t<input type="button" id="btnShow" value="\u0e41\u0e2a\u0e14\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25"></input>\n            \t<input type="button" id="btnAddVisitOrder" value="\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e04\u0e48\u0e32\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e17\u0e32\u0e07\u0e01\u0e32\u0e23\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e17\u0e35\u0e48\u0e40\u0e25\u0e37\u0e2d\u0e01"></input>\n            </div>\n\n           \t<div style="height:40px"></div>\n            <input type="hidden" id="vn_id" name="vn_id">\n            <div id="visit-table" style="margin:10px"></div>\n        </form>\n    </div>\n    <div id="footer">\n    </div>\n    \n    <div id="dlgDelete"></div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


