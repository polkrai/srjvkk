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
    SR.helpTable = initHelpTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.helps = new Array();
    SR.delHelps = new Array();
    SR.editHelps = [];
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
        SR.helpTable.datatable.addRow(newRec, 0);
        SR.helpTable.datatable.configs.paginator.setPage(1);
        SR.helpTable.datatable.unselectAllRows();
        SR.helpTable.datatable.selectRow(0);  
        /*var oTr = SR.helpTable.datatable.getLastTrEl();
        var oRecord = SR.helpTable.datatable.getRecord(oTr);
        var oColumn = SR.helpTable.datatable.getColumn("name");
        var cell = SR.helpTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.helpTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.helpTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.helpTable = initHelpTable();
//        	SR.helpTable.datasource.sendRequest("", {
//                success:SR.helpTable.datatable.onDataReturnInitializeTable,
//                failure:SR.helpTable.datatable.onDataReturnInitializeTable,
//                scope:SR.helpTable.datatable
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
        var recs = SR.helpTable.datatable.getRecordSet().getRecords();
        SR.helps.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.helps.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editHelps.length; i++) {
	        	var rec = SR.helpTable.datatable.getRecord(SR.editHelps[i]);
	        	if (rec == null) continue;
	        	SR.helps.push(rec._oData);
	        }
        }
        var jsHelp = YAHOO.lang.JSON.stringify(SR.helps);
        var dHelp = document.getElementById("helps");
        dHelp.value = jsHelp;
        var jsDelHelp = YAHOO.lang.JSON.stringify(SR.delHelps);
        var dDelHelp = document.getElementById("del-helps");
        dDelHelp.value = jsDelHelp; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/social/save_help')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.helpTable = initHelpTable();
//    	SR.helpTable.datasource.sendRequest("", {
//            success:SR.helpTable.datatable.onDataReturnInitializeTable,
//            failure:SR.helpTable.datatable.onDataReturnInitializeTable,
//            scope:SR.helpTable.datatable
//        });
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initHelpTable() {
	var helpTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"code", label:"รหัส", sortable:true, 
            	 editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"description", label:"ช่วยเหลือ", sortable:true, minWidth:300,
            	 editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"del",label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_helps?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"helps",
                fields:["id", "code", "description"]}});
        
        this.datatable = new YAHOO.widget.DataTable("help-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px",
        	paginator:getPaginator(10,5),
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
		    	if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delHelps,
	        				"ต้องการลบข้อมูลช่วยเหลือ: " + rec.getData("code"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delHelps,
            				"ต้องการลบข้อมูลช่วยเหลือ: " + rec.getData("code"));
            	} else {
            		SR.editHelps.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
	}
    

    return helpTable;
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

