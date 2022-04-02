/*GLOBAL*/
window.lp_protect_landing = $("#add_lp [name=lp_protect]").val();
window.routing_changed = 0;

window.ROUTING_UTIL_STORAGE = new RoutingUtilStorage();

/**
* String "#Choose offer#" in offer.detail.name is reserved name.
* Users cannot use this string for offer's name;
*/
var time=new Date();

var jobj_block = $(".camp_edit_right_wrapper");
var json_routing = window.JSONRoutingKeeper;

var ROUTING;
var CAMPAIGN_SETTINGS;

if ( typeof json_routing == "undefined" || json_routing == "" ) {
    ROUTING = { "paths" : [ RoutingHelper.makeEmptyPath() ], "rules":[] }
} else {
    var encodedRouting = JSON.parse(json_routing);
    ROUTING = encodedRouting.ROUTING;
    CAMPAIGN_SETTINGS = encodedRouting.CAMPAIGN_SETTINGS;
    if (!ROUTING.paths){
        ROUTING.paths = [ RoutingHelper.makeEmptyPath() ];
    }
    if (!ROUTING.rules){
        ROUTING.rules = [];
    }
    RoutingHelper.sortRoutingMutable(ROUTING);
}

// Set Settings
var routingTemplater = RoutingHelper.routingTemplater();

// TODO add this to components
$("body").on("click", "._list-collapser", function(){
    var child_block = $(this).parent().next(),
        collapser_button = $(this).find("._collapser-button");
});

function getCampaignData() {

    var campaign_data = {
        // id : window.vmStore.state.camp_id,
        name : window.vmStore.state.name,
        keyword : window.vmStore.state.keyword,
        domain : window.vmStore.state.domain,
        group_id : window.vmStore.state.group_id,
        // For creating new camp_group
        group_name : window.vmStore.state.group_name,
        sources_id : window.vmStore.state.sources_id,
        user_id : window.vmStore.state.user_id,
        cpc : window.vmStore.state.cpc,
        auto_cpc : window.vmStore.state.auto_cpc,
        is_cpm : window.vmStore.state.is_cpm,
        is_cpa : window.vmStore.state.is_cpa,
        currency: window.vmStore.state.currency,
        // detected_type 3 - All
        //               2 - Without ISP/GEO
        //               1 - Without Device/OS/Browser
        //               0 - Nothing
        detect_device: window.vmStore.state.detect_device,
        detect_geo: window.vmStore.state.detect_geo,
        postback_url : window.vmStore.state.postback_url,
        // Meta refersh
        red_type : window.vmStore.state.red_type,
        red_domain : window.vmStore.state.red_domain,
        smart_rotation : window.vmStore.state.smart_rotation,
        //AntiSpy
        losses : window.vmStore.state.losses,
        postback_percentage: window.vmStore.state.postback_percentage,
        postback_payout_percentage: window.vmStore.state.postback_payout_percentage,
        ea : window.vmStore.state.ea,
        land_tokens : window.vmStore.state.land_tokens,
        camp_tokens : window.vmStore.state.camp_tokens,

        var_1: window.vmStore.state.var_1,
        var_2: window.vmStore.state.var_2,
        note: window.vmStore.state.note,
        rotation_id: window.vmStore.state.rotation_id,
        color: window.vmStore.state.color,
    }

    if (window.vmStore.state.camp_id!==null){
        campaign_data.id = window.vmStore.state.camp_id;
    }

    if ( $("#rotation_input").val() != 0 ) {
        campaign_data.flow = $("#rotation_input").val();
        campaign_data.used_flow = $("#rotation_input").val();
    }

    if ( window.vmStore.state.allowed_users ){
        campaign_data.allowed_users = window.vmStore.state.allowed_users.slice(0);
    }

    if (window.BINOM_SETTINGS && window.BINOM_SETTINGS.GDPR_ENABLED) {
        campaign_data.gdpr_off = window.vmStore.state.gdpr_off;
    }

    if (window.vmStore.state.magicchecker_link_type == 'rule') {
        campaign_data.magicchecker_link = '-2';
    } else if (window.vmStore.state.magicchecker_link_receive) {
        campaign_data.magicchecker_link = '-1';
    } else {
        campaign_data.magicchecker_link = window.vmStore.state.magicchecker_link_value;
    }

    campaign_data.magicchecker_id = window.vmStore.state.magicchecker_id;

    campaign_data.fb_integration = window.vmStore.state.fb_integration;
    campaign_data.fb_acc_ids = window.vmStore.state.fb_acc_ids;
    campaign_data.fb_update_type = window.vmStore.state.fb_update_type;
    campaign_data.cloak_status = window.vmStore.state.cloak_status;
    campaign_data.adspect_simple = window.vmStore.state.adspect_simple;
    campaign_data.adspect_fingerprint = window.vmStore.state.adspect_fingerprint;
    if (window.vmStore.state.magicchecker_id == "add"){
        campaign_data.magicchecker_id_new_value = window.vmStore.state.magicchecker_id_new_value;
    }
    return campaign_data;
}

