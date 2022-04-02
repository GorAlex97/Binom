// Give attention to order of formatters
/*
  FooterSum calc type 'sum' is default value.
  It is mean that if footer equal true and footerCalc is undefined,
  footerSum will calculate as sum
*/
'use strict';
var TEMPLATES_IMAGES = './templates/standart/images/';

var filePreloader = {
  files : [
    TEMPLATES_IMAGES+'up_3.png',
    TEMPLATES_IMAGES+'down_3.png',
    TEMPLATES_IMAGES+'logo-binom.png',
    TEMPLATES_IMAGES+'settings.png'
  ],
  preloadFiles: function(){
    this.files.forEach(function( item ){
      var img = document.createElement('img');
      img.src = item;
    });
  }
}

var asyncAnimation = '<div class="uil-async-css" style="transform:scale(0.05);margin-right:10px;margin-bottom:5px;"><div></div><div></div></div>';

filePreloader.preloadFiles();

function clearLSReload(){
  localStorage.removeItem( "campaigns_columnsWidth" );
  localStorage.removeItem( "campaigns_showedColumns" );
  window.location.reload();
}
  
var TT_DEFAULT_OPTIONS = {
  columns: {
      'name' : {
        key: 'name',
        name: 'Name',
        align: 'left',
        format: 'string'
        // TODO настройки для асинхронной подгрузки 
      },
      'login' : {
        key: 'login',
        name: 'Login',
        align: 'left',
        format: 'string'
        // TODO настройки для асинхронной подгрузки 
      },
      'id' : {
        key: 'id',
        name: 'ID',
        align: 'right'
      },
      'unique_clicks' : {
        key: 'unique_clicks',
        name: 'U. Clicks',
        formatters: ['threenumeralcommas']
      },
      'unique_camp_clicks' : {
        key: 'unique_camp_clicks',
        name: 'U. Camp Clicks',
        formatters: ['threenumeralcommas']
      },
      'offers':{
        key: 'offers',
        name: 'Offers',
      },
      'group_name' : {
        key: 'group_name',
        name: 'Group',
        tab:'stat',
        format: 'string',
        formatters: ['zeroempty']
      },
      'ts_name' : {
        key: 'ts_name',
        tab: 'stat',
        name: 'Traffic Source',
        format: 'string'
      },
      'camps' : {
        key: 'camps',
        tab: 'stat',
        name: 'Campaigns',
        format: 'integer'
      },
      'tokens' : {
        key: 'tokens',
        tab: 'stat',
        name: 'Tokens',
        format: 'integer',
        formatters: ['yesno']
      },
      'geo' : {
        key: 'geo',
        name: 'Geo',
        format: 'string',
        formatters: ['zeronone', 'oneisglobal']
      },
      'network_name' : {
        key: 'network_name',
        name: 'Network',
        format: 'string',
        formatters: ['zeroempty']
      },
      click_id:{
        key: 'click_id',
        name: 'Click ID',
        align: 'left'
      },
      camp_name:{
        key: 'camp_name',
        name: 'Campaign'
      },
      offer_name:{
        key: 'offer_name',
        name: 'Offer Name'
      },
      click_time:{
        key: 'click_time',
        name: 'Time Click',
      },
      'cr' : {
        key: 'cr',
        name: 'CR',
        tab: 'stat',
        formatters: ['decimalplaces'],
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['leads', 'clicks'],
          calcFunc: function( sumFooter ){
            var sumLeads = sumFooter['leads'];
            if ( typeof sumLeads == 'undefined' || isNaN(sumLeads) ){
              sumLeads = sumFooter['cnt_cnv'];
            }
            if ( sumFooter['clicks'] > 0 ){
              return sumLeads/sumFooter['clicks']*100;
            } else {
              return 0;
            }
          }
        }
      },
      'epc' : {
        key: 'epc',
        name: 'EPC',
        tab: 'stat',
        formatters: ['decimalplaces', 'threenumeralcommas'],
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['clicks', 'revenue'],
          calcFunc: function( sumFooter ){
            var sumRev = sumFooter['revenue'];
            if ( typeof sumRev == 'undefined' || isNaN( sumRev ) ){
              sumRev = sumFooter['summ_cnv'];
            }
            if ( sumFooter['clicks'] > 0 ){
              return sumRev/sumFooter['clicks'];
            } else {
              return 0;
            }
          }
        }
      },
      'revenue' : {
        key: 'revenue',
        name: 'Revenue',
        tab: 'stat',
        formatters: ['decimalplaces', 'threenumeralcommas'],
        footer: true,
        footerCalc: 'sum'
      },
      'summ_cnv' : {
        key: 'summ_cnv',
        name: 'Revenue',
        tab: 'stat',
        formatters: ['decimalplaces', 'threenumeralcommas'],
        footer: true,
        footerCalc: 'sum'
      },
      'cost' : {
        key: 'cost',
        formatters: ['decimalplaces', 'threenumeralcommas'],
        tab: 'stat',
        name: 'Cost',
        footer: true
      },
      'Spend' : {
        key: 'Spend',
        formatters: ['decimalplaces', 'threenumeralcommas'],
        tab: 'stat',
        name: 'Cost',
        footer: true
      },
      'profit' : {
        key: 'profit',
        name: 'Profit',
        footer: true,
        footerCalc: 'sum',
        formatters: ['decimalplaces', 'threenumeralcommas'],
        stat: false,
        align: 'right',
        bold: true
      },
      'lp_ctr' : {
        key: 'lp_ctr',
        name: 'LP CTR',
        tab: 'stat',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['lp_views', 'lp_clicks'],
          calcFunc: function( sumFooter ){
            if ( sumFooter['lp_views'] > 0 ) {
              return sumFooter['lp_clicks']/sumFooter['lp_views']*100;
            } else {
              return 0;
            }
          }
        },
        formatters: ['decimalplaces', 'threenumeralcommas'],
        stat: false,
        align: 'right'
      },
      'roi' : {
        key: 'roi',
        name: 'ROI',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['cost', 'profit'],
          calcFunc: function( sumFooter ){
            var profit = (+sumFooter['profit']).toFixed( 5 );
            var cost = (+sumFooter['cost']).toFixed( 5 );
            if ( cost==0 ){
              return 0;
            } else {
              return profit/cost*100;
            }
          }
        },
        formatters: ['decimalplaces', 'threenumeralcommas'],
        stat: false,
        align: 'right',
        bold: true
      },
      'clicks' : {
        key:'clicks',
        name: 'Clicks',
        footer: true,
        footerCalc: 'sum',
        formatters: ['threenumeralcommas'],
        align: 'right'
      },
      'cpc' : {
        key: 'cpc',
        name: 'CPC',
        tab: 'stat',
        formatters: ['decimalplaces','threenumeralcommas'],
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['clicks', 'cost'],
          calcFunc: function( sumFooter ){
            
            var sumSpend = sumFooter['cost'];
            if ( typeof sumSpend == 'undefined' || isNaN(sumSpend) ){
              sumSpend = sumFooter['Spend'];
            }

            if ( sumFooter['clicks'] > 0 ){
              return sumSpend/sumFooter['clicks'];
            } else {
              return 0;
            }
          }
        }
      },
      'leads' : {
        key: 'leads',
        name: 'Leads',
        tab: 'stat',
        footer: true,
        footerCalc: 'sum',
        formatters: ['threenumeralcommas']
      },
      'cnt_cnv' : {
        key: 'cnt_cnv',
        name: 'Leads',
        tab: 'stat',
        footer: true,
        footerCalc: 'sum'
      },
      'url' : {
        key: 'url',
        name: 'Link',
        tab:'info',
        formatters: ['readonlyinput']
      },
      'start_date':{
        key: 'start_date',
        name: 'Start Date',
        tab:'info',
        formatters: ['zeroempty', 'timestamptodate']
      },
      'current_cpc':{
        key: 'current_cpc',
        name: 'Current CPC',
        tab: 'info',
        formatters: []
      },
      'clicks_lh':{
        key: 'clicks_lh',
        align: 'right',
        name: 'CLH',
        async: true,
        tab: 'info',
        formatters: []
      },
      'leads_lh':{
        key: 'leads_lh',
        name: 'LLH',
        async: true,
        tab: 'info',
        formatters: []
      },
      'profit_lh':{
        key: 'profit_lh',
        name: 'PLH',
        async: true,
        tab: 'info',
        formatters: ['dollarsign', 'redgreengrey']
      },
      'last_lead':{
        key: 'last_lead',
        name: 'Last Lead',
        async: true,
        tab: 'info',
        formatters: []
      },
      'ea':{
        key: 'ea'
      },
      // NEW BUILTIN
      'a_leads':{
        key: 'a_leads',
        footer: true,
        footerCalc: 'sum'
      },
      'approve':{
        key: 'approve',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['event_2', 'leads'],
          calcFunc: function( sumFooter ){
            var event_2 = sumFooter['event_2'];
            var leads = sumFooter['leads'];
            if ( leads == 0 ) return 0;
            else return event_2/leads*100;
          }
        }
      },
      'r_leads':{
        key: 'r_leads',
        footer: true,
        footerCalc: 'sum'
      },
      'reject':{
        key: 'reject',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['event_3','leads'],
          calcFunc: function( sumFooter ){
            var event_3 = sumFooter['event_3'];
            var leads = sumFooter['leads'];
            if ( leads==0 ) return 0;
            else return event_3/leads*100;
          }
        }
      },
      'r_revenue':{
        key: 'r_revenue',
        footer: true,
        footerCalc: 'sum'
      },
      'h_leads':{
        key: 'h_leads',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['leads', 'event_2', 'event_3'],
          calcFunc: function( sumFooter ){
            var leads = sumFooter['leads'];
            var event_2 = sumFooter['event_2'];
            var event_3 = sumFooter['event_3'];

            return leads-event_2-event_3;    
          }
        }
      },
      'hold': {
        key: 'hold',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['leads', 'event_2', 'event_3'],
          calcFunc: function( sumFooter ){
            var leads = sumFooter['leads'];
            var event_2 = sumFooter['event_2'];
            var event_3 = sumFooter['event_3'];
            if ( leads == 0 ) return 0;
            else return (leads-event_2-event_3)/leads*100;
          }
        }
      },
      'h_revenue':{
        key: 'hold',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: [ 'event_1', 'revenue', 'event_4' ],
          calcFunc: function( sumFooter ){
            var event_1 = sumFooter['event_1'];
            var revenue = sumFooter['revenue'];
            var event_4 = sumFooter['event_4'];
            return event_1-revenue-event_4;
          }
        }
      },
      
      'e_revenue':{
        key: 'hold',
        footer: true,
        footerCalc: 'sum'
      },
      'e_profit': {
        key: 'e_profit',
        footer: true,
        footerCalc: 'sum'
      },
      'e_roi':{
        key: 'e_roi',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['event_1', 'e_profit', 'cost'],
          calcFunc: function( sumFooter ){
            const eProfit = sumFooter['e_profit'];
            if ( typeof eProfit!='undefined' && !isNaN(eProfit) ){
              const cost = sumFooter['cost'];
              
              if (cost == 0) return 0;
              else return eProfit/cost*100;
            }
            return 0;
          }
        }
      },
      
      'ecpa':{
        key: 'ecpa',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['revenue', 'leads'],
          calcFunc: function( sumFooter ){
            var revenue = sumFooter['revenue'];
            var leads = sumFooter['leads'];
            if ( leads == 0 ) return 0;
            else return revenue/leads;
          }
        }
      },
      'rebills':{
        key: 'rebills',
        footer: true,
        footerCalc: 'sum'
      },
      'unsubs':{
        key: 'unsubs',
        footer: true,
        footerCalc: 'sum'
      },
      'buyouts':{
        key: 'buyouts',
        footer: true,
        footerCalc: 'sum'
      },
      'unsubs_prc':{
        key: 'unsubs_prc',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['event_6','leads'],
          calcFunc: function( sumFooter ){
            var event_6 = sumFooter['event_6'];
            var leads = sumFooter['leads'];
            if ( leads == 0 ) return 0;
            else return event_6/leads*100;
          }
        },
      },
      'ros':{
        key: 'ros',
        footer: true,
        footerCalc: {
          basedOnFinal: true,
          neededColumns: ['event_5', 'leads'],
          calcFunc: function( sumFooter ){
            var event_5 = sumFooter['event_5'];
            var leads = sumFooter['leads'];
            if ( leads == 0 ) return 0;
            else return event_5/leads;
          }
        }
      },
      'inst_unsubs':{
        key: 'inst_unsubs',
        footer: true,
        footerCalc: 'sum'
      },
      // EVENTS 
      'event_1':{
        key: 'event_1',
        name: 'Event 1',
        footer: true,
        footerCalc: 'sum'
      },
      'event_2':{
        key: 'event_2',
        name: 'Event 2',
        footer: true,
        footerCalc: 'sum'
      },
      'event_3':{
        key: 'event_3',
        name: 'Event 3',
        footer: true,
        footerCalc: 'sum'
      },
      'event_4':{
        key: 'event_4',
        name: 'Event 4',
        footer: true,
        footerCalc: 'sum'
      },
      'event_5':{
        key: 'event_5',
        name: 'Event 5',
        footer: true,
        footerCalc: 'sum'
      },
      'event_6':{
        key: 'event_6',
        name: 'Event 6',
        footer: true,
        footerCalc: 'sum'
      },
      'event_7':{
        key: 'event_7',
        name: 'Event 7',
        footer: true,
        footerCalc: 'sum'
      },
      'event_8':{
        key: 'event_8',
        name: 'Event 8',
        footer: true,
        footerCalc: 'sum'
      },
      'event_9':{
        key: 'event_9',
        name: 'Event 9',
        footer: true,
        footerCalc: 'sum'
      },
      'event_10':{
        key: 'event_10',
        name: 'Event 10',
        footer: true,
        footerCalc: 'sum'
      }
  },
  deletedStatus: 'status',
  findInColumns: [ 'name' ],
  tabs: {
    showed: 'stat',
    tabs: ['info', 'stat']
  },
  unique: 'id',
  tableKind: 'stats',
  reportLevelProp: 'Level',
  defaultShowedColumnSettings: {
    columns:{
      'event_3':false,
      'event_4':false,
      'event_5':false,
      'event_6':false,
      'event_7':false,
      'event_8':false,
      'event_9':false,
      'event_10':false,
      'unique_camp_clicks':false,
      'unique_clicks':false
    }
  },
  listOfStringColumns: ['name', 'group_name', 'role', 'traffic_source', 'ts_name', 'geo', 'lang', 'network', 'login', 'click_id', 'md5_name']
}

