var SR = new Object();
var Event, Dom, Lang, $, DT;
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
		Event = YAHOO.util.Event,
		Dom = YAHOO.util.Dom,
		Lang = YAHOO.lang,
		$ = Dom.get,
		DT = YAHOO.widget.DataTable;
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
	loadItemGroups();
    initButtons();
    SR.items = new Array();
    SR.groups = new Array();
    SR.specialTable = initSpecialTable(-1);
    SR.privilegeTable = initPrivilegeTable();
    
    SR.spanSelectGroup = document.getElementById("span-select-group");
    SR.spanSelectItem = document.getElementById("span-select-item");
    SR.lblUnit = document.getElementById("lbl-unit");
    SR.dlgSpecial = initDlgSpecial();
    SR.dlgWait = getWaitDialog();
    setDisable(true);
    $('txtSubsidy').value = 0;
    $('txtDay').value = 0;
    Event.addListener('txtAddItem', 'keypress', checkEnter);
    Event.addListener('txtSubsidy', 'keypress', checkEnter);
    Event.addListener('txtDay', 'keypress', checkEnter);
    Event.addListener('txtAddItem', 'focus', selectText);
    Event.addListener('txtSubsidy', 'focus', selectText);
    Event.addListener('txtDay', 'focus', selectText);
}

function resetArray() {
    SR.privilege = "";
    SR.editPrivilege = "";
    SR.delPrivileges = new Array();
    SR.specials = new Array();
    SR.editSpecials = [];
    SR.delSpecials = new Array();
    SR.selectedItem = [];
}

function initButtons() {
    
    SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/finance/setup_main')}";
    });
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {        
        this.set("disabled", true);
        setDisable(false);
    	SR.mode = 1;
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.btnAddItem.set("disabled", false);
        
        newRec = {'id':-1, 'name':'', "privileged":false, "med_in":false,
        		"med_out":false, "special":false, "max_med_period":0,
        		"max_med_amount":0};
        SR.privilegeTable.datatable.addRow(newRec, 0);
        var oTr = SR.privilegeTable.datatable.getFirstTrEl();
        SR.privilegeTable.datatable.unselectAllRows();
        SR.privilegeTable.datatable.selectRow(oTr);
        SR.editPrivilege = oTr.id;
        SR.privilegeTable.datatable.configs.paginator.setPage(1);
        /*var oTr = SR.privilegeTable.datatable.getLastTrEl();
        var oRecord = SR.privilegeTable.datatable.getRecord(oTr);
        var oColumn = SR.privilegeTable.datatable.getColumn("name");
        var cell = SR.privilegeTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.privilegeTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	var selectedRows = SR.privilegeTable.datatable.getSelectedRows();
    	if (selectedRows.length == 0) {
    		 showMessageDialog("Warn", "กรุณาเลือกสิทธิ์ที่ต้องการแก้ไข",
    				 YAHOO.widget.SimpleDialog.ICON_WARN);
             return;
    	}
    	SR.mode = 2;
    	setDisable(false);
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.btnAddItem.set("disabled", false);
        SR.editPrivilege = selectedRows[0];
        SR.privilegeTable.datatable.render();
        SR.specialTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	setDisable(true);
        	SR.privilegeTable = initPrivilegeTable();
        	/*SR.privilegeTable.datasource.sendRequest("", {
                success:SR.privilegeTable.datatable.onDataReturnInitializeTable,
                failure:SR.privilegeTable.datatable.onDataReturnInitializeTable,
                scope:SR.privilegeTable.datatable
            });*/
            resetArray();
            SR.btnAdd.set("disabled", false);
            SR.btnEdit.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
            SR.btnAddItem.set("disabled", true);
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
    	var rec = SR.privilegeTable.datatable.getRecord(SR.editPrivilege);
    	if (rec) {
    		SR.privilege = rec._oData;
    	}
        
        SR.specials.length = 0;
        recs = SR.specialTable.datatable.getRecordSet().getRecords();
        
        for (var i = 0; i < recs.length; i++) {
        	SR.specials.push(recs[i]._oData);
        }
        for (var i = 0; i < SR.editSpecials.length; i++) {
        	var rec = SR.specialTable.datatable.getRecord(SR.editSpecials[i]);
        	if (rec == null) continue;
        	SR.editSpecials.push(rec._oData);
        }
                
        var jsonPrivilege = YAHOO.lang.JSON.stringify(SR.privilege);
        var domPrivilege = document.getElementById("privilege");
        domPrivilege.value = jsonPrivilege;
        var jsonDelPrivilege = YAHOO.lang.JSON.stringify(SR.delPrivileges);
        var domDelPrivilege = document.getElementById("del-privileges");
        domDelPrivilege.value = jsonDelPrivilege; 
        
        var jsonSpecial = YAHOO.lang.JSON.stringify(SR.specials);
        var domSpecial = document.getElementById("specials");
        domSpecial.value = jsonSpecial;
        var jsonDelSpecial = YAHOO.lang.JSON.stringify(SR.delSpecials);
        var domDelSpecial = document.getElementById("del-specials");
        domDelSpecial.value = jsonDelSpecial; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/save_privilege')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.privilegeTable = initPrivilegeTable();
    	setDisable(false);
    	/*SR.privilegeTable.datasource.sendRequest("", {
            success:SR.privilegeTable.datatable.onDataReturnInitializeTable,
            failure:SR.privilegeTable.datatable.onDataReturnInitializeTable,
            scope:SR.privilegeTable.datatable
        });*/
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        SR.btnAddItem.set("disabled", true);
        SR.mode = 0;
        resetArray();
    });
    
    SR.btnAddItem = new YAHOO.widget.Button("btnAddItem");
    SR.btnAddItem.set("disabled", true);
    SR.btnAddItem.addListener("click", function(e) {
		SR.dlgSpecial.show();
    });
    
    SR.autoItem = initItemAutoComp();
}

