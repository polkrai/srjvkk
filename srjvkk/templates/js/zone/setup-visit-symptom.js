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

function initComponents(){
	resetArray();
    initButtons();
    SR.symptomTable = initSymptomTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.symptoms = new Array();
    SR.delSymptoms = new Array();
    SR.editSymptoms = [];
}

function initButtons() {
    
    SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/zone/setup_main')}";
    });
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {        
        //this.set("disabled", true);
    	SR.mode = 1;
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        newRec = {id:-1, description:''};
        SR.symptomTable.datatable.addRow(newRec, 0);
        SR.symptomTable.datatable.configs.paginator.setPage(1);
        SR.symptomTable.datatable.unselectAllRows();
        SR.symptomTable.datatable.selectRow(0);
        /*var oTr = SR.symptomTable.datatable.getLastTrEl();
        var oRecord = SR.symptomTable.datatable.getRecord(oTr);
        var oColumn = SR.symptomTable.datatable.getColumn("name");
        var cell = SR.symptomTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.symptomTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.symptomTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.symptomTable = initSymptomTable();
//        	SR.symptomTable.datasource.sendRequest("", {
//                success:SR.symptomTable.datatable.onDataReturnInitializeTable,
//                failure:SR.symptomTable.datatable.onDataReturnInitializeTable,
//                scope:SR.symptomTable.datatable
//            });
            resetArray();
            SR.btnAdd.set("disabled", false);
            SR.btnEdit.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
            showMessageDialog("Info", 'บันทึกเรียบร้อย',
            		YAHOO.widget.SimpleDialog.ICON_INFO);
            SR.mode = 0;
            
        };
        var responseFailure = function(o) {
        	SR.dlgWait.hide();
            showMessageDialog("Error", 'บันทึกไม่สำเร็จ: ' + o.statusText,
            		YAHOO.widget.SimpleDialog.ICON_BLOCK);
        };
        var callback =
        {
            success: responseSuccess,
            failure: responseFailure
        };
        SR.dlgWait.show();
        var recs = SR.symptomTable.datatable.getRecordSet().getRecords();
        SR.symptoms.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.symptoms.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editSymptoms.length; i++) {
	        	var rec = SR.symptomTable.datatable.getRecord(SR.editSymptoms[i]);
	        	if (rec == null) continue;
	        	SR.symptoms.push(rec._oData);
	        }
        }
        var jsData = YAHOO.lang.JSON.stringify(SR.symptoms);
        var elData = document.getElementById("symptoms");
        elData.value = jsData;
        var jsDelData = YAHOO.lang.JSON.stringify(SR.delSymptoms);
        var elDelData = document.getElementById("del-symptoms");
        elDelData.value = jsDelData; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/zone/save_visit_symptom')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.symptomTable = initSymptomTable();
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initSymptomTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"description", label:"อาการปัจจุบันขณะติดตามเยี่ยม", sortable:true, width:400,
            	 editor:new YAHOO.widget.TextareaCellEditor({disableBtns:false})},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_visit_symptoms?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"symptoms",
                fields:["id", "description"]}});
        
        this.datatable = new YAHOO.widget.DataTable("symptom-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px",
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
	        		confirmDelete(this, rec, SR.delSymptoms,
	        				"ต้องการลบข้อมูลอาการปัจจุบันขณะติดตามเยี่ยม: " + rec.getData("description"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delSymptoms,
            				"ต้องการลบข้อมูลอาการปัจจุบันขณะติดตามเยี่ยม: " + rec.getData("description"));
            	} else {
            		SR.editSymptoms.push(rec.getId());
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

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();