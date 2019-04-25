from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553486956.2924581
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/background.html'
_template_uri='/background.html'
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
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html style="background-color:#edf5ff">\n<head>\n    <title>\u0e2a\u0e31\u0e07\u0e04\u0e21\u0e2a\u0e07\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js" ></script>\n    <script type="text/javascript" src="')
        # SOURCE LINE 9
        context.write(unicode(h.url_for('/js/social/background.js')))
        context.write(u'"></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n\n</head>\n<body class="yui-skin-sam">\n    <div id="header_pane">\n\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form_background" name="form_background" action="')
        # SOURCE LINE 18
        context.write(unicode(h.url_for('/social/save_background')))
        context.write(u'" method="post">\n            \n            <div id="toolbar_pane" class="toolbar_pane" \n')
        # SOURCE LINE 21
        if not c.bg_editable:
            # SOURCE LINE 22
            context.write(u'                style="display:none"\n')
        # SOURCE LINE 24
        context.write(u'            >\n            \n                <input type="button" id="btnEditBackground" value="\u0e41\u0e01\u0e49\u0e44\u0e02">\n                <input type="button" id="btnSaveBackground" value="\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01">   \n                <input type="button" id="btnCancelBackground" value="\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01">\n                <input type="button" id="btnPrintBackground" value="\u0e1e\u0e34\u0e21\u0e1e\u0e4c">\n            \n            </div>\n')
        # SOURCE LINE 32
        if c.bg_editable:
            # SOURCE LINE 33
            context.write(u'            \t<div style="height:40px"></div>\n')
        # SOURCE LINE 35
        context.write(u'            <div id="social_data" class="yui-content">\n                <input type="hidden" id="background_id" name="background_id" value="')
        # SOURCE LINE 36
        context.write(unicode(c.pt_bg.id))
        context.write(u'">\n                <input type="hidden" id="editable" name="editable" value="')
        # SOURCE LINE 37
        context.write(unicode(c.bg_editable))
        context.write(u'">\n                <input type="hidden" id="qcalled" name="qcalled" value="')
        # SOURCE LINE 38
        context.write(unicode(c.qcalled))
        context.write(u'" >\n                <input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 39
        context.write(unicode(c.bg_pa_id))
        context.write(u'" >\n                <input type="hidden" id="bg_problems" name="bg_problems" >\n                <input type="hidden" id="del_bg_problems" name="del_bg_problems" >\n                <input type="hidden" id="bg_helps" name="bg_helps" >\n                <input type="hidden" id="del_bg_helps" name="del_bg_helps" >\n                \n                <label>\u0e1c\u0e39\u0e49\u0e43\u0e2b\u0e49\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34:</label><input class="textbox" type="text" id="info_provider" name="info_provider" value="')
        # SOURCE LINE 45
        context.write(unicode(c.pt_bg.info_provider))
        context.write(u'">\n                <label>\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e02\u0e49\u0e2d\u0e07\u0e40\u0e1b\u0e47\u0e19:</label><input class="textbox" type="text" id="provider_relation" name="provider_relation" value="')
        # SOURCE LINE 46
        context.write(unicode(c.pt_bg.provider_relation))
        context.write(u'"><br><br>\n                <label>\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e2a\u0e33\u0e04\u0e31\u0e0d:</label><textarea class="textarea" id="important_symptom" name="important_symptom">')
        # SOURCE LINE 47
        context.write(unicode(c.pt_bg.important_symptom))
        context.write(u'</textarea>\n                <label>\u0e40\u0e1b\u0e47\u0e19\u0e21\u0e32\u0e19\u0e32\u0e19 :</label><input class="textbox" type="text" id="period" name="period" value="')
        # SOURCE LINE 48
        context.write(unicode(c.pt_bg.period))
        context.write(u'" />\n                <label>\u0e23\u0e31\u0e1a\u0e01\u0e32\u0e23\u0e23\u0e31\u0e01\u0e29\u0e32:</label>\n                <input id="inpHs" name="inpHs" type="text" style="position:static;width:200px;vertical-align:middle;" \n')
        # SOURCE LINE 51
        if c.pt_bg.health_station:
            # SOURCE LINE 52
            context.write(u'\t\t\t\t\tvalue="')
            context.write(unicode(c.pt_bg.health_station))
            context.write(u'"\n')
        # SOURCE LINE 54
        context.write(u'                "> <span id="btnHs"></span>\n                <div id="ctHs" style=" width:200px;left:0px"></div><br><br>\n                <label>\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e40\u0e08\u0e47\u0e1a\u0e1b\u0e48\u0e27\u0e22\u0e43\u0e19\u0e2d\u0e14\u0e35\u0e15</label><br><br>\n                <label>-\u0e17\u0e32\u0e07\u0e01\u0e32\u0e22:</label><div style="float:left"><input type="radio" name="rdo-physical" id="physical-false" value="false" checked="checked">\u0e44\u0e21\u0e48\u0e21\u0e35<input type="radio" name="rdo-physical" id="physical-true" value="true">\u0e21\u0e35</div><br>\n                <textarea class="textarea" id="history_physical" name="history_physical">')
        # SOURCE LINE 58
        context.write(unicode(c.pt_bg.history_physical))
        context.write(u'</textarea><br>\n                <label>-\u0e17\u0e32\u0e07\u0e08\u0e34\u0e15:</label><textarea class="textarea" id="history_mental" name="history_mental">')
        # SOURCE LINE 59
        context.write(unicode(c.pt_bg.history_mental))
        context.write(u'</textarea><br>\n                <label>-\u0e2d\u0e38\u0e1a\u0e31\u0e15\u0e34\u0e40\u0e2b\u0e15\u0e38:</label><textarea class="textarea" id="history_accident" name="history_accident">')
        # SOURCE LINE 60
        context.write(unicode(c.pt_bg.history_accident))
        context.write(u'</textarea><br>\n                <label>\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e41\u0e1e\u0e49\u0e22\u0e32:</label><textarea class="textarea" id="history_med_alergy" name="history_med_alergy">')
        # SOURCE LINE 61
        context.write(unicode(c.pt_bg.history_med_alergy))
        context.write(u'</textarea><br>\n                <label>\u0e01\u0e23\u0e23\u0e21\u0e1e\u0e31\u0e19\u0e18\u0e38\u0e4c:</label><div style="float:left"><input type="radio" name="rdo-heredity" id="heredity-false" value="false" checked="checked">\u0e44\u0e21\u0e48\u0e21\u0e35<input type="radio" name="rdo-heredity" id="heredity-true" value="true">\u0e21\u0e35</div><br>\n                <textarea class="textarea" id="heredity" name="heredity">')
        # SOURCE LINE 63
        context.write(unicode(c.pt_bg.heredity))
        context.write(u'</textarea><br>\n                <label>\u0e1a\u0e38\u0e04\u0e25\u0e34\u0e01\u0e20\u0e32\u0e1e:</label><textarea class="textarea" id="personality" name="personality">')
        # SOURCE LINE 64
        context.write(unicode(c.pt_bg.personality))
        context.write(u'</textarea><br>\n                <label>\u0e2a\u0e34\u0e48\u0e07\u0e40\u0e2a\u0e1e\u0e15\u0e34\u0e14:</label><div style="float:left"><input type="radio" name="rdo-drug" id="drug-false" value="false" checked="checked">\u0e44\u0e21\u0e48\u0e40\u0e04\u0e22<input type="radio" name="rdo-drug" id="drug-true" value="true">\u0e40\u0e04\u0e22</div><br>\n                <textarea class="textarea" id="drug_usage" name="drug_usage">')
        # SOURCE LINE 66
        context.write(unicode(c.pt_bg.drug_usage))
        context.write(u'</textarea><br>\n                <label>\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e23\u0e31\u0e27:</label><textarea class="textarea" id="history_family" name="history_family">')
        # SOURCE LINE 67
        context.write(unicode(c.pt_bg.history_family))
        context.write(u'</textarea><br>\n                \n                <!--  <label>\u0e27\u0e34\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c:</label><textarea class="textarea" id="social_analysis_text" name="social_analysis_text">')
        # SOURCE LINE 69
        context.write(unicode(c.pt_bg.social_analysis_text))
        context.write(u'</textarea><br>-->\n                <div style="float:left;width:100%">\n                \t\n                    <label>\u0e01\u0e32\u0e23\u0e27\u0e34\u0e19\u0e34\u0e08\u0e09\u0e31\u0e22\u0e17\u0e32\u0e07\u0e2a\u0e31\u0e07\u0e04\u0e21:</label><br><br>\n                    \n                    <div style="margin: 5px;" \n')
        # SOURCE LINE 75
        if c.bg_editable:
            # SOURCE LINE 76
            context.write(u'                    \tstyle="display:none"\n')
        # SOURCE LINE 78
        context.write(u'                    >\n\t\t\t\t\t\t<input onkeypress="checkEnter(event, \'prob\')" type="text" id="txtAddProb" style="position:static;width:200px;vertical-align:middle;">\n\t\t\t\t\t\t<input id="btnAddProb" type="button" value="\u0e40\u0e1e\u0e34\u0e48\u0e21" >\n\t                \t<div id="ctProb" style="width:200px;left:0px;">\n                \t</div>\n                    <div id="bg_social_problem" style="margin: 5px;"></div>\n                </div>\n                \n                <div style="float:left;width:100%">\n                    <label>\u0e01\u0e32\u0e23\u0e43\u0e2b\u0e49\u0e04\u0e27\u0e32\u0e21\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e2b\u0e25\u0e37\u0e2d:</label><br><br>\n                    \n                    <div style="margin: 5px;"\n')
        # SOURCE LINE 90
        if c.bg_editable:
            # SOURCE LINE 91
            context.write(u'                    \tstyle="display:none"\n')
        # SOURCE LINE 93
        context.write(u'                    >\n\t\t\t\t\t\t<input onkeypress="checkEnter(event, \'help\')" type="text" id="txtAddHelp" style="position:static;width:200px;vertical-align:middle;">\n\t\t\t\t\t\t<input id="btnAddHelp" type="button" value="\u0e40\u0e1e\u0e34\u0e48\u0e21" >\n\t                \t<div id="ctHelp" style="width:200px;left:0px;">\n                \t</div>\n                    \n                    <div id="bg_social_help" style="margin: 5px;">                                \n                    </div>\n                </div><br>\n                <div>\n                \t<label>\u0e1c\u0e39\u0e49\u0e0b\u0e31\u0e01\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34:</label><label id="created_by"></label>\n                \t<label>\u0e15\u0e33\u0e41\u0e2b\u0e19\u0e48\u0e07:</label><label id="position"></label><br><br>\n                \t<label>\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e0b\u0e31\u0e01\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34:</label><label id="created_date"></label>\n                </div>\n            </div>\n        </form>\n    </div>\n    <div id="footer">\n    </div>\n    <iframe id="frmprint" name="frmprint" height="0" frameborder="0"></iframe>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


