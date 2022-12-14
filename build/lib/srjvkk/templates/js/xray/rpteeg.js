var SR = new Object();
var Event, Dom, Lang, $;
/* Copyright (c) 2008 Shift Right Technology co. ltd. */
var loader = new YAHOO.util.YUILoader({
    require: ["button", "reset", "fonts", "base", "paginator",
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
		$ = Dom.get;
        YAHOO.util.Event.onDOMReady(initComponents);
    },
    onFailure: function(){
        showMessageDialog("Error", "ไม่สามารถดึงโปรแกรมจาก server ได้สำเร็จ กรุณาลองใหม่อีกครั้ง",
        		YAHOO.widget.SimpleDialog.ICON_BLOCK);
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

SR.mode = 2; //0 = Preview, 1 = Add, 2 = Edit
SR.qCalled = false;
SR.tabIndex = 0;

function initComponents(){
	resetArray();
    initButtons();
    SR.dataTable = initDataTable();
    SR.dlgWait = getWaitDialog();
    
    SR.calFromDate = initCalendar("calFromDate", "conFromDate", "btnFromDate", "from_date");
    SR.btnFromDate = new YAHOO.widget.Button("btnFromDate");
    SR.btnFromDate.addListener("click", function(e) {
        SR.calFromDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    
    SR.calToDate = initCalendar("calToDate", "conToDate", "btnToDate", "to_date");
    SR.btnToDate = new YAHOO.widget.Button("btnToDate");
    SR.btnToDate.addListener("click", function(e) {
        SR.calFromDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
}

function resetArray() {
    SR.data = new Array();
    SR.delData = new Array();
    SR.editData = [];
}

function initButtons() {
	SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/xray/report_main')}";
    });
	SR.btnSearch = new YAHOO.widget.Button("btnSearch");
	SR.btnSearch.addListener("click", function() {
		SR.dlgWait.show();
		SR.dataTable.datasource.sendRequest("from_date=" + $('from_date').value + 
        	"&to_date=" + $('to_date').value, {
        	success : 
        		function(oRequest, oResponse, oPayload) {
					SR.dataTable.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
					SR.dlgWait.hide();
				},
            failure : SR.dataTable.datatable.onDataReturnInitializeTable,
            scope : SR.dataTable.datatable
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
}

function initDataTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"eeg_date", label:"ว.ด.ป.", sortable:true},
             {key:"eeg_no", label:"EEG NO"},
             {key:"hn", label:"HN"},
             {key:"an", label:"AN"},
             {key:"name", label:"ชื่อ-สกุล"},
             {key:"age", label:"อายุ"},
             {key:"sex", label:"เพศ"},
             {key:"building", label:"ตึก"},
             {key:"doctor_send", label:"แพทย์ผู้สั่ง"},
             {key:"diag", label:"ผลการวินิจฉัย"},
             {key:"result", label:"ผลการตรวจ"},
             {key:"privilege", label:"สิทธิการรักษา"},
             {key:"remark", label:"หมายเหตุ"}];
        this.query = "from_date=1/1/1970&to_date=1/1/1970";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/xray/search_eeg?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "eeg_date", "eeg_no", "result", 
                        "doctor_send", "is_done", "done_date",
                        "hn", "an", "name", "age", "sex",
                        "building", "diag", "privilege", "remark"]}});
        
        this.datatable = new YAHOO.widget.DataTable("data-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px", width:"100%",
        	paginator:getPaginator(10, 5),
                initialRequest:this.query});
        this.datatable.typesArr = this.typesArr;
        
        
	}
    

    return table;
}

function delPainter(elCell, oRecord, oColumn, oData) {    
	srDelPainter(elCell, oRecord, oColumn, oData, SR.mode);
}


function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();