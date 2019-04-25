from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1421892406.105
_template_filename='/Library/Server/Web/Data/WebApps/srjvkk/srjvkk/templates/finance/setupitem.html'
_template_uri='/finance/setupitem.html'
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
        context.write(unicode(h.url_for('/js/finance/setupitem.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/yui/menu/assets/skins/sam/menu.css"> \n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n            <div class="toolbar_pane">\n            \t<input type="button" id="btnAdd" value="\u0e40\u0e1e\u0e34\u0e48\u0e21">\n                <input type="button" id="btnEdit" value="\u0e41\u0e01\u0e49\u0e44\u0e02">\n                <input type="button" id="btnSave" value="\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01">   \n                <input type="button" id="btnCancel" value="\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01">\n                \n                <input type="button" id="btnBack" value="\u0e01\u0e25\u0e31\u0e1a\u0e2b\u0e19\u0e49\u0e32\u0e2b\u0e25\u0e31\u0e01">\n            </div>\n            <div id="data">\n            \t<input type="hidden" id="items" name="items">\n            \t<input type="hidden" id="del-items" name="del-items">\n            \t<input type="button" id="menu-group" name="menu-group" value=""> \n            \t<select id="select-group">\n            \t\t<option value="null">\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e08\u0e31\u0e14\u0e2b\u0e21\u0e27\u0e14\u0e01\u0e32\u0e23\u0e23\u0e31\u0e01\u0e29\u0e32</option>\n')
        # SOURCE LINE 33
        for g in c.groups:
            # SOURCE LINE 34
            context.write(u'            \t\t<option value="')
            context.write(unicode(g.id))
            context.write(u'">')
            context.write(unicode(g.name))
            context.write(u'</option>\n')
        # SOURCE LINE 36
        context.write(u'            \t</select>\n            \t<div id="item-table"></div>\n            </div>\n        </form>\n    </div>\n    <div id="footer">\n    </div>\n    <div id="dlgDelete"></div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


