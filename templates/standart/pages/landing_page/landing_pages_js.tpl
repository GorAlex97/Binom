// GLOBAL
var __checkBoxChecked = false,
	__pageFormat = "statistic",
	__pageType = "landing_page";

var LandingsStatsPage = {

	deleteButtonHandler : function(object){
		deleteButtonHandler(object, "Landing Page", "Are you sure that you want to delete this landing?");
	},
	restoreButtonHandler: function(object){
		window.location = $(object).attr("data-href");
	}
}

$(window).load(function () {
	if($.getUrlVar("edit")){
		$("#land_"+$.getUrlVar("edit")).trigger("click");
		$("#edit-lp-btn").trigger("click");
	}
});

function addZclip(caller, target){
	$(caller).zclip({
		path:"templates/standart/js/jquery-zclip/ZeroClipboard.swf",
		copy:$(target).val(),
		beforeCopy:function(){
		},
		afterCopy:function(){
			$(caller).addClass("blue-button");
			$(caller).html("Done");
			setTimeout(function(){
				$(caller).removeClass("blue-button");
				$(caller).html("Copy");
			},2000);
		}
	});
}

function addCopyFuncTobutton() {
	if (!FlashDetect.installed){
		try {
			new Clipboard("#copy_btn10");
			$("#copy_btn10").replaceWith( $("<button class='green-button' id='copy_btn10' href='javascript:' data-clipboard-target='#copy_value10'>Copy</button>") );
		} catch (e){
			$("#url_input").css({'width':'100%'});
		}

	} else {
		addZclip("#copy_btn10" , "#copy_value10");
	}

} 

$(document).ready(function() {

	if($.getUrlVar("date")=="10" || $.cookie("date") == "10" || $.getUrlVar("date")=="12" || $.cookie("date") == "12"){
		$("#custom_date").css("display","block");
	}else{
		$("#custom_date").css("display","none");
	}

});

function show_window_node(id){
	var id = get_id_of_selected_element();
	window.noteWindow.init(id, 'landing');
}

function infoStatClick(){
	/*toggleTypeStat();
	show_info();*/
}

function toggleTypeStat(){
	if($("#info_button span").html()=="Info"){
		localStorage.typeStatState = 1;
	} else {
		localStorage.typeStatState = 0;
	}
}

// TT MAKING
$(document).ready(function(){

	var dataFromBack = JSON.parse( window.JSONContainer );

	var tableLandingsOptions = {
	    // Basis of basis
	    // Order, what will render and etc.
	    underTabColumns: [
	      'id', 
	      'name', 
	      'group_name', 
	      'url', 
	      'clicks_lh',
	      'leads_lh',
	      'profit_lh',
	      'last_lead',
	      'clicks', 

	    ],
		findInColumns: [
		  'name',
		  'url',
		],
	    notesStatus: 'is_note',
	    checkbox: 'id'
	}

	tableLandingsOptions.columnsSettings = dataFromBack.columnsSettings;

	var dblRowClick = function( id ){
		try {
			window.vmStore.commit( 'EDIT_LANDING', id );
		}catch (e){
			console.warn( e );
		}
	}

	LandingsStatsPage.LPProtectString = dataFromBack['options']['lp_protect'];

	TT_makeTT( dataFromBack['dataSet'], tableLandingsOptions, function(){}, dblRowClick );
	$('.json_container').remove();

	initContextMenu();
});