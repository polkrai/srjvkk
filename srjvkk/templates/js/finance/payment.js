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
SR.checkPayment = false;
SR.an = null;

function reloadPage(vnId, paId, qcalled, stationId, an) {
	SR.btnPayCharge.set('disabled', true);
	SR.dlgWait.show();
	$('pa_id').value = paId;
	$('vn_id').value = vnId;
	$('dvn_id').value = vnId;
	$('qcalled').value = qcalled;
	$('station_id').value = stationId;
	$('dstation_id').value = stationId;
	if (an == '')
		SR.an = null;
	else
		SR.an = an;
	SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    SR.currentPatientId = paId;
    SR.stationId = stationId;
    var oCallback = {
        success : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
        failure : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
        scope : SR.patientPaymentTable.datatable
    };
    SR.patientPaymentTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, oCallback);

    //getPatientSupport();
    //getPatientDeposit();
}

function initComponents(){
	var paId = $('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    SR.currentPatientId = paId;
    var qcalled = $('qcalled').value;
    if (qcalled.toLowerCase() == "true")
        qcalled = true;
    else
        qcalled = false;

    var vnId = $('vn_id').value;
    if (vnId == undefined || vnId == '')
    	vnId = -1;

    var editable = $('editable').value;
    if (editable.toLowerCase() == "true")
    	editable = true;
    else
    	editable = false;
    if (parent && parent.SR && parent.SR.dlgWait) {
    	SR.dlgWait = parent.SR.dlgWait;
    } else {
    	SR.dlgWait = getWaitDialog();
    }
    SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    SR.editable = editable
    SR.checkPayment = !editable;
    SR.stationId = $('station_id').value;
    initPaymentButtons();
    SR.payDialog = initDialog();
    SR.dlgDeposit = initDialogDeposit();
	//
    SR.visitChargeTable = initVisitChargeTable();
    SR.patientPaymentTable = initPatientPaymentTable();
    //getPatientSupport();
    //getPatientDeposit();
    initMenu();
    Event.addListener('txt-discount', "keypress", checkEnter);
    Event.addListener('txt-discount', 'focus', selectText);
    Event.addListener('receiveamount', 'focus', selectText);
}

function selectText(e) {
	e.target.select();
}

function checkEnter(e) {
	var keynum;
	if(window.event) // IE
	{
		keynum = e.keyCode;
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which;
	}
	if (keynum == 13) {

		var value = e.target.value.replace(',','');
		value = parseFloat(value);
		$('discount').value = value;
		e.target.value = formatNumber(value)
		if (e.target.value == "NaN") {
			e.target.value = "0.00";
			$('discount').value = 0;
		}

		refreshTotals();
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

function confirmPrivilege(autoSend) {
	parent.confirmDialog("ชำระโดยใช้สิทธิ์", "ยืนยันการชำระโดยใช้สิทธิ์",
		function() {
    		var callback =
    		{
    			success: function(o) {
        	        SR.patientPaymentTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
        	        	success : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
        	            failure : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
        	            scope : SR.patientPaymentTable.datatable
        	        });
        	        parent.frmhistory.SR.paymentHistoryTable.datasource.
        	        	sendRequest("pa_id=" + SR.currentPatientId, {
        	        		success : parent.frmhistory.SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
	        	            failure : parent.frmhistory.SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
	        	            scope : parent.frmhistory.SR.paymentHistoryTable.datatable
        	        	});
        	        parent.frmipdsummary.reloadPage(SR.currentVnId, SR.currentPatientId);
        	        //getPatientDeposit();
        	        //getPatientSupport();
        	        $('discount').value = 0;
        	        $('txt-discount').value = '0.00';
        	        SR.dlgWait.hide();
        	        if (autoSend && parent != self && parent.SR) {
        	        	var callback =
        	    	    {
        	    	        success: function (o) {
        	    	            //alert(o.responseText);
        	    	    		parent.SR.dlgWait.hide();
        	    	            var result = YAHOO.lang.JSON.parse(o.responseText);
        	    	            if (result["Error"] != undefined) {
        	    	                showMessageDialog("Error", "ไม่สามารถเรียกคิวได้ : " + result["Error"],
        	    	                		YAHOO.widget.SimpleDialog.ICON_ERROR);
        	    	                return;
        	    	            }
        	    	            parent.SR.workingWithCurrentQ = true;
        	    	            parent.SR.btnCallQueue.set("disabled", true);
        	    	            parent.SR.btnSendQueue.set("disabled", false);
        	    	            parent.SR.btnSendBack.set("disabled", false);
        	    	            parent.SR.dlgAllowedSendQueue.show();
        	    	        },
        	    	        failure: function (o) {
        	    	        	parent.SR.dlgWait.hide();
        	    	            showMessageDialog("Error", "เรียกคิวไม่สำเร็จ: " + o.statusText,
        	    	            		YAHOO.widget.SimpleDialog.ICON_ERROR);
        	    	        }
        	    	    };
        	    		parent.callQueue(callback);
        	        }
    			},
				failure: function(o) {
    				SR.dlgWait.hide();
    				showMessageDialog("Error", 'ไม่สามารถชำระเงินได้ ' + o.status,
    						YAHOO.widget.SimpleDialog.ICON_BLOCK);
    			}
    		};
    		SR.dlgWait.show();
    		YAHOO.util.Connect.setForm($('form-payment'));
    		var cObj = YAHOO.util.Connect.asyncRequest('POST',
    				"${h.url_for('/finance/submit_payment')}", callback);
	        this.hide();
		},
		function() {
			this.hide();
		}
	);
}

function makePayment(checkQ, autoSend) {

	if (checkQ && (SR.currentPatientId == -1 || !SR.qcalled)) {
        showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
        return;
    }
	if (SR.stationId == -1) {
		showMessageDialog("Warn", "ไม่ใช่เครื่องเก็บเงิน ไม่สามารถรับชำระได้", YAHOO.widget.SimpleDialog.ICON_WARN);
		return;
	}

	var dt = SR.patientPaymentTable.datatable;
    var rcset = dt.getRecordSet();
    var rcs = rcset.getRecords();
    var orders = [];
    for (var i = 0; i < rcs.length; i++) {
        if(rcs[i].getData("selected") == true){
            orders.push(rcs[i].getData("id"));
        }
    }
    if (orders.length == 0) {
    	if (checkQ) {
    		showMessageDialog("Warn", 'กรุณาเลือกรายการที่ต้องการชำระ', YAHOO.widget.SimpleDialog.ICON_WARN);
    	}
    	return;
    }
    if (parent.setWorking) {
    	parent.setWorking(false);
    }
    $('receiveamount').value = '0.00';
    $('changeamount').value = '0.00';
    var jsonStr = YAHOO.lang.JSON.stringify(orders);
	$('orders').value = jsonStr;
	
    if ($('txt-remain').value == 0) {

    	confirmPrivilege(autoSend);
	} 
	else {

    	SR.payDialog.show();
    }
}

function initPaymentButtons() {
    SR.btnPayCharge = new YAHOO.widget.Button("btn_paycharge");
    SR.btnPayCharge.set('disabled', true);
    SR.btnPayCharge.addListener("click", function(){
    	makePayment(true, false);
    });

    SR.btnDeposit = new YAHOO.widget.Button("btnDeposit");
    SR.btnDeposit.addListener("click", function(){
    	if (SR.currentPatientId == -1 || !SR.qcalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
    	if (SR.stationId == -1) {
    		showMessageDialog("Warn", "ไม่ใช่เครื่องเก็บเงิน ไม่สามารถรับชำระได้",
    				YAHOO.widget.SimpleDialog.ICON_WARN);
    		return;
    	}
    	SR.dlgDeposit.show();
    });


    SR.btnCheck = new YAHOO.widget.Button("btnCheck", {label:"ตรวจสอบค่าใช้จ่าย"});
    SR.btnCheck.addListener("click", function() {
    	if (SR.btnCheck.get('checked')) {
    		SR.checkPayment = true;
    		SR.btnPayCharge.set('disabled', true);
    		SR.btnLeave.set('disabled', true);
    		reloadPage(SR.currentVnId, SR.currentPatientId, SR.qcalled, SR.stationId, SR.an);
    	} else {
    		SR.checkPayment = false;
    		SR.btnPayCharge.set('disabled', false);
    		SR.btnLeave.set('disabled', false);
    		reloadPage(SR.currentVnId, SR.currentPatientId, SR.qcalled, SR.stationId, SR.an);
    	}
    });

    SR.btnLeave = new YAHOO.widget.Button("btnLeave");
    SR.btnLeave.addListener("click", function(){
    	if (SR.currentPatientId == -1 || !SR.qcalled) {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
    	if (SR.stationId == -1) {
    		showMessageDialog("Warn", "ไม่ใช่เครื่องเก็บเงิน ไม่สามารถรับชำระได้",
    				YAHOO.widget.SimpleDialog.ICON_WARN);
    		return;
    	}

    	var dt = SR.patientPaymentTable.datatable;
        var rcset = dt.getRecordSet();
        var rcs = rcset.getRecords();
        var orders = [];
        for (var i = 0; i < rcs.length; i++) {
            if(rcs[i].getData("selected") == true){
                orders.push(rcs[i].getData("id"));
            }
        }
        if (orders.length == 0) {
        	if (checkQ) {
        		showMessageDialog("Warn", 'กรุณาเลือกรายการที่ต้องการชำระ',
        			YAHOO.widget.SimpleDialog.ICON_WARN);
        	}
        	return;
        }
        if (parent.setWorking) {
        	parent.setWorking(false);
        }
        jsOrder = YAHOO.lang.JSON.stringify(orders);
        confirmDialog("ไม่ชำระ", "ยืนยันคนไข้ไม่มาชำระรายการที่เลือก",
    		function() {
        		var callback =
        		{
        			success: function(o) {
            	        SR.dlgWait.hide();
            	        SR.patientPaymentTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
            	            success : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
            	            failure : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
            	            scope : SR.patientPaymentTable.datatable
            	        });
            	        SR.visitChargeTable.datatable.deleteRows(0,
            	        		SR.visitChargeTable.datatable.getRecordSet().getLength());
        			},
    				failure: function(o) {
        				SR.dlgWait.hide();
        				showMessageDialog("Error", 'ไม่สามารถดำเนินการได้ ' + o.status,
        						YAHOO.widget.SimpleDialog.ICON_BLOCK);
        			}
        		};
        		SR.dlgWait.show();
        		ajaxRequest('POST',
        				"${h.url_for('/finance/mark_patient_leave')}", callback,
        				"orders=" + jsOrder);
    	        this.hide();
    		},
    		function() {
    			this.hide();
    		}
    	);
    });
}

function refreshTotals() {
	var dtOrder = SR.patientPaymentTable.datatable;
	var dtRecord = SR.visitChargeTable.datatable;
	var elTotalRecord = $('td-record');
	var totalRecord = 0;
	var totalSubsidy = 0;
	var totalRemain = 0;
	var totalSelect = 0;
	var totalSupport = parseFloat($('support-amount').value);
	var discount = parseFloat($('discount').value);
	var deposit = parseFloat(parseNumber($('txt-deposit').value));
	var i, rec, len = dtOrder.getRecordSet().getLength();
	for (i = 0;i < len;i++) {
		rec = dtOrder.getRecord(i);
		totalRecord += rec.getData('record_amount');
		/*if (rec.getData("selected")) {
			totalSelect += rec.getData('record_amount');
		}*/
	}

	var recs = dtRecord.getRecordSet().getRecords();
	for (var i = 0; i < recs.length; i++) {
		totalSelect += recs[i].getData('totalprice');
		totalSubsidy += recs[i].getData("subsidy_amount");
	}
	elTotalRecord.innerHTML = formatNumber(totalRecord);
	$('txt-record').value = formatNumber(totalRecord);
	$('txt-select').value = formatNumber(totalSelect);

	if (SR.editable) {
		totalRemain = totalSelect - totalSubsidy - totalSupport - discount - deposit;
	} else {
		totalRemain = totalRecord - totalSubsidy - totalSupport - discount - deposit;
	}
	if (totalRemain < 0) {
		var newdeposit = deposit + totalRemain;
		if (newdeposit > deposit) {
			newdeposit = deposit;
		}
		if (newdeposit < 0) {
			newdeposit = 0;
		}
		$('deposit').value = newdeposit;
		totalRemain = 0;
	}

	//totalRemain = Math.ceil(totalRemain);

	totalRemain = parseFloat(totalRemain).toFixed(2);

	$('txt-remain').value = formatNumber(totalRemain);
	$('totalamount').value = formatNumber(totalRemain);
	$('subsidy-amount').value = totalSubsidy;
	$('txt-subsidy').value = formatNumber(totalSubsidy);
	dtOrder.validateColumnWidths();
	if (parent != self && parent.setPayAmount) {
		parent.setPayAmount(totalRemain);
	}
	if (totalRemain == 0 && len > 0 && parent != self && parent.callQueue &&
			parent.SR.checkPayment && !SR.checkPayment && SR.an == null) {
		makePayment(false, true);
		parent.SR.checkPayment = false;
	}
};

function initPatientPaymentTable() {
    var paymentTable = new function() {
        this.coldefs =
            [{key:"selected", label:"เลือกจ่าย", width:50,
                formatter:YAHOO.widget.DataTable.formatCheckbox,
                hidden:!SR.editable},
             {key:"id", label:"เลขที่ Order"},
             {key:"type", label:"ประเภท"},
//             {key:"vn", label:"เลขที่ visit", resizeable:true},
             {key:"order_date", label:"วันที่สั่ง Order", formatter:dateFormatter},
             {key:"record_amount", label:"จำนวนเงิน", formatter:numberFormatter, className:'dt-number'},
//			 {key:"subsidy_amount", label:"เบิกได้", formatter:numberFormatter, className:'dt-number'},
//			 {key:"remain_amount", label:"ค้างชำระ", formatter:numberFormatter, className:'dt-number'},
             {key:"stop", label:"ชำระได้", formatter:stopPainter}
             ];
        this.query = "pa_id=" + SR.currentPatientId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/unpaid_orders')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"orders",
                fields:["id", "vn", "vn_id", {key:"order_date",parser:parseDate}, "record_amount",
                        "subsidy_amount", "remain_amount", "stop", "type"]}});

        this.datatable = new YAHOO.widget.DataTable("patient_payment",
            this.coldefs, this.datasource,
            {scrollable:true, width:"100%", height:"200px",
                initialRequest:this.query});
        this.datatable.set("selectionMode","single");
        this.handleClicked = function(oArgs, arg2){
            var row = paymentTable.datatable.getRow(oArgs.target);
            paymentTable.datatable.unselectAllRows();
            paymentTable.datatable.selectRow(row);

        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);

        this.handleCheckboxClicked = function(oArgs) {
            var elCheckbox = oArgs.target;
            newValue = elCheckbox.checked;
            record = this.getRecord(elCheckbox);
            var stop = record.getData('stop');
            if (!SR.checkPayment && !stop) {
            	showMessageDialog("Warn", 'ไม่สามารถเลือกชำระใบสั่งที่ยังไม่สิ้นสุดได้',
            			YAHOO.widget.SimpleDialog.ICON_WARN);
            	elCheckbox.checked = !elCheckbox.checked;
            	return;
            }
            column = this.getColumn(elCheckbox);
            record.setData(column.key, newValue);

            var recs = this.getRecordSet().getRecords();
            var selectedOrders = [];
            for (var i = 0; i < recs.length; i++) {
            	if (recs[i].getData("selected")) {
            		selectedOrders.push(recs[i].getData("id"));
            	}
            }
            var jsonOrders = YAHOO.lang.JSON.stringify(selectedOrders);
            SR.visitChargeTable.datasource.sendRequest("orders=" + jsonOrders +
            		"&pa_id=" + SR.currentPatientId, {
                success:SR.visitChargeTable.handleLoaded,
                failure:SR.visitChargeTable.datatable.onDataReturnInitializeTable,
                scope:SR.visitChargeTable.datatable
            })
            //paymentTable.refreshTotals(this);
        }
        this.datatable.subscribe("checkboxClickEvent", this.handleCheckboxClicked);

        this.handleDataReturned = function(oArgs) {
        	var results = oArgs.response.results;
            var selectedOrders = [];
            for (var i = 0; i < results.length; i++) {
            	if (SR.checkPayment) {
            		selectedOrders.push(results[i].id);
            		if (SR.editable) {
                		results[i].selected = true;
                	}
            	} else {
	            	if (results[i].stop) {
	            		selectedOrders.push(results[i].id);
	            		if (SR.editable) {
	                		results[i].selected = true;
	                	}
	            	}
            	}
            }
            var jsonOrders = YAHOO.lang.JSON.stringify(selectedOrders);
            SR.visitChargeTable.datasource.sendRequest("orders=" + jsonOrders +
            		"&pa_id=" + SR.currentPatientId, {
                success:SR.visitChargeTable.handleLoaded,
                failure:SR.visitChargeTable.datatable.onDataReturnInitializeTable,
                scope:SR.visitChargeTable.datatable
            })
            //refreshTotals();
        };
        this.datatable.subscribe("dataReturnEvent", this.handleDataReturned);

        var tfoot = this.datatable.getTbodyEl().parentNode.createTFoot();
		var tr = tfoot.insertRow(-1);
		var th = tr.appendChild(document.createElement('th'));
		th.colSpan = 4;
		th.innerHTML = 'รวมค้างชำระ';
		var td = tr.insertCell(-1);
		td.className = 'number';
		td.id = 'td-record';
    }
    return paymentTable;
}

