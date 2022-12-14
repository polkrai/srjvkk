var SR = new Object();
var Event, Dom, Lang, $, DT;
/* Copyright (c) 2008 Shift Right Technology co. ltd. */
var loader = new YAHOO.util.YUILoader({
    require: ["button", "reset", "fonts", "base",
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

function reloadPage(vnId, paId, orderId, qcalled) {
	$('pa_id').value = paId;
	$('vn_id').value = vnId;
	$('order_id').value = orderId;
	SR.qcalled = qcalled;
	SR.currentPatientId = paId;
    SR.currentVnId = vnId;
    SR.currentPatientId = paId;
    SR.orderId = orderId;
    getResult(SR.orderId);
}

function initComponents(){
	resetArray();
    initButtons();
    var paId = document.getElementById('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    var vnId = document.getElementById('vn_id').value;
    if (vnId == undefined || vnId == '')
        vnId = -1;
    var orderId = document.getElementById('order_id').value;
    if (orderId == undefined || orderId == '')
        orderId = -1;
    var resId = document.getElementById('res_id').value;
    if (resId == undefined || resId == '' || resId == 'None') {
    	resId = -1;
    	document.getElementById('res_id').value = resId;
    }
    var vn = document.getElementById('vn').value;
    SR.currentPatientId = paId;
    SR.currentVnId = vnId;
    SR.currentVn = vn;
    SR.orderId = orderId;
    SR.resId = resId;
    SR.usedToolTable = initUsedToolTable();
    //SR.lookupTool = initToolLookup();
    
    SR.selectedTool = [];
    if ($('txtAddTool')) {
    	SR.autoTool = initToolAutoComp();
    }
    SR.autoPerson = initReqPersonAutoComp();
    SR.autoReason = initReasonAutoComp();
    setDisableInput(true);
    SR.reasonTable = initReqReasonTable()
    SR.reqItemTable = initReqItemTable();
    initMenu();
    SR.dlgWait = getWaitDialog();
}

function initMenu() {
	SR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {
		iframe:true
	});
	SR.toolbar.render();
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){
		var pos = Dom.getXY($('toolbar_pane'));
		Dom.setXY($('toolbar_pane'),[pos.X,window.scrollY]);
    });
}

function addTool() {
	if (SR.selectedTool.length==0) return;
	var id = SR.selectedTool[0];
    var desc = SR.selectedTool[1];
    var record = {name:desc, tool_id:id, id:-1}        
    SR.usedToolTable.datatable.addRow(record);
    //SR.tools.push({tool_id:id});
    SR.selectedTool = [];
    $('txtAddTool').value = '';
}

function checkEnter(e, type) {
	var keynum;	
	if (!e) var e = window.event;
	if (e.keyCode) keynum = e.keyCode;
	else if (e.which) keynum = e.which;
	
	if (type=='tool') {
		if (keynum == 13 && !SR.autoTool.isContainerOpen()) {
			addTool();
		} 
	} else if (type=='reason') {
		if (keynum == 13 && !SR.autoReason.isContainerOpen()) {
			addReason();
		}
	}
	
}

function initToolAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/psyco/get_tools')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "tools", 
	        fields: ["id", "name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("txtAddTool", "ctTool", bDS, oConfigs); 
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
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
        return oResultData[1]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('txtAddTool').value = aData[1];
    	SR.selectedTool = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function initReasonAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/psyco/get_reasons')}"); 
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "reasons", 
	        fields: ["id", "name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("txtAddReason", "ctReason", bDS, oConfigs); 
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
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
        return oResultData[1]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('txtAddReason').value = aData[1];
    	SR.selectedReason = aData;
    };
    
    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function addReason() {
	if (SR.selectedReason.length==0) return;
	var id = SR.selectedReason[0];
    var name = SR.selectedReason[1];
    var record = {"id":-1, "reason_id":id, "reason":name, "remark":""};
    SR.reasonTable.datatable.addRow(record);
    SR.selectedReason = [];
    $('txtAddReason').value = '';
    $('txtAddReason').focus();
}

function checkChange() {
	var completed = $('chk-completed');
	if (completed.checked)
		$('completed').value = "true";
	else
		$('completed').value = "false"
}

function resetArray() {
    SR.tools = new Array();
    SR.delTools = new Array();
    SR.doneTests = [];
    SR.reqReason = [];
    SR.delReqReason = [];   
}

function getPsycoTestItem(value) {
	for (var i = 0; i < SR.psycoTestItems.length; i++) {
		if (SR.psycoTestItems[i].value == value)
			return SR.psycoTestItems[i].label;
	}
	return "";
}

function initButtons() {
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
    SR.btnPrint.addListener("click", function(e) {
    	if (SR.resId == -1) return;
    	$('frmprint').src = "${h.url_for('/psycoreport/test_result')}?res_id=" + SR.resId;
    });
    
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	/*if (SR.currentPatientId == -1 || !SR.qcalled) {
            alert("กรุณาเรียกคิวก่อน");
            return;
        }*/
    	if (SR.orderId == -1) {
            showMessageDialog("Warn", "กรุณาเลือกใบส่งบริการทางจิตวิทยาที่ต้องการ",
            		YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        if ($('completed').value == "true") {
        	showMessageDialog("Warn", "ไม่สามารถแก้ไขรายการที่ lock ได้",
        			YAHOO.widget.SimpleDialog.ICON_WARN);
        	return;
        }
        if (parent.setWorking) {
        	parent.setWorking(true);
        }
        this.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        setDisableInput(false);
        SR.mode = 2;
        SR.reqItemTable.datatable.render();
        SR.reasonTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	document.getElementById('res_id').value = o.responseText;
        	SR.usedToolTable.datasource.sendRequest("res_id=" + o.responseText, {
                success:SR.usedToolTable.datatable.onDataReturnInitializeTable,
                failure:SR.usedToolTable.datatable.onDataReturnInitializeTable,
                scope:SR.usedToolTable.datatable
            });
        	
            resetArray();
            SR.mode = 0;
            setDisableInput(true);
            SR.btnEdit.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
            if (parent.setWorking) {
            	parent.setWorking(false);
            }
            reloadPage(SR.currentVnId, SR.currentPatientId, SR.orderId, SR.qcalled);
            var msg = "";
            if ($('order-done').value == "false") {
            	msg = ' <span style="color:red">(ยังมีรายการบริการทางจิตวิทยาที่ยังไม่ทำ)</span>';
            }
            showMessageDialog("Info", 'บันทึกเรียบร้อย' + msg,
            		YAHOO.widget.SimpleDialog.ICON_INFO);
            
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
        toolRecs = SR.usedToolTable.datatable.getRecordSet().getRecords();
        SR.tools.length = 0;
        for (var i = 0; i < toolRecs.length; i++) {
        	if (toolRecs[i].getData("id") == -1)
        		SR.tools.push(toolRecs[i]._oData);
        }
        
        var jsonTools = YAHOO.lang.JSON.stringify(SR.tools);
        var domTools = document.getElementById("tools");
        domTools.value = jsonTools;
        var jsonDelTools = YAHOO.lang.JSON.stringify(SR.delTools);
        var domDelTools = document.getElementById("del_tools");
        domDelTools.value = jsonDelTools;        
        
        recs = SR.reqItemTable.datatable.getRecordSet().getRecords();
        SR.doneTests.length = 0;
        $('order-done').value = true;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("done") && recs[i].getData("id") != -1) 
        		SR.doneTests.push(recs[i]._oData);
        	if (!recs[i].getData("done"))
        		$('order-done').value = false;
        }
        
        var jsonDoneTests = YAHOO.lang.JSON.stringify(SR.doneTests);
        var domDoneTests = $("done-tests");
        domDoneTests.value = jsonDoneTests;
        
        var recs = SR.reasonTable.datatable.getRecordSet().getRecords();
        SR.reqReason.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	SR.reqReason.push(recs[i]._oData);
        	
        }
        var jsonRes = YAHOO.lang.JSON.stringify(SR.reqReason);
        var domRes = $("reasons");
        domRes.value = jsonRes;
        var jsonDelRes = YAHOO.lang.JSON.stringify(SR.delReqReason);
        var domDelRes = $("del_reasons");
        domDelRes.value = jsonDelRes; 
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psyco/save_result')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	reloadPage(SR.currentVnId, SR.currentPatientId, SR.orderId, SR.qcalled);
        this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnEdit.set("disabled", false);
        setDisableInput(true);
        SR.mode = 0;
        resetArray();
        if (parent.setWorking) {
        	parent.setWorking(false);
        }
    });
    if ($('btnAddTool')) {
    	SR.btnAddTool = new YAHOO.widget.Button("btnAddTool");
        SR.btnAddTool.addListener("click", function(e) {
        	addTool();
            //SR.lookupTool.show();
        });
    }
    
    SR.btnAddReason = new YAHOO.widget.Button("btnAddReason");
    SR.btnAddReason.addListener("click", function(e) {
    	addReason();
    });
}

