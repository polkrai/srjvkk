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

function reloadPage(vnId, paId, qcalled, stationId) {
	$('pa_id').value = paId;
	$('vn_id').value = vnId;
	$('qcalled').value = qcalled;
	$('station_id').value = stationId;
	SR.stationId = stationId;
	//initComponents();
	SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    SR.currentPatientId = paId;
    SR.paymentHistoryTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
        success : SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
        failure : SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
        scope : SR.paymentHistoryTable.datatable
    });
}

function initComponents(){
	var paId = $('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    SR.currentPatientId = paId;
    var qcalled = $('qcalled').value;
    if (qcalled == "true")
        qcalled = true;
    else
        qcalled = false;
    
    var vnId = $('vn_id').value;
    if (vnId == undefined || vnId == '')
    	vnId = -1;
    SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    initPaymentHistoryButtons();
    SR.paymentHistoryTable = initPaymentHistoryTable();
    SR.paymentHistoryItemTable = initPaymentHistoryItemTable();
    Event.addListener($('txt-search'), "keypress", function(e) {
    	var keynum;	
    	if(window.event) // IE
    	{
    		keynum = e.keyCode;
    	}
    	else if(e.which) // Netscape/Firefox/Opera
    	{
    		keynum = e.which;
    	}
    	if (keynum == 13)
    		searchReceipt();
    });
    initMenu();
    
    SR.dlgInput = inputDialog("ยกเลิกใบเสร็จ", "สาเหตุการยกเลิก",
		function() {
	    	var dt = SR.paymentHistoryTable.datatable;            
	        var rows = dt.getSelectedRows();
	        var rec = SR.paymentHistoryTable.datatable.getRecord(rows[0]);
			$('cancel-reason').value = this.getValue();
	    	$('receipt-id').value = rec.getData("id");
	    	var callback =
			{
				success: function(o) {
	        		showMessageDialog("Info", 'ยกเลิกเรียบร้อยแล้ว', YAHOO.widget.SimpleDialog.ICON_INFO);
	        		parent.frmpayment.reloadPage(SR.currentVnId, SR.currentPatientId, SR.qcalled, SR.stationId);
	        		
		        	SR.paymentHistoryTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
		                success : SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
		                failure : SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
		                scope : SR.paymentHistoryTable.datatable
		            });
				},
				failure: function(o) {
					showMessageDialog("Error", 'ไม่สามารถยกเลิกใบเสร็จได้ ' + o.status, YAHOO.widget.SimpleDialog.ICON_BLOCK);
				}
			};
			YAHOO.util.Connect.setForm($('form'));
			var cObj = YAHOO.util.Connect.asyncRequest('POST', 
					"${h.url_for('/finance/cancel_receipt')}", callback);
			this.hide();
		},
		function() {
			this.cancel();
		}
    );
}

function initMenu() {
	SR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {
		iframe:true
	});
	SR.toolbar.render();
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){
		var pos = Dom.getXY($('toolbar_pane'));
		Dom.setXY($('toolbar_pane'),[pos.X,window.scrollY]);
    });
}

function searchReceipt() {
	var keyword = $('txt-search').value;
	$('txt-search').value = '';
	
	var t = setTimeout(function () {
		SR.paymentHistoryTable.datasource.sendRequest("pa_id=" + SR.currentPatientId +
			"&query=" + keyword, {
	        success : SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
	        failure : SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
	        scope : SR.paymentHistoryTable.datatable
	    });
	}, 2000);
}

