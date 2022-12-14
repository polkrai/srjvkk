var SR = new Object();
var Event, Dom, Lang, $;
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
		$ = Dom.get;
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
	//SR.currentVnId = document.getElementById('vn_id').value;
	resetArray();
    initButtons();
    initMenu();
    SR.dlgWait = getWaitDialog();
    var n = document.getElementsByName('problem_date').length;
    SR.problemDates = [];
    SR.btnProblems = [];
    for (var i=0; i<n;i++) {
    	SR.problemDates[i] = initCalendar("calProblemDate" + i, 
    			"conProblemDate" + i, "btnProblemDate" + i,
    			"problem_date" + i);
    }
    for (var i=0; i<n;i++) {
    	SR.btnProblems[i] = new YAHOO.widget.Button("btnProblemDate" + i);
    	SR.btnProblems[i].calendar = SR.problemDates[i]; 
    	SR.btnProblems[i].addListener("click", function(e) {
            this.calendar.dialog.show();
            if (YAHOO.env.ua.opera && document.documentElement) {
    			// Opera needs to force a repaint
    			document.documentElement.className += "";
    		} 
        });
    }
    
    SR.calAdmitDate = initCalendar("calAdmitDate", "conAdmitDate", "btnAdmitDate", "last_admit_date");
    SR.btnAdmitDate = new YAHOO.widget.Button("btnAdmitDate");
    SR.btnAdmitDate.addListener("click", function(e) {
        SR.calAdmitDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    SR.calDischargeDate = initCalendar("calDischargeDate", "conDischargeDate", "btnDischargeDate", "last_discharge_date");
    SR.btnDischargeDate = new YAHOO.widget.Button("btnDischargeDate");
    SR.btnDischargeDate.addListener("click", function(e) {
        SR.calDischargeDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    SR.reqId = document.getElementById('id').value;
    SR.toolTable = initToolTable(SR.reqId);
}

function resetArray() {
    SR.data = new Array();
    SR.delData = new Array();
    SR.editData = [];
    SR.tools = [];
    SR.delTools = [];
    SR.editTools = [];
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
	if (document.getElementById("btnPrint")) {
		SR.btnPrint = new YAHOO.widget.Button("btnPrint");
	    SR.btnPrint.addListener("click", function(e) {
	    	window.open("${h.url_for('/zone/print_request')}?request_id=" + document.getElementById('id').value);
	    });
	}
	SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.addListener("click", function(e) {        
        window.location = "${h.url_for('/zone/visit_request')}" + 
    		"?pa_id=" + SR.currentPaId;// + "&vn_id=" + SR.currentVnId;;
    });
    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
            resetArray();
            showMessageDialog("Info", 'บันทึกและส่งต่อเรียบร้อย',
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
        var problems = document.getElementsByName('problems');
        var data = [];
        for (var i=0; i < problems.length; i++) {
        	data.push({
        		id: problems[i].value,
        		checked: problems[i].checked
        	});
        }
        var jsData = YAHOO.lang.JSON.stringify(data);
        document.getElementById('problem_data').value = jsData;
        
        recs = SR.toolTable.datatable.getRecordSet().getRecords();
        SR.tools.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.tools.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editTools.length; i++) {
        	var rec = SR.toolTable.datatable.getRecord(SR.editTools[i]);
        	if (rec == null) continue;
        	SR.tools.push(rec._oData);
        }
        jsonData = YAHOO.lang.JSON.stringify(SR.tools);
        $('tools').value = jsonData;
        jsonData = YAHOO.lang.JSON.stringify(SR.delTools);
        $('del_tools').value = jsonData;
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/zone/save_visit_request')}", callback);
    });
    
    SR.btnAddTool = new YAHOO.widget.Button("btnAddTool");
    SR.btnAddTool.addListener("click", function(e) {
    	var toolId = $('select-tool').value;
    	var toolName = $('select-tool').options[$('select-tool').selectedIndex].text;
    	var toolBefore = $('tool-before').value;
    	var toolAfter = $('tool-after').value;
    	var record = {id:-1, tool_id: toolId, tool: toolName, before: toolBefore, after:toolAfter, remark: ''};
    			//network_name: nName, network_unit: nUnit, ampur: ampur, province: province};        
        SR.toolTable.datatable.addRow(record);
    	$('tool-before').value = '';
    	$('tool-after').value = '';
    });
}

function initToolTable(req_id) {
	var toolTable = new function(){
        this.coldefs =
            [{key:"tool", label:"ชื่อเครื่องมือ", width:150},
             {key:"remark", label:"หมายเหตุ", width:150, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"before", label:"คะแนนวันที่รับรักษา", width:100, editor: new YAHOO.widget.TextboxCellEditor()},
             {key:"after", label:"คะแนนวันที่จำหน่าย", width:100, editor: new YAHOO.widget.TextboxCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"tool_id", hidden: true},
             {key:"id", hidden: true}];
        if (req_id==null)
        	req_id = -1;
        this.query = "req_id=" + req_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_request_tools?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "tool_id",
                        "tool", "remark", "before"]}});
        
        this.datatable = new YAHOO.widget.DataTable("tool-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px", width:"650px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1) {
        		SR.editTools.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delTools,
        				"ต้องการลบข้อมูลการประเมิน: " + rec.getData("tool"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return toolTable;
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