/* UTILS */
function findObjectInArray( array, prop, value ){
  for (var i=0;i<array.length;i++){
    if (array[i][prop]==value){
      return array[i];
    }
  }
  return false;
}

// Function for checking is scroll bar added to div or not
jQuery.fn.hasScrollBar = function( direction ){
    direction = direction || 'vertical';
    
    if (direction == 'vertical') {
      return this.get(0).scrollHeight > this.innerHeight();
    } else if (direction == 'horizontal') {
      return this.get(0).scrollWidth > this.innerWidth();
    }
    
    return false;
}

/**
* Check profit/roi and return classes for colorize
* @param roi Integer/String(valid for parseInt) 
* @param profit Integer/String(valid for parseInt) 
*/
function checkForTrColorize( roi, profit ){

  if ( typeof roi == "undefined" ){
    roi = 0;
  }

  if ( typeof profit == "undefined" ){
    profit = 0;
  }

  var positive_class = "green_row_opacity";
  var negative_class = "red_row_opacity";
  var positive_ranges = [0, 21, 41, 61, 81, 101, 121, 141, 161, 181, 200];
  var negative_ranges = [0, -21, -41, -61, -81, -100];
  var colors = {
    greenColor: {
      light: '200,230,201',
      dark: '50,205,50',
    },
    redColor: {
      light: '255,204,188',
      dark: '128,0,0',
    }
  }
  var theme = window.$rootStore.state.Settings.settings.appearance || 'light';
  var resultClass = '';
  var profitClass = '';
  var gradientClass = '';

  if ( profit<0 ){
    profitClass += 'tr_profit_3';
  } else if ( profit>0 ){
    profitClass += 'tr_profit_1';
  } else {
    profitClass += 'tr_profit_2';
  }

  if ( window.TT_COLORIZE == 1 ) {

    var volume, rgbaValue=0, color='';

    if ( roi>0 ){
      color = 'green';
      if ( roi<200 ){
        rgbaValue = roi/200;
      } else if ( roi>=200 ){
        rgbaValue = 1;
      }
    } else if (roi<0) {
      color = 'red';
      if (roi>-100){
        rgbaValue = -roi/100;
      } else if ( roi <= -100 ){
        rgbaValue = 1;
      }
    }

    rgbaValue = rgbaValue.toFixed(2);

    if ( rgbaValue < 0.1 ) rgbaValue = 0.1;
    if (theme === 'dark') rgbaValue /= 2;
    var resultStyle = '';
    if ( color=='green' ) {
      resultStyle = `background-color: rgba(${colors.greenColor[theme]},${rgbaValue});`;
    } else if ( color=='red' ) {
      resultStyle = `background-color: rgba(${colors.redColor[theme]},${rgbaValue});`;
    }
  }

  resultClass = profitClass;

  return [resultStyle, resultClass];
}

