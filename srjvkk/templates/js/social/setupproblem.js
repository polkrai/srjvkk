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
    SR.problemTable = initProblemTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.problems = new Array();
    SR.delProblems = new Array();
    SR.editProblems = [];
}

function initButtons() {
    
    SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/social/setup_main')}";
    });
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {        
        //this.set("disabled", true);
    	SR.mode = 1;
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        newRec = {'id':-1, 'code':'', 'description':''};
        SR.problemTable.datatable.addRow(newRec, 0);
        SR.problemTable.datatable.configs.paginator.setPage(1);
        SR.problemTable.datatable.unselectAllRows();
        SR.problemTable.datatable.selectRow(0);
        /*var oTr = SR.problemTable.datatable.getLastTrEl();
        var oRecord = SR.problemTable.datatable.getRecord(oTr);
        var oColumn = SR.problemTable.datatable.getColumn("name");
        var cell = SR.problemTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.problemTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.problemTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.problemTable = initProblemTable();
//        	SR.problemTable.datasource.sendRequest("", {
//                success:SR.problemTable.datatable.onDataReturnInitializeTable,
//                failure:SR.problemTable.datatable.onDataReturnInitializeTable,
//                scope:SR.problemTable.datatable
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
        var recs = SR.problemTable.datatable.getRecordSet().getRecords();
        SR.problems.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.problems.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editProblems.length; i++) {
	        	var rec = SR.problemTable.datatable.getRecord(SR.editProblems[i]);
	        	if (rec == null) continue;
	        	SR.problems.push(rec._oData);
	        }
        }
        var jsProblem = YAHOO.lang.JSON.stringify(SR.problems);
        var dProblem = document.getElementById("problems");
        dProblem.value = jsProblem;
        var jsDelProblem = YAHOO.lang.JSON.stringify(SR.delProblems);
        var dDelProblem = document.getElementById("del-problems");
        dDelProblem.value = jsDelProblem; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/social/save_problem')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.problemTable = initProblemTable();
//    	SR.problemTable.datasource.sendRequest("", {
//            success:SR.problemTable.datatable.onDataReturnInitializeTable,
//            failure:SR.problemTable.datatable.onDataReturnInitializeTable,
//            scope:SR.problemTable.datatable
//        });
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initProblemTable() {
	var problemTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"code", label:"รหัส", sortable:true,
            	 editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"description", label:"วินิจฉัยทางสังคม", sortable:true, width:400,
            	 editor:new YAHOO.widget.TextareaCellEditor({disableBtns:false})},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_problems?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"problems",
                fields:["id", "code", "description"]}});
        
        this.datatable = new YAHOO.widget.DataTable("problem-table",
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
	        		confirmDelete(this, rec, SR.delProblems,
	        				"ต้องการลบข้อมูลวินิจฉัยทางสังคม: " + rec.getData("code"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delProblems,
            				"ต้องการลบข้อมูลวินิจฉัยทางสังคม: " + rec.getData("code"));
            	} else {
            		SR.editProblems.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
	}
    

    return problemTable;
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

