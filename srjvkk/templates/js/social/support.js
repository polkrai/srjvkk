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

function reloadPage(vnId, paId, qcalled) {
	$('cur_pa_id').value = paId;
	$('cur_vn_id').value = vnId;
	$('qcalled').value = qcalled;
	//SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    SR.currentPatientId = paId;
    SR.currentVnId = vnId;
    SR.supportTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
        success : SR.supportTable.datatable.onDataReturnInitializeTable,
        failure : SR.supportTable.datatable.onDataReturnInitializeTable,
        scope : SR.supportTable.datatable
    });
    getPatientInfo();
    //clearSupportDetail();
}

function initComponents(){
	resetArray();
    SR.adding = false;
    initButtons();
    var pa_id = document.getElementById('cur_pa_id').value;
    if (pa_id == undefined || pa_id == '')
        pa_id = -1;
    var vnId = document.getElementById('cur_vn_id').value;
    if (vnId == undefined || vnId == '')
    	vnId = -1;
    
    var qcalled = $('qcalled').value;
    if (qcalled == "true")
        qcalled = true;
    else
        qcalled = false;
    SR.currentDeposit = 0;
    SR.currentVnId = vnId;
    SR.currentPatientId = pa_id;
    SR.qcalled = qcalled;
    SR.supportTable = initsupportTable(pa_id);
    SR.supportDTable = initSupportDTable(-1);
    setDisableInput(true);
    getPatientInfo();
    initMenu();
    SR.dlgWait = getWaitDialog();
    SR.autoProvince = initAutoProvince();
    SR.autoEducation = initAutoEducation();
    SR.autoOccupation = initAutoOccupation();
    SR.autoStatus = initAutoStatus();
    
    Event.addListener('auto-province', 'blur', function() {
    	if ($('auto-province').value == "") return;
    	if (SR.autoProvince.isContainerOpen()) return;
    	if ($('auto-province').value != SR.selectedProvince[2]) {
    		showMessageDialog("Warn", 'จังหวัดที่กรอกไม่พบในฐานข้อมูล', YAHOO.widget.SimpleDialog.ICON_WARN);
    		$('auto-province').value = "";
    		return false;
    	}
    });
    
    Event.addListener('auto-education', 'blur', function() {
    	if ($('auto-education').value == "") return;
    	if (SR.autoEducation.isContainerOpen()) return;
    	if ($('auto-education').value != SR.selectedEducation[1]) {
    		showMessageDialog("Warn", 'การศึกษาที่กรอกไม่พบในฐานข้อมูล', YAHOO.widget.SimpleDialog.ICON_WARN);
    		$('auto-education').value = "";
    		return false;
    	}
    });
    
    Event.addListener('auto-occupation', 'blur', function() {
    	if ($('auto-occupation').value == "") return;
    	if (SR.autoOccupation.isContainerOpen()) return;
    	if ($('auto-occupation').value != SR.selectedOccupation[1]) {
    		showMessageDialog("Warn", 'อาชีพที่กรอกไม่พบในฐานข้อมูล', YAHOO.widget.SimpleDialog.ICON_WARN);
    		$('auto-occupation').value = "";
    		return false;
    	}
    });
    
    Event.addListener('auto-status', 'blur', function() {
    	if ($('auto-status').value == "") return;
    	if (SR.autoStatus.isContainerOpen()) return;
    	if ($('auto-status').value != SR.selectedStatus[1]) {
    		showMessageDialog("Warn", 'สถานภาพสมรสที่กรอกไม่พบในฐานข้อมูล', YAHOO.widget.SimpleDialog.ICON_WARN);
    		$('auto-status').value = "";
    		return false;
    	}
    });
    
    Event.addListener('income', 'blur', function() {
    	var value = parseNumber($('income').value);
		value = formatNumber(value);
		if (value.toString() == "NaN") {
			showMessageDialog("Error", 'กรอกเฉพาะตัวเลข', YAHOO.widget.SimpleDialog.ICON_BLOCK);
			value = "";
		}
		$('income').value = value;
    });
}

function initMenu() {
	SR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {
		iframe: true
	});
	SR.toolbar.render();
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){
		var pos = Dom.getXY($('toolbar_pane'));
		Dom.setXY($('toolbar_pane'),[pos.X,window.scrollY]);
    });
}