function getProportianalTransparentCellColor(min, max, value, withColor = false){
  
  min   = parseFloat(min)
  max   = parseFloat(max)
  value = parseFloat(value)
  
  var color, 
      opacity, 
      numRange,
      fontColor
  
  if ( value < 0){
    color = `rgba(255,204,188,`;
    //fontColor = '#C62828';
  } else {
    color = `rgba(200,230,201,`;
    //fontColor = '#388E3C';
  }
  
  if ( min < 0 ){
    numRange = (value < 0) ?  Math.abs(min) : max 
    value    = Math.abs(value)
  } else {
    numRange = Math.abs(  max - min )
    value    = Math.abs( value - min )
  }
  opacity = (value / numRange).toFixed(4)
  
  opacity = (opacity < 0.05) ?  0.05 : opacity
  if(value == 0) {
    opacity = 0;
  }
  color  += `${opacity})`
  if(opacity > 0.7) fontColor = '#000000';
  return {
    bgColor: color,
    fontColor
  }
}

// TOOD вынести в binomscript в какую-нибудь глобальную область
// Needed for correlate header/footer (scroll's width)
function checkBrowser(){

  var browser = '';

  if (navigator.userAgent.indexOf("Opera") != -1){
    browser = 'Opera';
  } else if (
      (navigator.userAgent.indexOf("MSIE") != -1 ) || 
      (navigator.userAgent.indexOf("Edge") != -1 ) ||
      (!!document.documentMode == true )
    ) /*IF IE > 10*/ { 
    browser = 'IE';
  } else if (navigator.userAgent.indexOf('OPR') != -1 ) {
    browser = 'Opera';
  } else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
    browser = 'Chrome';
  } else if(navigator.userAgent.indexOf("Safari") != -1) {
    browser = 'Safari';
  } else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
    browser = 'Firefox';
  } else  {
    browser = 'unknown';
  }

  return browser;
}