function validateCampaign(data, callback) {
    // todo возможно можно обойтись и без этого
    // а вызывать прямо весто validateCampaign
    clientValidate().then(function(validationResult){
        if (validationResult){
            callback();
        } else {
            window.campaignSaving = false;
            removeAnimationFromSaveButton('save');
            removeAnimationFromSaveButton('save_close');
        }
    });
}

function confirmSavingWhenAdspectIsNotAvailableButEnabledInCampaignSettings(callAndReturnOnSaveAnyway, callAndReturnOnCancel) {
    return new Promise(function (resolve) {
        var modal = makeConfirmModal('Save anyway', 'Cancel', function () {
            window.vmStore.commit('CHANGE_ADSPECT_STATUS', {
                adspect_simple: '0',
            })
            modal.close();
            resolve(callAndReturnOnSaveAnyway());
        }, 'Warning!', 'Adspect integration in this company will be disabled', {
            footer_cancel_callback: function () {
                resolve(callAndReturnOnCancel());
            }
        });
        modal.show();
    });
}

function checkIfGotOnlyAdspectError() {
    return window.vmStore.state.invalidFields.length === 1
      && window.vmStore.state.invalidFields[0] === 'adspect';
}

function clientValidate( data ) {
    var valid_settings=false,
        valid_rules= false;

    return window.vmStore.dispatch('VALIDATE_CAMPAIGN_SETTINGS')
        .then( function(result){
            if (!result && checkIfGotOnlyAdspectError()) {
                return confirmSavingWhenAdspectIsNotAvailableButEnabledInCampaignSettings(function () {
                    return clientValidate(data);
                }, function () {
                    window.campaignSettings = false;
                    return false;
                });
            }
            let validationResult = false;
            if (result){
                valid_routing = validateCampaignRouting();
                if (!valid_routing){
                    // Make button save callable
                    window.campaignSettings = false;
                } else {
                    validationResult = true;
                }
            } else {
                // Make button save callable
                window.campaignSettings = false;
            }
            return validationResult;
        });
}

