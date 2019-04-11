var SR = new Object();
var $;
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
		$ = YAHOO.util.Dom.get;
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

SR.mode = 2; //0 = Preview, 1 = Add, 2 = Edit
SR.qCalled = false;

function initComponents(){
	SR.currentPaId = document.getElementById('pa_id').value;
	//SR.currentVnId = document.getElementById('vn_id').value;
	SR.reqId = document.getElementById('req_id').value;
	SR.resId = document.getElementById('id').value;
	resetArray();
    initButtons();
    initMenu();
    SR.dlgWait = getWaitDialog();
    SR.visitorTable = initVisitorTable(SR.resId);
    SR.relativeTable = initRelativeTable(SR.resId);
    SR.leaderTable = initLeaderTable(SR.resId);
    SR.helpTable = initHelpTable(SR.resId);
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
    
    SR.visitors = [];
    SR.editVisitors = [];
    SR.delVisitors = [];
    
    SR.relatives = [];
    SR.editRelatives = [];
    SR.delRelatives = [];
    
    SR.leaders = [];
    SR.editLeaders = [];
    SR.delLeaders = [];
    
    SR.helps = [];
    SR.editHelps = [];
    SR.delHelps = [];
}

function initMenu() {
	SR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {
		iframe:true
	});
	SR.toolbar.render();
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){
		var pos = YAHOO.util.Dom.getXY($('toolbar_pane'));
		YAHOO.util.Dom.setXY($('toolbar_pane'),[pos.X,window.scrollY]);
    });
}

