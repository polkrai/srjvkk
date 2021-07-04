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
	SR.bills = [];
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
		$('patient_type').value = $('selectPatientType').value;
		SR.receiptTable.datasource.sendRequest("start_date=" + $('startDate').value + 
        	"&end_date=" + $('endDate').value + "&patient_type=" + $('selectPatientType').value, {
        	success : function(oRequest, oResponse, oPayload) {
							var total = 0, totalReceive = 0, totalSubsidy = 0, totalVisit = 0,
								totalSupport = 0, totalDeposit = 0, totalDiscount = 0;
							for (var i = 0; i < oResponse.results.length; i++) {
								total += oResponse.results[i].subtotal;
								totalReceive += oResponse.results[i].receive;
								totalSubsidy += oResponse.results[i].subsidy;
								totalSupport += oResponse.results[i].support;
								totalDeposit += oResponse.results[i].deposit;
								totalDiscount += oResponse.results[i].discount;
								totalVisit += oResponse.results[i].visit_count;
							}
							SR.results = oResponse.results;
							$('td-visit').innerHTML = formatNumber(totalVisit);
							$('td-receive').innerHTML = formatNumber(totalReceive);
							$('td-subsidy').innerHTML = formatNumber(totalSubsidy);
							$('td-support').innerHTML = formatNumber(totalSupport);
							$('td-deposit').innerHTML = formatNumber(totalDeposit);
							$('td-discount').innerHTML = formatNumber(totalDiscount);
							$('td-total').innerHTML = formatNumber(total);
							$('results').value = YAHOO.lang.JSON.stringify(SR.results);
							$('start_date').value = $('startDate').value;
							$('end_date').value = $('endDate').value;
							SR.receiptTable.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
							SR.dlgWait.hide();
					  },
            failure : SR.receiptTable.datatable.onDataReturnInitializeTable,
            scope : SR.receiptTable.datatable
		});
		SR.dlgWait.show();
	});
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
	SR.btnPrint.addListener("click", function() {
		if (SR.receiptTable.datatable.getRecordSet().getRecords().length == 0) {
			showMessageDialog("พิมพ์", "ไม่มีรายการ", YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		$('type').value = "print";
		$('formExport').submit();
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
            [{key:"no", label:"ลำดับที่", sortable:true},
             {key:"privilege_name", label:"สิทธิบัตร", sortable:true},
             {key:"visit_count", label:"จำนวนราย", formatter:numberFormatter, className:"dt-number"},
             {key:"receive", label:"จ่ายเงินสด", formatter:numberFormatter, className:"dt-number"},
             {key:"subsidy", label:"จ่ายตรง/ส่งเบิก", formatter:numberFormatter, className:"dt-number"},
             {key:"support", label:"สงเคราะห์", formatter:numberFormatter, className:"dt-number"},             
             {key:"discount", label:"ส่วนลด", formatter:numberFormatter, className:"dt-number"},
             {key:"deposit", label:"มัดจำ", formatter:numberFormatter, className:"dt-number"},
             {key:"subtotal", label:"รวมทั้งสิ้น(บาท)", formatter:numberFormatter, className:"dt-number"},
             ];
        this.query = "start_date=" + $('startDate').value + 
        	"&end_date=" + $('endDate').value + "&patient_type=opd";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/financereport/receipt_by_privilege')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"results",
                fields:["no", "privilege_name",
                        "receive", "subsidy", "visit_count",
                        "subtotal", "support", "deposit", "discount",
                        ]}});
        this.datatable = new YAHOO.widget.DataTable("receiptTable",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"300px",
                initialRequest:this.query});
        
        var tfoot = this.datatable.getTbodyEl().parentNode.createTFoot();
		var tr = tfoot.insertRow(-1);
		var th = tr.appendChild(document.createElement('th'));
		th.colSpan = 2;
		th.innerHTML = 'รวม';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-visit';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-receive';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-subsidy';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-support';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-discount';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-deposit';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-total';

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

    

