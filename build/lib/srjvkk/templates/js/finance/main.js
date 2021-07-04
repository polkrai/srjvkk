var SR = new Object();
var Event, Dom, Lang, $, DT;
var queueId, priorityId;
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

var SR = new Object();

SR.mode = 0; //0 = Preview, 1 = Add, 2 = Edit
SR.checkPayment = false;

function setPatient(paId) {
	SR.dlgSearch.hide();
	SR.leftPane.waitQ.datatable.unselectAllRows();
	SR.leftPane.waitQ.currentPaId = paId;
	SR.leftPane.waitQ.currentVn = -1;
	SR.leftPane.waitQ.currentVnId = -1;
	SR.workingWithCurrentQ = false;
	loadImportantInfo(paId);
}

function setPayAmount(amount) {
	$('txt-pay-amount').innerHTML = formatNumber(amount);
}

function initComponents(){
	SR.sessionId = $('id_sess').value;
	SR.hn = "";
	SR.stationId = $('station_id').value;
	SR.stationType = $('station_type').value;
    SR.workspaceTab = setupTabPane();
    initButtons();
    SR.comid = $('com_id').value;
    SR.sendQueueDialog = initSendQueueDialog();
    SR.dlgAllowedSendQueue = initAllowedSendQueueDialog();
    SR.workingWithCurrentQ = false;
    SR.leftPane = setupLeftPane();
    SR.dlgSearch = initDialogSearch();
    SR.dlgFilter = initDialogFilter();
    SR.dlgPatientInfo = initDialogPatientInfo();
    SR.dlgTreatmentInfo = initDialogTreatmentInfo();
    getActions($('select_com').options[$('select_com').selectedIndex].value);
    getAllowedActions(SR.comid, $('select_allowed_action'));
    SR.isWorking= false;
    SR.countDoneWork = 0;
    SR.patientInfo = null;
    $("frame-search").src = url.medrec.search;
    SR.dlgWait = getWaitDialog();
    
    Event.addListener('txtSearchQ', 'keypress', handleSearchKeyPressed);
    document.body.style.overflow = "auto";
}

function handleSearchKeyPressed(e) {
	var keynum;	
	if (!e) var e = window.event;
	if (e.keyCode) keynum = e.keyCode;
	else if (e.which) keynum = e.which;
	if (keynum == 13) {
		searchQ();
	}
}

function setWorking(isWorking) {
	SR.isWorking = isWorking;
	if (!isWorking) {
		SR.countDoneWork++;
	}
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

function initSendQueueDialog() {
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
                refreshQueue();
                Dom.setStyle('span-com3', 'display', 'none');
                SR.workingWithCurrentQ = false;
                showMessageDialog("Info", "ส่ง: " + result.Success.name + " เวลา : " + 
                		result.Success.time, YAHOO.widget.SimpleDialog.ICON_INFO);
                SR.btnCallQueue.set("disabled", false);
                SR.btnSendQueue.set("disabled", true);
                SR.btnSendBack.set("disabled", true);
                loadImportantInfo(-1);
            },
            failure: function(o) {
                showMessageDialog("Error", "ไม่สามารถส่งคิวได้: " + o.statusText,
                		YAHOO.widget.SimpleDialog.ICON_BLOCK);
            }
        };
        var comid = $('select_com').options[$('select_com').selectedIndex].value;
        var actionindex = $('select_action').selectedIndex;
        var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=finance" + "&comid=" + comid + "&station_id=" + SR.stationId;
        
        if (actionindex != -1) {
	        
        	query += "&action_id=" + $('select_action').options[actionindex].value; 
        }
        
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
        showMessageDialog("Error", "Submission failed: " + o.status,
        		YAHOO.widget.SimpleDialog.ICON_BLOCK);
    };

    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlgSendQueue", 
    { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
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
                	options += "<option value='" + results[i].modid + "'>" +
                		results[i].modtitle + "</option>";
                }
                $('select_mod').innerHTML = options;
            } 
            catch (e) { 
                showMessageDialog("Error", "Invalid data",
                		YAHOO.widget.SimpleDialog.ICON_BLOCK); 
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
	var t = setTimeout(function () {
	    SR.leftPane.doneQ.datasource.sendRequest("comp=finance&type=done&station_type=" + SR.stationType + 
	        	"&station_id=" + SR.stationId, {
	    	success : SR.leftPane.doneQ.datatable.onDataReturnInitializeTable,
	        failure : SR.leftPane.doneQ.datatable.onDataReturnInitializeTable,
	        scope : SR.leftPane.doneQ.datatable
	    });
	}, 2000);
	SR.leftPane.waitQ.datasource.sendRequest("comp=finance&type=wait&station_type=" + SR.stationType, {
    	success : SR.leftPane.waitQ.datatable.onDataReturnInitializeTable,
        failure : SR.leftPane.waitQ.datatable.onDataReturnInitializeTable,
        scope : SR.leftPane.waitQ.datatable
    });
}

