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
    SR.personalityTable = initPersonalityTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.personalities = new Array();
    SR.delPersonalities = new Array();
    SR.editPersonalities = [];
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
        newRec = {id:-1, description:'', order: SR.personalityTable.datatable.getRecordSet().getLength() + 1};
        SR.personalityTable.datatable.addRow(newRec, 0);
        SR.personalityTable.datatable.configs.paginator.setPage(1);
        SR.personalityTable.datatable.unselectAllRows();
        SR.personalityTable.datatable.selectRow(0);
        /*var oTr = SR.personalityTable.datatable.getLastTrEl();
        var oRecord = SR.personalityTable.datatable.getRecord(oTr);
        var oColumn = SR.personalityTable.datatable.getColumn("name");
        var cell = SR.personalityTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.personalityTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.personalityTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.personalityTable = initPersonalityTable();
//        	SR.personalityTable.datasource.sendRequest("", {
//                success:SR.personalityTable.datatable.onDataReturnInitializeTable,
//                failure:SR.personalityTable.datatable.onDataReturnInitializeTable,
//                scope:SR.personalityTable.datatable
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
        var recs = SR.personalityTable.datatable.getRecordSet().getRecords();
        SR.personalities.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.personalities.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editPersonalities.length; i++) {
	        	var rec = SR.personalityTable.datatable.getRecord(SR.editPersonalities[i]);
	        	if (rec == null) continue;
	        	SR.personalities.push(rec._oData);
	        }
        }
        var jsData = YAHOO.lang.JSON.stringify(SR.personalities);
        var elData = document.getElementById("personalities");
        elData.value = jsData;
        var jsDelData = YAHOO.lang.JSON.stringify(SR.delPersonalities);
        var elDelData = document.getElementById("del-personalities");
        elDelData.value = jsDelData; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/zone/save_personality')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.personalityTable = initPersonalityTable();
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initPersonalityTable() {
	var table = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"description", label:"บุคลิกภาพ", sortable:true, width:400,
            	 editor:new YAHOO.widget.TextareaCellEditor({disableBtns:false})},
        	 {key:"order", label:"ลำดับ", sortable:true,
            	 editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_personalities?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"personalities",
                fields:["id", "description", "order"]}});
        
        this.datatable = new YAHOO.widget.DataTable("personality-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px",
        	paginator:getPaginator(10, 5),
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
		    	if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delPersonalities,
	        				"ต้องการลบข้อมูลบุคลิกภาพ: " + rec.getData("description"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delPersonalities,
            				"ต้องการลบข้อมูลบุคลิกภาพ: " + rec.getData("description"));
            	} else {
            		SR.editPersonalities.push(rec.getId());
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