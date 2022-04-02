/*GLOBAL*/
BINOM.__pageType = "add_rotation";
window.__pageFormat = "add_rotation";

window.lp_protect_landing =  $("#add_lp [name=lp_protect]").val();
window.something_was_changed = 0;
window.routing_changed = 0;

window.ROUTING_UTIL_STORAGE = new RoutingUtilStorage();

/**
 * String "#Choose offer#" in offer.detail.name is reserved name.
 * Users cannot use this string for offer's name;
 */
function somethingWasChanged(){
	something_was_changed += 1;
	$(".main_save_button_add_rotation").removeClass("button_inactive");
	$(".main_save_button_add_rotation").prop("disabled", false);
	$(".main_save_button_add_rotation").css("cursor", "pointer");
	$(".main_save_close_button_add_rotation").removeClass("button_inactive");
	$(".main_save_close_button_add_rotation").prop("disabled", false);
	$(".main_save_close_button_add_rotation").css("cursor", "pointer");
}

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

function getPageBack(){
	window.location = "?page=Rotations";
}

var time=new Date();

var jobj_block = $(".camp_edit_right");
var json_routing = window.JSONContainer,
jobj_block = $(".camp_edit_right");

var ROUTING;
var ROTATION_SETTINGS;

if (typeof json_routing == "undefined" || json_routing == "") {
    var paths = [RoutingHelper.makeEmptyPath()];
    var rules = [];
    if (URLUtils.getParam('cached')==='1'){
        if (window.ROUTING_UTIL_STORAGE.storage.cachedRouting) {
            var cachedRouting = window.ROUTING_UTIL_STORAGE.storage.cachedRouting;
            if (cachedRouting.paths) paths = cachedRouting.paths;
            if (cachedRouting.rules) rules = cachedRouting.rules;
            window.ROUTING_UTIL_STORAGE.clearCachedRouting();
        }

    }
    ROUTING = {
        paths:paths,
        rules:rules,
        campaigns:[]
    };

    RoutingHelper.sortRoutingMutable(ROUTING);

} else {
    var parsed = JSON.parse(json_routing);
    ROUTING = parsed["routing"];
    ROUTING.campaigns = (parsed["campaigns"]?parsed["campaigns"]:new Array());
    ROTATION_SETTINGS = parsed.rotation;
}
ROUTING.tokens = [
    {
        id: 81,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 1,
    },{
        id: 82,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 2,
    },{
        id: 83,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 3,
    },{
        id: 84,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 4,
    },{
        id: 85,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 5,
    },{
        id: 86,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 6,
    },{
        id: 87,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 7,
    },{
        id: 88,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 8,
    },{
        id: 89,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 9,
    },{
        id: 90,
        // field: "t1",
        name: "FlowToken",
        // val: "{t1}",
        type: 10,
    }
]
// TODO add this to components
$("body").on("click", "._list-collapser", function(){
    var child_block = $(this).parent().next(),
        collapser_button = $(this).find("._collapser-button");

});

function getRotationData(){
    var routing_data = {
        id : $("[name=rotation_id]").val(),
        name : $("[name=rotation_name]").val(),
        group_id: $("#group_input").val(),
        new_group: $("[name=new_group]").val(),
        note: window.vmStore.state.note,
    }
    return routing_data;
}

function validateRotationSettings(rotation_data){
    $(".error_field_border").removeClass("error_field_border");
    // Need name
    if (!rotation_data.name){
        makeBadAlertModal("OK", "Enter name, please!").show();
        $("#name_input").addClass("error_field_border");
        return false;
    }


    return true;
}

function validateRotationRouting(routing){

    if (routing.paths.length==0){
        makeBadAlertModal('OK', "You have no path. Please, add it.").show();
        return;
    }

    var count_of_paths = routing.paths.length,
        count_of_paused_paths=0;

    for (var i=0;i<count_of_paths;i++){
        if (routing.paths[i].status==0){
            count_of_paused_paths++;
        }
    }

    if (count_of_paths == count_of_paused_paths){
        makeBadAlertModal('OK', "You have no active path. Please, add it or run one of these that exist.").show();
        return;
    }

    var valid_paths=false,
        valid_rules=false;

    // Check Paths
    for (var i=0; i<routing.paths.length;i++){
        valid_paths = RoutingHelper.validateRoutingPath(routing.paths[i], i);

        if (!valid_paths){
            return false;
        }
    }


    // Check Rules
    for (i=0; i<routing.rules.length; i++){
        valid_rules = RoutingHelper.validateRoutingRule(routing.rules[i], i);

        if (!valid_rules){
            return false;
        }

    }

    return true;

}

