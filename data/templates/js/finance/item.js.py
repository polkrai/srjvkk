from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1555595724.609
_template_filename='C:\\Apache24\\wsgi\\srjvkk\\srjvkk\\templates/js/finance/item.js'
_template_uri='/js/finance/item.js'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        h = context.get('h', UNDEFINED)
        # SOURCE LINE 1
        context.write(u'var SR = new Object();\nvar Event, Dom, Lang, $, DT;\n/* Copyright (c) 2008 Shift Right Technology co. ltd. */\nvar loader = new YAHOO.util.YUILoader({\n    require: ["button", "reset", "fonts", "base",\n              "yahoo-dom-event", "element", "dragdrop",\n              "datatable", "connection", "json", "container", "get",\n              "datasource", "tabview", "autocomplete", "calendar",\n              "srutils"],\n    allowRollups: true,\n    base: "/yui/",\n    onSuccess: function() {\n\t\tEvent = YAHOO.util.Event,\n\t\tDom = YAHOO.util.Dom,\n\t\tLang = YAHOO.lang,\n\t\t$ = Dom.get,\n\t\tDT = YAHOO.widget.DataTable;\n        YAHOO.util.Event.onDOMReady(initComponents);\n    },\n    onFailure: function(){\n        showMessageDialog("Error", "\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e14\u0e36\u0e07\u0e42\u0e1b\u0e23\u0e41\u0e01\u0e23\u0e21\u0e08\u0e32\u0e01 server \u0e44\u0e14\u0e49\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e25\u0e2d\u0e07\u0e43\u0e2b\u0e21\u0e48\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07",\n        \t\tYAHOO.widget.SimpleDialog.ICON_ERROR);\n    }\n});\n\nloader.addModule({\n\tname: "srutils", //module name; must be unique\n\ttype: "js", //can be "js" or "css"\n    //path: "../js/social/niti.js",\n    fullpath: "')
        # SOURCE LINE 30
        context.write(unicode(h.url_for('/js/srutils.js')))
        context.write(u'", //can use a path instead, extending base path\n    varName: "srutils" // a variable that will be available when the script is loaded.  Needed\n                    // in order to act on the script immediately in Safari 2.x and below.\n\t//requires: [\'yahoo\', \'event\'] //if this module had dependencies, we could define here\n});\n\nSR.mode = 0; //0 = Preview, 1 = Add, 2 = Edit\n\nfunction reloadPage(paId) {\n\t$(\'pa_id\').value = paId;\n\tSR.currentPatientId = paId;\n    SR.table.datasource.sendRequest("pa_id=" + SR.currentPatientId, {\n        success : SR.table.datatable.onDataReturnInitializeTable,\n        failure : SR.table.datatable.onDataReturnInitializeTable,\n        scope : SR.table.datatable\n    });\n}\n\nfunction initComponents(){\n\tvar paId = $(\'pa_id\').value;\n    if (paId == undefined || paId == \'\')\n        paId = -1;\n    SR.currentPatientId = paId;\n    \n    //SR.currentVnId = vnId;\n    //SR.qcalled = qcalled;\n    \n    SR.table = initTable();\n    \n    //initMenu();\n    \n    \n}\n\nfunction initMenu() {\n\tSR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {\n\t\tiframe:true\n\t});\n\tSR.toolbar.render();\n\tYAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){\n\t\tvar pos = Dom.getXY($(\'toolbar_pane\'));\n\t\tDom.setXY($(\'toolbar_pane\'),[pos.X,window.scrollY]);\n    });\n}\n\nfunction initTable() {\n    var table = new function() {\n        this.coldefs =\n            [\n             {key:"vn", label:"\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48 visit", formatter:linkFormatter},\n             {key:"time_add", label:"\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23", formatter:dateFormatter},\n             //{key:"patient_type", label:"\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22"},\n             {key:"privilege", label:"\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c"},\n             {key:"id", hidden:true}];\n        this.query = "pa_id=" + SR.currentPatientId;\n        this.datasource = new YAHOO.util.DataSource(\n            "')
        # SOURCE LINE 86
        context.write(unicode(h.url_for('/finance/get_print_items')))
        context.write(u'",\n            {connXhrMode: "cancelStaleRequest",\n             connMethodPost: true,\n             responseType:YAHOO.util.DataSource.TYPE_JSON,\n             responseSchema:{resultsList:"restores",\n                fields:["id","vn", {key:"time_add", parser:parseDate}, \n                        "privilege", "patient_type"]}});\n        this.datatable = new YAHOO.widget.DataTable("item_history",\n            this.coldefs, this.datasource,\n            {scrollable:true, width:"100%", height:"400px",\n                initialRequest:this.query});\n        this.datatable.set("selectionMode","single");\n        this.handleClicked = function(oArgs, arg2){\n            var row = table.datatable.getRow(oArgs.target);\n            table.datatable.unselectAllRows();\n            table.datatable.selectRow(row);\n\n        };\n        this.datatable.subscribe("rowClickEvent", this.handleClicked);\n        \n    }\n    return table;\n}\n\nfunction linkFormatter(elCell, oRecord, oColumn, oData) {\n\tvar url = "')
        # SOURCE LINE 111
        context.write(unicode(h.url_for('/financereport/print_items_view')))
        context.write(u'" + \n\t\t"?vn_id=" + oRecord.getData("id");\n\telCell.innerHTML = "<a href=\'" + url +"\'>" + oData + "</a>";\n}\n\nfunction showMessageDialog(header, msg, icon) {\n\tif (parent != self && parent.showMessageDialog) {\n\t\tparent.showMessageDialog(header, msg, icon);\n\t} else {\n\t\tmessageDialog(header, msg, icon);\n\t}\n}\n\nloader.insert();\n\n    \n\n')
        return ''
    finally:
        context.caller_stack.pop_frame()


