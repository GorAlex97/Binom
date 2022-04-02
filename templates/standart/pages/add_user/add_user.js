var USERDATA;

try {
    USERDATA = JSON.parse( window.JSONContainer );
} catch(e) {
    USERDATA = {

        user: {
            id: 0,
            campaigns:1,
            landers:1,
            offers:1,
            networks:1,
            sources:1,
            rotations:1,
            domains: 1,
            fb_accounts: 1,
            proxies: 1,
        }

    }
}

// GLOBAL
BINOM.__pageType = 'add_user';
window.__pageFormat = 'add_user';

function somethingWasChanged(){
    if ( document.readyState != "complete" ){
        return;
    }
    $(".main_save_button_add_user").removeClass("button-inactive");
    $(".main_save_close_button_add_user").removeClass("button-inactive");
    $(".main_save_button_add_user, .main_save_close_button_add_user").css("cursor", "pointer");
}

if (!USERDATA.permissions){
    USERDATA.permissions = {
        campaigns:{},
        landers:{},
        offers:{},
        networks:{},
        sources:{},
        rotations:{},
        domains: {},
        fb_accounts: {},
        proxies: {}
    }
}

if (!USERDATA.permissions.campaigns){
    USERDATA.permissions.campaigns = {}
}
if (!USERDATA.permissions.campaigns.groups){
    USERDATA.permissions.campaigns.groups = {};
}
if (!USERDATA.permissions.campaigns.elements){
    USERDATA.permissions.campaigns.elements = {};
}

if (!USERDATA.permissions.landers){
    USERDATA.permissions.landers = {}
}
if (!USERDATA.permissions.landers.groups){
    USERDATA.permissions.landers.groups = {};
}
if (!USERDATA.permissions.landers.elements){
    USERDATA.permissions.landers.elements = {};
}

if (!USERDATA.permissions.offers){
    USERDATA.permissions.offers = {}
}
if (!USERDATA.permissions.offers.groups){
    USERDATA.permissions.offers.groups = {};
}
if (!USERDATA.permissions.offers.elements){
    USERDATA.permissions.offers.elements = {};
}

if (!USERDATA.permissions.networks){
    USERDATA.permissions.networks = {}
}
if (!USERDATA.permissions.networks.elements){
    USERDATA.permissions.networks.elements = {};
}

if (!USERDATA.permissions.sources){
    USERDATA.permissions.sources = {}
}
if (!USERDATA.permissions.sources.groups){
    USERDATA.permissions.sources.groups = {};
}
if (!USERDATA.permissions.sources.elements){
    USERDATA.permissions.sources.elements = {};
}

if (!USERDATA.permissions.rotations){
    USERDATA.permissions.rotations = {}
}
if (!USERDATA.permissions.rotations.groups){
    USERDATA.permissions.rotations.groups = {};
}
if (!USERDATA.permissions.rotations.elements){
    USERDATA.permissions.rotations.elements = {};
}

if (!USERDATA.permissions.domains){
    USERDATA.permissions.domains = {}
}
if (!USERDATA.permissions.domains.elements){
    USERDATA.permissions.domains.elements = {};
}

if (!USERDATA.permissions.fb_accounts){
    USERDATA.permissions.fb_accounts = {};
}
if (!USERDATA.permissions.fb_accounts.elements){
    USERDATA.permissions.fb_accounts.elements = {};
}

if (!USERDATA.permissions.proxies){
    USERDATA.permissions.proxies = {};
}
if (!USERDATA.permissions.proxies.elements){
    USERDATA.permissions.proxies.elements = {};
}

function clearUserDataFromChanged( userdata ){
    delete USERDATA.permissions.campaigns.groups.changed;
    delete USERDATA.permissions.campaigns.elements.changed;
    delete USERDATA.permissions.landers.groups.changed;
    delete USERDATA.permissions.landers.elements.changed;
    delete USERDATA.permissions.offers.groups.changed;
    delete USERDATA.permissions.offers.elements.changed;
    delete USERDATA.permissions.networks.elements.changed;
    delete USERDATA.permissions.sources.groups.changed;
    delete USERDATA.permissions.sources.elements.changed;
    delete USERDATA.permissions.rotations.groups.changed;
    delete USERDATA.permissions.rotations.elements.changed;

    delete USERDATA.permissions.domains.elements.changed;
}


