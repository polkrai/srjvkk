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
	    
	    if (parent.removePatientFoundCallback) {
		    parent.removePatientFoundCallback(SR.patientFoundCallback);
	    }
	};
	SR.currentPaId = document.getElementById('pa_id').value;
	SR.currentVnId = document.getElementById('vn_id').value;
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
			SR.currentVnId = parent.SR.waitQ.qInfo.vn_id;
			SR.dataTable.datasource.sendRequest("pa_id=" + SR.currentPaId, {
		        success : reloadTableData,
		        failure : reloadTableData,
		        scope : SR.dataTable.datatable
		    });	
		}
	};
	
	SR.patientFoundCallback = {
		success: function() {
			SR.currentPaId = parent.SR.foundPatientId;
			SR.dataTable.datasource.sendRequest("pa_id=" + SR.currentPaId, {
		        success : reloadTableData,
		        failure : reloadTableData,
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
			SR.currentPaId = -1;
			SR.currentVnId = -1;
			SR.dataTable.datasource.sendRequest("pa_id=" + SR.currentPaId, {
		        success : SR.dataTable.datatable.onDataReturnInitializeTable,
		        failure : SR.dataTable.datatable.onDataReturnInitializeTable,
		        scope : SR.dataTable.datatable
		    });
		}
	};

    if (parent.setBeforeTabChangedCallback) {
    	parent.setBeforeTabChangedCallback(SR.beforeTabChangedCallback);
    }
    if (parent.setQueueSelectedCallback) {
	    parent.setQueueSelectedCallback(SR.queueSelectedCallback);
	    
    }
    
    if (parent.setPatientFoundCallback) {
	    parent.setPatientFoundCallback(SR.patientFoundCallback);
	    
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

function reloadTableData(oRequest, oResponse, oPayload) {
	SR.dataTable.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
	if (parent) {
		parent.SR.waitDialog.hide();
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
    	if (!SR.qCalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
    	try {
		    if (parent.setWorking) {
		    	parent.setWorking(true);
		    }
        } catch (ex) {
        	//alert(ex.message);
        }
    	window.location = "${h.url_for('/psychosocial/add_assessment')}" + 
    	"?pa_id=" + SR.currentPaId + "&vn_id=" + SR.currentVnId;
    });
}

function initDataTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             //{key:"assess_date", label:"วันที่ประเมิน", sortable:true},
             {key:"entrance", label:"ลักษณะการเข้ารับการบำบัด", sortable:true},
             //{key:"user", label:"ผู้ประเมิน", sortable:true},
             {key:"is_ready", label:"ผลการประเมิน", formatter: readyPainter},
             {key:"method", label:"รูปแบบการบำบัด"},
             {key:"total_number", label:"จำนวนครั้งทั้งหมด"},
             {key:"number", label:"จำนวนครั้งที่มา", formatter: treatmentPainter},
             {key:"treatment_result", label:"ผลการบำบัด", formatter: tResultPainter},
             {key:"follow", label:"การติดตามผลการบำบัด", formatter: followupPainter},
             {key:"view", label:"", formatter: viewPainter},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "pa_id=" + SR.currentPaId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/psychosocial/get_patient_assessments?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "assess_date", "entrance", "user", 
                        "is_ready", "ar_id", "method", "number", 
                        "total_number", "treatment_result", "follow"]}});
        
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
	        				"ต้องการลบข้อมูลการประเมินก่อนเข้ารับบริการ: " + rec.getData("description"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delData,
            				"ต้องการลบข้อมูลการประเมินก่อนเข้ารับบริการ: " + rec.getData("description"));
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

function viewPainter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/psychosocial/view_assessment')}" + 
		"?id=" + oRecord.getData("id") + "&vn_id=" + SR.currentVnId + "&pa_id=" + SR.currentPaId;
	elCell.innerHTML = "<a href='" + url +"'><img src='/img/find.png'></a>";
}

function treatmentPainter(elCell, oRecord, oColumn, oData) {
	if (!oRecord.getData('is_ready')) {
		return;
	}
	if (oData != null) {
		var url = "${h.url_for('/psychosocial/edit_patient_treatment')}" + 
			"?ar_id=" + oRecord.getData("ar_id") + "&vn_id=" + SR.currentVnId + "&pa_id=" + SR.currentPaId;
		var url2 = "${h.url_for('/psychosocial/view_patient_treatment')}" + 
			"?ar_id=" + oRecord.getData("ar_id") + "&vn_id=" + SR.currentVnId + "&pa_id=" + SR.currentPaId;;
		elCell.innerHTML = "<a href='" + url2 + "'>" + oData + "</a>";
		if (oRecord.getData('treatment_result') == null)
			elCell.innerHTML += "<a style='float:right;' href='" + url +"'><img src='/img/pencil.png'></a>";
	} 
}

function tResultPainter(elCell, oRecord, oColumn, oData) {
	if (!oRecord.getData('is_ready')) {
		return;
	}
	if (oRecord.getData('ar_id') != null) {
		if (oData == null) {
			var url = "${h.url_for('/psychosocial/edit_treatment_result')}" + 
				"?ar_id=" + oRecord.getData("ar_id") + "&vn_id=" + SR.currentVnId + "&pa_id=" + SR.currentPaId;
			elCell.innerHTML = "<a style='float:right' href='" + url +"'><img src='/img/pencil.png'></a>";
		} else {
			var url = "${h.url_for('/psychosocial/view_treatment_result')}" + 
				"?ar_id=" + oRecord.getData("ar_id") + "&vn_id=" + SR.currentVnId + "&pa_id=" + SR.currentPaId;
			elCell.innerHTML = oData + "<a style='float:right' href='" + url +"'><img src='/img/find.png'></a>";
		} 
	}
}

function followupPainter(elCell, oRecord, oColumn, oData) {
	if (oData) {
		var url = "${h.url_for('/psychosocial/view_treatment_followup')}" + 
			"?ar_id=" + oRecord.getData("ar_id") + "&vn_id=" + SR.currentVnId + "&pa_id=" + SR.currentPaId;
		elCell.innerHTML = "<a href='" + url + "'>" + oData + "</a>";
	}
	if (oRecord.getData('treatment_result') != null) {
		url = "${h.url_for('/psychosocial/edit_treatment_followup')}" + 
			"?ar_id=" + oRecord.getData("ar_id") + "&vn_id=" + SR.currentVnId + "&pa_id=" + SR.currentPaId;
		elCell.innerHTML += "<a style='float:right' href='" + url +"'><img src='/img/pencil.png'></a>";
	}
	
}

function readyPainter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/psychosocial/view_assessment_result')}" + "?pa_id=" +
		SR.currentPaId + "&vn_id=" + SR.currentVnId + "&id=" + oRecord.getData('ar_id');
	if (oData == true){
		elCell.innerHTML = "<a href='" + url + "'><img src='/img/yes.png'></a>";
	} else if (oData == false) {
		elCell.innerHTML = "<a href='" + url + "'><img src='/img/no.png'></a>";
	} else {
		url = "${h.url_for('/psychosocial/edit_assessment_result')}" + "?pa_id=" +
			SR.currentPaId + "&vn_id=" + SR.currentVnId + "&pa_as_id=" + oRecord.getData('id');
		elCell.innerHTML = elCell.innerHTML = "ยังไม่ได้รับการประเมิน <a style='float:right;' href='" + url +"'><img src='/img/pencil.png'></a>";
	}
	elCell.parentNode.style.textAlign = "center";
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();