function getScrollWidth(){
  var browser = checkBrowser();
  var widths = {
    Opera: 5,
    IE:25,
    Chrome: 5,
    Safari: 5,
    Firefox: 17,
    unknown: 25
  };
  return widths[browser];
}

function makeFunctionForTotalFromColumnFormula( columnOptions ){
  const {key_name='unknown column'} = columnOptions;
  // exceptions
  if (!columnOptions.footerCalc) throw new Error(`Have not footerCalc in ${key_name}`);
  if (!columnOptions.footerCalc.neededColumns) throw new Error(`Have not neededColumns in ${key_name}`);
  if (!columnOptions.footerCalc.calcFunc) throw new Error(`CalcFunc is not passed in ${key_name}`);
  if (typeof columnOptions.footerCalc.calcFunc != 'string') throw new Error(`CalcFunc is not String in ${key_name}`);

  const { footerCalc: {calcFunc, neededColumns} } = columnOptions;

  let formula = calcFunc;
  let vars = '';
  columnOptions.footerCalc.neededColumns.forEach(el=>{
      const test = (/^[a-zA-Z0-9_]*$/ig).test(el);
      if ( test ){
        vars += `var ${el}=parseFloat(total.${el}) || 0;`;
      } else {
        console.warn(`Strange column: ${el}. When calculating total it will be equal zero.`)
        vars += `var ${el}=0;`;
      }
  });

  const calculateByFormula = new Function(`total`, `${vars} return ${formula};`);

  const catchDecorator = function(total){
    try{
      const result = calculateByFormula(total);
      // handling /0 (divinity on zzero)
      if ( isFinite(result) ) return result;
      else return 0;
    } catch (e) {
      console.error( e );
      console.error( `Cannot calculate total from ${key_name} formula: ` );
      console.error( `  calcFunc: ${calcFunc}` );
      console.error( `  Formula: ${formula}` );
      return 0;
    }
  }

  return catchDecorator;
}

