var url = new Object();
url.med = new Object();
url.medrec = new Object();
url.ipd = new Object();
url.filter = new Object();
url.social = new Object();
url.finance = new Object();
url.drug = new Object();
url.psyco = new Object();

url.med.treatment = "/jitavej/user/iframe?mode=history";
url.med.appointment = "/jitavej/user/iframe?mode=appointment";
url.med.referSend = "/jitavej/user/iframe?mode=refersend";
url.med.referReply = "/jitavej/user/iframe?mode=referreply";
url.medrec.general = "/nano/iframe/rec_iframe.php?";
url.medrec.search = "/nano/iframe/rec_iframe.php?opt=search";
url.psyco.appointment = "/miracle/evencal?";
url.psyco.reports = "/miracle/evencal/index.php/report_psyco";
url.ipd.general = "/jvkk_ipd/base_data.php?";
url.ipd.admitinfo = "/miracle/ci_sample_ipd/index.php/ipdmain/historyIpd?";
url.filter.filter = "/jvkk_filter/iframe_history.php?";
url.social.background = "${h.url_for('/social/background?')}";
url.finance.payment = "${h.url_for('/finance/payment_page?')}";
url.drug.print = "/nano/components/com_confirmdrug/drug_order_reprint.php?";

var readonlyColor = 'lightyellow';
var normalColor = 'white';

function getCurrentDate() {
	var now = new Date();
	var date = now.getDate() + "/" + (now.getMonth() + 1) + "/" + (now.getFullYear() + 543);
	return date;
}

function checkNumber(e)
{
	var keynum;
	var keychar;
	var numcheck;
	
	if(window.event) // IE
	{
		keynum = e.keyCode;
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which;
	}
	keychar = String.fromCharCode(keynum);
	numcheck = /\d/;
	var isNumber = numcheck.test(keychar);
	if (keynum == 8 || keynum == 46 || keynum == 37 || 
			keynum == 38 || keynum == 39 || keynum == 40 ||
			keynum == 13)
		isNumber = true;
	if (!isNumber)
		alert('กรุณากรอกตัวเลข');
	return isNumber;
}

function formatNumber(value, decimal) {
	if (!YAHOO.lang.isNumber(decimal)) {
		decimal = 2;
	}
	return YAHOO.util.Number.format(value,{decimalPlaces:decimal,thousandsSeparator:','});
}

function formatDate(oData) {
	if (oData.getDate) {
		return oData.getDate() + "/" + (oData.getMonth() + 1) + "/" + (oData.getFullYear() + 543);
	} else {
		return '';
	}
}

function parseNumber(value) {
	return parseFloat(value.replace(',', ''));
}

function getDateString(date, isThai) {
	var year = date.getFullYear();
	if (isThai)
		year += 543;
	return date.getDate() + "/" + (date.getMonth() + 1) + "/" + year;
}

function integerFormatter(elCell, oRecord, oColumn, oData) {
	elCell.innerHTML = formatNumber(oData, 0);						
}

function numberFormatter(elCell, oRecord, oColumn, oData) {
	elCell.innerHTML = formatNumber(oData);						
}

function dateFormatter(elCell, oRecord, oColumn, oData) {
	if (oData == null) {
		elCell.innerHTML = '';
	} else {
		elCell.innerHTML = oData.getDate() + "/" + (oData.getMonth() + 1) + "/" + (oData.getFullYear() + 543);
	}
}

function checkPainter(elCell, oRecord, oColumn, oData) {    
	if(oData) {
        elCell.innerHTML = ' <img width="22px" height="22px" src="/img/paid.png" />';
    }
    else {
        elCell.innerHTML = ' <img width="16px" height="16px" src="/img/unpaid.png"/>';
    }
}

function getWaitDialog() {
	var dlgWait = 
		new YAHOO.widget.Panel("wait",  
			{ width:"240px", 
			  fixedcenter:true, 
			  close:false, 
			  draggable:false, 
			  zindex:4,
			  modal:true,
			  visible:false
			} 
		);

	dlgWait.setHeader("กรุณารอสักครู่...");
	dlgWait.setBody('<img src="/img/loading.gif" />');
	dlgWait.render(document.body);
	return dlgWait;
}

