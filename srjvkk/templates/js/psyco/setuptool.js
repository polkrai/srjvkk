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
    SR.toolTable = initToolTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.tools = new Array();
    SR.editTools = [];
    SR.delTools = new Array();
}

function initButtons() {
    
    SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/psyco/setup_main')}";
    });
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {        
        //this.set("disabled", true);
    	SR.mode = 1;
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        newRec = {'id':-1, 'name':''};
        SR.toolTable.datatable.addRow(newRec, 0);
        SR.toolTable.datatable.configs.paginator.setPage(1);
        SR.toolTable.datatable.unselectAllRows();
        SR.toolTable.datatable.selectRow(0);        
        /*var oTr = SR.toolTable.datatable.getLastTrEl();
        var oRecord = SR.toolTable.datatable.getRecord(oTr);
        var oColumn = SR.toolTable.datatable.getColumn("name");
        var cell = SR.toolTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.toolTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.toolTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.toolTable = initToolTable();
//        	SR.toolTable.datasource.sendRequest("", {
//                success:SR.toolTable.datatable.onDataReturnInitializeTable,
//                failure:SR.toolTable.datatable.onDataReturnInitializeTable,
//                scope:SR.toolTable.datatable
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
        var recs = SR.toolTable.datatable.getRecordSet().getRecords();
        SR.tools.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.tools.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editTools.length; i++) {
	        	var rec = SR.toolTable.datatable.getRecord(SR.editTools[i]);
	        	if (rec == null) continue;
	        	SR.tools.push(rec._oData);
	        }
        }
        
        var jsTool = YAHOO.lang.JSON.stringify(SR.tools);
        var dTool = document.getElementById("tools");
        dTool.value = jsTool;
        var jsDelTool = YAHOO.lang.JSON.stringify(SR.delTools);
        var dDelTool = document.getElementById("del-tools");
        dDelTool.value = jsDelTool; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psyco/save_tool')}", callback);
        
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.toolTable = initToolTable();
//    	SR.toolTable.datasource.sendRequest("", {
//            success:SR.toolTable.datatable.onDataReturnInitializeTable,
//            failure:SR.toolTable.datatable.onDataReturnInitializeTable,
//            scope:SR.toolTable.datatable
//        });
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initToolTable() {
	var toolTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"name", label:"เครื่องมือ", sortable:true, minWidth:300, 
            	editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/psyco/get_tools?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"tools",
                fields:["id", "name"]}});
        
        this.datatable = new YAHOO.widget.DataTable("tool-table",
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
	        		confirmDelete(this, rec, SR.delTools,
	        				"ต้องการลบข้อมูลเครื่องมือ: " + rec.getData("name"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delTools,
            				"ต้องการลบข้อมูลเครื่องมือ: " + rec.getData("name"));
            	} else {
            		SR.editTools.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
    }
    

    return toolTable;
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

