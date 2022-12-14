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

function reloadPage(paId, qcalled) {
	$('pa_id').value = paId;
	$('qcalled').value = qcalled;
    SR.qcalled = qcalled;
    SR.currentPatientId = paId;
    getBackground(paId);
}

function initComponents(){
    // Initialize the temporary Panel to display while waiting for external content to load
    resetArray();    
    //SR.lookupSocialProblem = initSocialProblemLookup();
    //SR.lookupSocialHelp = initSocialHelpLookup();
    var bg_id = document.getElementById("background_id").value;
    if (bg_id == "None") bg_id = -1;
    SR.backgroundId = bg_id;
    var paId = document.getElementById('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    SR.currentPatientId = paId;
    var qcalled = document.getElementById('qcalled').value;
    if (qcalled == "true")
        qcalled = true;
    else
        qcalled = false;
    SR.qcalled = qcalled;
    SR.bgProblemsTable = initBgSocialProblem(bg_id);
    SR.bgHelpsTable = initBgSocialHelp(bg_id);
    initBackgroundButtons();
    //SR.cbbHealthStation = initauto();//initHealthStationAutoComp();
    SR.autoStation = initStationAutoComp();
    SR.autoProb = initProblemAutoComp();
    SR.autoHelp = initHelpAutoComp();
    setDisableInput(true);
    //alert('');
    SR.selectedProblem = [];
    SR.selectedHelp = [];
    initMenu();
    SR.dlgWait = getWaitDialog();
    
    Event.addListener('physical-true', 'click', physicalCheck);
    Event.addListener('physical-false', 'click', physicalCheck);
    
    Event.addListener('heredity-true', 'click', heredityCheck);
    Event.addListener('heredity-false', 'click', heredityCheck);
    
    Event.addListener('drug-true', 'click', drugCheck);
    Event.addListener('drug-false', 'click', drugCheck);
    getBackground(paId);
}

function drugCheck(e) {
	if (e.target.value == "true") {
		$('drug_usage').readOnly = false;
		Dom.setStyle($('drug_usage'), 'background-color', normalColor);
		$('drug_usage').focus();
	} else {
		$('drug_usage').readOnly = true;
		Dom.setStyle($('drug_usage'), 'background-color', readonlyColor); 
		$('drug_usage').value = "";
	}
}

function heredityCheck(e) {
	if (e.target.value == "true") {
		$('heredity').readOnly = false;
		Dom.setStyle($('heredity'), 'background-color', normalColor);
		$('heredity').focus();
	} else {
		$('heredity').readOnly = true;
		Dom.setStyle($('heredity'), 'background-color', readonlyColor); 
		$('heredity').value = "";
	}
}

function physicalCheck(e) {
	if (e.target.value == "true") {
		$('history_physical').readOnly = false;
		Dom.setStyle($('history_physical'), 'background-color', normalColor);
		$('history_physical').focus();
	} else {
		$('history_physical').readOnly = true;
		Dom.setStyle($('history_physical'), 'background-color', readonlyColor); 
		$('history_physical').value = "";
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

function initStationAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/social/get_health_stations')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "stations", 
	        fields: ["id","name"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("inpHs", "ctHs", bDS, oConfigs); 
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
    	if (oTextbox.readOnly) return false;
        var pos = YAHOO.util.Dom.getXY(oTextbox);
        pos[1] += YAHOO.util.Dom.get(oTextbox).offsetHeight + 2;
        YAHOO.util.Dom.setXY(oContainer,pos);
        return true;
    }; 
    
    bAC.generateRequest = function(sQuery) { 
        return "?limit=8&query="+sQuery; 
    }; 
    
    bAC.formatResult = function(oResultData, sQuery, sResultMatch) { 
        return oResultData[1]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('inpHs').value = aData[1];
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function initauto() {
    var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/social/get_health_stations')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "stations", 
	        fields: ["name","id"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("inpHs", "ctHs", bDS, oConfigs); 
    var bToggler = YAHOO.util.Dom.get("btnHs");
    SR.btnHs = new YAHOO.widget.Button({container:bToggler});
    var toggleB = function(e) {
        //YAHOO.util.Event.stopEvent(e);
        if(!YAHOO.util.Dom.hasClass(bToggler, "open")) {
            YAHOO.util.Dom.addClass(bToggler, "open")
        }
        
        // Is open
        if(bAC.isContainerOpen()) {
            bAC.collapseContainer();
        }
        // Is closed
        else {
            bAC.getInputEl().focus(); // Needed to keep widget active
            setTimeout(function() { // For IE
                bAC.sendQuery("1");
            },0);
            
        }
    }
    SR.btnHs.on("click", toggleB);
    bAC.containerCollapseEvent.subscribe(function(){YAHOO.util.Dom.removeClass(bToggler, "open")});
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
        var pos = YAHOO.util.Dom.getXY(oTextbox);
        pos[1] += YAHOO.util.Dom.get(oTextbox).offsetHeight + 2;
        YAHOO.util.Dom.setXY(oContainer,pos);
        return true;
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
        
        var el = document.getElementById("health_station_id");
        el.value = aData[1];
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
}

function resetArray() {
    SR.bgProblems = [];
    SR.editProblems = [];
    SR.delBgProblems = [];
    SR.bgHelps = [];
    SR.editHelps = [];
    SR.delBgHelps = [];
}

function checkEnter(e, type) {
	var keynum;	
	if(window.event) // IE
	{
		keynum = e.keyCode;
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which;
	}
	
	if (type=='prob') {
		if (keynum == 13 && !SR.autoProb.isContainerOpen()) {
			addProblem();
		}
	} else if (type=='help') {
		if (keynum == 13 && !SR.autoHelp.isContainerOpen()) {
			addHelp();
		}
	}
}

function addProblem() {
	if (SR.selectedProblem.length==0) return;
	var id = SR.selectedProblem[0];
	var code = SR.selectedProblem[1];
    var desc = SR.selectedProblem[2];
    var record = {id:-1, code:code, description:desc, problem_id:id, more_problem_info:""};        
    SR.bgProblemsTable.datatable.addRow(record);
    //SR.bgProblems.push({problem_id:id});
    SR.selectedProblem = [];
    $('txtAddProb').value = '';
}

function addHelp() {
	if (SR.selectedHelp.length==0) return;
	var id = SR.selectedHelp[0];
	var code = SR.selectedHelp[1];
    var desc = SR.selectedHelp[2];
    var record = {id:-1, code:code, description:desc, help_id:id, more_help_info:""};        
    SR.bgHelpsTable.datatable.addRow(record);
    //SR.helps.push({help_id:id});
    SR.selectedHelp = [];
    $('txtAddHelp').value = '';
}

function initHelpAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/social/get_helps')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "helps", 
	        fields: ["id","code","description"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("txtAddHelp", "ctHelp", bDS, oConfigs); 
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
    	if (oTextbox.readOnly) return false;
        var pos = YAHOO.util.Dom.getXY(oTextbox);
        pos[1] += YAHOO.util.Dom.get(oTextbox).offsetHeight + 2;
        YAHOO.util.Dom.setXY(oContainer,pos);
        return true;
    }; 
    
    bAC.generateRequest = function(sQuery) { 
        return "?limit=8&query="+sQuery; 
    }; 
    
    bAC.formatResult = function(oResultData, sQuery, sResultMatch) { 
        return oResultData[1] + ": " + oResultData[2]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('txtAddHelp').value = aData[1] + ": " + aData[2];
    	SR.selectedHelp = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function initProblemAutoComp() {
	var bDS = new YAHOO.util.XHRDataSource("${h.url_for('/social/get_problems')}"); //new YAHOO.util.LocalDataSource(breakfasts);
    bDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
    bDS.responseSchema = { 
	        resultsList: "problems", 
	        fields: ["id","code","description"] 
	    }; 

    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01
    }
    var bAC = new YAHOO.widget.AutoComplete("txtAddProb", "ctProb", bDS, oConfigs); 
    
    bAC.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
    	if (oTextbox.readOnly) return false;
        var pos = YAHOO.util.Dom.getXY(oTextbox);
        pos[1] += YAHOO.util.Dom.get(oTextbox).offsetHeight + 2;
        YAHOO.util.Dom.setXY(oContainer,pos);
        return true;
    }; 
    
    bAC.generateRequest = function(sQuery) { 
        return "?limit=8&query="+sQuery; 
    }; 
    
    bAC.formatResult = function(oResultData, sQuery, sResultMatch) { 
        return oResultData[1] + ": " + oResultData[2]; 
    }; 
    
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
    	$('txtAddProb').value = aData[1] + ": " + aData[2];
    	SR.selectedProblem = aData;
    };

    bAC.itemSelectEvent.subscribe(itemSelectHandler);
    return bAC;
}

function initHealthStationAutoComp() {
    var datasource = new YAHOO.widget.DS_XHR("${h.url_for('/social/get_health_stations')}", ["stations", "name"]);         
    datasource.maxCacheEntries = 0; 
    var oConfigs = {
        prehighlightClassName: "yui-ac-prehighlight",
        useShadow: true,
        queryDelay: 0,
        minQueryLength: 0,
        animVert: .01,
        queryMatchContains:true,
        queryQuestionMark:false
    }

    var myAutoComp = new YAHOO.widget.AutoComplete("health_station_name","health_stations", datasource, oConfigs);
    //myAutoComp.useShadow = true; 
    //myAutoComp.queryMatchContains = true;
    myAutoComp.formatResult = function(oResultItem, sQuery) { 
       //alert("format: " + oResultItem[1].id + " " + oResultItem[1].name + " :: " + oResultItem);
       return oResultItem[1].name + " (" + oResultItem[1].id + ")"; 
    }; 
    
    var btnHs = YAHOO.util.Dom.get("btnHs");
    SR.btnHs = new YAHOO.widget.Button({container:btnHs});
    var toggleB = function(e) {
        //YAHOO.util.Event.stopEvent(e);
        if(!YAHOO.util.Dom.hasClass(btnHs, "open")) {
            YAHOO.util.Dom.addClass(btnHs, "open")
        }
        
        // Is open
        if(myAutoComp.isContainerOpen()) {
            myAutoComp.collapseContainer();
        }
        // Is closed
        else {
            myAutoComp.getInputEl().focus(); // Needed to keep widget active
            setTimeout(function() { // For IE
                myAutoComp.sendQuery("");
            },0);
        }
    }
    SR.btnHs.on("click", toggleB);
    myAutoComp.containerCollapseEvent.subscribe(function(){YAHOO.util.Dom.removeClass(btnHs, "open")});

    
    myAutoComp.doBeforeExpandContainer = function(oTextbox, oContainer, sQuery, aResults) {
        //alert("query: " + sQuery);
        //alert("result: " + aResults);
    	if (oTextbox.readOnly) return false;
        var pos = YAHOO.util.Dom.getXY(oTextbox);
        pos[1] += YAHOO.util.Dom.get(oTextbox).offsetHeight + 2;
        YAHOO.util.Dom.setXY(oContainer,pos);
        return true;
    }; 
      /* 
    //define your itemSelect handler function:
    var itemSelectHandler = function(sType, aArgs) {
    	YAHOO.log(sType); //this is a string representing the event;
    				      //e.g., "itemSelectEvent"
    	var oMyAcInstance = aArgs[0]; // your AutoComplete instance
    	var elListItem = aArgs[1]; //the <li> element selected in the suggestion
    	   					       //container
    	var aData = aArgs[2]; //array of the data for the item as returned by the DataSource
        var el = document.getElementById("health_station_id");
        el.value = aData[1].id;
    };

    myAutoComp.itemSelectEvent.subscribe(itemSelectHandler);
    */
    return myAutoComp;
}

function initBackgroundButtons() {
    SR.btnPrint = new YAHOO.widget.Button("btnPrintBackground");
    SR.btnPrint.addListener("click", function(e) {
    	if (SR.backgroundId == -1) return;
    	$('frmprint').src = "${h.url_for('/socialreport/background')}?bg_id=" + SR.backgroundId;
    });
    YAHOO.util.Event.onAvailable("btnAddProb", function() {
        SR.btnAddProb = new YAHOO.widget.Button("btnAddProb");
        SR.btnAddProb.addListener("click", function(e) {
            //SR.lookupSocialProblem.show();
            addProblem();
        });
        SR.btnAddHelp = new YAHOO.widget.Button("btnAddHelp");
        SR.btnAddHelp.addListener("click", function(e) {
            //SR.lookupSocialHelp.show();
        	addHelp();
        	//var record = {id:-1, more_help_info:""};        
            //SR.bgHelpsTable.datatable.addRow(record, 0);
        });
        SR.btnAddProb.set("disabled", true);
        SR.btnAddHelp.set("disabled", true);
    });
    
    

    SR.btnSaveBackground = new YAHOO.widget.Button("btnSaveBackground");
    SR.btnSaveBackground.set("disabled", true);
    SR.btnSaveBackground.addListener("click", function(e) {
        var responseSuccess = function(o) {
        	SR.dlgWait.hide();
            reloadPage(SR.currentPatientId, SR.qcalled);
        	resetArray();
            setDisableInput(true);
            SR.btnSaveBackground.set("disabled", true);
            SR.btnCancelBackground.set("disabled", true);
            SR.mode = 0;
            try {
	            if (parent.setWorking) {
	            	parent.setWorking(false);
	            }
            } catch(ex) {
            }
            showMessageDialog("Info", 'บันทึกเรียบร้อย', YAHOO.widget.SimpleDialog.ICON_INFO);
            
        };
        var responseFailure = function(o) {
        	SR.dlgWait.hide();
            showMessageDialog("Error", 'บันทึกไม่สำเร็จ: ' + o.statusText, YAHOO.widget.SimpleDialog.ICON_BLOCK);
        };
        var callback =
        {
            success: responseSuccess,
            failure: responseFailure
        };
        SR.dlgWait.show();
        var recs = SR.bgProblemsTable.datatable.getRecordSet().getRecords();
        SR.bgProblems.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1) {
        		SR.bgProblems.push(recs[i]._oData);
        	}         	
        }
        
        for (var i = 0; i < SR.editProblems.length; i++) {
        	var rec = SR.bgProblemsTable.datatable.getRecord(SR.editProblems[i]);
        	if (rec == null) continue;
        	SR.bgProblems.push(rec._oData);
        }
        
        recs = SR.bgHelpsTable.datatable.getRecordSet().getRecords();
        SR.bgHelps.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1)
        		SR.bgHelps.push(recs[i]._oData);
        }
        
        for (var i = 0; i < SR.editHelps.length; i++) {
        	var rec = SR.bgHelpsTable.datatable.getRecord(SR.editHelps[i]);
        	if (rec == null) continue;
        	SR.bgHelps.push(rec._oData);
        }
        
        var jsonBgProblems = YAHOO.lang.JSON.stringify(SR.bgProblems);
        var domBgProblems = document.getElementById("bg_problems");
        domBgProblems.value = jsonBgProblems;
        var jsonDelBgProblems = YAHOO.lang.JSON.stringify(SR.delBgProblems);
        var domDelBgProblems = document.getElementById("del_bg_problems");
        domDelBgProblems.value = jsonDelBgProblems;
        
        var jsonBgHelps = YAHOO.lang.JSON.stringify(SR.bgHelps);
        var domBgHelps = document.getElementById("bg_helps");
        domBgHelps.value = jsonBgHelps;
        var jsonDelBgHelps = YAHOO.lang.JSON.stringify(SR.delBgHelps);
        var domDelBgHelps = document.getElementById("del_bg_helps");
        domDelBgHelps.value = jsonDelBgHelps;
        
        var formObject = document.getElementById('form_background');
        YAHOO.util.Connect.setForm(formObject);        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/social/save_background')}", callback);
        
    });
    SR.btnEditBackground = new YAHOO.widget.Button("btnEditBackground");
    SR.btnEditBackground.addListener("click", function(e) {
        var paId = document.getElementById("pa_id").value;
        if (paId == -1) {
        	showMessageDialog("Warn", "กรุณาเลือกผู้ป่วยก่ิอน", YAHOO.widget.SimpleDialog.ICON_WARN);       	
            return;
        }
//        if (document.getElementById("qcalled").value == "false") {
//        	showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN, parent.$('dlg-message'));       	
//            return;
//        }        
        SR.mode = 2;
        setDisableInput(false);
        SR.btnSaveBackground.set("disabled", false);
        SR.btnCancelBackground.set("disabled", false);
        try {
	        if (parent.setWorking) {
	        	parent.setWorking(true);
	        }
        } catch (ex) {
        	
        }
    });
    
    SR.btnCancelBackground = new YAHOO.widget.Button("btnCancelBackground");
    SR.btnCancelBackground.set("disabled", true);
    SR.btnCancelBackground.addListener("click", function(e) {
    	SR.mode = 0;
        setDisableInput(true);
        SR.btnSaveBackground.set("disabled", true);
        SR.btnCancelBackground.set("disabled", true);        
        var paId = document.getElementById("pa_id").value;
        getBackground(paId);
        resetArray();
        try {
	        if (parent.setWorking) {
	        	parent.setWorking(false);
	        }
        } catch (ex) {
        	
        }
    });
}