function selectText(e) {
	e.target.select();
}

function checkEnter(e) {
	var keynum;	
	if (!e) var e = window.event;
	if (e.keyCode) keynum = e.keyCode;
	else if (e.which) keynum = e.which;
	if (e.target == $('txtDay') && keynum == 13) {
		if (Lang.isNumber(parseNumber($('txtDay').value))) {
			addItem();
			$('txtAddItem').focus();
		} else {
			showMessageDialog("Error", "กรุณากรอกตัวเลข", YAHOO.widget.SimpleDialog.ICON_WARN);
			$('txtDay').value = 0;
			$('txtDay').select();
			return false;
		}
	} 
	
	if (e.target == $('txtSubsidy') && keynum == 13) {
		if (Lang.isNumber(parseNumber($('txtSubsidy').value))) {
			$('txtDay').focus();
		} else {
			showMessageDialog("Error", "กรุณากรอกตัวเลข", YAHOO.widget.SimpleDialog.ICON_WARN);
			$('txtSubsidy').value = 0;
			$('txtSubsidy').select();
			return false;
		}
	} 
	if (e.target == $('txtAddItem') && keynum == 13 && !SR.autoItem.isContainerOpen()) {
		if (SR.selectedItem[2] != $('txtAddItem').value) {
			showMessageDialog("Error", "ไม่มีรายการที่เลือก", YAHOO.widget.SimpleDialog.ICON_WARN);
			return false;
			
		} else {
			$('txtSubsidy').focus();
		}
	}
	if (keynum == 9) {
		if(e.preventDefault) {
            e.preventDefault();
            return false;
        }
	}
}

function addItem() {
	if (SR.selectedItem.length==0) return;
	var id = SR.selectedItem[0];
    var item = SR.selectedItem[2];
    var unit = SR.selectedItem[4];
    var group = SR.selectedItem[6];
    var subsidy = $('txtSubsidy').value;
    var day = $('txtDay').value;
    var record = {id:-1, item:item, item_id:id, unit:unit, group:group, 
    		subsidy_amount:subsidy, max_day_allowed:day};
    SR.specialTable.datatable.addRow(record);
    //SR.helps.push({help_id:id});
    SR.selectedItem = [];
    $('txtAddItem').value = '';
    $('txtSubsidy').value = 0;
    $('txtDay').value = 0;
}

function initItemAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/finance/get_special_items')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "items", 
	        fields: ["id","code","name", "unit_id", "unit", "group_id", "group",
	                 "price"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("txtAddItem", "ctItem", bDS, oConfigs); 
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        if (oTextbox.readOnly) return false;
        var pos = YAHOO.util.Dom.getXY(oTextbox);
        pos[1] += YAHOO.util.Dom.get(oTextbox).offsetHeight + 2;
        YAHOO.util.Dom.setXY(oContainer,pos);
        return true;
    }; 
    
    bAC.generateRequest = function(sQuery) { 
        return "?limit=8&query="+sQuery; 
    }; 
    
    bAC.formatResult = function(oResultData, sQuery, sResultMatch) { 
        return oResultData[2]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('txtAddItem').value = aData[2];
    	$('txtSubsidy').value = aData[7];
    	$('txtDay').value = 0;
    	SR.selectedItem = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}


function initPrivilegeTable() {
	var privilegeTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"name", label:"ชื่อสิทธิ์", sortable:true, minWidth:200,  
            	editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"max_med_period", label:"จำนวนวัน",   
            		sortable:true, editor:new YAHOO.widget.TextboxCellEditor({validator:YAHOO.widget.DataTable.validateNumber,disableBtns:true})},
             {key:"max_med_amount", label:"จำนวนเงิน",   
            			sortable:true, editor:new YAHOO.widget.TextboxCellEditor({validator:YAHOO.widget.DataTable.validateNumber,disableBtns:true})},
             {key:"privileged", label:"เบิกค่ารักษา", formatter:"checkbox"},
             {key:"med_in", label:"เบิกค่ายาในบัญชียาหลัก", formatter:"checkbox"},
             {key:"med_out", label:"เบิกค่ายานอกบัญชียาหลัก", formatter:"checkbox"},
             {key:"special", label:"เบิกรายการค่าีรักษาพิเศษ", formatter:"checkbox"},
             {key:"del",label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_privileges?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"privileges",
                fields:["id", "name", "max_med_period", "max_med_amount", "privileged", 
                        "med_in", "med_out", "special"]}});
        
        this.datatable = new YAHOO.widget.DataTable("privilege-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"95%", height:"300px",
        	paginator:getPaginator(10, 5),
                initialRequest:this.query});
        
        var thead = this.datatable.getTheadEl();
        var tr = thead.childNodes[0];
        for (var i = 0; i < tr.childNodes.length; i++) {
        	Dom.setStyle(tr.childNodes[i], 'overflow', 'scroll');
        }
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
		    		confirmDelete(this, rec, SR.delPrivileges, 
		    				"ต้องการลบช้อมูลสิทธิ์: " + rec.getData("name"));
	        	}
        	} else if (SR.mode == 2) {
        		if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delPrivileges,
	        				"ต้องการลบช้อมูลสิทธิ์: " + rec.getData("name"));
	        	}
        	}
        	if (rec.getId() == SR.editPrivilege)
        		this.onEventShowCellEditor(oArgs)
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
        this.handleClicked = function(oArgs){
        	if (SR.mode != 0) return;
            var row = this.getRow(oArgs.target);
            this.unselectAllRows();
            this.selectRow(row);
        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        
        this.handleRowSelected = function (oArgs) {
            //if (SR.adding) return;
            var sid = oArgs.record.getData("id");
            if (sid==undefined)
                sid = -1;
            SR.specialTable = initSpecialTable(sid);
            
            /*var oCallback = {
                success : vct.onDataReturnInitializeTable,
                failure : vct.onDataReturnInitializeTable,
                scope : vct
            };
            
            vcs.sendRequest("privilege_id=" + sid, oCallback);*/
            parent.getPsycoTestResult(SR.currentVnId, sid);
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
        
        this.handeledInit = function() {
            if (this.getRecordSet().getRecords().length > 0) {
                this.selectRow(0);
            } else {
            	SR.specialTable = initSpecialTable(-1);
                /*SR.specialTable.datasource.sendRequest("privilege_id=-1", {
                    success:SR.specialTable.datatable.onDataReturnInitializeTable,
                    failure:SR.specialTable.datatable.onDataReturnInitializeTable,
                    scope:SR.specialTable.datatable
                })*/
            }
        }
        this.datatable.subscribe("initEvent", this.handeledInit);
        
    }
    

    return privilegeTable;
}