function initButtons() {
	SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.addListener("click", function(e) {        
        window.location = "${h.url_for('/zone/visit_request')}" + 
    		"?pa_id=" + SR.currentPaId;// + "&vn_id=" + SR.currentVnId;;
    });
    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.addListener("click", function(e) {
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
            window.location = "${h.url_for('/zone/visit_request')}" + 
    			"?pa_id=" + SR.currentPaId;// + "&vn_id=" + SR.currentVnId;;
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
        var recs = SR.visitorTable.datatable.getRecordSet().getRecords();
        SR.visitors.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.visitors.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editVisitors.length; i++) {
        	var rec = SR.visitorTable.datatable.getRecord(SR.editVisitors[i]);
        	if (rec == null) continue;
        	SR.visitors.push(rec._oData);
        }
        
        recs = SR.relativeTable.datatable.getRecordSet().getRecords();
        SR.relatives.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.relatives.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editRelatives.length; i++) {
        	var rec = SR.relativeTable.datatable.getRecord(SR.editRelatives[i]);
        	if (rec == null) continue;
        	SR.relatives.push(rec._oData);
        }
        
        recs = SR.leaderTable.datatable.getRecordSet().getRecords();
        SR.leaders.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.leaders.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editLeaders.length; i++) {
        	var rec = SR.leaderTable.datatable.getRecord(SR.editLeaders[i]);
        	if (rec == null) continue;
        	SR.leaders.push(rec._oData);
        }
        
        recs = SR.helpTable.datatable.getRecordSet().getRecords();
        SR.helps.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.helps.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editHelps.length; i++) {
        	var rec = SR.helpTable.datatable.getRecord(SR.editHelps[i]);
        	if (rec == null) continue;
        	SR.helps.push(rec._oData);
        }
        
        var jsonData = YAHOO.lang.JSON.stringify(SR.visitors);
        $('visitors').value = jsonData;
        jsonData = YAHOO.lang.JSON.stringify(SR.delVisitors);
        $('del_visitors').value = jsonData;
        
        jsonData = YAHOO.lang.JSON.stringify(SR.relatives);
        $('relatives').value = jsonData;
        jsonData = YAHOO.lang.JSON.stringify(SR.delRelatives);
        $('del_relatives').value = jsonData;
        
        jsonData = YAHOO.lang.JSON.stringify(SR.leaders);
        $('leaders').value = jsonData;
        jsonData = YAHOO.lang.JSON.stringify(SR.delLeaders);
        $('del_leaders').value = jsonData;
        
        jsonData = YAHOO.lang.JSON.stringify(SR.helps);
        $('helps').value = jsonData;
        jsonData = YAHOO.lang.JSON.stringify(SR.delHelps);
        $('del_helps').value = jsonData;
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/zone/save_visit_result')}", callback);
    });
    
    SR.calVisitDate = initCalendar("calVisitDate", "conVisitDate", "btnVisitDate", "visit_date");
    SR.btnVisitDate = new YAHOO.widget.Button("btnVisitDate");
    SR.btnVisitDate.addListener("click", function(e) {
        SR.calVisitDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    
    SR.btnAddVisitor = new YAHOO.widget.Button("btnAddVisitor");
    SR.btnAddVisitor.addListener("click", function(e) {
    	var visitor = $('text-visitor').value;
    	var position = $('text-position').value;
    	var workplace = $('text-workplace').value;
    	var record = {id:-1, visitor:visitor, position:position, workplace:workplace};        
        SR.visitorTable.datatable.addRow(record);
        $('text-visitor').value = '';
    	$('text-position').value = '';
    	$('text-workplace').value = '';
        $('text-visitor').focus();
    });
    
    SR.btnAddRelative = new YAHOO.widget.Button("btnAddRelative");
    SR.btnAddRelative.addListener("click", function(e) {
    	var name = $('text-relative').value;
    	var relationship = $('text-relationship').value;
    	var record = {id:-1, name:name, relationship:relationship};        
        SR.relativeTable.datatable.addRow(record);
        $('text-relative').value = '';
    	$('text-relationship').value = '';
        $('text-relative').focus();
    });
    
    SR.btnAddLeader = new YAHOO.widget.Button("btnAddLeader");
    SR.btnAddLeader.addListener("click", function(e) {
    	var name = $('text-leader').value;
    	var record = {id:-1, name:name};        
        SR.leaderTable.datatable.addRow(record);
        $('text-leader').value = '';
        $('text-leader').focus();
    });
    
    SR.btnAddHelp = new YAHOO.widget.Button("btnAddHelp");
    SR.btnAddHelp.addListener("click", function(e) {
    	var problem = $('text-problem').value;
    	var help = $('text-help').value;
    	var assessment = $('text-assessment').value;
    	var record = {id:-1, problem:problem, help:help, assessment:assessment};        
        SR.helpTable.datatable.addRow(record);
        $('text-problem').value = '';
        $('text-help').value = '';
        $('text-assessment').value = '';
        $('text-problem').focus();
    });
}

function initVisitorTable(res_id) {
	var visitorTable = new function(){
        this.coldefs =
            [{key:"visitor", label:"ชื่อ-สกุล", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"position", label:"ตำแหน่ง", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"workplace", label:"สถานที่ปฏิบัติงาน", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (res_id==null)
            res_id = -1;
        this.query = "res_id=" + res_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_result_visitors?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "visitor", "position", "workplace"]}});
        
        this.datatable = new YAHOO.widget.DataTable("visitor-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1) {
        		SR.editVisitors.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delVisitors,
        				"ต้องการลบข้อมูลคณะติดตามเยี่ยม: " + rec.getData("visitor"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return visitorTable;
}

function initRelativeTable(res_id) {
	var relativeTable = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ-สกุล", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"relationship", label:"เกี่ยวข้องเป็น", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (res_id==null)
            res_id = -1;
        this.query = "res_id=" + res_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_visit_relatives?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "name"]}});
        
        this.datatable = new YAHOO.widget.DataTable("relative-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1) {
        		SR.editRelatives.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delRelatives,
        				"ต้องการลบข้อมูลสมาชิกในครอบครัว: " + rec.getData("name"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return relativeTable;
}

function initLeaderTable(res_id) {
	var leaderTable = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ-สกุล", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (res_id==null)
            res_id = -1;
        this.query = "res_id=" + res_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_visit_leaders?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "name"]}});
        
        this.datatable = new YAHOO.widget.DataTable("leader-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1) {
        		SR.editLeaders.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delLeaders,
        				"ต้องการลบข้อมูลผู้นำชุมชน: " + rec.getData("name"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return leaderTable;
}

function initHelpTable(res_id) {
	var helpTable = new function(){
        this.coldefs =
            [{key:"problem", label:"ปัญหา อาการ พฤติกรรมและความต้องการ", width:250, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"help", label:"การรักษาและการช่วยเหลือทางจิตสังคม", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"assessment", label:"การประเมินผล", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (res_id==null)
            res_id = -1;
        this.query = "res_id=" + res_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_visit_helps?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "problem", "help", "assessment"]}});
        
        this.datatable = new YAHOO.widget.DataTable("help-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1) {
        		SR.editHelps.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delHelps,
        				"ต้องการลบข้อมูลการรักษาและการช่วยเหลือ: " + rec.getData("help"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return helpTable;
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