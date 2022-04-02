// GLOBAL
var __checkBoxChecked = false,
	__pageFormat = "statistic",
	__pageType = "rotations";

// Preload checkbox image for using it later
var saveCheckboxImage = new Image();
saveCheckboxImage.src = "./templates/standart/images/check_in_box.png";

$(window).load(function () {

	if($.getUrlVar("date")=="10" || $.cookie("date") == "10" || $.getUrlVar("date")=="12" || $.cookie("date") == "12"){
		$("#custom_date").css("display","block");
	}else{
		$("#custom_date").css("display","none");
	}
});

function infoStatClick(){
}

// TT MAKING
$(document).ready(function(){

	var dataFromBack = JSON.parse( window.JSONContainer );

	var tableRotationsOptions = {
	    // Basis of basis
	    // Order, what will render and etc.
	    availableColumns: [],
	    notesStatus: 'is_note',
	    checkbox: false
	}

	tableRotationsOptions.columnsSettings = dataFromBack.columnsSettings;
	
	TT_makeTT( dataFromBack['dataSet'], tableRotationsOptions, ()=>{}, function( id ){ window.location.href=`?page=add_rotation&id=${id}`; } );
	$('.json_container').remove();
	initContextMenu();
});