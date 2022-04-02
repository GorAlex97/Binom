var VoluumImportWindow = (function(){

    var initiated = false,
        windowID = 'voluum_import_window',
        windowSelector = '#'+windowID,
        loadStateSet={
            'campaigns': false,
            'landings': false,
            'offers': false,
            'trafficSources': false,
            'affiliateNetworks': false
        },
        dataSet = {},
        dataForImportSet = {},
        lastAction='',
        authed = false;

    function getDataLoadedInfo(){
        return loadStateSet;
    }

    function changeLastAction( str ){
        lastAction = str;
        $(windowSelector+' .import-status').html( lastAction );
        // TODO отрисовывать
    }

    function checkDataLoaded(){
        if (arguments.length == 0){
            for (prop in loadSet) {
                if ( loadSet.hasOwnProperty(prop) ){
                    if ( !loadSet[prop] ){
                        return false;
                    }
                }
            }
            return true;
        } else {
            return loadSet[ arguments[0] ];
        }
    }

    function init(){
        var htmlWindow = makeWindowHTML();
        $( 'body' ).append( htmlWindow );
        setHandlers();
        if (authed){
            loadData();
        }
        initiated = true;
    }

    function loadData(){
        loadCampaigns();
        loadLandings();
        loadOffers();
        loadTrafficSources();
        loadAffiliateNetworks();
    }

    function makeBaseTableHTML( data ){
        var tableHTML = '', tableHead='', tableBody='', dataAttr='';
        tableHead = '<thead>\
                        <tr class="dop_table_header">\
                            <th class="header_checkbox checkbox_td">\
                                <div class="checkbox_group">\
                                    <input type="checkbox" class="select-all-checkbox" >\
                                    <label style="margin-left:25px;">\
                                    </label>\
                                </div>\
                            </th>\
                            <th class="header_name">Name</th>\
                        </tr>\
                     </thead>';

        tableBody = '<tbody>';
        for ( var i = 0, l=data.length;i<l;i++ ){
            dataAttr = 'data-id='+data[i].id;
            tableBody += '<tr '+dataAttr+' style="user-select: none;-webkit-user-select: none;-ms-user-select: none;">';
            tableBody += '<td class="checkbox_td">\
                            <div class="checkbox_group">\
                                <input type="checkbox" >\
                                <label style="margin-left:25px;">\
                                </label>\
                            </div>\
                          </td>\
                          <td class="row-name">\
                            '+ data[i].name +'\
                          </td> ';
            tableBody += '</tr>';
        }
        tableBody += '</tbody>';
        table = '<table class="voluum_import_table dop_table">'+tableHead+tableBody+'</table>';
        return table;
    }

    function drawHTMLCampaignsTable( data ){
        var tableHTML = makeBaseTableHTML( data );
        $('.tab-content-campaigns').html( tableHTML );
    }
    function drawHTMLLandingsTable( data ){
        var tableHTML = makeBaseTableHTML( data );
        $('.tab-content-landings').html( tableHTML );
    }
    function drawHTMLOffersTable( data ){
        var tableHTML = makeBaseTableHTML( data );
        $('.tab-content-offers').html( tableHTML );
    }
    function drawHTMLTrafficSourcesTable( data ){
        var tableHTML = makeBaseTableHTML( data );
        $('.tab-content-sources').html( tableHTML );
    }
    function drawHTMLAffiliateNetworksTable( data ){
        var tableHTML = makeBaseTableHTML( data );
        $('.tab-content-networks').html( tableHTML );
    }

    function unpackData( data ){
        try {
            data = JSON.parse( data );
        } catch(e) {
            changeLastAction('<span style="color:red">Error. Something gone wrong :(</span>');
            data={};
        }
        return data;
    }

    function loadCampaigns(){
        function getRequestCallback( data ){
            data = unpackData( data );
            dataSet['campaigns'] = data;
            loadStateSet['campaigns'] = true;
            drawHTMLCampaignsTable( data );
        }
        VoluumImport.getCampaigns( getRequestCallback );
    }
    function loadLandings(){
        function getRequestCallback( data ){
            data = unpackData( data );
            dataSet['landings'] = data;
            loadStateSet['landings'] = true;
            drawHTMLLandingsTable( data );
        }
        VoluumImport.getLanders( getRequestCallback );
    }
    function loadOffers(){
        function getRequestCallback( data ){
            data = unpackData( data );
            dataSet['offers'] = data;
            loadStateSet['offers'] = true;
            drawHTMLOffersTable( data );
        }
        VoluumImport.getOffers( getRequestCallback );
    }
    function loadTrafficSources(){
        function getRequestCallback( data ){
            data = unpackData( data );
            dataSet['trafficSources'] = data;
            loadStateSet['trafficSources'] = true;
            drawHTMLTrafficSourcesTable( data );
        }
        VoluumImport.getTrafficSources( getRequestCallback );
    }
    function loadAffiliateNetworks(){
        function getRequestCallback( data ){
            data = unpackData( data );
            dataSet['affiliateNetworks'] = data;
            loadStateSet['affiliateNetworks'] = true;
            drawHTMLAffiliateNetworksTable( data );
        }
        VoluumImport.getAffiliateNetworks( getRequestCallback );
    }
    function makeAuth(){
        function authCallback( data ){
            if ( data["status"]=="error" ){
                $(".voluum-auth-error-block").css("display", "block");
            } else {
                $(".voluum-auth-error-block").css("display", "none");
                authed = true;
                $(windowSelector+" .win_content ").html( makeWindowAuthedContentBlock );
                loadData();
                setHandlers();
            }
        }
        var login = $(".voluum-auth-input-login").val(),
        password = $(".voluum-auth-input-password").val();
        VoluumImport.auth(login, password, authCallback);
    }
    // TODO убрать lorem ipsum
    function makeWindowAuthedContentBlock(){
        return '<div class="tab_header tab-menu">\
                    <div data-tab-name="campaigns" class="tab-button tab-button-active">Campaigns</div>\
                    <div data-tab-name="landings" class="tab-button">Landings</div>\
                    <div data-tab-name="offers" class="tab-button">Offers</div>\
                    <div data-tab-name="sources" class="tab-button">Traffic sources</div>\
                    <div data-tab-name="networks" class="tab-button">Affiliate Networks</div>\
                </div>\
                <div class="tab-content-wrapper content-vooluum-import" >\
                    <div data-tab-name="campaigns" class="tab-content-block tab-content-campaigns tab-content-block-active"></div>\
                    <div data-tab-name="landings" class="tab-content-block tab-content-landings"> Landings </div>\
                    <div data-tab-name="offers" class="tab-content-block tab-content-offers"> Offers </div>\
                    <div data-tab-name="sources" class="tab-content-block tab-content-sources"> Sources </div>\
                    <div data-tab-name="networks" class="tab-content-block tab-content-networks"> Networks </div>\
                </div>\
                <div class="import-status"></div>\
            ';
    }


    function makeWindowNeedAuthContentBlock(){
        return '<div class="win_content" style="height:540px">\
                    <div class="voluum-import-auth-view">\
                        <input class="voluum-auth-input-login styled_input"\
                                type="text" placeholder="Voluum Login"\
                                onfocus="this.placeholder=\'\'"\
                                onblur="this.placeholder=\'Voluum Login\'">\
                        \
                        <input class="voluum-auth-input-password styled_input"\
                                type="password" placeholder="Voluum Pass"\
                                onfocus="this.placeholder=\'\'"\
                                onblur="this.placeholder=\'Voluum Pass\'">\
                        <button class="auth-voluum-button green-button">Voluum SignIn</button>\
                        <div class="voluum-auth-error-block" style="color:red; font-size:13px;margin-top:20px;display:none;">Incorrect login or password</div>\
                    </div>\
                </div>';
    }

    htmlInnerButtonSave = '<img src="templates/standart/images/w-save.png" class="icon save_icon">Import';

    function makeWindowHTML(){

            return  '<div id="wrap" class="wrap '+windowID+'_wrap" style="display: block;"></div>\
                     <div class="window" id="'+windowID+'" style="display: none; width:600px;height:600px;">\
                         <a class="win_closebtn"></a>\
                         <div class="win_header">\
                             <span class="window_head_name">Voluum Import</span>\
                         </div>\
                         <div class="win_cap ">\
                         </div>\
                         '+makeWindowNeedAuthContentBlock()+'\
                         <div class="win_footer ">\
                             <div class="win-buttons-block">\
                                 <a class="button win-save-button note-save-button">'+htmlInnerButtonSave+'</a>\
                                 <a class="button win-close-button note-close-button" ><img src="./templates/standart/images/w-close.png" class="icon close_icon">Close</a>\
                             </div>\
                         </div>\
                     </div>';
    }

    function changeTab(){
        var contentTab = $(this).attr('data-tab-name');

        $(windowSelector+' .tab-button-active').removeClass('tab-button-active');

        $(windowSelector+' .tab-content-block-active').removeClass('tab-content-block-active');

        $(windowSelector+' .tab-content-block[data-tab-name='+contentTab+']').addClass('tab-content-block-active');

        $(this).addClass( 'tab-button-active' );
    }

    function getData(){}

    // Setting on header_correlation 
    function selectAllCheckboxClick(){
        if ( $(this).prop('checked') ){
            $(this).parent().parent().parent().parent().parent().find( 'input[type=checkbox]:not(:disabled, .select-all-checkbox)' ).prop('checked', false).trigger('change');
        } else {
            $(this).parent().parent().parent().parent().parent().find( 'input[type=checkbox]:not(:disabled, .select-all-checkbox)' ).prop('checked', true).trigger('change');
        }
    }

    var lastCheckedRows = null;

    function rowCheckboxClick(e){
        var row = $(this).parent().parent().parent();
        var container = $(this).parent().parent().parent().parent().parent();

        var selectAllCheckbox = container.find(".select-all-checkbox");
        if ( $(this).prop("disabled") ){
            return;
        }
        if ( $(this).prop('checked') == false ){
            if ( !$(this).hasClass("select-all-checkbox") ) {
                $(this).parent().parent().parent().addClass("tr_active");
            }
            $(this).prop('checked', true);
        } else {
            $(this).parent().parent().parent().removeClass("tr_active");
            $(this).prop('checked', false);
        }
        if ($(this).prop('checked') == false){
            selectAllCheckbox.prop("checked", false);
        }

        if ( e.shiftKey ){
            var checkRow = row;
            var numberCurrent= container.find('tbody tr').index( checkRow );
            var numberPrevChecked = container.find('tbody tr').index( lastCheckedRows );

            var startShift, endShift;
            if ( numberCurrent > numberPrevChecked ) {                
                startShift = numberPrevChecked;
                endShift = numberCurrent;
            } else {
                startShift = numberCurrent;
                endShift = numberPrevChecked;
            }

            for (var i=startShift+1;i<endShift;i++){
                var intermediateRow = container.find('tbody tr').eq(i);
                intermediateRow.addClass('tr_active');
                intermediateRow.find('input[type=checkbox]').prop('checked', true);
            }

        }

        lastCheckedRows = $(this).parent().parent().parent();
    }

    function checkboxGroupClick(e){
        var checkbox = $(this).find('input[type=checkbox]');

        if ( checkbox.prop('checked')==true ){
            rowCheckboxClick.call( checkbox[0], e );
            // checkbox.prop('checked', false);
        } else if ( checkbox.prop('checked')==false ){
            rowCheckboxClick.call( checkbox[0], e );
            // checkbox.prop('checked', true);
        }
        if (checkbox.hasClass('select-all-checkbox')){
            selectAllCheckboxClick.call( checkbox[0], e );
        }
        // checkbox.trigger('change');
    }

    function setHandlers(){
        $(windowSelector+' .win_closebtn').on('click', hideWindow);
        $(windowSelector+' .win-close-button').on('click', hideWindow);

        if (authed){
            // На всякий случай очищаем перед прошлым открытием
            $(windowSelector+' .tab-button').off('click');
            $(windowSelector+' .tab-button').on('click', changeTab);
            $(windowSelector+' .win-save-button').off('click');
            $(windowSelector+' .win-save-button').on('click', doImport);

            $(windowSelector).off('click change', 'input[type=checkbox]:not(.select-all-checkbox)');
            
            $(windowSelector).on('click change', 'input[type=checkbox]:not(.select-all-checkbox)', rowCheckboxClick);

            $(windowSelector).on('click', '.header_checkbox', checkboxGroupClick);
            $(windowSelector).on('click', 'tbody tr', checkboxGroupClick);
        } else {
            $(".auth-voluum-button").on('click', makeAuth );
        }

    }


    function makeRowLineInactive( id ){
        var checkbox;
        if (typeof id == 'string'){
            $('[data-id='+id+']').addClass('voluum_import_row_inactive');
            $('[data-id='+id+']').removeClass('tr_active');
            $('[data-id='+id+']').find('input[type=checkbox]').prop('disabled', true).prop('checked', false);
            $('[data-id='+id+']').parent().parent().parent().find(".select-all-checkbox").prop("checked", false);
        } else if ( Array.isArray(id) && id.length>0 ) {
            for (var i=0, l=id.length;i<l;i++){
                $('[data-id='+id[i]+']').addClass('voluum_import_row_inactive');
                $('[data-id='+id[i]+']').removeClass('tr_active');
                $('[data-id='+id[i]+']').find('input[type=checkbox]').prop('disabled', true).prop('checked', false);
            }
            $('[data-id='+id[0]+']').parent().parent().parent().find(".select-all-checkbox").prop("checked", false);
        }
        
    }

    function doImport(){

        makeButtonInProcess("#voluum_import_window .win-save-button", "Import...");
        $(windowSelector+' .win-save-button').off('click');

        getDataForImport();
        function baseImportCallback( data ){
            if ( data.status == 'imported' ){
                changeLastAction( 'Status: '+data.type+' imported' );
            }
        }
        // TODO делать объект задания чтобы чекать проргресс выполнения
        // Длинная цепочка запросов к серверу
        function offersImportCallback( data ){
            makeRowLineInactive( dataForImportSet.offers );
            if ( dataForImportSet.campaigns && dataForImportSet.campaigns.length>0 ){
                VoluumImport.importCampaigns( dataForImportSet.campaigns, campaignsImportCallback );
            } else {
                campaignsImportCallback( {'status':'empty', 'type':'landings'} );
            }
            baseImportCallback( data );
        }
        function landingsImportCallback( data ){
            makeRowLineInactive( dataForImportSet.landings );
            if ( dataForImportSet.offers && dataForImportSet.offers.length>0 ){
                VoluumImport.importOffers( dataForImportSet.offers, offersImportCallback );
            } else {
                offersImportCallback( {'status':'empty', 'type':'landings'} );
            }
            baseImportCallback( data );
        }
        function trafficSourcesImportCallback( data ){
            makeRowLineInactive( dataForImportSet.trafficSources );
            if ( dataForImportSet.landings && dataForImportSet.landings.length>0 ){
                VoluumImport.importLandings( dataForImportSet.landings, landingsImportCallback );
            } else {
                landingsImportCallback( {'status':'empty', 'type':'landings'} );
            }
            baseImportCallback( data );
        }
        /**
        * @param data {type: String, status: String, elements: Array}
        */
        function campaignsImportCallback( data ){
            var elements = data.elements || [];
            makeRowLineInactive( elements );
            baseImportCallback( data );

            $(windowSelector+' .win-save-button').on('click', doImport);
            $(windowSelector+' .win-save-button').html( htmlInnerButtonSave );

        }
        function affilaiteNetworkCallback( data ){
            makeRowLineInactive( dataForImportSet.affiliateNetworks );
            if ( dataForImportSet.trafficSources && dataForImportSet.trafficSources.length>0 ){
                VoluumImport.importTrafficSources( dataForImportSet.trafficSources, trafficSourcesImportCallback );
            } else {
                trafficSourcesImportCallback( {'status':'empty', 'type':'traffic sources'} );
            }
             baseImportCallback( data );
        }
        if ( dataForImportSet.affiliateNetworks && dataForImportSet.affiliateNetworks.length>0 ){
            VoluumImport.importAffiliateNetworks( dataForImportSet.affiliateNetworks, affilaiteNetworkCallback );
        } else {
            affilaiteNetworkCallback( {'status':'empty', 'type':'affiliate networks'} );
        }

    }



    function showWindow(){
        if ( !initiated ){
            init();
        }
        $("."+windowID+"_wrap").css('display', 'block');
        $(windowSelector).css('display', 'block');
    }
    function hideWindow(){
        $(".wrap").css('display', 'none');
        $("#voluum_import_window").css('display', 'none');
    }

    function getIDsForImport( divSelector ){
        var checkboxesArr = $(divSelector + ' tbody input[type=checkbox]:checked'),
            idsArr = new Array();
        checkboxesArr.each(function(i, item){
            idsArr.push( $(item).parent().parent().parent().attr('data-id') );
        });
        return idsArr;
    }

    function getDataForImport(){
        dataForImportSet.campaigns = getIDsForImport('.tab-content-campaigns');
        dataForImportSet.landings = getIDsForImport('.tab-content-landings');
        dataForImportSet.offers = getIDsForImport('.tab-content-offers');
        dataForImportSet.trafficSources = getIDsForImport('.tab-content-sources');
        dataForImportSet.affiliateNetworks = getIDsForImport('.tab-content-networks');
    }

    function getDataSet(){
        return dataSet;
    }
    function getDataForImportSet(){
        return dataForImportSet;
    }

    return {
        init: init,
        show: showWindow,
        hide: hideWindow,
        checkDataLoaded: checkDataLoaded,
        getDataLoadedInfo: getDataLoadedInfo,
        getDataSet: getDataSet,
        getDataForImportSet: getDataForImportSet,
        doImport: doImport,
        makeRowLineInactive: makeRowLineInactive
    }

})();
