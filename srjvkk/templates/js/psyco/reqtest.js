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
		Event = YAHOO.util.Event;
		Dom = YAHOO.util.Dom;
		Lang = YAHOO.lang;
		$ = Dom.get;
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
function reloadPage(vnId, paId, qcalled) {
	$('pa_id').value = paId;
	$('vn_id').value = vnId;
	$('qcalled').value = qcalled;
	SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    SR.currentPatientId = paId;
    resetArray();
    var oCallback = {
        success : SR.orderTable.datatable.onDataReturnInitializeTable,
        failure : SR.orderTable.datatable.onDataReturnInitializeTable,
        scope : SR.orderTable.datatable
    };
    SR.orderTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, oCallback);
    /*
    SR.reqReasonTable.datasource.sendRequest("order_id=-1", {
        success:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
        failure:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
        scope:SR.reqReasonTable.datatable
    });*/
	SR.reqItemTable.datasource.sendRequest("order_id=-1", {
        success:SR.reqItemTable.datatable.onDataReturnInitializeTable,
        failure:SR.reqItemTable.datatable.onDataReturnInitializeTable,
        scope:SR.reqItemTable.datatable
    });
}

function initComponents(){
    resetArray();
    SR.psycoTestItems = new Array();
    initButtons();
    var paId = document.getElementById('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    var vnId = document.getElementById('vn_id').value;
    if (vnId == undefined || vnId == '')
        vnId = -1;
    var qcalled = document.getElementById('qcalled').value;
    if (qcalled == "true")
        qcalled = true;
    else
        qcalled = false;
    var vn = document.getElementById('vn').value;
    SR.currentPatientId = paId;
    SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    //SR.currentVn = vn;
    SR.orderTable = initOrderTable();
    //SR.reqReasonTable = initReqReasonTable();
    SR.reqItemTable = initReqItemTable();
    //SR.lookupTest = initTestLookup();
    //SR.dlgReqTest = initDlgReqTest();
    setDisableInput(true);
    SR.autoItem = initItemAutoComp();
    //SR.autoReason = initReasonAutoComp();
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

function addItem() {
	if (SR.selectedItem.length==0) return;
	var id = SR.selectedItem[0];
    var desc = SR.selectedItem[2];
    var unitId = SR.selectedItem[3];
    var unitName = SR.selectedItem[4];
    var price = SR.selectedItem[5];
    var record = {"done":false,"id":-1, "item_id":id, "item":desc, 
    		"unit_id":unitId, "unit":unitName, "qty":1, "price":price, 
    		"totalprice":price};
    SR.reqItemTable.datatable.addRow(record);
    SR.selectedItem = [];
    $('txtAddTest').value = '';
    $('txtAddTest').focus();
}

function addReason() {
	if (SR.selectedReason.length==0) return;
	var id = SR.selectedReason[0];
    var name = SR.selectedReason[1];
    var record = {"id":-1, "reason_id":id, "reason":name, "remark":""};
    SR.reqReasonTable.datatable.addRow(record);
    SR.selectedReason = [];
    $('txtAddReason').value = '';
    $('txtAddReason').focus();
}

function checkEnter(e, type) {
	var keynum;	
	if (!e) var e = window.event;
	if (e.keyCode) keynum = e.keyCode;
	else if (e.which) keynum = e.which;
	if (type=='item') {
		if (keynum == 13 && !SR.autoItem.isContainerOpen()) {
			addItem();
		} 
		if (keynum == 9) {
			$('txtAddReason').focus();
			if(e.preventDefault) {
                e.preventDefault();
                return false;
            }
		}
	} else if (type=='reason') {
		if (keynum == 13 && !SR.autoReason.isContainerOpen()) {
			addReason();
		}
		if (keynum == 9) {
			$('txtAddTest').focus();
			if(e.preventDefault) {
                e.preventDefault();
                return false;
            }
		}
	}
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

function initItemAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/psyco/get_psyco_items')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "items", 
	        fields: ["id", "code", "name", "unit_id", "unit_name", "price"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("txtAddTest", "ctTest", bDS, oConfigs); 
    
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
        return oResultData[2]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('txtAddTest').value = aData[2];
    	SR.selectedItem = aData;
    };
    
    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function resetArray() {
    SR.reqD = new Array();
    SR.delReqD = [];
    SR.reqReason = new Array();
    SR.delReqReason = [];
    SR.selectedItem = [];
    SR.selectedReason = [];
    SR.editReasons = [];
    SR.delOrders = [];
    SR.doneTests = [];
}

function resetTables() {
	SR.orderTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
        success:SR.orderTable.datatable.onDataReturnInitializeTable,
        failure:SR.orderTable.datatable.onDataReturnInitializeTable,
        scope:SR.orderTable.datatable
    });
	/*SR.reqReasonTable.datasource.sendRequest("order_id=-1", {
        success:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
        failure:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
        scope:SR.reqReasonTable.datatable
    });*/
	SR.reqItemTable.datasource.sendRequest("order_id=-1", {
        success:SR.reqItemTable.datatable.onDataReturnInitializeTable,
        failure:SR.reqItemTable.datatable.onDataReturnInitializeTable,
        scope:SR.reqItemTable.datatable
    });
}

function getPsycoTestItem(value) {
	for (var i = 0; i < SR.psycoTestItems.length; i++) {
		if (SR.psycoTestItems[i].value == value)
			return SR.psycoTestItems[i].label;
	}
	return "";
}

function initButtons() {
	SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {
        if (SR.currentPatientId == -1 || !SR.qcalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน",
            		YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        try {
		    if (parent.setWorking) {
		    	parent.setWorking(true);
		    }
        } catch (ex) {
        	//alert(ex.message);
        }
        SR.orderTable.datatable.unselectAllRows();
        resetArray();
        resetTables();
        this.set("disabled", true);
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        setDisableInput(false);
        $('order-id').value = -1;
        //$('txtAddReason').focus();
        SR.mode = 1;
        SR.orderTable.datatable.render();
        SR.reqItemTable.datatable.render();
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	if (SR.currentPatientId == -1 || !SR.qcalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน",
            		YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
    	var recs = SR.orderTable.datatable.getSelectedRows();
        if (recs.length == 0) {
            showMessageDialog("Warn", "กรุณาเลือกใบส่งตรวจที่ต้องการแก้ไข",
            		YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        if (SR.orderTable.datatable.getRecord(recs[0]).getData('stop')) {
        	showMessageDialog("Warn", "ไม่สามารถแก้ไขใบส่งตรวจที่ทำเสร็จแล้วได้",
        			YAHOO.widget.SimpleDialog.ICON_WARN);
        	return;
        }
        try {
	        if (parent.setWorking) {
	        	parent.setWorking(true);
	        }
        } catch(ex) {
        	//alert(ex.message);
        }
        SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        setDisableInput(false);
        //$('txtAddReason').focus();
        SR.orderTable.datatable.render();
        //SR.reqReasonTable.datatable.render();
        SR.reqItemTable.datatable.render();
        
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
    	if (SR.currentPatientId == -1 || !SR.qcalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน",
            		YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
    	var sRows = SR.orderTable.datatable.getSelectedRows();
    	var sRec = null;
    	if (sRows.length > 0) {
    		sRec = SR.orderTable.datatable.getRecord(sRows[0]); 
    	}
    	if (//sRec != null &&
    			SR.reqItemTable.datatable.getRecordSet().getRecords().length == 0) {
    		showMessageDialog("Warn", "กรุณากรอกรายการบริการทางจิตวิทยา อย่างน้อย 1 รายการ", 
    				YAHOO.widget.SimpleDialog.ICON_WARN);
    		return;
    	}
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	
        	resetTables();
            resetArray();
            setDisableInput(true);
            SR.btnAdd.set("disabled", false);
            SR.btnEdit.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
            showMessageDialog("Info", 'บันทึกเรียบร้อย',
            		YAHOO.widget.SimpleDialog.ICON_INFO);
            SR.mode = 0;
            try {
		        if (parent.setWorking) {
		        	parent.setWorking(false);
		        }
		        if (parent.setOrderSelected) {
            		parent.setOrderSelected(false);
            	}
            } catch(ex) {
            	//alert(ex.message);
            }
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
        
        /*
        var recs = SR.reqReasonTable.datatable.getRecordSet().getRecords();
        SR.reqReason.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.reqReason.push(recs[i]._oData);
        	}
        }
        for (var i = 0; i < SR.editReasons.length; i++) {
        	var rec = SR.reqReasonTable.datatable.getRecord(SR.editReasons[i]);
        	if (rec == null) continue;
        	SR.reqReason.push(rec._oData);
        }
        var jsonRes = YAHOO.lang.JSON.stringify(SR.reqReason);
        var domRes = $("reasons");
        domRes.value = jsonRes;
        var jsonDelRes = YAHOO.lang.JSON.stringify(SR.delReqReason);
        var domDelRes = $("del_reasons");
        domDelRes.value = jsonDelRes; 
        */
        recs = SR.reqItemTable.datatable.getRecordSet().getRecords();
        SR.reqD.length = 0;
        $('order-done').value = true;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.reqD.push(recs[i]._oData);
        	}
        	if (recs[i].getData("done") && recs[i].getData("id") != -1) 
        		SR.doneTests.push(recs[i]._oData);
        	if (!recs[i].getData("done"))
        		$('order-done').value = false;
        }
        var jsonDoneTests = YAHOO.lang.JSON.stringify(SR.doneTests);
        var domDoneTests = $("done_tests");
        domDoneTests.value = jsonDoneTests; 
        
        var jsonReqD = YAHOO.lang.JSON.stringify(SR.reqD);
        var domReqD = $("tests");
        domReqD.value = jsonReqD;
        
        var jsonDelReqD = YAHOO.lang.JSON.stringify(SR.delReqD);
        var domDelReqD = document.getElementById("del_tests");
        domDelReqD.value = jsonDelReqD; 
        
        var jsonDelOrder = YAHOO.lang.JSON.stringify(SR.delOrders);
        var domDelOrder = $("del-orders");
        domDelOrder.value = jsonDelOrder; 
                
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psyco/save_reqtest')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	resetTables();
        SR.mode = 0;
        $('order-id').value = -1;
        resetArray();
        setDisableInput(true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        SR.btnSave.set("disabled", true);
        SR.btnCancel.set("disabled", true);
        try {
		    if (parent.setWorking) {
		    	parent.setWorking(false);
		    }
		    if (parent.setOrderSelected) {
        		parent.setOrderSelected(false);
        	}
        } catch(ex) {
        	//alert(ex.message);
        }
    });
    
    SR.btnAddTest = new YAHOO.widget.Button("btnAddTest");
    SR.btnAddTest.addListener("click", function(e) {
    	addItem();
    });
    /*SR.btnAddReason = new YAHOO.widget.Button("btnAddReason");
    SR.btnAddReason.addListener("click", function(e) {
    	addReason();
    });*/
}

function initDlgReqTest() {
    var handleOk = function() {
        var now = new Date();
        var orderDate = now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear();
        var remark = document.getElementById('remark').value;
        document.getElementById('remark').value = remark;
        var record = {'id':-1, 'order_date':orderDate, 'remark':remark};
        //SR.reqReasonTable.datatable.addRow(record);
        this.hide();
    };
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("dlgReqTest", { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : false,
        modal: true,
        buttons : [ { text:"ตกลง", handler:handleOk, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });
    
    dialog.beforeShowEvent.subscribe(function () {
        /*var rows = SR.reqReasonTable.datatable.getSelectedRows();
        var domRemark = document.getElementById("remark");
        if (rows.length > 0) {
            domRemark.value = rows[0].getData("remark");
        } else {
            domRemark.value = "";
            document.getElementById('remark').value = "";
        }
        */
    });
    dialog.render(); 
    return dialog;
}

function initTestLookup() {
    var handleOk = function() {
        var select = document.getElementById("select_test");
        var id = select.options[select.selectedIndex].id;
        var code = select.options[select.selectedIndex].value;
        var desc = select.options[select.selectedIndex].text;
        var unitId = document.getElementById("unit_id").value;
        var unit = document.getElementById("unit").innerHTML;
        var qty = document.getElementById("qty").value;
        var price = document.getElementById("price").value;
        var record = {"done":false,"id":-1, "item_id":id, "item":desc, "unit_id":unitId, "unit":unit, "qty":qty, "price":price, "totalprice":price*qty};
        SR.reqItemTable.datatable.addRow(record);
        this.hide();
    };
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("lookupPsycoTest", { 
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

var readonlyColor = 'lightyellow';
var normalColor = 'white';
function setDisableInput(disable) {
    /*var form = document.getElementById("form");
    for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        if (el.type == "textarea" || el.type == "text") { 
            if (disable) {
                YAHOO.util.Dom.setStyle(el.id, 'background-color', readonlyColor); 
            } else {
                YAHOO.util.Dom.setStyle(el.id, 'background-color', normalColor); 
            }
            el.readOnly = disable;
        }
    }*/
	var el = $('txtAddTest');
	el.readOnly = disable;
    if (disable) {
        YAHOO.util.Dom.setStyle(el.id, 'background-color', readonlyColor); 
    } else {
        YAHOO.util.Dom.setStyle(el.id, 'background-color', normalColor); 
    }
    SR.btnAddTest.set("disabled", disable);
    /*
    var el = $('txtAddReason');
    el.readOnly = disable;
    if (disable) {
        YAHOO.util.Dom.setStyle(el.id, 'background-color', readonlyColor); 
    } else {
        YAHOO.util.Dom.setStyle(el.id, 'background-color', normalColor); 
    }
    SR.btnAddReason.set("disabled", disable);
    */
}

function initOrderTable() {
	var orderTable = new function(){
        this.coldefs =
            [{key:"id", label:"เลขที่ order"},
             {key:"order_date", label:"วันที่", formatter: dateFormatter},
             {key:"stop", label:"ตรวจแล้ว", formatter: checkPainter},
             {key:"del", label:"", formatter:function(elCell, oRecord, oColumn, oData) {
            	 	if (SR.mode == 0) {
            	 		elCell.innerHTML = "<a href='#del'><img src='/img/del.png'></a>";
            		} else {
            			elCell.innerHTML = "<span style='opacity:0.3;'><a href='#del'><img src='/img/del.png'></a></span>";
            		}
            	 }
             }];
        this.query = "pa_id=" + SR.currentPatientId;
        this.datasource = new YAHOO.util.DataSource(
        		"${h.url_for('/psyco/get_req_test?')}",
                {
        			connXhrMode: "cancelStaleRequest",
        			connMethodPost: true,
        			responseType:YAHOO.util.DataSource.TYPE_JSON,
        			responseSchema:{resultsList:"orders",
        			fields:["id", "stop",
        			        {key:"order_date", parser:parseDate}]}
        		});
        
        this.datatable = new YAHOO.widget.DataTable("order-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"220px",
        	initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 0) {
        		if (col.key == "del") {
        			confirmDialog("ลบข้อมูล order", "ต้องการลบข้อมูล order เลขที่ " + rec.getData("id"),
        					function() {
        						SR.dlgWait.show();
		        				var oid = rec.getData("id");
		        		        if (oid != undefined && oid != -1) {
		        		            SR.delOrders.push({id:oid});
		        		        }
		        		        orderTable.datatable.deleteRow(rec);
		        		        var jsonDelOrder = YAHOO.lang.JSON.stringify(SR.delOrders);
		        		        var domDelOrder = $("del-orders");
		        		        domDelOrder.value = jsonDelOrder; 
		        		                
		        		        var responseSuccess = function(o) {
		        		        	SR.dlgWait.hide();
		        		        	resetTables();
		        		            resetArray();
		        		            try {
		        				        if (parent.setWorking) {
		        				        	parent.setWorking(false);
		        				        }
		        				        if (parent.setOrderSelected) {
		        		            		parent.setOrderSelected(false);
		        		            	}
		        		            } catch(ex) {
		        		            	//alert(ex.message);
		        		            }
		        		        };
		        		        var responseFailure = function(o) {
		        		        	SR.dlgWait.hide();
		        		            showMessageDialog("Error", 'ลบไม่สำเร็จ: ' + o.statusText,
		        		            		YAHOO.widget.SimpleDialog.ICON_BLOCK);
		        		        };
		        		        var callback =
		        		        {
		        		            success: responseSuccess,
		        		            failure: responseFailure
		        		        };
		        		        var formObject = document.getElementById('form');
		        		        YAHOO.util.Connect.setForm(formObject);        
		        		        
		        		        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psyco/delete_reqtest')}", callback);
		        		        /*
		        		    	SR.reqReasonTable.datasource.sendRequest("order_id=-1", {
		        		            success:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
		        		            failure:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
		        		            scope:SR.reqReasonTable.datatable
		        		        });*/
		        		    	SR.reqItemTable.datasource.sendRequest("order_id=-1", {
		        		            success:SR.reqItemTable.datatable.onDataReturnInitializeTable,
		        		            failure:SR.reqItemTable.datatable.onDataReturnInitializeTable,
		        		            scope:SR.reqItemTable.datatable
		        		        });
		        		        this.hide();
        					},
        					function() {
        						this.hide();
        					}
        			)
            	} 
        	}
        	this.onEventShowCellEditor(oArgs);
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
            try {
            	if (parent.setOrderSelected) {
            		parent.setOrderSelected(true);
            	}
            } catch (ex) {}
            $('order-id').value = sid;
            SR.currentOrderId = sid;
            /*
            SR.reqReasonTable.datasource.sendRequest("order_id=" + sid, {
                success:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
                failure:SR.reqReasonTable.datatable.onDataReturnInitializeTable,
                scope:SR.reqReasonTable.datatable
            });*/
        	SR.reqItemTable.datasource.sendRequest("order_id=" + sid, {
                success:SR.reqItemTable.datatable.onDataReturnInitializeTable,
                failure:SR.reqItemTable.datatable.onDataReturnInitializeTable,
                scope:SR.reqItemTable.datatable
            });
        	try {
	            parent.getPsycoTestResult(SR.currentVnId, SR.currentPatientId, sid, SR.qcalled);
	            parent.getPsycoCureResult(SR.currentVnId, SR.currentPatientId, sid, SR.qcalled);
        	} catch(ex) {
        		//alert(ex.message);
        	}
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
    }
    return orderTable;
}

function initReqReasonTable() {
    var reqReasonTable = new function(){
        this.coldefs =
            [{key:"id", label:"", hidden:true},
             {key:"reason_id", label:"", hidden:true},
             {key:"reason", label:"เหตุส่งบริการทางจิตวิทยา", minWidth:200},
             {key:"remark", label:"หมายเหตุ", minWidth:200,
            	editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter:delPainter}];
        this.query = "order_id=-1";
        this.datasource = new YAHOO.util.DataSource(
        		"${h.url_for('/psyco/get_req_test_reason?')}",
                {
        			connXhrMode: "cancelStaleRequest",
        			connMethodPost: true,
        			responseType:YAHOO.util.DataSource.TYPE_JSON,
        			responseSchema:{resultsList:"reasons",
        			fields:["id", "reason_id", "reason", "remark"]}
        		});
        
        this.datatable = new YAHOO.widget.DataTable("req_test_reason",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"220px",
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
            	} else {
            		SR.editReasons.push(rec.getId());
            	}
        	}
    	

        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked); 
    }
    return reqReasonTable;
}

function initReqItemTable() {
    var reqTestDTable = new function(){
        this.coldefs =
            [{key:"done", label:"ทำแล้ว", formatter:doneFormatter},
             {key:"item", label:"รายการ", resizeable:true},
             {key:"qty", label:"จำนวน"},
             {key:"unit", label:"หน่วย"},
             {key:"totalprice", label:"จำนวนเงิน"},
             {key:"donedate", label:"วันที่ทำ", formatter:dateFormatter},
             {key:"del", label:"", formatter:delPainter},
             {key:"item_id", hidden: true}];
        this.query = "order_id=-1";
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
        
        this.datatable = new YAHOO.widget.DataTable("req_test_item",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"220px",
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
	        		confirmDelete(this, rec, SR.delReqD,
	        				"ต้องการลบข้อมูลรายการ: " + rec.getData("item"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delReqD,
            				"ต้องการลบข้อมูลรายการ: " + rec.getData("item"));
            	} 
        	}

        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
    }
    return reqTestDTable;
}

function getItemDetail(itemId) {
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
            document.getElementById('unit_id').value = result.unit_id;
            document.getElementById('unit').innerHTML = result.unit;
            document.getElementById('price').value = result.price;
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psyco/get_item_detail')}", callback, "item_id=" + itemId);
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

function delPainter(elCell, oRecord, oColumn, oData) {    
    srDelPainter(elCell, oRecord, oColumn, oData, SR.mode);
}

function showMessageDialog(header, msg, icon) {
	try {
		if (parent != self && parent.showMessageDialog) {
			parent.showMessageDialog(header, msg, icon);
		} else {
			messageDialog(header, msg, icon);
		}
	} catch(ex) {
		//alert(ex.message);
		messageDialog(header, msg, icon);
	}
}

loader.insert();

