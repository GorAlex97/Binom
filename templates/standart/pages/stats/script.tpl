$(document).ready(function(){
	var date_sValue = $('[name=date_s]').val();
	if (date_sValue && date_sValue.indexOf('1970-01-01')!=-1){
		$('[name=date_s]').val( moment().format('YYYY-MM-DD 00:00') )
	}
})

function getGroups(){
	// TODO Вынести в binom
	var group1 = getURLParameter( 'group1' );
	var group2 = getURLParameter( 'group2' );
	var group3 = getURLParameter( 'group3' );
	return new Array( group1, group2, group3 );
}
// TODO временная не точная фигня
// Лучше наверное в массиве отдавать с бэка
// uselsess (?)
function getReportLevel(){
	var gs = getGroups();
	if ( gs[2] && gs[2] != 1 ){
		return 3;
	} else if ( gs[1] && gs[1] != 1 ) {
		return 2;
	} else if ( gs[0] && gs[0] != 1 ) {
		return 1;
	} else {
		return 3;
	}
}

function isJustCampaignReport(){
	var GETS = URLUtils.getGETParamsAsObject();
	var result;
	if (GETS.ts_id || GETS.rt_id || GETS.leads || GETS.usr_id || GETS.gr_id){
		result = false;
	} else {
		result = true;
	}
	return result;
}


function singleLineDrillDown( uid ){
    var rowData = BINOM.tt.tableData[ uid ];
    var arr = new Array( rowData.name );

    var group_number = rowData.level;

    var group2 = 3;
    if ( $("group"+group_number).val()==3){
      group2 = 4;
    }

    drilldownRedirect(arr, group_number, group2);
}

function drilldown() {

    if ( BINOM.tt.markedRows.selected.length == 0 ){
        console.error( " Try open Drilldown with no line selected" );
      return;
    }

    if ( BINOM.tt.markedRows.selected.length == 1 ){
      singleLineDrillDown( BINOM.tt.markedRows.selected[0] );
      return;
    }

    // Тут вообщем нужно найти минимальный уровень выбранных строк 
    // И потомо найти имена всех этих выбранных самых высоких строк 
    // try first group line
    var drilldownLines = $("[data-level=1].selected_row");
    var groupNumber;
    if ( drilldownLines.length > 0 ){
      groupNumber = 1;
    } else {
      // try to second group line
      drilldownLines = $("[data-level=2].selected_row");
      if ( drilldownLines.length > 0 ){
        groupNumber = 2;
      } else {
        drilldownLines = $("[data-level=3].selected_row");
        groupNumber = 3;  
      }
    }
    var namesData = new Array();
    drilldownLines.each( function(i, row ){
      var rowUID = $(row).attr( "id" ).replace("ttrowuid", "");
      namesData.push( BINOM.tt.tableData[rowUID].name );
    });

    var group2 = 3;
    if ( BINOM.tt.tableOptions.reportGroups[1] == 3 ){
      group2 = 4;
    }

    drilldownRedirect( namesData, groupNumber, group2 );

}

function drilldownRedirect( arr, group_number, group2 ){

    var group1Value = BINOM.tt.tableOptions.reportGroups[group_number-1];  
    var arrJSON = JSON.stringify( arr );
    var GETS = URLUtils.getGETParamsAsObject();

    delete GETS.group1;
    GETS.drilldown = group1Value;
    GETS.group2 = group2;
    GETS.group3 = 1;

    $.ajax({
      url: '',
      type: 'post',
      data: {
        ajax:1,
        ajax_type:"write",
        type: "drilldown",
        data: arrJSON,
        group: group1Value
      },
      success: function( data ){
        window.vmStore.commit('SET_REPORT_GROUPS', {group1: group1Value, group2: group2, group3: 1});
        window.vmStore.commit('SET_DRILLDOWN_STATE', group1Value);
        window.vmStore.dispatch('APPLY_REPORT_CONDITIONS');
      }
    });
    // TODO тут короче сначала какой-то ajax
    // Вот здесь редирект
}

BINOM.updateCost = Object.create( null );
BINOM.updateCostFile = Object.create( null );

$(document).ready( function(){
	
	if (isJustCampaignReport()) {
		// Add button for changin campaign
	    $('.menu_page_title').addClass('menu_page_title_stats');
	    $('.menu_page_title').append( '<div class="list-icon-wrapper"><div class="stats-change-campaign-btn list-icon"></div></div>' );

	    $( 'body' ).on('click', '.menu_page_title', function(){
	      if ( window.vmStore ){
	        window.vmStore.dispatch('INIT_MODAL_CAMPAIGNS');
	      }
	    });

	}

	var leads = URLUtils.getParam('leads');
	if (leads != '1'){
		initReportTT();
		console.log( $('#table-block').length );
	}
	
});
