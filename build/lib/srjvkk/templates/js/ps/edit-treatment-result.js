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
	SR.currentPaId = document.getElementById('pa_id').value;
	SR.currentVnId = document.getElementById('vn_id').value;
	SR.arId = document.getElementById('ar_id').value; 
	SR.planTable = initPlanTable(SR.arId);
	resetArray();
    initButtons();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.plans = new Array();
    SR.delplans = new Array();
    SR.editPlans = [];
}

function initButtons() {
	SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.addListener("click", function(e) {        
        window.location = "${h.url_for('/psychosocial/assessment')}" + 
    		"?pa_id=" + SR.currentPaId + "&vn_id=" + SR.currentVnId;;
    });
    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.addListener("click", function(e) {
    	
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
        recs = SR.planTable.datatable.getRecordSet().getRecords();
        SR.plans.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.plans.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editPlans.length; i++) {
        	var rec = SR.planTable.datatable.getRecord(SR.editPlans[i]);
        	if (rec == null) continue;
        	SR.plans.push(rec._oData);
        }
        
        var jsonData = YAHOO.lang.JSON.stringify(SR.plans);
        document.getElementById('plans').value = jsonData;
        jsonData = YAHOO.lang.JSON.stringify(SR.delPlans);
        document.getElementById('del_plans').value = jsonData;
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psychosocial/save_treatment_result')}", callback);
    });
    
    SR.btnAddPlan = new YAHOO.widget.Button("btnAddPlan");
    SR.btnAddPlan.addListener("click", function(e) {
    	var month = document.getElementById('text-month').value;
    	var year = document.getElementById('text-year').value;
    	var record = {id:-1, month:month, year:year};        
        SR.planTable.datatable.addRow(record);
        document.getElementById('text-month').value = '';
        document.getElementById('text-year').value = '';
        document.getElementById('text-month').focus();
    });
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

function checkComplete(value) {
	var cancels = document.getElementsByName('cancel');
	var remark = document.getElementById('cancel_remark');
	for (var i = 0; i < cancels.length; i++) {
		if (value == '1') {
			cancels[i].checked = false;
			cancels[i].disabled = true;
		} else {
			if (i==0)
				cancels[i].checked = true;
			cancels[i].disabled = false;
		}
	}

}

function initPlanTable(ar_id) {
	var planTable = new function(){
        this.coldefs =
            [{key:"month", label:"เดือน", width:200, editor: new YAHOO.widget.TextboxCellEditor()},
             {key:"year", label:"พ.ศ.", width:200, editor: new YAHOO.widget.TextboxCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (ar_id==null)
            ar_id = -1;
        this.query = "ar_id=" + ar_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/psychosocial/get_plans?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "month", "year"]}});
        
        this.datatable = new YAHOO.widget.DataTable("plan-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1) {
        		SR.editPlans.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delPlans,
        				"ต้องการลบข้อมูลแผน: เดือน" + rec.getData("month") + " พ.ศ. " + rec.getData("year"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return planTable;
}

function delPainter(elCell, oRecord, oColumn, oData) {    
	srDelPainter(elCell, oRecord, oColumn, oData, SR.mode);
}

loader.insert();