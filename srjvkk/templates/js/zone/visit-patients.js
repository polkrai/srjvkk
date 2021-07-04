var SR = new Object();

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

SR.mode = 0; //0 = Preview, 1 = Add, 2 = Edit
SR.qCalled = false;
SR.tabIndex = 1;

function initComponents(){
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

function initDataTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"pa_id", hidden:true},
             {key:"hn", label:"HN", formatter:viewFormatter},
             {key:"patient", label:"ชื่อ-สกุล"},
             {key:"request_date", label:"วันที่ร้องขอ", sortable:true},
             {key:"is_permitted", label:"ยินยอมให้เยี่ยมบ้าน", formatter: "checkbox"},
             {key:"request_no", label:"เลขที่รับเรื่อง", sortable:true},
             ];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_visit_patients?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "request_date", "is_permitted", 
                        "pa_id", "hn", "patient", "request_no"]}});
        
        this.datatable = new YAHOO.widget.DataTable("data-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px", width:"100%",
        	paginator:getPaginator(10, 5),
                initialRequest:this.query});
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
	    this.intervalId = this.datasource.setInterval(45000,
	        this.query, callback);
	}
    

    return table;
}

function viewFormatter(elCell, oRecord, oColumn, oData) {    
	var url = "${h.url_for('/zone/visit_request')}" + 
		"?id=" + oRecord.getData("id") + "&pa_id=" + oRecord.getData("pa_id");
	elCell.innerHTML = "<a href='" + url +"' onclick='loadRequest(\"" + oRecord.getData("pa_id") + "\"); return false;'>" + oData + "</a>";
}

function loadRequest(paId) {
	parent.loadImportantInfo(paId);
	parent.SR.workspaceTab.tabpane.set('activeIndex', 3);
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();