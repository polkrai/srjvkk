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
	SR.receiptTable = initReceiptTable();
	SR.dlgWait = getWaitDialog();
	SR.receipts = [];
	SR.total = 0;
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
        window.location = "${h.url_for('/financereport/report_main')}";
    });
	SR.btnSearch = new YAHOO.widget.Button("btnSearch");
	SR.btnSearch.addListener("click", function() {
		SR.dlgWait.show();
		SR.receiptTable.datasource.sendRequest("start_date=" + $('startDate').value + 
        	"&end_date=" + $('endDate').value + "&station_id=" + $('selectStation').value +
        	"&cancelled=" + $('selectCancel').value, {
        	success : function(oRequest, oResponse, oPayload) {
							var total = 0;
							for (var i = 0; i < oResponse.results.length; i++) {
								total += oResponse.results[i].receive_amount;
							}
							SR.receipts = oResponse.results;
							SR.total = total;
							$('totalSpan').innerHTML = formatNumber(total);
							SR.receiptTable.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
							SR.dlgWait.hide();
					  },
            failure : SR.receiptTable.datatable.onDataReturnInitializeTable,
            scope : SR.receiptTable.datatable
		});
	});
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
	SR.btnPrint.addListener("click", function() {
		if (SR.receiptTable.datatable.getRecordSet().getRecords().length == 0) {
			showMessageDialog("พิมพ์", "ไม่มีรายการ", YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		var station = $('selectStation').options[$('selectStation').selectedIndex].text;
		var start_date = $('startDate').value;
		var end_date = $('endDate').value;
		var callback =
	    {
	        	success:function(o) {
					var print_window= window.open ("",
							"mywindow1","status=1,width=0,height=0");
					print_window.document.write(o.responseText);
				},
	        	failure:function(o) {
					showMessageDialog("Error", "ไม่สามารถพิมพ์ได้", o.status,
							YAHOO.widget.SimpleDialog.ICON_BLOCK);
				},
	        	scope: this
	    };
		ajaxRequest('POST', "${h.url_for('/financereport/print_receipts')}", 
				callback, "station=" + station +  
				"&start_date=" + start_date + "&end_date=" + end_date + 
				"&total=" + SR.total + "&receipts=" + YAHOO.lang.JSON.stringify(SR.receipts));
	});
	
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

function initReceiptTable() {
    var receiptTable = new function() {
        this.coldefs =
        	[{key:"no", label:"ลำดับที่"},
        	 {key:"sent", label:"นำส่ง", formatter:checkPainter},
             {key:"code", label:"เลขที่ใบเสร็จ"},
             {key:"date", label:"วันที่ใบเสร็จ"},
             {key:"hn"},
             {key:"an"},
             {key:"receive_amount", label:"รับเงิน", formatter:numberFormatter, className:'dt-number'},
             {key:"subsidy_amount", label:"เบิกได้", formatter:numberFormatter, className:'dt-number'},
             {key:"support_amount", label:"สงเคราะห์", formatter:numberFormatter, className:'dt-number'},
             {key:"discount", label:"ส่วนลด", formatter:numberFormatter, className:'dt-number'},
             {key:"deposit", label:"ค่ามัดจำ", formatter:numberFormatter, className:'dt-number'},
             {key:"patient_type", label:"ประเภทผู้ป่วย"},
             {key:"cancelled", label:"ยกเลิก", formatter:checkPainter},
             {key:"cancelled_date", label:"วันที่ยกเลิก"},
             {key:"cancel_reason", label:"สาเหตุการยกเลิก"},
             {key:"cancelled_by", label:"ยกเลิกโดย"},
             ];
        this.query = "start_date=" + $('startDate').value + 
        	"&end_date=" + $('endDate').value + "&station_id=-1";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/financereport/get_receipts')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"receipts",
            	fields:["no", "code", "date", "amount", 
            	        "patient_type", "id", "receive_amount", "support_amount", 
            	        "subsidy_amount", "privilege", "discount", "deposit", 
            	        "printno", "sent", "cancelled", 
            	        "cancelled_date",
            	        "cancel_reason", "cancelled_by", "hn", "an"]}});
        this.datatable = new YAHOO.widget.DataTable("receiptTable",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"300px",
                initialRequest:this.query});

    }
    return receiptTable;
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

    

