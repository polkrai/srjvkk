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
SR.tabIndex = 2;

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
			/*SR.dataTable.datasource.sendRequest("pa_id=" + SR.currentPaId, {
		        success : SR.dataTable.datatable.onDataReturnInitializeTable,
		        failure : SR.dataTable.datatable.onDataReturnInitializeTable,
		        scope : SR.dataTable.datatable
		    });*/	
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
    	/*if (!parent.SR.workingWithCurrentQ) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }*/
    	if (SR.currentPaId == '' || SR.currentPaId == -1) {
    		showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
    	}
    	window.location = "${h.url_for('/zone/add_refer')}" + 
    	"?pa_id=" + SR.currentPaId;// + "&vn_id=" + SR.currentVnId;
    });
}

function initDataTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"created_date", label:"วันที่", sortable:true, formatter: editFormatter},
             {key:"refer_date", label:"วันที่ส่งต่อล่าสุด", sortable:true},
             //{key:"user", label:"ผู้ประเมิน", sortable:true},
             {key:"is_permitted", label:"ยินยอมให้เยี่ยมบ้าน", formatter: "checkbox"},
             {key:"monitor", label:"ประเถทที่ต้องเฝ้าระวัง", sortable:true},
             //{key:"score_9q", label:"คะแนนแบบประเมินโรคซึมเศร้า"},
             //{key:"score_8q", label:"คะแนนแบบประเมินการฆ่าตัวตาย"},
             {key:"conclude_number", label:"จำนวนครั้งที่สรุปผลการดูแลต่อเนื่องในชุมชน", formatter: resultFormatter},
             /*{key:"number", label:"จำนวนครั้งที่มา", formatter: treatmentPainter},
             {key:"treatment_result", label:"ผลการบำบัด", formatter: tResultPainter},
             {key:"follow", label:"การติดตามผลการบำบัด", formatter: followupPainter},
             {key:"view", label:"", formatter: viewPainter},*/
             {key:"del", label:"", formatter: delPainter}];
        this.query = "pa_id=" + SR.currentPaId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_refers?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "created_date", "is_permitted", "monitor", 
                        "network_name", "conclude_number", "score_9q", "score_8q",
                        "refer_date"]}});
        
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
	        				"ต้องการลบข้อมูลใบส่งต่อ: " + rec.getData("description"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delData,
            				"ต้องการลบข้อมูลใบส่งต่อ: " + rec.getData("description"));
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
	var url = "${h.url_for('/zone/add_refer')}" + 
		"?id=" + oRecord.getData("id") + "&pa_id=" + SR.currentPaId;//+ "&vn_id=" + SR.currentVnId 
	elCell.innerHTML = "<a href='" + url +"'>" + oData + "</a>";
}

function resultFormatter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/zone/add_refer_result')}" + 
		"?refer_id=" + oRecord.getData("id") + "&pa_id=" + SR.currentPaId;//+ "&vn_id=" + SR.currentVnId 
	var url2 = "${h.url_for('/zone/refer_result')}" + 
		"?refer_id=" + oRecord.getData("id") + "&pa_id=" + SR.currentPaId;//+ "&vn_id=" + SR.currentVnId 
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