function handleCom3Clicked(e) {
	var callback =
    {
        success: function(o) {
            var result = YAHOO.lang.JSON.parse(o.responseText); 
            if (result["Error"] != undefined) {
                showMessageDialog("error", "ไม่สามารถส่งต่อได้: " + result["Error"], 
                		YAHOO.widget.SimpleDialog.ICON_BLOCK);
                return;
            }
            Dom.setStyle('span-com3', 'display', 'none');
            refreshQueue();
            SR.workingWithCurrentQ = false;
            showMessageDialog("Info", 
            		"ส่ง: " + result.Success.name + " เวลา : " + result.Success.time,
            		YAHOO.widget.SimpleDialog.ICON_INFO);
            loadImportantInfo(-1);
            SR.btnCallQueue.set("disabled", false);
            SR.btnSendQueue.set("disabled", true);
            SR.btnSendBack.set("disabled", true);
        },
        failure: function(o) {
            showMessageDialog("Error", "ไม่สามารถส่งต่อได้: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
        }
    };
    
    var comid = SR.leftPane.waitQ.selectedQueue.getData("com_id3");
    var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=finance" + 
    	"&comid=" + comid + "&action_id=" + SR.leftPane.waitQ.selectedQueue.getData("action_id3") +
    	"&station_id=" + SR.stationId + "&action=" + SR.leftPane.waitQ.selectedQueue.getData("action3");
    YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/transfer')}", callback, query);
}

function callQueue(callback) {
	
	var paId = SR.leftPane.waitQ.currentPaId;
    if (paId == -1) {
        showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
        return;
    }
    var qId = SR.leftPane.waitQ.currentQId;
    var currentQ = SR.leftPane.waitQ.selectedQueue;
    if (currentQ.getData("com_id3") == '') {
    	Dom.setStyle('span-com3', 'display', 'none');
    } else {
    	SR.btnCom3.set("label", "ส่ง " + currentQ.getData("com3") + "-" + currentQ.getData("action3"));
    	Dom.setStyle('span-com3', 'display', 'inline');
    }
    
    
    SR.dlgWait.show();
    YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/take_queue')}", callback, "q_id=" + qId);
}

SR.lastSearchIndex = -1;

function searchQ() {
	
	var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=finance" + "&comid=" + comid + "&station_id=" + SR.stationId;

	alert(query)
	
	if (SR.workingWithCurrentQ) {
		
		showMessageDialog("ค้นหา", "มีคิวทีถูกเรียกแล้ว ไม่สามารถค้นหาผู้ป่วยในคิวได้", YAHOO.widget.SimpleDialog.ICON_WARN);
		
		return;
	}
	
	var keyword = $('txtSearchQ').value;
	var qtb = SR.leftPane.waitQ.datatable;
	var recs = qtb.getRecordSet().getRecords();
	var index = -1;
	for (var i = 0; i < recs.length; i++) {
		if (i <= SR.lastSearchIndex) {
			continue;
		}
		var hn = recs[i].getData("hn");
		var name = recs[i].getData("name");
		index = hn.indexOf(keyword);
		if (index == -1) {
			index = name.indexOf(keyword);
		}
		if (index >= 0){
			SR.lastSearchIndex = i;
			break;
		}
	}
	if (index == -1) {
		SR.lastSearchIndex = -1
		showMessageDialog("ค้นหา", "ไม่พบผู้ป่วยในคิว หรือสิ้นสุดตาราง ลองค้นหาอีกครั้ง", YAHOO.widget.SimpleDialog.ICON_INFO);		
	} 
	else {
		qtb.unselectAllRows();
		qtb.selectRow(recs[i]);
		tb = qtb.getBdContainerEl()
        tb.scrollTop = qtb.getTrEl(recs[i]).offsetTop
	}
}

function initButtons() { 
	
	SR.btnSearchQ = new YAHOO.widget.Button("btnSearchQ");
	SR.btnSearchQ.addListener("click", searchQ);
	
	SR.btnCom3 = new YAHOO.widget.Button("btnCom3");
	Dom.setStyle(SR.btnCom3._button, 'color', 'red');
	Dom.setStyle(SR.btnCom3._button, 'font-weight', 'bold');
	SR.btnCom3.addListener("click", handleCom3Clicked);
	
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
						SR.dlgWait.hide();
		                var result = YAHOO.lang.JSON.parse(o.responseText); 
		                if (result["Error"] != undefined) {
		                    showMessageDialog("error", "ไม่สามารถส่งกลับได้ : " + result["Error"], 
		                    		YAHOO.widget.SimpleDialog.ICON_BLOCK);
		                    return;
		                }
		                refreshQueue();
		                Dom.setStyle('span-com3', 'display', 'none');
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
		            	SR.dlgWait.hide();
		                showMessageDialog("Error", "ไม่สามารถส่งกลับได้: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
		            }
		        };
				SR.dlgWait.show();
		        var comid = rec.getData("com1id");
		        var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=finance" + 
		        	"&comid=" + comid + "&action=" + rec.getData("action") + "(ส่งกลับ)" +
		        	"&station_id=" + SR.stationId;
		        YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/srutil/transfer')}", callback, query);
		        this.hide();
			},
			function() {
				this.hide();
			}
		);
	});
	
	SR.btnSearch = new YAHOO.widget.Button("btn-search");
	SR.btnSearch.addListener("click", function(e) {
		if (SR.workingWithCurrentQ) {
			showMessageDialog("Warn", "ไม่สามารถค้นหาระหว่างที่ทำงานกับคิวได้",
					YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		SR.dlgSearch.show();
	});
	
	SR.btnPatientInfo = new YAHOO.widget.Button("btn-patient-info");
	SR.btnPatientInfo.addListener("click", function(e) {
		if (SR.hn == "") {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน",
            		YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var frame = $('frame-patient-info');
			frame.src= url.medrec.general + '&hn=' + SR.hn + "&id_sess=" + SR.sessionId;
		
		SR.dlgPatientInfo.show();
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
	
	SR.btnTreatmentInfo = new YAHOO.widget.Button("btn-treatment-info");
	SR.btnTreatmentInfo.addListener("click", function(e) {
		var paId = SR.leftPane.waitQ.currentPaId;
        if (paId == -1) {
            showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
		var frame = document.getElementById('frame-treatment-info');
			frame.src= url.med.treatment + '&pa_id=' + SR.leftPane.waitQ.currentPaId + "&id_sess=" + SR.sessionId;
		
		SR.dlgTreatmentInfo.show();
	});
	
    SR.logoutBtn = new YAHOO.widget.Button("logout_button");
    SR.btnCallQueue = new YAHOO.widget.Button("btnCallQueue");
    
    SR.btnCallQueue.addListener("click", function(e) {
    	var callback = {
            success: function (o) {
                //alert(o.responseText);
        		SR.dlgWait.hide();
                var result = YAHOO.lang.JSON.parse(o.responseText); 
                if (result["Error"] != undefined) {
                    showMessageDialog("Error", "ไม่สามารถเรียกคิวได้ : " + result["Error"], YAHOO.widget.SimpleDialog.ICON_ERROR);
                    return;
                }
                
                SR.workingWithCurrentQ = true;
                showMessageDialog("Info", "เรียก: " + result.Success.name + " เวลา : " + result.Success.time, YAHOO.widget.SimpleDialog.ICON_INFO);
                
                SR.btnCallQueue.set("disabled", true);
                SR.btnSendQueue.set("disabled", false);
                SR.btnSendBack.set("disabled", false);
                
                getPaymentPage(SR.leftPane.waitQ.currentVnId, SR.leftPane.waitQ.currentPaId, SR.workingWithCurrentQ, SR.stationId, SR.patientInfo.an);
                
                getPaymentHistoryPage(SR.leftPane.waitQ.currentVnId, SR.leftPane.waitQ.currentPaId, SR.workingWithCurrentQ, SR.stationId);
                
                frmconfirm.reloadPage(SR.leftPane.waitQ.currentVnId, SR.leftPane.waitQ.currentPaId, SR.workingWithCurrentQ, SR.patientInfo.privilege_id);
                
                frmipdsummary.reloadPage(SR.leftPane.waitQ.currentVnId, SR.leftPane.waitQ.currentPaId);
               
            },
            failure: function (o) {
	            
            	SR.dlgWait.hide();
                showMessageDialog("Error", "เรียกคิวไม่สำเร็จ: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_ERROR);
            }
        };
        
        callQueue(callback);
        
        var callbackq4u = {
	        success: function (o) {
		        
		        /*alert(o.statusText);
		        alert(o.responseText);
		        
		        var result = YAHOO.lang.JSON.parse(o.responseText);
		        
		        if (result["statusCode"] == "500") {
			        
			        showMessageDialog("Error", "ไม่สามารถเรียกคิว Q4U ได้ : " + result["message"], YAHOO.widget.SimpleDialog.ICON_ERROR);
					return;
		        }*/
		        
	        },
	        failure: function(o) {
		        
	            //alert(o.statusText);
		        //alert(o.responseText);
		        
		        var result = YAHOO.lang.JSON.parse(o.responseText);
		        
		        if (result["statusCode"] == "500") {
			        
			        SR.dlgWait.hide();
			        showMessageDialog("Error", "ไม่สามารถเรียกคิว Q4U ได้ : " + result["message"], YAHOO.widget.SimpleDialog.ICON_ERROR);
		        }
	        }
	    };

        callQ4u(callbackq4u);
        
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
        	);
        } 
        else if (SR.countDoneWork == 0) {
	        
        	confirmDialog("ส่งต่อ", "ยังไม่ได้ทำงานกับผู้ป่วยที่เรียก ต้องการส่งต่อหรือไม่", 
        		function() {
        			SR.dlgAllowedSendQueue.show();
        			this.hide();
        		},
        		function() {
        			this.hide();
        		}
        	);
        } 
        else {
	        
        	SR.dlgAllowedSendQueue.show();
        }
        //SR.sendQueueDialog.show();
    });
    
}

function setupLeftPane(){
	
    var waitQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", resizeable:true, maxAutoWidth:50},
             {key:"queuetime", label:"เวลา"},
             {key:"action", label:"กิจกรรม", maxAutoWidth:50},
             {key:"com1", label:"มาจาก", maxAutoWidth:50},
             {key:"com3", label:"ส่งต่อ", maxAutoWidth:50}];
             
        this.query = "comp=finance&type=wait&station_type=" + SR.stationType;
        this.datasource = new YAHOO.util.DataSource("${h.url_for('/srutil/queue?')}", {connXhrMode: "cancelStaleRequest", connMethodPost: true, responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"QueueResult.Queue",
                fields:["name", "vn", "queuetime", "q_id", "action_id", 
                        "action", "vn_id", "pa_id", "com1", "oitype", 
                        "appointed", "an", "sendto", "com1id", "com_id3",
                        "com3", "action_id3", "action3", "hn", "id_station", "q4u_ip", "token"]}});
        
        this.datatable = new YAHOO.widget.DataTable("left_queue_pane", this.coldefs, this.datasource, {initialRequest:this.query, scrollable:true, width:"330px", height:"250px"});
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
//        		Event.stopEvent(oArgs.event);
        		return;
        	} else {
        		wq.lastRow = oArgs.el;
        	}
        	SR.checkPayment = true;
            var record = oArgs.record;
            if (wq.currentVnId == record.getData("vn_id")) {
            	return;
            }
            
			wq.currentVn = record.getData("vn");
            wq.currentVnId = record.getData("vn_id");
            wq.currentQId = record.getData("q_id");
            wq.currentPaId = record.getData("pa_id");
            wq.currentHN = record.getData("hn");
            wq.currentStation = record.getData("id_station");
            wq.currentOitype = record.getData("oitype");
            wq.currentQ4uip = record.getData("q4u_ip");
            wq.currentToken = record.getData("token");
            wq.selectedQueue = record;
            
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
                    tb = this.getBdContainerEl()
                    tb.scrollTop = this.getTrEl(rcs[i]).offsetTop
                }
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
        this.intervalId = this.datasource.setInterval(45000, this.query, callback);
        this.currentVn = -1;
        this.currentVnId = -1;
        this.currentQId = -1;
        this.currentPaId = -1;
    };
    
    var doneQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", resizeable:true},
             {key:"transfer_time", label:"เวลา"},
             {key:"transfer_to", label:"ส่งไป"}];
        this.query = "comp=finance&type=done&station_type=" + SR.stationType + 
        	"&station_id=" + SR.stationId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/srutil/queue?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             maxCacheEntries: 0,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"QueueResult.Queue",
                fields:["name", "vn", "queuetime", "q_id", "action_id", "action", "transfer_to", "transfer_time"]}});
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
    pane.waitQ = waitQ;
    pane.doneQ = doneQ;
    
    return pane;
}

