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
        showMessageDialog("error", "ไม่สามารถดึงโปรแกรมจาก server ได้สำเร็จ กรุณาลองใหม่อีกครั้ง", YAHOO.widget.SimpleDialog.ICON_BLOCK);
    }
});

loader.addModule({
	name: "srutils", //module name; must be unique
	type: "js", //can be "js" or "css"
    fullpath: "${h.url_for('/js/srutils.js')}", //can use a path instead, extending base path
    varName: "srutils" // a variable that will be available when the script is loaded.  Needed
	// in order to act on the script immediately in Safari 2.x and below.
	//requires: ['yahoo', 'event'] //if this module had dependencies, we could define here
});

SR.mode = 0; //0 = Preview, 1 = Add, 2 = Edit

function initComponents(){
	
	SR.sessionId = $('id_sess').value;
    SR.workingWithCurrentQ = false;
    SR.leftPane = setupLeftPane();
    SR.workspaceTab = setupTabPane();
    initButtons();
    
    SR.workingWithCurrentQ = false;
    SR.sendQueueDialog = initSendQueueDialog();
    SR.dlgAllowedSendQueue = initAllowedSendQueueDialog();
    resetArray();
    SR.comid = $('com_id').value;
    SR.dlgFilter = initDialogFilter();
    SR.dlgSearch = initDialogSearch();
    SR.dlgTreatmentInfo = initDialogTreatmentInfo();
    SR.dlgPatientInfo = initDialogPatientInfo();
    SR.dlgBillInfo = initDialogBillInfo();
    SR.dlgIpd = initDialogIpd();
    
    getActions($('select_com').options[$('select_com').selectedIndex].value);
    getAllowedActions(SR.comid, $('select_allowed_action'));
    
    SR.isWorking= false;
    SR.countDoneWork = 0;
    SR.patientInfo = null;
    
    $("frame-search").src = url.medrec.search;
}

function setWorking(isWorking) {
	
	SR.isWorking = isWorking;
	
	if (!isWorking) {
		
		SR.countDoneWork++;
	}
}

function setPatient(paId) {
	
	SR.dlgSearch.hide();
	SR.leftPane.waitQ.datatable.unselectAllRows();
	SR.leftPane.waitQ.currentPaId = paId;
	SR.leftPane.waitQ.currentVn = -1;
	SR.leftPane.waitQ.currentVnId = -1;
	SR.workingWithCurrentQ = false;
	loadImportantInfo(paId);
	//getBackground(-1, false);
	//getNiti(-1, false);
	//getSupport(-1, false);
}

function initDialogFilter() {
    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-filter", 
    { 
        width : "600px",
        height: "500px",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        modal:true
    });

    // Render the Dialog
    dialog.render();    
    return dialog;
}


function initDialogSearch() {
    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-search", 
    { 
        width : "970px",
        height: "400px",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        modal:true
    });

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function initDialogPatientInfo() {
	
    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-patient-info", 
    { 
        width : "970px",
        height: "500px",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        modal:true
    });

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function initDialogIpd() {
	
    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-ipd", 
    { 
        width : "970px",
        height: "500px",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        modal:true
    });

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function initDialogTreatmentInfo() {
    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-treatment-info", 
    { 
    	width : "1024px",
        height: "700px",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        modal:true
    });

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function initDialogBillInfo() {
    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-bill-info", 
    { 
        width : "970px",
        height: "500px",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        modal:true
    });

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function resetArray() {
    SR.hn = "";
    SR.currentAn = "";
}