function initSocialProblemLookup() {
    var handleOk = function() {
        var select = document.getElementById("select_problem");
        var id = select.options[select.selectedIndex].id;
        var code = select.options[select.selectedIndex].value;
        var desc = select.options[select.selectedIndex].text;
        var record = {code:code, description:desc, problem_id:id}        
        SR.bgProblemsTable.datatable.addRow(record);
        SR.bgProblems.push({problem_id:id});
        this.hide();
    };
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("lookupSocialProblem", { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : false,
        buttons : [ { text:"ตกลง", handler:handleOk, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });
    dialog.render(); 
    return dialog;
}

function initSocialHelpLookup() {
    var handleOk = function() {
        var select = document.getElementById("select_help");
        var id = select.options[select.selectedIndex].id;
        var code = select.options[select.selectedIndex].value;
        var desc = select.options[select.selectedIndex].text;
        var record = {code:code, description:desc, help_id:id}
        SR.bgHelpsTable.datatable.addRow(record);
        SR.bgHelps.push({help_id:id});
        this.hide();
    };
    var handleCancel = function() {
        this.cancel();
    };
    
    var dialog = new YAHOO.widget.Dialog("lookupSocialHelp", { 
        width : "30em",
        fixedcenter : true,
        visible : false, 
        constraintoviewport : true,
        buttons : [ { text:"ตกลง", handler:handleOk, isDefault:true },
              { text:"ยกเลิก", handler:handleCancel } ]
    });
    dialog.render(); 
    return dialog;
}


function initBgSocialProblem(bg_id) {
    var bgProblemsTable = new function(){
        this.coldefs =
            [{key:"code", label:"รหัส", width:50},
             {key:"description", label:"คำอธิบาย", width:300},
             {key:"more_problem_info", label:"เพิ่มเติม", width:300, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"problem_id", hidden: true}];
        if (bg_id==null)
            bg_id = -1;
        this.query = "bg_id=" + bg_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_bg_problems?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"bg_problems",
                fields:["id", "background_id", "problem_id", "code", 
                        "description", "more_problem_info"]}});
        
        this.datatable = new YAHOO.widget.DataTable("bg_social_problem",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1 && col.key == "more_problem_info") {
        		SR.editProblems.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delBgProblems,
        				"ต้องการลบข้อมูลวินิจฉัยทางสังคม: " + rec.getData("code"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);

    }
    

    return bgProblemsTable;
}

