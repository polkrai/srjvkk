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

SR.mode = 2; //0 = Preview, 1 = Add, 2 = Edit
SR.qCalled = false;

function initComponents(){
	SR.currentPaId = document.getElementById('pa_id').value;
	//SR.currentVnId = document.getElementById('vn_id').value;
	resetArray();
    initButtons();
    initMenu();
    SR.dlgWait = getWaitDialog();

    SR.calReferDate = initCalendar("calReferDate", "conReferDate", "btnReferDate", "refer_date");
    SR.btnReferDate = new YAHOO.widget.Button("btnReferDate");
    SR.btnReferDate.addListener("click", function(e) {
        SR.calReferDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    
    SR.calLastVisitDate = initCalendar("calLastVisitDate", "conLastVisitDate", "btnLastVisitDate", "last_visit_date");
    SR.btnLastVisitDate = new YAHOO.widget.Button("btnLastVisitDate");
    SR.btnLastVisitDate.addListener("click", function(e) {
        SR.calLastVisitDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    /*
    SR.calLastAdmitDate = initCalendar("calLastAdmitDate", "conLastAdmitDate", "btnLastAdmitDate", "last_admit_date");
    SR.btnLastAdmitDate = new YAHOO.widget.Button("btnLastAdmitDate");
    SR.btnLastAdmitDate.addListener("click", function(e) {
        SR.calLastAdmitDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    
    SR.calLastDischargeDate = initCalendar("calLastDischargeDate", "conLastDischargeDate", "btnLastDischargeDate", "last_discharge_date");
    SR.btnLastDischargeDate = new YAHOO.widget.Button("btnLastDischargeDate");
    SR.btnLastDischargeDate.addListener("click", function(e) {
        SR.calLastDischargeDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    */
    SR.calRemedDate = initCalendar("calRemedDate", "conRemedDate", "btnRemedDate", "remed_date");
    SR.btnRemedDate = new YAHOO.widget.Button("btnRemedDate");
    SR.btnRemedDate.addListener("click", function(e) {
        SR.calRemedDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    SR.refId = document.getElementById('id').value;
    SR.networkTable = initNetworkTable(SR.refId);
    SR.toolTable = initToolTable(SR.refId);
}

function resetArray() {
    SR.networks = new Array();
    SR.delNetworks = new Array();
    SR.editNetworks = [];
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
	    	window.open("${h.url_for('/zone/print_refer')}?refer_id=" + document.getElementById('id').value);
	    });
	}
	SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.addListener("click", function(e) {        
        window.location = "${h.url_for('/zone/refer')}" + 
    		"?pa_id=" + SR.currentPaId;// + "&vn_id=" + SR.currentVnId;;
    });
    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
            resetArray();
            showMessageDialog("Info", 'บันทึกและส่งต่อเรียบร้อย',
            		YAHOO.widget.SimpleDialog.ICON_INFO);
            window.location = "${h.url_for('/zone/refer')}" + 
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
        var recs = SR.networkTable.datatable.getRecordSet().getRecords();
        SR.networks.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.networks.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editNetworks.length; i++) {
        	var rec = SR.networkTable.datatable.getRecord(SR.editNetworks[i]);
        	if (rec == null) continue;
        	SR.networks.push(rec._oData);
        }
        var jsonData = YAHOO.lang.JSON.stringify(SR.networks);
        $('networks').value = jsonData;
        jsonData = YAHOO.lang.JSON.stringify(SR.delNetworks);
        $('del_networks').value = jsonData;
        
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
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/zone/save_refer')}", callback);
    });
    
    SR.btnAddNetwork = new YAHOO.widget.Button("btnAddNetwork");
    SR.btnAddNetwork.addListener("click", function(e) {
    	//var nName = $('network_name').value;
    	//var nUnit = $('network_unit').value;
    	var referDate = $('refer_date').value;
    	//var ampur = $('network_ampur').value;
    	//var province = $('network_province').value;
    	var record = {id:-1, refer_date: referDate};
    			//network_name: nName, network_unit: nUnit, ampur: ampur, province: province};        
        SR.networkTable.datatable.addRow(record);
//        $('network_name').value = '';
//    	$('network_unit').value = '';
    	$('refer_date').value = '';
//    	$('network_ampur').value = '';
//    	$('network_province').value = '';
//        $('network_name').focus();
    });
    
    SR.btnAddTool = new YAHOO.widget.Button("btnAddTool");
    SR.btnAddTool.addListener("click", function(e) {
    	var toolId = $('select-tool').value;
    	var toolName = $('select-tool').options[$('select-tool').selectedIndex].text;
    	var toolBefore = $('tool-before').value;
    	var record = {id:-1, tool_id: toolId, tool: toolName, before: toolBefore, remark: ''};
    			//network_name: nName, network_unit: nUnit, ampur: ampur, province: province};        
        SR.toolTable.datatable.addRow(record);
    	$('tool-before').value = '';
    });
}

function initNetworkTable(ref_id) {
	var networkTable = new function(){
        this.coldefs =
            [//{key:"network_name", label:"ชื่อเครือข่าย", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"refer_date", label:"ว.ด.ป.ที่ส่งต่อ", width:80},
             //{key:"network_unit", label:"ชื่อหน่วยงาน", width:200, editor: new YAHOO.widget.TextareaCellEditor()},
             //{key:"ampur", label:"อำเภอ", width:80, editor: new YAHOO.widget.TextareaCellEditor()},
             //{key:"province", label:"จังหวัด", width:80, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (ref_id==null)
            ref_id = -1;
        this.query = "refer_id=" + ref_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_refer_networks?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", 
                        //"network_name", "network_unit", "ampur", "province", 
                        "refer_date"]}});
        
        this.datatable = new YAHOO.widget.DataTable("network-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px", width:"200px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1) {
        		SR.editNetworks.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delNetworks,
        				"ต้องการลบข้อมูลวันที่ส่งต่อ: " + rec.getData("refer_date"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return networkTable;
}

function initToolTable(ref_id) {
	var toolTable = new function(){
        this.coldefs =
            [{key:"tool", label:"ชื่อเครื่องมือ", width:150},
             {key:"remark", label:"หมายเหตุ", width:150, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"before", label:"คะแนนวันที่รับรักษา", width:80, editor: new YAHOO.widget.TextboxCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"tool_id", hidden: true},
             {key:"id", hidden: true}];
        if (ref_id==null)
            ref_id = -1;
        this.query = "refer_id=" + ref_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/zone/get_refer_tools?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id", "tool_id",
                        "tool", "remark", "before"]}});
        
        this.datatable = new YAHOO.widget.DataTable("tool-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px", width:"550px",
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