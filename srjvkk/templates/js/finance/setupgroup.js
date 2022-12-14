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
    SR.grpMedIn = document.getElementById('grpMedIn').value;
    SR.grpMedOut = document.getElementById('grpMedOut').value;
    SR.groupTable = initGroupTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.groups = new Array();
    SR.delGroups = new Array();
    SR.editGroups = [];
}

function initButtons() {
    
    SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/finance/setup_main')}";
    });
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {        
        //this.set("disabled", true);
    	SR.mode = 1;
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        newRec = {'id':-1, 'name':'', show:false};
        SR.groupTable.datatable.addRow(newRec, 0);
        SR.groupTable.datatable.configs.paginator.setPage(1);
        SR.groupTable.datatable.unselectAllRows();
        SR.groupTable.datatable.selectRow(0);
        //SR.groupTable.datatable.addRow(newRec);
        /*var oTr = SR.groupTable.datatable.getLastTrEl();
        var oRecord = SR.groupTable.datatable.getRecord(oTr);
        var oColumn = SR.groupTable.datatable.getColumn("name");
        var cell = SR.groupTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.groupTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.groupTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.groupTable = initGroupTable();
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
        var recs = SR.groupTable.datatable.getRecordSet().getRecords();
        SR.groups.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.groups.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editGroups.length; i++) {
	        	var rec = SR.groupTable.datatable.getRecord(SR.editGroups[i]);
	        	if (rec == null) continue;
	        	SR.groups.push(rec._oData);
	        }
        }
        
        var jsonGroups = YAHOO.lang.JSON.stringify(SR.groups);
        var domGroups = document.getElementById("groups");
        domGroups.value = jsonGroups;
        var jsonDelGroups = YAHOO.lang.JSON.stringify(SR.delGroups);
        var domDelGroups = document.getElementById("del-groups");
        domDelGroups.value = jsonDelGroups; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/save_item_group')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.groupTable = initGroupTable();
    	/*SR.groupTable.datasource.sendRequest("", {
            success:SR.groupTable.datatable.onDataReturnInitializeTable,
            failure:SR.groupTable.datatable.onDataReturnInitializeTable,
            scope:SR.groupTable.datatable
        });*/
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initGroupTable() {
	var groupTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"name", label:"หมวดค่ารักษา", sortable:true, minWidth:300,
            	editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"show", label:"แสดงในใบเสร็จ", formatter:"checkbox"},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_item_groups?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"groups",
                fields:["id", "name", "show"]}});
        
        this.datatable = new YAHOO.widget.DataTable("group-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px",
        	paginator:getPaginator(10, 5),
                initialRequest:this.query});
        
        this.handleCheckboxClicked = function(oArgs) {
            var elCheckbox = oArgs.target;
            newValue = elCheckbox.checked;
            record = this.getRecord(elCheckbox);
            column = this.getColumn(elCheckbox);
            record.setData(column.key, newValue);
        }
        this.datatable.subscribe("checkboxClickEvent", this.handleCheckboxClicked);
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
		    	if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delGroups,
	        				"ต้องการลบข้อมูลหมวดค่ารักษา: " + rec.getData("name"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delGroups,
            				"ต้องการลบข้อมูลหมวดค่ารักษา: " + rec.getData("name"));
            	} else {
            		SR.editGroups.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return groupTable;
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