function initToolLookup() {
    var handleOk = function() {
    	var select = document.getElementById("select-tool");
        var id = select.options[select.selectedIndex].id;
        var desc = select.options[select.selectedIndex].text;
        var record = {"id":-1, "name":desc, "result_id":SR.resId, "tool_id":id};
        "id", "name", "result_id", "tool_id"
        SR.usedToolTable.datatable.addRow(record);
        this.hide();
    };
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("lookupTool", { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : false,
        buttons : [ { text:"ตกลง", handler:handleOk, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });
   
    dialog.render(); 
    return dialog;
}

function initReqPersonAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/srutil/get_users')}"); 
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "users", 
	        fields: ["id", "name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("req_person", "ctPerson", bDS, oConfigs); 
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
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
        return oResultData[1]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('req_person_id').value = aData[0];
    	$('req_person').value = aData[1];
    	SR.selectedReason = aData;
    };
    
    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

var readonlyColor = 'lightyellow';
var normalColor = 'white';
function setDisableInput(disable) {
    var form = document.getElementById("form");
    for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        if (el.type == "textarea" || el.type == "text") { 
            if (disable) {
                YAHOO.util.Dom.setStyle(el.id, 'background-color', readonlyColor); 
            } else {
                YAHOO.util.Dom.setStyle(el.id, 'background-color', normalColor); 
            }
            el.readOnly = disable;
            if (el.id == "req_remark" /*|| el.id == "req_person"*/) {
            	YAHOO.util.Dom.setStyle(el.id, 'background-color', readonlyColor);
            	el.readOnly = true;
            }
        }
    }
    if (SR.btnAddTool) {
    	SR.btnAddTool.set("disabled", disable);
    }
    
}

function initReqReasonTable() {
    var reqReasonTable = new function(){
        this.coldefs =
            [{key:"id", label:"", hidden:true},
             {key:"reason_id", label:"", hidden:true},
             {key:"reason", label:"เหตุส่งบริการทางจิตวิทยา"},
             {key:"remark", label:"หมายเหตุ", minWidth:200,
              	editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter:delPainter}];
        this.query = "order_id=" + SR.orderId;
        this.datasource = new YAHOO.util.DataSource(
        		"${h.url_for('/psyco/get_req_test_reason?')}",
                {
        			connXhrMode: "cancelStaleRequest",
        			connMethodPost: true,
        			responseType:YAHOO.util.DataSource.TYPE_JSON,
        			responseSchema:{resultsList:"reasons",
        			fields:["id", "reason_id", "reason", "remark"]}
        		});
        
        this.datatable = new YAHOO.widget.DataTable("reason-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"100px",
        	initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
		    	if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delReqReason,
	        				"ต้องการลบข้อมูลเหตุส่งบริการทางจิตวิทยา: " + rec.getData("reason"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delReqReason,
            				"ต้องการลบข้อมูลเหตุส่งบริการทางจิตวิทยา: " + rec.getData("reason"));
            	} 
        	}
    	
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked); 
    }
    return reqReasonTable;
}