var sideAddingMemory = (function(){

    var memory = [];

    function write(initiator, side){

        memory.push({
            initiator: initiator,
            side: side
        });

    }

    function findByInitiator( initiator ){

        var result = [];

        memory.forEach(function( record, index ){

            if ( initiator.type == record.initiator.type && initiator.id == record.initiator.id ){
                result.push( index );
            }

        });

        return result;

    }

    function findBySide( side ){

        var result = [];

        memory.forEach(function( record ){

            if ( side.type == record.side.type && side.id == record.side.id ){
                result.push( record );
            }

        });

        return result;

    }

    function onDeleteInitiator( initiator ){
        var side;

        var indexes = findByInitiator( initiator );
        indexes.forEach(function( index ){

            side = memory[index].side;

            if ( findBySide(side).length>1 ){
            } else {
                delete USERDATA.permissions[side.type].elements[side.id];
                USERDATA.permissions[side.type].elements.changed = true;
            }

        });

        indexes.forEach(function( index, i ){
            if ( i != 0 ){
                index = index - 1;
            }
            memory = memory.slice(0,index).concat( memory.slice(index+1) ); 
        });

    }

    function getAll(){
        return memory;
    }

    return {
        getAll: getAll,
        write: write,
        findByInitiator: findByInitiator,
        findBySide: findBySide,
        onDeleteInitiator:onDeleteInitiator
    }

})();

function saveUser( save_close ){

    if ( typeof save_close === 'undefined'){
        save_close = false;
    }

    var login = $("#name_input").val();

    if ( $("#name_input").val().trim() == "" ){
        $("#name_input").addClass("error_field_border");
        return;
    } else if ( $("#name_input").val().trim().length  < 3 ) {
        makeBadAlertModal("OK", "Minimal username requirements are 3 symbols!").show();
        return;
    } else {
        USERDATA.user.login = login;
    }

    if ( USERDATA.user.id ){
        var passwordChange = $(".change_password_toggle").hasClass("opened");
        if ( passwordChange ){
            var password1 = $("#password1_input").val().trim(),
                password2 = $("#password2_input").val().trim();
            if ( password1 != password2 || password1.trim()=="" || password2=="" ){
                $("#password1_input").addClass( "error_field_border" );
                $("#password2_input").addClass( "error_field_border" );
                return;
            } else {
                $("#password1_input").removeClass( "error_field_border" );
                $("#password2_input").removeClass( "error_field_border" );
                USERDATA.user.password = password1;
            }
        }
    } else {
        var password = $("#password_input").val();
        if ( password.trim()=="" || password.trim().length<=3 ){
            $("#password_input").addClass( "error_field_border" );
            return;
        } else {
            USERDATA.user.password = password;
        }
    }

    if ( $("#group_input").val() == 2 && $("[name=no_profit]").prop("checked") ){
        USERDATA.user.user_group = 3;
    } else {
        USERDATA.user.user_group = $("#group_input").val();
    }
    if($("#allow-local-input")) {
        USERDATA.user.allow_local_editing = $("#allow-local-input").prop("checked") === true ? '1' : '0';
    }
    clearUserDataFromChanged( USERDATA );

    if (!USERDATA.user.email){
        USERDATA.user.email = '';
    }
    USERDATA.user.fb_accounts = window.vmStore.getters['UserPermissions/facebookAccounts/getStatus']
    if(![1,4].includes(USERDATA.user.fb_accounts)) {
        USERDATA.permissions.fb_accounts.elements = window.vmStore.getters['UserPermissions/facebookAccounts/elementsAsObject']
    }
    USERDATA.user.proxies = window.vmStore.getters['UserPermissions/proxyServers/getStatus']
    if(![1,4].includes(USERDATA.user.proxies)) {
        USERDATA.permissions.proxies.elements = window.vmStore.getters['UserPermissions/proxyServers/elementsAsObject']
    }
    var user_data = JSON.stringify( USERDATA );

    $.ajax({
        url: '',
        type: 'post',
        data: {
            ajax: 1,
            ajax_type: 'write',
            type: 'save_user_settings',
            user_data: user_data,
            save_close: save_close
        },
        success: function( data ){
            data = JSON.parse( data );
            if ( data.error ){
                
                if ( data.error == "login" ){
                    makeBadAlertModal("OK", "User with such login already exists!").show();
                    $("#name_input").addClass( "error_field_border" );
                } else if ( data.error == "password" ) {
                    if ( $(".change_password_toggle").hasClass("opened") ){
                        $("#password1_input").addClass("error_field_border");
                        $("#password2_input").addClass("error_field_border");
                    }
                } else if ( data.error == "user_group" ) {
                    makeBadAlertModal("OK", "Sorry, you cannot edit this user!").show();
                }
                
            } else if ( data.status && data.status == "ok"){
                if (data.close_on_save) {
                    window.location.href = '?page=Users';
                } else if (data.user_id){
                    // Some detailed method because tests machine breaks on just changing search
                    window.location.href = window.location.origin+window.location.pathname+`?page=edit_user&user_id=${data.user_id}`;
                }
            }
        }
    });

}