function initHealthStationAutoComp() {
	
    var datasource = new YAHOO.widget.DS_XHR("${h.url_for('/social/get_health_stations')}", ["stations", "name"]);         
    	datasource.maxCacheEntries = 0;
    	
    var myAutoComp = new YAHOO.widget.AutoComplete("health_station_name","health_stations", datasource);
    	myAutoComp.useShadow = true; 
		myAutoComp.queryMatchContains = true;
		myAutoComp.formatResult = function(oResultItem, sQuery) { 
       //alert("format: " + oResultItem[1].id + " " + oResultItem[1].name + " :: " + oResultItem);
       return oResultItem[1].name + " (" + oResultItem[1].id + ")"; 
    };
    
    myAutoComp.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
        var pos = YAHOO.util.Dom.getXY(oTextbox);
        pos[1] += YAHOO.util.Dom.get(oTextbox).offsetHeight + 2;
        YAHOO.util.Dom.setXY(oContainer,pos);
        return true;
    }; 
       
    //define your itemSelect handler function:
    var itemSelectHandler = function(sType, aArgs) {
	    
    	YAHOO.log(sType); //this is a string representing the event;
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
        var el = document.getElementById("health_station_id");
        el.value = aData[1].id;
    };

    myAutoComp.itemSelectEvent.subscribe(itemSelectHandler);
    return myAutoComp;
}

function initSocialProblemLookup() {
	
    var handleOk = function() {
	    
        var select = document.getElementById("select_problem");
        var id = select.options[select.selectedIndex].id;
        var code = select.options[select.selectedIndex].value;
        var desc = select.options[select.selectedIndex].text;
        var record = {code:code, description:desc, problem_id:id}        
        SR.bgProblemsTable.datatable.addRow(record);
        SR.bgProblems.push({problem_id:id});
        this.hide();
    };
    
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("lookupSocialProblem", { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        buttons : [{ text:"ตกลง", handler:handleOk, isDefault:true},{text:"ยกเลิก", handler:handleCancel}]
    });
    
    dialog.render(); 
    return dialog;
}

