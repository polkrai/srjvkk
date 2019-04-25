from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1555614688.993
_template_filename='C:\\Apache24\\wsgi\\srjvkk\\srjvkk\\templates/finance.html'
_template_uri='/finance.html'
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
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">\n<html>\n<head>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <title>\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19</title>\n\n    <link rel="stylesheet" type="text/css" href="/css/finance.css" >\n    <link rel="stylesheet" type="text/css" href="/yui/grids/grids-min.css" >\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js"></script>\n\n    <script type="text/javascript" src="')
        # SOURCE LINE 12
        context.write(unicode(h.url_for('/js/finance/main.js')))
        context.write(u'"></script>\n    <script type="text/javascript" src="')
        # SOURCE LINE 13
        context.write(unicode(h.url_for('/js/jquery/jquery-1.12.4.min.js')))
        context.write(u'"></script>\n</head>\n<body class="yui-skin-sam" style="text-align:left; overflow: hidden;">\n    <div id="header_pane">\n        <div id="logo_div">\n            <img src="/img/logo7_2.png" />\n        </div>\n    </div>\n    <div id="main_bd">\n        <div id="left_pane">\n            <div class="top_info"><div id="top_info_text">JVKK Information System</div></div>\n')
        # SOURCE LINE 24
        if c.station:
            # SOURCE LINE 25
            context.write(u'            <div><label style="min-width:100px;margin:0px;font-weight:bold">\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e40\u0e01\u0e47\u0e1a\u0e40\u0e07\u0e34\u0e19:</label> ')
            context.write(unicode(c.station.name))
            context.write(u'</div>\n            <div><label style="min-width:100px;margin:0px;font-weight:bold">\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17:</label> ')
            # SOURCE LINE 26
            context.write(unicode(c.station.type))
            context.write(u'</div>\n')
        # SOURCE LINE 28
        context.write(u'            <div id="left_info_pane">\n                <form method="post" action="')
        # SOURCE LINE 29
        context.write(unicode(h.url_for('/srutil/logout')))
        context.write(u'">\n                    <b>\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49: </b>')
        # SOURCE LINE 30
        context.write(unicode(c.user.name))
        context.write(u' ')
        context.write(unicode(c.user.lastname))
        context.write(u'<br>\n                    <input id="logout_button" type="submit" name="logout" value="Log out"></input>\n                </form>\n            </div>\n            <div class="top_info"><div id="top_info_text">\u0e23\u0e32\u0e22\u0e0a\u0e37\u0e48\u0e2d\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e23\u0e2d\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23</div></div>\n            <div id="button_queue_pane">\n                <input type="button" id="btnCallQueue" value="\u0e40\u0e23\u0e35\u0e22\u0e01\u0e04\u0e34\u0e27" />\n                <input type="button" id="btnSendQueue" value="\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d" />\n                <input type="button" id="btnSendBack" value="\u0e2a\u0e48\u0e07\u0e01\u0e25\u0e31\u0e1a" />\n                <span id="span-com3" style="display: none"><input id="btnCom3" type="button"></span><br>\n                \n\t            <input id="txtSearchQ" name="txtSearchQ" type="text" style="float:left;margin: 3px;">\n\t        \t<input id="btnSearchQ" name="btnSearchQ" type="button">\n\t        \t\n            </div>\n            \n            <div id="left_queue_pane">\n                \n            </div>\n            <div class="top_info"><div id="top_info_text">\u0e23\u0e32\u0e22\u0e0a\u0e37\u0e48\u0e2d\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e41\u0e25\u0e49\u0e27</div></div>\n            <div id="left_queue_done_pane">\n                left_queue_done_pane\n            </div>\n        </div>\n        <div id="important_info_pane" class="yui-gc">            \n            <div class="yui-u first">\n\t            <div id="patient_picture_pane">\n\t                <img id="patient_picture" src="/img/noname.png" width="100px" height="100px" />\n\t            </div>\n\t            <div id="patient_info">\n\t            </div>\n\t        </div>\n            <div id="more_info" class="yui-u">\n            \t<span id="hn_span"></span><br>\n            \t<span id="vn_span"></span><br>\n               \t<span id="an_span"></span><br>\n            \t<span id="privilege_span"></span><br>\n            \t<span id="txt-pay-amount" style="color: red;">0.00</span><br>\n            \t<span id="queue_span"></span>\n            </div>\n        </div>\n        <div id="common_menu_pane">\n        \t<input id="btn-search" type="button" value="\u0e04\u0e49\u0e19\u0e2b\u0e32">\n            <input id="btn-patient-info" type="button" value="\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b">\n            <input id="btn-filter" type="button" value="\u0e04\u0e31\u0e14\u0e01\u0e23\u0e2d\u0e07">\n        \t<input id="btn-treatment-info" type="button" value="\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e23\u0e31\u0e01\u0e29\u0e32">\n        \t\n        </div>\n        <div id="modules_pane">\n        </div>\n        <div id="workspace_pane" class="yui-navset">\n        \t<input type="hidden" id="com_id" name="com_id" value="')
        # SOURCE LINE 81
        context.write(unicode(c.com_id))
        context.write(u'" />\n        \t<input type="hidden" id="id_sess" name="id_sess" value="')
        # SOURCE LINE 82
        context.write(unicode(session['sr_session_id']))
        context.write(u'" />\n        \t<input type="hidden" id="station_id" name="station_id" value="')
        # SOURCE LINE 83
        context.write(unicode(c.station.id if c.station else -1))
        context.write(u'" />\n        \t<input type="hidden" id="station_type" name="station_type" value="')
        # SOURCE LINE 84
        context.write(unicode(c.station.type if c.station else 'unknown'))
        context.write(u'" />\n\t\t\t<ul class="yui-nav"> \n                <li class="selected"><a href="#payment"><em>\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19</em></a></li> \n                <li><a href="#paymenthistory"><em>\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19</em></a></li>\n                <li><a href="#sendmoney"><em>\u0e19\u0e33\u0e2a\u0e48\u0e07\u0e40\u0e07\u0e34\u0e19</em></a></li>\n                <li><a href="#confirm"><em>\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c</em></a></li>\n                <li><a href="#ipd"><em>\u0e2a\u0e23\u0e38\u0e1b\u0e04\u0e48\u0e32\u0e43\u0e0a\u0e49\u0e08\u0e48\u0e32\u0e22\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e43\u0e19</em></a></li>\n\t\t\t\t<li><a href="#lab"><em>\u0e2a\u0e23\u0e38\u0e1b\u0e04\u0e48\u0e32\u0e43\u0e0a\u0e49\u0e08\u0e48\u0e32\u0e22 Lab</em></a></li>\n\t\t\t\t<li><a href="#restore"><em>\u0e2a\u0e23\u0e38\u0e1b\u0e04\u0e48\u0e32\u0e43\u0e0a\u0e49\u0e08\u0e48\u0e32\u0e22\u0e40\u0e27\u0e0a\u0e01\u0e23\u0e23\u0e21\u0e1f\u0e37\u0e49\u0e19\u0e1f\u0e39</em></a></li>\n\t\t\t\t<li><a href="#item"><em>\u0e40\u0e1a\u0e34\u0e01\u0e08\u0e48\u0e32\u0e22\u0e15\u0e23\u0e07</em></a></li>\n                <li><a href="#report"><em>\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19</em></a></li>\n                <li><a href="#visits"><em>\u0e23\u0e32\u0e22\u0e0a\u0e37\u0e48\u0e2d\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e17\u0e35\u0e48\u0e44\u0e21\u0e48\u0e21\u0e35\u0e04\u0e48\u0e32\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23</em></a></li>\n                <li><a href="#master"><em>\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e1e\u0e37\u0e49\u0e19\u0e10\u0e32\u0e19</em></a></li>  \n            </ul>             \n            <div class="yui-content"> \n                <div id="paycharge_page">\n                \t\t<iframe name="frmpayment" id="frame-payment" src="')
        # SOURCE LINE 100
        context.write(unicode(h.url_for('/finance/payment_page?pa_id=-1')))
        context.write(u'&id_sess=')
        context.write(unicode(session['sr_session_id']))
        context.write(u'" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                \n                <div id="payment_history_page">\n                    <iframe name="frmhistory" id="frame-payment-history" src="')
        # SOURCE LINE 104
        context.write(unicode(h.url_for('/finance/payment_history_page?pa_id=-1')))
        context.write(u'" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div>\n                \t\t<iframe name="frmsendmoney" id="frmsendmoney" src="')
        # SOURCE LINE 107
        context.write(unicode(h.url_for('/finance/send_money_page?station_id=')))
        context.write(unicode(c.station.id if c.station else -1))
        context.write(u'" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div id="confirm_page">\n                \t\t<iframe id="frmconfirm" name="frmconfirm" src="')
        # SOURCE LINE 110
        context.write(unicode(h.url_for('/finance/confirm_priv_page')))
        context.write(u'?pa_id=-1" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div id="ipdsummary_page">\n                \t\t<iframe id="frmipdsummary" name="frmipdsummary" src="')
        # SOURCE LINE 113
        context.write(unicode(h.url_for('/financereport/ipdsummary_page')))
        context.write(u'?pa_id=-1" class="iframe-page" frameborder="0"></iframe>\n                </div>\n\t\t\t\t<div id="lab_page">\n                \t\t<iframe id="frmlab" name="frmlab" src="')
        # SOURCE LINE 116
        context.write(unicode(h.url_for('/finance/lab_page')))
        context.write(u'?pa_id=-1" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div id="restore_page">\n                \t\t<iframe id="frmrestore" name="frmrestore" src="')
        # SOURCE LINE 119
        context.write(unicode(h.url_for('/finance/restore_page')))
        context.write(u'?pa_id=-1" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div id="item_page">\n                \t\t<iframe id="frmitem" name="frmitem" src="')
        # SOURCE LINE 122
        context.write(unicode(h.url_for('/finance/item_page')))
        context.write(u'?pa_id=-1" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div id="report_page">\n                \t\t<iframe id="frmreport" name="frmreport" src="')
        # SOURCE LINE 125
        context.write(unicode(h.url_for('/financereport/report_main')))
        context.write(u'" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div id="master-data">\n                \t\t<iframe id="frame-visits" src="')
        # SOURCE LINE 128
        context.write(unicode(h.url_for('/finance/check_visit_orders')))
        context.write(u'" class="iframe-page" frameborder="0"></iframe>\n                </div>\n                <div id="master-data">\n                \t\t<iframe id="frame-master-data" src="')
        # SOURCE LINE 131
        context.write(unicode(h.url_for('/finance/setup_main')))
        context.write(u'" class="iframe-page" frameborder="0"></iframe>\n                </div>\n            </div> \n        </div>\n    </div>\n    <div id="footer">\n                \u0e42\u0e1b\u0e23\u0e41\u0e01\u0e23\u0e21\u0e42\u0e23\u0e07\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e08\u0e34\u0e15\u0e40\u0e27\u0e0a\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19\u0e23\u0e32\u0e0a\u0e19\u0e04\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c\t<br />\n        Powered by <a href=\'http://www.nanosofttech.com/\' target=\'blank\'>NanoSoftTech</a> | \n        <a href=\'http://www.neural.co.th/\' target=\'blank\'>NeuralTechnology</a> | \n        <a href=\'http://www.shiftright.co.th\' target=\'blank\'>ShiftRight</a> | \n        <a href=\'http://www.miracleinspire.com/\' target=\'blank\'>MiracleInspire</a> \t&nbsp;\n        &copy; 2008\n    </div>\n    <div id="dlg-search">\n    \t<div class="hd">\u0e04\u0e49\u0e19\u0e2b\u0e32</div>\n    \t<div class="bd">\n    \t\t<iframe id="frame-search" src="" width="100%" height="100%" frameborder="0"></iframe>\n    \t</div>\n    </div>\n    <div id="dlg-patient-info">\n    \t<div class="hd">\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b</div>\n    \t<div class="bd">\n    \t\t<iframe id="frame-patient-info" src="" width="100%" height="100%" frameborder="0"></iframe>\n    \t</div>\n    </div>    \n\t</div>\n        <div id="dlg-filter">\n    \t<div class="hd">\u0e04\u0e31\u0e14\u0e01\u0e23\u0e2d\u0e07</div>\n    \t<div class="bd">\n    \t\t<iframe id="frame-filter" src="" width="100%" height="100%" frameborder="0"></iframe>\n    \t</div>\n    </div>\n    <div id="dlg-treatment-info">\n    \t<div class="hd">\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e23\u0e31\u0e01\u0e29\u0e32</div>\n    \t<div class="bd">\n    \t\t<iframe id="frame-treatment-info" src="" width="100%" height="100%" frameborder="0"></iframe>\n    \t</div>\n    </div>\n    \n    <div id="dlgSendQueue">\n        <div class="hd">\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d</div>\n        <div class="bd">\n            <form method="POST" action="')
        # SOURCE LINE 173
        context.write(unicode(h.url_for('/srutil/transfer')))
        context.write(u'">\n                    <label>\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e2b\u0e19\u0e48\u0e27\u0e22\u0e07\u0e32\u0e19: </label><select id="select_com" onchange="getActions(this.options[this.selectedIndex].value)">\n')
        # SOURCE LINE 175
        for com in c.sendcoms:
            # SOURCE LINE 176
            context.write(u'                            <option value="')
            context.write(unicode(com.id))
            context.write(u'">')
            context.write(unicode(com.com_name))
            context.write(u'</option>\n')
        # SOURCE LINE 178
        context.write(u'                    </select><br><br>\n                    <label>\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21: </label><select id="select_action">\n                    </select>\n            </form>\n        </div>\n    </div>\n    <div id="dlg-send-queue">\n        <div class="hd">\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d</div>\n        <div class="bd">\n            <form method="POST" action="')
        # SOURCE LINE 187
        context.write(unicode(h.url_for('/srutil/transfer')))
        context.write(u'">\n                    <label>\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21: </label><select id="select_allowed_action"></select>\n            </form>\n        </div>\n    </div>\n    <script>\n    $(document).ready(function() {\n\n        /*$.ajax({\n            url: \'http://localhost:5000/srutil/callapi\',\n            dataType: \'json\',\n            type: \'POST\',\n            contentType: \'application/json\',\n            data: {g:\'8\'},//$(this).serialize(),\n            success: function(response, textStatus, jQxhr){\n\n                //var result = YAHOO.lang.JSON.parse(responseText);\n                //var result = jQuery.parseJSON(response);\n\n                alert(response.queue);\n                    \n            },\n            error: function(jqXhr, textStatus, errorThrown){\n\n                console.log(errorThrown);\n            }\n        });*/\n\n        alert(1);\n\n        callQ4u(1);\n    });\n    </script>\n</body>\n</html>\n')
        return ''
    finally:
        context.caller_stack.pop_frame()


