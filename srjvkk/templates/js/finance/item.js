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

function reloadPage(paId) {
	$('pa_id').value = paId;
	SR.currentPatientId = paId;
    SR.table.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
        success : SR.table.datatable.onDataReturnInitializeTable,
        failure : SR.table.datatable.onDataReturnInitializeTable,
        scope : SR.table.datatable
    });
}

function initComponents(){
	var paId = $('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    SR.currentPatientId = paId;
    
    //SR.currentVnId = vnId;
    //SR.qcalled = qcalled;
    
    SR.table = initTable();
    
    //initMenu();
    
    
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

function initTable() {
    var table = new function() {
        this.coldefs =
            [
             {key:"vn", label:"เลขที่ visit", formatter:linkFormatter},
             {key:"time_add", label:"วันที่รับบริการ", formatter:dateFormatter},
             //{key:"patient_type", label:"ประเภทผู้ป่วย"},
             {key:"privilege", label:"สิทธิ์"},
             {key:"id", hidden:true}];
        this.query = "pa_id=" + SR.currentPatientId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_print_items')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"restores",
                fields:["id","vn", {key:"time_add", parser:parseDate}, 
                        "privilege", "patient_type"]}});
        this.datatable = new YAHOO.widget.DataTable("item_history",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"400px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
        this.handleClicked = function(oArgs, arg2){
            var row = table.datatable.getRow(oArgs.target);
            table.datatable.unselectAllRows();
            table.datatable.selectRow(row);

        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        
    }
    return table;
}

function linkFormatter(elCell, oRecord, oColumn, oData) {
	var url = "${h.url_for('/financereport/print_items_view')}" + 
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

    

