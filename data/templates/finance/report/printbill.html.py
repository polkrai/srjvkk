from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553493367.929101
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/report/printbill.html'
_template_uri='/finance/report/printbill.html'
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
        context.write(u'\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html>\n<head>\n    <title>\u0e41\u0e1a\u0e1a\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e04\u0e48\u0e32\u0e23\u0e31\u0e01\u0e29\u0e32\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25')
        # SOURCE LINE 7
        context.write(unicode(u"\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e19\u0e2d\u0e01" if c.patient_type == "opd" else u"\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e43\u0e19"))
        context.write(u'</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n\t<style>\n\t<!--\n\t\t.border {\n\t\t\tborder: 1px solid #000000;\n\t\t}\n\t-->\n    </style>\n</head>\n<body style="width:29.7cm; height:21cm;size: landscape;" \n')
        # SOURCE LINE 18
        if c.type=='print':
            # SOURCE LINE 19
            context.write(u'\t\tonload="window.print();window.close()"\n')
        # SOURCE LINE 21
        context.write(u'>\n\t<p align="center"><strong>\u0e41\u0e1a\u0e1a\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e04\u0e48\u0e32\u0e23\u0e31\u0e01\u0e29\u0e32\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25')
        # SOURCE LINE 22
        context.write(unicode(u"\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e19\u0e2d\u0e01" if c.patient_type == "opd" else u"\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e43\u0e19"))
        context.write(u'<br>\n    \u0e42\u0e23\u0e07\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e08\u0e34\u0e15\u0e40\u0e27\u0e0a\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19\u0e23\u0e32\u0e0a\u0e19\u0e04\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c \u0e08.\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19<br>\n    \u0e40\u0e23\u0e35\u0e22\u0e01\u0e40\u0e01\u0e47\u0e1a\u0e04\u0e48\u0e32\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e2a\u0e34\u0e17\u0e18\u0e34')
        # SOURCE LINE 24
        context.write(unicode(c.privilege))
        context.write(u'\n')
        # SOURCE LINE 25
        if c.province_code != 'all':  
            # SOURCE LINE 26
            context.write(u'    \t\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14')
            context.write(unicode(c.province))
            context.write(u'\n')
        # SOURCE LINE 28
        context.write(u' <br>\n    \u0e08\u0e32\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 ')
        # SOURCE LINE 29
        context.write(unicode(c.start_date))
        context.write(u' \u0e16\u0e36\u0e07\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 ')
        context.write(unicode(c.end_date))
        context.write(u'<br>\n    \u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e1a\u0e31\u0e0d\u0e0a\u0e35 (\u0e18\u0e01\u0e2a) \u0e2a\u0e32\u0e02\u0e32\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19 006-2-84806-0</strong></p>\n\n<table width="100%" border="0" cellspacing="0">\n  <tr>\n    <td class="border"><div align="center"><strong>\u0e25\u0e33\u0e14\u0e31\u0e1a\u0e17\u0e35\u0e48</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23</strong></div></td>\n\t<td class="border"><div align="center"><strong>\u0e40\u0e27\u0e25\u0e32\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23</strong></div></td>\n\t<td class="border"><div align="center"><strong>V.N</strong></div></td>\n    <td class="border"><div align="center"><strong>H.N</strong></div></td>\n\t<td class="border"><div align="center"><strong>\u0e23\u0e2b\u0e31\u0e2a\u0e42\u0e23\u0e07\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e0a\u0e37\u0e48\u0e2d - \u0e2a\u0e01\u0e38\u0e25</strong></div></td>\n')
        # SOURCE LINE 41
        if c.province_code == 'all':  
            # SOURCE LINE 42
            context.write(u'    \t<td class="border"><div align="center"><strong>\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14</strong></div></td>\n')
        # SOURCE LINE 44
        context.write(u'    <td class="border"><div align="center"><strong>\u0e23\u0e1e.\u0e17\u0e35\u0e48\u0e23\u0e30\u0e1a\u0e38\u0e43\u0e19\u0e1a\u0e31\u0e15\u0e23</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e1a\u0e31\u0e15\u0e23</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48 refer</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e1a\u0e31\u0e15\u0e23\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e0a\u0e19</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e40\u0e1e\u0e28</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e2d\u0e32\u0e22\u0e38</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e27\u0e34\u0e19\u0e34\u0e08\u0e09\u0e31\u0e22</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e04\u0e48\u0e32\u0e22\u0e32\u0e41\u0e25\u0e30\u0e40\u0e27\u0e0a\u0e20\u0e31\u0e13\u0e11\u0e4c</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e0a\u0e31\u0e19\u0e2a\u0e39\u0e15\u0e23</strong></div></td>\n    <td class="border"><div align="center"><strong>EEG/EKG</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e15\u0e23\u0e27\u0e08\u0e27\u0e34\u0e19\u0e34\u0e08\u0e09\u0e31\u0e22\u0e2d\u0e37\u0e48\u0e19\u0e46</strong></div></td>\n    <td class="border"><div align="center"><strong>\u0e23\u0e27\u0e21\u0e17\u0e31\u0e49\u0e07\u0e2a\u0e34\u0e49\u0e34\u0e19 (\u0e1a\u0e32\u0e17)</strong></div></td>\n\t<td class="border"><div align="center"><strong>\u0e23\u0e2b\u0e31\u0e2a\u0e41\u0e1e\u0e17\u0e22\u0e4c</strong></div></td>\n  </tr>\n')
        # SOURCE LINE 58
        for bill in c.bills:
            # SOURCE LINE 59
            context.write(u'  <tr>\n  \t<td class="border" style="height:1cm">')
            # SOURCE LINE 60
            context.write(unicode(bill['no']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 61
            context.write(unicode(bill['visit_date']))
            context.write(u'</td>\n\t<td class="border" style="height:1cm">')
            # SOURCE LINE 62
            context.write(unicode(bill['visit_time']))
            context.write(u'</td>\n\t<td class="border" style="height:1cm">')
            # SOURCE LINE 63
            context.write(unicode(bill['vn']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 64
            context.write(unicode(bill['hn']))
            context.write(u'</td>\n\t<td class="border" style="height:1cm">')
            # SOURCE LINE 65
            context.write(unicode(bill['refer_hosp_code']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 66
            context.write(unicode(bill['name']))
            context.write(u'</td>\n')
            # SOURCE LINE 67
            if c.province_code == 'all':  
                # SOURCE LINE 68
                context.write(u'    \t<td class="border" style="height:1cm">')
                context.write(unicode(bill['province']))
                context.write(u'</td>\n')
            # SOURCE LINE 70
            context.write(u'    <td class="border" style="height:1cm">')
            context.write(unicode(bill['hospital']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 71
            context.write(unicode(bill['prcardid']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 72
            context.write(unicode(bill['refer_no']))
            context.write(u'</td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 73
            context.write(unicode(bill['personalid']))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 74
            context.write(unicode(bill['sex']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 75
            context.write(unicode(bill['age']))
            context.write(u'</td>\n    <td class="border" style="height:1cm">')
            # SOURCE LINE 76
            context.write(unicode(bill['icd10']))
            context.write(u'</td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 77
            context.write(unicode(number_format(bill['med'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 78
            context.write(unicode(number_format(bill['lab'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 79
            context.write(unicode(number_format(bill['eeg'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 80
            context.write(unicode(number_format(bill['other'], 2)))
            context.write(u'</div></td>\n    <td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 81
            context.write(unicode(number_format(bill['subtotal'], 2)))
            context.write(u'</div></td>\n\t<td class="border" style="height:1cm"><div align="right">')
            # SOURCE LINE 82
            context.write(unicode(bill['number_licensed']))
            context.write(u'</div></td>\n  </tr>\n')
        # SOURCE LINE 85
        context.write(u'  <tr>\n    <td colspan="')
        # SOURCE LINE 86
        context.write(unicode(c.colspan))
        context.write(u'" style="border:none"><div align="right">\u0e23\u0e27\u0e21\u0e04\u0e48\u0e32\u0e23\u0e31\u0e01\u0e29\u0e32\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25</div></td>\n    <td class="border"><div align="right">')
        # SOURCE LINE 87
        context.write(unicode(number_format(c.total, 2)))
        context.write(u'</div></td>\n  </tr>\n  <tr>\n    <td colspan="')
        # SOURCE LINE 90
        context.write(unicode(c.colspan + 1))
        context.write(u'" style="border:none"><div align="right">(')
        context.write(unicode(c.total_str))
        context.write(u')</div></td>\n  </tr>\n</table>\n<div align="center" style="width:10cm">\n  <p>\u0e02\u0e2d\u0e23\u0e31\u0e1a\u0e23\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e04\u0e48\u0e32\u0e23\u0e31\u0e01\u0e29\u0e32\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07\u0e15\u0e32\u0e21\u0e17\u0e35\u0e48\u0e40\u0e23\u0e35\u0e22\u0e01\u0e40\u0e01\u0e47\u0e1a</p>\n  <p>\u0e25\u0e07\u0e0a\u0e37\u0e48\u0e2d......................................................................<br>\n    (')
        # SOURCE LINE 96
        context.write(unicode(c.user.fullname if c.user else ''))
        context.write(u') </p>\n</div>\n<script>\n\t\t//window.print();\n\t\t//window.close();\n</script>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