function setupTabPane(){
    var pane = new function(){
        this.tabpane = new YAHOO.widget.TabView("workspace_pane");
        
        this.handleActiveIndexChange = function(event) {
            if (event.newValue == 0) {
                frmpayment.SR.patientPaymentTable.datatable.validateColumnWidths();
                frmpayment.SR.visitChargeTable.datatable.validateColumnWidths();
            } else if (event.newValue == 1) {
            	frmhistory.SR.paymentHistoryTable.datatable.validateColumnWidths();
            	frmhistory.SR.paymentHistoryItemTable.datatable.validateColumnWidths();
            } else if (event.newValue == 2) {
            	frmsendmoney.SR.sendMoneyTable.datatable.validateColumnWidths();
            	frmsendmoney.SR.sendMoneyItemTable.datatable.validateColumnWidths();
            } else if (event.newValue == 4) {
            	frmipdsummary.SR.admitTable.datatable.validateColumnWidths();
            	frmipdsummary.SR.homeVisitTable.datatable.validateColumnWidths();
            	frmipdsummary.SR.diagTable.datatable.validateColumnWidths();
            	frmipdsummary.SR.receiptTable.datatable.validateColumnWidths();
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
        	SR.dlgWait.hide();
        	showMessageDialog("Error", 'ไม่สามารถเชื่อมต่อกับ Server ได้ : ' + o.statusText,
            		YAHOO.widget.SimpleDialog.ICON_ERROR);
        },

        processResult:function(o){
            // This member is called by handleSuccess
        	SR.dlgWait.hide();
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
                SR.hn = info.hn;
                SR.currentAn = info.an;
                $('queue_span').innerHTML = "จุดบริการ: " + info.queue;
                //setPaId(info.id);               
                //SR.leftPane.waitQ.currentPaId = info.id;
                getPaymentPage(info.vn_id, info.id, SR.workingWithCurrentQ, SR.stationId, info.an);
                getPaymentHistoryPage(info.vn_id, info.id, SR.workingWithCurrentQ, SR.stationId);
                frmconfirm.reloadPage(info.vn_id, info.id, SR.workingWithCurrentQ, info.privilege_id);
                frmipdsummary.reloadPage(info.vn_id, info.id);
                frmlab.reloadPage(info.id);
                frmrestore.reloadPage(info.id);
                frmitem.reloadPage(info.id);
            } 
            catch (e) { 
                showMessageDialog("Error", "Invalid data",
                		YAHOO.widget.SimpleDialog.ICON_ERROR); 
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
        $('an_span').innerHTML = "";
        $('privilege_span').innerHTML = "";
        $('txt-pay-amount').innerHTML = "";
        getPaymentPage(paId, paId, SR.workingWithCurrentQ, SR.stationId, SR.patientInfo.an);
        getPaymentHistoryPage(paId, paId, SR.workingWithCurrentQ, SR.stationId);
    } else {
    	SR.dlgWait.show();
        AjaxObject.startRequest();    
    }
    
}

function createWaitQueueGrid(obj, div_id, refresh_url_ds, refresh_url_query){
    obj.coldefs =
        [{key:"name", label:"ชื่อ - สกุล", width:180, resizeable:true},
         {key:"queuetime", label:"เวลา", width:50}];
    obj.query = refresh_url_query
    obj.datasource = new YAHOO.util.DataSource(
        refresh_url_ds,
        {connXhrMode: "cancelStaleRequest",
         connMethodPost: true,
         responseType:YAHOO.util.DataSource.TYPE_JSON,
         responseSchema:{resultsList:"QueueResult.Queue",
            fields:["name", "vn", "queuetime", "q_id"]}});
            
    obj.datatable = new YAHOO.widget.DataTable(div_id,
        obj.coldefs, obj.datasource,
        {initialRequest:obj.query,
         scrollable:true, width:"280px", height:"250px"});
}

function paidPainter(elCell, oRecord, oColumn, oData) {
    if(oRecord.getData("paid")) {
        elCell.innerHTML = ' <img width="22px" height="22px" src="/img/paid.png" />';
    }
    else {
        elCell.innerHTML = ' <img width="22px" height="22px" src="/img/unpaid.png" />';
    }
};

function getPaymentPage(vnId, paId, qcalled, stationId, an) {
    //document.getElementById("frame-payment").src = "${h.url_for('/finance/payment_page?vn_id=" + vnId + "&qcalled=" + qcalled + "&id_sess=" + SR.sessionId + "')}";
	frmpayment.reloadPage(vnId, paId, qcalled, stationId, an);
}

function getPaymentHistoryPage(vnId, paId, qcalled, stationId) {
    //document.getElementById("frame-payment-history").src = "${h.url_for('/finance/payment_history_page?vn_id=" + vnId + "&qcalled=" + qcalled + "')}";
	frmhistory.reloadPage(vnId, paId, qcalled, stationId);
}

function initAllowedSendQueueDialog() {
    // Define various event handlers for Dialog
    var handleSubmit = function() {
        var callback =
        {
            success: function(o) {
	            
        		SR.dlgWait.hide();
                var result = YAHOO.lang.JSON.parse(o.responseText);
                
                if (result["Error"] != undefined) {
	                
                    showMessageDialog("Error", "ไม่สามารถส่งคิวได้ : " + result["Error"], YAHOO.widget.SimpleDialog.ICON_ERROR);
                    return;
                }
                
                Dom.setStyle('span-com3', 'display', 'none');
                SR.workingWithCurrentQ = false;
                showMessageDialog("Info", "ส่ง: " + result.Success.name + " เวลา : " + result.Success.time, YAHOO.widget.SimpleDialog.ICON_INFO);
                SR.btnCallQueue.set("disabled", false);
                SR.btnSendQueue.set("disabled", true);
                SR.btnSendBack.set("disabled", true);
                loadImportantInfo(-1);
                refreshQueue();
                pendingQ4u();
            },
            failure: function(o) {
	            
            	SR.dlgWait.hide();
                showMessageDialog("Error", "ไม่สามารถส่งคิวได้: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_ERROR);
            }
        };

        SR.dlgWait.show();
        var actionindex = $('select_allowed_action').selectedIndex;
        var query = "q_id=" + SR.leftPane.waitQ.currentQId + "&src=finance" + "&action_id=" + $('select_allowed_action').options[actionindex].value + "&station_id=" + SR.stationId;
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
        showMessageDialog("Error", "Submission failed: " + o.status, YAHOO.widget.SimpleDialog.ICON_ERROR);
    };

    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog("dlg-send-queue", 
    { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        buttons : [ { text:"ส่ง", handler:handleSubmit, isDefault:true }, { text:"ยกเลิก", handler:handleCancel } ]
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

function confirmDialog(header, msg, handleYes, handleNo) {
	confirmDialog(header, msg, handleYes, handleNo);
}

function callQ4u() {
				
	    var q4uurl = SR.leftPane.waitQ.currentQ4uip + "/api/v1/api/call";
	    
	    var params = "queueId=" + SR.leftPane.waitQ.currentQId + "&hn=" + SR.leftPane.waitQ.currentHN + "&roomId=" + SR.leftPane.waitQ.currentStation + "&servicePointId=13&token=" + SR.leftPane.waitQ.currentToken;
	    
	    //alert (params);
	    
		var callback = {

            success: function (o) {
                
                var result = YAHOO.lang.JSON.parse(o.responseText); 

                if (result["statusCode"] == 500) {

                    //showMessageDialog("Error", "ไม่สามารถเรียกคิวได้ : " + result["Error"], YAHOO.widget.SimpleDialog.ICON_ERROR);
                    alert(result["statusCode"])
                    return;
                }
                else {
		            
		            queueId = result["queueId"];
		            priorityId = result["priorityId"];
	            }

               
            },
            failure: function (o) {
	            
            	//SR.dlgWait.hide();
                //showMessageDialog("Error", "เรียกคิวไม่สำเร็จ: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_ERROR);
            }
        };

		YAHOO.util.Connect.asyncRequest('POST', q4uurl, callback, params);
	   
    //}
  
}

function pendingQ4u() {
	
	//if (SR.leftPane.waitQ.currentOitype == "out") {
	
		var callback = {
	        success: function (o) {
		        
		        var result = YAHOO.lang.JSON.parse(o.responseText);
		        
		        if (result["statusCode"] == 500) {
			        
			        showMessageDialog("Error", "ไม่สามารถเรียกคิว Q4U ได้ : " + result["message"], YAHOO.widget.SimpleDialog.ICON_ERROR);
					alert(result["message"]);
					return;
		        }
		        else {
			        
			        //alert(result);
		        }
		        
	        },
	        failure: function(o) {
		        
	            //showMessageDialog("Error", "ไม่สามารถส่งต่อได้: " + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
	        }
	    };
		
		var q4uurl = SR.leftPane.waitQ.currentQ4uip + "/api/v1/api/pending";
		var params = "queueId=" + queueId + "&priorityId=" + priorityId + "&servicePointId=13&token=" + SR.leftPane.waitQ.currentToken;
		
		//alert(params);
		
	    YAHOO.util.Connect.asyncRequest('POST', q4uurl, callback, params);
	//}
}

function redirectPage(url) {
	
	setTimeout(function() {
		
		window.location = url;
		
	}, 4000);
	
}

loader.insert();