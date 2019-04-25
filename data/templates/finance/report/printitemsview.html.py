from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553487204.554471
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/report/printitemsview.html'
_template_uri='/finance/report/printitemsview.html'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        h = context.get('h', UNDEFINED)
        c = context.get('c', UNDEFINED)
        # SOURCE LINE 2
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html style="background-color:#edf5ff">\n<head>\n    <title>\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js" ></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n    <link rel="stylesheet" type="text/css" href="/yui/grids/grids-min.css"> \n    <script type="text/javascript" src="')
        # SOURCE LINE 11
        context.write(unicode(h.url_for('/js/finance/printlabview.js')))
        context.write(u'"></script>\n    \n</head>\n<body class="yui-skin-sam" style="text-align: left;">\n\t<div id="toolbar_pane" class="toolbar_pane">\n        <input type="button" id="btnPrint" value="\u0e1e\u0e34\u0e21\u0e1e\u0e4c"></input>\n    </div>\n\t<input type="hidden" id="vn_id" value="')
        # SOURCE LINE 18
        context.write(unicode(c.vn_id))
        context.write(u'">\n\t<iframe id="frmprint" name="frmprint" width="100%" height="500px" frameborder="0" src="')
        # SOURCE LINE 19
        context.write(unicode(h.url_for('/financereport/print_items')))
        context.write(u'?vn_id=')
        context.write(unicode(c.vn_id))
        context.write(u'"></iframe>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


