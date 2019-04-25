from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553486948.391458
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/payment-history.html'
_template_uri='/finance/payment-history.html'
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
        context.write(unicode(h.url_for('/js/finance/payment-history.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n        \t<input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 18
        context.write(unicode(c.pa_id))
        context.write(u'" />\n          \t<input type="hidden" id="qcalled" name="qcalled" value="')
        # SOURCE LINE 19
        context.write(unicode(c.qcalled))
        context.write(u'" />\n          \t<input type="hidden" id="station_id" name="station_id" value="-1" />\n          \t<input type="hidden" id="vn_id" name="vn_id" value="')
        # SOURCE LINE 21
        context.write(unicode(c.vn_id))
        context.write(u'" />\n          \t<input type="hidden" id="cancel-reason" name="cancel-reason" value="" />\n          \t<input type="hidden" id="receipt-id" name="receipt-id" />\n        </form>\n        <div id="toolbar_pane" class="toolbar_pane">\n        \t<input type="button" id="btnPrint" value="\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08"></input>\n        \t<input type="button" id="btnCancelReceipt" value="\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08"></input>\n        </div>\n        <div style="height:40px"></div>\n        <div id="data">\n        \t\n        \t<p style="font-size:18px;font-weight:bold">\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19</p>\n        \t<input id="txt-search" name="txt-search" type="text">\n        \t<input id="btn-search" name="btn-search" type="button" value="\u0e04\u0e49\u0e19\u0e2b\u0e32">\n            <div id="payment_history" style="margin:5px"></div>\n                   \n            <p style="font-size:18px;font-weight:bold">\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e04\u0e48\u0e32\u0e43\u0e0a\u0e49\u0e08\u0e48\u0e32\u0e22</p>                      \n            <div id="payment_history_item" style="margin:5px"></div>\n        </div>   \n        <div id="dlg-input">\n    \t\t<div id="dlg-inp-hd" class="hd"></div>\n      \t\t<div class="bd">\n\t\t\t\t<label id="dlg-inp-msg"></label>\n\t\t\t\t<input id="dlg-inp-value" type="text">\n     \t\t</div>\n\t\t</div>\n    </div>\n    <div id="footer">\n    </div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


