// GLOBAL
var __pageFormat = "statistic",
	__pageType = "offers";

var OffersStatsPage = {

	deleteButtonHandler : function(object) {
		deleteButtonHandler(object, "Offer", "Are you sure that you want to delete this offer?");
	},
	restoreButtonHandler: function(object) {
		window.location = $(object).attr("data-href");
	}
}

//preload checkbox image for using it later
var saveCheckboxImage = new Image();
saveCheckboxImage.src = "./templates/standart/images/check_in_box.png";

$(window).load(function () {
	if($.getUrlVar("edit")){
		$("#offer_"+$.getUrlVar("edit")).trigger("click");
		$("#edit-offer-btn").trigger("click");
	}
});

// GLOBAL VARIABLE
var __checkBoxChecked = false;

function setZclipOnCopyBtn(){
	$("#copy_postback_url").zclip({
	    path:"templates/standart/js/jquery-zclip/ZeroClipboard.swf",
	    copy:$("#postback_url").val(),
	    beforeCopy:function(){
	    },
	    afterCopy:function(){
	        $("#copy_postback_url").addClass("blue-button");
	        $("#copy_postback_url").html("Done");
	        setTimeout(function(){
	        	$("#copy_postback_url").removeClass("blue-button");
	      		$("#copy_postback_url").html("Copy");
	        },2000);
	    }
	});
}

function addCopyFuncTobutton() {

	if (!FlashDetect.installed){
		try {
			new Clipboard("#copy_postback_url");
			$("#copy_postback_url").replaceWith( $("<button class='green-button' id='copy_postback_url' href='javascript:' data-clipboard-target='#postback_url'>Copy</button>") );
		} catch (e){
			$("#url_input").css({'width':'100%'});
		}

	} else {
		setZclipOnCopyBtn();
	}

}

function show_window_node(){
	var id = get_id_of_selected_element();
	window.noteWindow.init(id, 'offer');
	noteWindowTokens.init("#node_text");
}

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

function setButtonState(){}

// TT MAKING
$(document).ready(function(){

	var dataFromBack = JSON.parse( window.JSONContainer );

	var tableOffersOptions = {
	    underTabColumns: [
	      'id', 
	      'geo',
	      'name',
	      'group_name', 
	      'network_name',
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

	tableOffersOptions.columnsSettings = dataFromBack.columnsSettings;

	TT_makeTT( dataFromBack['dataSet'], tableOffersOptions, setButtonState, function( id ){ window.vmStore.commit('OPEN_MODAL_EDIT_OFFER', { editID: +id }); } );
	$('.json_container').remove();

	initContextMenu();
});