function validateRotation(data){
    var valid_settings=false,
        valid_rules= false;

    valid_settings = validateRotationSettings(data.options);

    if (!valid_settings){
        return false;
    }

    valid_routing = validateRotationRouting(data.routing);

    if (!valid_routing){
        return false;
    }

    return true;
}

// TODO добавить анимацию загрузки

function saveRotation(save_close){

    if (!save_close){
        save_close = false;
    }

    var routing_data = getRotationData();




    var data = {
        "options"   : routing_data,
        "routing"    : ROUTING,
        "save_close" : save_close
    };

    RoutingHelper.addNumbersToRoutingMutable(data.routing);

    var routing_valid = validateRotation(data);

    if ( !routing_valid ){
        return;
    }

    data = JSON.stringify(data);

    // Clear unbeforeunload handler
    window.onbeforeunload = function (){};

	var current_rotation_id = $("[name=rotation_id]").val();

	var id_get = ( typeof current_rotation_id != "undefined"
					? "&rotation_id="+current_rotation_id
					: "");


    $(".temp-routing-form").remove();
    var form = $("<form class='temp-routing-form' style='display:none' action='?page=save_rotation"+id_get+"' method='post'></form>").append( $("<input name='rotation_data' type='hidden'>").val(data) );


    if ( save_close ){
        form.append("<input type='hidden' name='save_close' value=1>");
        form.append("<input type='hidden' name='save_close_ref' value=" + window.document.referrer + ">");
    }

    $(".temp-routing-form").remove();
    $("body").append(form);
    $(".temp-routing-form").submit();

}



// TODO auto payout для офферов

// Main component
rivets.components['routing-app'] = {
    template: function(){
        return '<h2 class="camp_edit_caption" style="display:inline-block;width:150px;">\
                    DEFAULT\
                    <span class="tooltip" title="All visitors will go to these paths unless a visitor matches up with any defined rules.">\
                    </span>\
                    <span rv-on-click="copyAllPaths" class="copy-all-paths-button" title="">\
                    </span>\
                </h2>\
                <paths-block paths="routing.paths"></paths-block>\
                <paths-buttons paths="routing.paths"></paths-buttons>\
                <rules-block rules="routing.rules"></rules-block>\
                <rules-buttons rules="routing.rules"></rules-buttons>'
    },
    initialize: function(el, data){
        return new function () {
            RoutingHelper.observeRoutingToCacheListsByItsChildrenIds();
            Object.assign(this, data);
            this.copyAllPaths = function () {
                var clearedPaths = data.routing.paths.map(function (path) {
                    return RoutingHelper.clearPath(JSON.parse(JSON.stringify(path)));
                });
                RoutingHelper.copyPath( clearedPaths );
            };
        };
    }
}

jobj_block.append("<routing-app routing='routing'></routing-app>");
var rivets_routing = rivets.bind(jobj_block, {routing: ROUTING} );

$(".rotation_campaigns_list").append("<campaigns-list campaigns='campaigns'></campaigns-list>");
var rivets_campaigns = rivets.bind($(".rotation_campaigns_list"), {campaigns: ROUTING.campaigns} );

// For copy-save rules
var routingTemplater = RoutingHelper.routingTemplater(ROUTING);

/*
WW          WW  II ####    ##
  WW  WW  WW    II ####    ##
  WW  WW  WW    II ##  ##  ##
    WW  WW      II ##  ##  ##
                II ##    ####
                II ##    ####
*/


/*
########################
 ALL ABOUTH THE WINDOWS
########################
*/


// Add all Close window buttons clearWindow handler
$("body").on("click", ".window .win_closebtn", function(){
    WindowsHelper.clearWindow("#"+$(this).parent().attr("id"));
});

$("body").on("click", ".window .win-close-button", function(){
    WindowsHelper.clearWindow("#" + $(this).parent().parent().parent().attr("id"));
});

