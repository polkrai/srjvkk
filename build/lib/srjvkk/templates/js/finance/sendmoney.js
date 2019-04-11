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

function initComponents(){
	initButtons();
    initMenu();
    $('startDate').value = getDateString(new Date(), true);
    $('endDate').value = getDateString(new Date(), true);
    SR.stationId = $('station_id').value;
	SR.sendMoneyItemTable = initSendMoneyItemTable();
    SR.sendMoneyTable = initSendMoneyTable();
}

function initMenu() {
	SR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {
		iframe:true
	});
	SR.toolbar.render()
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){
		var pos = Dom.getXY($('toolbar_pane'));
		Dom.setXY($('toolbar_pane'),[pos.X,window.scrollY]);
    });
}

function searchSendMoney() {
	var startDate = $('startDate').value;
	var endDate = $('endDate').value;
	
	SR.sendMoneyTable.datasource.sendRequest("start_date=" + startDate +
		"&end_date=" + endDate + "&station_id=" + SR.stationId, {
        success : SR.sendMoneyTable.datatable.onDataReturnInitializeTable,
        failure : SR.sendMoneyTable.datatable.onDataReturnInitializeTable,
        scope : SR.sendMoneyTable.datatable
    });
	
}

function sendMoney() {
	confirmDialog("นำส่งเงิน", "ยืนยันการนำส่งเงิน",
		function() {
			var url = "${h.url_for('/finance/send_money')}";
			var callback = {
				success:function(o) {
					searchSendMoney();
				},
			    failure:function(o) {
					showMessageDialog("Error", 'ไม่สามารถเชื่อมต่อกับ Server ได้ : ' + o.statusText,
							YAHOO.widget.SimpleDialog.ICON_ERROR);
				}
			};
			var params = "station_id=" + SR.stationId;
			ajaxRequest('POST', url, callback, params);
	        this.hide();
		},
		function() {
			this.hide();
		}
	);
	
	
}

function initButtons() {
	SR.btnSearch = new YAHOO.widget.Button("btnSearch");
	SR.btnSearch.addListener("click", function() {
		searchSendMoney();
	});
	
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
	SR.btnPrint.addListener("click", function() {
		var rows = SR.sendMoneyTable.datatable.getSelectedRows();
		if (rows.length == 0)  {
			showMessageDialog("Warn", 'กรุณาเลืิอกใบนำส่งที่ต้องการพิมพ์', YAHOO.widget.SimpleDialog.ICON_WARN);
			return;
		}
		if (parent.setWorking) {
        	parent.setWorking(false);
        }
		var rec = SR.sendMoneyTable.datatable.getRecord(rows[0]);
		confirmDialog("พิมพ์ใบนำส่ง", "ต้องการพิมพ์ใบนำส่ง เลขที่ " + rec.getData("id"),
				function() {
//					window.open("${h.url_for('/financereport/print_send_money?send_id=')}" + rec.getData("id"), 
//							'sendmoneywindow');
					$('frmprint').src = "${h.url_for('/financereport/print_send_money?send_id=')}" + rec.getData("id");
    		        this.hide();
				},
				function() {
					this.hide();
				}
		)
	});
	
    SR.btnSendMoney = new YAHOO.widget.Button("btnSendMoney");
    SR.btnSendMoney.addListener("click", function(){
    	sendMoney();
    });
    
    SR.calStartDate = initCalendar("calStartDate", "conStartDate", "btnStartDate", "startDate");
    SR.btnStartDate = new YAHOO.widget.Button("btnStartDate");
    SR.btnStartDate.addListener("click", function(e) {
        SR.calStartDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    $('startDate').readOnly = true;
    Dom.setStyle('startDate', 'background-color', 'lightyellow');
    SR.calEndDate = initCalendar("calEndDate", "conEndDate", "btnEndDate", "endDate");
    SR.btnEndDate = new YAHOO.widget.Button("btnEndDate");
    SR.btnEndDate.addListener("click", function(e) {
        SR.calEndDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    $('endDate').readOnly = true;
    Dom.setStyle('endDate', 'background-color', 'lightyellow');
    
}

function initSendMoneyTable() {
    var sendMoneyTable = new function() {
        this.coldefs =
            [{key:"id", label:"เลขที่"},
             {key:"senddate", label:"วันที่นำส่ง", formatter:dateFormatter},
             {key:"sendtime", label:"เวลาที่นำส่ง"},
             {key:"patient_count", label:"จำนวนผู้ป่วย"},
             {key:"amount", label:"จำนวนเงิน", formatter:numberFormatter, className:'dt-number'},
             {key:"start_receipt", label:"ใบเสร็จเริ่มต้น"},
             {key:"end_receipt", label:"ใบเสร็จสุดท้าย"}];
        this.query = "start_date=" + $('startDate').value + 
        	"&end_date=" + $('endDate').value + "&station_id=" + SR.stationId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_send_moneys')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"send_money",
                fields:[{key:"senddate", parser:parseDate}, "sendtime", "amount", "id",
                        "start_receipt", "end_receipt", "patient_count"]}});
        this.datatable = new YAHOO.widget.DataTable("sendMoneyTable",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"100px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
        this.handleClicked = function(oArgs, arg2){
            var row = sendMoneyTable.datatable.getRow(oArgs.target);
            sendMoneyTable.datatable.unselectAllRows();
            sendMoneyTable.datatable.selectRow(row);

        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        
        this.handleRowSelected = function (oArgs) {
            var rid = oArgs.record.getData("id");
            var vcs = SR.sendMoneyItemTable.datasource;
            var vct = SR.sendMoneyItemTable.datatable;
            var oCallback = {
                success : vct.onDataReturnInitializeTable,
                failure : vct.onDataReturnInitializeTable,
                scope : vct
            };
            vcs.sendRequest("send_id=" + rid, oCallback);
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
        
        this.handleInit = function () {
            if (this.getRecordSet().getRecords().length > 0) {
                this.selectRow(0);
            } else {
                SR.sendMoneyItemTable.datasource.sendRequest("send_id=-1", {
                    success:SR.sendMoneyItemTable.datatable.onDataReturnInitializeTable,
                    failure:SR.sendMoneyItemTable.datatable.onDataReturnInitializeTable,
                    scope:SR.sendMoneyItemTable.datatable
                })
            }
        }
        this.datatable.subscribe("initEvent", this.handleInit);
    }
    return sendMoneyTable;
}

function initSendMoneyItemTable() {
    var itemTable = new function() {
        this.coldefs =
        [{key:"item", label:"รายการค่าใช้จ่าย", resizeable:true},
        {key:"amount", label:"จำนวนเงิน",formatter:numberFormatter, className:'dt-number'}
        ];
        //if (receiptHId==null)
        //    receiptHId = -1;
        this.query = "send_id=-1";
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/get_send_money_items')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"items",
                fields:["item", "amount"]}});
        this.datatable = new YAHOO.widget.DataTable("sendMoneyItemTable",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"100px",
                initialRequest:this.query});
    }
    return itemTable;
}

function showMessageDialog(header, msg, icon) {
	if (parent != self && parent.showMessageDialog) {
		parent.showMessageDialog(header, msg, icon);
	} else {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

    