function markRow( row ){

  if ( BINOM.tt.markedRows.checked.length > 0 ){
    return;
  }
  var wasMarked = row.hasClass('selected_row') ;
  $(".selected_row").removeClass( 'selected_row' );
  BINOM.tt.markedRows.selected = new Array();
  if ( !wasMarked ){
    row.addClass( 'selected_row' );
    let rowID;
    if (row.attr('id')) {
      rowID = row.attr('id').replace('ttrowuid', '');
    } else {
      rowID = row.attr('data-tt-row-uid');
    }
    
    if (typeof rowID!== "undefined") { // Empty string acceptable
      BINOM.tt.markedRows.selected.push(rowID);
      BINOM.tt.markedRows.lastMarked = rowID;
    }
  }
  VmStoreSyncing.selectedRowsSync();
}

function TT_addCheckboxDefaultHandlers( ttObject, callback ){

  var selectorCheckbox = "";

  if ( BINOM.tt.tableOptions.tableKind=='report' ) selectorCheckbox = ".tt_data_wrapper tr td .cute_checkbox"
  else selectorCheckbox = ".tt_data_wrapper tr td.cell_with_checkbox";

  $(BINOM.tt.tableOptions.tableWrapperElement).on("click", selectorCheckbox, function(e){

    e = e || event;

    if ($(e.target).hasClass('noncheckrow')) return;

    var row = (BINOM.tt.tableOptions.tableKind=='report'?$(this).parent().parent().parent().parent():$(this).parent()),
      row_uid = row.attr('id').replace('ttrowuid', ''),
      checkbox = (BINOM.tt.tableOptions.tableKind=='report'?$(this):$(this).find(".checkrow"));

    // Clearing all marked row
    $(".selected_row").removeClass( 'selected_row' );
    BINOM.tt.markedRows.selected = new Array();
    VmStoreSyncing.selectedRowsSync();
    // Clear decreasing by choose tow in report page
    if ( BINOM.tt.tableOptions.tableKind == 'report' ){
      BINOM.ttReportStuff.redrawFooter(true);
    }

    // TODO обрабатывать вариант нажатия с шифтом по одной и той же строке
    if ( BINOM.keyPressed.shift ){

      if ( BINOM.tt.tableOptions.tableKind=='report' )  return;
      const propUnique = BINOM.tt.tableOptions.unique;
      // With true as last prop return index
      var rowIndex = BINOM.tt.tableData.findObjectByProp( propUnique, row_uid, true );

      if ( BINOM.tt.markedRows.checked.length>0 ){
        // Находим id ластчекнутого и чекнутого сейчас
        var lastCheckedUID = BINOM.tt.markedRows.checked[ BINOM.tt.markedRows.checked.length-1 ];
        var lastCheckedIndex = BINOM.tt.tableData.findObjectByProp( propUnique, lastCheckedUID, true);
        var currentRowIndex = BINOM.tt.tableData.findObjectByProp( propUnique, row_uid, true);

        if ( currentRowIndex > lastCheckedIndex ){
          var startIndex = lastCheckedIndex+1;
          var finishIndex = currentRowIndex;
        } else  {
          var startIndex = currentRowIndex;
          var finishIndex = lastCheckedIndex-1;
        }

        for ( var i=startIndex;i<=finishIndex;i++ ){
          var uid = BINOM.tt.tableData[i][propUnique];

          // Not exist already and not hided
          if ( !BINOM.tt.markedRows.checked.includes(uid) && !BINOM.tt.tableData[i].hidedFromTt )
              BINOM.tt.markedRows.checked.push( uid );
          
          $('#ttrowuid'+uid)
            .addClass('checked_row')
            .find('.cute_checkbox')
            .addClass('checked');
        }
        BINOM.tt.markedRows.lastMarked = finishIndex;
        VmStoreSyncing.checkedRowsSync();
        return;
      } else {
        checkbox.addClass( 'checked' );
        row.addClass("checked_row");
        BINOM.tt.markedRows.checked.push( row_uid );
        BINOM.tt.markedRows.lastMarked = row_uid;
        VmStoreSyncing.checkedRowsSync();
        return;
      }
    }

    if ( checkbox.hasClass("checked") ){
      checkbox.removeClass( 'checked' );    
      row.removeClass("checked_row");
      BINOM.tt.markedRows.checked.splice( BINOM.tt.markedRows.checked.indexOf(row_uid) ,1);
      BINOM.tt.markedRows.lastMarked = row_uid;
      // remove All
      var checkAllCheckbox = $(".tt_header_wrapper ."+BINOM.tt.tableOptions.checkbox+"_th .cute_checkbox");
      if ( checkAllCheckbox.length>0 && checkAllCheckbox.hasClass('checked') ){
        checkAllCheckbox.removeClass( 'checked' );
      }
    } else {
      checkbox.addClass( 'checked' );
      row.addClass("checked_row");
      BINOM.tt.markedRows.checked.push( row_uid );
      BINOM.tt.markedRows.lastMarked = row_uid;
    }

    VmStoreSyncing.checkedRowsSync();

    e.stopImmediatePropagation();
    e.stopPropagation();

    if ( typeof callback == 'function' ){
      callback();
    }
  });

  BINOM.tt.handlersState.checkbox = true;
}