function resetArray() {
	SR.supportItems=[];
	SR.selectedProvince = [];
	SR.selectedEducation = [];
	SR.selectedOccupation = [];
	SR.selectedStatus = [];
	SR.delSupports = [];
}

function initButtons() {
    new YAHOO.widget.Button("btnPrint");
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {
        var paId = document.getElementById("cur_pa_id").value;
        if (paId == -1 || !SR.qcalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }  
        
        var rowCount = SR.supportTable.datatable.getRecordSet().getLength();
        var no = 1;
        var now = new Date();
        if (rowCount > 0) {
            var lstRec = SR.supportTable.datatable.getRecord(rowCount-1);
            if (!lstRec.getData('receipt_no')) {
            	showMessageDialog('สงเคราะห์', 'มีรายการสงเคราะห์ที่ยังไม่ได้รับการชำระ้เงิืน<br>กรุณาลบรายการสงเคราะห์เดิมก่ิอน',
            			YAHOO.widget.SimpleDialog.ICON_WARN);
            	return;
            }
            //no = lstRec.getData('request_no') + 1;
        	no = rowCount + 1;
        }
        if (parent.setWorking) {
        	parent.setWorking(true);
        }
        
        SR.mode = 1;
        SR.adding = true;
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        setDisableInput(false);
        
        var nRec = {id:-1, no:no, date:new Date(), support_amount:0.00, domicile:'', 
        		education:'', job:'', marriage_status:'', request_person:'', 
        		request_relation:'', history_family:'', family_relationship:'', 
        		request_reason:'', support_reason:'', income:0.00, canpay_amount:0.00,
        		amount:0.00, deposit:SR.currentDeposit};
        SR.supportTable.datatable.unselectAllRows();
        SR.supportTable.datatable.addRow(nRec);
        
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {        
        var responseSuccess = function(o) {
        	if (parent.setWorking) {
        		parent.setWorking(false);
        	}
        	SR.supportTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
                success : SR.supportTable.datatable.onDataReturnInitializeTable,
                failure : SR.supportTable.datatable.onDataReturnInitializeTable,
                scope : SR.supportTable.datatable
            });
        	SR.dlgWait.hide();
        	SR.mode = 0;
        	resetArray();
            setDisableInput(true);
            SR.btnAdd.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
            showMessageDialog("Info", 'บันทึกเรียบร้อย', YAHOO.widget.SimpleDialog.ICON_INFO);
        };
        var responseFailure = function(o) {
        	SR.dlgWait.hide();
        	showMessageDialog("Error", 'บันทึกไม่สำเร็จ: ' + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
        };
        var callback =
        {
            success: responseSuccess,
            failure: responseFailure
        };
        SR.dlgWait.show();
        var rows = SR.supportTable.datatable.getSelectedRows();
        if (rows.length == 0) return;
        var rec = SR.supportTable.datatable.getRecord(rows[0]);
        $('request_no').value = rec.getData("request_no");
        $('totalprice').value = rec.getData("totalprice");
        $('support_amount').value = rec.getData("support_amount");
        $('canpay_amount').value = rec.getData("canpay_amount");
        $('deposit').value = rec.getData("deposit");
        
        recs = SR.supportDTable.datatable.getRecordSet().getRecords();
        SR.supportItems.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.supportItems.push(recs[i]._oData);
        	}
        }
        
        var jSupItems = YAHOO.lang.JSON.stringify(SR.supportItems);
        var dSupItems = $('support_items');
        dSupItems.value = jSupItems;
        
        var formObject = document.getElementById('form_support');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/social/save_support')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	if (parent.setWorking) {
    		parent.setWorking(false);
    	}
    	SR.mode = 0;
    	resetArray();
    	clearSupportDetail();
        SR.adding = false;
        setDisableInput(true);
        SR.btnAdd.set("disabled", false);
        SR.btnSave.set("disabled", true);
        SR.btnCancel.set("disabled", true);
        var vcs = SR.supportTable.datasource;
        var vct = SR.supportTable.datatable;
        var oCallback = {
            success : vct.onDataReturnInitializeTable,
            failure : vct.onDataReturnInitializeTable,
            scope : vct
        };
        vcs.sendRequest("pa_id=" + SR.currentPatientId, oCallback);
    });
}

var readonlyColor = 'lightyellow';
var normalColor = 'white';
function setDisableInput(disable) {
    var form = document.getElementById("form_support");
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
    }
}

