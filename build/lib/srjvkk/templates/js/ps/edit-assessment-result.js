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
SR.qCalled = false;

function initComponents(){
	try {
	    if (parent.setWorking) {
	    	parent.setWorking(true);
	    }
    } catch (ex) {
    	//alert(ex.message);
    }
	SR.currentPaId = document.getElementById('pa_id').value;
	SR.currentVnId = document.getElementById('vn_id').value;
	SR.paAsId = document.getElementById('pa_as_id').value; 
	resetArray();
    initButtons();
    SR.dlgWait = getWaitDialog();
    SR.toolbar = overlayMenu("toolbar_pane");
    /*
    SR.calAppointDate = initCalendar("calAppointDate", "conAppointDate", "btnAppointDate", "appoint_date");
    SR.btnAppointDate = new YAHOO.widget.Button("btnAppointDate");
    SR.btnAppointDate.addListener("click", function(e) {
        SR.calAppointDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    */
    /*
    SR.treatmentAppoint = TimePicker("treatmentAppoint");
    SR.calTreatmentDate = initCalendar("calTreatmentDate", "conTreatmentDate", "btnTreatmentDate", "treatment_date");
    SR.btnTreatmentDate = new YAHOO.widget.Button("btnTreatmentDate");
    SR.btnTreatmentDate.addListener("click", function(e) {
        SR.calTreatmentDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    SR.assessmentAppoint = TimePicker("assessmentAppoint");
    SR.calAssessmentDate = initCalendar("calAssessmentDate", "conAssessmentDate", "btnAssessmentDate", "assessment_date");
    SR.btnAssessmentDate = new YAHOO.widget.Button("btnAssessmentDate");
    SR.btnAssessmentDate.addListener("click", function(e) {
        SR.calAssessmentDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    */
}

function resetArray() {
    SR.data = new Array();
    SR.delData = new Array();
    SR.editData = [];
}

function notReady() {
	document.getElementById("detail").style.display = "none";
}

function ready() {
	document.getElementById("detail").style.display = "";
}

function initButtons() {
	SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.addListener("click", function(e) {        
    	try {
	        if (parent.setWorking) {
	        	parent.setWorking(false);
	        }
        } catch(ex) {
        	//alert(ex.message);
        }
        window.location = "${h.url_for('/psychosocial/assessment')}" + 
    		"?pa_id=" + SR.currentPaId + "&vn_id=" + SR.currentVnId;;
    });
    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.addListener("click", function(e) {
    	try {
	        if (parent.setWorking) {
	        	parent.setWorking(false);
	        }
        } catch(ex) {
        	//alert(ex.message);
        }
    	/*
    	var timeEl = document.getElementById('time');
    	var readyRadios = document.getElementsByName('is_ready');
    	var is_ready = 1;
    	for (var i = 0; i < readyRadios.length; i++) {
    		if (readyRadios[i].checked)
    			is_ready = readyRadios[i].value; 
    	}
    	if (is_ready == 1) {
    		timeEl.value = SR.treatmentAppoint.selectedHour + ":" + SR.treatmentAppoint.selectedMin; 
    	} else {
    		timeEl.value = SR.assessmentAppoint.selectedHour + ":" + SR.assessmentAppoint.selectedMin;
    	}
    	*/
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
            resetArray();
            showMessageDialog("Info", 'บันทึกเรียบร้อย',
            		YAHOO.widget.SimpleDialog.ICON_INFO);
            window.location = "${h.url_for('/psychosocial/assessment')}" + 
    			"?pa_id=" + SR.currentPaId + "&vn_id=" + SR.currentVnId;;
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
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psychosocial/save_assessment_result')}", callback);
    });
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();