var TtClicklogStuff = function(){

	var _that = this;

	this.sortingSettings = (function(){
		var GETS = URLUtils.getGETParamsAsObject();
		if ( GETS.order && GETS.type ){
			return {
				column: GETS.order,
				direction: GETS.type
			}
		} else {
			return {
				column: 'time_click',
				direction: 'DESC'
			}
		}
	})();

	this.currentState = { loading: false }

	this.headerSortingClick = function( span ){
		var column = $(span).parent().parent().attr('data-column');
		var direction = 'DESC';

		if ( column == this.sortingSettings.column ){
			if ( this.sortingSettings.direction == 'DESC' ){
				direction = 'ASC';
			}
		}

		this.sortingSettings = {column:column, direction:direction};
		
		const newGets = {};
		newGets.order = this.sortingSettings.column;
		newGets.type = this.sortingSettings.direction;

		BINOM.tt.addArrowToTh( this.sortingSettings.direction, this.sortingSettings.column );
		URLUtils.changeGETsInURL(newGets);
		BINOM.tt.refetchData({saveScroll: false});

	}
	this.setHandlers = function(){
		var that = this;
		$('body').on('click', '.tt_header_table th span', function(){ that.headerSortingClick( this ); } );
	}

	this.init = function(){
		this.setHandlers();
		BINOM.tt.addArrowToTh( this.sortingSettings.direction, this.sortingSettings.column );
	}

}
// TtStuff declare in tt.js
TtClicklogStuff.prototype = new TtStuff();