function initVisitChargeTable() {
    var visitChargeTable = new function() {
        this.coldefs =
            [//{key:"selected", label:"เลือกจ่าย", width:50,
             //   formatter:YAHOO.widget.DataTable.formatCheckbox},
             {key:"itemtype", label:"ประเภทรายการ", width: 100},
             {key:"item", label:"ชื่อรายการ", width:200, resizeable:true},
             {key:"qty", label:"จำนวน", width:50, formatter:numberFormatter, className:"dt-number"},
             {key:"unit", label:"หน่วย", width:100},
             {key:"totalprice", label:"จำนวนเงิน", width:70, formatter:numberFormatter, className:"dt-number"},
             {key:"subsidy_amount", label:"เบิกได้", formatter:numberFormatter, className:"dt-number"},
             {key:"day_qty", label:"จำนวนวันที่สั่ง", className:"dt-number"},
			 {key:"reason", label:"เหตุผลการสั่ง"}
             //{key:"paid", label:"จ่ายแล้ว", width:50, formatter: paidPainter}
             ];
        this.fielddefs = ["item", "item_id", "unit", "qty",
                          "price", "totalprice", "itemtype","subsidy_amount", "day_qty", "reason"];
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/finance/unpaid_records?')}",
            {connXhrMode: "cancelStaleRequest",
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"result.records",
                fields:this.fielddefs}});

        this.datatable = new YAHOO.widget.DataTable("visit_charge",
            this.coldefs, this.datasource,
            {initialRequest:"orders=[-1]&pa_id=-1",
             scrollable:true, width:"100%", height:"400px"});

        this.datatable.subscribe("dataReturnEvent", function(oArgs) {
        	if (!SR.checkPayment) {
        		SR.btnPayCharge.set('disabled', false);
        	}
        	SR.dlgWait.hide();
        });

        this.handleCheckBoxClicked = function(oArgs){
            var oRecord = this.getRecord(oArgs.target);
            oRecord.setData("selected", oArgs.target.checked);
            if(this.getRecord(oArgs.target).getData("paid")){
                oArgs.target.checked = false;
                return null;
            }
            /*else{
                if(oArgs.target.checked){
                    return this.onEventSelectRow(oArgs);
                }else{
                    return this.unselectRow(this.getRow(oArgs.target));
                }
            }*/
        };

        this.handleLoaded = function(oRequest, oResponse, oPayload){
            var result = this.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
            //var rcset = this.getRecordSet();
            //var rcs = rcset.getRecords();
//            for(var i = 0; i < rcs.length; i++){
//
//            }
            refreshTotals();
            return result;
        };

        this.datasource.doBeforeCallback = function(oRequest, oFullResponse, oParsedResponse, oCallback) {
        	$('support-id').value = oFullResponse.result.support_id;
        	$('support-amount').value = oFullResponse.result.support_amount;
        	$('txt-support').value = formatNumber(oFullResponse.result.support_amount);
        	$('deposit').value = oFullResponse.result.deposit;
        	$('txt-deposit').value = formatNumber(oFullResponse.result.deposit);
        	return oParsedResponse;
        };
        this.datatable.subscribe("checkboxClickEvent", this.handleCheckBoxClicked);
    }
    return visitChargeTable;
}

