var SR = new Object();

/* Copyright (c) 2008 Shift Right Technology co. ltd. */
var loader = new YAHOO.util.YUILoader({
    require: ["button", "reset", "fonts", "base", "paginator",
              "yahoo-dom-event", "element", "dragdrop", "menu",
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
	var selGrp = document.getElementById("select-group");
    SR.grpText = "ยังไม่จัดหมวดการรักษา";//selGrp.options[selGrp.selectedIndex].text;
    SR.currentGroup = "null"//selGrp.options[selGrp.selectedIndex].value;
    initButtons();
    SR.hideGroup = false;
    SR.units = new Array();
    getUnits();
    SR.dlgWait = getWaitDialog();    
}

function resetArray() {
    SR.items = new Array();
    SR.delItems = new Array();
    SR.editItems = new Array();
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
    	SR.btnGrpMenu.set("disabled", true);
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        newRec = {id:-1, name:'', unit_id:-1, price:0, code:''
        		, group_id:SR.currentGroup, special:false, pay:true,
        		ipd:false};
        SR.itemTable.datatable.addRow(newRec, 0);
        //var paginator = SR.itemTable.datatable.configs.paginator;
        SR.itemTable.datatable.configs.paginator.setPage(1);
        SR.itemTable.datatable.unselectAllRows();
        SR.itemTable.datatable.selectRow(0);
        /*var oTr = SR.itemTable.datatable.getLastTrEl();
        var oRecord = SR.itemTable.datatable.getRecord(oTr);
        var oColumn = SR.itemTable.datatable.getColumn("name");
        var cell = SR.itemTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.itemTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnGrpMenu.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.itemTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.itemTable = initItemTable();
            resetArray();
            SR.btnGrpMenu.set("disabled", false);
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
        var recs = SR.itemTable.datatable.getRecordSet().getRecords();
        SR.items.length = 0;
        if (SR.mode == 1) {
	        for (var i = 0; i < recs.length; i++) {
	        	if (recs[i].getData("id") == -1)
	        		SR.items.push(recs[i]._oData);
	        }
        } else {
	        for (var i = 0; i < SR.editItems.length; i++) {
	        	var rec = SR.itemTable.datatable.getRecord(SR.editItems[i]);
	        	if (rec == null) continue;
	        	SR.items.push(rec._oData);
	        }
        }
        
        var jsonItem = YAHOO.lang.JSON.stringify(SR.items);
        var domItem = document.getElementById("items");
        domItem.value = jsonItem;
        var jsonDelItem = YAHOO.lang.JSON.stringify(SR.delItems);
        var domDelItem = document.getElementById("del-items");
        domDelItem.value = jsonDelItem; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/save_item')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.itemTable = initItemTable();
    	this.set("disabled", true);
    	SR.btnGrpMenu.set("disabled", false);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
    
       
    SR.btnGrpMenu = new YAHOO.widget.Button("menu-group", {  
        type: "menu", menu: "select-group" }); 
    SR.btnGrpMenu.set("label", SR.grpText);
    SR.btnGrpMenu.getMenu().subscribe("click",  
		function (sType, oArgs) {
    		oMenuItem = oArgs[1]; // YAHOO.widget.MenuItem instance
	        if (oMenuItem) {
	            SR.btnGrpMenu.set("label", oMenuItem.cfg.getProperty("text"));
	            SR.currentGroup = oMenuItem.value;
	            if (SR.currentGroup == "null") {
	            	SR.hideGroup = false;
	            } else {
	            	SR.hideGroup = true;
	            }
	            SR.itemTable = initItemTable();
	            
	            /*SR.itemTable.datasource.sendRequest("group_id=" + SR.currentGroup, {
	                success:SR.itemTable.datatable.onDataReturnInitializeTable,
	                failure:SR.itemTable.datatable.onDataReturnInitializeTable,
	                scope:SR.itemTable.datatable
	            });*/
	        }
    	}
    );
}

