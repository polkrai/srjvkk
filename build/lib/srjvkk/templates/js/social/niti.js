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
	//$('cur_vn_id').value = vnId;
	$('qcalled').value = qcalled;
	//SR.currentVnId = vnId;
    SR.qcalled = qcalled;
    SR.currentPatientId = paId;
    SR.crimeTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
        success : SR.crimeTable.datatable.onDataReturnInitializeTable,
        failure : SR.crimeTable.datatable.onDataReturnInitializeTable,
        scope : SR.crimeTable.datatable
    });
    clearCrimeDetail();
}

function initComponents(){
	
    resetArray();
    initButtons();
    SR.problemsTable = initSocialProblem();
    SR.helpsTable = initSocialHelp();
    //SR.lookupSocialProblem = initSocialProblemLookup();
    //SR.lookupSocialHelp = initSocialHelpLookup();
    var paId = document.getElementById('pa_id').value;
    if (paId == undefined || paId == '')
        paId = -1;
    var nitiId = $('niti_id').value;
    if (nitiId == undefined || nitiId == '' || nitiId == "None")
    	nitiId = -1;
    SR.nitiId = nitiId;
    SR.currentPatientId = paId;
    SR.crimeTable = initCrimeTable(paId);   
    SR.autoProb = initProblemAutoComp();
    SR.autoHelp = initHelpAutoComp();
    SR.selectedProblem = [];
    SR.selectedHelp = [];
    initMenu();
    setDisableInput(true);
    SR.dlgWait = getWaitDialog();
}

function initMenu() {
	SR.toolbar = new YAHOO.widget.Overlay("toolbar_pane", {
		iframe: true
	});
	SR.toolbar.render();
	YAHOO.widget.Overlay.windowScrollEvent.subscribe(function(){
		var pos = Dom.getXY($('toolbar_pane'));
		Dom.setXY($('toolbar_pane'),[pos.X,window.scrollY]);
    });
}

function resetArray() {
	
    SR.problems = new Array();
    SR.editProblems = [];
    SR.delProblems = new Array();
    SR.helps = new Array();
    SR.editHelps = [];
    SR.delHelps = new Array();
    SR.delNitis = new Array();
}

function initSocialProblem() {
    var problemsTable = new function(){
        this.coldefs =
            [{key:"code", label:"รหัส", width:50},
             {key:"description", label:"คำอธิบาย", width:300},
             {key:"more_problem_info", label:"เพิ่มเติม", width:300, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"problem_id", hidden: true}];
        this.query = "niti_id=" + -1;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_niti_problems?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"problems",
                fields:["id", "niti_id", "problem_id", "code", "description", "more_problem_info"]}});
        
        this.datatable = new YAHOO.widget.DataTable("social_problem",
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
        		confirmDelete(this, rec, SR.delProblems,
        				"ต้องการลบข้อมูลวินิจฉัยทางสังคม: " + rec.getData("code"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
    }
    return problemsTable;
}


function initSocialHelp() {
    var helpsTable = new function(){
        this.coldefs =
            [{key:"code", label:"รหัส", width:50},
             {key:"description", label:"คำอธิบาย", width:300},
             {key:"more_help_info", label:"เพิ่มเติม", width:300, editor: new YAHOO.widget.TextareaCellEditor()},
             {key:"del", label:"", formatter: delPainter},
             {key:"help_id", hidden: true}];
        this.query = "niti_id=" + -1;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_niti_helps?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"helps",
            	fields:["id", "niti_id", "help_id", "code", "description","more_help_info"]}});
                //fields:["id", "niti_id", "more_help_info"]}});
        
        this.datatable = new YAHOO.widget.DataTable("social_help",
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
        		confirmDelete(this, rec, SR.delHelps, "ต้องการลบข้อมูลช่วยเหลือ: " + rec.getData("code"));
        	}
        	this.onEventShowCellEditor(oArgs);
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
    }
    return helpsTable;
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
    var record = {id:-1, code:code, description:desc, problem_id:id, more_problem_info:''};        
    SR.problemsTable.datatable.addRow(record);
    //SR.problems.push({problem_id:id});
    SR.selectedProblem = [];
    $('txtAddProb').value = '';
}

