from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1555595703.563
_template_filename='C:\\Apache24\\wsgi\\srjvkk\\srjvkk\\templates/finance/sendmoney.html'
_template_uri='/finance/sendmoney.html'
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
        context.write(unicode(h.url_for('/js/finance/sendmoney.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n   \t<style>\n        #conStartDate .bd:after {content:".";display:block;clear:left;height:0;visibility:hidden;}\n        #conStartDate .bd {padding:0;}\n        #calStartDate {border:none;padding:1em}\n\n        #conEndDate .bd:after {content:".";display:block;clear:left;height:0;visibility:hidden;}\n        #conEndDate .bd {padding:0;}\n        #calEndDate {border:none;padding:1em}\n\n    </style>\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n        \t<input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 28
        context.write(unicode(c.pa_id))
        context.write(u'" />\n          \t<input type="hidden" id="qcalled" name="qcalled" value="')
        # SOURCE LINE 29
        context.write(unicode(c.qcalled))
        context.write(u'" />\n          \t<input type="hidden" id="station_id" name="station_id" value="')
        # SOURCE LINE 30
        context.write(unicode(c.station_id))
        context.write(u'" />\n          \t<input type="hidden" id="vn_id" name="vn_id" value="')
        # SOURCE LINE 31
        context.write(unicode(c.vn_id))
        context.write(u'" />\n          \t<input type="hidden" id="cancel-reason" name="cancel-reason" value="" />\n          \t<input type="hidden" id="receipt-id" name="receipt-id" />\n        </form>\n        <div id="toolbar_pane" class="toolbar_pane">\n        \t<input type="button" id="btnSendMoney" value="\u0e19\u0e33\u0e2a\u0e48\u0e07\u0e40\u0e07\u0e34\u0e19"></input>\n        \t<input type="button" id="btnPrint" value="\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e43\u0e1a\u0e19\u0e33\u0e2a\u0e48\u0e07\u0e40\u0e07\u0e34\u0e19"></input>\n        </div>\n        <div style="height:40px"></div>\n        <div id="data">\n        \t<p style="font-size:18px;font-weight:bold">\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e19\u0e33\u0e2a\u0e48\u0e07\u0e40\u0e07\u0e34\u0e19</p>\n        \t<label>\u0e08\u0e32\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</label><input class="textbox" type="text" id="startDate" name="startDate" value="" /><button type="button" id="btnStartDate" title="Show Calendar"><img src="/img/calbtn.gif" width="18" height="18" alt="Calendar" ></button>\n\t\t\t<div id="conStartDate">\n\t\t\t    <div class="hd">\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</div>\n\t\t\t    <div class="bd">\n\t\t\t        <div id="calStartDate"></div>\n\t\t\t    </div>\n\t\t\t</div><br><br>\n\t\t\t<label>\u0e16\u0e36\u0e07\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</label><input class="textbox" type="text" id="endDate" name="endDate" value="" /><button type="button" id="btnEndDate" title="Show Calendar"><img src="/img/calbtn.gif" width="18" height="18" alt="Calendar" ></button>\n\t\t\t<div id="conEndDate">\n\t\t\t    <div class="hd">\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</div>\n\t\t\t    <div class="bd">\n\t\t\t        <div id="calEndDate"></div>\n\t\t\t    </div>\n\t\t\t</div>\n        \t<input id="btnSearch" name="btnSearch" type="button" value="\u0e04\u0e49\u0e19\u0e2b\u0e32">\n            <div id="sendMoneyTable" style="margin:5px"></div>\n            <div id="sendMoneyItemTable" style="margin:5px"></div>\n        </div>   \n    </div>\n    <div id="footer">\n    </div>\n    <iframe id="frmprint" name="frmprint" height="0" frameborder="0"></iframe>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


