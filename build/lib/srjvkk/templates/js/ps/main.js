function initExtraComponent() {
	
	setBeforeTabChangedCallback({
		
		success: function(oldValue, newValue) {
			
			if (newValue == 1) {
				var param = "";
				if (SR.waitQ.qInfo && SR.waitQ.qInfo.pa_id && SR.waitQ.qInfo.pa_id != -1) {
        			param = "&pa_id=" + SR.waitQ.qInfo.pa_id;
        		}
        		
        		$('frame-appointment').src = url.med.appointment + "&com_id=" + SR.comid + param;
			}
		}
	});
	setQueueSelectedCallback({
		
		success: function() {
			var param = "";
			if (SR.waitQ.qInfo && SR.waitQ.qInfo.pa_id && SR.waitQ.qInfo.pa_id != -1) {
				param = "&pa_id=" + SR.waitQ.qInfo.pa_id;
			}
			
			$('frame-appointment').src = url.med.appointment + "&com_id=" + SR.comid + param;
		}
	});
}