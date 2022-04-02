function initConversionTT(initData, tableWrapperSelector) {

	if (typeof tableWrapperSelector === 'undefined') tableWrapperSelector = '#table-block';

	if ( typeof window.ttConversionStuff == 'undefined' ){
		window.TtConversionStuff = function(){

			var containerPaginationClass = "tt_report_pagination";
		  	var containerPaginationSelector = "."+containerPaginationClass;

			var currentState = {
				loading: false
			}

			function getSortingSettings(){
				var GETS = URLUtils.getGETParamsAsObject();
				var cnv_filter = GETS.cnv_filter || 'click_time';
				var cnv_order = GETS.cnv_order || 'DESC';

				return {cnv_filter: cnv_filter, cnv_order: cnv_order};
			}

			this.sortingSettings = getSortingSettings();

			this.drawPaginationBlock = function(){}

			this.columnNameToCnvFilter = function( column ){

				var cnv_filter = 1;
				switch(column){
					case('click_id'):
						cnv_filter=1;
					break;
					case('camp_name'):
						cnv_filter=7;
					break;
					case('ts_name'):
						cnv_filter=8;
					break;
					case('click_time'):
						cnv_filter=2;
					break;
					case('time'):
						cnv_filter=3;
					break;
					case('period'):
						cnv_filter=9;
					break;
					case('pay'):
						cnv_filter=4;
					break;
					case('status'):
						cnv_filter=10;
					break;
					case('offer_name'):
						cnv_filter=5;
					break;
					case('geo'):
						cnv_filter=6;
					break;
				}
				return cnv_filter;
			}

			this.headerSortingClick = function( span ){
				var column = $(span).parent().parent().attr( 'data-column' );

				if ( column=='click_id' ) return;
				if ( currentState.loading ) return;
				// TODO cnv_order

				var GETS = URLUtils.getGETParamsAsObject();
				
				var cnv_order;
				var cnv_filter = column;
				GETS.cnv_filter = cnv_filter;

				if ( this.sortingSettings.cnv_filter == cnv_filter ){
					if ( this.sortingSettings.cnv_order=='DESC' ){
						cnv_order = 'ASC';
					} else {
						cnv_order = 'DESC';
					}
				} else {
					cnv_order = 'ASC';
				}


				GETS.cnv_order = cnv_order;

				this.sortingSettings.cnv_filter = cnv_filter;
				this.sortingSettings.cnv_order = cnv_order;

				BINOM.tt.addArrowToTh( (cnv_order), column );
				URLUtils.changeURLWithNewGETS( GETS );
				
				var that = this;

				if ( URLUtils.historyIsActive ){
					GETS.printdataasjson = 1;
					var fetchURL = URLUtils.getURLWithNewGETS( GETS );
					BINOM.tt.refetchData();
				}
			}

			// END MAKE HTML
			this.setHandlers = function(){
				var that = this;
				$("body").on('click', '.tt_header_table th span', function(){ that.headerSortingClick( this ); });
			}

			this.init = function(){
				// TODO Pagination BLOCK
				this.drawPaginationBlock();
				this.setHandlers();
			}
		}
		window.TtConversionStuff.prototype = new TtStuff();
	}


	var dataFromBack;
	if (initData) {
		dataFromBack = initData;
	} else if ( $('.json_container').length > 0 ){
		dataFromBack = JSON.parse( $('.json_container').html() );
	} else {
		dataFromBack = JSON.parse( window.JSONContainer );
	}

	var tableConversionOptions = {
		tableKind: 'conversion',
		columns:{
			time:{
				key: 'time',
				name: 'Conversion Time',	
			},
			period:{
				key: 'period',
				name: 'Time since click'
			},
			pay:{
				key: 'pay',
				name: 'Payout'	
			},
			status:{
				key: 'status',
				name: 'Status'
			},
		},
		// Basis of basis
		// Order, what will render and etc.
		availableColumns: [ 
		      'click_id', 
		      'camp_name', 
		      'ts_name', 
		      'click_time', 
		      'time', 
		      'period', 
		      'pay', 
		      'status',  
		      'offer_name', 
		      'geo'
		],
		unique: 'click_id',
		deletedStatus: false,
		checkbox: true,
		tableWrapperSelector: tableWrapperSelector,
	}

	tableConversionOptions.mainSetColumns = tableConversionOptions.availableColumns.slice(0);

	TT_makeTT( dataFromBack, tableConversionOptions, function(){}, function(){} );
	$('.json_container').remove();

	if (typeof BINOM.ttConversionStuff === 'undefined'){ 
		BINOM.ttConversionStuff = new TtConversionStuff();
	}
	
	BINOM.ttConversionStuff.init();

	BINOM.tt.addArrowToTh( BINOM.ttConversionStuff.sortingSettings.cnv_order, BINOM.ttConversionStuff.sortingSettings.cnv_filter );

	if (typeof BINOM.ttPagination === 'undefined'){ 
		BINOM.ttPagination = new TtPagination();
	}
	
	BINOM.ttPagination.init();

}