function initSocialHelpLookup() {
    var handleOk = function() {
        var select = document.getElementById("select_help");
        var id = select.options[select.selectedIndex].id;
        var code = select.options[select.selectedIndex].value;
        var desc = select.options[select.selectedIndex].text;
        var record = {code:code, description:desc, help_id:id}
        SR.bgHelpsTable.datatable.addRow(record);
        SR.bgHelps.push({help_id:id});
        this.hide();
    };
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("lookupSocialHelp", { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        buttons : [ { text:"ตกลง", handler:handleOk, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });
    dialog.render(); 
    return dialog;
}

function initSendQueueDialog() {
    // Define various event handlers for Dialog
    var handleSubmit = function() {
        var callback =
        {
            success: function(o) {
                var result = YAHOO.lang.JSON.parse(o.responseText); 
                if (result["Error"] != undefined) {
                    showMessageDialog("error", "ไม่สามารถส่งคิวได้ : " + result["Error"], 
                    		YAHOO.widget.SimpleDialog.ICON_BLOCK);
                    return;
                }
                refreshQueue();
                SR.workingWithCurrentQ = false;
                showMessageDialog("Info", 
                		"ส่ง: " + result.Success.name + " เวลา : " + result.Success.time,
                		YAHOO.widget.SimpleDialog.ICON_INFO);
                SR.btnCallQueue.set("disabled", false);
                SR.btnSendQueue.set("disabled", true);
                SR.btnSendBack.set("disabled", true);
                loadImportantInfo(-1);
            },
            failure: function(o) {
                showMessageDialog("Error", "ไม่สามารถส่งคิวได้: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
            }
        };
        
        var comid = $('select_com').options[$('select_com').selectedIndex].value;
        var actionindex = $('select_action').selectedIndex;
        var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=social" + 
        	"&comid=" + comid;
        if (actionindex != -1) {
        	query += "&action_id=" + $('select_action').options[actionindex].value; 
        }
        YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/transfer')}", 
        		callback, query);
        this.hide();
    };
    
    var handleCancel = function() {
        this.cancel();
    };
    
    var handleSuccess = function(o) {
        var response = o.responseText;        
    };
    
    var handleFailure = function(o) {
	    
        showMessageDialog("Error", "Submission failed: " + o.status, YAHOO.widget.SimpleDialog.ICON_BLOCK);
    };

    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlgSendQueue", 
    { 
        width : "30em",
        constraintoviewport : true,
        fixedcenter: true,
        visible: false,
        draggable: false,
        close: true,
        modal:true,
        icon: YAHOO.widget.SimpleDialog.ICON_HELP,
        buttons : [ { text:"ส่ง", handler:handleSubmit, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });

    // Validate the entries in the form to require that both first and last name are entered
    dialog.validate = function() {
        var data = this.getData();
        /*if (data.firstname == "" || data.lastname == "") {
            //alert("Please enter your first and last names.");
            return false;
        } else {
            return true;
        }*/
        return true;
    };

    // Wire up the success and failure handlers
    dialog.callback = { success: handleSuccess,
                             failure: handleFailure };

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function getPermmod(comid) {
	var AjaxObject = {

        handleSuccess:function(o){
            this.processResult(o);
        },

        handleFailure:function(o){
            showMessageDialog("Error", 'ไม่สามารถเชื่อมต่อกับ Server ได้ : ' + o.statusText,
            		YAHOO.widget.SimpleDialog.ICON_BLOCK);
        },

        processResult:function(o){
            // This member is called by handleSuccess
            try { 
                var results = YAHOO.lang.JSON.parse(o.responseText);
                var options = "";
                for (var i = 0; i < results.length; i++) {
                	options += "<option value='" + results[i].modid + "'>" + results[i].modtitle + "</option>";
                }
                
                $('select_mod').innerHTML = options;
            } 
            catch (e) {
	            
                showMessageDialog("Error", "Invalid data", YAHOO.widget.SimpleDialog.ICON_BLOCK); 
            } 
        },

        startRequest:function() {
	        
            YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/get_permmod')}", callback, "comid=" + comid);
        }
    }

    var callback =
    {
        success:AjaxObject.handleSuccess,
        failure:AjaxObject.handleFailure,
        scope: AjaxObject
    };
    
    AjaxObject.startRequest();    
    
}

function refreshQueue() {
	
	SR.leftPane.waitQ.datasource.sendRequest("comp=social&type=wait", {
    	success : SR.leftPane.waitQ.datatable.onDataReturnInitializeTable,
        failure : SR.leftPane.waitQ.datatable.onDataReturnInitializeTable,
        scope : SR.leftPane.waitQ.datatable
    });
	var t = setTimeout(function () {
		SR.leftPane.doneQ.datasource.sendRequest("comp=social&type=done", {
	    	success : SR.leftPane.doneQ.datatable.onDataReturnInitializeTable,
	        failure : SR.leftPane.doneQ.datatable.onDataReturnInitializeTable,
	        scope : SR.leftPane.doneQ.datatable
	    });
	},2000);
	
}

function initButtons() {

	SR.btnSendBack = new YAHOO.widget.Button("btnSendBack");
	SR.btnSendBack.set("disabled", true);
	SR.btnSendBack.addListener("click", function(e) {
		if (SR.leftPane.waitQ.currentVn == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var rows = SR.leftPane.waitQ.datatable.getSelectedRows();
		var rec = SR.leftPane.waitQ.datatable.getRecord(rows[0]);
		confirmDialog("ส่งกลับ", "ต้องการส่ง " + SR.patientInfo.name + " กลับ " + rec.getData("com1"),
			function() {
			var callback =
	        {
	            success: function(o) {
	                var result = YAHOO.lang.JSON.parse(o.responseText); 
	                if (result["Error"] != undefined) {
	                    showMessageDialog("error", "ไม่สามารถส่งกลับได้ : " + result["Error"], 
	                    		YAHOO.widget.SimpleDialog.ICON_BLOCK);
	                    return;
	                }
	                refreshQueue();
	                SR.workingWithCurrentQ = false;
	                showMessageDialog("Info", 
	                		"ส่งกลับ: " + result.Success.name + " เวลา : " + result.Success.time,
	                		YAHOO.widget.SimpleDialog.ICON_INFO);
	                loadImportantInfo(-1);
	                SR.btnCallQueue.set("disabled", false);
	                SR.btnSendQueue.set("disabled", true);
	                SR.btnSendBack.set("disabled", true);
	            },
	            failure: function(o) {
	                showMessageDialog("Error", "ไม่สามารถส่งกลับได้: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
	            }
	        };
	        
	        var comid = rec.getData("com1id");
	        var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=social" + "&comid=" + comid + "&action=" + rec.getData("action") + "(ส่งกลับ)";
	        YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/transfer')}", 
	        		callback, query);
		        this.hide();
			},
			function() {
				
				this.hide();
			}
		);
	});
	
	SR.btnIpd = new YAHOO.widget.Button("btn-ipd");
	SR.btnIpd.addListener("click", function(e) {
		if (SR.currentAn == "") {
            showMessageDialog("Warn", "ไม่มีข้อมูลผู้ป่วยใน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var frame = $('frame-ipd');
		frame.src= url.ipd.general + 'an=' + SR.currentAn;
		SR.dlgIpd.show();
	});
	
	SR.btnSearch = new YAHOO.widget.Button("btn-search");
	SR.btnSearch.addListener("click", function(e) {
		if (SR.workingWithCurrentQ) {
			showMessageDialog("Warn", "ไม่สามารถค้นหาระหว่างที่ทำงานกับคิวได้", YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		SR.dlgSearch.show();
	});
	
	SR.btnFilter = new YAHOO.widget.Button("btn-filter");
	SR.btnFilter.addListener("click", function(e) {
		if (SR.leftPane.waitQ.currentVn == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var frame = $('frame-filter');
			frame.src= url.filter.filter + '&vn=' + SR.leftPane.waitQ.currentVn + "&id_sess=" + SR.sessionId;
		SR.dlgFilter.show();
	});
	
	SR.btnPatientInfo = new YAHOO.widget.Button("btn-patient-info");
	SR.btnPatientInfo.addListener("click", function(e) {
		
		if (SR.hn == "") {
			
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        
		var frame = $('frame-patient-info');
			frame.src = url.medrec.general + '&hn=' + SR.hn + "&id_sess=" + SR.sessionId;
		SR.dlgPatientInfo.show();
	});
	
	SR.btnTreatmentInfo = new YAHOO.widget.Button("btn-treatment-info");
	SR.btnTreatmentInfo.addListener("click", function(e) {
		
		var paId = SR.leftPane.waitQ.currentPaId;
		
        if (paId == -1) {
	        
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        
		var frame = document.getElementById('frame-treatment-info');
			frame.src = url.med.treatment + '&pa_id=' + SR.leftPane.waitQ.currentPaId + "&id_sess=" + SR.sessionId;
		
		SR.dlgTreatmentInfo.show();
	});
	
	SR.btnBillInfo = new YAHOO.widget.Button("btn-bill-info");
	SR.btnBillInfo.addListener("click", function(e) {
		
		var paId = SR.leftPane.waitQ.currentPaId;
		
        if (paId == -1) {
	        
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        
		var frame = document.getElementById('frame-bill-info');
		
		frame.src= url.finance.payment + "&pa_id=" + SR.leftPane.waitQ.currentPaId + "&id_sess=" + SR.sessionId;
		SR.dlgBillInfo.show();
	});
    
    SR.logoutBtn = new YAHOO.widget.Button("logout_button");
    SR.btnCallQueue = new YAHOO.widget.Button("btnCallQueue");
    SR.btnCallQueue.addListener("click", function(e) {
	    
        var rows = SR.leftPane.waitQ.datatable.getSelectedRows();
        if (rows.length == 0) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        var qId = SR.leftPane.waitQ.currentQId;
        
        var callback =
        {
            success: function (o) {
                //alert(o.responseText);
                var result = YAHOO.lang.JSON.parse(o.responseText); 
                
                if (result["Error"] != undefined) {
	                
                    showMessageDialog("Error", "ไม่สามารถเรียกคิวได้ : " + result["Error"], YAHOO.widget.SimpleDialog.ICON_BLOCK);
                    return;
                }
                
                SR.btnSendQueue.set("disabled", false);
                SR.btnSendBack.set("disabled", false);
                SR.workingWithCurrentQ = true;
                getBackground(document.getElementById("pa_id").value, SR.workingWithCurrentQ);
                getSupport(SR.leftPane.waitQ.currentVnId, document.getElementById("pa_id").value, SR.workingWithCurrentQ);
                getNiti(document.getElementById("pa_id").value, SR.workingWithCurrentQ);
                showMessageDialog("Info", "เรียก: " + result.Success.name + " เวลา : " + result.Success.time, YAHOO.widget.SimpleDialog.ICON_INFO);
                SR.btnCallQueue.set("disabled", true);
                SR.countDoneWork = 0;
            },
            failure: function (o) {
                showMessageDialog("Error", "เรียกคิวไม่สำเร็จ: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
            }
        };
        YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/take_queue')}", callback, "q_id=" + qId);
    });
    
    SR.btnSendQueue = new YAHOO.widget.Button("btnSendQueue");  
    SR.btnSendQueue.set("disabled", true);
    SR.btnSendQueue.addListener("click", function(e) {
        
        var paId = SR.leftPane.waitQ.currentPaId;
        if (paId == -1 || !SR.workingWithCurrentQ) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        
        if (SR.isWorking) {
        	confirmDialog("ส่งต่อ", "ยังไม่ได้บันทึกงานที่กำลังทำอยู่ ต้องการส่งต่อหรือไม่", 
        		function() {
        			SR.dlgAllowedSendQueue.show();
        			this.hide();
        		},
        		function() {
        			this.hide();
        		}
        	)
        } else if (SR.countDoneWork == 0) {
        	confirmDialog("ส่งต่อ", "ยังไม่ได้ทำงานกับผู้ป่วยที่เรียก ต้องการส่งต่อหรือไม่", 
        		function() {
        			SR.dlgAllowedSendQueue.show();
        			this.hide();
        		},
        		function() {
        			this.hide();
        		}
        	)
        } else {
        	SR.dlgAllowedSendQueue.show();
        }
        //SR.sendQueueDialog.show();
        
    });
   
}

function delPainter(elCell, oRecord, oColumn, oData) {    
    //elCell.innerHTML = '<img width="16px" height="16px" src="/img/del.png" />';
    //elCell.innerHTML = '<button></buttom>';
    var btn = new YAHOO.widget.Button(elCell, {
        id:oData,
        disabled:SR.bgDisabled
    });
    btn.addClass("del-button");
    //btn.setStyle("background", "url('/img/del.png') center center no-repeat");    
    //btn.setStyle("background-image", "url('/img/del.png')");    
}


function setupLeftPane(){
    var waitQ = new function(){
        this.coldefs =
            [{key:"oitype", label:"", formatter:oitypeFormatter},
             {key:"name", label:"ชื่อ - สกุล",resizeable:true},
             {key:"queuetime", label:"เวลา"},
             {key:"action", label:"กิจกรรม"},
             {key:"com1", label:"มาจาก"}
             ];
        this.query = "comp=social&type=wait";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/srutil/queue?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"QueueResult.Queue",
                fields:["name", "vn", "queuetime", "q_id", "action_id", 
                        "action", "vn_id", "pa_id", "oitype", "com1", 
                        "appointed", "an", "com1id"]}});
        
        this.datatable = new YAHOO.widget.DataTable("left_queue_pane",
            this.coldefs, this.datasource,
            {initialRequest:this.query,
             scrollable:true, width:"330px", height:"250px",
             formatRow:appointRowFormatter});
        this.datatable.set("selectionMode","single");
        
        this.handleQueueClicked = function(oArgs, arg2){
            if (SR.workingWithCurrentQ) return;
            var row = this.getRow(oArgs.target);
            var wq = SR.leftPane.waitQ;
            wq.lastRow = row;
            this.unselectAllRows();
            this.selectRow(row);
            
        };
        this.datatable.subscribe("rowClickEvent", this.handleQueueClicked);
        
        this.handleRowSelected = function (oArgs) {
        	var wq = SR.leftPane.waitQ;
        	if (SR.workingWithCurrentQ) {
        		if (oArgs.record.getData("vn_id") != wq.currentVnId) {
        			this.unselectAllRows();
        			this.selectRow(wq.lastRow);
        		}
        		return;
        	}else {
        		wq.lastRow = oArgs.el;
        	}
            var record = oArgs.record;
            if (wq.currentVnId == record.getData("vn_id")) {
            	return;
            }
            wq.currentVn = record.getData("vn");
            wq.currentVnId = record.getData("vn_id");
            wq.currentQId = record.getData("q_id");
            wq.currentPaId = record.getData("pa_id");
            SR.currentAn = record.getData("an");
            loadImportantInfo(wq.currentPaId);  
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
        
        this.handleQueueLoaded = function(oRequest, oResponse, oPayload){
            var wq = SR.leftPane.waitQ;
            var result = wq.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
            var rcset = wq.datatable.getRecordSet();
            var rcs = rcset.getRecords();
            var checked = false;
            for(var i =0; i < rcs.length; i++){
                if(rcs[i].getData("vn_id") == wq.currentVnId){
                    checked = true;
                    wq.datatable.selectRow(rcs[i]);
                }
            }
            
            if (!checked) {
                wq.currentVn = -1;
                wq.currentVnId = -1;
                wq.currentQId = -1;
                wq.currentPaId = -1;
                //loadImportantInfo(-1);
                //loadBackground(-1);
            }
            return result;
        }
        
        this.handleLoadQueueFailure = function(oRequest, oResponse) {
        	waitQ.datasource.clearInterval(waitQ.intervalId);
        	var msg = "<b>เกิดความผิดพลาดในการติดต่อกับ Server</b><br>" + 
        		"<ul><li>กรุณากด <<b>ใช่</b>> เพื่ิอ reload โปรแกรม (งานที่ทำค้างไว้จะไม่ได้รับการบันทึก)</li>" +
        		"<li>หรือกด <<b>ไม่</b>> หากยังไม่ต้องการ reload โปรแกรม (ท่านสามารถ reload โปรแกรมเองโดยกดปุ่ม <b>F5</b> บน keyboad)</li></ul>" +
        		"<b>** หาก reload โปรแกรมแล้วยังเกิดปัญหานี้อีกกรุณาติดต่อผู้ดูแลระบบ</b>";
        	confirmDialog("Error", msg,
    			function() {
    	    		window.location.reload(true);
    		        this.hide();
    			},
    			function() {
    				this.hide();
    			}
    		);
        }
        
        var callback = { 
            success : this.handleQueueLoaded, 
            failure : this.handleLoadQueueFailure, 
            scope : this.datatable };
        this.intervalId = this.datasource.setInterval(45000,
            this.query, callback);
        this.currentVn = -1;
        this.currentQId = -1;
        this.currentPaId = -1;
    };
    
    var doneQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", resizeable:true},
             {key:"transfer_time", label:"เวลา"},
             {key:"transfer_to", label:"ส่งไป"}];
        this.query = "comp=social&type=done";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/srutil/queue?')}", {
             connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"QueueResult.Queue", fields:["name", "vn", "queuetime", "q_id", "action_id", "action", "transfer_to", "transfer_time", "vn_id", "pa_id", "an"]}});
        this.datasource.maxCacheEntries = 0;
        
        this.datatable = new YAHOO.widget.DataTable("left_queue_done_pane",
            this.coldefs, this.datasource,
            {initialRequest:this.query,
             scrollable:true, width:"330px", height:"250px"});
        var callback = { 
            success : this.datatable.onDataReturnInitializeTable, 
            failure : this.datatable.onDataReturnInitializeTable, 
            scope : this.datatable };
        this.intervalId = this.datasource.setInterval(45000,
            this.query, callback);
    };
    
    var pane = new Object();
    pane.waitQ =waitQ;
    pane.doneQ =doneQ;
    return pane;
}

function setupTabPane(){
    var pane = new function(){
        this.tabpane = new YAHOO.widget.TabView("workspace_pane");
        this.tabpane.subscribe("beforeActiveIndexChange", function(e) {
        	if (SR.isWorking) {
        		showMessageDialog("Warn", 'กรุณาบันทึกงานที่กำลังทำก่อน', YAHOO.widget.SimpleDialog.ICON_WARN);
        		return false;
        	}
        	return true;
        });
        this.handleActiveIndexChange = function(event) {
            if (event.newValue == 0) {
            	frmbg.SR.bgProblemsTable.datatable.validateColumnWidths();
            	frmbg.SR.bgHelpsTable.datatable.validateColumnWidths();
            } else if (event.newValue == 1) {
            	frmsupport.SR.supportTable.datatable.validateColumnWidths();
            	frmsupport.SR.supportDTable.datatable.validateColumnWidths();
            } else if (event.newValue == 2) {
            	frmniti.SR.problemsTable.datatable.validateColumnWidths();
            	frmniti.SR.helpsTable.datatable.validateColumnWidths();
            	frmniti.SR.crimeTable.datatable.validateColumnWidths();
            }
        }
        this.tabpane.subscribe("activeIndexChange", this.handleActiveIndexChange);
    };
    return pane; 
}


function loadImportantInfo(paId) {
    //resetArray();
    var pif = document.getElementById("patient_info");    
    var hnspan = document.getElementById("hn_span");
    
    var AjaxObject = {

        handleSuccess:function(o){
            this.processResult(o);
        },

        handleFailure:function(o){
            showMessageDialog("Error", 'ไม่สามารถเชื่อมต่อกับ Server ได้ : ' + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
        },

        processResult:function(o){
            // This member is called by handleSuccess
            try { 
                var result = YAHOO.lang.JSON.parse(o.responseText); 
                var info = result.ImportantInfoResult.ImportantInfo;
                pif.innerHTML = "<span style='font-size:x-large;font-weight:normal'>" + info.name + "</span><br>" + 
	                " <b>อายุ: </b>" + info.age + " <b>ปี</b> " +
	                "<b>อาชีพ: </b>" + info.job + "<br>" +
	                //"การศึกษา: </b>" + info.education + "<br />" + 
				    //"<b>เชื้อชาติ: </b>" + info.origin + " <b>สัญชาติ: </b>" + info.nationality +
				    //" <b>ศาสนา: </b>" + info.religion + "<br />" +
				    //"<b>สถานะ: </b>" + info.status + " <b>อาชีพ: </b>" + info.job + "<br>" +
				    "<b>ที่อยู่: </b>" + info.address + "<br>" +
				    "<b>แพ้ยา: </b><span class='waring-color'>" + info.allergic + "</span><br>" +
				    "<b>โรคประจำตัว: </b><span class='waring-color'>" + info.congenital + "</span><br>" +
				    "<b>เฝ้าระวัง: </b><span class='waring-color'>" + info.warning + "</span><br>" +
				    "<b>ยาความเสี่ยงสูง: </b><span class='waring-color'>" + info.risk + "</span><br>" +
					"<b>ตึก: </b>" + info.building + "<br>";
					
                var pic = document.getElementById("patient_picture");
                
                if (info.picture) {
	                
                	pic.src = info.picture;
                } 
                else {
	                
                	pic.src = "/img/noname.png";
                }
                
                hnspan.innerHTML = "HN: " + info.hn;
                $('vn_span').innerHTML = "VN: " + info.vn;
                $('an_span').innerHTML = "AN: " + info.an;
                $('privilege_span').innerHTML = "สิทธิ์: <span style=\"color:red\">" + info.privilege + "</span>";
                SR.patientInfo = info;
                SR.hn = info.hn;
                SR.currentAn = info.an;
                $('queue_span').innerHTML = "จุดบริการ: " + info.queue;
                setPaId(info.id);
                getBackground(info.id, SR.workingWithCurrentQ);
                getSupport(info.vn_id, info.id, SR.workingWithCurrentQ);
                getNiti(info.id, SR.workingWithCurrentQ);
                //loadBackground(info.id)                
                //SR.leftPane.waitQ.currentPaId = info.id;
            } 
            catch (e) { 
                showMessageDialog("Error", "Invalid data", YAHOO.widget.SimpleDialog.ICON_BLOCK); 
            } 
        },

        startRequest:function() {
            YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/important_info')}", callback, "pa_id=" + paId);
        }
    }

    var callback =
    {
        success:AjaxObject.handleSuccess,
        failure:AjaxObject.handleFailure,
        scope: AjaxObject
    };
    
    if (paId == -1) {
        pif.innerHTML = "";
        hnspan.innerHTML = "";
        $('vn_span').innerHTML = "";
        $('privilege_span').innerHTML = "";
        $('queue_span').innerHTML = "";
        $('an_span').innerHTML = "";
        getBackground(paId, SR.workingWithCurrentQ);
        getSupport(paId, paId, SR.workingWithCurrentQ);
        getNiti(paId, SR.workingWithCurrentQ);
    } 
    else {
        AjaxObject.startRequest();    
    }
    
}

var readonlyColor = 'lightyellow';
var normalColor = 'white';
function getBackground(paId, qCalled) {
    //var id_sess = document.getElementById("id_sess").value;
    //document.getElementById("frame_background").src = "${h.url_for('/social/background?pa_id=" + paId + "&qcalled=" + qCalled + "&id_sess=" + id_sess + "')}";
    frmbg.reloadPage(paId, qCalled);
}

function getSupport(vnId, paId, qcalled) {
    //document.getElementById("frame_support").src = "${h.url_for('/social/support?pa_id=" + paId + "&vn_id=" + vnId + "&qcalled=" + qcalled + "')}";
	frmsupport.reloadPage(vnId, paId, qcalled);
}

function getNiti(paId, qcalled) {
    //document.getElementById("frame_niti").src = "${h.url_for('/social/niti?pa_id=" + paId + "&vn_id=" + vnId + "&qcalled=" + qcalled + "')}";
	frmniti.reloadPage(paId, qcalled);
}

function setPaId(id) {
    var el = document.getElementById("pa_id");
    el.value = id;
}

function initAllowedSendQueueDialog() {
    // Define various event handlers for Dialog
    var handleSubmit = function() {
        var callback =
        {
            success: function(o) {
                var result = YAHOO.lang.JSON.parse(o.responseText); 
                if (result["Error"] != undefined) {
                    showMessageDialog("Error", "ไม่สามารถส่งคิวได้ : " + result["Error"], 
                    		YAHOO.widget.SimpleDialog.ICON_BLOCK);
                    return;
                }
                SR.workingWithCurrentQ = false;
                showMessageDialog("Info", "ส่ง: " + result.Success.name + " เวลา : " + result.Success.time, YAHOO.widget.SimpleDialog.ICON_INFO);
                
                SR.btnCallQueue.set("disabled", false);
                SR.btnSendQueue.set("disabled", true);
                SR.btnSendBack.set("disabled", true);
                loadImportantInfo(-1);
                refreshQueue();
            },
            failure: function(o) {
                showMessageDialog("Error", "ไม่สามารถส่งคิวได้: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
            }
        };
        
        var actionindex = $('select_allowed_action').selectedIndex;
        var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=social" + "&action_id=" + $('select_allowed_action').options[actionindex].value;
        YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/transfer')}", callback, query);
        this.hide();
    };
    
    var handleCancel = function() {
        this.cancel();
    };
    
    var handleSuccess = function(o) {
        var response = o.responseText;        
    };
    
    var handleFailure = function(o) {
        showMessageDialog("Error", "Submission failed: " + o.status, YAHOO.widget.SimpleDialog.ICON_BLOCK);
    };

    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-send-queue", 
    { 
        width : "30em",
        constraintoviewport : true,
        fixedcenter: true,
        visible: false,
        draggable: false,
        close: true,
        modal:true,
        icon: YAHOO.widget.SimpleDialog.ICON_HELP,
        buttons : [ { text:"ส่ง", handler:handleSubmit, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });

    // Wire up the success and failure handlers
    dialog.callback = { success: handleSuccess, failure: handleFailure };

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function showMessageDialog(header, msg, icon) {
	messageDialog(header, msg, icon);
}

loader.insert();