function TT_addCheckboxAllHandler( ttObject, callback ){

  $(BINOM.tt.tableOptions.tableWrapperElement).on("click", ".tt_header_wrapper .cell_with_checkbox .cute_checkbox", function(){
    if ( $(this).hasClass('checked') ){

      $(this).removeClass( 'checked' );
      $(".tt_data_wrapper .cute_checkbox.checked")
        .removeClass( 'checked' )
        .parent().parent().parent().parent()
        .removeClass('checked_row'); 
      BINOM.tt.markedRows.checked.splice(0);
    } else {
      $(this).addClass( 'checked' );
      $(".tt_data_wrapper .cute_checkbox:not(.checked)")
        .addClass( 'checked' )
        .parent().parent().parent().parent()
        .addClass('checked_row'); 
      var allIds = BINOM.tt.getShowedTableDataIds( BINOM.tt.tableData );
      BINOM.tt.markedRows.checked = allIds; 

      // Clear selected
      $('.selected_row').removeClass('selected_row');
      BINOM.tt.markedRows.selected.splice(0);
    }

    VmStoreSyncing.checkedRowsSync();
    VmStoreSyncing.selectedRowsSync();

    if ( typeof callback == 'function' ){
      callback();
    }
  });

  BINOM.tt.handlersState.checkboxAll = true;
}

function TT_addRowClickDefaultHandlersStats( ttObject, callback ){

  const clickableElementsSelectors = [];
  if ( BINOM.tt.tableOptions.rowClickableElements ){
    Object.keys( BINOM.tt.tableOptions.rowClickableElements ).forEach( s=>clickableElementsSelectors.push(s) );
  }

  $(BINOM.tt.tableOptions.tableWrapperElement).on("click", ".tt_data_wrapper tr", function(e){

    const $clickTarget = $(e.target);
    let clickableElementSelector;
    // find is click on one from clickable elements
    let onClickableElement = clickableElementsSelectors.some( s=>{
        if ( $clickTarget.is(s) ){
          clickableElementSelector = s;
          return true;
        }
        return false;
    });
    // Get handler and call it
    if ( onClickableElement ) {
      const handler = BINOM.tt.tableOptions.rowClickableElements[clickableElementSelector];
      let rowID;
      if ($(this).attr('id')) {
        rowID = $(this).attr('id').replace('ttrowuid', '');
      } else {
        rowID = $(this).attr('data-tt-row-uid');
      }
      const uniqueProp = BINOM.tt.tableOptions.unique;
      const rowData = BINOM.tt.tableData.find( row=>row[uniqueProp]==rowID );
      handler(rowData);
      return;
    }

    e = e || event;

    if (  $(e.target).hasClass('noncheckrow') ){
      return;
    }

    if ( BINOM.tt.tableOptions.tableKind == 'report' ){
      if ( $(e.target).hasClass('report_row_toggler') ){
        return;
      } else {
        markRow( $(this) );  
      }
    } else {

      markRow( $(this) );
    }

    if ( typeof callback == 'function' ){
      callback();
    }

  });
}

function TT_addRowDblClickDefaultHandlers( ttObject, callback ){

  $(BINOM.tt.tableOptions.tableWrapperElement).on("dblclick", ".tt_data_wrapper tr", function(){

    var id;
    if ( $(this).attr("id") ){
      id = $(this).attr("id").replace('ttrowuid', '');
    } 
    
    if ( typeof callback == 'function' ){
      callback( id );
    }

  });
}

function TT_addRowClickDefaultHandlersReport( ttObject, callback ){
  $( ttObject.tableOptions.tableWrapperSelector ).on("click", ".tt_data_wrapper tr", function( e ){
    var e = e || window.event;

    if ( BINOM.tt.markedRows.checked.length != 0 )  return;

    if ( $(e.target).hasClass('report_row_toggler') ){
      return;
    }

    var row = $(this);
    var row_uid = row.attr("id").replace( "ttrowuid", "" );

    if ( BINOM.keyPressed.shift ) {
      if ( BINOM.tt.markedRows.selected.length>0 ) {
        var wasMarked = row.hasClass('selected_row');
        
        var lastSelectedIndex = 
          wasMarked ?
            +BINOM.tt.markedRows.lastMarked :
            +BINOM.tt.markedRows.selected[ BINOM.tt.markedRows.selected.length-1 ];;

        if ( row_uid > lastSelectedIndex ) {
          var startIndex = lastSelectedIndex+1;
          var finishIndex = +row_uid;
        } else  {
          var startIndex = +row_uid;
          var finishIndex = lastSelectedIndex-1;
        }
        if(wasMarked) {
          for ( var i=startIndex;i<=finishIndex;i++ ) {
            //тоталы считаются по массивам строк
            let index = i.toString();
            if ( BINOM.tt.markedRows.selected.includes(index) )
                BINOM.tt.markedRows.selected.remove( index );    
                $('#ttrowuid'+i).removeClass('selected_row');
                if ( BINOM.ttReportStuff.onSelectRowHandler ){
                  BINOM.ttReportStuff.onSelectRowHandler( index );
                }
          }
        }
        else {
          for ( var i=startIndex;i<=finishIndex;i++ ) {
            let index = i.toString();
            if ( !BINOM.tt.markedRows.selected.includes(index) )
                BINOM.tt.markedRows.selected.push( index );    
                $('#ttrowuid'+i).addClass('selected_row');
                if ( BINOM.ttReportStuff.onSelectRowHandler ){
                  BINOM.ttReportStuff.onSelectRowHandler( index );
                }
          }
        }

      } else {
        row.addClass("selected_row");
        BINOM.tt.markedRows.selected.push( row_uid );
        BINOM.tt.markedRows.lastMarked = row_uid;
      }
  }
  else {
    if ( row.hasClass('selected_row') ){
      row.removeClass( 'selected_row' );
      BINOM.tt.markedRows.selected.remove( row_uid );
    } else {
      row.addClass( 'selected_row' );
      BINOM.tt.markedRows.selected.push( row_uid );
    }
    BINOM.tt.markedRows.lastMarked = row_uid;
    if ( BINOM.ttReportStuff.onSelectRowHandler ){
      BINOM.ttReportStuff.onSelectRowHandler( row_uid );
    }
  }

    if ( BINOM.tt.markedRows.selected.length > 0 ){
      // DrillDown
      $("#drilldown").css( "display", "inline-block" );
    } else {
      $("#drilldown").css( "display", "none" );
    }

    VmStoreSyncing.selectedRowsSync();

    $(window).trigger('resize');
  });
}

