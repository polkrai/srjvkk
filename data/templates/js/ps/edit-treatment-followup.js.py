from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1552532458.5385571
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/js/ps/edit-treatment-followup.js'
_template_uri='/js/ps/edit-treatment-followup.js'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        h = context.get('h', UNDEFINED)
        # SOURCE LINE 1
        context.write(u'var SR = new Object();\n\n/* Copyright (c) 2008 Shift Right Technology co. ltd. */\nvar loader = new YAHOO.util.YUILoader({\n    require: ["button", "reset", "fonts", "base", "paginator",\n              "yahoo-dom-event", "element", "dragdrop",\n              "datatable", "connection", "json", "container", "get",\n              "datasource", "tabview", "autocomplete", "calendar",\n              "srutils"],\n    allowRollups: true,\n    base: "/yui/",\n    onSuccess: function() {\n        YAHOO.util.Event.onDOMReady(initComponents);\n    },\n    onFailure: function(){\n        showMessageDialog("Error", "\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e14\u0e36\u0e07\u0e42\u0e1b\u0e23\u0e41\u0e01\u0e23\u0e21\u0e08\u0e32\u0e01 server \u0e44\u0e14\u0e49\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e25\u0e2d\u0e07\u0e43\u0e2b\u0e21\u0e48\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07",\n        \t\tYAHOO.widget.SimpleDialog.ICON_BLOCK);\n    }\n});\n\nloader.addModule({\n\tname: "srutils", //module name; must be unique\n\ttype: "js", //can be "js" or "css"\n    //path: "../js/social/niti.js",\n    fullpath: "')
        # SOURCE LINE 25
        context.write(unicode(h.url_for('/js/srutils.js')))
        context.write(u'", //can use a path instead, extending base path\n    varName: "srutils" // a variable that will be available when the script is loaded.  Needed\n                    // in order to act on the script immediately in Safari 2.x and below.\n\t//requires: [\'yahoo\', \'event\'] //if this module had dependencies, we could define here\n});\n\nSR.mode = 0; //0 = Preview, 1 = Add, 2 = Edit\nSR.qCalled = false;\n\nfunction initComponents(){\n\tSR.currentPaId = document.getElementById(\'pa_id\').value;\n\tSR.currentVnId = document.getElementById(\'vn_id\').value;\n\tSR.arId = document.getElementById(\'ar_id\').value; \n\tresetArray();\n    initButtons();\n    SR.dlgWait = getWaitDialog();\n}\n\nfunction resetArray() {\n    SR.data = new Array();\n    SR.delData = new Array();\n    SR.editData = [];\n}\n\nfunction initButtons() {\n\tSR.btnCancel = new YAHOO.widget.Button("btnCancel");\n    SR.btnCancel.addListener("click", function(e) {        \n        window.location = "')
        # SOURCE LINE 52
        context.write(unicode(h.url_for('/psychosocial/assessment')))
        context.write(u'" + \n    \t\t"?pa_id=" + SR.currentPaId + "&vn_id=" + SR.currentVnId;;\n    });\n    SR.btnSave = new YAHOO.widget.Button("btnSave");\n    SR.btnSave.addListener("click", function(e) {\n    \t\n        var responseSuccess = function(o) {\n        \tSR.dlgWait.hide();\n            resetArray();\n            showMessageDialog("Info", \'\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\',\n            \t\tYAHOO.widget.SimpleDialog.ICON_INFO);\n            window.location = "')
        # SOURCE LINE 63
        context.write(unicode(h.url_for('/psychosocial/assessment')))
        context.write(u'" + \n    \t\t\t"?pa_id=" + SR.currentPaId + "&vn_id=" + SR.currentVnId;;\n        };\n        var responseFailure = function(o) {\n        \tSR.dlgWait.hide();\n            showMessageDialog("Error", \'\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08: \' + o.statusText,\n            \t\tYAHOO.widget.SimpleDialog.ICON_BLOCK);\n        };\n        var callback =\n        {\n            success: responseSuccess,\n            failure: responseFailure\n        };\n        SR.dlgWait.show();\n        var formObject = document.getElementById(\'form\');\n        YAHOO.util.Connect.setForm(formObject);        \n        var cObj = YAHOO.util.Connect.asyncRequest(\'POST\', "')
        # SOURCE LINE 79
        context.write(unicode(h.url_for('/psychosocial/save_treatment_followup')))
        context.write(u'", callback);\n    });\n}\n\nfunction showMessageDialog(header, msg, icon) {\n\tif (parent != self && parent.showMessageDialog) {\n\t\tparent.showMessageDialog(header, msg, icon);\n\t} else {\n\t\tmessageDialog(header, msg, icon);\n\t}\n}\n\nfunction checkComplete(value) {\n\tvar cancels = document.getElementsByName(\'cancel\');\n\tvar remark = document.getElementById(\'cancel_remark\');\n\tfor (var i = 0; i < cancels.length; i++) {\n\t\tif (value == \'1\') {\n\t\t\tcancels[i].checked = false;\n\t\t\tcancels[i].disabled = true;\n\t\t} else {\n\t\t\tif (i==0)\n\t\t\t\tcancels[i].checked = true;\n\t\t\tcancels[i].disabled = false;\n\t\t}\n\t}\n\n}\n\nloader.insert();')
        return ''
    finally:
        context.caller_stack.pop_frame()