var is_storage_enable;
if (typeof localStorage === "object"){
    try {
        localStorage.setItem('localStorage', 1);
        localStorage.removeItem('localStorage');
        is_storage_enable = true;
    } catch (e) {
        is_storage_enable = false;
    }
}
if (is_storage_enable){
    if (localStorage.getItem('copied_rules')!== null){
        $(".paste_rules_templates").css({"display" : "inline-block"});
        $(".clear_rules_templates").css({"display" : "inline-block"});
    }

    RoutingHelper.onCopiedPathsUpdated();

    $(window).bind('storage', function (e) {
        if (localStorage.getItem('copied_rules')!== null){
            $(".paste_rules_templates").css({"display" : "inline-block"});
            $(".clear_rules_templates").css({"display" : "inline-block"});
        } else {
            $(".paste_rules_templates").css({"display" : "none"});
            $(".clear_rules_templates").css({"display" : "none"});
        }
        RoutingHelper.onCopiedPathsUpdated();
    });

    /* $(".copy_rules_templates").on("click",  function() {
        routingTemplater.saveRulesToStorage();
        $(".paste_rules_templates").css({"display" : "inline"});
        $(".clear_rules_templates").css({"display" : "inline"});}
    ); */
    $(".paste_rules_templates").on("click", function() {
        RoutingHelper.pasteCopiedRule();
        somethingWasChanged();
        RoutingHelper.routingChanged();
    });
    $(".clear_rules_templates").on("click", function() {
        RoutingHelper.clearCopiedRule();
    });
}

$(document).ready(function(){

	if ( getURLParameter("page") == "clone_rotation" ) {
		$(".main_save_button_add_rotation").removeClass("button_inactive");
		$(".main_save_close_button_add_rotation").removeClass("button_inactive");
	}

    if ($(".camp_edit_header_left div h1").text().length >= 160){
        $(".camp_edit_header_left div h1").css({"margin-top":"0px", "margin-bottom":"0px", "max-height":"55px", "overflow":"hidden"});
    } else if ($(".camp_edit_header_left div h1").text().length > 120) {
        $(".camp_edit_header_left div h1").css({"margin-bottom":"0px"});
    }

    $(".camp_edit_left, .camp_edit_right").css("display", "block");
    $(".camp_edit_loading").css("display", "none");

    $(".main_save_button_add_rotation").on("click", function(){
        if (!$(this).hasClass("button_inactive")){
            saveRotation();
        }
    });

    $(".main_save_close_button_add_rotation").on("click", function(){
        if (!$(this).hasClass("button_inactive")){
            saveRotation(true);
            /* window.location = "?page=campaigns"; */
        }
    });

    if (!FlashDetect.installed){
        try {
            new Clipboard('#copy_btn');
            new Clipboard('#copy_btn_pixel');
            $("#copy_btn").replaceWith($("<a href='javascript:' id='copy_btn' class='button' style='float:right;' data-clipboard-target='#url_input' >Copy</a>"));
            $("#copy_btn_pixel").replaceWith($("<a href='javascript:' id='copy_btn_pixel' class='button' style='float:right;' data-clipboard-target='#lp_pixel_input' >Copy</a>"));

        } catch (e){
            $("#url_input").css({'width':'100%'});
            $("#lp_pixel_input").css({'width':'100%'});
        }

    } else {
        addZclip("#copy_btn", "#url_input");
    }

    $(document).on("keydown",  function (e){
        var e = e || event;
        if ((getKeyCode(e)==27 || getKeyCode(e)==13) && $(".routing-system input:focus").length>0){
            $(".routing-system input:focus").trigger("blur");
        }

    });

    $("input, textarea, select").on("change, input", function(){
        somethingWasChanged();
    });

	$(".tgl").on("change", function(){
		somethingWasChanged();
	});

    $("#group_input").on("change", function(){
        if ($(this).val()=="add"){
            $("#new_group_name_camp").css("display", "block");
        }

    });

    window.onbeforeunload = function () {
        return ((something_was_changed>0) ? "Data have been modified and not saved. Are you want to leave page?":null);
    }

});

//console.log("Выполнилось за " + ((new Date()) - time)/1000 + " секунд" );