$(document).ready(function(){

	var tableClicklogOptions = {

		columns: {
			time_click:{
				key: 'time_click',
				name: 'Time Click'
			},
			path:{ 
				key:'path', 
				name:'Path' 
			},
			keyword:{ 
				key:'keyword', 
				name:'Campaign Key' 
			},
			rotation:{ 
				key:'rotation', 
				name:'Rotation' 
			},
			landing_page:{
				key:'landing_page', 
				name:'Landing Page'
			},
			traffic_source:{
				key:'traffic_source', 
				name:'Traffic Source'
			},
			aff_network:{
				key:'aff_network',
				name: 'Affiliate Network'
			},
			country:{
				key:'country',
				name: 'Country'
			},
			region:{
				key: 'region',
				name: 'Region'
			},
			city:{
				key:'city',
				name: 'City'
			},
			ISP:{
				key:'ISP'
			},
			connection_type:{
				key:'connection_type',
				name: 'Connection type'
			},
			proxy:{
				key:'proxy',
				name: 'Proxy'
			},
			IP:{
				key:'IP',
				name: 'IP'
			},
			user_agent:{
				key:'user_agent',
				name: 'User Agent'
			},
			crawler:{
				key:'crawler',
				name: 'Crawler'
			},
			device_type:{
				key:'device_type',
				name: 'Device Type'
			},
			device_brand:{
				key:'device_brand',
				name: 'Device Brand'
			},
			device_model:{
				key:'device_model',
				name: 'Device Model'
			},
			device_resolution:{
				key:'device_resolution',
				name: 'Device Resolution'
			},
			display_sise:{
				key:'display_sise',
				name: 'Display Size'
			},
			OS:{
				key:'OS',
				name: 'OS'
			},
			browser:{
				key:'browser',
				name: 'Browser'
			},
			language:{
				key:'language',
				name: 'Language'
			},
			referer_domain:{
				key:'referer_domain',
				name: 'Referer Domain'
			},
			referer_url:{
				key:'referer_url',
				name: 'Referer URL'
			},
			token_1:{
				key:'token_1',
				name:'Token 1'
			},
			token_2:{
				key:'token_2',
				name:'Token 2'
			},
			token_3:{
				key:'token_3',
				name:'Token 3'
			},
			token_4:{
				key:'token_4',
				name:'Token 4'
			},
			token_5:{
				key:'token_5',
				name:'Token 5'
			},
			token_6:{
				key:'token_6',
				name:'Token 6'
			},
			token_7:{
				key:'token_7',
				name:'Token 7'
			},
			token_8:{
				key:'token_8',
				name:'Token 8'
			},
			token_9:{			
				key:'token_9',
				name:'Token 9'
			},
			token_10:{
				key:'token_10',
				name:'Token 10'
			},
			event_1:{
				key: 'event_1',
				name: 'Event 1'
			},
			event_2:{
				key: 'event_2',
				name: 'Event 2'
			},
			event_3:{
				key: 'event_3',
				name: 'Event 3'
			},
			event_4:{
				key: 'event_4',
				name: 'Event 4'
			},
			event_5:{
				key: 'event_5',
				name: 'Event 5'
			},
			event_6:{
				key: 'event_6',
				name: 'Event 6'
			},
			event_7:{
				key: 'event_7',
				name: 'Event 7'
			},
			event_8:{
				key: 'event_8',
				name: 'Event 8'
			},
			event_9:{
				key: 'event_9',
				name: 'Event 9'
			},
			event_10:{
				key: 'event_10',
				name: 'Event 10'
			},
			external_ID:{
				key:'external_ID', 
				name: 'External ID'
			},
			is_bot:{
				key:'is_bot',
				name: 'Is Bot'
			},
			uniqueness:{
				key:'uniqueness',
				name: 'Uniqueness'
			},
			payout:{
				key:'payout',
				name: 'Payout'
			},
			conversion:{
				key: 'conversion',
				name: 'Conversion'	
			},
			conversion_time:{
				key: 'conversion_time',
				name: 'Conversion Time'	
			},
			conversion_status:{
				key:'conversion_status',
				name: 'Conversion Status'
			},
			conversion_status_2:{
				key:'conversion_status_2',
				name: 'Conversion Status 2'
			},
			LP_click:{
				key:'LP_click',
				name: 'LP Click'
			},
			CPC:{
				key:'CPC',
				name: 'CPC'
			},
		},
		availableColumns: [
			'click_id',
			'time_click',
			'camp_name',
			'path',
			'offer_name',
			'keyword',
			'rotation',
			'landing_page',
			'traffic_source',
			'aff_network',
			'country',
			'region',
			'city',
			'ISP',
			'connection_type',
			'proxy',
			'IP',
			'user_agent',
			'crawler',
			'device_type',
			'device_brand',
			'device_model',
			'device_resolution',
			'display_sise',
			'OS',
			'browser',
			'language',
			'referer_domain',
			'referer_url',
			'event_1',
			'event_2',
			'event_3',
			'event_4',
			'event_5',
			'event_6',
			'event_7',
			'event_8',
			'event_9',
			'event_10',
			'token_1',
			'token_2',
			'token_3',
			'token_4',
			'token_5',
			'token_6',
			'token_7',
			'token_8',
			'token_9',
			'token_10',
			'external_ID',
			'is_bot',
			'uniqueness',
			'payout',
			'conversion',
			'conversion_time',
			'conversion_status',
			'conversion_status_2',
			'LP_click',
			'CPC'
		],
		checkbox: true,
		unique: 'click_id',
		tableKind: 'clicklog'
	}

	var showedColumnsDefault = ['click_id', 'time_click', 'camp_name', 'country', 'IP', 'OS', 'browser', 'token_1', 'token_2', 'conversion'];
	var defaultShowedColumnSettings = {
		columns: {
			path:false,
			offer_name:false,
			keyword:false,
			rotation:false,
			landing_page:false,
			traffic_source:false,
			aff_network:false,
			region:false,
			city:false,
			ISP:false,
			connection_type:false,
			proxy:false,
			user_agent:false,
			crawler:false,
			device_type:false,
			device_brand:false,
			device_model:false,
			device_resolution:false,
			display_sise:false,
			language:false,
			referer_domain:false,
			referer_url:false,
			event_1:false,
			event_2:false,
			event_3:false,
			event_4:false,
			event_5:false,
			event_6:false,
			event_7:false,
			event_8:false,
			event_9:false,
			event_10:false,
			token_3:false,
			token_4:false,
			token_5:false,
			token_6:false,
			token_7:false,
			token_8:false,
			token_9:false,
			token_10:false,
			external_ID:false,
			is_bot:false,
			uniqueness:false,
			payout:false,
			conversion_time:false,
			conversion_status:false,
			conversion_status_2:false,
			LP_click:false,
			CPC: false
		}
	};


	var dataFromBack = JSON.parse( window.JSONContainer );

	tableClicklogOptions.showedColumns=tableClicklogOptions.availableColumns.slice(0);
	tableClicklogOptions.mainSetColumns=tableClicklogOptions.availableColumns.slice(0);

	if ( dataFromBack.showedColumnsSettings ) tableClicklogOptions.showedColumnsSettings=dataFromBack.showedColumnsSettings;

	if ( dataFromBack.showedColumnsSettings ){
		tableClicklogOptions.mainSetColumns = tableClicklogOptions.mainSetColumns.filter(function(item){
			return (typeof dataFromBack.showedColumnsSettings[item]=='undefined');
		});
	} else {
		tableClicklogOptions.mainSetColumns = showedColumnsDefault.slice(0);
		tableClicklogOptions.defaultShowedColumnSettings = defaultShowedColumnSettings;
	}

	tableClicklogOptions.showedColumnsSettings = dataFromBack.showedColumnsSettings;

	TT_makeTT( dataFromBack, tableClicklogOptions, function(){}, function(){} );
	$('.json_container').remove();

	BINOM.ttClicklogStuff = new TtClicklogStuff();
	BINOM.ttClicklogStuff.init();

	BINOM.ttPagination = new TtPagination( {clicklog: true} );
	BINOM.ttPagination.init();

	// Parameters open clicklog
	$('#get_win_parameters').on('click', function(){ 
		BINOM.ttSettingsClicklog.show();
	});



	$('body').on('input', '[name=search_clickid]', function(){
		var text = $(this).val();
		$('#refresh-btn').removeClass('blue-button');
		$('#refresh-btn').addClass('green-button');
		$('#refresh-btn').html('<img src="templates/standart/images/w-ok.png" class="icon" style="position: relative; top: 1px;">Apply');
	});

});

function submitForm(){
	var params = Object.create(null);

	params.num_page = 1;
	params.search_clickid = document.querySelector('[name=search_clickid]').value; 
	params.campaign = document.querySelector('[name=campaign]').value;
	params.date = document.querySelector('[name=date]').value;
	if ( params.date==12 || params.date==10 ){
		params.date_s = document.querySelector('[name=date_s]').value;
		params.date_e = document.querySelector('[name=date_e]').value;
	}

	URLUtils.changeGETsInURL( params );
	BINOM.tt.refetchData();

	makeFilterBlockApplyButtonRefresh();
}