function TT_addRowDblClickDefaultHandlersReport( ttObject, callback ){ 

  $( ttObject.tableOptions.tableWrapperSelector ).on("dblclick", ".tt_data_wrapper tr", function(){
  });
}

function summOptions( options ){
    if ( typeof options == "undefined" ){
      throw new Error('Options for TT was not passed!');
    }
    // If pass single object
    if ( typeof options == "object" && !options.length ) {
      return options;
    } else if ( Array.isArray( options ) ) {
        // Object passed first will rewrite by next
        var collectedOptions = Object.assign({}, options[0]);
        for (var i=0;i<options.length;i++){

            for ( var prop in options[i] ){
                // If object is columns coz column is complex object with many props
                // Rewrite it full
                // But not delete those that first object has but second dont
                if ( prop == "columns" && options[i][prop] ){
                  for ( var column in options[i][prop] ){
                    collectedOptions[prop][column] = options[i][prop][column];
                  }
                // Else just rewrite
                } else {
                    if (typeof options[i][prop] != "undefined"){
                        collectedOptions[prop] = options[i][prop];
                    }
                }
            }

        }
    }

    return collectedOptions;
}

function parseColumnsSettingsToTTSettings( columnsSettings ){
    // Settings how to print columns { name, key, formatters, deceimals, measure }
    var columns = Object.create( null );
    var availableColumns = new Array();
    var mainSetColumns = new Array();

    columnsSettings.forEach(function( column ){

      var parsedColumnOption = Object.create(null);

      // All passed add to available
      availableColumns.push( column.key_name );
      // If column available on this page - add do MainSetColumns
      if ( column[BINOM.__page] == 1 ) mainSetColumns.push( column.key_name );

      // This column is in the settings
      // Take options from default_options and rewrite only name and measure
      if ( TT_DEFAULT_OPTIONS.columns[column.key_name] ){
        parsedColumnOption = Object.assign({}, TT_DEFAULT_OPTIONS.columns[column.key_name]);
        // Get all from Default settings besides Name
        parsedColumnOption.name = column.name;
        // This column is NOT in the settings
        parsedColumnOption.measure = column.measure;
      } else {

        parsedColumnOption = {
          name: column.name, key: column.key_name,
          measure: column.measure,
          format: (column.is_text==1?"string":"number")
        }

      }
      
      if ( !parsedColumnOption.formatters ) {
        parsedColumnOption.formatters = [];
      }

        // Adding default number formatter - threenumeralcommas
        if ( TT_DEFAULT_OPTIONS.listOfStringColumns.indexOf(column.key_name)==-1 && column.measure!='#t#' && column.key_name!='id' ){
          parsedColumnOption.formatters.push( 'threenumeralcommas' )
        }

        if ( column.measure == '#t#' ) {

          if ( parsedColumnOption.formatters.indexOf( 'timevalue' )==-1 ) 
            parsedColumnOption.formatters.push( 'timevalue' );

        } else if ( column.measure == '%' ) {

          if ( parsedColumnOption.formatters.indexOf( 'percentagesign' )==-1 ) 
            parsedColumnOption.formatters.push( 'percentagesign' );

        } else if ( column.measure == '$' ) {

          if ( parsedColumnOption.formatters.indexOf('dollarsign')==-1 ) 
            parsedColumnOption.formatters.push( 'dollarsign' );
          if ( parsedColumnOption.formatters.indexOf('brackets')==-1 ) 
            parsedColumnOption.formatters.push( 'brackets' );
        

        } else if ( column.measure && column.measure != '' && column.measure != 0 ) {

          if ( parsedColumnOption.formatters.indexOf('custommeasure') == -1 ) 
            parsedColumnOption.formatters.push( 'custommeasure' ); 

        } 

        if (typeof column.footer == 'undefined'){
          // total type it is scheme by which footer sum will calculate
          if (column.total_type){
            if (column.total_type=='1'){ // mean sum
              parsedColumnOption.footer = 'sum'
            } else if (column.total_type=='2' || column.total_type=='3') {
              // TODO ВОЗМОЖНО НУЖНО БУДЕТ ДЕЛАТЬ СЛОЖНЫЕ ШТУКИ 
              const { formula=false } = column;
              if (formula!==false){
                parsedColumnOption.footerCalc ={
                  basedOnFinal: true,
                  neededColumns: [],
                  calcFunc: formula
                }
                if(column.total_type == '2') {
                  parsedColumnOption.footer = 'average';
                }
                else if(column.total_type == '3') {
                  parsedColumnOption.footer = 'averageSmart';  
                }
                // Parse formula
                const formulaElements = formula.split(/[\+\-\*\/\(\)\^]/);
                // Add finded formula's elements to the needColumns Array
                formulaElements.forEach(elem=>{
                  const trimmed = elem.trim();
                  // last condition check is elem number
                  if (trimmed!='' && !parsedColumnOption.footerCalc.neededColumns.includes(trimmed) && !(/^[0-9\,\.]+$/).test(trimmed) ){
                    parsedColumnOption.footerCalc.neededColumns.push(trimmed);
                  }
                });
                parsedColumnOption.footerCalc.calcFunc = makeFunctionForTotalFromColumnFormula(parsedColumnOption);
                parsedColumnOption.footerCalc.calcFuncGeneratedFromFormula = true;
              }
            }
          }          
        }

        if ( column.key_name == 'profit' || column.key_name=='roi' ){ parsedColumnOption.formatters.push( 'redgreengrey' ) }

        columns[column.key_name] = parsedColumnOption;
    });

    return {
      columns: columns,
      availableColumns: availableColumns,
      mainSetColumns: mainSetColumns,
    };
}