function initReqItemTable() {
    var reqItemTable = new function(){
        this.coldefs =
            [{key:"done", label:"ทำแล้ว", formatter:doneFormatter},
             {key:"item", label:"รายการ", resizeable:true},
             {key:"donedate", label:"วันที่ทำ", formatter:dateFormatter}];
        this.query = "order_id=" + SR.orderId;
        this.datasource = new YAHOO.util.DataSource(
        		"${h.url_for('/psyco/get_req_test_item?')}",
                {
        			connXhrMode: "cancelStaleRequest",
        			connMethodPost: true,
        			responseType:YAHOO.util.DataSource.TYPE_JSON,
        			responseSchema:{resultsList:"items",
        			fields:["done","id", "item", "item_id", "unit", 
        			        "unit_id", "qty", "price", "totalprice", "order_id",
        			        {key:"donedate", parser:parseDate}]}
        		});
        
        this.datatable = new YAHOO.widget.DataTable("req-item-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"95%", height:"100px",
        	initialRequest:this.query});
        
        this.handleCheckboxClicked = function(oArgs) {
            var elCheckbox = oArgs.target;
            newValue = elCheckbox.checked;
            record = this.getRecord(elCheckbox);
            column = this.getColumn(elCheckbox);
            record.setData(column.key, newValue);
        }
        this.datatable.subscribe("checkboxClickEvent", this.handleCheckboxClicked);
        
    }
    return reqItemTable;
}