function initDialog() {
    // Define various event handlers for Dialog
	var handleSubmit = function() {
		this.submit();
	};
	var handleCancel = function() {
		this.cancel();
	};
	var handleSuccess = function(o) {
		//var result = YAHOO.lang.JSON.parse(o.responseText);
		//response = response.split("<!")[0];
		//document.getElementById("resp").innerHTML = response;

        // reload table.
		var receiptId = o.responseText;
		SR.dlgWait.hide();

		window.open("${h.url_for('/finance/print_receipt?receipt_id=')}" + receiptId, 'receiptwindow', 'width=650,height=700');

        SR.patientPaymentTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {

            success : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
            failure : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
            scope : SR.patientPaymentTable.datatable
        });

		SR.visitChargeTable.datatable.deleteRows(0, SR.visitChargeTable.datatable.getRecordSet().getLength());
		
        parent.frmhistory.SR.paymentHistoryTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
            success : parent.frmhistory.SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
            failure : parent.frmhistory.SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
            scope : parent.frmhistory.SR.paymentHistoryTable.datatable
        });

		parent.frmipdsummary.reloadPage(SR.currentVnId, SR.currentPatientId);
		
        $('txt-discount').value = '0.00';
        $('discount').value = 0;
        //getPatientDeposit();
        //getPatientSupport();
	};
	var handleFailure = function(o) {
		SR.dlgWait.hide();
		showMessageDialog("Error", "Submission failed: " + o.status, YAHOO.widget.SimpleDialog.ICON_BLOCK);
	};

	// Instantiate the Dialog
	var dialog = new YAHOO.widget.Dialog("dlg-receive",
							{ width : "30em",
							  fixedcenter : true,
							  visible : false,
							  constraintoviewport : true,
							  buttons : [ { text:"ชำระ", handler:handleSubmit, isDefault:true },
								      { text:"ยกเลิก", handler:handleCancel }]
							});

	// Validate the entries in the form to require that both first and last name are entered
	dialog.validate = function() {
		var data = this.getData();
		var receiveAmount = parseNumber(data.receiveamount);
		var totalAmount = parseNumber(data.totalamount);
		if (receiveAmount < totalAmount) {
			showMessageDialog("Error", "จำนวนเงินไม่ถูกต้อง", YAHOO.widget.SimpleDialog.ICON_BLOCK);
			return false;
		} else {
			SR.dlgWait.show();
			return true;
		}
	};

	dialog.showEvent.subscribe(function() {
		$('receiveamount').focus();
		$('receiveamount').select();
	})

	// Wire up the success and failure handlers
	dialog.callback = { success: handleSuccess,
						     failure: handleFailure };

	// Render the Dialog
	dialog.render();
    return dialog;
}