function initsupportTable(pa_id) {
    var supportTable = new function(){
        this.coldefs =
            [{key:"no", label:"ครั้งที่", resizeable:true},
             {key:"date", label:"วันที่", formatter: dateFormatter, editor: getDateCellEditor()},
             {key:"totalprice", label:"จำนวนเงิน", 
            	 formatter: numberFormatter},
             {key:"deposit", label:"มัดจำ", 
                	 formatter: numberFormatter},
             {key:"canpay_amount", label:"ชำระได้", 
            	 formatter: numberFormatter,
            	 editor:new YAHOO.widget.TextboxCellEditor({
            		 validator:YAHOO.widget.DataTable.validateNumber,
            		 disableBtns:true})},
             {key:"support_amount", label:"สงเคราะห์", 
            	 formatter: numberFormatter},
		 	 {key:"receipt_no", label:"ใบเสร็จเลขที่"},
		 	 {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (pa_id==null)
            pa_id = -1;
        this.query = "pa_id=" + pa_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_support?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"supports",
                fields:["no", {key:"date", parser:parseDate}, "support_amount", "id", "domicile", "education", "job", "marriage_status",
                    "request_reason", "support_reason", "request_person", "request_relation",
                    "history_family", "family_relationship", "income", "receipt_no",
                    "canpay_amount", "totalprice", "deposit"]}});
        
        this.datatable = new YAHOO.widget.DataTable("history_support_h",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"220px",
                initialRequest:this.query});
        
        this.handleEditorSaved = function(oArgs) {
        	var rec = oArgs.editor.getRecord();
        	var support = rec.getData("totalprice") - rec.getData("canpay_amount");
        	rec.setData("support_amount", support);
        	SR.supportTable.datatable.render();
        	var recs = SR.supportDTable.datatable.getRecordSet().getRecords();
        	
        	for (var i = 0; i < recs.length; i++) {
        		var price = recs[i].getData("totalprice") - recs[i].getData("subsidy_amount");
        		if (price == 0) continue;
        		if (support > price) {
        			recs[i].setData("support_amount", price);
        			support -= price;
        		} else {
        			recs[i].setData("support_amount", support);
        			support -= support;
        		}
        	}
        	SR.supportDTable.datatable.render();
        }
        this.datatable.subscribe("editorSaveEvent", this.handleEditorSaved);
                
        this.handleClicked = function(oArgs, arg2){
            if (SR.mode==1) return;
            var row = supportTable.datatable.getRow(oArgs.target);
            supportTable.datatable.unselectAllRows();
            supportTable.datatable.selectRow(row);
        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        this.handleRowSelected = function (oArgs) {
            //if (SR.adding) return;
        	
            var sid = oArgs.record.getData("id");
            if (sid==undefined)
                sid = -1;
            var vcs = SR.supportDTable.datasource;
            var vct = SR.supportDTable.datatable;
            var rowCount = vct.getRecordSet().getLength();
            if (rowCount > 0)
                vct.deleteRows(0, rowCount);
            var oCallback = {
                success : vct.onDataReturnInitializeTable,
                failure : vct.onDataReturnInitializeTable,
                scope : vct
            };
            if (SR.mode==1) {
        		vcs.liveData = "${h.url_for('/social/get_unpaid_records?')}";
        		vcs.sendRequest("pa_id=" + SR.currentPatientId, oCallback);
        	} else {
        		vcs.liveData = "${h.url_for('/social/get_support_d?')}";
        		vcs.sendRequest("support_id=" + sid, oCallback);
        	}
            getSupportDetail(oArgs.record);
            
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 0) {
        		if (col.key == "del") {
            		if (rec.getData("receipt_no")) {
            			showMessageDialog("ลบข้อมูลการสงเคราะห์", 
            					"ไม่สามารถลบข้อมูลการสงเคราะห์ได้เนื่องจากมีการชำระเงินแล้ว",
            					YAHOO.widget.SimpleDialog.ICON_BLOCK)
            			return;
            		}
            		confirmDialog('ลบข้อมูลการสงเคราะห์', "ต้องการลบข้อมูลการสงเคราะห์ครั้งที่: " + 
            			rec.getData("no"),
        				function () {
	            			var callback =
	                		{
	                			success: function(o) {
	            					supportTable.datatable.deleteRow(rec);
	            					SR.supportDTable.datasource.sendRequest("support_id=-1", {
	            	                    success:SR.supportDTable.datatable.onDataReturnInitializeTable,
	            	                    failure:SR.supportDTable.datatable.onDataReturnInitializeTable,
	            	                    scope:SR.supportDTable.datatable
	            	                })
	                			},
	            				failure: function(o) {
	                				showMessageDialog("Error", 'ไม่สามารถชำระเงินได้ ' + o.status,
	                						YAHOO.widget.SimpleDialog.ICON_BLOCK);
	                			}
	                		};
	            			ajaxRequest('POST', "${h.url_for('/social/delete_support')}",
	            					callback, "support_id=" + rec.getData('id'));
        					this.hide();
        				},
        				function () {
        					this.hide();
        				}
            		);
            	}else {
            		return;
            	}
        	}
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
        this.handeledInit = function() {
            if (SR.supportTable.datatable.getRecordSet().getRecords().length > 0) {
                SR.supportTable.datatable.selectRow(0);
            } else {
            	SR.supportDTable.datasource.liveData = "${h.url_for('/social/get_support_d?')}";
                SR.supportDTable.datasource.sendRequest("support_id=-1", {
                    success:SR.supportDTable.datatable.onDataReturnInitializeTable,
                    failure:SR.supportDTable.datatable.onDataReturnInitializeTable,
                    scope:SR.supportDTable.datatable
                })
            }
        }
        this.datatable.subscribe("initEvent", this.handeledInit);
        /*
        this.handleRendered = function () {
            
        }
        this.datatable.subscribe("postRenderEvent", this.handleRendered);
        */
        this.datatable.subscribe("rowAddEvent", function(oArgs){
            SR.supportTable.datatable.unselectAllRows();            
            var rowIndex = SR.supportTable.datatable.getRecordSet().getLength() - 1;
            SR.supportTable.datatable.selectRow(rowIndex);
        });
    }
    return supportTable;
}

