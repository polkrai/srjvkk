/* Copyright (c) 2008 Shift Right Technology co. ltd. */
var loader = new YAHOO.util.YUILoader({
    require: ["button", "reset", "fonts", "base",
              "yahoo-dom-event", "element", "dragdrop",
              "datatable", "connection", "json", "container", "tabview"],
    allowRollups: true,
    base: "/yui/",
    onSuccess: function() {
        YAHOO.util.Event.onDOMReady(initComponents);
    },
    onFailure: function(){
        alert("ไม่สามารถดึงโปรแกรมจาก server ได้สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
});

var SR = new Object();

function initComponents(){
    SR.leftPane = setupLeftPane();
    SR.workspaceTab = setupTabPane();
    initButtons();
}

function initButtons() {
    SR.logoutBtn = new YAHOO.widget.Button("logout_button");
}

function setupLeftPane(){
    var waitQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", width:180, resizeable:true},
             {key:"queuetime", label:"เวลา", width:50}];
        this.query = "comp=finance&type=wait"
        this.datasource = new YAHOO.util.DataSource(
            "/srutil/queue?",
            {connXhrMode: "cancelStaleRequest",
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"QueueResult.Queue",
                fields:["name", "vn", "queuetime"]}});
        
        this.datatable = new YAHOO.widget.DataTable("left_queue_pane",
            this.coldefs, this.datasource,
            {initialRequest:this.query,
             scrollable:true, width:"280px", height:"250px"});
        this.datatable.set("selectionMode","single");
        this.datatable.subscribe("rowClickEvent", this.datatable.onEventSelectRow);
        this.handleQueueClicked = function(oArgs){
            var wq = SR.leftPane.waitQ;
            var row = wq.datatable.getSelectedRows()[0];
            var record = wq.datatable.getRecord(row);
            wq.currentVn = record.getData("vn");
            loadImportantInfo(wq.currentVn);             
            var vcs = SR.workspaceTab.datasource;
            var vct = SR.workspaceTab.datatable;
            var oCallback = {
                success : vct.onDataReturnInitializeTable,
                failure : vct.onDataReturnInitializeTable,
                scope : vct
            };
            vcs.sendRequest("vn_id=" + wq.currentVn, oCallback);
        }
        this.datatable.subscribe("rowClickEvent", this.handleQueueClicked, this);
        
        this.handleQueueLoaded = function(oRequest, oResponse, oPayload){
            var wq = SR.leftPane.waitQ;
            var result = wq.datatable.onDataReturnInitializeTable(oRequest, oResponse, oPayload);
            var rcset = wq.datatable.getRecordSet();
            var rcs = rcset.getRecords();
            for(var i =0; i < rcs.length; i++){
                if(rcs[i].getData("vn") == wq.currentVn){
                    wq.datatable.selectRow(rcs[i]);
                }
            }
            return result;
        }
        var callback = { 
            success : this.handleQueueLoaded, 
            failure : this.datatable.onDataReturnInitializeTable, 
            scope : this.datatable };
        this.intervalId = this.datasource.setInterval(3000,
            this.query, callback);
        this.currentVn = -1;
    };
    
    var doneQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", size:180, resizeable:true},
             {key:"queuetime", label:"เวลา", width:50}];
        this.query = "comp=finance&type=done"
        this.datasource = new YAHOO.util.DataSource(
            "/srutil/queue?",
            {connXhrMode: "cancelStaleRequest",
             responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"QueueResult.Queue",
                fields:["name", "vn", "queuetime"]}});
        this.datatable = new YAHOO.widget.DataTable("left_queue_done_pane",
            this.coldefs, this.datasource,
            {initialRequest:this.query,
             scrollable:true, width:"280px", height:"250px"});
        var callback = { 
            success : this.datatable.onDataReturnInitializeTable, 
            failure : this.datatable.onDataReturnInitializeTable, 
            scope : this.datatable };
        this.intervalId = this.datasource.setInterval(3000,
            this.query, callback);
    };
    
    var pane = new Object();
    pane.waitQ =waitQ;
    pane.doneQ =doneQ;
    return pane;
}

function setupTabPane(){
    var pane = new function(){
        this.tabpane = new YAHOO.widget.TabView("workspace_pane");        
    };
    return pane; 
}


function loadImportantInfo(vnId) {
    var pif = document.getElementById("patient_info");    
    var hnspan = document.getElementById("hn_span");
    
    var AjaxObject = {

        handleSuccess:function(o){
            this.processResult(o);
        },

        handleFailure:function(o){
            // Failure handler
        },

        processResult:function(o){
            // This member is called by handleSuccess
            try { 
                var result = YAHOO.lang.JSON.parse(o.responseText); 
                var info = result.ImportantInfoResult.ImportantInfo;
                pif.innerHTML = "<b>ข้อมูลสำคัญ</b><br />" + "<b>ชื่อ-สกุล: </b>" + info.name + 
                                " <b>อายุ: </b>" + info.age + " <b>การศึกษา: </b>" + "<br />" + 
                    "<b>เชื้อชาติ: </b>" + info.origin + " <b>สัญชาติ: </b>" + info.nationality +
                    " <b>ศาสนา: </b>" + info.religion + "<br />" +
                    "<b>สถานะ: </b>" + info.status + " <b>อาชีพ: </b>" + info.job +
                    " <b>สิทธิ์: </b>" + "<br />" +
                    "<b>ที่อยู่: </b>" + info.address;             
                hnspan.innerHTML = "HN: " + info.hn;
            } 
            catch (e) { 
                alert("Invalid data"); 
            } 
        },

        startRequest:function() {
            YAHOO.util.Connect.asyncRequest('POST', '/srutil/important_info', callback, "vn_id=" + vnId);
        }
    }

    var callback =
    {
        success:AjaxObject.handleSuccess,
        failure:AjaxObject.handleFailure,
        scope: AjaxObject
    };

    AjaxObject.startRequest();    
    
}

loader.insert();