function initPaymentHistoryButtons() {
	SR.btnSearch = new YAHOO.widget.Button("btn-search");
	SR.btnSearch.addListener("click", function() {
		searchReceipt();
	});
	
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
	SR.btnPrint.addListener("click", function() {
		var rows = SR.paymentHistoryTable.datatable.getSelectedRows();
		if (rows.length == 0)  {
			showMessageDialog("Warn", 'กรุณาเลืิอกใบเสร็จที่ต้องการพิมพ์', YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		if (parent.setWorking) {
        	parent.setWorking(false);
        }
		var rec = SR.paymentHistoryTable.datatable.getRecord(rows[0]);
		confirmDialog("พิมพ์ใบเสร็จ", "ต้องการพิมพ์ใบเสร็จ เลขที่ " + rec.getData("no") + " ซ้ำหรือไม่",
				function() {
					window.open("${h.url_for('/finance/print_receipt?receipt_id=')}" + rec.getData("id"), 
							'receiptwindow', 'width=650,height=700');
					searchReceipt();
    		        this.hide();
				},
				function() {
					this.hide();
				}
		)
	});
	
    SR.btnCancelReceipt = new YAHOO.widget.Button("btnCancelReceipt");
    SR.btnCancelReceipt.addListener("click", function(){
    	var dt = SR.paymentHistoryTable.datatable;            
        var rows = dt.getSelectedRows();
        
        if (rows.length == 0) {
        	showMessageDialog("Warn", 'กรุณาเลือกใบเสร็จที่ต้องการยกเลิก', YAHOO.widget.SimpleDialog.ICON_WARN);
        	return;
        }
        var rec = dt.getRecord(rows[0]);
        if (parent.setWorking) {
        	parent.setWorking(false);
        }
        
        var msg = "ต้องการยกเลิกใบเสร็จ เลขที่ " + rec.getData("no");
        if (!rec.getData("no")) {
        	msg = "ต้องการยกเลิกรายการเรียกเก็บเงิน";
        }
        confirmDialog("ยกเลิกใบเสร็จ", msg,
				function() {
        			this.hide();
        			SR.dlgInput.show();
				},
				function() {
					this.hide();
				}
		)
        
    });
    //SR.btnPrintReceipt = new YAHOO.widget.Button("btnPrintReceipt");
}

function initPaymentHistoryTable() {
    var historyTable = new function() {
        this.coldefs =
            [{key:"sent", label:"นำส่ง", formatter:checkPainter},
             {key:"no", label:"เลขที่ใบเสร็จ"},
             {key:"date", label:"วันที่ใบเสร็จ", formatter:dateFormatter},
             {key:"printno", label:"จำนวนครั้งที่ำพิมพ์"},
             {key:"receive_amount", label:"รับเงิน", formatter:numberFormatter, className:'dt-number'},
             {key:"support_amount", label:"สงเคราะห์", formatter:numberFormatter, className:'dt-number'},
             {key:"subsidy_amount", label:"เบิกได้", formatter:numberFormatter, className:'dt-number'},
             {key:"discount", label:"ส่วนลด", formatter:numberFormatter, className:'dt-number'},
             {key:"deposit", label:"ค่ามัดจำ", formatter:numberFormatter, className:'dt-number'},
             {key:"patient_type", label:"ประเภทผู้ป่วย"},
             {key:"privilege", label:"สิทธิ์"},
             {key:"id", hidden:true}];
        this.query = "pa_id=" + SR.currentPatientId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/payment_history')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"payment_history",
                fields:["no", {key:"date", parser:parseDate}, "amount", "patient_type", "id",
                        "receive_amount", "support_amount", "subsidy_amount",
                        "privilege", "discount", "deposit", "printno", "sent"]}});
        this.datatable = new YAHOO.widget.DataTable("payment_history",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"200px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
        this.handleClicked = function(oArgs, arg2){
            var row = historyTable.datatable.getRow(oArgs.target);
            historyTable.datatable.unselectAllRows();
            historyTable.datatable.selectRow(row);

        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        
        this.handleRowSelected = function (oArgs) {
            var rid = oArgs.record.getData("id");
            var vcs = SR.paymentHistoryItemTable.datasource;
            var vct = SR.paymentHistoryItemTable.datatable;
            var oCallback = {
                success : vct.onDataReturnInitializeTable,
                failure : vct.onDataReturnInitializeTable,
                scope : vct
            };
            vcs.sendRequest("receipth_id=" + rid, oCallback);
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
        
        this.handleRendered = function () {
            if (SR.paymentHistoryTable.datatable.getRecordSet().getRecords().length > 0) {
                SR.paymentHistoryTable.datatable.selectRow(0);
            } else {
                SR.paymentHistoryItemTable.datasource.sendRequest("receipth_id=-1", {
                    success:SR.paymentHistoryItemTable.datatable.onDataReturnInitializeTable,
                    failure:SR.paymentHistoryItemTable.datatable.onDataReturnInitializeTable,
                    scope:SR.paymentHistoryItemTable.datatable
                })
            }
        }
        this.datatable.subscribe("postRenderEvent", this.handleRendered);
    }
    return historyTable;
}

function initPaymentHistoryItemTable() {
    var itemTable = new function() {
        this.coldefs =
        [
        {key:"code", label:"รหัส"},
        {key:"item", label:"รายการค่าใช้จ่าย", resizeable:true},
        {key:"amount", label:"จำนวนเงิน",formatter:numberFormatter, className:'dt-number'},
        {key:"subsidy", label:"เบิกได้",formatter:numberFormatter, className:'dt-number'}
        ];
        //if (receiptHId==null)
        //    receiptHId = -1;
        this.query = "receipth_id=-1";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/payment_history_item')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"items",
                fields:["code", "item", "amount", "subsidy"]}});
        this.datatable = new YAHOO.widget.DataTable("payment_history_item",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"400px",
                initialRequest:this.query});
    }
    return itemTable;
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

    

