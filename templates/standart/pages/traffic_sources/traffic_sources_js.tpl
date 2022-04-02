//GLOBAL
var __pageFormat = "statistic",
	__pageType = "traffic_sources";

var SourcesStatsPage = {

	deleteButtonHandler : function(object){
		deleteButtonHandler(object, "Traffic Source", "Are you sure that you want to delete this source?");
	},

	restoreButtonHandler: function(object){
		window.location = $(object).attr("data-href");
	}
}

$(window).load(function () {
	if($.getUrlVar("edit")){
		$("#ts_"+$.getUrlVar("edit")).trigger("click");
		$("#edit-src-btn").trigger("click");
	}
});

$(window).resize(function(){
	if ( typeof moveWindowAfterTimeOut == 'function' )  moveWindowAfterTimeOut();
});


$(document).ready(function() {
	if($.getUrlVar("date")=="10" || $.cookie("date") == "10" || $.getUrlVar("date")=="12" || $.cookie("date") == "12"){
		$("#custom_date").css("display","block");
	}else{
		$("#custom_date").css("display","none");
	}
});


function infoStatClick(){
	toggleTypeStat();
	show_info();


}

function toggleTypeStat(){
	if($("#info_button span").html()=="Info"){
		$("#act-form input[name=type_stat]").val(1);
	} else {
		$("#act-form input[name=type_stat]").val(0);
	}
}

// TT MAKING
$(document).ready(function(){

	var dataFromBack = JSON.parse( window.JSONContainer );

	var tableTrafficSourcesOptions = {
	    underTabColumns: [
	      'id', 
	      'name', 
	      'tokens',
	      'camps',
	      'clicks_lh',
	      'leads_lh',
	      'profit_lh',
	      'last_lead',
	      'clicks', 
	    ],
	    notesStatus: 'note',
	    checkbox: false,
	    notesStatus: 'is_note',
	    defaultShowedColumnSettings: {
	    	columns: {
	    		'event_3':false,
		        'event_4':false,
		        'event_5':false,
		        'event_6':false,
		        'event_7':false,
		        'event_8':false,
		        'event_9':false,
		        'event_10':false,
		        'lp_ctr':false,
		        'unique_camp_clicks':false,
		        'unique_clicks':false,
		        'lp_clicks':false
	    	}
	    }
	}

	tableTrafficSourcesOptions.columnsSettings = dataFromBack.columnsSettings;

	TT_makeTT( dataFromBack['dataSet'], tableTrafficSourcesOptions, function(){}, function(id){ window.vmStore.commit('OPEN_MODAL_EDIT_TS', {editID: Number(id)}); } );
	$('.json_container').remove();

	initContextMenu();
});