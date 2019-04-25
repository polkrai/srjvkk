from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553486948.230674
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/confirmpriv.html'
_template_uri='/finance/confirmpriv.html'
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
        context.write(unicode(h.url_for('/js/finance/confirmpriv.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n    <style>\n        #conReferDate .bd:after {content:".";display:block;clear:left;height:0;visibility:hidden;}\n        #conReferDate .bd {padding:0;}\n        #calReferDate {border:none;padding:1em}\n\n        #conClaimDate .bd:after {content:".";display:block;clear:left;height:0;visibility:hidden;}\n        #conClaimDate .bd {padding:0;}\n        #calClaimDate {border:none;padding:1em}\n\n    </style>\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <div id="toolbar_pane" class="toolbar_pane">\n            <input type="button" id="btnEdit" value="\u0e41\u0e01\u0e49\u0e44\u0e02">\n            <input type="button" id="btnSave" value="\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01">   \n            <input type="button" id="btnCancel" value="\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01">\n        </div>\n        <div style="height:40px"></div>\n        <br>\n        <label>\u0e1a\u0e31\u0e15\u0e23\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e0a\u0e19:</label><input class="textbox" type="text" id="people_number" name="people_number" readonly="readonly"><br><br><br>\n        </fieldset>\n\t\t<form id="form" name="form" action="" method="post">\n            <div id="data">\n            \t<input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 38
        context.write(unicode(c.pa_id))
        context.write(u'" />\n           \t\t<input type="hidden" id="qcalled" name="qcalled" value="')
        # SOURCE LINE 39
        context.write(unicode(c.qcalled))
        context.write(u'" />\n           \t\t<input type="hidden" id="vn_id" name="vn_id" value="')
        # SOURCE LINE 40
        context.write(unicode(c.vn_id))
        context.write(u'" />\n           \t\t<label>\u0e27\u0e31\u0e19/\u0e40\u0e14\u0e37\u0e2d\u0e19/\u0e1b\u0e35\u0e40\u0e01\u0e34\u0e14:</label><input class="textbox" type="text" id="birthdate" name="birthdate"><br><br><br>\n           \t\t<label>\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 admit</label><input class="textbox" type="text" id="admitdate" name="admitdate"><br><br><br>\n           \t\t<label>\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c:</label>\n           \t\t<select id="selectPriv" name="selectPriv">\n')
        # SOURCE LINE 45
        for p in c.privileges:
            # SOURCE LINE 46
            context.write(u'           \t\t\t\t<option value="')
            context.write(unicode(p.id))
            context.write(u'">')
            context.write(unicode(p.name))
            context.write(u'</option>\n')
        # SOURCE LINE 48
        context.write(u'           \t\t</select><br><br>\n           \t\t<label>\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e1a\u0e31\u0e15\u0e23:</label><input class="textbox" type="text" id="cardno" name="cardno"><br><br><br>\n                <label>\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e2b\u0e19\u0e31\u0e07\u0e2a\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e15\u0e31\u0e27 / \u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e2b\u0e19\u0e31\u0e07\u0e2a\u0e37\u0e2d\u0e23\u0e31\u0e1a\u0e23\u0e2d\u0e07\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c:</label><input class="textbox" type="text" id="referno" name="referno"><br><br><br>\n                <label>\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e43\u0e19\u0e2b\u0e19\u0e31\u0e07\u0e2a\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e15\u0e31\u0e27 / \u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e2b\u0e19\u0e31\u0e07\u0e2a\u0e37\u0e2d\u0e23\u0e31\u0e1a\u0e23\u0e2d\u0e07\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c:</label><input class="textbox" type="text" id="referdate" name="referdate">\n                <button type="button" id="btnReferDate" title="Show Calendar"><img src="/img/calbtn.gif" width="18" height="18" alt="Calendar" ></button>\n\t\t\t\t<div id="conReferDate">\n\t\t\t\t    <div class="hd">\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</div>\n\t\t\t\t    <div class="bd">\n\t\t\t\t        <div id="calReferDate"></div>\n\t\t\t\t    </div>\n\t\t\t\t</div><br><br>\n                <label>\u0e42\u0e23\u0e07\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e2b\u0e25\u0e31\u0e01:</label><input class="textbox" type="text" id="referhosp" name="referhosp"><br><br><br>\n                <label>\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48 Claim Code / \u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e43\u0e1a\u0e41\u0e08\u0e49\u0e07\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e2d\u0e19\u0e38\u0e21\u0e31\u0e15\u0e34:</label><input class="textbox" type="text" id="claimcode" name="claimcode"><br><br><br>\n                <label>\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e02\u0e2d Claim Code / \u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e2d\u0e2d\u0e01\u0e2b\u0e19\u0e31\u0e07\u0e2a\u0e37\u0e2d\u0e2d\u0e19\u0e38\u0e21\u0e31\u0e15\u0e34:</label><input class="textbox" type="text" id="claimdate" name="claimdate">\n                <button type="button" id="btnClaimDate" title="Show Calendar"><img src="/img/calbtn.gif" width="18" height="18" alt="Calendar" ></button>\n\t\t\t\t<div id="conClaimDate">\n\t\t\t\t    <div class="hd">\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</div>\n\t\t\t\t    <div class="bd">\n\t\t\t\t        <div id="calClaimDate"></div>\n\t\t\t\t    </div>\n\t\t\t\t</div><br><br>\n                <label>\u0e0a\u0e37\u0e48\u0e2d\u0e1c\u0e39\u0e49\u0e02\u0e2d Claim Code / \u0e0a\u0e37\u0e48\u0e2d\u0e40\u0e08\u0e49\u0e32\u0e2b\u0e19\u0e49\u0e32\u0e17\u0e35\u0e48\u0e1c\u0e39\u0e49\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23:</label><input class="textbox" type="text" id="claimperson" name="claimperson"><br><br><br>\n                \n            </div>\n        </form>\n    </div>\n    <div id="footer">\n    </div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


