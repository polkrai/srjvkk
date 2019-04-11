/* Copyright (c) 2008 Shift Right Technology co. ltd. */
var loader = new YAHOO.util.YUILoader({
    require: ["button", "reset", "fonts", "base",
              "yahoo-dom-event",
              "datatable", "connection", "json"],
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
}

function setupLeftPane(){
    var waitQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", width:200, resizeable:true},
             {key:"queuetime", label:"เวลา", width:80}];
        this.query = "dept=social&type=wait"
        this.datasource = new YAHOO.util.DataSource(
            "/srcommon/queue?",
            {responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"Queue",
                fields:["name", "visitno", "queuetime"]}});
        
        this.datatable = new YAHOO.widget.DataTable("left_queue_pane",
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
    
    var doneQ = new function(){
        this.coldefs =
            [{key:"name", label:"ชื่อ - สกุล", size:200, resizeable:true},
             {key:"queuetime", label:"เวลา", width:80}];
        this.query = "dept=social&type=done"
        this.datasource = new YAHOO.util.DataSource(
            "/srcommon/queue?",
            {responseType:YAHOO.util.DataSource.TYPE_JSON,
             responseSchema:{resultsList:"Queue",
                fields:["name", "visitno", "queuetime"]}});
        
        this.datatable = new YAHOO.widget.DataTable("left_queue_done_pane",
            this.waitColDefs, this.datasource,
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
    return pane;
}

loader.insert();

