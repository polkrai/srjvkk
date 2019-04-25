from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1552456838.2630301
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/report/printlabs.html'
_template_uri='/finance/report/printlabs.html'
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
        context.write(u'\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html>\n<head>\n    <title>\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08 lab</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <style type="text/css">\n<!--\ndiv {\n\n\tfont-family:Tahoma;\n\tfont-size:16px;\n\tvertical-align:top;\n}\n\ndiv.bl {\n\tborder-left: black solid thin;\n}\ndiv.bt {\n\tborder-top: black solid thin;\n}\ndiv.bb {\n\tborder-bottom: black solid thin;\n}\ndiv.br {\n\tborder-right: black solid thin;\n}\n-->\n    </style>\n</head>\n<body style="width:13.8cm; height:20.625cm;">\n\t<div style="text-align:center;">\n\t\t<strong>\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08 lab<br>\n\t\t\u0e42\u0e23\u0e07\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e08\u0e34\u0e15\u0e40\u0e27\u0e0a\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19\u0e23\u0e32\u0e0a\u0e19\u0e04\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c \u0e08.\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19</strong>\n\t</div>\n\t<div style="position:absolute;top:1.6cm;width:2.5cm;font-weight:bold;">\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48 visit</div>\n\t<div style="position:absolute;top:1.6cm;width:4cm;left:2.5cm">')
        # SOURCE LINE 39
        context.write(unicode(c.visit.vn))
        context.write(u'</div>\n\t<div style="position:absolute;top:1.6cm;width:3cm;left:7cm;font-weight:bold;">\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23</div>\n    <div style="position:absolute;top:1.6cm;left:10cm;width:5cm">')
        # SOURCE LINE 41
        context.write(unicode(c.visit.time_add.strftime('%d/%m/%Y')))
        context.write(u'</div>\n    \n\t<div style="position:absolute;top:2.4cm;width:3cm;font-weight:bold;">\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22</div>\n    <div style="position:absolute;top:2.4cm;left:3.3cm;">')
        # SOURCE LINE 44
        context.write(unicode(u'\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e43\u0e19' if c.visit.an else u'\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22\u0e19\u0e2d\u0e01'))
        context.write(u'</div>\n\t<div style="position:absolute;top:2.4cm;left:7cm;width:1cm;font-weight:bold;">HN</div>\n\t<div style="position:absolute;top:2.4cm;left:10cm;width:2.5cm">')
        # SOURCE LINE 46
        context.write(unicode(c.visit.patient.hn))
        context.write(u'</div>\n    <div style="position:absolute;top:3.1cm;width:2cm;font-weight:bold;">\u0e0a\u0e37\u0e48\u0e2d-\u0e2a\u0e01\u0e38\u0e25</div>\n\t<div style="position:absolute;top:3.1cm;left:2.3cm;width:10cm">')
        # SOURCE LINE 48
        context.write(unicode(c.visit.patient.name))
        context.write(u'</div>\n    \n\t<div style="position:absolute;top:4cm;left:0;width:9cm;text-align:center;" class="bl bt bb">\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23</div>\n\t<div style="position:absolute;top:4cm;left:9cm;width:2.5cm;text-align:center;" class="bl bt bb">\u0e08\u0e33\u0e19\u0e27\u0e19</div>\n\t<div style="position:absolute;top:4cm;left:11.5cm;width:2.5cm;text-align:center;" class="bl bt bb br">\u0e23\u0e32\u0e04\u0e32</div>\n\t<div style="position:absolute;top:4.55cm;left:0;width:9cm;height:13cm;text-align:center;" class="bl bb"></div>\n\t<div style="position:absolute;top:4.55cm;left:9cm;width:2.5cm;height:13cm;text-align:center;" class="bl bb"></div>\n\t<div style="position:absolute;top:4.55cm;left:11.5cm;width:2.5cm;height:13cm;text-align:center;" class="bl bb br"></div>\n\t')
        # SOURCE LINE 56

        sum_total=0
                
        
        __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['sum_total'] if __M_key in locals()]))
        # SOURCE LINE 58
        context.write(u'\n')
        # SOURCE LINE 59
        for i in range(c.max_items):
            # SOURCE LINE 60
            context.write(u'    \t<div style="position:absolute;top:')
            context.write(unicode(4.75 + (i * c.item_height)))
            context.write(u'cm;left:0.1cm;width:8.9cm;height:')
            context.write(unicode(c.item_height))
            context.write(u'cm;overflow:hidden;">\n')
            # SOURCE LINE 61
            if len(c.items) > i:
                # SOURCE LINE 62
                if c.items[i]['item_code']:
                    # SOURCE LINE 63
                    context.write(u'\t\t\t\t\t')
                    sum_total += c.items[i]['total'] 
                    
                    __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in [] if __M_key in locals()]))
                    context.write(u'\n\t\t\t  \t\t(')
                    # SOURCE LINE 64
                    context.write(unicode(c.items[i]['item_code']))
                    context.write(u')\n')
                # SOURCE LINE 66
                context.write(u'\t\t\t\t')
                context.write(unicode(c.items[i]['name']))
                context.write(u' \n')
                # SOURCE LINE 67
            else:
                # SOURCE LINE 68
                context.write(u'\t\t\t\t&nbsp;\n')
            # SOURCE LINE 70
            context.write(u'        </div>\n        <div style="position:absolute;top:')
            # SOURCE LINE 71
            context.write(unicode(4.75 + (i * c.item_height)))
            context.write(u'cm;left:9cm;width:2.5cm;text-align:right;">\n        \t')
            # SOURCE LINE 72
            context.write(unicode(number_format(c.items[i]['qty'], 2) if len(c.items) > i else '&nbsp;'))
            context.write(u'\n        </div>\n\t\t<div style="position:absolute;top:')
            # SOURCE LINE 74
            context.write(unicode(4.75 + (i * c.item_height)))
            context.write(u'cm;left:11.5cm;width:2.5cm;text-align:right;">\n        \t')
            # SOURCE LINE 75
            context.write(unicode(number_format(c.items[i]['total'], 2) if len(c.items) > i else '&nbsp;'))
            context.write(u'\n        </div>\n')
        # SOURCE LINE 78
        context.write(u'\n\t<div style="position:absolute;top:17.55cm;left:0;width:11.5cm;text-align:right;">\u0e23\u0e27\u0e21</div>\n\t<div style="position:absolute;top:17.55cm;left:11.5cm;width:2.5cm;text-align:right;" class="bl bb br">')
        # SOURCE LINE 80
        context.write(unicode(number_format(sum_total, 2)))
        context.write(u'</div>\n\t<div style="position:absolute;top:19.7cm;left:2.6cm;width:5cm;text-align:center">\n    \t')
        # SOURCE LINE 82
        context.write(unicode(c.user.fullname))
        context.write(u'\n    </div>\n    <div style="position:absolute;top:20.3cm;left:2.6cm;width:5cm;text-align:center">\n    \t\u0e40\u0e08\u0e49\u0e32\u0e2b\u0e19\u0e49\u0e32\u0e17\u0e35\u0e48\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19\n    </div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


