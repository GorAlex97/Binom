var WindowsHelper = (function(){

    var addNewLanding = function (arr) {
        //something_was_changed+=1;
        somethingWasChanged();
        window.vmStore.commit( 'NEW_PATH_LANDING', 
            {
                onAddCallback: function( landingData ){
                    window.vmStore.commit('CLOSE_MODAL_EDIT_LANDING');
                    arr.push( editLandingForROUTING(landingData) );
                    somethingWasChanged();
                    RoutingHelper.routingChanged();
                }
            }
        );
    },
    openLandingWindow = function(data, rivetsLandingObjectFromScope){
        window.vmStore.commit( 'EDIT_PATH_LANDING', 
            {
                id: +data.id,
                onEditCallback: function( landingData ){
                    window.vmStore.commit('CLOSE_MODAL_EDIT_LANDING');
                    rivetsLandingObjectFromScope.detail.name = landingData.name;
                    rivetsLandingObjectFromScope.detail.offers = landingData.offers;
                    rivetsLandingObjectFromScope.detail.lang = landingData.lang;
                    rivetsLandingObjectFromScope.detail.is_banned = landingData.is_banned;
                    somethingWasChanged();
                    RoutingHelper.routingChanged();
                }
            }
        );
    },
    /**
    * obj - offer object
    */
    openOfferWindow = function(data, rivetsOfferObjectFromScope){
        window.vmStore.commit('EDIT_PATH_OFFER',{
            id: +data.id,
            onEditCallback: function( offerData ){
                rivetsOfferObjectFromScope.detail.name = offerData.name;
                rivetsOfferObjectFromScope.detail.geo = offerData.geo;
                rivetsOfferObjectFromScope.detail.payout = offerData.payout;
                rivetsOfferObjectFromScope.detail.currency = offerData.currency;
                rivetsOfferObjectFromScope.detail.payout_auto = offerData.payout_auto;
                rivetsOfferObjectFromScope.detail.network = offerData.network_name;
                window.vmStore.commit('CLOSE_MODAL_EDIT_OFFER');
                somethingWasChanged();
                RoutingHelper.routingChanged();
            }
        })

    },
    editLandingForROUTING = function(landing){
        var ROUTING_landing = {
            "status" : 1,
            "id_t" : landing.id,
            "type" : 1,
            "split" : 100,
            "detail" : {
                "name": landing.name,
                "offers":landing.offers,
                "lang": landing.lang,
                "is_banned": landing.is_banned
            }
        };
        return ROUTING_landing;
    },
    saveNewLanding = function(){},
    // offers-arr may be save-callback function
    chooseLanding  = function(arr, offers_arr, swap, landing){
        window.vmStore.dispatch('INIT_MODAL_LANDINGS', {
            onApply: function( chosenLandings ){
                if ( swap ){
                    // TODO Dealing with 
                    if (Array.isArray(chosenLandings)){
                        afterMultiLandingsWasAdded( arr, offers_arr, swap, landing, chosenLandings );
                    } else if (typeof chosenLandings=="object") {
                        afterOneLandingWasChosen( arr, offers_arr, swap, landing, chosenLandings );
                    }
                } else {
                    // TODO Dealing with 
                    if (Array.isArray(chosenLandings)){
                        afterMultiLandingsWasAdded( arr, offers_arr, swap, landing, chosenLandings );
                    } else if (typeof chosenLandings=="object") {
                        afterOneLandingWasChosen( arr, offers_arr, swap, landing, chosenLandings );
                    }
                }
                window.vmStore.commit("CLOSE_MODAL_LANDINGS");
                
                somethingWasChanged();
                RoutingHelper.routingChanged();

            }
            
        });
    },
    // TODO добавить возможность добавлять пустые офферы
    correlateCountOfOffersInLandings = function(landing, landings_array, offers_array, index_untouchable) {

        if (typeof index_untouchable == "undefined"){
            index_untouchable = -1;
        }

        if (landings_array.length==0 && landing.offers==1){
            return true;
        }

        var count_of_offers = landing.offers,
            diff_offers_lands = new Array();

        for (var i=0; i<landings_array.length; i++){
            if (landings_array[i].detail.offers != count_of_offers && !(count_of_offers==1 && landings_array[i].detail.offers==0)){
                if (i != index_untouchable){
                    diff_offers_lands.push(landings_array[i]);
                }
            }
        }

        if (diff_offers_lands.length>0 || landings_array.length==0){
            if (confirm("You are adding lander with different number of offers. Are your sure?")){
                // Проводим действия по выравниванию количества офферов
                // Remove extra landers
                for (var i=0; i<diff_offers_lands.length;i++){
                   landings_array.remove(diff_offers_lands[i]);
                }

            } else {
                return false;
            }
        }
        function removeAddOffersForCorrelate(){
            if (count_of_offers!=1){
                // Remove extra offers
                if (offers_array.length>count_of_offers){
                        var difference = offers_array.length - count_of_offers;
                        for (var i=offers_array.length-1;i>=count_of_offers;i--){
                            offers_array.remove(offers_array[i]);
                        }
                }
                // Add necess offers
                if (offers_array.length<count_of_offers){
                        var difference = count_of_offers - offers_array.length;
                        for (var i=0; i<difference; i++){
                            offers_array.push({
                                "id_t": 0,
                                "type":"3",
                                "split":100,
                                "status":1,
                                "detail" : {
                                    "name":"#Choose Offer#",
                                    "payout" : 0
                                }
                            });
                        }
                }
            }
            return true;
        }
        return removeAddOffersForCorrelate();
    },


    afterOneLandingWasChosen = function(arr, offers_arr, swap, landing_swapped, landing_to_save){
        var landing = Object.create(null);

        landing.id = landing_to_save.id;
        landing.offers = landing_to_save.offers;
        landing.name = landing_to_save.name;
        landing.lang = landing_to_save.lang;
        landing.is_banned = landing_to_save.is_banned;

        // Если это замена 
        if (swap) {
            // Получаем новый лендинг
            landing_edited = editLandingForROUTING(landing);

            var index_untouchable = arr.indexOf(landing_swapped);
            if (landing_swapped.detail.offers != landing_edited.detail.offers){
                // Здесь по ходу вызывается подалка с конфирмом
                if (!correlateCountOfOffersInLandings(landing, arr, offers_arr, index_untouchable)) {
                    return false;
                }
            }
            // Заменяем лендинг если все в порядке
            swapLandings(landing_swapped, landing_edited);
        } else {
            // чекаем на сооответствие офферов и количества офферов у лендов
            if (!correlateCountOfOffersInLandings(landing, arr, offers_arr)) {
                return false;
            }
            // пушим в массив
            arr.push(editLandingForROUTING(landing));
        }

    },
    afterMultiLandingsWasAdded = function(arr, offers_arr, swap, landing_swapped, chosen_landings){
        var landings = [], landing = Object.create(null);

        chosen_landings.forEach(function( land ){
            landing = Object.create(null);
            landing.id = land.id;
            landing.offers = land.offers;
            landing.name = land.name;
            landing.lang = land.lang;
            landing.is_banned = land.is_banned;
            landings.push(landing);
        });

        var swap_index = arr.indexOf(landing_swapped);

        if (!correlateCountOfOffersInLandings(landing, arr, offers_arr, swap_index)){
            return false;
        }
        // Refinding but land might be deleted
        swap_index = arr.indexOf(landing_swapped);

        if (swap){
            if (swap_index != -1){

                swapLandings(landing_swapped, editLandingForROUTING(landings[0]));
                for (var i=1; i<landings.length;i++){

                    arr.push(editLandingForROUTING(landings[i]));
                    swap_index += 1;
                }
            } else {
                for (var i=0; i<landings.length;i++){
                    arr.splice(i, 0, editLandingForROUTING(landings[i]));
                }
            }
        } else {
            for (var i =0; i<landings.length;i++){
                arr.push(editLandingForROUTING(landings[i]));
            }
        }

    },

    /**
     * arr - Scope array of path's landings from rivets ecosystem
     * offers_arr - Scope array of path's offers from rivets ecosystem
     * swap  Boolean - it just adding or swapping landing
     * landing_swapped Object - object of landing that will be swapped after choosing
    */
    /*makeChooseLandingRowClickHandler = function(arr, offers_arr, swap, landing_swapped) {
        return function(e){
            var e = e || event;

            if ( WindowsHelper.checkTargetForCheckbox(e.target) ){
                return true;
            }

            // Получаем объект лендоса
            var landing = {};
            landing.id= $(this).attr("id");
            landing.offers = $(this).attr("data-offers-count");
            landing.name = $("#all_lp #lp_name_" + landing.id + " .lp_list_lp_name").text().trim();
            landing.lang = $("#all_lp #lp_lang_" + landing.id).html().trim();

            // Эта функция может использоваться в двух случаях - первый логичный
            if ( Array.isArray( arr ) ){
                // Если это замена 
                if (swap) {
                    // Получаем новый лендинг
                    landing_edited = editLandingForROUTING(landing);

                    var index_untouchable = arr.indexOf(landing_swapped);
                    if (landing_swapped.detail.offers != landing_edited.detail.offers){
                        // Здесь по ходу вызывается подалка с конфирмом
                        if (!correlateCountOfOffersInLandings(landing, arr, offers_arr, index_untouchable)) {
                            return false;
                        }
                    }
                    // Заменяем лендинг если все в порядке
                    swapLandings(landing_swapped, landing_edited);
                } else {
                    // чекаем на сооответствие офферов и количества офферов у лендов
                    if (!correlateCountOfOffersInLandings(landing, arr, offers_arr)) {
                        return false;
                    }
                    // пушим в массив
                    arr.push(editLandingForROUTING(landing));

                }
            // Второй не понятный и не логичный
            } else if ( typeof arr == "object" ) {

                arr[landing.id] = landing.name;
                arr.changed = true;
                if ( typeof offers_arr == "function" ){
                    offers_arr();
                }
            }

            // Закрываем окно
            $("#all_lp input:checked").trigger("click");
            $(".wrap").css("display", "none");
            $("#all_lp").css("display", "none");

            if ( typeof RoutingHelper != "undefined" ){
                RoutingHelper.routingChanged();
            }

        }
    },
    makeChooseLandingsByCheckboxRowClickHandler = function(arr, offers_arr, swap, landing_swapped) {

        if (typeof swap === "undefined"){
            swap = false;
        }

        return function(){
            var landings = new Array(), landing={};
            $("#all_lp tr.dop_table_tr .checkbox_group input[type=checkbox]:checked").each( function(index, item) {
                landing = {};
                landing.id = $(item).parent().parent().parent().attr("id");
                landing.offers = $(item).parent().parent().parent().attr("data-offers-count");
                landing.name = $(item).parent().parent().parent().find("#lp_name_"+landing.id + " .lp_list_lp_name").text().trim();
                landing.lang = $(item).parent().parent().parent().find("#lp_lang_"+landing.id).html().trim();
                landings.push(landing);
            });

            if ( Array.isArray(arr) ){

                var swap_index = arr.indexOf(landing_swapped);

                if (!correlateCountOfOffersInLandings(landing, arr, offers_arr, swap_index)){
                    return false;
                }
                // Refinding but land might be deleted
                swap_index = arr.indexOf(landing_swapped);

                if (swap){
                    if (swap_index != -1){

                        swapLandings(landing_swapped, editLandingForROUTING(landings[0]));
                        for (var i=1; i<landings.length;i++){

                            arr.push(editLandingForROUTING(landings[i]));
                            swap_index += 1;
                        }
                    } else {
                        for (var i=0; i<landings.length;i++){
                            arr.splice(i, 0, editLandingForROUTING(landings[i]));
                        }
                    }
                } else {
                    for (var i =0; i<landings.length;i++){
                        arr.push(editLandingForROUTING(landings[i]));
                    }
                }
            } else if ( typeof arr == "object" ) {

                for (var i=0; i<landings.length;i++){
                    arr[landings[i].id] = landings[i].name;
                }
                arr.changed = true;
                if ( typeof offers_arr == "function" ){
                    offers_arr();
                }
            }

            $("#all_lp input:checked").trigger("click");
            $("#all_lp input:checked").trigger("click");
            clearWindow("#all_lp");
            $(".wrap").css("display", "none");
            $("#all_lp").css("display", "none");

            if ( typeof RoutingHelper != 'undefined' ) {
                RoutingHelper.routingChanged();
            }

        }
    }*/



    clearWindow = function(window_selector){

        $(window_selector + " select option:selected").prop("selected", false);
        //$(window_selector + " select option:selected").trigger("change");
        $(window_selector + " input[type=text]").val("");
        $(window_selector + " textarea").val("");
        // $(window_selector + " input").trigger("change");
        $(window_selector + " [type=checkbox]").prop("checked", false);
        // $(window_selector + " [type=checkbox]").trigger("change");
        $(window_selector + " [type=checkbox]").off("click");
        $(window_selector + " [type=checkbox]").off("change");

        if (window_selector == "#all_lp" || window_selector == "#all_of"){
            $(window_selector + " .win_content .dop_table").html("");
        }

        if (window_selector == "#add_of"){
            $(window_selector + " [type=checkbox]").trigger("change");
            $(".postback_url_offer_field").css("display", "none");
        }
        if (window_selector == "#add_lp"){
            $("#land_block_1").css("display", "block");
            $("#land_block_2").css("display", "none");
            $('#download_land').css('display', 'block');
            $(window).trigger('resize');
            $(window_selector+" [name=group_name]").css("display", "none");
        }
    },
    // Functions for adding new offer
    addNewOffer = function(arr) {
        window.vmStore.commit('NEW_PATH_OFFER', 
            { 
                onAddCallback: function( offerData ){
                    window.vmStore.commit('CLOSE_MODAL_EDIT_OFFER');
                    arr.push( editOfferForROUTING(offerData) );
                    somethingWasChanged();
                    RoutingHelper.routingChanged();
                } 
            }
        );
    },
    editOfferForROUTING = function(offer) {
        var ROUTING_offer = {
            "id_t" : offer.id,
            "status" : 1,
            "new" : 1,
            "type" : 3,
            "split": 100,
            "detail" : {
                "name" : offer.name,
                "payout" : offer.payout,
                "currency" : offer.currency,
                "geo" : offer.geo,
                "payout_auto" : (offer.payout_auto?offer.payout_auto:offer.auto_payout),
                "network": (offer.network_name?offer.network_name:offer.network),
                "network_name": offer.network_name,
            }
        };
        return ROUTING_offer;
    },

    swapOffers = function(offer1, offer2){
        offer1.id_t               = offer2.id_t;
        offer1["new"]             = offer2["new"];
        offer1["split"]           = offer2["split"];
        offer1["status"]          = offer2["status"];
        offer1["type"]            = offer2["type"];
        offer1.detail.name        = offer2["detail"]["name"];
        offer1.detail.payout      = offer2["detail"]["payout"];
        offer1.detail.currency    = offer2["detail"]["currency"];
        offer1.detail.network     = offer2["detail"]["network"];
        offer1.detail.payout_auto = offer2["detail"]["payout_auto"];
    },
    swapLandings = function(landing1, landing2){

        landing1["id_t"]             = landing2["id_t"];
        landing1["type"]             = landing2["type"];
        landing1["split"]            = landing2["split"];
        landing1["status"]           = landing2["status"];
        landing1["detail"]["name"]   = landing2["detail"]["name"];
        landing1["detail"]["lang"]   = landing2["detail"]["lang"];
        landing1["detail"]["offers"] = landing2["detail"]["offers"];
        landing1["detail"]["is_banned"] = landing2["detail"]["is_banned"];
    },
    addDirectOffer = function(arr){
        var directOffer = {"status":1, "type":4, "split":100, "detail":{"name":"", "payout_auto":"1"}};
        arr.push(directOffer);
        setTimeout(function(){
            $("._offer_direct_url.showed")[0].focus();

        }, 100);

        somethingWasChanged();
        RoutingHelper.routingChanged();

    },
    addCampaign = function(arr, saveCallback){
        window.vmStore.dispatch('INIT_MODAL_CAMPAIGNS', {
            onApply: function(campaigns){
                if (Array.isArray(campaigns)){
                    campaigns.forEach(function(camp){
                        arr.push( editCampaignForROUTING(camp) );
                    });
                } else if (typeof campaigns == "object") {
                    arr.push( editCampaignForROUTING(campaigns) );
                }
                window.vmStore.commit('CLOSE_MODAL_CAMPAIGNS');
                somethingWasChanged();
                RoutingHelper.routingChanged();
            }
        })
    },
    editCampaignForROUTING = function( camp ){
        var campaign = {};
        campaign.detail = {};
        campaign.id_t = camp.id;
        campaign.detail.name = camp.name;
        campaign["status"] = 1;
        campaign["type"] = 5;
        campaign["split"] = 100;
        campaign["status"] = 1;
        return campaign;
    },
    changeCampaign = function(arr, swap, campaign){

        window.vmStore.dispatch('INIT_MODAL_CAMPAIGNS', {
            onApply: function( chosenCampaigns ){
                // For changing offer in routing
                if ( swap ){
                    if ( Array.isArray(chosenCampaigns) ){
                        swapCampaigns(campaign, editCampaignForROUTING( chosenCampaigns.shift() ));
                        if ( chosenCampaigns.length>0 ){
                            chosenCampaigns.forEach(function(campaign){
                                arr.push( editCampaignForROUTING(campaign) );
                            });    
                        }
                    } else if (typeof chosenCampaigns == "object") {
                        swapCampaigns(campaign, editCampaignForROUTING( chosenCampaigns ));
                    }
                // For just adding
                } else {
                    if ( Array.isArray(chosenCampaigns) ){
                        chosenCampaigns.forEach(function(campaign){
                            arr.push( editCampaignForROUTING(campaign) );   
                        });
                    } else if ( typeof chosenCampaigns == 'object' ) {
                        arr.push( editCampaignForROUTING(chosenOffers) );
                    }
                }
                window.vmStore.commit( 'CLOSE_MODAL_CAMPAIGNS' );
                somethingWasChanged();
                RoutingHelper.routingChanged();
            }
        });

    },
    swapCampaigns = function(oldCamp, newCamp){
        oldCamp.detail.name = newCamp.detail.name;
        oldCamp.id_t = newCamp.id_t;
        oldCamp.status = 1;
        oldCamp.type = 5;
        oldCamp.split = 100;
        oldCamp.status = 1;
    },

    chooseOffer = function(arr, swap, offer){

        window.vmStore.dispatch('INIT_MODAL_OFFERS',{
            onApply: function( chosenOffers ){
                // for changing offer in routing
                if ( swap ){
                    if ( Array.isArray(chosenOffers) ){
                        swapOffers(offer, editOfferForROUTING( chosenOffers.shift() ));
                        if ( chosenOffers.length>0 ){
                            chosenOffers.forEach(function(offer){
                                arr.push( editOfferForROUTING(offer) );
                            });    
                        }
                    } else if (typeof chosenOffers == "object") {
                        swapOffers(offer, editOfferForROUTING( chosenOffers ));
                    }
                // For just adding
                } else {
                    if ( Array.isArray(chosenOffers) ){
                        chosenOffers.forEach(function(offer){
                            arr.push( editOfferForROUTING(offer) );   
                        });
                    } else if ( typeof chosenOffers == 'object' ) {
                        arr.push( editOfferForROUTING(chosenOffers) );
                    }
                }
                window.vmStore.commit( 'CLOSE_MODAL_OFFERS' );
                somethingWasChanged();
                RoutingHelper.routingChanged();
            }
        });
    },
    
    editCriterion = function(criterion, options){
        
        if (criterion.type == 27) {
            vmStore.commit("CHANGE_MODAL_CRITERIA_HEADERS", criterion.values);
        }
        
        if ( typeof options == 'undefined' ){
            options = {};
        }
        // something_was_changed+=1;
        somethingWasChanged();

        $("#cri_type").html("");
        var t = Date.now();

        saveButtonHandler = function(){
           var criterion_edited = getDataFromCriterionWindow();
           RoutingHelper.routingChanged();
           criterion.type = criterion_edited.type;
           // mark
           // if (criterion.type)
           criterion.type2 = criterion_edited.type2;
           criterion.type3 = criterion_edited.type3;

           criterion.values = criterion_edited.values;
           clearCriWindow();
           $(".wrap").css("display", "none");
           $("#add_cri").css("display","none");

        };

        function makeAjaxCallBack(){
            return function(data){
                // $("#cri_type").html(data);
                var data = JSON.parse(data);
                $("#cri_type").html(makeOptionsForCriList(data));

                if (BINOM.__page == "add_camp" || BINOM.__page == "edit_camp"){
                    window.ts_changed=false;
                }
                var criterion_type = options.tempType || criterion.type;
                // Needed for rotations-tokens 
                $("#add_cri #cri_type").val(criterion_type);

                $("#add_cri #cri_type_2").val(criterion.type2);
                var type3 = (criterion.type3==1?true:false);
                $("#add_cri #cri_type_3").prop("checked", type3);

                if (criterion.type>80 || criterion.type == 11 || criterion.type == 21){
                    $("#add_cri .cri_exact_checkbox_additional input").prop("checked", type3);
                }

                if (criterion.type2 == 0){
                    $(".is_btn").addClass("is_btn_active");
                } else {
                    $(".isnot_btn").addClass("isnot_btn_active");
                }
                initEditCri();
                text_values = (function(){
                    var text = "";
                    if ( criterion_type==22 ){
                        var tokens = [];
                        for (var i=0; i<criterion.values.length;i++){
                            tokens.push({ id: criterion.values[i].id, 
                                        name: criterion.values[i].name});
                        }
                        text = JSON.stringify( tokens );
                    } else {
                        for (var i=0; i<criterion.values.length;i++){
                            text += criterion.values[i] + "\n";
                        }
                    }
                    return text;
                })();
                // TODO сделать сохранение окна
                setOptions(text_values);
                $("body").on("click", "#add_cri .win-save-button", saveButtonHandler);
            }
        }

        var ajaxData = {
            "ajax":"1",
            "type" : "load_cri_types"

        }

        if ( BINOM.__page == 'add_camp' || BINOM.__page=='edit_camp' || BINOM.__page == 'clone_camp'){
            ajaxData.ts = $("[name = \'camp_traffic_sources\']").val()
        }
        
        if ( BINOM.__page == 'add_rotation' || BINOM.__page=='edit_rotation' ){
            ajaxData.flow = 1;
        }
        
        $.ajax({
            url: "",
            type: "POST",
            data: ajaxData,
            success: makeAjaxCallBack()
        });

        $("#add_cri textarea").val("");

        $("#wrap").css("display","block");
        $("#add_cri").css("display","block");
        $(window).trigger('resize');

        $("#add_cri .win-save-button").attr("onclick", "");
        $("body").off("click", "#add_cri .win-save-button");
    },
    makeOptionsForCriList = function(data){
        var html = "",
            tokens = new Array(),
            tokenValue;
        
        for (var i=0, l=data.length;i<l;i++){
            // Is this param token?
            if (data[i]["type"]){
                
                tokens.push(data[i]);
                
                if ( BINOM.__page == 'add_camp' || BINOM.__page == 'edit_camp' || BINOM.__page == 'clone_camp' ){
                    tokenValue = parseInt(data[i]["id"]) + 90;
                } else if ( BINOM.__page == 'add_rotation' ){
                    tokenValue = parseInt(data[i]["id"]);
                }

                html += "<option value="+tokenValue+">Token "+data[i]["type"]+":"+data[i]["name"]+"</option>";
            } else {
                html += "<option value="+data[i]["id"]+">"+data[i]["name"]+"</option>";
            }
        }

        if ( BINOM.__page == 'add_camp' || BINOM.__page == 'edit_camp' || BINOM.__page == 'clone_camp' ){
            addTokensToROUTING(tokens);
        }

        return html;
    },
    addTokensToROUTING = function(tokens){
        ROUTING.tokens=[];
        for (var i=0, l=tokens.length;i<l;i++){
            ROUTING.tokens.push( tokens[i] );
        }
    },
    /**
     * arr - criterion array
     * @param arr {Array or string} If passed String, then it must be "new_rule";
     *                               If passed Array, then it must be array of criteries
     * @param values {Array} If passed "new_rule" as first value then need to pass rules (from riverts scope) array
     */
    addCriterion = function(arr, rules){

        //something_was_changed+=1;
        somethingWasChanged();

        function sendGetCriteriaRequest(){

            var ajaxData = {
                "ajax":"1",
                "type" : "load_cri_types"
            }

            if ( BINOM.__page == 'add_camp' || BINOM.__page == 'edit_camp' || BINOM.__page == 'clone_camp'){
                ajaxData.ts = $("[name = \'camp_traffic_sources\']").val()
            }

            if ( BINOM.__page == 'add_rotation' || BINOM.__page == 'edit_rotation' ){
                ajaxData.flow = 1;
            }

            $("#cri_type").html("");
            var t = Date.now();
            $.ajax({
                url: "",
                type: "POST",
                data: ajaxData,
                success: function(data) {
                    var data = JSON.parse(data);
                    $("#cri_type").html( makeOptionsForCriList(data) );
                    window.ts_changed = false;
                }
            });
        }

        if (BINOM.__page == "add_camp" || BINOM.__page == "edit_camp" ){
            if (window.ts_changed==true){
                sendGetCriteriaRequest();
            }
        } else {
            sendGetCriteriaRequest();
        }

        $("#add_cri textarea").val("");
        $("#add_cri select :nth-child(1)").prop("selected", true);

        $("#wrap").css("display","block");
        $("#add_cri").css("display","block");
        $(window).trigger('resize');

        $("#add_cri .win-save-button").attr("onclick", "");
        $("body").off("click", "#add_cri .win-save-button");

        var saveButtonHandler;

        if (arr=="new_rule") {
            saveButtonHandler = function(){
                var emptyRule = RoutingHelper.makeEmptyRule(rules);
                emptyRule.criteria.push(getDataFromCriterionWindow());
                rules.push(emptyRule);
                clearCriWindow();
                $(".wrap").css("display", "none");
                $("#add_cri").css("display","none");
                RoutingHelper.routingChanged();
            }
        } else {
            saveButtonHandler = function(){
                arr.push(getDataFromCriterionWindow());
                clearCriWindow();
                $(".wrap").css("display", "none");
                $("#add_cri").css("display","none");
                RoutingHelper.routingChanged();
            };
        }

        $("body").on("click", "#add_cri .win-save-button", saveButtonHandler)

        // FUNCTION CALLING FROM WINDOWS CORE
        initEditCri();
    },
    getDataFromCriterionWindow = function(){
        var criterion = {};
        criterion = getCriterionValuesFromWindow();
        return criterion;
    },
    getCriterionValuesFromWindow = function(){
        var select_flag = 0,
            //input_type=1 значит из инпута и токенов, =2 значит из списка разбивая переносами строк
            input_type,
            //Массивв значений с простым текстареа
            text_options = [6, 7,10, 11, 19, 21],
            with_exact_options = [1, 2, 3, 5, 11, 16, 21],
            include_empty = [11, 14],
            cri_select, cri_choices,
            //Изменяется в initEditCri, openList
            list_is_open,
            //timeout id
            timeout,
            tokens_disabled,
            select_flag;

        var arr_options = [];
        var cri_type = parseInt($("#cri_type").val()), cri_type_3;
        var cri_type_2 = $("#cri_type_2").val();
        var cri_type_3;

        if (with_exact_options.indexOf(cri_type)!=-1){
            cri_type_3 = ($("#add_cri #cri_type_3").is(":checked")?1:0);
        } else {
            cri_type_3 = 0;
        }

        if (cri_type == 27) {
            var headers = JSON.stringify(window.vmStore.state.modal_criteria_headers);
            arr_options = JSON.parse(headers);
            vmStore.commit("CHANGE_MODAL_CRITERIA_HEADERS", [{name: "", value: ""}]);
        }

        if (text_options.indexOf(cri_type) != -1 || cri_type>80){
            var text=$("#cri_list").val().split("\n");
            for (var i=0; i<text.length; i++){
                if ((text[i]!==" ") && (text[i]!=="")){
                    arr_options.push(text[i].trim());
                }
            }
        } else if (cri_type == 12){
            var options = $(".day_of_week_option_block input:checked");
            options.each(function(i, item){
                arr_options.push(item.value);
            });
        } else if (cri_type == 18) {
            var start_time = document.getElementsByClassName("part-of-day-start")[0].value,
             end_time = document.getElementsByClassName("part-of-day-end")[0].value,
             reg_time = new RegExp("\d\d:\d\d", "i");

            if (start_time.match(/^\d\d:\d\d$/)!=null && end_time.match(/^\d\d:\d\d$/)!=null){
                start_time_arr = start_time.split(":");
                end_time_arr = end_time.split(":");

                if (parseInt(start_time_arr[0])>=0 && parseInt(start_time_arr[0])<24 && parseInt(start_time_arr[1])<60 && parseInt(start_time_arr[1])>=0 && parseInt(end_time_arr[0])>=0 && parseInt(end_time_arr[0])<24 && parseInt(end_time_arr[1])<60 && parseInt(end_time_arr[1])>=0){
                    arr_options.push(start_time + "-" + end_time);
                } else{
                    // alert("Please enter time in hh:mm format");
                    makeBadAlertModal("OK1", "Please enter time in hh:mm format").show();
                    return;
                }

            } else {
                // alert("Please enter time in hh:mm format");
                makeBadAlertModal("OK2", "Please enter time in hh:mm format").show();
                return;
            }


        } else if (cri_type == 8) {

            var  unique_type = $("input[name=unique_type]:checked").val();

            arr_options.push(unique_type);

        } else if (cri_type == 9) {
            arr_options = [];
        } else if(cri_type == 27) {

        } else {
            var options = $("#add_cri .Token");
            if ( cri_type == 22 ){
                
                options.each(function(i, item){
                    arr_options.push( {
                        id: item.getAttribute("data-value"),
                        name: $(item).find("span").text()
                    } );
                });
            
            } else {
                options.each(function(i, item){
                    arr_options.push(item.getAttribute("data-value"));
                });
            }
        }

        // Add empty/Unknown
        if ( (include_empty.indexOf(cri_type)!=-1 || cri_type>80) && $(".cri_include_empty input").prop("checked") ){
            arr_options.push("unknown");
        }

        if (cri_type==20 || cri_type==22){
            cri_type_3=1;
        }

        if (cri_type>80 || cri_type == 27 || cri_type == 11 || cri_type == 21 ){
            cri_type_3 = +$(".cri_exact_checkbox_additional input").prop("checked");
        }

        if (cri_type==19 || cri_type==21) {
            cri_type_3 = 0;
        }

        criterion_data = {
            "status" : 1,
            "type"   : cri_type,
            "type2"  : cri_type_2,
            "type3" :  cri_type_3,
            "values"  : arr_options
        }
        return criterion_data;
    };

    return {
        addNewLanding: addNewLanding,
        // prepareLandingWindow: prepareLandingWindow,
        // openLandingWindowCallback: openLandingWindowCallback,
        // prepareOfferWindow: prepareOfferWindow,
        openOfferWindow: openOfferWindow,
        openLandingWindow: openLandingWindow,
        // makeSaveNewLandingHandler: makeSaveNewLandingHandler,
        editLandingForROUTING: editLandingForROUTING,
        // checkLandingWindow: checkLandingWindow,
        saveNewLanding: saveNewLanding,
        chooseLanding: chooseLanding,
        correlateCountOfOffersInLandings: correlateCountOfOffersInLandings,
        // makeChooseLandingRowClickHandler: makeChooseLandingRowClickHandler,
        // makeChooseLandingsByCheckboxRowClickHandler: makeChooseLandingsByCheckboxRowClickHandler,
        clearWindow: clearWindow,
        addNewOffer: addNewOffer,
        // makeSaveNewOfferHandler: makeSaveNewOfferHandler,
        editOfferForROUTING: editOfferForROUTING,
        // checkOfferWindow: checkOfferWindow,
        swapOffers: swapOffers,
        swapLandings: swapLandings,
        addDirectOffer: addDirectOffer,
        addCampaign: addCampaign,
        changeCampaign: changeCampaign,
        // makeChangeCampaignRowHandler: makeChangeCampaignRowHandler,
        // makeChooseCampaignRowHandler: makeChooseCampaignRowHandler,
        chooseOffer: chooseOffer,
        // makeChooseOfferRowClickHandler: makeChooseOfferRowClickHandler,
        // makeChooseOffersByCheckboxRowClickHandler: makeChooseOffersByCheckboxRowClickHandler,
        editCriterion: editCriterion,
        makeOptionsForCriList: makeOptionsForCriList,
        addTokensToROUTING: addTokensToROUTING,
        addCriterion: addCriterion,
        getDataFromCriterionWindow: getDataFromCriterionWindow,
        getCriterionValuesFromWindow: getCriterionValuesFromWindow,
        // addFooterBlock: addFooterBlock,
        // removeFooterBlock: removeFooterBlock,
        // checkTargetForCheckbox: checkTargetForCheckbox,
        // openGroupListWindow: openGroupListWindow,
        // makeCheckAllCampClickHandler:makeCheckAllCampClickHandler
    }

})();
