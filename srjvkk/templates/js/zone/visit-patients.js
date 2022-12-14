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
SR.tabIndex = 1;

function initComponents(){
	
	initButtons();
	//$('startDate').value = getDateString(new Date(), true);
    //$('endDate').value = getDateString(new Date(), true);
	var dateCurrent = new Date();
	
    $('startDate').value = getDateString(new Date(dateCurrent.getFullYear(), dateCurrent.getMonth(), 1), true);
    $('endDate').value = getDateString(new Date(dateCurrent.getFullYear(), dateCurrent.getMonth() + 1, 0), true);
	
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
	resetArray();
    SR.dataTable = initDataTable();
    SR.dlgWait = getWaitDialog();
    
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
             {key:"patient", label:"ชื่อ-สกุล", width: "300px"},
             {key:"request_date", label:"วันที่ร้องขอ", sortable:true},
             {key:"is_permitted", label:"ยินยอมให้เยี่ยมบ้าน", formatter: "checkbox"},
             {key:"request_no", label:"เลขที่รับเรื่อง", sortable:true},
             ];
        this.query = "start_date=" + $('startDate').value + "&end_date=" + $('endDate').value;
        this.datasource = new YAHOO.util.DataSource("${h.url_for('/zone/get_visit_patients')}", {
        	connXhrMode: "cancelStaleRequest",
            connMethodPost: true,
            responseType:YAHOO.util.DataSource.TYPE_JSON,
            responseSchema:{resultsList:"data", fields:["id", "request_date", "is_permitted", "pa_id", "hn", "patient", "request_no"]}});
        
        //this.datatable = new YAHOO.widget.DataTable("data-table", this.coldefs, this.datasource, {scrollable:true, width:"100%", height:"350px", paginator:getPaginator(20, 10),initialRequest:this.query});
        this.datatable = new YAHOO.widget.DataTable("data-table", this.coldefs, this.datasource, {scrollable:true, width:"100%", height:"450px", initialRequest:this.query});
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
	
	var url = "${h.url_for('/zone/visit_request')}" + "?id=" + oRecord.getData("id") + "&pa_id=" + oRecord.getData("pa_id");
	
		elCell.innerHTML = "<a href='" + url +"' onclick='loadRequest(\"" + oRecord.getData("pa_id") + "\", \"" + oRecord.getData("id") + "\"); return false;'>" + oData + "</a>";
}

function loadRequest(paId, Id=null) {
	
	parent.loadImportantInfo(paId);
	
	parent.SR.workspaceTab.tabpane.set('activeIndex', 3);
		
	parent.document.getElementById('frame_visit').src = "${h.url_for('/zone/visit_request')}" + "?id=" + Id + "&pa_id=" + paId;
	
}

/*
function viewFormatter(elCell, oRecord, oColumn, oData) {    
	
	var url = "${h.url_for('/zone/visit_request')}" + "?id=" + oRecord.getData("id") + "&pa_id=" + oRecord.getData("pa_id");
	elCell.innerHTML = "<a href='" + url +"' onclick='loadRequest(\"" + oRecord.getData("pa_id") + "\"); return false;'>" + oData + "</a>";
}

function loadRequest(paId) {
	parent.loadImportantInfo(paId);
	parent.SR.workspaceTab.tabpane.set('activeIndex', 3);
}
*/

function showMessageDialog(header, msg, icon) {
	
	if (parent != self && parent.showMessageDialog) {
		
		parent.showMessageDialog(header, msg, icon);
	} 
	else {
		
		messageDialog(header, msg, icon);
	}
}

loader.insert();