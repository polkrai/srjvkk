from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553493292.349124
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/report/billbyprivilege.html'
_template_uri='/finance/report/billbyprivilege.html'
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
        context.write(unicode(h.url_for('/js/finance/billbyprivilege.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n    <style>\n        #conStartDate .bd:after {content:".";display:block;clear:left;height:0;visibility:hidden;}\n        #conStartDate .bd {padding:0;}\n        #calStartDate {border:none;padding:1em}\n\n        #conEndDate .bd:after {content:".";display:block;clear:left;height:0;visibility:hidden;}\n        #conEndDate .bd {padding:0;}\n        #calEndDate {border:none;padding:1em}\n\n    </style>\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <div id="toolbar_pane" class="toolbar_pane">\n        \t<input type="button" id="btnPrint" value="\u0e1e\u0e34\u0e21\u0e1e\u0e4c"></input>\n        \t<input type="button" id="btnExcel" value="Excel"></input>\n        \t<input type="button" id="btnBack" value="\u0e01\u0e25\u0e31\u0e1a\u0e2b\u0e19\u0e49\u0e32\u0e2b\u0e25\u0e31\u0e01">\n        </div>\n        <div style="height:40px"></div>\n        <div id="data">\n        \t<div>\n\t        \t<span style="padding:10px">\u0e08\u0e32\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</span><input type="text" id="startDate" name="startDate" value="" /><button type="button" id="btnStartDate" title="Show Calendar"><img src="/img/calbtn.gif" width="18" height="18" alt="Calendar" ></button>\n\t\t\t\t<div id="conStartDate">\n\t\t\t\t    <div class="hd">\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</div>\n\t\t\t\t    <div class="bd">\n\t\t\t\t        <div id="calStartDate"></div>\n\t\t\t\t    </div>\n\t\t\t\t</div>\n\t\t\t\t<span style="padding:10px">\u0e16\u0e36\u0e07\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</span><input type="text" id="endDate" name="endDate" value="" /><button type="button" id="btnEndDate" title="Show Calendar"><img src="/img/calbtn.gif" width="18" height="18" alt="Calendar" ></button>\n\t\t\t\t<div id="conEndDate">\n\t\t\t\t    <div class="hd">\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</div>\n\t\t\t\t    <div class="bd">\n\t\t\t\t        <div id="calEndDate"></div>\n\t\t\t\t    </div>\n\t\t\t\t</div>\n\t\t\t</div>\t\n\t\t\t<br>\n\t\t\t<span style="padding:10px">\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c</span><select id="selectPrivilege" style="margin:10px">\n')
        # SOURCE LINE 52
        for p in c.privileges:
            # SOURCE LINE 53
            context.write(u'\t\t\t\t\t<option value="')
            context.write(unicode(p.id))
            context.write(u'">')
            context.write(unicode(p.name))
            context.write(u'</option>\n')
        # SOURCE LINE 55
        context.write(u'\t\t\t</select>\n\t\t\t<span style="padding:10px">\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14</span><select id="selectProvince" style="margin:10px">\n\t\t\t\t<option value="all">\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14</option>\n')
        # SOURCE LINE 58
        for p in c.provinces:
            # SOURCE LINE 59
            context.write(u'\t\t\t\t\t<option value="')
            context.write(unicode(p.pro_code))
            context.write(u'">')
            context.write(unicode(p.pro_detail))
            context.write(u'</option>\n')
        # SOURCE LINE 61
        context.write(u'\t\t\t</select>\n\t\t\t<span style="padding:10px">\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22</span><select id="selectPatientType" style="margin:10px">\n\t\t\t\t<option value="opd">\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e19\u0e2d\u0e01</option>\n\t\t\t\t<option value="ipd">\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e43\u0e19</option>\t\t\t\t\n\t\t\t</select>\n\t\t\t<input id="btnSearch" name="btnSearch" type="button" value="\u0e04\u0e49\u0e19\u0e2b\u0e32">\n            <div id="billTable" style="margin:5px"></div>\n            <div style="font-size: x-large"><span>\u0e23\u0e27\u0e21\u0e17\u0e31\u0e49\u0e07\u0e2a\u0e34\u0e49\u0e19: </span>\n            <span id="totalSpan" style="color: red;">0.00</span>\n            <span> \u0e1a\u0e32\u0e17</span>\n            </div>\n            <form id="formExport" name="formExport" target="print" method="post" action="')
        # SOURCE LINE 72
        context.write(unicode(h.url_for('/financereport/print_bill')))
        context.write(u'">\n            \t<input type="hidden" id="province_code" name="province_code">\n            \t<input type="hidden" id="province" name="province">\n            \t<input type="hidden" id="privilege" name="privilege">\n            \t<input type="hidden" id="start_date" name="start_date">\n            \t<input type="hidden" id="end_date" name="end_date">\n            \t<input type="hidden" id="total" name="total">\n            \t<input type="hidden" id="bills" name="bills">\n            \t<input type="hidden" id="type" name="type">\n            \t<input type="hidden" id="patient_type" name="patient_type" value="opd">\n            </form>\n        </div>   \n    </div>\n    <div id="footer">\n    </div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


