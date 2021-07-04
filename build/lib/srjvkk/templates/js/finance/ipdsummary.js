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

function reloadPage(vnId, paId) {
	$('pa_id').value = paId;
	$('vn_id').value = vnId;
	SR.currentVnId = vnId;
    SR.currentPatientId = paId;
    SR.admitTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
        success : SR.admitTable.datatable.onDataReturnInitializeTable,
        failure : SR.admitTable.datatable.onDataReturnInitializeTable,
        scope : SR.admitTable.datatable
    });

}

function initComponents(){
	var paId = $('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    SR.currentPatientId = paId;
    
    var vnId = $('vn_id').value;
    if (vnId == undefined || vnId == '')
    	vnId = -1;
    SR.currentVnId = vnId;
    initButtons();
    initMenu();
    SR.admitTable = initAdmitTable();
    SR.diagTable = initDiagTable();
    SR.homeVisitTable = initHomeVisitTable();
    SR.expenseTable = initExpenseTable();
    SR.receiptTable = initReceiptTable();
    SR.expense = null;
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

function initButtons() {
	
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
	SR.btnPrint.addListener("click", function() {
		var rows = SR.admitTable.datatable.getSelectedRows();
		if (rows.length == 0)  {
			showMessageDialog("Warn", 'กรุณาเลืิอกประวัติการ admit ที่ต้องการพิมพ์', YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		if (parent.setWorking) {
        	parent.setWorking(false);
        }
		var rec = SR.admitTable.datatable.getRecord(rows[0]);
		window.open("${h.url_for('/financereport/print_ipdsummary?vn_id=')}" + rec.getData("vn_id"), 
			'ipdsummary');
				
	});
	
	SR.btnPrintExpense = new YAHOO.widget.Button("btnPrintExpense");
	SR.btnPrintExpense.addListener("click", function() {
		var rows = SR.admitTable.datatable.getSelectedRows();
		if (rows.length == 0)  {
			showMessageDialog("Warn", 'กรุณาเลือกประวัติการ admit ที่ต้องการพิมพ์', YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		if (parent.setWorking) {
        	parent.setWorking(false);
        }
		var rec = SR.admitTable.datatable.getRecord(rows[0]);
		window.open("${h.url_for('/financereport/print_expense?vn_id=')}" + rec.getData("vn_id"), 
			'ipdsummary');
				
	});
}

function initAdmitTable() {
    var admitTable = new function() {
        this.coldefs =
            [{key:"an", label:"AN"},
             {key:"building", label:"ตึก"},
             {key:"admit_date", label:"วันที่รับ", formatter:dateFormatter},
             {key:"discharge_date", label:"วันที่จำหน่าย", formatter:dateFormatter},
             {key:"dc_status", label:"สถานภาพการจำหน่าย"},
             {key:"dc_type", label:"ประเภทการจำหน่าย"},
             {key:"doctor", label:"แพทย์ผู้รักษา"},
             {key:"days", label:"จำนวนวันที่อยู่รักษา"},
             {key:"privilege", label:"สิทธิ์"},
             {key:"claim_code", label:"Claim Code"},
             {key:"refer_hosp", label:"หน่วยบริการหลัก"},
             {key:"vn_id", hidden:true}
             ];
        this.query = "pa_id=" + SR.currentPatientId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/financereport/admit_history')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"admit_history",
                fields:["an", "building", {key:"admit_date", parser:parseDate}, 
                        {key:"discharge_date", parser:parseDate}, "vn_id",
                        "privilege", "dc_status", "dc_type", "doctor", "days",
                        "home_days", "claim_code", "refer_hosp"]}});
        this.datatable = new YAHOO.widget.DataTable("admit-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"100px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
        this.handleClicked = function(oArgs, arg2){
            var row = admitTable.datatable.getRow(oArgs.target);
            admitTable.datatable.unselectAllRows();
            admitTable.datatable.selectRow(row);

        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        
        this.handleRowSelected = function (oArgs) {
            var vnId = oArgs.record.getData("vn_id");
            $("totalhomevisit").innerHTML = oArgs.record.getData("home_days");
            SR.diagTable.datasource.sendRequest("vn_id=" + vnId, {
                success : SR.diagTable.datatable.onDataReturnInitializeTable,
                failure : SR.diagTable.datatable.onDataReturnInitializeTable,
                scope : SR.diagTable.datatable
            });
            SR.homeVisitTable.datasource.sendRequest("vn_id=" + vnId, {
                success : SR.homeVisitTable.datatable.onDataReturnInitializeTable,
                failure : SR.homeVisitTable.datatable.onDataReturnInitializeTable,
                scope : SR.homeVisitTable.datatable
            });
            SR.expenseTable.datasource.sendRequest("vn_id=" + vnId, {
                success : SR.expenseTable.datatable.onDataReturnInitializeTable,
                failure : SR.expenseTable.datatable.onDataReturnInitializeTable,
                scope : SR.expenseTable.datatable
            });
            
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
        
        this.handleRendered = function () {
            if (admitTable.datatable.getRecordSet().getRecords().length > 0) {
                admitTable.datatable.selectRow(0);
            } else {
                SR.diagTable.datasource.sendRequest("vn_id=-1", {
                    success : SR.diagTable.datatable.onDataReturnInitializeTable,
                    failure : SR.diagTable.datatable.onDataReturnInitializeTable,
                    scope : SR.diagTable.datatable
                });
                SR.homeVisitTable.datasource.sendRequest("vn_id=-1", {
                    success : SR.homeVisitTable.datatable.onDataReturnInitializeTable,
                    failure : SR.homeVisitTable.datatable.onDataReturnInitializeTable,
                    scope : SR.homeVisitTable.datatable
                });
            }
        }
        this.datatable.subscribe("postRenderEvent", this.handleRendered);
    }
    return admitTable;
}

function initDiagTable() {
    var diagTable = new function() {
        this.coldefs =
            [{key:"code", label:"รหัส"},
             {key:"name", label:"ชื่อ"},
             ];
        this.query = "vn_id=" + SR.currentVnId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/financereport/get_diags')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"diagnostics",
                fields:["code", "name"]}});
        this.datatable = new YAHOO.widget.DataTable("diag-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"100px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
    }
    return diagTable;
}

function initHomeVisitTable() {
    var homeVisitTable = new function() {
        this.coldefs =
            [{key:"start_date", label:"วันที่ลากลับ", formatter:dateFormatter},
             {key:"end_date", label:"วันที่กลับมา", formatter:dateFormatter}
             ];
        this.query = "vn_id=" + SR.currentVnId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/financereport/get_home_visits')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"diagnostics",
                fields:[{key:"start_date", parser:parseDate},
                        {key:"end_date", parser:parseDate}]}});
        this.datatable = new YAHOO.widget.DataTable("homevisit-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"100px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
    }
    return homeVisitTable;
}

function initExpenseTable() {
    var expenseTable = new function() {
        this.coldefs =
            [
             {key:"group", label:"ประเภทรายการ", width:200},
             {key:"item", label:"ชื่อรายการ", width:200},
             {key:"qty", label:"จำนวน", width:50, formatter:numberFormatter, className:"dt-number"},
             {key:"unit", label:"หน่วย", width:100},
             {key:"totalprice", label:"จำนวนเงิน", width:70, formatter:numberFormatter, className:"dt-number"},
             ];
        this.fielddefs = ["group", "item", "qty", 
                          "unit", "totalprice"];
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/financereport/get_total_expense?')}",
            {connXhrMode: "cancelStaleRequest",
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"expense.others",
                fields:this.fielddefs}});
        
        this.datatable = new YAHOO.widget.DataTable("expense-table",
            this.coldefs, this.datasource,
            {initialRequest:"vn_id=-1",
             scrollable:true, width:"100%", height:"150px"}); 
        
        this.datasource.doBeforeCallback = function(oRequest, oFullResponse, oParsedResponse, oCallback) {
        	SR.expense = oFullResponse.expense;
        	$('homemedin').innerHTML = formatNumber(SR.expense.homemedin);
        	$('homemedout').innerHTML = formatNumber(SR.expense.homemedout);
        	$('hospmedin').innerHTML = formatNumber(SR.expense.hospmedin);
        	$('hospmedout').innerHTML = formatNumber(SR.expense.hospmedout);
        	SR.totalmed = SR.expense.homemedin + SR.expense.homemedout +
        		SR.expense.hospmedin + SR.expense.hospmedout;
        	$('totalmed').innerHTML = formatNumber(SR.totalmed);
        	SR.totalother = 0;
        	for (var i = 0; i < SR.expense.others.length; i++) {
        		SR.totalother += SR.expense.others[i].totalprice;
        	}
        	$('totalother').innerHTML = formatNumber(SR.totalother);
        	$('total').innerHTML = formatNumber(SR.totalmed + SR.totalother);
        	var rows = SR.admitTable.datatable.getSelectedRows();
        	var vnId = -1;
        	if (rows.length > 0) {
        		vnId = SR.admitTable.datatable.getRecord(rows[0]).getData("vn_id");
        	}
        	SR.receiptTable.datasource.sendRequest("vn_id=" + vnId, {
                success : SR.receiptTable.datatable.onDataReturnInitializeTable,
                failure : SR.receiptTable.datatable.onDataReturnInitializeTable,
                scope : SR.receiptTable.datatable
            });
        	return oParsedResponse;
        }
    }
    return expenseTable;
}

