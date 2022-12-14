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

function initComponents(){
    SR.stationOpd = $('station-opd').value;
    SR.stationIpd = $('station-ipd').value;
    SR.stationDental = $('station-dental').value;
    SR.stationAlternative = $('station-alternative').value;
	resetArray();
    initButtons();
    SR.stationTable = initStationTable();
    SR.dlgWait = getWaitDialog();
}

function resetArray() {
    SR.stations = new Array();
    SR.delStations = new Array();
    SR.editStations = [];
}

function initButtons() {
    
    SR.btnBack = new YAHOO.widget.Button("btnBack");
    SR.btnBack.addListener("click", function(e) {        
        window.location = "${h.url_for('/finance/setup_main')}";
    });
    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {        
        //this.set("disabled", true);
    	SR.mode = 1;
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        newRec = {'id':-1, 'name':'', 'ip':'', 'type':SR.stationOpd};
        SR.stationTable.datatable.addRow(newRec, 0);
        SR.stationTable.datatable.configs.paginator.setPage(1);
        SR.stationTable.datatable.unselectAllRows();
        SR.stationTable.datatable.selectRow(0);
        /*var oTr = SR.stationTable.datatable.getLastTrEl();
        var oRecord = SR.stationTable.datatable.getRecord(oTr);
        var oColumn = SR.stationTable.datatable.getColumn("name");
        var cell = SR.stationTable.datatable.getTdEl({record:oRecord, column:oColumn});
        SR.stationTable.datatable.showCellEditor(cell, oRecord, oColumn);
        */
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
    	SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        SR.stationTable.datatable.render();
    });

    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
        	SR.stationTable = initStationTable();
        	/*SR.stationTable.datasource.sendRequest("", {
                success:SR.stationTable.datatable.onDataReturnInitializeTable,
                failure:SR.stationTable.datatable.onDataReturnInitializeTable,
                scope:SR.stationTable.datatable
            });*/
            resetArray();
            SR.btnAdd.set("disabled", false);
            SR.btnEdit.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
            showMessageDialog("Info", 'บันทึกเรียบร้อย', YAHOO.widget.SimpleDialog.ICON_INFO);
            SR.mode = 0;

            var url_redirect = "${h.url_for('/finance')}?id_sess=" + $('id_sess').value;
            
            parent.redirectPage(url_redirect);
            
        };
        
        var responseFailure = function(o) {
        	SR.dlgWait.hide();
            showMessageDialog("Error", 'บันทึกไม่สำเร็จ: ' + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
        };
        
        var callback = {
            success: responseSuccess,
            failure: responseFailure
        };
        
        SR.dlgWait.show();
        var recs = SR.stationTable.datatable.getRecordSet().getRecords();
        SR.stations.length = 0;
        
        if (SR.mode == 1) {
	        
	        for (var i = 0; i < recs.length; i++) {
		        
	        	if (recs[i].getData("id") == -1)
	        		SR.stations.push(recs[i]._oData);
	        }
        } 
        else {
	        
	        for (var i = 0; i < SR.editStations.length; i++) {
		        
	        	var rec = SR.stationTable.datatable.getRecord(SR.editStations[i]);
	        	if (rec == null) continue;
	        	SR.stations.push(rec._oData);
	        }
        }
        
        var jStation = YAHOO.lang.JSON.stringify(SR.stations);
        var dStation = document.getElementById("stations");
        	dStation.value = jStation;
        var jDelStation = YAHOO.lang.JSON.stringify(SR.delStations);
        var dDelStation = document.getElementById("del-stations");
        	dDelStation.value = jDelStation; 
        
        var formObject = document.getElementById('form');
        	YAHOO.util.Connect.setForm(formObject);     
        	   
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/save_station')}", callback);
    });
    
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	SR.stationTable = initStationTable();
    	/*SR.stationTable.datasource.sendRequest("", {
            success:SR.stationTable.datatable.onDataReturnInitializeTable,
            failure:SR.stationTable.datatable.onDataReturnInitializeTable,
            scope:SR.stationTable.datatable
        });*/
    	this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        
        SR.mode = 0;
        resetArray();
    });
}

function initStationTable() {
	var stationTable = new function(){
        this.coldefs =
            [{key:"id", label:"รหัส", hidden:true},
             {key:"name", label:"ชื่อเครื่องเก็บเงิน", sortable:true, minWidth:300,  
            	editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
             {key:"ip", label:"IP",
            	 editor:new YAHOO.widget.TextboxCellEditor({disableBtns:true})
             },
        	 {key:"type", label:"ประเภท",
            	 editor:new YAHOO.widget.DropdownCellEditor({
            		 dropdownOptions:[
        		 		SR.stationOpd,
        		 		SR.stationIpd,
        		 		SR.stationDental,
        		 		SR.stationAlternative
        	 		 ],disableBtns:true})
        	 },
             {key:"del", label:"", formatter: delPainter}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_stations?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"stations",
                fields:["id", "name", "ip", "type"]}});
        
        this.datatable = new YAHOO.widget.DataTable("station-table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"300px",
        	paginator:getPaginator(10, 5),
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	
        	if (SR.mode == 1) {
		    	if (rec.getData("id") != -1)
		    		return;
		    	if (col.key == "del") {
	        		confirmDelete(this, rec, SR.delStations,
	        				"ต้องการลบข้อมูลเครื่องเก็บเงิน: " + rec.getData("name"));
	        	}
        	}
        	if (SR.mode == 2) {
        		if (col.key == "del") {
            		confirmDelete(this, rec, SR.delStations,
            				"ต้องการลบข้อมูลเครื่องเก็บเงิน: " + rec.getData("name"));
            	} else {
            		SR.editStations.push(rec.getId());
            	}
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    

    return stationTable;
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