function initSupportDTable(support_id) {
    var supportDTable = new function(){
        this.coldefs =
            [{key:"item", label:"รายการ", resizeable:true},
             //{key:"unit", label:"หน่วย"},
             //{key:"qty", label:"จำนวน"},
             {key:"totalprice", label:"จำนวนเงิน",formatter: numberFormatter},
             {key:"subsidy_amount", label:"เบิกได้",formatter: numberFormatter},
             {key:"support_amount", label:"สงเคราะห์",
            	 formatter: numberFormatter,
            	 editor:new YAHOO.widget.TextboxCellEditor({
            		 validator:YAHOO.widget.DataTable.validateNumber,
            		 disableBtns:true})}];
             //{key:"id", label:"", formatter:delPainter}];
             //{key:"item_id", hidden: true}];
        if (support_id==null)
            support_id = -1;
        this.query = "support_id=" + support_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_support_d?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"supports",
            	fields:["id", "item", "group_id", "totalprice", "subsidy_amount", 
            	        "support_amount"]}});
                //fields:["id", "item", "item_id", "unit", "unit_id", "qty", "price", "totalprice", "order_id"]}});
        
        this.datatable = new YAHOO.widget.DataTable("history_support_d",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"220px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
        this.handleEditorSaved = function(oArgs) {
        	var len = this.getRecordSet().getLength();
        	var totalSupport = 0;
        	for (var i = 0; i < len; i++) {
        		var rec = this.getRecord(i);
        		totalSupport += rec.getData('support_amount');
        	}
        	rows = SR.supportTable.datatable.getSelectedRows();
        	rec = SR.supportTable.datatable.getRecord(rows[0]);
        	rec.setData('support_amount', totalSupport);
        	SR.supportTable.datatable.render();
        }
        this.datatable.subscribe("editorSaveEvent", this.handleEditorSaved);
        
        this.handleDataReturned = function(oArgs) {
        	if (SR.mode == 1) {
	        	var results = oArgs.response.results;
	    		var totalAmount = 0;
	    		for (var i = 0; i < results.length; i++) {
	    			totalAmount += (results[i].totalprice - results[i].subsidy_amount);
	    		}
	    		var support = totalAmount - SR.currentDeposit;	    		
	    		for (var i = 0; i < results.length; i++) {
	    			var price = results[i].totalprice;
	    			var subsidy = results[i].subsidy_amount;
	    			if (price - subsidy == 0) continue;
	    			if (support > (price - subsidy)) {
	    				results[i].support_amount = price;
	    				support -= (price - subsidy);
	    			} else {
	    				results[i].support_amount = support;
	    				support -= support;
	    			}
	    		}
	    		var rows = SR.supportTable.datatable.getSelectedRows();
	    		var rec = SR.supportTable.datatable.getRecord(rows[0]);
	    		rec.setData("totalprice", totalAmount - SR.currentDeposit);
	    		rec.setData("support_amount", totalAmount - SR.currentDeposit);
	    		SR.supportTable.datatable.render();
        	}
        }
        this.datatable.subscribe("dataReturnEvent", this.handleDataReturned);
    }
    return supportDTable;
}

