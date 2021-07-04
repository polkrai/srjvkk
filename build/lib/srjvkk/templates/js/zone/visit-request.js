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
SR.tabIndex = 3;

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
	
	SR.currentPaId = document.getElementById('pa_id').value;
	//SR.currentVnId = document.getElementById('vn_id').value;
	resetArray();
    initButtons();
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
			SR.currentPaId = parent.SR.waitQ.qInfo.pa_id;
			//SR.currentVnId = parent.SR.waitQ.qInfo.vn_id;
			
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
			SR.currentPaId = parent.SR.patientInfo.id;
			SR.dataTable.datasource.sendRequest("pa_id=" + SR.currentPaId, {
		        success : SR.dataTable.datatable.onDataReturnInitializeTable,
		        failure : SR.dataTable.datatable.onDataReturnInitializeTable,
		        scope : SR.dataTable.datatable
		    });	
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
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {        
    	/*if (!SR.qCalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }*/
    	if (SR.currentPaId == '' || SR.currentPaId == -1) {
    		showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
    	}
    	window.location = "${h.url_for('/zone/add_visit_request')}" + 
    	"?pa_id=" + SR.currentPaId;// + "&vn_id=" + SR.currentVnId;
    });
}

function initDataTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"result", label:"รายงานการเยี่ยม", formatter: resultPainter},
             {key:"request_no", label:"เลขที่รับเรื่อง"},
             {key:"request_date", label:"วันที่ขอให้ติดตามเยี่ยม", sortable:true, formatter: detailPainter},
             {key:"symptom", label:"อาการสำคัญ", sortable:true},
             {key:"last_admit_date", label:"วันที่เข้ารับการรักษาล่าสุด", sortable:true},
             {key:"last_discharge_date", label:"วันที่จำหน่ายครั้งสุดท้าย", sortable:true},
             {key:"user", label:"ผู้ร้องขอ", sortable:true},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "pa_id=" + SR.currentPaId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_visit_requests?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "request_date", "symptom", "user", "request_no",
                        "last_admit_date", "last_discharge_date", "result"]}});
        
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
        	
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
		    	if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delData,
	        				"ต้องการลบข้อมูลการขอให้ติดตามเยี่ยม: " + rec.getData("request_no"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delData,
            				"ต้องการลบข้อมูลการขอให้ติดตามเยี่ยม: " + rec.getData("request_no"));
            	} else {
            		SR.editData.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
	}
    

    return table;
}

function delPainter(elCell, oRecord, oColumn, oData) {    
	srDelPainter(elCell, oRecord, oColumn, oData, SR.mode);
}

function detailPainter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/zone/add_visit_request')}" + 
		"?id=" + oRecord.getData("id");
	elCell.innerHTML = "<a href='" + url +"'>" + oData + "</a>";
}

function resultPainter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/zone/add_visit_result')}" + 
		"?req_id=" + oRecord.getData("id") + "&pa_id=" + SR.currentPaId;
	var url2 = "${h.url_for('/zone/visit_result')}" + 
		"?req_id=" + oRecord.getData("id") + "&pa_id=" + SR.currentPaId;
	elCell.innerHTML = "<a href='" + url2 + "'>" + oData + "</a><a style='float:right' href='" + url +"'><img src='/img/pencil.png'></a>";
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();