function initReceiptTable() {
    var receiptTable = new function() {
        this.coldefs =
            [{key:"code", label:"เลขที่ใบเสร็จ"},
             {key:"receive", label:"ชำระ", formatter:numberFormatter, className:"dt-number"},
             {key:"discount", label:"ส่วนลด", formatter:numberFormatter, className:"dt-number"},
             {key:"support", label:"สงเคราะห์", formatter:numberFormatter, className:"dt-number"}
             ];
        this.query = "vn_id=" + SR.currentVnId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/financereport/get_visit_receipts')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"result.receipts",
                fields:["code", "receive", "discount", "support"]}});
        this.datatable = new YAHOO.widget.DataTable("receipt-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"100px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
        /*
        this.datatable.subscribe("dataReturnEvent", function(oArgs) {
        	SR.totalreceipt = 0;
        	SR.totaldiscount = 0;
        	SR.totalsupport = 0;
        	SR.totalreceive = 0;
        	for (var i = 0; i < oArgs.response.results.length; i++) {
        		SR.totalreceipt += oArgs.response.results[i].discount + 
        			oArgs.response.results[i].receive + oArgs.response.results[i].support;
        		SR.totalreceive += oArgs.response.results[i].receive; 
        		SR.totaldiscount += oArgs.response.results[i].discount;
        		SR.totalsupport += oArgs.response.results[i].support;
        	}
        	$('totalreceipt').innerHTML = formatNumber(SR.totalreceipt);
        	$('totalreceive').innerHTML = formatNumber(SR.totalreceive);
        	$('totaldiscount').innerHTML = formatNumber(SR.totaldiscount);
        	$('totalsupport').innerHTML = formatNumber(SR.totalsupport);
        	$('remain').innerHTML = formatNumber(SR.totalmed + SR.totalother - SR.totalreceipt);
        });
        */
        this.datasource.doBeforeCallback = function(oRequest, oFullResponse, oParsedResponse, oCallback) {
        	SR.totalreceipt = 0;
        	SR.totaldiscount = 0;
        	SR.totalsupport = 0;
        	SR.totalreceive = 0;
        	for (var i = 0; i < oParsedResponse.results.length; i++) {
        		SR.totalreceipt += oParsedResponse.results[i].discount + 
        			oParsedResponse.results[i].receive + oParsedResponse.results[i].support;
        		SR.totalreceive += oParsedResponse.results[i].receive; 
        		SR.totaldiscount += oParsedResponse.results[i].discount;
        		SR.totalsupport += oParsedResponse.results[i].support;
        	}
        	SR.totaldiscount += oFullResponse.result.morediscount;
        	SR.totalsupport += oFullResponse.result.moresupport;
        	$('totalreceipt').innerHTML = formatNumber(SR.totalreceipt);
        	$('totalreceive').innerHTML = formatNumber(SR.totalreceive);
        	$('totaldiscount').innerHTML = formatNumber(SR.totaldiscount);
        	$('totalsupport').innerHTML = formatNumber(SR.totalsupport);
        	
        	$('remain').innerHTML = formatNumber(SR.totalmed + SR.totalother - SR.totalreceipt 
        			- oFullResponse.result.morediscount - oFullResponse.result.moresupport);
        	return oParsedResponse;
        };
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

    

