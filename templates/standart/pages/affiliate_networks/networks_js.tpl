// GLOBAL
var __pageFormat = "statistic",
	__pageType = "affiliate_networks";

var NetworksStatsPage = {

	deleteButtonHandler : function(object){
		deleteButtonHandler(object, "Affiliate Network", "Are you sure that you want to delete this network?");
	},
	restoreButtonHandler: function(object){
		window.location = $(object).attr("data-href");
	}

}

// preload checkbox image for using it later
var saveCheckboxImage = new Image();
saveCheckboxImage.src = "./templates/standart/images/check_in_box.png";

$(window).load(function () {
	if($.getUrlVar("edit")){
		$("#network_"+$.getUrlVar("edit")).trigger("click");
		$("#edit-aff-btn").trigger("click");
	}
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
		localStorage.typeStatState = 1;
	} else {
		localStorage.typeStatState = 0;
	}
}

function show_info(){
	if (localStorage.typeStatState==1){
		$("#info_button").html("<img src=\"templates/standart/images/w-table.png\" class=\"icon stats_icon\"><span>Stat</span>");
		$(".table_td_info").css("display","table-cell");
		$(".table_td_stat").css("display","none");
	}else{
		$("#info_button").html("<img src=\"templates/standart/images/w-note.png\" class=\"icon info_icon\"><span>Info</span>");
		$(".table_td_info").css("display","none");
		$(".table_td_stat").css("display","table-cell");
	}
	header_correlation();
}

// TT MAKING
$(document).ready(function(){

	var dataFromBack = JSON.parse( window.JSONContainer );

	var tableAffiliateNetworksOptions = {
	    // Basis of basis
	    // Order, what will render and etc.
	    underTabColumns: [
	      'id', 
	      'name', 
	      'offers', 
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

	tableAffiliateNetworksOptions.columnsSettings = dataFromBack.columnsSettings;

	TT_makeTT( dataFromBack['dataSet'], tableAffiliateNetworksOptions, function(){}, function(id){ window.vmStore.commit('OPEN_MODAL_EDIT_AFFNET', {editID: Number(id)}); } );
	$('.json_container').remove();

});