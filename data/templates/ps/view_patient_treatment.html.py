from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1552530510.418273
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/ps/view_patient_treatment.html'
_template_uri='/ps/view_patient_treatment.html'
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
        context.write(unicode(h.url_for('/js/ps/edit-patient-treatment.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/page.css" >\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n            <div class="toolbar_pane">\n                <a href="')
        # SOURCE LINE 19
        context.write(unicode(h.url_for('/psychosocial/assessment')))
        context.write(u'?pa_id=')
        context.write(unicode(c.pa_id))
        context.write(u'&vn_id=')
        context.write(unicode(c.vn_id))
        context.write(u'">\u0e01\u0e25\u0e31\u0e1a</a>\n            </div>\n            <div id="form-data">\n            \t<input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 22
        context.write(unicode(c.pa_id))
        context.write(u'">\n            \t<input type="hidden" id="vn_id" name="vn_id" value="')
        # SOURCE LINE 23
        context.write(unicode(c.vn_id))
        context.write(u'">\n            \t<input type="hidden" id="ar_id" name="ar_id" value="')
        # SOURCE LINE 24
        context.write(unicode(c.ar_id))
        context.write(u'">\n\t\t\t\t\n\t\t\t\t<label>\u0e01\u0e32\u0e23\u0e40\u0e02\u0e49\u0e32\u0e23\u0e31\u0e1a\u0e01\u0e32\u0e23\u0e1a\u0e33\u0e1a\u0e31\u0e14</label><br><br>\n\t\t\t\t<div class="indent">\n\t\t\t\t')
        # SOURCE LINE 28
        n = 1 
        
        __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['n'] if __M_key in locals()]))
        context.write(u'\n')
        # SOURCE LINE 29
        for pt in c.pts:
            # SOURCE LINE 30
            context.write(u'\t\t\t\t\t<label>\u0e04\u0e23\u0e31\u0e49\u0e07\u0e17\u0e35\u0e48 ')
            context.write(unicode(n))
            context.write(u' \u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 ')
            context.write(unicode(c.date_util.toShortFormatDate(pt.treatment_date)))
            context.write(u'</label>\n\t\t\t\t\t<span class="indent">\n\t\t\t\t\t\t<ul>\n')
            # SOURCE LINE 33
            for t in pt.treatments:
                # SOURCE LINE 34
                context.write(u'\t\t\t\t\t\t\t<li>')
                context.write(unicode(t.method.description))
                context.write(u'</li>\n')
            # SOURCE LINE 36
            context.write(u'\t\t\t\t\t\t</ul>\n\t\t\t\t\t</span>\n\t\t\t\t\t')
            # SOURCE LINE 38
            n = n+1 
            
            __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['n'] if __M_key in locals()]))
            context.write(u'\n')
        # SOURCE LINE 40
        context.write(u'\t\t\t\t</div><br>\n            </div>\n        </form>\n    </div>\n    <div id="footer">\n    </div>\n    <div id="dlg-delete"></div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