function initSpecialTable(pId) {
	var specialTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"group", label:"ประเภท", sortable:true},
             {key:"item", label:"รายการค่ารักษาพิเศษ", sortable:true},
             {key:"unit", label:"หน่วยนับ"},
             {key:"subsidy_amount", label:"จำนวนเงินที่เบิกได้", 
            	 editor:new YAHOO.widget.TextboxCellEditor(
            			 {validator:YAHOO.widget.DataTable.validateNumber,
            				 disableBtns:true})},       
             {key:"max_day_allowed", label:"จำนวนวันที่เบิกได้", 
            	 editor:new YAHOO.widget.TextboxCellEditor(
            			 {validator:YAHOO.widget.DataTable.validateNumber,
            				 disableBtns:true})},
             {key:"del",label:"", formatter: delPainter}];
        this.query = "privilege_id=" + pId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_specials?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"specials",
                fields:["id", "item_id", "group", "item", "unit", "subsidy_amount",
                        "max_day_allowed"]}});
        
        this.datatable = new YAHOO.widget.DataTable("special-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px",
        	paginator:getPaginator(10,5),
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delSpecials,
        				"ต้องการลบช้อมูลรายการพิเศษ: " + rec.getData("item"));
        	} else {
        		SR.editSpecials.push(rec.getId());
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
    }
    

    return specialTable;
}

function initDlgSpecial() {
    var handleOk = function() {
        var sel = document.getElementById('select-item');
        var subsidy = document.getElementById('txt-subsidy').value;
        var record = {'id':-1, 'item_id':SR.items[sel.selectedIndex].id, 'subsidy_amount':subsidy,
        		'item':SR.items[sel.selectedIndex].name, 'unit':SR.items[sel.selectedIndex].unit};
        SR.specialTable.datatable.addRow(record);
        this.hide();
    };
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("dlg-special", { 
        width : "40em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : false,
        buttons : [ { text:"ตกลง", handler:handleOk, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });
   
    dialog.render(); 
    return dialog;
}

function setUnit(index) {
	SR.lblUnit.innerHTML = SR.items[index].unit;
}

function loadItems(groupId) {
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
            SR.items = result.items;
            var options = "";
            if (SR.items.length > 0)
            	setUnit(0);
            for (var i = 0; i < SR.items.length; i++) {
            	options += '<option value="' + SR.items[i].id + '">' + SR.items[i].name + '</options>';
            }
            SR.spanSelectItem.innerHTML = '<select style="min-width:300px;max-width:300px;" id="select-item" onchange="setUnit(this.selectedIndex)">' + options + '</select>';
            
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/get_items')}", callback, "group_id=" + groupId + "&special=true");
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

function loadItemGroups() {
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
            var options = "";
            if (SR.groups.length > 0)
            	loadItems(SR.groups[0].id);
            for (var i = 0; i < SR.groups.length; i++) {
            	options += '<option value="' + SR.groups[i].id + '">' + SR.groups[i].name + '</options>';
            }
            SR.spanSelectGroup.innerHTML = '<select style="min-width:300px;max-width:300px;" id="select-group" onchange="loadItems(this.options[this.selectedIndex].value)">' + options + '</select>';
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

function delPainter(elCell, oRecord, oColumn, oData) {    
	srDelPainter(elCell, oRecord, oColumn, oData, SR.mode);
}

function setDisable(disable) {
	if (disable) {
		Dom.setStyle('txtAddItem', 'background-color', readonlyColor);
		Dom.setStyle('txtSubsidy', 'background-color', readonlyColor);
		Dom.setStyle('txtDay', 'background-color', readonlyColor);
	} else {
		Dom.setStyle('txtAddItem', 'background-color', normalColor);
		Dom.setStyle('txtSubsidy', 'background-color', normalColor);
		Dom.setStyle('txtDay', 'background-color', normalColor);
	}
	$('txtAddItem').readOnly = disable;
	$('txtSubsidy').readOnly = disable;
	$('txtDay').readOnly = disable;
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