function initDialogDeposit() {
    // Define various event handlers for Dialog
	var handleSubmit = function() {
		this.submit();
	};
	var handleCancel = function() {
		this.cancel();
	};

	var handleSuccess = function(o) {
		//var result = YAHOO.lang.JSON.parse(o.responseText);
		//response = response.split("<!")[0];
		//document.getElementById("resp").innerHTML = response;

        // reload table.
		var receiptId = o.responseText;
		//SR.dlgWait.hide();
		window.open("${h.url_for('/finance/print_receipt?receipt_id=')}" + receiptId,
				'receiptwindow', 'width=650,height=700');
        //getPatientDeposit();
        parent.frmhistory.SR.paymentHistoryTable.datasource.
	    	sendRequest("pa_id=" + SR.currentPatientId, {
	        success : parent.frmhistory.SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
	        failure : parent.frmhistory.SR.paymentHistoryTable.datatable.onDataReturnInitializeTable,
	        scope : parent.frmhistory.SR.paymentHistoryTable.datatable
	    });
        SR.patientPaymentTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
            success : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
            failure : SR.patientPaymentTable.datatable.onDataReturnInitializeTable,
            scope : SR.patientPaymentTable.datatable
        });
	};
	var handleFailure = function(o) {
		SR.dlgWait.hide();
		showMessageDialog("Error", "Submission failed: " + o.status,
				YAHOO.widget.SimpleDialog.ICON_BLOCK);
	};

	// Instantiate the Dialog
	var dialog = new YAHOO.widget.Dialog("dlg-deposit",
							{ width : "30em",
							  fixedcenter : true,
							  visible : false,
							  constraintoviewport : true,
							  buttons : [{text:"ชำระ", handler:handleSubmit, isDefault:true, },
										 {text:"ยกเลิก", handler:handleCancel}]
							});

	// Validate the entries in the form to require that both first and last name are entered
	dialog.validate = function() {

		var data = this.getData();
		var deposit = parseNumber(data.depositamount)

		if (!YAHOO.lang.isNumber(deposit) || deposit <= 0) {

			showMessageDialog("Error", "จำนวนเงินไม่ถูกต้อง", YAHOO.widget.SimpleDialog.ICON_BLOCK);
			
			return false;
		} 
		else {

			SR.dlgWait.show();

			return true;
		}
	};

	dialog.showEvent.subscribe(function() {
		$('depositamount').focus();
		$('depositamount').select();
	})

	// Wire up the success and failure handlers
	dialog.callback = { success: handleSuccess,
						     failure: handleFailure };

	// Render the Dialog
	dialog.render();
    return dialog;
}