/*
 * Set some default values for complete ttOptions object.
 * @param {object} ttOptions Object with tt options.
 * @returns {object} return ttOptions but editing via reference not coping it
*/
const setDefaultValuesForTTOptions = (ttOptions)=>{
    // Set default tableWrapperSelector if it was not passed
    if (!ttOptions.tableWrapperSelector){
      ttOptions.tableWrapperSelector = '#table-block';
    }
    // Set default tableWrapperElement
    // TODO EXPERIMENTAL SETTINGS
    ttOptions.tableWrapperElement = document.querySelector( ttOptions.tableWrapperSelector );

    // Full width settings maximize by default
    if (typeof ttOptions.fullWindowHeight=='undefined'){
      ttOptions.fullWindowHeight = true;
    }

    return ttOptions;
}

const makeTTInstance = (tableOptions)=>{
    var parsedColumnsSettings = Object.create(null);
    if ( tableOptions.columnsSettings )
      var parsedColumnsSettings = parseColumnsSettingsToTTSettings( tableOptions.columnsSettings );

    // Make single options' objects from three difference object sources
    let ttOptions = summOptions( [TT_DEFAULT_OPTIONS, tableOptions, parsedColumnsSettings] );

    // DEFAULT SETTINGS 
    setDefaultValuesForTTOptions(ttOptions);
   
    // Make uid of tt 
    if (typeof BINOM!='undefined' && BINOM.__pageType) // from pageType if it original tracker page
      ttOptions.uid = BINOM.__pageType;
    else // just get timestamp
      ttOptions.uid = Date.now();
    
    // Make TT instance
    // Without data. Make it based on settings
    return TtFactory( ttOptions );
}

const setDataToTTInstance = (data, ttInstance)=>{
    // For report
    if ( data == null ) {
        ttInstance.setData( data );
    } else if ( data.dataSet ){
        ttInstance.setData( data.dataSet );
        if ( data.total ){
          ttInstance.setTableTotal( data.total );
        }
        // It mean ,pagination and other
        if ( data.pageOptions ){
          ttInstance.setPageOptions( data.pageOptions );
        }
    } else {
      ttInstance.setData( data );    
    }

    return ttInstance;
}

/**
* @param data object Data From server
* @param tableOptions object dataSettings for table, was set in page js file
* @param setButtonState function row click handler
* @param dblClickRowHandler function row dblclickhandler
*/
function TT_makeTT( data, tableOptions, setButtonState, dblClickRowHandler ){
    // Make tt instance 
    BINOM.tt = makeTTInstance(tableOptions);
    BINOM.tt = setDataToTTInstance(data, BINOM.tt);

    // ADD TABLE SETTINGS (GEAR ICON IN RIGHT BOTTOM)

    // Add icon-button for column settings
    if ( BINOM.ttSettingsAvailable && BINOM.__page!='clicklog' ){
      // Init ttSettingsWindow (Vue inner)
      drawTTSettingsIcon();
    } 

    BINOM.tt.tableOptions.setButtonState = setButtonState;

    if ( BINOM.tt.tableOptions.checkbox ) {
      TT_addCheckboxDefaultHandlers( BINOM.tt, function(){ setButtonState(); } );
      TT_addCheckboxAllHandler( BINOM.tt, setButtonState );
    }

    if ( BINOM.tt.tableOptions.tableKind == 'report' ){
      TT_addRowClickDefaultHandlersReport( BINOM.tt, function(){} );
      // TT_addRowDblClickDefaultHandlersReport( BINOM.tt, function(){} );
    } else {
      TT_addRowClickDefaultHandlersStats( BINOM.tt, setButtonState );
    }

    TT_addRowDblClickDefaultHandlers( BINOM.tt, dblClickRowHandler );

    if ( BINOM.ttKeyboard ){
      // Add keyboard handler
      BINOM.ttKeyboard.init();
    } else {
      console.warn('BINOM.ttKeyboard undefined. go without');
    }

    // Add searching
    // Need to add before init()
    if ( ['campaigns', 'landing_page', 'offers', 'affiliate_networks', 'traffic_sources', 'rotations', 'users'].indexOf(BINOM.__pageType) != -1 ) {
      if ( $('[name=search_name]').length ){
          BINOM.tt.addSearch("[name=search_name]");
      }
    }
    
    BINOM.tt.init();

}

function TT_checkCheckboxReportEnabled(reportGroups) {
  var result = false;
  if ( reportGroups && typeof reportGroups[0] !== 'undefined' ){
    var firstGroup = reportGroups[0];
    
    if ( (firstGroup == 27 || (firstGroup >= 282 && firstGroup <= 290)) && reportGroups[1]==1 && reportGroups[2]==1 ) {
      result = true;
    }

  }
  return result;
}