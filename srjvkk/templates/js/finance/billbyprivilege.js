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
	SR.billTable = initBillTable();
	SR.dlgWait = getWaitDialog();
	SR.bills = [];
	SR.total = 0;
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
        window.location = "${h.url_for('/financereport/report_main')}";
    });
	SR.btnSearch = new YAHOO.widget.Button("btnSearch");
	SR.btnSearch.addListener("click", function() {
		SR.dlgWait.show();
		$('patient_type').value = $('selectPatientType').value;
		SR.billTable.datasource.sendRequest("start_date=" + $('startDate').value + 
        	"&end_date=" + $('endDate').value + "&privilege_id=" + $('selectPrivilege').value +
        	"&province_code=" + $('selectProvince').value + "&patient_type=" + $('selectPatientType').value, {
        	success : function(oRequest, oResponse, oPayload) {
							var total = 0;
							for (var i = 0; i < oResponse.results.length; i++) {
								total += oResponse.results[i].subtotal;
							}
							SR.bills = oResponse.results;
							SR.total = total;
							$('totalSpan').innerHTML = formatNumber(total);
							$('province_code').value = $('selectProvince').value;
							$('province').value = $('selectProvince').options[$('selectProvince').selectedIndex].text;
							$('privilege').value = $('selectPrivilege').options[$('selectPrivilege').selectedIndex].text;
							$('start_date').value = $('startDate').value;
							$('end_date').value = $('endDate').value;
							$('total').value = SR.total;
							$('bills').value = YAHOO.lang.JSON.stringify(SR.bills);
							SR.billTable.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
							SR.dlgWait.hide();
					  },
            failure : SR.billTable.datatable.onDataReturnInitializeTable,
            scope : SR.billTable.datatable
		});
	});
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
	SR.btnPrint.addListener("click", function() {
		if (SR.billTable.datatable.getRecordSet().getRecords().length == 0) {
			showMessageDialog("พิมพ์", "ไม่มีรายการ", YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		$('type').value = "print";
		$('formExport').submit();
	});
	
	SR.btnExcel = new YAHOO.widget.Button("btnExcel");
	SR.btnExcel.addListener("click", function() {
		if (SR.billTable.datatable.getRecordSet().getRecords().length == 0) {
			showMessageDialog("พิมพ์", "ไม่มีรายการ", YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		$('type').value = "excel";
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

function initBillTable() {
    var billTable = new function() {
        this.coldefs =
            [{key:"print", label:"พิมพ์ใบสั่งยา", formatter: drugPrintFormatter},
             {key:"vn_id", hidden: true},
             {key:"no", label:"ลำดับที่", sortable:true},
             {key:"visit_date", label:"วันที่รับบริการ", sortable:true},
			 {key:"visit_time", label:"เวลารับบริการ", sortable:true},
			 {key:"vn", label:"V.N", sortable:true},
             {key:"hn", label:"H.N", sortable:true},
			 {key:"refer_hosp_code", label:"รหัสโรงพยาบาล", sortable:true},
             {key:"name", label:"ชื่อ - สกุล", sortable:true},
             {key:"province", label:"จังหวัด", sortable:true},
             {key:"hospital", label:"รพ.ที่ระบุในบัตร"},
             {key:"prcardid", label:"เลขที่บัตร"},
             {key:"refer_no", label:"เลขที่ refer"},
             {key:"personalid", label:"เลขที่บัตรประชาชน"},
             {key:"sex", label:"เพศ"},
             {key:"age", label:"อายุ"},
             {key:"icd10", label:"วินิจฉัย"},
             {key:"med", label:"ค่ายาและเวชภัณฑ์", formatter:numberFormatter, className:"dt-number"},
             {key:"lab", label:"ชันสูตร", formatter:numberFormatter, className:"dt-number"},
             {key:"eeg", label:"EEG/EKG", formatter:numberFormatter, className:"dt-number"},
             {key:"other", label:"ตรวจวินิจฉัยอื่นๆ", formatter:numberFormatter, className:"dt-number"},
             {key:"subtotal", label:"รวมทั้งสิ้น(บาท)", formatter:numberFormatter, className:"dt-number"},
			 {key:"number_licensed", label:"รหัสแพทย์"},];
        this.query = "start_date=" + $('startDate').value + "&end_date=" + $('endDate').value + "&privilege_id=-1";
        this.datasource = new YAHOO.util.DataSource("${h.url_for('/financereport/bill_by_privilege')}",
            {connXhrMode: "cancelStaleRequest", connMethodPost: true, responseType:YAHOO.util.DataSource.TYPE_JSON, responseSchema:{resultsList:"bill.details",
                fields:["vn_id","no", "visit_date", "visit_time", "vn", "hn", "refer_hosp_code", "name",
                        "hospital", "prcardid", "personalid",
                        "sex", "age", "icd10", "number_licensed", "med", "lab",
                        "eeg", "other", "subtotal", "province",
                        "refer_no"
                        ]}});
        this.datatable = new YAHOO.widget.DataTable("billTable", this.coldefs, this.datasource, {scrollable:true, width:"100%", height:"300px", initialRequest:this.query});

    }
    return billTable;
}

function drugPrintFormatter(elCell, oRecord, oColumn, oData) {
	var img = '<img width="16px" height="16px" src="${h.url_for("/img/print.png")}" />';
	elCell.innerHTML = '<a href="#" onclick="window.open(\'' +
		url.drug.print + 'vn_id=' + oRecord.getData("vn_id") +
		'\', \'printWindow\')">' + img + '</a>';
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

    

