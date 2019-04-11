from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1552532458.4518161
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/ps/edit_treatment_followup.html'
_template_uri='/ps/edit_treatment_followup.html'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        h = context.get('h', UNDEFINED)
        c = context.get('c', UNDEFINED)
        session = context.get('session', UNDEFINED)
        # SOURCE LINE 2
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html style="background-color:#edf5ff">\n<head>\n    <title>')
        # SOURCE LINE 6
        context.write(unicode(session['sr_component'].com_name))
        context.write(u'</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js" ></script>\n    <script type="text/javascript" src="')
        # SOURCE LINE 9
        context.write(unicode(h.url_for('/js/ps/edit-treatment-followup.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/page.css" >\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n            <div class="toolbar_pane">\n                <input type="button" id="btnSave" value="\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01">   \n                <input type="button" id="btnCancel" value="\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01">\n            </div>\n            <div id="form-data">\n            \t<input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 23
        context.write(unicode(c.pa_id))
        context.write(u'">\n            \t<input type="hidden" id="vn_id" name="vn_id" value="')
        # SOURCE LINE 24
        context.write(unicode(c.vn_id))
        context.write(u'">\n            \t<input type="hidden" id="ar_id" name="ar_id" value="')
        # SOURCE LINE 25
        context.write(unicode(c.ar_id))
        context.write(u'">\n\t\t\t\t\n\t\t\t\t<label>\u0e01\u0e32\u0e23\u0e15\u0e34\u0e14\u0e15\u0e32\u0e21\u0e1c\u0e25\u0e2b\u0e25\u0e31\u0e07\u0e01\u0e32\u0e23\u0e1a\u0e33\u0e1a\u0e31\u0e14</label><br><br>\n\t\t\t\t<label>\u0e04\u0e23\u0e31\u0e49\u0e07\u0e17\u0e35\u0e48 : <input type="textbox" name="followup_no" value="')
        # SOURCE LINE 28
        context.write(unicode(c.no))
        context.write(u'"></input></label><br><br>\n')
        # SOURCE LINE 29
        for f in c.followups:
            # SOURCE LINE 30
            context.write(u'\t\t\t\t\t<span class="indent">\n\t\t\t\t\t\t<input type="checkbox" name="followups" value="')
            # SOURCE LINE 31
            context.write(unicode(f.id))
            context.write(u'">')
            context.write(unicode(f.description))
            context.write(u'\n\t\t\t\t\t</span><br>\n')
        # SOURCE LINE 34
        context.write(u'\t\t\t\t<br><br>\n            </div>\n        </form>\n    </div>\n    <div id="footer">\n    </div>\n    <div id="dlg-delete"></div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


