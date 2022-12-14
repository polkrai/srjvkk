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
SR.currentVnId = -1;
SR.qcalled = false;
SR.currentPatientId = -1;
SR.currentPrivId = -1;

function reloadPage(vnId, paId, qcalled, privId) {
	$('pa_id').value = paId;
	$('vn_id').value = vnId;
	$('selectPriv').value = privId;
	$('qcalled').value = qcalled;
	SR.currentVnId = vnId;
	SR.currentAn = null;
    SR.qcalled = qcalled;
    SR.currentPatientId = paId;
    SR.currentPrivId = privId;
    getConfirmInfo();
    setDisableInput(true);
}

function initComponents(){
    initButtons();
    SR.dlgWait = getWaitDialog();
    setDisableInput(true);
    initMenu();
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

function initButtons() {
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	if (SR.currentPatientId == -1 || !SR.qcalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
    	if (SR.currentAn == null || SR.currentAn == '') {
            showMessageDialog("Warn", "แก้ไขสิทธิ์ได้เฉพาะผู้ป่วยใน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        setDisableInput(false);
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
    	SR.dlgWait.show();
    	var responseSuccess = function(o) {
	    SR.mode = 0;
	    SR.dlgWait.hide();
	    SR.currentPrivId = $('selectPriv').value;
            reloadPage(SR.currentVnId, SR.currentPatientId, SR.qcalled, SR.currentPrivId);
            SR.btnEdit.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
	    if (parent.setWorking) {
		parent.setWorking(false);
	    }
            showMessageDialog("Info", 'บันทึกเรียบร้อย', YAHOO.widget.SimpleDialog.ICON_INFO);
            parent.loadImportantInfo(SR.currentPatientId);
            
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
    	var formObject = $('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', 
        		"${h.url_for('/finance/confirm_privilege')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.mode = 0;
        this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnEdit.set("disabled", false);
    	reloadPage(SR.currentVnId, SR.currentPatientId, SR.qcalled, SR.currentPrivId);
    });
    
    SR.calReferDate = initCalendar("calReferDate", "conReferDate", "btnReferDate", "referdate");
    SR.btnReferDate = new YAHOO.widget.Button("btnReferDate");
    SR.btnReferDate.addListener("click", function(e) {
        SR.calReferDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    
    SR.calClaimDate = initCalendar("calClaimDate", "conClaimDate", "btnClaimDate", "claimdate");
    SR.btnClaimDate = new YAHOO.widget.Button("btnClaimDate");
    SR.btnClaimDate.addListener("click", function(e) {
        SR.calClaimDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

function setDisableInput(disable) {
    var frm = $("form");
    for (var i = 0; i < frm.elements.length; i++) {
        var el = frm.elements[i];
        if (el.type == "textarea" || el.type == "text") {
            if (disable) {
                Dom.setStyle(el.id, 'background-color', readonlyColor);
                el.readOnly = disable;
            } else {
            	Dom.setStyle(el.id, 'background-color', normalColor);
        		el.readOnly = disable;
            }
            
        } else {
        	el.disabled = disable;
        }
    }
}

function getConfirmInfo() {
	var callback =
	{
		success: function(o) {
			var res = YAHOO.lang.JSON.parse(o.responseText);
			SR.currentAn = res.an;
            $('people_number').value = res.people_number;
			$('cardno').value = res.prcard_id;
			$('referno').value = res.refer_no;
			$('referdate').value = res.refer_date;
			$('referhosp').value = res.refer_hosp;
			$('claimcode').value = res.claim_code;
			$('claimdate').value = res.claim_date;
			$('claimperson').value = res.claim_person;
			$('birthdate').value = res.birth_date;
			$('admitdate').value = res.admit_date;
			
		},
		failure: function(o) {
			showMessageDialog("Error", 'ไม่สามารถอ่านข้อมูลการตรวจสอบสิทธิ์ได้' + o.status,
					YAHOO.widget.SimpleDialog.ICON_BLOCK);
		}
	};
	ajaxRequest("POST", "${h.url_for('/finance/get_confirm_privilege')}", 
			callback, "vn_id=" + SR.currentVnId);
}

loader.insert();