function initBgSocialHelp(bg_id) {
    var bgHelpsTable = new function(){
        this.coldefs =
            [{key:"code", label:"รหัส", width:50},
             {key:"description", label:"คำอธิบาย", width:300},
             {key:"more_help_info", label:"เพิ่มเติม", width:300, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"help_id", hidden: true}];
        if (bg_id==null)
            bg_id = -1;
        this.query = "bg_id=" + bg_id;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_bg_helps?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"bg_helps",
            	//fields:["id", "background_id", "more_help_info"]}});
                fields:["id", "background_id", "help_id", "code", "description","more_help_info"]}});
        
        this.datatable = new YAHOO.widget.DataTable("bg_social_help",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (rec.getData("id") != -1 && col.key == "more_help_info") {
        		SR.editHelps.push(rec.getId());
        	}
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delBgHelps,
        				"ต้องการลบข้อมูลช่วยเหลือ: " + rec.getData("code"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return bgHelpsTable;
}

function delPainter(elCell, oRecord, oColumn, oData) {    
	srDelPainter(elCell, oRecord, oColumn, oData, SR.mode);
}

var readonlyColor = 'lightyellow';
var normalColor = 'white';
function setDisableInput(disable) {
    var frmBg = document.getElementById("form_background");
    for (var i = 0; i < frmBg.elements.length; i++) {
        var el = frmBg.elements[i];
        if (el.type == "textarea" || el.type == "text") {
            if (disable) {
                YAHOO.util.Dom.setStyle(el.id, 'background-color', readonlyColor);
                el.readOnly = disable;
            } else {
            	var elDisable = false;
            	if (el.id == "history_physical" && $('physical-false').checked) {
            		elDisable = true;
            	} else if (el.id == "heredity" && $('heredity-false').checked) {
            		elDisable = true;
            	} else if (el.id == "drug_usage" && $('drug-false').checked) {
            		elDisable = true;
            	}
            	if (!elDisable) {
            		YAHOO.util.Dom.setStyle(el.id, 'background-color', normalColor);
            		el.readOnly = disable;
            	}
            	
            }
            
        } else if (el.type == "radio") {
        	el.disabled = disable;
        }
    }
    if (SR.btnAddProb != undefined) {
        SR.btnAddProb.set("disabled", disable);
        SR.btnAddHelp.set("disabled", disable);
    }
    //SR.btnHs.set("disabled", disable);
    SR.bgDisabled = disable;
    SR.bgProblemsTable.datatable.render();
    SR.bgHelpsTable.datatable.render();
}

function getBackground(paId) {
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
            $('background_id').value=result['background_id'];
            SR.backgroundId = result['background_id'];
            $('info_provider').value=result['info_provider'];
            $('provider_relation').value=result['provider_relation'];
            $('important_symptom').value=result['important_symptom'];
            $('period').value=result['period'];
            //$('health_station_id').value=result['health_station_id'];
            $('inpHs').value=result['health_station'];
            $('history_physical').value=result['history_physical'];
            if (Lang.trim(result['history_physical']) != ""){
            	$('physical-true').checked = true;
            } else {
            	$('physical-false').checked = true;
            }
            $('history_mental').value=result['history_mental'];
            $('history_accident').value=result['history_accident'];
            $('history_med_alergy').value=result['history_med_alergy'];
            $('personality').value=result['personality'];
            $('heredity').value=result['heredity'];
            if (Lang.trim(result['heredity']) != ""){
            	$('heredity-true').checked = true;
            } else {
            	$('heredity-false').checked = true;
            }
            $('drug_usage').value=result['drug_usage'];
            if (Lang.trim(result['drug_usage']) != ""){
            	$('drug-true').checked = true;
            } else {
            	$('drug-false').checked = true;
            }
            $('history_family').value=result['history_family'];
            $('created_by').innerHTML=result['created_by'];
            $('created_date').innerHTML=result['created_date'];
            $('position').innerHTML=result['position'];
            //$('social_analysis_text').value=result['social_analysis_text'];
            SR.bgProblemsTable.datasource.sendRequest("bg_id=" + result['background_id'], {
                success:SR.bgProblemsTable.datatable.onDataReturnInitializeTable,
                failure:SR.bgProblemsTable.datatable.onDataReturnInitializeTable,
                scope:SR.bgProblemsTable.datatable
            });
            SR.bgHelpsTable.datasource.sendRequest("bg_id=" + result['background_id'], {
                success:SR.bgHelpsTable.datatable.onDataReturnInitializeTable,
                failure:SR.bgHelpsTable.datatable.onDataReturnInitializeTable,
                scope:SR.bgHelpsTable.datatable
            });
    	},

    	startRequest:function() {
    	   YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/social/load_background')}", callback, "pa_id=" + paId);
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

function showMessageDialog(header, msg, icon) {
	try {
		if (parent != self && parent.showMessageDialog) {
			parent.showMessageDialog(header, msg, icon);
		} else {
			messageDialog(header, msg, icon);
		}
	} catch (ex) {
		messageDialog(header, msg, icon);
	}
}

loader.insert();

