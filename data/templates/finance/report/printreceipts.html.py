from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553488121.567553
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/report/printreceipts.html'
_template_uri='/finance/report/printreceipts.html'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        c = context.get('c', UNDEFINED)
        # SOURCE LINE 2
        from srjvkk.lib.base import number_format 
        
        __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['number_format'] if __M_key in locals()]))
        context.write(u'\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html>\n<head>\n    <title>\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <style type="text/css">\n<!--\n.border {\n\tborder: 1px solid #000000;\n}\n-->\n    </style>\n</head>\n<body style="width:29.7cm; height:21cm;size: landscape;">\n\t<p align="center"><strong>\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08<br>\n    \u0e42\u0e23\u0e07\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e08\u0e34\u0e15\u0e40\u0e27\u0e0a\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19\u0e23\u0e32\u0e0a\u0e19\u0e04\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c \u0e08.\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19<br>\n    \u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e40\u0e01\u0e47\u0e1a\u0e40\u0e07\u0e34\u0e19 ')
        # SOURCE LINE 20
        context.write(unicode(c.station))
        context.write(u' \u0e08\u0e32\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 ')
        context.write(unicode(c.start_date))
        context.write(u' \u0e16\u0e36\u0e07\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 ')
        context.write(unicode(c.end_date))
        context.write(u'<br>\n\t</strong></p>\n\n<table width="100%" border="0" cellspacing="0">\n  <tr>\n    <td class="border"><div align="center"><strong>\u0e25\u0e33\u0e14\u0e31\u0e1a\u0e17\u0e35\u0e48</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e19\u0e33\u0e2a\u0e48\u0e07</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08</strong></div></td>\n    <td class="border"><div align="center"><strong>hn</strong></div></td>\n    <td class="border"><div align="center"><strong>an</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e40\u0e1a\u0e34\u0e01\u0e44\u0e14\u0e49</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e2a\u0e07\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e2a\u0e48\u0e27\u0e19\u0e25\u0e14</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e04\u0e48\u0e32\u0e21\u0e31\u0e14\u0e08\u0e33</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e2a\u0e32\u0e40\u0e2b\u0e15\u0e38\u0e01\u0e32\u0e23\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01\u0e42\u0e14\u0e22</strong></div></td>\n  </tr>\n')
        # SOURCE LINE 42
        for receipt in c.receipts:
            # SOURCE LINE 43
            context.write(u'  <tr>\n  \t<td class="border" style="height:1cm">')
            # SOURCE LINE 44
            context.write(unicode(receipt['no']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">\n')
            # SOURCE LINE 46
            if receipt['sent']:
                # SOURCE LINE 47
                context.write(u'    \t\t<img src="/img/paid.png">\n')
                # SOURCE LINE 48
            else:
                # SOURCE LINE 49
                context.write(u'    \t\t<img src="/img/unpaid.png">\n')
            # SOURCE LINE 51
            context.write(u'    </td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 52
            context.write(unicode(receipt['code']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 53
            context.write(unicode(receipt['date']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 54
            context.write(unicode(receipt['hn']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 55
            context.write(unicode(receipt['an']))
            context.write(u'</td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 56
            context.write(unicode(number_format(receipt['receive_amount'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 57
            context.write(unicode(number_format(receipt['subsidy_amount'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 58
            context.write(unicode(number_format(receipt['support_amount'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 59
            context.write(unicode(number_format(receipt['discount'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 60
            context.write(unicode(number_format(receipt['deposit'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 61
            context.write(unicode(receipt['patient_type']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">\n')
            # SOURCE LINE 63
            if receipt['cancelled']:
                # SOURCE LINE 64
                context.write(u'    \t\t<img src="/img/paid.png">\n')
                # SOURCE LINE 65
            else:
                # SOURCE LINE 66
                context.write(u'    \t\t<img src="/img/unpaid.png">\n')
            # SOURCE LINE 68
            context.write(u'    </td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 69
            context.write(unicode(receipt['cancelled_date']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 70
            context.write(unicode(receipt['cancel_reason']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 71
            context.write(unicode(receipt['cancelled_by']))
            context.write(u'</td>\n  </tr>\n')
        # SOURCE LINE 74
        context.write(u'</table>\n<div style="font-size: x-large;">\n\u0e23\u0e27\u0e21\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19 ')
        # SOURCE LINE 76
        context.write(unicode(number_format(c.total, 2)))
        context.write(u' \u0e1a\u0e32\u0e17<br>\n(')
        # SOURCE LINE 77
        context.write(unicode(c.total_str))
        context.write(u')\n</div>\n<script>\n\t\twindow.print();\n\t\twindow.close();\n  </script>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


