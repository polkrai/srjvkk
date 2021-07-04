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
        showMessageDialog("error", "ไม่สามารถดึงโปรแกรมจาก server ได้สำเร็จ กรุณาลองใหม่อีกครั้ง", 
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
var initExtraComponent = null;
function showMessageDialog(header, msg, icon) {
	messageDialog(header, msg, icon);
}

function initComponents(){
	SR.waitDialog = getWaitDialog();
	SR.sessionId = $('id_sess').value;
	//SR.sessionId = document.getElementById('id_sess').value;
    SR.workingWithCurrentQ = false;
	SR.comid = $('com_id').value;
	SR.isWorking= false;
    SR.countDoneWork = 0;
    SR.patientInfo = null;
    SR.foundPatientId = -1;
	
	SR.waitQ = setupWaitQueue();
	SR.doneQ = setupDoneQueue();
    SR.workspaceTab = setupTabPane();
    initButtons();
    createBillInfoButton();
    createFilterButton();
    createBackgroundButton();
    createIpdButton();
    createPatientInfoButton();
    createSearchButton();
    createTreatmentInfoButton();
    SR.dlgAllowedSendQueue = initAllowedSendQueueDialog();
    getAllowedActions(SR.comid, $('select_allowed_action'));
    
    if (Lang.isFunction(initExtraComponent)) {
    	initExtraComponent();
    }
}

SR.qSelectedCallbacks = [];
SR.qCalledCallbacks = [];
SR.pInfoLoadedCallbacks = [];
SR.qSentCallbacks = [];
SR.tabChangedCallbacks = [];
SR.patientFoundCallbacks = [];

function setPatientFoundCallback(callback) {
	SR.patientFoundCallbacks.push(callback);
}

function removePatientFoundCallback(callback) {
	for (var i = 0; i < SR.patientFoundCallbacks.length; i++) {
		if (SR.patientFoundCallbacks[i] == callback) {
			SR.patientFoundCallbacks.splice(i, 1);
			break;
		}
	}
}

function setQueueSelectedCallback(callback) {
	SR.qSelectedCallbacks.push(callback);
}

function removeQueueSelectedCallback(callback) {
	for (var i = 0; i < SR.qSelectedCallbacks.length; i++) {
		if (SR.qSelectedCallbacks[i] == callback) {
			SR.qSelectedCallbacks.splice(i, 1);
			break;
		}
	}
}

function setQueueCalledCallback(callback) {
	SR.qCalledCallbacks.push(callback);
}

function removeQueueCalledCallback(callback) {
	for (var i = 0; i < SR.qCalledCallbacks.length; i++) {
		if (SR.qCalledCallbacks[i] == callback) {
			SR.qCalledCallbacks.splice(i, 1);
			break;
		}
	}
}

function setPatientInfoLoadedCallback(callback) {
	SR.pInfoLoadedCallbacks.push(callback);
}

function removePatientInfoLoadedCallback(callback) {
	for (var i = 0; i < SR.pInfoLoadedCallbacks.length; i++) {
		if (SR.pInfoLoadedCallbacks[i] == callback) {
			SR.pInfoLoadedCallbacks.splice(i, 1);
			break;
		}
	}
}

function setQueueSentCallback(callback) {
	SR.qSentCallbacks.push(callback);
}

function removeQueueSentCallback(callback) {
	for (var i = 0; i < SR.qSentCallbacks.length; i++) {
		if (SR.qSentCallbacks[i] == callback) {
			SR.qSentCallbacks.splice(i, 1);
			break;
		}
	}
}

function setBeforeTabChangedCallback(callback) {
	SR.tabChangedCallbacks.push(callback);
}

function removeBeforeTabChangedCallback(callback) {
	for (var i = 0; i < SR.tabChangedCallbacks.length; i++) {
		if (SR.tabChangedCallbacks[i] == callback) {
			SR.tabChangedCallbacks.splice(i, 1);
			break;
		}
	}
}

function setWorking(isWorking) {
	SR.isWorking = isWorking;
	if (!isWorking) {
		SR.countDoneWork++;
	}
}

function setPatient(paId) {

	SR.dlgSearch.hide();
	SR.waitDialog.show();
	SR.waitQ.datatable.unselectAllRows();
	SR.workingWithCurrentQ = false;
	loadImportantInfo(paId);
	SR.foundPatientId = paId;
	for (var i = 0; i < SR.patientFoundCallbacks.length; i++) {
		if (SR.patientFoundCallbacks[i].success)
			SR.patientFoundCallbacks[i].success();
	}
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

function initDialogBackground() {
    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-background", 
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

function createIpdButton() {
	SR.dlgIpd = initDialogIpd();
	SR.btnIpd = new YAHOO.widget.Button("btn-ipd");
	SR.btnIpd.addListener("click", function(e) {
		if (!SR.patientInfo || SR.patientInfo.an == '') {
            showMessageDialog("Warn", "ไม่มีข้อมูลผู้ป่วยใน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var frame = $('frame-ipd');
		frame.src= url.ipd.general + 'an=' + SR.currentAn;
		SR.dlgIpd.show();
	});
}

function createSearchButton() {
	SR.dlgSearch = initDialogSearch();
	SR.btnSearch = new YAHOO.widget.Button("btn-search");
	SR.btnSearch.addListener("click", function(e) {
		if (SR.workingWithCurrentQ) {
			showMessageDialog("Warn", "ไม่สามารถค้นหาระหว่างที่ทำงานกับคิวได้", YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		$("frame-search").src = url.medrec.search;
		SR.dlgSearch.show();
	});	
}

function createFilterButton() {
	SR.dlgFilter = initDialogFilter();
	SR.btnFilter = new YAHOO.widget.Button("btn-filter");
	SR.btnFilter.addListener("click", function(e) {
		if (!SR.waitQ.qInfo || !SR.waitQ.qInfo.vn_id || SR.waitQ.qInfo.vn_id == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var frame = $('frame-filter');
		frame.src= url.filter.filter + '&vn=' + 
			SR.waitQ.qInfo.vn_id;
		SR.dlgFilter.show();
	});
}

function createBackgroundButton() {
	SR.dlgBackground = initDialogBackground();
	SR.btnBackground = new YAHOO.widget.Button("btn-background");
	SR.btnBackground.addListener("click", function(e) {
		if (!SR.waitQ.qInfo || !SR.waitQ.qInfo.vn_id || SR.waitQ.qInfo.vn_id == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        
		var frame = $('frame-background');
			frame.src= url.social.background + '&pa_id=' + SR.waitQ.qInfo.pa_id + "&id_sess=" + SR.sessionId;
		SR.dlgBackground.show();
	});
}

function createPatientInfoButton() {
	SR.dlgPatientInfo = initDialogPatientInfo();
	SR.btnPatientInfo = new YAHOO.widget.Button("btn-patient-info");
	SR.btnPatientInfo.addListener("click", function(e) {
		if (!SR.waitQ.qInfo || !SR.waitQ.qInfo.pa_id || SR.waitQ.qInfo.pa_id == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var frame = $('frame-patient-info');
		frame.src= url.medrec.general + '&hn=' + SR.hn + "&id_sess=" + SR.sessionId;
		SR.dlgPatientInfo.show();
	});
}

function createTreatmentInfoButton() {
	SR.dlgTreatmentInfo = initDialogTreatmentInfo();
	SR.btnTreatmentInfo = new YAHOO.widget.Button("btn-treatment-info");
	SR.btnTreatmentInfo.addListener("click", function(e) {
        if (!SR.waitQ.qInfo || !SR.waitQ.qInfo.pa_id || SR.waitQ.qInfo.pa_id == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }

		var frame = document.getElementById('frame-treatment-info');
			frame.src = url.med.treatment + '&pa_id=' + SR.waitQ.qInfo.pa_id + "&id_sess=" + SR.sessionId;
		SR.dlgTreatmentInfo.show();
	});
}

function createBillInfoButton() {
	SR.dlgBillInfo = initDialogBillInfo();
	SR.btnBillInfo = new YAHOO.widget.Button("btn-bill-info");
	SR.btnBillInfo.addListener("click", function(e) {
        if (!SR.waitQ.qInfo || !SR.waitQ.qInfo.pa_id || SR.waitQ.qInfo.pa_id == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        
		var frame = document.getElementById('frame-bill-info');
			frame.src= url.finance.payment + "&pa_id=" + SR.waitQ.qInfo.pa_id + "&id_sess=" + SR.sessionId;
		
		SR.dlgBillInfo.show();
	});
}

function initButtons() {

    SR.logoutBtn = new YAHOO.widget.Button("logout_button");
	SR.btnSendBack = new YAHOO.widget.Button("btnSendBack");
	SR.btnSendBack.set("disabled", true);
	SR.btnSendBack.addListener("click", function(e) {
		if (SR.waitQ.qInfo.vn == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		
		confirmDialog("ส่งกลับ", "ต้องการส่ง " + SR.patientInfo.name + " กลับ " + SR.waitQ.qInfo.com1,
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
				
				var comid = SR.waitQ.com1id;
				var query = "q_id=" + SR.waitQ.qInfo.q_id + "&src=social" + 
					"&comid=" + comid + "&action=" + SR.waitQ.qInfo.action + "(ส่งกลับ)";
				YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/transfer')}", 
						callback, query);
					this.hide();
			},
			function() {
				this.hide();
			}
		);
	});
	
	SR.btnCallQueue = new YAHOO.widget.Button("btnCallQueue");
    SR.btnCallQueue.addListener("click", function(e) {
        if (!SR.waitQ.qInfo) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        var qId = SR.waitQ.qInfo.q_id;
        
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
                showMessageDialog("Info", "เรียก: " + result.Success.name + " เวลา : " + result.Success.time,
                		YAHOO.widget.SimpleDialog.ICON_INFO);
                SR.btnCallQueue.set("disabled", true);
                SR.countDoneWork = 0;
                for (var i = 0; i < SR.qCalledCallbacks.length; i++) {
                	if (SR.qCalledCallbacks[i].success)
                		SR.qCalledCallbacks[i].success();
                }
				
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
        
        var paId = SR.waitQ.qInfo.pa_id;
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
        
    });
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
                showMessageDialog("Info", "ส่ง: " + result.Success.name + " เวลา : " + result.Success.time,
                		YAHOO.widget.SimpleDialog.ICON_INFO);
                
                SR.btnCallQueue.set("disabled", false);
                SR.btnSendQueue.set("disabled", true);
                SR.btnSendBack.set("disabled", true);
                loadImportantInfo(-1);
                refreshQueue();
                for (var i = 0; i < SR.qSentCallbacks.length; i++) {
                	if (SR.qSentCallbacks[i].success)
                		SR.qSentCallbacks[i].success();
                }
            },
            failure: function(o) {
                showMessageDialog("Error", "ไม่สามารถส่งคิวได้: " + o.statusText, 
                		YAHOO.widget.SimpleDialog.ICON_BLOCK);
            }
        };
        
        var actionindex = $('select_allowed_action').selectedIndex;
        var query = "q_id=" + SR.waitQ.qInfo.q_id + "&src=${session['sr_com']}" + 
        	"&action_id=" + $('select_allowed_action').options[actionindex].value;
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
        showMessageDialog("Error", "Submission failed: " + o.status, 
        		YAHOO.widget.SimpleDialog.ICON_BLOCK);
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
    dialog.callback = { success: handleSuccess,
                             failure: handleFailure };

    // Render the Dialog
    dialog.render();    
    return dialog;
}

function refreshQueue() {
	SR.waitQ.datasource.sendRequest("comp=${session['sr_com']}&type=wait", {
    	success : SR.waitQ.datatable.onDataReturnInitializeTable,
        failure : SR.waitQ.datatable.onDataReturnInitializeTable,
        scope : SR.waitQ.datatable
    });
	var t = setTimeout(function () {
		SR.doneQ.datasource.sendRequest("comp=${session['sr_com']}&type=done", {
	    	success : SR.doneQ.datatable.onDataReturnInitializeTable,
	        failure : SR.doneQ.datatable.onDataReturnInitializeTable,
	        scope : SR.doneQ.datatable
	    });
	},2000);
}

function setupWaitQueue() {
	var waitQ = new function(){
		this.qInfo = null;
        this.coldefs =
            [{key:"oitype", label:"", formatter:oitypeFormatter},
             {key:"name", label:"ชื่อ - สกุล",resizeable:true},
             {key:"queuetime", label:"เวลา"},
             {key:"action", label:"กิจกรรม"},
             {key:"com1", label:"มาจาก"}
             ];
        this.query = "comp=${session['sr_com']}&type=wait";
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
        
        this.handleQueueClicked = function(oArgs, wq){
            if (SR.workingWithCurrentQ) return;
            var row = this.getRow(oArgs.target);
            wq.lastRow = row;
            this.unselectAllRows();
            this.selectRow(row);
            
        };
        this.datatable.subscribe("rowClickEvent", this.handleQueueClicked, this);
        
        this.handleRowSelected = function (oArgs, wq) {
        	if (SR.workingWithCurrentQ) {
        		if (oArgs.record.getData("vn_id") != wq.qInfo.vn_id) {
        			this.unselectAllRows();
        			this.selectRow(wq.lastRow);
        		}
        		return;
        	}else {
        		wq.lastRow = this.getRow(oArgs.el);
        	}
            var record = oArgs.record;
            if (wq.qInfo && wq.qInfo.vn_id == record.getData("vn_id")) {
            	return;
            }
			wq.qInfo = record._oData;
			SR.waitDialog.show();
			for (var i = 0; i < SR.qSelectedCallbacks.length; i++) {
				if (SR.qSelectedCallbacks[i].success)
					SR.qSelectedCallbacks[i].success();
			}
			
            loadImportantInfo(wq.qInfo.pa_id);  
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected, this);
        
        this.handleQueueLoaded = function(oRequest, oResponse, oPayload){
            var wq = this;
            var result = wq.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
            var rcset = wq.datatable.getRecordSet();
            var rcs = rcset.getRecords();
            var checked = false;
            for(var i =0; i < rcs.length; i++){
                if(wq.qInfo && rcs[i].getData("vn_id") == wq.qInfo.vn_id){
                    checked = true;
                    wq.datatable.selectRow(rcs[i]);
                }
            }
            
            if (!checked) {
                wq.qInfo = null;
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
            scope : this };
        this.intervalId = this.datasource.setInterval(45000,
            this.query, callback);
    };
	return waitQ;
}

function setupDoneQueue() {
	var doneQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", resizeable:true},
             {key:"transfer_time", label:"เวลา"},
             {key:"transfer_to", label:"ส่งไป"}];
        this.query = "comp=${session['sr_com']}&type=done";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/srutil/queue?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"QueueResult.Queue",
                fields:["name", "vn", "queuetime", "q_id", "action_id",
                        "action", "transfer_to", "transfer_time",
                        "vn_id", "pa_id", "an"]}});
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
}

function setupTabPane(){
    var pane = new function(){
        this.tabpane = new YAHOO.widget.TabView("workspace_pane");
        this.tabpane.subscribe("beforeActiveIndexChange", function(e) {
        	if (SR.isWorking) {
        		showMessageDialog("Warn", 'กรุณาบันทึกงานที่กำลังทำก่อน', YAHOO.widget.SimpleDialog.ICON_WARN);
        		return false;
        	}
        	for (var i = 0; i < SR.tabChangedCallbacks.length; i++) {
				if (SR.tabChangedCallbacks[i].success)
					SR.tabChangedCallbacks[i].success(e.prevValue, e.newValue);
			}
        	return true;
        });
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
                    
                } else {
                    
                	pic.src = "/img/noname.png";
                }
                hnspan.innerHTML = "HN: " + info.hn;
                $('vn_span').innerHTML = "VN: " + info.vn;
                $('an_span').innerHTML = "AN: " + info.an;
                $('privilege_span').innerHTML = "สิทธิ์: <span style=\"color:red\">" + info.privilege + "</span>";
                SR.patientInfo = info;
                $('queue_span').innerHTML = "จุดบริการ: " + info.queue;
                for (var i = 0; i < SR.pInfoLoadedCallbacks.length; i++) {
    				if (SR.pInfoLoadedCallbacks[i].success)
    					SR.pInfoLoadedCallbacks[i].success();
    			}
				
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
		SR.patientInfo = null;
        pif.innerHTML = "";
        hnspan.innerHTML = "";
        $('vn_span').innerHTML = "";
        $('privilege_span').innerHTML = "";
        $('queue_span').innerHTML = "";
        $('an_span').innerHTML = "";
    } else {
        AjaxObject.startRequest();    
    }
    
}

loader.insert();