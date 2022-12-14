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
	resetArray();
    initButtons();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.data = new Array();
    SR.delData = new Array();
    SR.editData = [];
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
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/psychosocial/save_patient_assessment')}", callback);
    });
}

function initDataTable() {
	var table = new function(){
		this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"assess_date", label:"วันที่ประเมิน", sortable:true},
             {key:"entrance", label:"ลักษณะการเข้ารับการบำบัด", sortable:true},
             {key:"user", label:"ผู้ประเมิน", sortable:true},
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/psychosocial/get_patient_assessments?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "assess_date", "entrance", "user"]}});
        
        this.datatable = new YAHOO.widget.DataTable("data-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px",
        	paginator:getPaginator(10, 5),
                initialRequest:this.query});
        this.datatable.typesArr = this.typesArr;
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
		    	if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delData,
	        				"ต้องการลบข้อมูลการประเมินก่อนเข้ารับบริการ: " + rec.getData("description"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delData,
            				"ต้องการลบข้อมูลการประเมินก่อนเข้ารับบริการ: " + rec.getData("description"));
            	} else {
            		SR.editData.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
	}
    

    return table;
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