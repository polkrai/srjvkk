from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1555595708.526
_template_filename='C:\\Apache24\\wsgi\\srjvkk\\srjvkk\\templates/finance/restore.html'
_template_uri='/finance/restore.html'
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
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html style="background-color:#edf5ff">\n<head>\n    <title>\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js" ></script>\n    <script type="text/javascript" src="')
        # SOURCE LINE 9
        context.write(unicode(h.url_for('/js/finance/restore.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n        \t<input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 18
        context.write(unicode(c.pa_id))
        context.write(u'" />\n        </form>\n        \n        <div style="height:40px"></div>\n        <div id="data">\n        \t<p style="font-size:18px;font-weight:bold">\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e40\u0e27\u0e0a\u0e01\u0e23\u0e23\u0e21\u0e1f\u0e37\u0e49\u0e19\u0e1f\u0e39</p>\n            <div id="restore_history" style="margin:5px"></div>\n        </div>   \n\n    </div>\n    <div id="footer">\n    </div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


