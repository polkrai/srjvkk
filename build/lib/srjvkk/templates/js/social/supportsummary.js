var SR = new Object();
var Event, Dom, Lang, $, DT;
/* Copyright (c) 2008 Shift Right Technology co. ltd. */
var loader = new YAHOO.util.YUILoader({
    require: ["button", "reset", "fonts", "base",
              "yahoo-dom-event", "element", "dragdrop",
              "datatable", "connection", "json", "container", "get",
              "datasource", "tabview", "autocomplete", "calendar",
              "srutils"],
    allowRollups: true,
    base: "/yui/",
    onSuccess: function() {
		Event = YAHOO.util.Event,
		Dom = YAHOO.util.Dom,
		Lang = YAHOO.lang,
		$ = Dom.get,
		DT = YAHOO.widget.DataTable;
        YAHOO.util.Event.onDOMReady(initComponents);
    },
    onFailure: function(){
        showMessageDialog("Error", "ไม่สามารถดึงโปรแกรมจาก server ได้สำเร็จ กรุณาลองใหม่อีกครั้ง",
        		YAHOO.widget.SimpleDialog.ICON_ERROR);
    }
});

loader.addModule({
	name: "srutils", //module name; must be unique
	type: "js", //can be "js" or "css"
    //path: "../js/social/niti.js",
    fullpath: "${h.url_for('/js/srutils.js')}", //can use a path instead, extending base path
    varName: "srutils" // a variable that will be available when the script is loaded.  Needed
                    // in order to act on the script immediately in Safari 2.x and below.
	//requires: ['yahoo', 'event'] //if this module had dependencies, we could define here
});

SR.mode = 0; //0 = Preview, 1 = Add, 2 = Edit

function initComponents(){
	initButtons();
    initMenu();
    $('startDate').value = getDateString(new Date(), true);
    $('endDate').value = getDateString(new Date(), true);
	SR.dlgWait = getWaitDialog();
	SR.results = [];
	Event.on('submit', 'formExport', function() {
		window.open('', 'print');
	});
}

function initMenu() {
	SR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {
		iframe:true
	});
	SR.toolbar.render()
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){
		var pos = Dom.getXY($('toolbar_pane'));
		Dom.setXY($('toolbar_pane'),[pos.X,window.scrollY]);
    });
}

function initButtons() {
	SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/socialreport/report_main')}";
    });
	SR.btnSearch = new YAHOO.widget.Button("btnSearch");
	SR.btnSearch.addListener("click", function() {
		var callback =
		{
			success: function(o) {
    	        SR.dlgWait.hide();
    	        rs = YAHOO.lang.JSON.parse(o.responseText);
    	        $('maleSpan').innerHTML = formatNumber(rs.male, 0);
    	        $('femaleSpan').innerHTML = formatNumber(rs.female, 0);
    	        $('totalSpan').innerHTML = formatNumber(rs.male + rs.female, 0);
    	        $('totalpriceSpan').innerHTML = formatNumber(rs.totalprice);
    	        $('canpaySpan').innerHTML = formatNumber(rs.canpay);
    	        $('supportSpan').innerHTML = formatNumber(rs.support);
			},
			failure: function(o) {
				SR.dlgWait.hide();
				showMessageDialog("Error", 'ไม่สามารถดำเนินการได้ ' + o.status,
						YAHOO.widget.SimpleDialog.ICON_BLOCK);
			}
		};
		SR.dlgWait.show();
		ajaxRequest('POST', 
				"${h.url_for('/socialreport/get_support_summary')}", callback,
				"start_date=" + $('startDate').value + 
				"&end_date=" + $('endDate').value + "&patient_type=" + 
				$('selectPatientType').value);
	});
//	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
//	SR.btnPrint.addListener("click", function() {
//		if (SR.summaryTable.datatable.getRecordSet().getRecords().length == 0) {
//			showMessageDialog("พิมพ์", "ไม่มีรายการ", YAHOO.widget.SimpleDialog.ICON_WARN);
//			return;
//		}
//		$('type').value = "print";
//		$('formExport').submit();
//	});
	
//	SR.btnExcel = new YAHOO.widget.Button("btnExcel");
//	SR.btnExcel.addListener("click", function() {
//		if (SR.summaryTable.datatable.getRecordSet().getRecords().length == 0) {
//			showMessageDialog("พิมพ์", "ไม่มีรายการ", YAHOO.widget.SimpleDialog.ICON_WARN);
//			return;
//		}
//		$('type').value = "excel";
//		$('formExport').submit();
//	});
	
    SR.calStartDate = initCalendar("calStartDate", "conStartDate", "btnStartDate", "startDate");
    SR.btnStartDate = new YAHOO.widget.Button("btnStartDate");
    SR.btnStartDate.addListener("click", function(e) {
        SR.calStartDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    $('startDate').readOnly = true;
    Dom.setStyle('startDate', 'background-color', 'lightyellow');
    SR.calEndDate = initCalendar("calEndDate", "conEndDate", "btnEndDate", "endDate");
    SR.btnEndDate = new YAHOO.widget.Button("btnEndDate");
    SR.btnEndDate.addListener("click", function(e) {
        SR.calEndDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    $('endDate').readOnly = true;
    Dom.setStyle('endDate', 'background-color', 'lightyellow');
    
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

    