function validateCampaignRouting() {

    if (window.ROUTING.paths.length==0){
        makeBadAlertModal('OK', "You have no path. Please, add it.").show();
        return;
    }

    var count_of_paths = window.ROUTING.paths.length,
        count_of_paused_paths=0;

    for (var i=0;i<count_of_paths;i++){
        if (window.ROUTING.paths[i].status==0){
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
    for (var i=0; i<window.ROUTING.paths.length;i++){
        valid_paths = RoutingHelper.validateRoutingPath(window.ROUTING.paths[i], i);

        if (!valid_paths){
            return false;
        }
    }


    // Check Rules
    for (i=0; i<window.ROUTING.rules.length; i++){
        valid_rules = RoutingHelper.validateRoutingRule(window.ROUTING.rules[i], i);

        if (!valid_rules){
            return false;
        }

    }

    return true;
}

window.campaignSaving = false;

// TODO добавить анимацию загрузки
function saveCampaign(save_close) {
    if ( window.campaignSaving ) return;

    window.campaignSaving = true;

    if (!save_close){
        save_close = false;
    }

    if (save_close) {
        addAnimationToSaveButton('save_close');
    } else {
        addAnimationToSaveButton('save');
    }
    // Campaign is settings of campaign self
    // routing - paths and rules
    // save_close Is button save&close pushed?
    var data = {
        "save_close" : save_close
    };

    // If flow settend not send ROUTING
    if ($('[name=rotation]').val()=="0"){
        data.routing = ROUTING;

        RoutingHelper.addNumbersToRoutingMutable(data.routing);
    }

    function validCallback(keyword){
        // after main collecting data
        var campaign_data = getCampaignData();
        // because validating setitngs not needed in this data
        // but can some edit this
        data.campaign = campaign_data;
        data.cloaking = window.vmStore.getters.cloakingReadyToSave;
        data = JSON.stringify(data);

        // Clear unbeforeunload handler
        window.onbeforeunload = function (){};

        $(".temp-routing-form").remove();
        var form = $("<form class='temp-routing-form' style='display:none' action='?page=save_camp' method='post' enctype='multipart/form-data'></form>").append( $("<input name='campaign_data' type='hidden'>").val(data) );
        if (save_close){
            form.append("<input type='hidden' name='save_close' value=1>");
            form.append("<input type='hidden' name='save_close_ref' value=" + window.document.referrer + ">");
        }

        $(".temp-routing-form").remove();
        $("body").append(form);
        $(".temp-routing-form").submit();
    }

    var camp_valid = validateCampaign(data, validCallback);

}

function addAnimationToSaveButton(type) {
    var $btn;
    if (type === 'save') {
        $btn = $('.main_save_button_add_camp');
    } else if (type === 'save_close') {
        $btn = $('.main_save_close_button_add_camp');
    }

    $btn.find('img').css('display', 'none');
    if (!$btn.find('.sk-fading-circle').length) {
        $animation = $(BINOM.HTML_SNIPPETS.LOADING_CIRCLE)
        $animation.css('margin-right', '3px');
        $btn.prepend($animation);
    }
}

function removeAnimationFromSaveButton(type) {
    var $btn;
    if (type === 'save') {
        $btn = $('.main_save_button_add_camp');
    } else if (type === 'save_close') {
        $btn = $('.main_save_close_button_add_camp');
    }
    $btn.find('img').css('display', '');
    $btn.find('.sk-fading-circle').remove();
}

$(document).ready(function() {

    $(".camp_edit_left, .camp_edit_right").css("display", "block");
    $(".camp_edit_loading").css("display", "none");

    $(".main_save_button_add_camp").on("click", function(){
        if (!$(this).hasClass("button_inactive")){
            saveCampaign();
        }
    });

    $(".main_save_close_button_add_camp").on("click", function(){
        if (!$(this).hasClass("button_inactive")){
            saveCampaign(true);
        }
    });

    $(document).on("keydown",  function (e){
        var e = e || event;
        if ((getKeyCode(e)==27 || getKeyCode(e)==13) && $(".routing-system input:focus").length>0){
            $(".routing-system input:focus").trigger("blur");
        }

    });

});

/*
####################
     COMPONENTS
####################
*/
    // Main component
    rivets.components['routing-app'] = {
        template: function() {
            return '<div class="routing-app-header">\
                        <h2 class="camp_edit_caption" style="display:inline-block;width:150px;">\
                            DEFAULT\
                            <span class="tooltip" data-hasqtip="143" title="All visitors will go to these paths unless a visitor matches up with any defined rules.">\
                            </span>\
                            <span rv-on-click="copyAllPaths" class="copy-all-paths-button" title="">\
                            </span>\
                        </h2>\
                        <rotations-select current_rotation="routing.current_rotation" list_of_rotations="routing.list_of_rotations"></rotations-select>\
                    </div>\
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
        // Set text of Paste rule button
        var rulesFromStorage = JSON.parse(localStorage.getItem('copied_rules'));
        if (rulesFromStorage.length > 1) {
            $(".paste_rules_templates div:nth-child(2)").text("Paste rules");
        } else {
            $(".paste_rules_templates div:nth-child(2)").text("Paste rule");
        }
    }

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

    $(".paste_rules_templates").on("click", function() {
        // routingTemplater.importRulesFromStorage();
        RoutingHelper.pasteCopiedRule();
        somethingWasChanged();
        RoutingHelper.routingChanged();
    });

    $(".clear_rules_templates").on("click", function() {
        RoutingHelper.clearCopiedRule();
    });

    $(".copyall_rules_btn").on('click', function() {
        var rules = JSON.parse(JSON.stringify(ROUTING.rules));
        var clearedRules = rules.map(rule => RoutingHelper.clearRule(rule));
        RoutingHelper.copyRule(clearedRules);
        $(".paste_rules_templates").css({"display" : "inline-block"});
        $(".clear_rules_templates").css({"display" : "inline-block"});
        if (clearedRules.length > 1) {
            $(".paste_rules_templates div:nth-child(2)").text('Paste rules');
        } else {
            $(".paste_rules_templates div:nth-child(2)").text('Paste rule');
        }
    });

}

$(document).ready(function(){
    if(is_storage_enable) {
        RoutingHelper.onCopiedPathsUpdated();
    }
    if (BINOM.__page == 'edit_camp'){
        // Add button for changin campaign
        $('.menu_page_title').addClass('menu_page_title_stats');
        $('.menu_page_title').append( '<div class="list-icon-wrapper"><div class="stats-change-campaign-btn list-icon"></div></div>' );

        $( 'body' ).on('click', '.menu_page_title', function(){
            var GETS = URLUtils.getGETParamsAsObject();
            var currentCampaignID = GETS.id;
            if ( window.vmStore ){
              window.vmStore.dispatch('INIT_MODAL_CAMPAIGNS', {
                    filterArr: [ currentCampaignID ],
                    onApply: function( data ){
                        var newCampID = data.id;
                        // TODO старт загрузки
                        window.vmStore.commit('CLOSE_MODAL_CAMPAIGNS');
                        // Изменение ссылки
                        GETS.id = newCampID;
                        URLUtils.changeURLWithNewGETS( GETS );
                        // TODO запрос на данные по кампании
                        window.vmStore.dispatch('CHANGE_CAMPAIGN', {id: newCampID});
                    },
                    multipleSelect: false
              });
            }
        });

    }

})
