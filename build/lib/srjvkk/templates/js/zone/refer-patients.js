var SR = new Object();
var Event, Dom, Lang, $, DT;
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
		$ = Dom.get,
		DT = YAHOO.widget.DataTable;
        YAHOO.util.Event.onDOMReady(initComponents);
    },
    onFailure: function(){
        showMessageDialog("Error", "ไม่สามารถดึงโปรแกรมจาก server ได้สำเร็จ กรุณาลองใหม่อีกครั้ง", YAHOO.widget.SimpleDialog.ICON_BLOCK);
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
SR.qCalled = false;
SR.tabIndex = 0;

function initComponents(){
	initButtons();
	//$('startDate').value = getDateString(new Date(), true);
    //$('endDate').value = getDateString(new Date(), true);
	var dateCurrent = new Date();
	
    $('startDate').value = getDateString(new Date(dateCurrent.getFullYear(), dateCurrent.getMonth(), 1), true);
    $('endDate').value = getDateString(new Date(dateCurrent.getFullYear(), dateCurrent.getMonth() + 1, 0), true);

    //SR.table = initDataTable();
	//SR.dlgWait = getWaitDialog();
	
	resetArray();
    SR.dataTable = initDataTable();
    SR.dlgWait = getWaitDialog();
	
	window.onbeforeunload = function(e) {
		if (parent.removeBeforeTabChangedCallback) {
	    	parent.removeBeforeTabChangedCallback(SR.beforeTabChangedCallback);
	    }
	    if (parent.removeQueueSelectedCallback) {
		    parent.removeQueueSelectedCallback(SR.queueSelectedCallback);
		    
	    }
	    if (parent.removeQueueCalledCallback) {
		    parent.removeQueueCalledCallback(SR.queueCalledCallback);
	    }
	    if (parent.removePatientInfoLoadedCallback) {
		    parent.removePatientInfoLoadedCallback(SR.patientInfoLoadedCallback);
	    }
	    
	    if (parent.removeQueueSentCallback) {
		    parent.removeQueueSentCallback(SR.queueSentCallback);
		    
	    }
	};
    
    SR.beforeTabChangedCallback = {
		success: function(oldValue, newValue) {
			if (newValue == SR.tabIndex) {
				SR.dataTable.datatable.validateColumnWidths();
			}
		}
	};

	SR.queueSelectedCallback = {
		success: function() {
			SR.dataTable.datasource.sendRequest("", {
		        success : SR.dataTable.datatable.onDataReturnInitializeTable,
		        failure : SR.dataTable.datatable.onDataReturnInitializeTable,
		        scope : SR.dataTable.datatable
		    });	
		}
	};

	SR.queueCalledCallback = {
		success: function() {
			SR.qCalled = true;
		}
	};

	SR.patientInfoLoadedCallback = {
		success: function() {
			SR.patientInfo = parent.SR.patientInfo;
		}
	};

	SR.queueSentCallback = {
		success: function() {
			SR.qCalled = false;
		}
	};

    if (parent.setBeforeTabChangedCallback) {
    	parent.setBeforeTabChangedCallback(SR.beforeTabChangedCallback);
    }
    
    if (parent.setQueueSelectedCallback) {
	    parent.setQueueSelectedCallback(SR.queueSelectedCallback);
	    
    }
    if (parent.setQueueCalledCallback) {
	    parent.setQueueCalledCallback(SR.queueCalledCallback);
	    if (parent.SR.workingWithCurrentQ)
	    	SR.qCalled = true;
    }
    if (parent.setPatientInfoLoadedCallback) {
	    parent.setPatientInfoLoadedCallback(SR.patientInfoLoadedCallback);
    }
    
    if (parent.setQueueSentCallback) {
	    parent.setQueueSentCallback(SR.queueSentCallback);
	    
    }
    
}

function resetArray() {
	
    SR.data = new Array();
    SR.delData = new Array();
    SR.editData = [];
}

function initButtons() {

	SR.btnSearch = new YAHOO.widget.Button("btnSearch");
	SR.btnSearch.addListener("click", function() {
		//$('patient_type').value = $('selectPatientType').value;
		SR.dataTable.datasource.sendRequest("start_date=" + $('startDate').value + "&end_date=" + $('endDate').value, {
        	success : function(oRequest, oResponse, oPayload) {

				SR.dataTable.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
				SR.dlgWait.hide();
		    },
            failure : SR.dataTable.datatable.onDataReturnInitializeTable,
            scope : SR.dataTable.datatable
		});
		
		SR.dlgWait.show();
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

function initDataTable() {

	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"pa_id", hidden:true},
             {key:"hn", label:"HN", formatter:viewFormatter},
             {key:"patient", label:"ชื่อ-สกุล"},
             {key:"created_date", label:"วันที่", sortable:true},
             {key:"refer_date", label:"วันที่ส่งต่อล่าสุด", sortable:true},
             {key:"next_refer_date", label:"วันที่ส่งต่อครั้งต่อไป", sortable:true},
             //{key:"user", label:"ผู้ประเมิน", sortable:true},
             {key:"is_permitted", label:"ยินยอมให้เยี่ยมบ้าน", formatter: "checkbox"},
             {key:"monitor", label:"ประเถทที่ต้องเฝ้าระวัง", sortable:true},
             {key:"refer_number", label:"จำนวนครั้งที่ refer", sortable:true},
             //{key:"score_9q", label:"คะแนนแบบประเมินโรคซึมเศร้า"},
             //{key:"score_8q", label:"คะแนนแบบประเมินการฆ่าตัวตาย"},
             //{key:"conclude_number", label:"จำนวนครั้งที่สรุปผลการดูแลต่อเนื่องในชุมชน", formatter: resultFormatter},
             //{key:"number", label:"จำนวนครั้งที่มา", formatter: treatmentPainter},
             //{key:"treatment_result", label:"ผลการบำบัด", formatter: tResultPainter},
             //{key:"follow", label:"การติดตามผลการบำบัด", formatter: followupPainter},
             //{key:"view", label:"", formatter: viewPainter},
             ];
        this.query = "start_date=" + $('startDate').value + "&end_date=" + $('endDate').value;
        this.datasource = new YAHOO.util.DataSource("${h.url_for('/zone/get_refer_patients')}", {
        		connXhrMode: "cancelStaleRequest",
        		connMethodPost: true,
        		responseType:YAHOO.util.DataSource.TYPE_JSON,
        		responseSchema:{resultsList:"data", fields:["id", "created_date", "is_permitted", "monitor", "next_refer_date", "network_name", "conclude_number", "score_9q", "score_8q", "refer_date", "refer_number", "pa_id", "hn", "patient", "color"]}});
        this.rowFormatter = function(elTr, oRecord) {
            elTr.style.backgroundColor = oRecord.getData('color'); 
            return true;
        }; 

        //this.datatable = new YAHOO.widget.DataTable("data-table", this.coldefs, this.datasource, {scrollable:true, width:"100%", height:"350px", paginator:getPaginator(20, 10), initialRequest:this.query, formatRow: this.rowFormatter});
        this.datatable = new YAHOO.widget.DataTable("data-table", this.coldefs, this.datasource, {scrollable:true, width:"100%", height:"450px", initialRequest:this.query, formatRow: this.rowFormatter});
        this.datatable.typesArr = this.typesArr;
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        var callback = { 
	        success : this.datatable.onDataReturnInitializeTable, 
	        failure : this.datatable.onDataReturnInitializeTable, 
	        scope : this.datatable };
        
	    //this.intervalId = this.datasource.setInterval(45000, this.query, callback);
	}
    

    return table;
}

function viewFormatter(elCell, oRecord, oColumn, oData) {    
	var url = "${h.url_for('/zone/refer')}" + "?id=" + oRecord.getData("id") + "&pa_id=" + oRecord.getData("pa_id");
	elCell.innerHTML = "<a href='" + url +"' onclick='loadRefer(\"" + oRecord.getData("pa_id") + "\"); return false;'>" + oData + "</a>";
}

function loadRefer(paId) {
	
	parent.loadImportantInfo(paId);
	parent.SR.workspaceTab.tabpane.set('activeIndex', 2);
}

function showMessageDialog(header, msg, icon) {
	
	if (parent != self && parent.showMessageDialog) {
		
		parent.showMessageDialog(header, msg, icon);
	} 
	else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();