from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1555609100.835
_template_filename='C:\\Apache24\\wsgi\\srjvkk\\srjvkk\\templates/finance/payment.html'
_template_uri='/finance/payment.html'
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
        context.write(u'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">\n<html style="background-color:#edf5ff">\n<head>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <title>\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19</title>\n\n    <script type="text/javascript" src="/yui/yuiloader/yuiloader-min.js" ></script>\n    <link rel="stylesheet" type="text/css" href="/css/background.css" >\n    <link rel="stylesheet" type="text/css" href="/yui/grids/grids-min.css">\n\n    <script type="text/javascript" src="')
        # SOURCE LINE 12
        context.write(unicode(h.url_for('/js/jquery/jquery-1.12.4.min.js')))
        context.write(u'"></script>\n    <script type="text/javascript" src="')
        # SOURCE LINE 13
        context.write(unicode(h.url_for('/js/finance/payment.js')))
        context.write(u'"></script>\n    \n    \n</head>\n<body class="yui-skin-sam" style="text-align: left;">\n    <div id="header_pane">\n    </div>\n    <div id="main_bd" class="yui-content">\n        <form id="form" name="form" action="" method="post">\n            <div id="toolbar_pane" class="toolbar_pane" \n')
        # SOURCE LINE 23
        if not c.editable:
            # SOURCE LINE 24
            context.write(u'\t                style="display:none"\n')
        # SOURCE LINE 26
        context.write(u'            >\n            \t<input type="button" id="btn_paycharge" value="\u0e0a\u0e33\u0e23\u0e30\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e17\u0e35\u0e48\u0e40\u0e25\u0e37\u0e2d\u0e01"></input>\n            \t<input type="button" id="btnLeave" value="\u0e04\u0e19\u0e44\u0e02\u0e49\u0e44\u0e21\u0e48\u0e0a\u0e33\u0e23\u0e30\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e17\u0e35\u0e48\u0e40\u0e25\u0e37\u0e2d\u0e01"></input>\n            \t<input type="checkbox" id="btnCheck"></input>\n            \t<input type="button" id="btnDeposit" value="\u0e0a\u0e33\u0e23\u0e30\u0e04\u0e48\u0e32\u0e21\u0e31\u0e14\u0e08\u0e33"></input>\n            </div>\n')
        # SOURCE LINE 32
        if c.editable:
            # SOURCE LINE 33
            context.write(u'            \t<div style="height:40px"></div>\n')
        # SOURCE LINE 35
        context.write(u'            <div id="data">\n \n            \t<div class="yui-gc">\n\t\t\t\t\t<div class="yui-u first">\n\t\t\t\t\t\t<div id="patient_payment" style="margin:10px;"></div>\n\t\t\t\t\t\t\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="yui-u" style="text-align:left; margin-top:10px">\n\t\t\t\t\t\t<label>\u0e22\u0e2d\u0e14\u0e04\u0e49\u0e32\u0e07\u0e0a\u0e33\u0e23\u0e30\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14</label><input class="txt-number" readonly="readonly" type="text" id="txt-record" name="txt-record" value="0.00"><br><br>\n\t\t\t\t\t\t<label\n')
        # SOURCE LINE 45
        if not c.editable:
            # SOURCE LINE 46
            context.write(u'\t\t\t\t                style="display:none"\n')
        # SOURCE LINE 48
        context.write(u'\t\t\t\t\t\t>\u0e22\u0e2d\u0e14\u0e04\u0e49\u0e32\u0e07\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e08\u0e48\u0e32\u0e22</label><input class="txt-number" readonly="readonly" type="text" id="txt-select" name="txt-select" value="0.00"\n')
        # SOURCE LINE 49
        if not c.editable:
            # SOURCE LINE 50
            context.write(u'\t\t\t\t                style="display:none"\n')
        # SOURCE LINE 52
        context.write(u'\t\t\t\t\t\t><br><br>\n\t\t\t\t\t\t<label>\u0e22\u0e2d\u0e14\u0e40\u0e07\u0e34\u0e19\u0e2a\u0e07\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c</label><input class="txt-number" readonly="readonly" type="text" id="txt-support" name="txt-support" value="0.00"><br><br>\n\t\t\t\t\t\t<label>\u0e22\u0e2d\u0e14\u0e40\u0e07\u0e34\u0e19\u0e17\u0e35\u0e48\u0e40\u0e1a\u0e34\u0e01\u0e44\u0e14\u0e49</label><input class="txt-number" readonly="readonly" type="text" id="txt-subsidy" name="txt-subsidy" value="0.00"><br><br>\n\t\t\t\t\t\t<label>\u0e22\u0e2d\u0e14\u0e40\u0e07\u0e34\u0e19\u0e21\u0e31\u0e14\u0e08\u0e33</label><input class="txt-number" readonly="readonly" type="text" id="txt-deposit" name="txt-deposit" value="0.00"><br><br>\n\t\t\t\t\t\t<label>\u0e22\u0e2d\u0e14\u0e40\u0e07\u0e34\u0e19\u0e2a\u0e48\u0e27\u0e19\u0e25\u0e14</label><input class="txt-number" type="text" id="txt-discount" name="txt-discount" value="0.00"><br><br>\n\t\t\t\t\t\t<label>\u0e22\u0e2d\u0e14\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e0a\u0e33\u0e23\u0e30</label><input class="txt-number" style="color:red;font-weight:bold" readonly="readonly" type="text" id="txt-remain" name="txt-remain" value="0.00"><br><br>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n            \t<div id="visit_charge" style="margin:10px"></div>\n                \n                <div id="paycharge_pane">                                                        \n                </div>\n            </div>   \n        </form>\n    </div>\n    <div id="footer">\n    </div>\n    <div id="dlg-receive">\n        <div class="hd">\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19</div>\n        <div class="bd">\n                <form id="form-payment" method="POST" action="')
        # SOURCE LINE 72
        context.write(unicode(h.url_for('/finance/submit_payment')))
        context.write(u'">\n                \t<input type="hidden" id="editable" name="editable" value="')
        # SOURCE LINE 73
        context.write(unicode(c.editable))
        context.write(u'" />\n                \t<input type="hidden" id="pa_id" name="pa_id" value="')
        # SOURCE LINE 74
        context.write(unicode(c.pa_id))
        context.write(u'" />\n            \t\t<input type="hidden" id="qcalled" name="qcalled" value="')
        # SOURCE LINE 75
        context.write(unicode(c.qcalled))
        context.write(u'" />\n            \t\t<input type="hidden" id="vn_id" name="vn_id" value="')
        # SOURCE LINE 76
        context.write(unicode(c.vn_id))
        context.write(u'" />\n            \t\t<input type="hidden" id="station_id" name="station_id" value="-1" />\n                    <input type="hidden" id="orders" name="orders" />\n                    <input type="hidden" id="support-id" name="support-id" />\n                    <input type="hidden" id="support-amount" name="support-amount" />\n                    <input type="hidden" id="subsidy-amount" name="subsidy-amount" />\n                    <input type="hidden" id="discount" name="discount" value="0.00" />\n                    <input type="hidden" id="deposit" name="deposit" />\n                    <div style="font-size: large;">\n\t                    <label for="totalamount">\u0e08\u0e33\u0e19\u0e27\u0e19\u0e40\u0e07\u0e34\u0e19\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14:</label><input type="textbox" id="totalamount" name="totalamount" readonly="readonly"/><br /><br />\n\t                    <label for="receiveamount">\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19:</label><input type="textbox" id="receiveamount" name="receiveamount" onChange="receiveChange()" value="0.00" /><br /><br />\n\t                    <label for="changeamount">\u0e40\u0e07\u0e34\u0e19\u0e17\u0e2d\u0e19:</label><input type="textbox" id="changeamount" name="changeamount" value="0.00"/>\n\t                </div>\n                </form>\n        </div>\n    </div>\n    <div id="dlg-deposit">\n        <div class="hd">\u0e0a\u0e33\u0e23\u0e30\u0e04\u0e48\u0e32\u0e21\u0e31\u0e14\u0e08\u0e33</div>\n        <div class="bd">\n                <form id="form-deposit" method="POST" action="')
        # SOURCE LINE 95
        context.write(unicode(h.url_for('/finance/submit_deposit')))
        context.write(u'">\n            \t\t<input type="hidden" id="dvn_id" name="dvn_id" value="')
        # SOURCE LINE 96
        context.write(unicode(c.vn_id))
        context.write(u'" />\n            \t\t<input type="hidden" id="dstation_id" name="dstation_id" value="-1" />\n                    <div style="font-size: large;">\n\t                    <label for="depositamount">\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19:</label><input type="textbox" id="depositamount" name="depositamount" value="0.00" /><br /><br />\n\t                </div>\n                </form>\n        </div>\n    </div>\n    <div id="dlgDelete"></div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


