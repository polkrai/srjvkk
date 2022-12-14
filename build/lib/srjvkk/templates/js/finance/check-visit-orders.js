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
        showMessageDialog("Error", "ไม่สามารถดึงโปรแกรมจาก server ได้สำเร็จ กรุณาลองใหม่อีกครั้ง",
        		YAHOO.widget.SimpleDialog.ICON_ERROR);
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
SR.n = 0;
SR.i = 0;

function reloadPage(paId) {
	
}

function initComponents(){
	
	initMenu();
	initButtons();
    SR.table = initTable();
    SR.dlgWait = getWaitDialog();
    
}

function resetArray() {
    SR.data = new Array();
    SR.delData = new Array();
    SR.editData = [];
}

function initButtons() {
	SR.btnShow = new YAHOO.widget.Button("btnShow");
    SR.btnShow.addListener("click", function(e) {        
    	searchVisits();
    });
    
    SR.btnAdd = new YAHOO.widget.Button("btnAddVisitOrder");
    SR.btnAdd.addListener("click", function(e) {
    	SR.dlgWait.show();
    	SR.recs = SR.table.datatable.getRecordSet().getRecords();
    	SR.n = SR.recs.length;
    	SR.i = 0;
    	makeServiceChargeOrder();
        
    });
}

SR.responseSuccess = function(o) {
	if (SR.i < SR.n) {
		makeServiceChargeOrder();
	} else {
		searchVisits();
		SR.dlgWait.hide();
		showMessageDialog("Info", 'บันทึกเรียบร้อย',
    		YAHOO.widget.SimpleDialog.ICON_INFO);
	}
};
SR.responseFailure = function(o) {
	SR.dlgWait.hide();
    showMessageDialog("Error", 'บันทึกไม่สำเร็จ: ' + o.statusText,
    		YAHOO.widget.SimpleDialog.ICON_BLOCK);
};
SR.callback =
{
    success: SR.responseSuccess,
    failure: SR.responseFailure
};

function makeServiceChargeOrder() {
	if (SR.i >= SR.n) {
		SR.dlgWait.hide();
		return;
	}
	if (SR.recs[SR.i].getData("selected")) {
		var vnId = SR.recs[SR.i].getData("id");
		document.getElementById('vn_id').value = vnId;
		var formObject = document.getElementById('form');
	    YAHOO.util.Connect.setForm(formObject);        
	    var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/make_service_charge_order')}", SR.callback);
	    SR.i++;
	} else {
		SR.i++;
		makeServiceChargeOrder();
	}
    
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

function searchVisits() {
	SR.table.datasource.sendRequest("", {
        success : SR.table.datatable.onDataReturnInitializeTable,
        failure : SR.table.datatable.onDataReturnInitializeTable,
        scope : SR.table.datatable
    });
}

function initTable() {
    var table = new function() {
        this.coldefs =
            [{key:"selected", label:"เลือก", width:50,
                formatter:YAHOO.widget.DataTable.formatCheckbox},
             {key:"vn", label:"เลขที่ visit", formatter:linkFormatter},
             {key:"time_add", label:"วันที่รับบริการ", formatter:dateFormatter},
             {key:"hn", label:"HN"},
             {key:"name", label:"ชื่อ-สกุล"},
             {key:"id", hidden:true}];
        this.query = "";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_visit_orders')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"data",
                fields:["id","vn", {key:"time_add", parser:parseDate}, 
                        "hn", "name"]}});
        this.datatable = new YAHOO.widget.DataTable("visit-table",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"400px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
        this.handleClicked = function(oArgs, arg2){
            var row = table.datatable.getRow(oArgs.target);
            table.datatable.unselectAllRows();
            table.datatable.selectRow(row);

        };
        
        this.handleCheckboxClicked = function(oArgs) {
            var elCheckbox = oArgs.target;
            newValue = elCheckbox.checked;
            record = this.getRecord(elCheckbox);
            column = this.getColumn(elCheckbox);
            record.setData(column.key, newValue);
        }
        this.datatable.subscribe("checkboxClickEvent", this.handleCheckboxClicked);
        
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        
    }
    return table;
}

function linkFormatter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/financereport/print_lab_view')}" + 
		"?vn_id=" + oRecord.getData("id");
	elCell.innerHTML = "<a href='" + url +"'>" + oData + "</a>";
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

    