function doneFormatter(elCell, oRecord, oColumn, oData) {    
    if (oData) {
    	elCell.innerHTML = ' <img width="22px" height="22px" src="/img/paid.png" />';
    } else {
    	if (SR.mode == 0) {
    		elCell.innerHTML = '<input type="checkbox" disabled="disabled">';
    	} else {
    		elCell.innerHTML = '<input type="checkbox">';
    	}
    }
}

function initUsedToolTable() {
	var usedToolTable = new function(){
        this.coldefs =
            [{key:"tool_id", label:"รหัส", hidden:true},
             {key:"name", label:"เครื่องมือ"},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "res_id=" + SR.resId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/psyco/get_used_tools?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"usedtools",
                fields:["id", "name", "result_id", "tool_id"]}});
        
        this.datatable = new YAHOO.widget.DataTable("used-tool-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"500px", height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delTools,
        				"ต้องการลบข้อมูลเครื่องมือที่ใช้: " + rec.getData("name"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
//        this.datatable.subscribe("buttonClickEvent", function(oArgs){ 
//        	if (SR.mode == 0) return;
//        	var handleYes = function() {
//                var index = usedToolTable.datatable.getTrIndex(oArgs.target);
//                var record = usedToolTable.datatable.getRecord(index);
//                usedToolTable.datatable.deleteRow(index);
//                var oid = record.getData("id");
//                if (oid != -1) {
//                    SR.delTools.push({"id":oid});
//                }
//        		this.hide();
//        	};
//        	var handleNo = function() {
//        		this.hide();
//        	};
//
//        	// Instantiate the Dialog
//        	var dlgConfirmDel = new YAHOO.widget.SimpleDialog("dlgConfirmDel", 
//                 { width: "300px",
//                   fixedcenter: true,
//                   visible: false,
//                   draggable: false,
//                   close: true,
//                   text: "ต้องการลบข้อมูล หรือไม่",
//                   icon: YAHOO.widget.SimpleDialog.ICON_HELP,
//                   constraintoviewport: true,
//                   buttons: [ { text:"ใช่", handler:handleYes },
//                              { text:"ไม่",  handler:handleNo, isDefault:true} ]
//                 });
//        	dlgConfirmDel.setHeader("ลบข้อมูล");
//        	
//        	// Render the Dialog
//        	dlgConfirmDel.render("dlgDelete");
//            dlgConfirmDel.show();
//        });         
    }
    

    return usedToolTable;
}

function getResult(orderId) {
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
            SR.resId = result['id'];
            $('res_id').value = result['id'];
            //$('req_remark').value = result['req_reason'];
            $('req_person_id').value = result['req_person_id'];
            $('req_person').value = result['req_person'];
            $('behaviour').value = result['behaviour'];
            $('result').value = result['result'];
            $('conclusion').value = result['conclusion'];
            $('suggestion').value = result['suggestion'];
            $('created_by').innerHTML = result['created_by'];
            $('created_date').innerHTML = result['created_date'];
            if (result.completed) {
            	$('lock').innerHTML = '<img src="/img/paid.png">';
            } else {
            	$('lock').innerHTML = '<input style="margin:5px" type="checkbox" id="chk-completed" name="chk-completed" onclick=checkChange()>';
            }
            $('lbl-order').innerHTML = "เลขที่ order: " + SR.orderId
//            $('completed').checked = result['completed'];
//            $('completed').disabled = result['completed'];
            SR.reasonTable.datasource.sendRequest("order_id=" + SR.orderId, {
                success:SR.reasonTable.datatable.onDataReturnInitializeTable,
                failure:SR.reasonTable.datatable.onDataReturnInitializeTable,
                scope:SR.reasonTable.datatable
            });
            SR.reqItemTable.datasource.sendRequest("order_id=" + SR.orderId, {
                success:SR.reqItemTable.datatable.onDataReturnInitializeTable,
                failure:SR.reqItemTable.datatable.onDataReturnInitializeTable,
                scope:SR.reqItemTable.datatable
            });
            SR.usedToolTable.datasource.sendRequest("res_id=" + SR.resId, {
                success:SR.usedToolTable.datatable.onDataReturnInitializeTable,
                failure:SR.usedToolTable.datatable.onDataReturnInitializeTable,
                scope:SR.usedToolTable.datatable
            });
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psyco/get_result')}", 
    			   callback, "order_id=" + SR.orderId + "&result_type=" + $("result_type").value);
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

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

