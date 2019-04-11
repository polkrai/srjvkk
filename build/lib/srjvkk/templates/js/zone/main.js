function initExtraComponent() {
	setBeforeTabChangedCallback({
		success: function(oldValue, newValue) {
			if (newValue == 5) {
        		$('frame_refer_send').src = url.med.referSend;
			}
			if (newValue == 6) {
        		$('frame_refer_reply').src = url.med.referReply;
			}
		}
	});
}