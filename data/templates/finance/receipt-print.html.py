from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553486870.8062551
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/receipt-print.html'
_template_uri='/finance/receipt-print.html'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        c = context.get('c', UNDEFINED)
        # SOURCE LINE 2
        from srjvkk.lib.base import number_format, model 
        
        __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['model','number_format'] if __M_key in locals()]))
        context.write(u'\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html>\n<head>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <title>\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19</title>\n    <link rel="stylesheet" type="text/css" href="/css/font_style.css" >\n    <style type="text/css">\n    \n        div {\n            \n            font-family:\'THSarabunNew\', sans-serif;\n            font-size:16px;\n            vertical-align:top;\n            font-weight: bold;\n\t\t\tfont-style: normal;\n        }\n    \n    </style>\n</head>\n<body onload="window.print();window.close();" style="width:13.8cm; height:20.625cm;"> <!-- onload="window.print();window.close();" -->\n\t<div style="position:absolute;top:3.6cm;width:6.6cm">')
        # SOURCE LINE 24
        context.write(unicode(c.receipt.code))
        context.write(u'</div>\n    <div style="position:absolute;top:3.6cm;left:7.9cm;width:1cm">')
        # SOURCE LINE 25
        context.write(unicode(c.receipt.receipt_date.day))
        context.write(u'</div>\n    <div style="position:absolute;top:3.6cm;left:9.9cm;width:2cm">')
        # SOURCE LINE 26
        context.write(unicode(c.rec_month))
        context.write(u'</div>\n    <div style="position:absolute;top:3.6cm;left:12.8cm;width:2cm">')
        # SOURCE LINE 27
        context.write(unicode(c.receipt.receipt_date.year + 543))
        context.write(u'</div>\n    \n    <!-- <div style="position:absolute;top:4.4cm;left:2.3cm;">')
        # SOURCE LINE 29
        context.write(unicode(u'\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e43\u0e19' if c.receipt.visit.an else u'\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e19\u0e2d\u0e01'))
        context.write(u'</div> -->\n    <div style="position:absolute;top:4.4cm;left:2.3cm;">')
        # SOURCE LINE 30
        context.write(unicode(c.station.type))
        context.write(u'</div>\n    <div style="position:absolute;top:5.1cm;left:2.3cm;width:5.3cm">')
        # SOURCE LINE 31
        context.write(unicode(c.receipt.patient.name))
        context.write(u'</div>\n    <div style="position:absolute;top:5.1cm;left:11.2cm;width:2cm">')
        # SOURCE LINE 32
        context.write(unicode(c.receipt.patient.hn))
        context.write(u'</div>\n    \n')
        # SOURCE LINE 34
        for i in range(c.max_items - len(c.discounts)):
            # SOURCE LINE 35
            context.write(u'    \t<div style="position:absolute;top:')
            context.write(unicode(8.2 + (i * c.item_height)))
            context.write(u'cm;left:0.1cm;width:9.5cm">\n')
            # SOURCE LINE 36
            if len(c.receipt_items) > i:
                # SOURCE LINE 37
                if c.station.type == model.Station.DENTAL and c.receipt_items[i]['qty'] > 0:
                    # SOURCE LINE 38
                    context.write(u'\t\t  \t\t\t')
                    context.write(unicode(number_format(c.receipt_items[i]['qty'], 0)))
                    context.write(u' x \n')
                # SOURCE LINE 40
                context.write(u'\t\t  \t\t')
                context.write(unicode(c.receipt_items[i]['item']))
                context.write(u' \n')
                # SOURCE LINE 41
                if c.receipt_items[i]['code']:
                    # SOURCE LINE 42
                    context.write(u'\t\t\t  \t\t(')
                    context.write(unicode(c.receipt_items[i]['code']))
                    context.write(u')\n')
                # SOURCE LINE 44
            else:
                # SOURCE LINE 45
                context.write(u'\t\t\t\t&nbsp;\n')
            # SOURCE LINE 47
            context.write(u'        </div>\n        <div style="position:absolute;top:')
            # SOURCE LINE 48
            context.write(unicode(8.2 + (i * c.item_height)))
            context.write(u'cm;left:10.5cm;width:3.1cm;text-align:right;">\n        \t')
            # SOURCE LINE 49
            context.write(unicode(number_format(c.receipt_items[i]['amount'], 2) if len(c.receipt_items) > i else '&nbsp;'))
            context.write(u'\n        </div>\n')
        # SOURCE LINE 52
        for i in range(len(c.discounts)):
            # SOURCE LINE 53
            context.write(u'    \t<div style="position:absolute;top:')
            context.write(unicode(8.2 + ((c.max_items - len(c.discounts)) * c.item_height) + (i * c.item_height)))
            context.write(u'cm;left:0.1cm;width:9.5cm">\n        \t')
            # SOURCE LINE 54
            context.write(unicode(c.discounts[i]['item']))
            context.write(u'\n        </div>\n        <div style="position:absolute;top:')
            # SOURCE LINE 56
            context.write(unicode(8.2 + ((c.max_items - len(c.discounts)) * c.item_height) + (i * c.item_height)))
            context.write(u'cm;left:10.5cm;width:3.1cm;text-align:right">\n        \t')
            # SOURCE LINE 57
            context.write(unicode(number_format(c.discounts[i]['amount'], 2)))
            context.write(u'\n        </div>\n')
        # SOURCE LINE 60
        context.write(u'    <div style="position:absolute;top:16.7cm;left:10.5cm;width:3.1cm;text-align:right">\n    \t')
        # SOURCE LINE 61
        context.write(unicode(number_format(c.total_amount, 2)))
        context.write(u'\n    </div>\n    <div style="position:absolute;top:17.5cm;left:3cm;width:9cm;text-align:center">\n    \t')
        # SOURCE LINE 64
        context.write(unicode('(' + c.receive_str + ')'))
        context.write(u'\n    </div>\n    <div style="position:absolute;top:19.7cm;left:7.6cm;width:5cm;text-align:center">\n    \t')
        # SOURCE LINE 67
        context.write(unicode(c.receive_by.title if c.receive_by.title else ''))
        context.write(unicode(c.receive_by.name))
        context.write(u' ')
        context.write(unicode(c.receive_by.lastname))
        context.write(u'\n    </div>\n    <div style="position:absolute;top:20.3cm;left:7.6cm;width:5cm;text-align:center">\n    \t\u0e40\u0e08\u0e49\u0e32\u0e2b\u0e19\u0e49\u0e32\u0e17\u0e35\u0e48\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19\n    </div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


