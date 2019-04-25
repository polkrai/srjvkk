from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
_magic_number = 2
_modified_time = 1553487205.378557
_template_filename='/usr/local/python2.5/lib/python2.5/site-packages/srjvkk-0.0.0dev-py2.5.egg/srjvkk/templates/finance/report/printitems.html'
_template_uri='/finance/report/printitems.html'
_template_cache=cache.Cache(__name__, _modified_time)
_source_encoding='utf-8'
_exports = []


def render_body(context,**pageargs):
    context.caller_stack.push_frame()
    try:
        __M_locals = dict(pageargs=pageargs)
        c = context.get('c', UNDEFINED)
        # SOURCE LINE 2
        from srjvkk import model 
        
        __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['model'] if __M_key in locals()]))
        context.write(u'\n')
        # SOURCE LINE 3
        from srjvkk.lib.base import number_format 
        
        __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['number_format'] if __M_key in locals()]))
        context.write(u'\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n        "http://www.w3.org/TR/html4/strict.dtd">\n<html>\n<head>\n    <title>\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e04\u0e48\u0e32\u0e43\u0e0a\u0e49\u0e08\u0e48\u0e32\u0e22</title>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n    <link rel="stylesheet" type="text/css" href="/css/page.css" />\n    <style type="text/css">\n<!--\nbody {\n\tfont-family: AngsanaUPC;\n\tfont-size: 20px;\n\tmargin: 0;\n\tpadding: 0;\n\tbackground-color: white;\n}\n\n.row {\n\tmargin: 5px;\n}\n\n.right {\n\ttext-align: right;\n}\n\n.bl {\n\tborder-left: black solid thin;\n}\n.bt {\n\tborder-top: black solid thin;\n}\n.bb {\n\tborder-bottom: black solid thin;\n}\n.br {\n\tborder-right: black solid thin;\n}\n-->\n    </style>\n</head>\n<body onload="window.print();">\n\t<div style="text-align:center;">\n\t\t<strong>\u0e42\u0e23\u0e07\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25\u0e08\u0e34\u0e15\u0e40\u0e27\u0e0a\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19\u0e23\u0e32\u0e0a\u0e19\u0e04\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c \u0e08.\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19</strong>\n\t</div>\n\t<div class="row">\n\t\t\u0e0a\u0e37\u0e48\u0e2d\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22<span class="answer-space">')
        # SOURCE LINE 49
        context.write(unicode(c.visit.patient.name))
        context.write(u'</span>\n\t\tHN<span class="answer-space">')
        # SOURCE LINE 50
        context.write(unicode(c.visit.patient.hn))
        context.write(u'</span>\n\t\t\u0e1a\u0e31\u0e15\u0e23\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e15\u0e31\u0e27\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e0a\u0e19<span class="answer-space">')
        # SOURCE LINE 51
        context.write(unicode(c.visit.patient.pa_people_number))
        context.write(u'</span><br />\n\t\t\u0e27\u0e31\u0e19/\u0e40\u0e14\u0e37\u0e2d\u0e19/\u0e1b\u0e35<span class="answer-space">')
        # SOURCE LINE 52
        context.write(unicode(model.DateUtil.toShortFormatDate(c.visit.time_add)))
        context.write(u'</span>\t\t\n\t</div>\n\t\n\t<div class="row">\n\t<table cellspacing="0" cellpadding="5">\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<th class="bl bt bb">\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23</th>\n\t\t\t\t<th class="bl bt bb">\u0e08\u0e33\u0e19\u0e27\u0e19(\u0e2b\u0e19\u0e48\u0e27\u0e22)</th>\n\t\t\t\t<th class="bl bt bb">\u0e23\u0e32\u0e04\u0e32\u0e15\u0e48\u0e2d\u0e2b\u0e19\u0e48\u0e27\u0e22</th>\n\t\t\t\t<th class="bl bt bb">\u0e08\u0e33\u0e19\u0e27\u0e19\u0e40\u0e07\u0e34\u0e19\u0e40\u0e1a\u0e34\u0e01\u0e44\u0e14\u0e49</th>\n\t\t\t\t<th class="bl bt bb">\u0e08\u0e33\u0e19\u0e27\u0e19\u0e40\u0e07\u0e34\u0e19\u0e40\u0e1a\u0e34\u0e01\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49</th>\n\t\t\t\t<th class="bl bt bb br">\u0e08\u0e33\u0e19\u0e27\u0e19\u0e40\u0e07\u0e34\u0e19\u0e2a\u0e38\u0e17\u0e18\u0e34</th>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody>\n\t\t\t')
        # SOURCE LINE 68
 
        totalsubsidy = 0
        totalpay = 0
        totalprice = 0
        group_id = -1
                                 
        
        __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['totalsubsidy','totalprice','totalpay','group_id'] if __M_key in locals()]))
        # SOURCE LINE 73
        context.write(u'\n')
        # SOURCE LINE 74
        for o in c.items:
            # SOURCE LINE 75
            context.write(u'\t\t\t')
 
            totalsubsidy += o.subsidy_amount
            totalpay += o.pay_amount
            totalprice += o.total_amount
                                    
            
            __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in [] if __M_key in locals()]))
            # SOURCE LINE 79
            context.write(u'\n')
            # SOURCE LINE 80
            if o.group_id == group_id:
                # SOURCE LINE 81
                context.write(u'\t\t\t<tr>\n\t\t\t\t<td class="bl">')
                # SOURCE LINE 82
                context.write(unicode(o.name))
                context.write(u' ')
                context.write(unicode('('+o.item_code+')' if o.item_code else ''))
                context.write(u'</td>\n\t\t\t\t<td class="right bl">')
                # SOURCE LINE 83
                context.write(unicode(number_format(o.qty, 0)))
                context.write(u'</td>\n\t\t\t\t<td class="right bl">')
                # SOURCE LINE 84
                context.write(unicode(number_format(o.price, 2)))
                context.write(u'</td>\n\t\t\t\t<td class="right bl">')
                # SOURCE LINE 85
                context.write(unicode(number_format(o.subsidy_amount, 2)))
                context.write(u'</td>\n\t\t\t\t<td class="right bl">')
                # SOURCE LINE 86
                context.write(unicode(number_format(o.pay_amount, 2)))
                context.write(u'</td>\n\t\t\t\t<td class="right bl br">')
                # SOURCE LINE 87
                context.write(unicode(number_format(o.total_amount, 2)))
                context.write(u'</td>\n\t\t\t</tr>\n')
                # SOURCE LINE 89
            else:
                # SOURCE LINE 90
                context.write(u'\t\t\t\t')

                group_id = o.group_id 
                                                
                
                __M_locals.update(dict([(__M_key, locals()[__M_key]) for __M_key in ['group_id'] if __M_key in locals()]))
                # SOURCE LINE 92
                context.write(u'\n\t\t\t <tr>\n\t\t\t\t<td class="bl bt"><b>')
                # SOURCE LINE 94
                context.write(unicode(o.group_name))
                context.write(u'</b></td>\n\t\t\t\t<td class="bl bt">&nbsp;</td>\n\t\t\t\t<td class="bl bt">&nbsp;</td>\n\t\t\t\t<td class="bl bt">&nbsp;</td>\n\t\t\t\t<td class="bl bt">&nbsp;</td>\n\t\t\t\t<td class="bl bt br">&nbsp;</td>\n\t\t\t</tr>\n\t\t\t<tr>\n\t\t\t\t<td class="bl bt">')
                # SOURCE LINE 102
                context.write(unicode(o.name))
                context.write(u' ')
                context.write(unicode('('+o.item_code+')' if o.item_code else ''))
                context.write(u'</td>\n\t\t\t\t<td class="right bt bl">')
                # SOURCE LINE 103
                context.write(unicode(number_format(o.qty, 0)))
                context.write(u'</td>\n\t\t\t\t<td class="right bt bl">')
                # SOURCE LINE 104
                context.write(unicode(number_format(o.price, 2)))
                context.write(u'</td>\n\t\t\t\t<td class="right bt bl">')
                # SOURCE LINE 105
                context.write(unicode(number_format(o.subsidy_amount, 2)))
                context.write(u'</td>\n\t\t\t\t<td class="right bt bl">')
                # SOURCE LINE 106
                context.write(unicode(number_format(o.pay_amount, 2)))
                context.write(u'</td>\n\t\t\t\t<td class="right bt bl br">')
                # SOURCE LINE 107
                context.write(unicode(number_format(o.total_amount, 2)))
                context.write(u'</td>\n\t\t\t</tr>\n')
        # SOURCE LINE 111
        context.write(u'\t\t\t<tr>\n\t\t\t\t<td colspan="3" class="bl bt bb">\u0e23\u0e27\u0e21</td>\n\t\t\t\t<td class="right bl bt bb">')
        # SOURCE LINE 113
        context.write(unicode(number_format(totalsubsidy, 2)))
        context.write(u'</td>\n\t\t\t\t<td class="right bl bt bb">')
        # SOURCE LINE 114
        context.write(unicode(number_format(totalpay, 2)))
        context.write(u'</td>\n\t\t\t\t<td class="right bl bt bb br">')
        # SOURCE LINE 115
        context.write(unicode(number_format(totalprice, 2)))
        context.write(u'</td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t</div>\n\t<div class="row" style="margin-top: 60px;margin-right: 50px;">\n\t\t<div class="right">\u0e25\u0e07\u0e0a\u0e37\u0e48\u0e2d<span>..........................................</span>\u0e1c\u0e39\u0e49\u0e1b\u0e48\u0e27\u0e22/\u0e1c\u0e39\u0e49\u0e23\u0e31\u0e1a\u0e22\u0e32\u0e41\u0e17\u0e19</div>\n\t\t<div class="right" style="margin-right:90px">(<span>............................................</span>)</div>\n\t</div>\n</body>\n</html>')
        return ''
    finally:
        context.caller_stack.pop_frame()