function getPatientDeposit() {
	var callback =
    {
        	success:function(o) {
				$('deposit').value = o.responseText;
				$('txt-deposit').value = formatNumber(o.responseText);
			},
        	failure:function(o) {
				showMessageDialog("Error", "ไม่สามารถอ่านค่ามัดจำได้", o.status,
						YAHOO.widget.SimpleDialog.ICON_BLOCK);
			},
        	scope: this
    };
	ajaxRequest('POST', "${h.url_for('/finance/get_patient_deposit')}", callback,
			"pa_id=" + SR.currentPatientId);
}

function getPatientSupport() {
    var AjaxObject = {

    	handleSuccess:function(o){
    		// This member handles the success response
    		// and passes the response object o to AjaxObject's
    		// processResult member.
    		this.processResult(o);
    	},

    	handleFailure:function(o){
    		// Failure handler
    	},

    	processResult:function(o){
    		// This member is called by handleSuccess
            var result = YAHOO.lang.JSON.parse(o.responseText);
            if (result.support_amount == undefined) {
            	$('support-amount').value = 0;
            	$('txt-support').value = formatNumber(0);
            	$('support-id').value = -1;
            } else {
            	$('support-amount').value = result.support_amount;
            	$('txt-support').value = formatNumber(result.support_amount);
            	$('support-id').value = result.id;
            }
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/finance/get_patient_support')}",
    			   callback, "vn_id=" + SR.currentVnId);
    	}

    };
    /*
         * Define the callback object for success and failure
         * handlers as well as object scope.
         */
    var callback =
    {
        	success:AjaxObject.handleSuccess,
        	failure:AjaxObject.handleFailure,
        	scope: AjaxObject
    };

    // Start the transaction.
    AjaxObject.startRequest();
}

function receiveChange(){
	
    var totalamount = parseNumber($('totalamount').value);
    var receiveamount = $('receiveamount').value;
	var changeamount = receiveamount - totalamount; 
	
    if (changeamount < 0) {
		
		showMessageDialog("Error", "จำนวนเงินไม่ถูกต้อง", YAHOO.widget.SimpleDialog.ICON_BLOCK);

		$('receiveamount').select();
		$('receiveamount').focus();
    }
	
	$('changeamount').value = formatNumber(changeamount);
	
	$('receiveamount').value = formatNumber(receiveamount);

	document.getElementById('yui-gen0-button').focus();
		
}

function stopPainter(elCell, oRecord, oColumn, oData) {

    if(oRecord.getData("stop")) {

        elCell.innerHTML = ' <img width="22px" height="22px" src="/img/paid.png" />';
    }
    else {

        elCell.innerHTML = ' <img width="22px" height="22px" src="/img/unpaid.png" />';
    }
};

function showMessageDialog(header, msg, icon) {

	if (parent != self && parent.showMessageDialog) {

		parent.showMessageDialog(header, msg, icon);
	} 
	else {

		messageDialog(header, msg, icon);
	}
}

loader.insert();