function delPainter(elCell, oRecord, oColumn, oData) {    
    srDelPainter(elCell, oRecord, oColumn, oData, SR.mode - 1);
}

function getSupportDetail(record) {
    //$('domicile').value = record.getData('domicile');
    //$('education').value = record.getData('education');
    //$('job').value = record.getData('job');
    //$('marriage_status').value = record.getData('marriage_status');
    //$('income').value = record.getData('income');
    $('request_person').value = record.getData('request_person');
    $('request_relation').value = record.getData('request_relation');
    //$('history_family').value = record.getData('history_family');
    //$('family_relationship').value = record.getData('family_relationship');
    $('request_reason').value = record.getData('request_reason');
    $('support_reason').value = record.getData('support_reason');
}

function clearSupportDetail() {
	//$('auto-province').value = "";
	//$('province-id').value = "";
    //$('auto-education').value = "";
    //$('education-id').value = "";
    //$('auto-occupation').value = "";
    //$('occupation-id').value = "";
    //$('auto-status').value = "";
    //$('status-id').value = "";
    //$('income').value = "0.00";
    $('request_person').value = "";
    $('request_relation').value = "";
    //$('history_family').value = "";
    //$('family_relationship').value = "";
    $('request_reason').value = "";
    $('support_reason').value = "";
}

function getPatientInfo() {
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
            var info = YAHOO.lang.JSON.parse(o.responseText);
        	//$('domicile').value = info["domicile"];
            $('auto-province').value = info["province"];
            $('province-id').value = info["province_id"];
            SR.selectedProvince = [info["province_id"], "", info["province"]];
            $('auto-education').value = info["education"];
            $('education-id').value = info["education_id"];
            SR.selectedEducation = [info["education_id"], info["education"]];
            $('auto-occupation').value = info["occupation"];
            $('occupation-id').value = info["occupation_id"];
            SR.selectedOccupation = [info["occupation_id"], info["occupation"]];
            $('auto-status').value = info["status"];
            $('status-id').value = info["status_id"];
            SR.selectedStatus = [info["status_id"], info["status"]];
            $('income').value = formatNumber(info["income"]);
            $('history_family').value = info["history_family"];
            $('family_relationship').value = info["family_relationship"];
            SR.currentDeposit = info["current_deposit"];
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/social/get_social_patient_info')}", callback, "pa_id=" + SR.currentPatientId);
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

function initAutoProvince() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/srutil/get_provinces')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "provinces", 
	        fields: ["id","code","name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("auto-province", "ct-province", bDS, oConfigs); 
    
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
    	$('auto-province').value = aData[2];
    	$('province-id').value = aData[0];
    	SR.selectedProvince = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function initAutoEducation() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/srutil/get_educations')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "educations", 
	        fields: ["id","name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("auto-education", "ct-education", bDS, oConfigs); 
    
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
    	$('auto-education').value = aData[1];
    	$('education-id').value = aData[0];
    	SR.selectedEducation = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function initAutoOccupation() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/srutil/get_occupations')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "occupations", 
	        fields: ["id","name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("auto-occupation", "ct-occupation", bDS, oConfigs); 
    
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
    	$('auto-occupation').value = aData[1];
    	$('occupation-id').value = aData[0];
    	SR.selectedOccupation = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function initAutoStatus() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/srutil/get_marriage_status')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "status", 
	        fields: ["id","name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("auto-status", "ct-status", bDS, oConfigs); 
    
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
    	$('auto-status').value = aData[1];
    	$('status-id').value = aData[0];
    	SR.selectedStatus = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

