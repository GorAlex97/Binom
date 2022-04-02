$(document).ready(function(){

	var fromValue = getURLParameter('from');
	if (fromValue) {
		$.cookie('df', fromValue, { expires: 365 });
	}

	if(!$.cookie('live_demo_time')){
		$.cookie('live_demo_time', Math.round(new Date().getTime()/1000.0),{ expires: 3600});
	}
	if(!$.cookie('live_demo_pages')){
		$.cookie('live_demo_pages',1,{ expires: 3600});
	}
	var now_time=Math.round(new Date().getTime()/1000.0);
	var pages = $.cookie('live_demo_pages');
	var ldtime = $.cookie('live_demo_time');
	
	if((pages!=='none' && Number(pages)>4) || (ldtime!=='none' && (Number(now_time)-Number(ldtime))>(3*60))){
		$.cookie('live_demo_pages', 'none');
		$.cookie('live_demo_time', 'none');
		w = makeConfirmModal(
			"Sign Up",
			"Close",
			function(){
				var from = getURLParameter('from') || $.cookie('df') || 'live-demo';
				window.open('https://binom.org/signup?from=' + from, '_blank');
			},
			"Dear Friend!", "If you like our live-demo and feel to be awesome - contact our support team right away! They will take a good care of you, install the tracker and answer all of your questions.<img style='margin-top: 15px;' src='templates/standart/images/livedemo.gif'>",
			{styles:{"max-height":"1000px", "top":"25%", "width":"500px"}}
		)
		w.show();
	}else{
		$.cookie('live_demo_pages',(Number((pages==='none'?0:pages))+1),{ expires: 3600});
	}
});


$(window).resize(function(e){
	var width = window.innerWidth;
	if (width<1370){
		$('.menu_demo_like').css('display', 'none');
	} else {
		$('.menu_demo_like').css('display', 'inline');
	}	
});