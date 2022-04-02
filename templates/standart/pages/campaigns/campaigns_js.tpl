// GLOBAL
var __checkBoxChecked = false,
	__pageFormat = "statistic",
	__pageType = "campaigns";

var CampaignsStatsPage = {

	deleteButtonHandler : function(object){
		deleteButtonHandler(object, "Campaigns", "Are you sure that you want to delete this campaign?");
	},

	clearCampHandler : function(id, type){
		if ( !BINOM.windows ) BINOM.windows = Object.create(null);
		if ( !BINOM.windows.cw ) BINOM.windows.cw = new ClearingWindow();
		BINOM.windows.cw.open();
	}

}

//preload checkbox image for using it later
var saveCheckboxImage = new Image();
saveCheckboxImage.src = "./templates/standart/images/check_in_box.png"
// Preload save_active.png image for using it later
var saveActiveImage = new Image();
saveActiveImage.src = "./templates/standart/images/save_active.png";

$(document).ready(function() {

	//Preload save_active.png image for using it later
	var saveActiveImage = new Image();
	saveActiveImage.src = "./templates/standart/images/save_active.png";
	//0 is leave, 1 is out
	var animateSaveLinkIconAnimationTimeout = 0;

	function animateSaveLinkIcon(){

		var that = this;

		$(that).removeClass("save_camp_link_icon_hover")
		$(that).attr("src", "./templates/standart/images/save_active.png");
		$(that).css("opacity", 1);

		setTimeout(function(){
			$(that).attr("src", "./templates/standart/images/copy.png");
			$(that).removeClass("save_camp_link_icon_hover");
		}, 500);

	}


	if (document.queryCommandSupported && document.queryCommandSupported('copy')){

		//Add icon to camp_name for saving campaign link
		$("#table-block").on("mouseenter", ".tt_data_table tr", function(e){
			var idAttrValue = $(this).attr('id');
			if (typeof idAttrValue=='undefined') return;

			e = e || event;
			$(".save_camp_link_icon").remove();

			var id = idAttrValue.replace('ttrowuid', '');
			var camp_url = BINOM.tt.tableData.findObjectByProp('id', id)['url'];

			if ($(e.target).hasClass("save_camp_link_icon")){
				return;
			}
			if ($(this).find(".name_td .save_camp_link_icon").size() == 0){
				$(this).find(".name_td").append("<img class='save_camp_link_icon noncheckrow' src='./templates/standart/images/copy.png'>");
			}

			try {
				new Clipboard(".name_td .save_camp_link_icon");
				$(".name_td .save_camp_link_icon").replaceWith( $("<img title='Copy URL' class='save_camp_link_icon noncheckrow' src='./templates/standart/images/copy.png' href='javascript:' data-clipboard-text='"+camp_url+"'>") );
				$(".save_camp_link_icon").on("mouseenter", function(){$(this).addClass("save_camp_link_icon_hover");})
				$(".save_camp_link_icon").on("mouseleave", function(){$(this).removeClass("save_camp_link_icon_hover");})
				$(".save_camp_link_icon").on("click", animateSaveLinkIcon);
			} catch (e){
				$(this).find(".name_td .save_camp_link_icon").remove();
			}
			e.stopImmediatePropagation();
		});
	}

	//handle deleting icon
	$("#table-block").on("mouseleave", ".tt_data_table tr", function(e){

		if ($(this).find(".name_td .save_camp_link_icon").length != 0){
			$(this).find(".name_td .save_camp_link_icon").remove();
		}

	});

});

/**
 * @param id string/int passed in function in tt that make handler
 */
function dblClickRowHandler( id ){
	window.location.href = '?page=Stats&camp_id='+id;
}

$(document).ready(function(){
	initContextMenu();
});

// TT MAKING
$(document).ready(function(){

	var dataFromBack = JSON.parse( window.JSONContainer );

	var tableCampaignOptions = {
		underTabColumns: [
		    'id',
		    'name',
		    'start_date',
		    'url',
		    'current_cpc',
		    'clicks_lh',
		    'leads_lh',
		    'profit_lh',
		    'last_lead',
		    'clicks'
		],
		findInColumns: ['name', 'keyword', 'id'],
		notesStatus: 'is_note',
		checkbox: 'id',
		tagSearch: {
			startSign: '#',
			column: 'color',
			//Search type:
			// include - вхождение подстроки в один из элементов тега или массива тегов
			// full - как предыдущий только по полному вхождению
			entry: 'full',
		},
	}

	TT_DEFAULT_OPTIONS.columns.name.formatters = ['colorcelltext'];

	tableCampaignOptions.columnsSettings = dataFromBack.columnsSettings;

	// FUNCTION FROM tt.js
	TT_makeTT( dataFromBack.dataSet, tableCampaignOptions, function(){}, dblClickRowHandler );
	$('.json_container').remove();

});
