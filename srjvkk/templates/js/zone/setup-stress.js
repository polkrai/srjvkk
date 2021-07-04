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
    SR.stressTable = initStressTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.stress = new Array();
    SR.delStress = new Array();
    SR.editStress = [];
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
        newRec = {id:-1, description:'', order: SR.stressTable.datatable.getRecordSet().getLength() + 1};
        SR.stressTable.datatable.addRow(newRec, 0);
        SR.stressTable.datatable.configs.paginator.setPage(1);
        SR.stressTable.datatable.unselectAllRows();
        SR.stressTable.datatable.selectRow(0);
        /*var oTr = SR.stressTable.datatable.getLastTrEl();
        var oRecord = SR.stressTable.datatable.getRecord(oTr);
        var oColumn = SR.stressTable.datatable.getColumn("name");
        var cell = SR.stressTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.stressTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.stressTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.stressTable = initStressTable();
//        	SR.stressTable.datasource.sendRequest("", {
//                success:SR.stressTable.datatable.onDataReturnInitializeTable,
//                failure:SR.stressTable.datatable.onDataReturnInitializeTable,
//                scope:SR.stressTable.datatable
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
        var recs = SR.stressTable.datatable.getRecordSet().getRecords();
        SR.stress.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.stress.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editStress.length; i++) {
	        	var rec = SR.stressTable.datatable.getRecord(SR.editStress[i]);
	        	if (rec == null) continue;
	        	SR.stress.push(rec._oData);
	        }
        }
        var jsData = YAHOO.lang.JSON.stringify(SR.stress);
        var elData = document.getElementById("stress");
        elData.value = jsData;
        var jsDelData = YAHOO.lang.JSON.stringify(SR.delStress);
        var elDelData = document.getElementById("del-stress");
        elDelData.value = jsDelData; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/zone/save_stress_management')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.stressTable = initStressTable();
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initStressTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"description", label:"วิธีการจัดการต่อความเครียด", sortable:true, width:400,
            	 editor:new YAHOO.widget.TextareaCellEditor({disableBtns:false})},
        	 {key:"order", label:"ลำดับ", sortable:true,
            	 editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_stress_managements?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"stress",
                fields:["id", "description", "order"]}});
        
        this.datatable = new YAHOO.widget.DataTable("stress-table",
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
	        		confirmDelete(this, rec, SR.delStress,
	        				"ต้องการลบข้อมูลวิธีจัดการต่อความเครียด: " + rec.getData("description"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delStress,
            				"ต้องการลบข้อมูลวิธีจัดการต่อความเครียด: " + rec.getData("description"));
            	} else {
            		SR.editStress.push(rec.getId());
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