function getPaginator(rowPerPage, pageLinks) {
	var paginator = new YAHOO.widget.Paginator({
        rowsPerPage: rowPerPage,
        pageLinks : pageLinks,
        firstPageLinkLabel:"<< หน้่าแรก",
        previousPageLinkLabel:"< ก่อนหน้า",
        nextPageLinkLabel:"> ถัดไป",
        lastPageLinkLabel:">> หน้าสุดท้าย"
    });
	return paginator;
}

function inputDialog(header, msg, handleOk, handleCancel) {
	$('dlg-inp-hd').innerHTML = header;
	$('dlg-inp-msg').innerHTML = msg;
	var dlg = new YAHOO.widget.Dialog("dlg-input", 
			{ width : "30em",
			  fixedcenter : true,
			  visible : false, 
			  modal: true,
			  draggable: true,
			  constraintoviewport : true,
			  buttons : [ { text:"ตกลง", handler:handleOk, isDefault:true },
						  { text:"ยกเลิก", handler:handleCancel } ]
			 } );
	dlg.getValue = function() {
		return $('dlg-inp-value').value;
	}
	
	dlg.showEvent.subscribe(function() {
		$('dlg-inp-value').focus();
	});
	dlg.render(document.body);
	return dlg;
}

function confirmDialog(header, msg, handleYes, handleNo) {
	var dlgConfirm = new YAHOO.widget.SimpleDialog("dlg-confirm", 
	         { width: "300px",
	           fixedcenter: true,
	           visible: false,
	           draggable: false,
	           close: true,
	           modal:true,
	           text: msg,
	           icon: YAHOO.widget.SimpleDialog.ICON_HELP,
	           constraintoviewport: true,
	           buttons: [ { text:"ใช่", handler:handleYes },
	                      { text:"ไม่",  handler:handleNo, isDefault:true} ]
	         });
	dlgConfirm.setHeader(header);
		// Render the Dialog
	dlgConfirm.render(document.body);

	dlgConfirm.show();
	return dlgConfirm;
}

function confirmInstantDelete(msg, url, callback) {
	var handleYes = function() {
        ajaxRequest('POST', url, callback, null);
        if (callback && callback.confirm) {
        	callback.confirm();
        }
		this.hide();
	};
	var handleNo = function() {
		if (callback && callback.cancel) {
        	callback.cancel();
        }
		this.hide();
	};

	// Instantiate the Dialog
	var dlgConfirmDel = new YAHOO.widget.SimpleDialog("dlgDelete", 
         { width: "300px",
           fixedcenter: true,
           visible: false,
           draggable: false,
           close: true,
           modal:true,
           text: msg,
           icon: YAHOO.widget.SimpleDialog.ICON_HELP,
           constraintoviewport: true,
           buttons: [ { text:"ใช่", handler:handleYes },
                      { text:"ไม่",  handler:handleNo, isDefault:true} ]
         });
	dlgConfirmDel.setHeader("ลบข้อมูล");
	
	// Render the Dialog
	dlgConfirmDel.render(document.body);
    dlgConfirmDel.show();
}

function confirmDelete(datatable, rec, delArray, msg) {
	var handleYes = function() {
        var oid = rec.getData("id");
        if (oid != undefined && oid != -1) {
            delArray.push({id:oid});
        }
        datatable.deleteRow(rec);
		this.hide();
	};
	var handleNo = function() {
		this.hide();
	};

	// Instantiate the Dialog
	var dlgConfirmDel = new YAHOO.widget.SimpleDialog("dlgDelete", 
         { width: "300px",
           fixedcenter: true,
           visible: false,
           draggable: false,
           close: true,
           modal:true,
           text: msg,
           icon: YAHOO.widget.SimpleDialog.ICON_HELP,
           constraintoviewport: true,
           buttons: [ { text:"ใช่", handler:handleYes },
                      { text:"ไม่",  handler:handleNo, isDefault:true} ]
         });
	dlgConfirmDel.setHeader("ลบข้อมูล");
	
	// Render the Dialog
	dlgConfirmDel.render(document.body);
    dlgConfirmDel.show();
}

function srDelPainter(elCell, oRecord, oColumn, oData, mode) {    
	if (mode == 0) {
		elCell.innerHTML = "<span style='opacity:0.3;'><a href='#del'><img src='/img/del.png'></a></span>";
	} else {
		elCell.innerHTML = "<a href='#del'><img src='/img/del.png'></a>";
	}
}

function oitypeFormatter(elCell, oRecord, oColumn, oData) {    
	if (oData == "in") {
		elCell.innerHTML = "<img src='/img/ipd.png'>";
	} else {
		elCell.innerHTML = "";
	}
}

