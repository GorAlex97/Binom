"use strict";
$(document).ready( function(){

	var monitorData = JSON.parse( window.JSONContainer );

	Chart.defaults.global.elements.line.borderWidth = 1;
	Chart.defaults.global.elements.point.radius = 0.5;
	Chart.defaults.global.animation.duration = 0;

	var MonitorRenderer = function( monitorData ){

		var _that = this;
		var _wrapperClass = 'monitor_wrapper';
		var _wrapperSelector = '.'+_wrapperClass;

		this.drawed = false;
		this.monitorData = monitorData;

		var _chart = null;

		var _chartCaretFrom = null;
		var _chartCaretTo = null;
		var _chartCaretToEnd = true;

		var _chartDataAvailable = ( typeof monitorData.traffic_chart != 'undefined' );

		this.drawMonitor = function(){

			var warningsErrors = _that.drawWarningErrors();
			var userTrackerInfo = _that.drawUserTrackerInfo();
			var serverInfo = _that.drawServerInfo();
			var chart = (_chartDataAvailable?_that.drawChartContainer():'');
			var links = _that.drawLinks();

			var updatesClearings = _that.drawUpdateCostClearingBlock();

			var refreshButtonStyles = 'position: static;'+
				'margin-left: auto;';

			var refreshButton = '<div class="refresh-monitor-button blue-button" style="' +
				refreshButtonStyles +
				'"><img src="templates/standart/images/w-refresh.png" class="icon"> Refresh </div>';

			var content = warningsErrors + userTrackerInfo + links + serverInfo + chart;

			var headerBlockStyles = 'align-items: center;' +
				'justify-content: space-between;' +
				'margin: -5px 0 15px 0;' +
				'display: flex;' +
				'grid-template-columns: 1fr auto 1fr;';

			var headerColumnStyles = 'flex: 1 0 0;';

			var headerTitleStyles = 'font-size: 20px;' +
				'text-align:center;' +
				'margin: 0;'

			var html = '\
				<div class="analysis_block" style="max-width:790px;margin-top:0;box-sizing:border-box;font-size:13px;">' +
				`<div style="${headerBlockStyles}">
				     <div style="${headerColumnStyles}"></div>
				     <h3 style="${headerColumnStyles}${headerTitleStyles}">Monitor</h3>
				     <div style="${headerColumnStyles}">${refreshButton}</div>
				   </div>` +
				content +
				updatesClearings +
				'</div>';

			return html;
		}

		this.drawLinks = function(){
			var html = '<div id="bnm-page-monitor-links" style="margin-left:130px; margin-bottom: 20px;" >'+
				'<a style="margin-right: 15px;" target="_blank" href="http://binom.org/changelog">Changelog</a>'+
				'<a style="margin-right: 15px;" href="?page=analysis_system&amp;type=check_update">Check update</a>'+
				'<a href="?page=full_exit">Full Exit</a>'+
			'</div>'+
			'<div class="tt_error_wrapper"><div class="system-inline-message error"> <div class="system-inline-message__header">Update Error!</div> <div class="system-inline-message__sub-header"><span>Please, contact to our support.</span></div> <div id="monitor-check-update-error-text" class="system-inline-message__text"></div> </div></div>'
			return html;
		}
		this.drawWarningErrors = function(){
			var warnings = _that.drawWarnings();
			var errors = _that.drawErrors();
			var html = '';
			var resultContent = errors+warnings;
			var supportText = '<div style="margin-bottom:5px;">Please contact <a href="https://cp.binom.org/page/support" target="_blank">support.</a></div>';

			if ( resultContent != '' ) {
				html = '<div class="monitor_warnings_errors_block" >'+errors+warnings+'</div>';
			}

			if (errors) {

				var options = {
					messageType: 'info',
					text: supportText,
				}

				html += this.getInlineMessageHTML(options);
			}

			return html;
		}
		this.drawWarnings = function(){
			var warnings = _that.monitorData.warnings;
			// var warnings = {100: 'warninng 100 blablablab', 200: 'warning 200 lorem lorem lorem vvloremloremloremlorem loremlorem'}
			var html = '';
			var prop;
			if ( warnings ){
				for ( prop in warnings ) {
					if ( warnings.hasOwnProperty(prop) ) {
						var options = {
							messageType: 'disclaimer',
							headerText: 'Warning: ' +  prop,
							text: warnings[prop]
						}

						html += this.getInlineMessageHTML(options);
					}
				}
			}


			return html;
		}

		this.getInlineMessageHTML = function(options) {

			var messageType = options.messageType || '';
			var headerText = options.headerText || '';
			var subHeaderText = options.subHeaderText || '';
			var text = options.text || '';

			var html  = '<div class="system-inline-message '+messageType+'">'+
							'<div class="system-inline-message__header">' + headerText +'</div>'+
							'<div class="system-inline-message__sub-header">'+
								'<span>'+ subHeaderText +'</span>'+
							'</div>'+
							'<div class="system-inline-message__text"><span>'+ text +'</span></div>'+
						'</div>'

			return html;
		}

		this.drawErrors = function(){
			var errors = _that.monitorData.errors;
			// var errors = {100: 'error 100 blablablab', 200: 'error 200 lorem lorem lorem vvloremloremloremlorem loremlorem'}
			var html = '';
			var prop;
			if ( errors ){
				for ( prop in errors ){
					if ( errors.hasOwnProperty(prop) ){

						if (prop == '300') {
							var headerText = 'Update Error';
						} else {
							var headerText = 'Error: ' +  prop;
						}

						var options = {
							messageType: 'error',
							headerText: headerText,
							text: errors[prop]
						}

						html += this.getInlineMessageHTML(options);

					}
				}
			}

			return html;
		}

		this.drawUserTrackerInfo = function(){

			var userInfo = _that.monitorData.user_info;
			var trackerInfo = _that.monitorData.tracker_info;
			var days_left_lic = $.cookie('days_left_lic');
			var userInfoHTML = '<div>'+
									'<span class="monitor_row_title">User:</span> ' +
										userInfo.user_name +
										' (id:'+userInfo.user_id+', Group: '+userInfo.user_group+') '+
									'<br>'+
									'<span class="monitor_row_title">Device:</span> ' + userInfo.user_device + ' (OS:'+ userInfo.user_os +', Browser: '+ userInfo.user_browser +') ' +
								'</div>';

			var trackerInfoHTML = '<div>'+
										'<span class="monitor_row_title">Product:</span> <span>'+trackerInfo.full_name+' </span><br>'+
										'<span class="monitor_row_title">License:</span> <span id="days_left_lic_span">'+ days_left_lic +' days</span>' +
									'</div>';

			var html='<div>'+
						trackerInfoHTML+'<br>'+userInfoHTML+
					'</div>';

			return html;
		}

		this.getDaysStringFromSeconds = function( seconds ){
			if ( seconds == 'Unknown' ) return 'Unknown';
			var days, hours, minutes;

			days = seconds/(24*60*60);

			if ( days>=1 ){
				hours =  ( seconds % (Math.floor(days)*24*60*60) )/(60*60);
			} else {
				hours =  seconds/(60*60);
			}

			if ( days>=1 ){
				minutes = ( seconds % ((Math.floor(days)*24*60*60) + Math.floor(hours)*60*60) )/(60);
			} else {
				minutes = ( seconds - Math.floor(hours)*60*60 ) /(60);
			}

			return Math.floor(days)+' Days ' + Math.floor(hours) +' h. '+Math.floor( minutes )+' m. ';
		}

		this.fetchDBSize = function(){
			$.ajax({
				type: 'post',
				url: "",
				data: {
					ajax: 1,
					type: 'get_db_size',
				},
				success: function( data ){
					var dbSize = JSON.parse( data );
					if (dbSize.size_db!=0 && dbSize.size_db!="oops"){
						var dbFullString = (dbSize.size_db/1000).toFixed(1);
						var dbReportString = (dbSize.size_db_report/1000).toFixed(1);
						var dbClicksString = (dbSize.size_db_clicks/1000).toFixed(1);

						var stringOf = ( '; DB Size: '+dbFullString+' GB ' );

						$('.db_size_span').html( stringOf );
						$('.db_size_span').css( 'color', '' );
					} else {
						$('.db_size_span').html( "" );
					}
				}
			});
		}

		this.drawServerInfo = function(){

			var serverInfo = _that.monitorData.server_info;
			var load = _that.monitorData.load.load;

			var dbSize = _that.monitorData.db_size || { size_db: 50000 };

			var progressBar = _that.drawProgressBar( load, true );


			var DBSize = '<span style="color:#ccc" class="db_size_span"> DB SIZE LOADING </span>';
			// ( dbSize.size_db? ' (DB Size: '+(dbSize.size_db/1000).toFixed(1)+' GB) ' :'' );

			this.fetchDBSize();

			var ROM = (
				(""+serverInfo.rom_total).toLowerCase()=='unknown'
				? serverInfo.rom_total
				: 'Total: '+(serverInfo.rom_total/1000).toFixed(1)+ " GB; Free: "+(serverInfo.rom_free/1000).toFixed(1) + ' GB'
			);

			if(serverInfo.script_status){
				serverInfo.script_status='<div style="margin-bottom: 5px;">'+serverInfo.script_status +'</div>';
			}else{
				serverInfo.script_status='';
			}

			ROM += DBSize;

			var CPU = serverInfo.cpu_name + ' <b>Cores:</b> ' + serverInfo.cpu_cores + ' ('+serverInfo.cpu_siblings+')' ;
			var RAM = ( (""+serverInfo.ram_total).toLowerCase()=='unknown'? serverInfo.ram_total : ( serverInfo.ram_total/1000 ).toFixed(1) + ' GB' );

			var hardDrive = '';
			if ( serverInfo.check_ssd || serverInfo.check_ssd.toLowerCase() == 'ssd' ) hardDrive = '(SSD)';
			else if ( serverInfo.check_ssd || serverInfo.check_ssd.toLowerCase() == 'hdd' ) hardDrive = '(HDD)';

			var html = '<div >'+
								 serverInfo.script_status +
							'<div>'+
								'<span class="monitor_row_title">ROM '+ hardDrive + ':</span> '+ ROM +
							'</div>'+
							'<div>'+
								'<span class="monitor_row_title">RAM Total:</span> '+ RAM +
							'</div>'+
							'<div>'+
								'<span class="monitor_row_title">CPU:</span> '+ CPU +
							'</div>'+
							'<div>'+
								'<span class="monitor_row_title monitor_row_title--php">PHP Version:</span> <span style="display: inline-block;max-width: 550px;">'+ serverInfo.php_v +'</span>'+
							'</div>'+
							'<div>'+
								'<span class="monitor_row_title monitor_row_title--mysql">MySQL Version:</span> <span style="display: inline-block;max-width: 550px;">'+ serverInfo.mysql_v +'</span>'+
							'</div>'+
							'<div>'+
								'<span class="monitor_row_title">OS Version:</span> '+ serverInfo.os_v +
							'</div>'+
							'<div>'+
								'<span class="monitor_row_title">Uptime:</span> '+ _that.getDaysStringFromSeconds(serverInfo.uptime) +
							'</div>'+
							'<div>'+
								'<span class="monitor_row_title">Server Type:</span> '+ serverInfo.server +
							'</div>'+
							'<div style="display: flex;">'+
								'<span class="monitor_row_title">Load Now:</span>&nbsp;<div style="width:100px;display:inline-block;width:200px;">'+ progressBar + '</div>' +
							'</div>'+
					'</div><br>';

			return html;
		}
		this.drawErrorProgressBar = function(){
			var loadPercents = 0;
			var loadPercentsText = "Error. <a href='#' id='restartClearButton' >Restart</a>";
			var progressBarClass = "error-load"
			var html='<div class="progress-bar progress-bar-monitor-load '+progressBarClass+'">\
							<div class="filling" style="width: '+ loadPercents +'%;">\
							</div>\
							<span class="rating_score">'+ loadPercentsText +'</span>'+
						'</div>';
			return html;
		}
		this.drawStopProgressBar = function(){
			var loadPercents = 0;
			var loadPercentsText = "Process is stopped. <a href='#' id='restartClearButton' >Restart</a>";
			var progressBarClass = "little-load"
			var html='<div class="progress-bar progress-bar-monitor-load '+progressBarClass+'">\
							<div class="filling" style="width: 0%;">\
							</div>\
							<span class="rating_score">'+ loadPercentsText +'</span>'+
						'</div>';
			return html;
		}
		this.drawProgressBar = function( load, color ){
			var loadPercents = load || 0;
			var loadPercentsText = loadPercents + " %";
			var color = color || false;
			var progressBarClass;
			if ( color ) {
				if (loadPercents<=90) {
					progressBarClass = "little-load";
				} else if (loadPercents<=95){
					progressBarClass = "normal-load";
				} else {
					progressBarClass = "strong-load";
				}
			} else {
				progressBarClass = "little-load";
			}
			var html='<div class="progress-bar progress-bar-monitor-load '+progressBarClass+'">\
							<div class="filling" style="width: '+ loadPercents +'%;">\
							</div>\
							<span class="rating_score">'+ loadPercentsText +'</span>'+
						'</div>';

			return html;
		}

		this.drawChartContainer = function(){
			// Chart canvas container and div for slider
			var html = '<div class="monitor-chart-wrapper"><canvas id="trafficChart"></canvas></div>' +
				'<div class="chart-slider"></div>';

			return html;
		}
		/**
		* @return Array of arrays[ ['x', ...minutes ], ['Clicks', ...clicks] ]
		*/
		this.getDataForTrafficChart = function(fromValue, toValue){
			var trafficChart = _that.monitorData.traffic_chart;

			var x = trafficChart.time.slice(0);

			var data = trafficChart.clicks.slice(0);

			if ( fromValue && toValue ){
				var fromIndex = x.indexOf( fromValue );
				var toIndex = x.indexOf( toValue )+1;
				x = x.slice(fromIndex, toIndex);
				data = data.slice(fromIndex, toIndex);
			}

			return [ x, data ];

		}
		this.updateChart = function( data ){
			if ( _chart != null ){
				_chart.data.labels = data[0].slice(0);
				_chart.data.datasets[0].data = data[1].slice(0);
				_chart.update();
			}
		}
		this.generateChart = function(fromValue, toValue){
			fromValue = fromValue || false;
			toValue = toValue || false;

			var d = _that.getDataForTrafficChart( fromValue, toValue );

			var ctx = document.getElementById('trafficChart').getContext('2d');

			_chart = new Chart(ctx, {
			    // The type of chart we want to create
			    type: 'line',

			    // The data for our dataset
			    data: {
			        labels: d[0],
			        datasets: [{
			            label: "Clicks " + (new Date()).toDateString(),
			            backgroundColor: 'rgba(71, 108, 255, 0.4)',
			            borderColor: 'rgb(71, 108, 255)',
			            data: d[1],
			            fill: 'start'
			        }]
			    },

			    // Configuration options go here
			    options: {
			    	scales: {
				    	xAxes: [{
			                ticks: {
			                    maxTicksLimit: 24
			                }
			            }],
			            yAxes: [{
			            	ticks: {
			            		beginAtZero: true
			            	}
			            }]
			        }
			    }
			});
		}

		this.drawSlider = function(){

			var timeArr = _that.monitorData.traffic_chart.time;
			var leftCaretPosition = _that.monitorData.traffic_chart.time.indexOf(_chartCaretTo);

			if ( leftCaretPosition == -1 || _chartCaretToEnd ){
				leftCaretPosition = _that.monitorData.traffic_chart.time.length-1;
			}

			$('.chart-slider').ionRangeSlider({
				type: 'double',
				grid: true,
				values: _that.monitorData.traffic_chart.time,
				from: _that.monitorData.traffic_chart.time.indexOf(_chartCaretFrom),
				to: leftCaretPosition,
				onFinish: function (data) {
			        _chartCaretFrom = data.from_value;
			        _chartCaretTo = data.to_value;
			        if ( timeArr.indexOf(_chartCaretTo) != timeArr.length-1 ){
			        	_chartCaretToEnd = false;
			        }
				    var newData = _that.getDataForTrafficChart(_chartCaretFrom, _chartCaretTo);
				    _that.updateChart( newData );
			    },
			});

		}

		this.drawUpdateCostClearingBlock = function(){
			var updateCosts = _that.drawUpdateCosts();
			var clearings = _that.drawClearings();
			var content = updateCosts + clearings;
			var html = '';

			if ( content != '' ){
				html = '<div class="monitor-updates-clearing-block">' + updateCosts + clearings + '</div>';
			}

			return html;
		}

		this.drawUpdateCosts = function(){
			var updates = _that.monitorData.tracker_process_list || [];

			if ( updates.length > 0 ){
				updates = updates.filter( function(item){
					return (item.name == 'Update cost');
				} );
			}

			var html ='';
			updates.forEach(function( up ){
				var progressBar = _that.drawProgressBar( up.progress.replace('%',''), false );
				html += '<div class="monitor-updates-clearing-chunk monitor-updates-clearing-chunk-update-cost">'+
							'<div style="margin-bottom:5px;margin-top:5px;"><span class="monitor_row_title monitor_row_title_narrow">Processing: </span>'+up.time+' s.</div>'+
							'<div><span class="monitor_row_title monitor_row_title_narrow">Progress: </span>'+progressBar+'</div>'+
						'</div>'
			});
			if ( html != '' ) html = `
				<h3 style="text-align:center;margin:0;padding-top: 5px;padding-bottom: 5px;" class="monitor-updates-clearing-block__block-title-slider" onclick="easySlider(this)">
					<img class="easy-toggler-img" style="cursor:pointer;" src="templates/standart/images/arrow_down.png" >
					Cost Updates
				</h3>
				<div style="display:block;">
					${html}
				</div>
				`;
			if ( html!='' ){
				html = `<div class="monitor-updates-clearing__main-section">${html}</div>`;
			}
			return html;
		}
		this.drawClearings = function(){
			if ( !_that.monitorData.clear_process || _that.monitorData.clear_process.length==0 )
				return '';

			var clearings = _that.monitorData.clear_process || [];

			// Find current
			var currentClearing = false;
			_that.monitorData.clear_process.some(function(item){
				if ( item.status!=0 ){
					currentClearing = item;
					return true;
				}
				return false;
			});

			var hasClearingsCanDelete = _that.monitorData.clear_process.some(function(item){
				var status = item.status;

				return parseInt(status, 10) === 0 || status === 'stop';
			});

			// TODO currentClearing Draw

			var htmlCurrentClear;
			var stopButton='';

			function deleteButton(deletingTargetLabel) {
				if (!hasClearingsCanDelete) {
					return '';
				}
				return '<button style="margin-top:10px;'
					+ (stopButton ? 'margin-left: 15px;' : '')
					+ '" id="deleteClearButton" class="bnm-button bnm-button-blue">Delete '
					+ deletingTargetLabel
					+ '</button>'
			};

			if ( currentClearing ){
				if(currentClearing.status=='stop'){
					var progressBar = this.drawStopProgressBar(currentClearing.status, false);
				}else{
					if(currentClearing.status=='error'){
						var progressBar = this.drawErrorProgressBar(currentClearing.status, false);
					}else{
						var progressBar = this.drawProgressBar(currentClearing.status, false);
						var stopButton='<button style="margin-top:10px;" id="stopClearButton" class="bnm-button bnm-button-green">Pause</button>';
					}
				}

				htmlCurrentClear = `
					<div class="monitor-updates-clearing-block__clearing_now">
						<b>Clearing now:</b><br/>
						<span>Campaign ID: ${currentClearing.camp_id}</span>

						<div style="margin-top:10px;">
							${progressBar}
							${stopButton}
							${deleteButton('all')}
						</div>
					</div>
				`;
			} else {
				htmlCurrentClear = `
					<div
					  class="monitor-updates-clearing-block__clearing_now"
					>
            <div>There is no active clearing.</div>
          
					  ${deleteButton('scheduled clearings')}
					</div>
				`;
			}

			var clearingQueryHtml = '';
			if ( clearings && clearings[0] != null )
			{
				var byDateParsed = {};
				var hotQuery = [];
				clearings.forEach(function( cl, index ){
					// Add to hot query
					if (cl.start_clear.substr(0,4)<moment().year()){
						hotQuery.push( cl );
						return;
					}

					// Add to parsed by date
					if ( byDateParsed[cl.start_clear] ){
						byDateParsed[cl.start_clear].push(cl);
					} else {
						byDateParsed[cl.start_clear] = [cl];
					}
				});

				var hotQueryHtml = '';
				if ( hotQuery.length>0 ){
					hotQueryHtml += `
						<div>
							<h3 class="monitor-updates-clearing-block__hot-query-slider micro-base-block-title" onclick="easySlider(this)"> 
								<img class="easy-toggler-img" style="cursor:pointer;position:relative;bottom:2px;" src="templates/standart/images/arrow_up.png" >
								Current clearings
							</h3>
						<div style="display:none;" class="monitor-updates-clearing-block__clearing_query">
					`;
					hotQuery.forEach((cl, index)=>{
						hotQueryHtml += '<span>'+cl.camp_id+ ((index!=hotQuery.length-1)?', ':'') +'</span>';
					});
					hotQueryHtml += '</div>';
				}

				var clearingDates = Object.keys( byDateParsed );
				clearingDates = clearingDates.sort();

				clearingDates.forEach(function( date ){
					clearingQueryHtml += `
						<div>
							<h3 class="monitor-updates-clearing-block__query-date-slider" onclick="easySlider(this)"> 
								<img class="easy-toggler-img" style="cursor:pointer;" src="templates/standart/images/arrow_up.png" >
								${date}
							</h3>
						<div style="display:none;" class="monitor-updates-clearing-block__clearing_query">
					`;
					byDateParsed[date].forEach(function(cl, index){
						if (currentClearing && cl.camp_id==currentClearing.camp_id )
							return;
						// var clearingType = (cl.type=='2'? 'Fast' : 'Full' );
						/*
						html += '<div class="monitor-updates-clearing-chunk">'+
									'<div><span class="monitor_row_title monitor_row_title_narrow">CampID: </span>'+cl.camp_id+'</div>' +
									'<div><span class="monitor_row_title monitor_row_title_narrow">From: </span>'+cl.start_interval+'</div>' +
									'<div><span class="monitor_row_title monitor_row_title_narrow">To: </span>'+cl.end_interval+'</div>' +
									'<div><span class="monitor_row_title monitor_row_title_narrow">Start: </span>'+cl.start_clear+'</div>' +
									'<div><span class="monitor_row_title monitor_row_title_narrow">Status: </span>'+cl.status+'</div>' +
									'<div><span class="monitor_row_title monitor_row_title_narrow">Type: </span>'+cl.type+'</div>' +
								'</div>'
						*/
						var startTime = '';
						if ( cl.start_clear=='1970-01-01 00:00' ){
							startTime = 'query';
						} else {
							startTime = 'Starting at '+ cl.start_clear;
						}
						clearingQueryHtml += '<span>'+cl.camp_id+ ((index!=byDateParsed[date].length-1)?', ':'') +'</span>';
					});
					clearingQueryHtml += '</div></div>'
				});



				if ( clearingQueryHtml!='' ){
					clearingQueryHtml = `
					<h3 class="micro-base-block-title" onclick="easySlider(this)"> 
						<img class="easy-toggler-img" style="cursor:pointer;" src="templates/standart/images/arrow_up.png" /> 
						Planned clearings
					</h3>
					<div class="clearing-list" style="display:none;">
						<div>
							<!-- 
							<div>
								<b>Clearing query:</b>
							</div> 
							-->
							${clearingQueryHtml}
						</div>
					</div>`;
				}

			}

			var html = '';
			html = htmlCurrentClear+hotQueryHtml+clearingQueryHtml;

			html = `
				<div class="monitor-updates-clearing__main-section">
					<h3 onclick="easySlider(this)" style="cursor:pointer;user-select:none;text-align:center;margin-top:0px;margin-bottom:5px;"> 
						<img class="easy-toggler-img" style="cursor:pointer;position:relative;bottom:2px;" src="templates/standart/images/arrow_down.png" /> 
						Clearings
					</h3>
					<div style="display:block">
						${html}
					</div>
				</div>
			`;

			return html;
		}

		this.init = function(){
			if ( !_that.drawed ) {
				_that.draw();
				this.setHandlers();
			}
		}

		this.draw = function(){
			var html = '';
			html += _that.drawMonitor();
			$(_wrapperSelector).html( html );
			_that.drawed = true;

			if ( _chartDataAvailable ){
				if ( _chartCaretToEnd ){
					_chartCaretTo = _that.monitorData.traffic_chart.time[ _that.monitorData.traffic_chart.time.length-1 ];
				}

				_that.generateChart(_chartCaretFrom, _chartCaretTo);
				_that.drawSlider();
			}
		}

		this.redraw = function(){
			this.draw();
		}

		function sendAjaxRequestAndRefreshData(requestType) {
			$.ajax({
				url: '',
				type: 'post',
				data: {
					ajax: 1,
					ajax_type: 'write',
					type: requestType,

				},
				success: function( data ){
					setTimeout(_that.getAsyncMonitorData(), 500);
				}
			});
		}

		this.stopClear = function(){
			sendAjaxRequestAndRefreshData('stopClear');
		}

		this.deleteClear = function(){
			makeConfirmModal(
				"OK",
				"Cancel",
				function () {
					sendAjaxRequestAndRefreshData('delClear');
				},
				"",
				"Are you sure you want to delete all clearings?",
				{closing_ok_wrap: true}
			)
				.show();
		}

		this.restartClear = function(){
			sendAjaxRequestAndRefreshData('restartClear');
		}

		this.getAsyncMonitorData = function(){
			$(_wrapperSelector).find('.analysis_block').css('visibility');
			if ( _chart!=null ) _chart.destroy();
			$.ajax({
				url: '',
				type: 'post',
				data: {
					ajax: 1,
					type: 'get_monitor_data',

				},
				success: function( data ){
					data = JSON.parse(data);
					_that.monitorData = data;
					_that.redraw();
				}
			});
		}
		this.toggleClearingShow = function(){
			var list = $(_wrapperSelector).find('.clearing-list');
			if ( list.css('display') == 'none' ) {
				list.css('display', 'block');
				$('.clearing-toggler').replaceWith('<img class="clearing-toggler" style="cursor:pointer;" src="templates/standart/images/arrow_up.png" />');
			} else {
				list.css('display', 'none');
				$('.clearing-toggler').replaceWith('<img class="clearing-toggler" style="cursor:pointer;" src="templates/standart/images/arrow_down.png" />');
			}
		}
		this.setHandlers = function(){
			$(_wrapperSelector).on('click', '.refresh-monitor-button', _that.getAsyncMonitorData );
			$(_wrapperSelector).on('click', '#restartClearButton', _that.restartClear );
			$(_wrapperSelector).on('click', '#stopClearButton', _that.stopClear );
			$(_wrapperSelector).on('click', '#deleteClearButton', _that.deleteClear );

			$(_wrapperSelector).on('click', '.clearing-toggler', _that.toggleClearingShow);
		}

	}

	BINOM.monitorObj = new MonitorRenderer( monitorData );
	BINOM.monitorObj.init();

});
