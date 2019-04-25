from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553486948.756104
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/report/reportmain.html'
_template_uri='/finance/report/reportmain.html'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        h = context.get('h', UNDEFINED)
        # SOURCE LINE 2
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html>\n<head>\n    <title>\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js" ></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <ul>\n   \t\t\t<li><a href="')
        # SOURCE LINE 17
        context.write(unicode(h.url_for('/financereport/receipt_page')))
        context.write(u'">\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08</a></li>\n   \t\t\t<li><a href="')
        # SOURCE LINE 18
        context.write(unicode(h.url_for('/financereport/bill_page')))
        context.write(u'">\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e04\u0e48\u0e32\u0e23\u0e31\u0e01\u0e29\u0e32\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25</a></li>\n   \t\t\t<li><a href="')
        # SOURCE LINE 19
        context.write(unicode(h.url_for('/financereport/receipt_summary_page')))
        context.write(u'">\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e01\u0e32\u0e23\u0e43\u0e2b\u0e49\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22</a></li>\n   \t\t\t<li><a href="/miracle/ci_jvkk/index.php/finance/index">\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e01\u0e32\u0e23\u0e43\u0e2b\u0e49\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e17\u0e32\u0e07\u0e01\u0e32\u0e22\u0e20\u0e32\u0e1e\u0e1a\u0e33\u0e1a\u0e31\u0e14\u0e41\u0e25\u0e30\u0e40\u0e27\u0e0a\u0e01\u0e23\u0e23\u0e21\u0e1f\u0e37\u0e49\u0e19\u0e1f\u0e39</a></li>\n   \t\t\t<li><a href="/miracle/billdisp_billtran" target="_blank">\u0e2a\u0e48\u0e07\u0e2d\u0e2d\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e1a\u0e34\u0e01\u0e04\u0e48\u0e32\u0e23\u0e31\u0e01\u0e29\u0e32\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e19\u0e2d\u0e01\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e34\u0e01\u0e32\u0e23\u0e02\u0e49\u0e32\u0e23\u0e32\u0e0a\u0e01\u0e32\u0e23</a></li>\n   \t\t\t<li><a href="/miracle/billdisp_billtran_sso" target="_blank">\u0e2a\u0e48\u0e07\u0e2d\u0e2d\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e1a\u0e34\u0e01\u0e04\u0e48\u0e32\u0e23\u0e31\u0e01\u0e29\u0e32\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e19\u0e2d\u0e01\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c\u0e1c\u0e39\u0e49\u0e1b\u0e23\u0e30\u0e01\u0e31\u0e19\u0e15\u0e19\u0e15\u0e32\u0e21\u0e15\u0e32\u0e21\u0e1e\u0e23\u0e30\u0e23\u0e32\u0e0a\u0e1a\u0e31\u0e0d\u0e0d\u0e31\u0e15\u0e34\u0e1b\u0e23\u0e30\u0e01\u0e31\u0e19\u0e2a\u0e31\u0e07\u0e04\u0e21</a></li>\n   \t\t</ul>\n    </div>\n    <div id="footer">\n    </div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


