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

SR.mode = 2; //0 = Preview, 1 = Add, 2 = Edit
SR.qCalled = false;
SR.tabIndex = 0;

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
	SR.referId = document.getElementById('refer_id').value;
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
			SR.dataTable.datasource.sendRequest("pa_id=" + SR.currentPaId + "&refer_id=" + SR.referId, {
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
    SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
    	window.location = "${h.url_for('/zone/refer')}" + 
    	"?pa_id=" + SR.currentPaId;// + "&vn_id=" + SR.currentVnId;
    });
}

function initDataTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"no", label:"ครั้งที่", sortable:true, formatter: editFormatter},
             {key:"visit_date", label:"วันที่เยี่ยม", sortable:true},
             {key:"score_9q", label:"คะแนน 9Q", sortable:true},
             {key:"score_8q", label:"คะแนน 8Q", sortable:true},
             {key:"lack", label:"ขาดยา?", formatter: "checkbox"},
             {key:"drug_effect", label:"อาการ/ผลข้างเคียงจากยา"},
             {key:"problem", label:"ปัญหาอื่นๆ"},
             {key:"help", label:"การช่วยเหลือ"},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "pa_id=" + SR.currentPaId + "&refer_id=" + SR.referId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_refer_results?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "no", "visit_date", "score_9q", "score_8q", 
                        "lack", "drug_effect", "problem", "help", "refer_id"]}});
        
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
	        				"ต้องการลบข้อมูลผลการติดตามเยี่ยมครั้งที่: " + rec.getData("no"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
        			SR.dlgConfirm = confirmDialog('ลบข้อมูล', "ต้องการลบข้อมูลผลการติดตามเยี่ยมครั้งที่: " + rec.getData("no"),
        					function() {
        						SR.dlgWait.show();
        						ajaxRequest('POST', "${h.url_for('/zone/delete_refer_result')}" + "?result_id=" + rec.getData('id'),
        								{
        									success: function(o) {
        										SR.dlgWait.hide();
        										SR.dataTable.datatable.deleteRow(rec);
        										showMessageDialog("Info", 'ลบเรียบร้อย',
        							            		YAHOO.widget.SimpleDialog.ICON_INFO);
        									},
        									failure: function(o) {
        										SR.dlgWait.hide();
        										showMessageDialog("Error", 'ลบไม่สำเร็จ: ' + o.statusText,
        							            		YAHOO.widget.SimpleDialog.ICON_BLOCK);
        									}
        								}, null);
        						SR.dlgConfirm.hide();
        					},
        					function() {
        						SR.dlgConfirm.hide();
        					});
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

function editFormatter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/zone/add_refer_result')}" +
		"?id=" + oRecord.getData("id") + 
		"&pa_id=" + SR.currentPaId + "&refer_id=" + oRecord.getData('refer_id');
	elCell.innerHTML = "<a href='" + url +"'>" + oData + "</a>";
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();