function getPageBack(){
    window.location.href = '?page=Users';
}

$(document).ready(function(){

    $(".change_password_toggle").on("click", function(){

        if ( $(this).hasClass("closed") ){
            
            $("#password1_input, #password2_input").css("display", "inline");
            $(this).text("Cancel");
            $(this).removeClass("closed").addClass("opened");

        } else if ( $(this).hasClass("opened") ){
            $("#password1_input, #password2_input").css("display", "none");
            $(this).text("Change password");
            $(this).removeClass("opened").addClass("closed");
        }
    });


    $("[name=user_group]").on("change", function(){
        USERDATA.user.user_group = $("[name=user_group]").val();

        if ( $(this).val() == 1 ){

            USERDATA.user.campaigns=1;
            USERDATA.user.landers=1;
            USERDATA.user.offers=1;
            USERDATA.user.rotations=1;
            USERDATA.user.networks=1;
            USERDATA.user.sources=1;

            $(".tab-content-block .green-button").addClass("button-inactive");
            $(".tab-content-block [type=checkbox]").prop("disabled", true);
            $("[name=no_profit]").prop("checked", false);
        } else if ( $("[name=user_group]").val() == 2 ){
            // $(".tab-content-block .green-button").removeClass("button-inactive");
            $(".tab-content-block [type=checkbox]").prop("disabled", false);
        }
        $(".tab-content-block [type=checkbox]").trigger("change");

    });

    $("[name=no_profit]").on("change", function(){
        if ( $(this).prop("checked") && $("[name=user_group]").val()==1 ){
            $("[name=user_group]").val(2).trigger("change");
        }
    });

    $( ".main_save_button_add_user" ).on("click", function(){
        if ( !$(this).hasClass("button-inactive") ){
            saveUser();
        }
    });

    $( ".main_save_close_button_add_user" ).on("click", function(){
        if ( !$(this).hasClass("button-inactive") ){
            saveUser( true );
        }
    });

    // Render right permission column
    var jobj_block = $(".user-permission-wrapper");
    jobj_block.append("<permission-app permissions='permissions' useroptions='useroptions' ></permission-app>");
    var rivets_routing = rivets.bind(jobj_block, {permissions: USERDATA.permissions, useroptions: USERDATA.user} );

    if ( USERDATA.user.login ){
        $("#name_input").val(USERDATA.user.login);
        $("#name_input").trigger("change");
    }

    if ( USERDATA.user.user_group ){
        $("[name=user_group]").val(USERDATA.user.user_group);
        

        if ( USERDATA.user.user_group == 3 ){
            $("[name=user_group]").val(2);
            $("[name=no_profit]").prop("checked", true);
        } else {
            $("[name=user_group]").val( USERDATA.user.user_group );
        }
        $("[name=user_group]").trigger("change");
    }
    console.log(USERDATA.user.allow_local_editing, $("[name=allow_local]"));
    if(USERDATA.user.allow_local_editing == 1) {
        $("[name=allow_local]").prop("checked", true);
    }
    if (BINOM.__page === 'add_user') {
        $(".tab-content-block [type=checkbox]").prop("disabled", true);
    }

    $(".twofa-disable").on("click", function(){
        function sendTurnOff(){
            $.ajax({
                url: "./"+window.API_URL,
                type: "post",
                data:{
                    action: "user@edit",
                    id: USERDATA.user.id,
                    '2fa_key': "0"
                },
                success: function(data){
                    data = JSON.parse( data );
                    if (data.status=="edited"){
                        $('.twofa-disable').replaceWith( '<span>Disabled</span>' );
                    }
                }
            });
        }
        makeConfirmModal( "OK", "Cancel", sendTurnOff, "", "Turn 2FA off for user " + USERDATA.user.login + "?", {closing_ok_wrap: true}).show();
    });

    $(".auth-unblock").on("click", function(){
        $.ajax({
            url: "./"+window.API_URL,
            type: "post",
            data: {
                action: "user@edit",
                id: USERDATA.user.id,
                'bad_entry': 1
            },
            success: function(data){
                data = JSON.parse( data );
                if (data.status=="edited"){
                    $('.auth-unblock').replaceWith('<span style="line-height: 25px;">Unblocked</span>');
                }
            }
        })
    });

    addTabsHandlers();

    $("select, input").on("change input", function(){
        somethingWasChanged();
    });

    setActiveTabFromHash();

});