function addHelp() {
	if (SR.selectedHelp.length==0) return;
	var id = SR.selectedHelp[0];
	var code = SR.selectedHelp[1];
    var desc = SR.selectedHelp[2];
    var record = {id:-1,code:code, description:desc, help_id:id, more_help_info:''};        
    SR.helpsTable.datatable.addRow(record);
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

function initSocialProblemLookup() {
    var handleOk = function() {
        var select = document.getElementById("select_problem");
        var id = select.options[select.selectedIndex].id;
        var code = select.options[select.selectedIndex].value;
        var desc = select.options[select.selectedIndex].text;
        var record = {code:code, description:desc, problem_id:id}        
        SR.problemsTable.datatable.addRow(record);
        SR.problems.push({problem_id:id});
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
        SR.helpsTable.datatable.addRow(record);
        SR.helps.push({help_id:id});
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

function initCrimeTable(paId) {
    var crimeTable = new function(){
        this.coldefs =
            [{key:"crime", label:"คดี", width:300},
             {key:"commit_date", label:"วันที่เกิดเหตุ",formatter: dateFormatter},
             {key:"surrender_date", label:"วันที่มอบตัว",formatter: dateFormatter},
             {key:"hospital_date", label:"วันที่ส่งมาโรงพยาบาล",formatter: dateFormatter},
             {key:"admit_date", label:"รับไว้เมื่อวันที่",formatter: dateFormatter},
             {key:"del", label:"", formatter: delPainter},
             {key:"id", hidden: true}];
        if (paId==null)
            paId = -1;
        this.query = "pa_id=" + paId;
        this.datasource = new YAHOO.util.DataSource(
            "${h.url_for('/social/get_nitis?')}",
            {connXhrMode: "cancelStaleRequest",
             connMethodPost: true,
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"nitis",
                fields:["id", "patient_id", "crime", {key:"commit_date", parser:parseDate}, 
                        {key:"surrender_date",parser:parseDate}, 
                        {key:"hospital_date",parser:parseDate}, 
                        "hospital_reason",
                        "personality", "history_physical", "history_mental",
                        "history_crime", "drug_usage", "history_accident",
                        "sex_experience", "heredity", "history_family",
                        "social_analysis_text", "info_provider", 
                        {key:"admit_date",parser:parseDate},
                        "personality_from_family"]}});
        
        this.datatable = new YAHOO.widget.DataTable("niti_crime_table",
            this.coldefs, this.datasource,
            {scrollable:true, height:"100px",
                initialRequest:this.query});
        
        this.handleClicked = function(oArgs, arg2){
            var row = this.getRow(oArgs.target);
            this.unselectAllRows();
            this.selectRow(row);

        };
        this.datatable.subscribe("rowClickEvent", this.handleClicked);
        
        this.handleCellClicked = function(oArgs) {
        	if (SR.mode == 0) return;
        	var rec = this.getRecord(oArgs.target);
        	var col = this.getColumn(oArgs.target);
        	if (col.key == "del") {
        		confirmDelete(this, rec, SR.delNitis,
        				"ต้องการลบข้อมูลคดี: " + rec.getData("crime"));
        	}
        }
        this.datatable.subscribe("cellClickEvent", this.handleCellClicked);
        
        this.handleRowSelected = function (oArgs) {
        	SR.selectedRecord = oArgs.record;
            getCrimeDetail(oArgs.record);
            var nitiId = oArgs.record.getData("id");
            SR.nitiId = nitiId;
            document.getElementById("niti_id").value = nitiId;
            SR.problemsTable.datasource.sendRequest("niti_id=" + nitiId, {
                success:SR.problemsTable.datatable.onDataReturnInitializeTable,
                failure:SR.problemsTable.datatable.onDataReturnInitializeTable,
                scope:SR.problemsTable.datatable
            })
            SR.helpsTable.datasource.sendRequest("niti_id=" + nitiId, {
                success:SR.helpsTable.datatable.onDataReturnInitializeTable,
                failure:SR.helpsTable.datatable.onDataReturnInitializeTable,
                scope:SR.helpsTable.datatable
            })
        };
        this.datatable.subscribe("rowSelectEvent", this.handleRowSelected);
        
        this.handeledInit = function() {
            if (SR.crimeTable.datatable.getRecordSet().getRecords().length > 0) {
                SR.crimeTable.datatable.selectRow(0);
            }
        }
        this.datatable.subscribe("initEvent", this.handeledInit);
        this.datatable.subscribe("rowAddEvent", function(oArgs){
            SR.crimeTable.datatable.unselectAllRows();            
            var rowIndex = SR.crimeTable.datatable.getRecordSet().getLength() - 1;
            SR.crimeTable.datatable.selectRow(rowIndex);
        });
    }
    
    return crimeTable;
}

function getCrimeDetail(record) {
    $('crime').value = record.getData('crime');
    $('niti_id').value = record.getData('id');
    SR.nitiId = record.getData('id');
    $('commit_date').value = getDateString(record.getData('commit_date'), true);
    $('surrender_date').value = getDateString(record.getData('surrender_date'), true);
    $('hospital_date').value = getDateString(record.getData('hospital_date'), true);
    $('admit_date').value = getDateString(record.getData('admit_date'), true);
    $('info_provider').value = record.getData('info_provider');
    $('personality_from_family').value = record.getData('personality_from_family');
    $('hospital_reason').value = record.getData('hospital_reason');
    $('personality').value = record.getData('personality');
    $('history_physical').value = record.getData('history_physical');
    $('history_mental').value = record.getData('history_mental');
    $('history_crime').value = record.getData('history_crime');
    $('drug_usage').value = record.getData('drug_usage');
    $('history_accident').value = record.getData('history_accident');
    $('sex_experience').value = record.getData('sex_experience');
    $('heredity').value = record.getData('heredity');
    $('history_family').value = record.getData('history_family');
    $('social_analysis_text').value = record.getData('social_analysis_text');
}

function clearCrimeDetail() {
	$('niti_id').value = "";
    SR.nitiId = "";
	$('crime').value = "";
    $('commit_date').value = "";
    $('surrender_date').value = "";
    $('hospital_date').value = "";
    $('admit_date').value = "";
    $('info_provider').value = "";
    $('personality_from_family').value = "";
    $('hospital_reason').value = "";
    $('personality').value = "";
    $('history_physical').value = "";
    $('history_mental').value = "";
    $('history_crime').value = "";
    $('drug_usage').value = "";
    $('history_accident').value = "";
    $('sex_experience').value = "";
    $('heredity').value = "";
    $('history_family').value = "";
    $('social_analysis_text').value = "";
    SR.problemsTable.datasource.sendRequest("niti_id=-1", {
        success:SR.problemsTable.datatable.onDataReturnInitializeTable,
        failure:SR.problemsTable.datatable.onDataReturnInitializeTable,
        scope:SR.problemsTable.datatable
    })
    SR.helpsTable.datasource.sendRequest("niti_id=-1", {
        success:SR.helpsTable.datatable.onDataReturnInitializeTable,
        failure:SR.helpsTable.datatable.onDataReturnInitializeTable,
        scope:SR.helpsTable.datatable
    })
}

function initButtons() {
	SR.btnPrint = new YAHOO.widget.Button("btnPrint");
    SR.btnPrint.addListener("click", function(e) {
    	if (SR.nitiId == -1) return;
    	$('frmprint').src = "${h.url_for('/socialreport/niti')}?niti_id=" + SR.nitiId;
    });
    //YAHOO.util.Event.onAvailable("btnAddProb", function() {
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
        //SR.helpsTable.datatable.addRow(record, 0);
    });
    //});

    SR.btnAdd = new YAHOO.widget.Button("btnAdd");
    SR.btnAdd.addListener("click", function(e) {
    	var paId = document.getElementById("pa_id").value;
        if (paId == -1 || document.getElementById("qcalled").value == "false") {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        if (parent.setWorking) {
        	parent.setWorking(true);
        }
        SR.mode = 1;
        this.set("disabled", true);
        SR.btnEdit.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        setDisableInput(false);
        var crime = "";
        var now = new Date();
        var commitDate = now;
        var surrenderDate = now;
        var hospitalDate = now;
        var admitDate = now;
        var paId = -1;
        var record = {crime:crime, commit_date:commitDate, surrender_date:surrenderDate,
        		admit_date:admitDate, info_provider:"", personality_from_family:"",
        		hospital_date:hospitalDate, patient_id:-1, id:-1, hospital_reason:"", 
        		personality:"", history_physical:"", history_mental:"", history_crime:"", 
        		drug_usage:"", history_accident:"", sex_experience:"", heredity:"", 
        		history_family:"", social_analysis_text:""};     
        SR.crimeTable.datatable.addRow(record);
        document.getElementById("crime").focus();
    });
    SR.btnEdit = new YAHOO.widget.Button("btnEdit");
    SR.btnEdit.addListener("click", function(e) {
        var paId = document.getElementById("pa_id").value;
        if (paId == -1 || document.getElementById("qcalled").value == "false") {
            showMessageDialog("Warn", "กรุณาเรียกคิวก่อน", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        if (SR.crimeTable.datatable.getSelectedRows().length == 0) {
            showMessageDialog("Warn", "กรุณาเลือกคดีที่ต้องการแก้ไข", YAHOO.widget.SimpleDialog.ICON_WARN);
            return;
        }
        if (parent.setWorking) {
        	parent.setWorking(true);
        }
        SR.mode = 2;
        this.set("disabled", true);
        SR.btnAdd.set("disabled", true);
        SR.btnSave.set("disabled", false);
        SR.btnCancel.set("disabled", false);
        setDisableInput(false);
        
    });
    SR.btnCancel = new YAHOO.widget.Button("btnCancel");
    SR.btnCancel.set("disabled", true);
    SR.btnCancel.addListener("click", function(e) {
    	if (parent.setWorking) {
    		parent.setWorking(false);
    	}
        this.set("disabled", true);
        SR.btnSave.set("disabled", true);
        SR.btnAdd.set("disabled", false);
        SR.btnEdit.set("disabled", false);
        setDisableInput(true);
        clearCrimeDetail();
        var paId = document.getElementById("pa_id").value;
        SR.crimeTable.datasource.sendRequest("pa_id=" + paId, {
            success:SR.crimeTable.datatable.onDataReturnInitializeTable,
            failure:SR.crimeTable.datatable.onDataReturnInitializeTable,
            scope:SR.crimeTable.datatable
        });
        resetArray();
        SR.mode = 0;
    });
    
    SR.btnSave = new YAHOO.widget.Button("btnSave");
    SR.btnSave.set("disabled", true);
    SR.btnSave.addListener("click", function(e) {
    	SR.dlgWait.show();
    	var recs = SR.problemsTable.datatable.getRecordSet().getRecords();
        SR.problems.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1)
        		SR.problems.push(recs[i]._oData);
        }
        for (var i = 0; i < SR.editProblems.length; i++) {
        	var rec = SR.problemsTable.datatable.getRecord(SR.editProblems[i]);
        	if (rec == null) continue;
        	SR.problems.push(rec._oData);
        }
        recs = SR.helpsTable.datatable.getRecordSet().getRecords();
        SR.helps.length = 0;
        for (var i = 0; i < recs.length; i++) {
        	if (recs[i].getData("id") == -1)
        		SR.helps.push(recs[i]._oData);
        }
        for (var i = 0; i < SR.editHelps.length; i++) {
        	var rec = SR.helpsTable.datatable.getRecord(SR.editHelps[i]);
        	if (rec == null) continue;
        	SR.helps.push(rec._oData);
        }
    	
        var jsonProblems = YAHOO.lang.JSON.stringify(SR.problems);
        var domProblems = document.getElementById("problems");
        domProblems.value = jsonProblems;
        var jsonDelProblems = YAHOO.lang.JSON.stringify(SR.delProblems);
        var domDelProblems = document.getElementById("del_problems");
        domDelProblems.value = jsonDelProblems;
        
        var jsonHelps = YAHOO.lang.JSON.stringify(SR.helps);
        var domHelps = document.getElementById("helps");
        domHelps.value = jsonHelps;
        var jsonDelHelps = YAHOO.lang.JSON.stringify(SR.delHelps);
        var domDelHelps = document.getElementById("del_helps");
        domDelHelps.value = jsonDelHelps;
        
        var jDelNiti = YAHOO.lang.JSON.stringify(SR.delNitis);
        var dDelNiti = $("del-nitis");
        dDelNiti.value = jDelNiti;
        
        var formObject = document.getElementById('form');
        YAHOO.util.Connect.setForm(formObject);        
        
        var responseSuccess = function(o) {
        	if (parent.setWorking) {
        		parent.setWorking(false);
        	}
        	SR.dlgWait.hide();
        	clearCrimeDetail();
        	SR.crimeTable.datasource.sendRequest("pa_id=" + SR.currentPatientId, {
                success : SR.crimeTable.datatable.onDataReturnInitializeTable,
                failure : SR.crimeTable.datatable.onDataReturnInitializeTable,
                scope : SR.crimeTable.datatable
            });
            resetArray();
            setDisableInput(true);
            SR.btnAdd.set("disabled", false);
            SR.btnEdit.set("disabled", false);
            SR.btnSave.set("disabled", true);
            SR.btnCancel.set("disabled", true);
            SR.mode = 0;
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
        
        var cObj = YAHOO.util.Connect.asyncRequest('POST', "${h.url_for('/social/save_niti')}", callback);
    });
    SR.calAdmitDate = initCalendar("calAdmitDate", "conAdmitDate", "btnAdmitDate", "admit_date");
    SR.btnAdmitDate = new YAHOO.widget.Button("btnAdmitDate");
    SR.btnAdmitDate.addListener("click", function(e) {
        SR.calAdmitDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    
    SR.calCommitDate = initCalendar("calCommitDate", "conCommitDate", "btnCommitDate", "commit_date");
    SR.btnCommitDate = new YAHOO.widget.Button("btnCommitDate");
    SR.btnCommitDate.addListener("click", function(e) {
        SR.calCommitDate.dialog.show();
		if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    SR.calSurrenderDate = initCalendar("calSurrenderDate", "conSurrenderDate", "btnSurrenderDate", "surrender_date");
    SR.btnSurrenderDate = new YAHOO.widget.Button("btnSurrenderDate");
    SR.btnSurrenderDate.addListener("click", function(e) {
        SR.calSurrenderDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });
    SR.calHospitalDate = initCalendar("calHospitalDate", "conHospitalDate", "btnHospitalDate", "hospital_date");
    SR.btnHospitalDate = new YAHOO.widget.Button("btnHospitalDate");
    SR.btnHospitalDate.addListener("click", function(e) {
        SR.calHospitalDate.dialog.show();
        if (YAHOO.env.ua.opera && document.documentElement) {
			// Opera needs to force a repaint
			document.documentElement.className += "";
		} 
    });

}

var readonlyColor = 'lightyellow';
var normalColor = 'white';
function setDisableInput(disable) {
    var frm = document.getElementById("form");
    for (var i = 0; i < frm.elements.length; i++) {
        var el = frm.elements[i];
        if (el.type == "textarea" || el.type == "text") { 
            if (disable) {
                YAHOO.util.Dom.setStyle(el.id, 'background-color', readonlyColor); 
            } else {
                YAHOO.util.Dom.setStyle(el.id, 'background-color', normalColor); 
            }
            el.readOnly = disable;
        }
    }
    
    if (SR.btnAddProb != undefined) {
        SR.btnAddProb.set("disabled", disable);
        SR.btnAddHelp.set("disabled", disable);
    }
    SR.btnHospitalDate.set("disabled", disable);
    SR.btnSurrenderDate.set("disabled", disable);
    SR.btnCommitDate.set("disabled", disable);
    SR.btnAdmitDate.set("disabled", disable);
    SR.crimeTable.datatable.render();
    SR.problemsTable.datatable.render();
    SR.helpsTable.datatable.render();
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