function initItemTable() {
	var itemTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"group_id", label:"หมวดค่ารักษา", //hidden:SR.hideGroup,
            	 editor:new YAHOO.widget.DropdownCellEditor({
            		 dropdownOptions:SR.groups,disableBtns:true}),
        		 formatter:groupFormatter},
        	 {key:"code", label:"รหัสรายการ", sortable:true, editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},	 
             {key:"name", label:"รายการค่ารักษา", sortable:true, minWidth:300, 
        		 editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"unit_id", label:"หน่วยนับ", 
            	 editor:new YAHOO.widget.DropdownCellEditor({
            		 dropdownOptions:SR.units,disableBtns:true}),
            	 formatter:unitFormatter},
             {key:"price", label:"ราคา", sortable:true,
            		 editor:new YAHOO.widget.TextboxCellEditor(
            				 {validator:YAHOO.widget.DataTable.validateNumber,disableBtns:true})},
             {key:"pay", label:"จ่ายเงิน", sortable:true, formatter:"checkbox"}, 
             {key:"special", label:"พิเศษ", sortable:true, formatter:"checkbox"},
             {key:"ipd", label:"ipd", sortable:true, formatter:"checkbox"},
             {key:"del", label:"", formatter: delPainter, width:18}];
        this.query = "group_id=" + SR.currentGroup;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_items?')}",
            {
            	connXhrMode: "cancelStaleRequest",
            	connMethodPost: true,
            	responseType:YAHOO.util.DataSource.TYPE_JSON,
            	responseSchema:{
            		resultsList:"items",
            		fields:["id", "code", "name", "unit_id", 
            		        "unit", "price", "group_id", 
            		        "special", "pay", "ipd"]
            	}
        	});
        
        this.datatable = new YAHOO.widget.DataTable("item-table",
            this.coldefs, this.datasource,
            {
	        	paginator:getPaginator(10, 5),
        		scrollable:true, width:"99%", height:"300px",
                initialRequest:this.query,
            });
        
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
	        		confirmDelete(this, rec, SR.delItems,
	        				"ต้องการลบข้อมูลค่ารักษา: " + rec.getData("name"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delItems,
            				"ต้องการลบข้อมูลค่ารักษา: " + rec.getData("name"));
            	} else {
            		SR.editItems.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    

    return itemTable;
}

function getUnits() {
    var AjaxObject = {

    	handleSuccess:function(o){
    		// This member handles the success response
    		// and passes the response object o to AjaxObject's
    		// processResult member.
    		this.processResult(o);
    	},

    	handleFailure:function(o){
    		// Failure handler
    	},

    	processResult:function(o){
    		// This member is called by handleSuccess
            var result = YAHOO.lang.JSON.parse(o.responseText);
            SR.units = result.units;
            getGroups();
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/get_item_units')}", callback);
    	}

    };
    /*
         * Define the callback object for success and failure
         * handlers as well as object scope.
         */
    var callback =
    {
        	success:AjaxObject.handleSuccess,
        	failure:AjaxObject.handleFailure,
        	scope: AjaxObject
    };

    // Start the transaction.
    AjaxObject.startRequest();
}

function getGroups() {
    var AjaxObject = {

    	handleSuccess:function(o){
    		// This member handles the success response
    		// and passes the response object o to AjaxObject's
    		// processResult member.
    		this.processResult(o);
    	},

    	handleFailure:function(o){
    		// Failure handler
    	},

    	processResult:function(o){
    		// This member is called by handleSuccess
            var result = YAHOO.lang.JSON.parse(o.responseText);
            SR.groups = result.groups;
            SR.itemTable = initItemTable();
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/get_item_groups')}", callback);
    	}

    };
    /*
         * Define the callback object for success and failure
         * handlers as well as object scope.
         */
    var callback =
    {
        	success:AjaxObject.handleSuccess,
        	failure:AjaxObject.handleFailure,
        	scope: AjaxObject
    };

    // Start the transaction.
    AjaxObject.startRequest();
}

function unitFormatter(elCell, oRecord, oColumn, oData) {    
    elCell.innerHTML = getUnit(oData);
}

function groupFormatter(elCell, oRecord, oColumn, oData) {    
    elCell.innerHTML = getGroup(oData);
}

function getUnit(unitId) {
	for (var i = 0; i < SR.units.length; i++) {
		if (unitId == SR.units[i].id)
			return SR.units[i].name;
	}
	return "";
}

function getGroup(groupId) {
	for (var i = 0; i < SR.groups.length; i++) {
		if (groupId == SR.groups[i].id)
			return SR.groups[i].name;
	}
	return "";
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