function appointRowFormatter(elTr, oRecord) { 
	if (oRecord.getData('appointed')) { 
		Dom.addClass(elTr, 'mark');
	} 
	return true; 
};  

function parseDate(oData) {
	if (oData == '' || oData == undefined || oData == null) return null;
	var arrDate = oData.split('/');
	var date = parseInt(arrDate[0], 10);
	var month = parseInt(arrDate[1], 10);
	var year = parseInt(arrDate[2], 10);
	
	return new Date(year, month-1, date);
}

function getDateCellEditor() {
	var e = new YAHOO.widget.DateCellEditor();
	e.calendar.cfg.setProperty("DATE_FIELD_DELIMITER", ".");
	e.calendar.cfg.setProperty("MDY_DAY_POSITION", 1);
	e.calendar.cfg.setProperty("MDY_MONTH_POSITION", 2);
	e.calendar.cfg.setProperty("MDY_YEAR_POSITION", 3);

	e.calendar.cfg.setProperty("MD_DAY_POSITION", 1);
	e.calendar.cfg.setProperty("MD_MONTH_POSITION", 2);

	// Date labels for Thai locale

	e.calendar.cfg.setProperty("MONTHS_SHORT",   ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ษ.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]);
	e.calendar.cfg.setProperty("MONTHS_LONG",    ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]);
	e.calendar.cfg.setProperty("WEEKDAYS_1CHAR", ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]);
	e.calendar.cfg.setProperty("WEEKDAYS_SHORT", ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]);
	e.calendar.cfg.setProperty("WEEKDAYS_MEDIUM",["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]);
	e.calendar.cfg.setProperty("WEEKDAYS_LONG",  ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"]);
	return e;
}

function ajaxRequest(method, url, callback, params) {
	var AjaxObject = {
    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest(method, url, 
    			   callback, params);
    	}
    };
    AjaxObject.startRequest();
}

function getActions(comid) {
	var callback =
    {
        success:function(o) {
			try { 
	            var results = YAHOO.lang.JSON.parse(o.responseText);
	            var options = "";
	            for (var i = 0; i < results.length; i++) {
	            	options += "<option value='" + results[i].action_id + "'>" +
	            		results[i].action_name + "</option>";
	            }
	            $('select_action').innerHTML = options;
	        } 
	        catch (e) { 
	            alert("Invalid Actions"); 
	        } 
		},
        failure:function(o) {
			alert('ไม่สามารถเชื่อมต่อกับ Server ได้ : ' + o.statusText);
		}
    };
	
	ajaxRequest('POST', "${h.url_for('/srutil/get_actions')}", callback, "comid=" + comid);
}

function getAllowedActions(comid, select) {
	var callback =
    {
        success:function(o) {
			try { 
	            var results = YAHOO.lang.JSON.parse(o.responseText);
	            var options = "";
	            for (var i = 0; i < results.length; i++) {
	            	options += "<option value='" + results[i].aid + "'>" +
	            		results[i].cname + " - " + results[i].aname + "</option>";
	            }
	            select.innerHTML = options;
	        } 
	        catch (e) { 
	            alert("Invalid Actions"); 
	        } 
		},
        failure:function(o) {
			alert('ไม่สามารถเชื่อมต่อกับ Server ได้ : ' + o.statusText);
		}
    };
	
	ajaxRequest('POST', "${h.url_for('/srutil/get_allowed_actions')}", callback, "com_id=" + comid);
}

function messageDialog(header, msg, icon) {
	var dlg = new YAHOO.widget.SimpleDialog("dlg", { 
		width: "30em", 
		fixedcenter:true,
		modal:true,
	    visible:false,
		draggable:false,
		constraintoviewport: true,
		icon:icon,
		buttons: [ { text:"Ok", handler:function() {this.hide()}, isDefault:true }]
		});
	dlg.setHeader(header);
	dlg.setBody(msg);
	dlg.render(document.body);
	dlg.show();
}

function initCalendar(calName, conName, btnId, txtId) {
    var container = new function() {
        this.calendar = new YAHOO.widget.Calendar(calName, {
            iframe:false,          // Turn iframe off, since container has iframe support.
            hide_blank_weeks:true,  // Enable, to demonstrate how we handle changing height, using changeContent
            navigator:true
        });
        
        // Correct formats for Germany: dd.mm.yyyy, dd.mm, mm.yyyy

		this.calendar.cfg.setProperty("DATE_FIELD_DELIMITER", ".");

		this.calendar.cfg.setProperty("MDY_DAY_POSITION", 1);
		this.calendar.cfg.setProperty("MDY_MONTH_POSITION", 2);
		this.calendar.cfg.setProperty("MDY_YEAR_POSITION", 3);

		this.calendar.cfg.setProperty("MD_DAY_POSITION", 1);
		this.calendar.cfg.setProperty("MD_MONTH_POSITION", 2);

		// Date labels for German locale

		this.calendar.cfg.setProperty("MONTHS_SHORT",   ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ษ.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]);
		this.calendar.cfg.setProperty("MONTHS_LONG",    ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]);
		this.calendar.cfg.setProperty("WEEKDAYS_1CHAR", ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]);
		this.calendar.cfg.setProperty("WEEKDAYS_SHORT", ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]);
		this.calendar.cfg.setProperty("WEEKDAYS_MEDIUM",["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]);
		this.calendar.cfg.setProperty("WEEKDAYS_LONG",  ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"]);

        
        this.dialog = new YAHOO.widget.Dialog(conName, {
            context:["show", "tl", "bl"],
            //buttons:[ {text:"Select", isDefault:true, handler: okHandler}, 
            //          {text:"Cancel", handler: cancelHandler}],
            width:"16em",  // Sam Skin dialog needs to have a width defined (7*2em + 2*1em = 16em).
            draggable:false,
            close:true,
            iframe: true
        });

        this.dialog.showEvent.subscribe(function() {
            var pos = YAHOO.util.Dom.getXY(btnId);
            pos[1] += YAHOO.util.Dom.get(btnId).offsetHeight + 2;
            this.cfg.setProperty("xy", pos);
        });
        
        this.calendar.render();
        this.dialog.render();
        

        // Using dialog.hide() instead of visible:false is a workaround for an IE6/7 container known issue with border-collapse:collapse.
        this.dialog.hide();

        this.calendar.renderEvent.subscribe(function() {
            // Tell Dialog it's contents have changed, Currently used by container for IE6/Safari2 to sync underlay size
            this.dialog.fireEvent("changeContent");
        });

        function handleSelect(type,args,obj) {
    		var dates = args[0];
    		var date = dates[0];
    		var year = date[0] + 543, month = date[1], day = date[2];

    		document.getElementById(txtId).value = day + "/" + month + "/" + year;
    		//var txtDate = document.getElementById(txtId);
            //txtDate.value = day + "/" + month + "/" + year;
            container.dialog.hide();
    	}   

        this.calendar.selectEvent.subscribe(handleSelect, this.calendar, true);

     
    }
    return container;
}

function padLeft(str, pad, count) {
	while(str.length<count)
		str=pad+str;
	return str;
}

function TimePicker(elId) {
	this.elId = elId;
	this.el = document.getElementById(elId);
	this.hourEl = document.createElement("select");
	this.hourEl.parent = this;
	this.selectedHour = 8;
	this.selectedMin = 0;
	for (var i = 0; i < 24; i++) {
		var option = document.createElement("option");
		option.value = i;
		option.text = padLeft(i + "", '0', 2);
		if (i == 8)
			option.selected = true;
		this.hourEl.options.add(option);
	}
	this.minEl = document.createElement("select");
	this.minEl.parent = this;
	for (var i = 0; i < 60; i++) {
		if (i % 5 == 0) {
			var option = document.createElement("option");
			option.value = i;
			option.text = padLeft(i + "", '0', 2);
			if (i == 0)
				option.selected = true;
			this.minEl.options.add(option);
		}
	}
	this.hourEl.addEventListener('change', function(ev) {
		this.parent.selectedHour = this.options[this.selectedIndex].value;
	}, false);
	this.minEl.addEventListener('change', function(ev) {
		this.parent.selectedMin = this.options[this.selectedIndex].value;
	}, false);
	this.el.appendChild(this.hourEl);
	this.el.appendChild(document.createTextNode(":"));
	this.el.appendChild(this.minEl);
	return this;
}

function overlayMenu(id) {
	var toolbar = new YAHOO.widget.Overlay(id, {
		iframe:true
	});
	toolbar.render();
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(evt, args, id){
		var pos = YAHOO.util.Dom.getXY(YAHOO.util.Dom.get(id));
		YAHOO.util.Dom.setXY(YAHOO.util.Dom.get(id),[pos.X,window.scrollY]);
    }, id);
	return toolbar;
}