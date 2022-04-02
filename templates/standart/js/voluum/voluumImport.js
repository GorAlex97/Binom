var VoluumImport = (function(){

    var authData = {};

        function auth ( username, password, authCallback ){
            /*
             Make username:password base64 string
            */
            function makeUserLoginBase(username, password){
                if (!username && !password){
                    throw Error('Incorrect data for auth');
                }

                return JSON.stringify( {email: username, password: password} );
            };

            /*
             Send request for getting authData.sessionToken
            */
            function getTokenRemote( authData, callback ){
                $.ajax({
                    url: "",
                    type: "post",
                    data: {
                        ajax: '1',
                        type: 'voluum_import',
                        action: 'get_auth_data',
                        authData: authData
                    },
                    success: function(data){
                        // TODO Проверка на ошибки
                        callback( data );
                    }
                });
            };
            /*
             Set VoluumImport object's user token
            */
            function setAuthData( data ){
                authData.sessionToken = data.token;
                authData.clientID = data.clientID;
            };
            /*
             Make base user pass, send request and set object's token prop
            */
            function auth( username, password, callback ){
                var authData = makeUserLoginBase( username, password );

                function getTokenCallback( data ){

                    data = JSON.parse( data );
                    if (data["status"]!="error"){
                        setAuthData( data );

                    }
                    callback( data );
                }
                getTokenRemote( authData, getTokenCallback );
            };

            auth( username, password, authCallback );
        };
        /*
         Return token from voluumObject
        */
        var getStuff = {

            getLanders: function( callback ){
                $.ajax({
                    url: "",
                    type: "post",
                    data:{
                        ajax: '1',
                        type: 'voluum_import',
                        action: "get_landers",
                        sessionToken: authData.sessionToken
                    },
                    success: function( data ){
                        // TODO обработка ошибок
                        callback( data );
                    }
                });
            },
            getOffers: function( callback ){
                $.ajax({
                    url: "",
                    type: "post",
                    data:{
                        ajax: '1',
                        type: 'voluum_import',
                        action: "get_offers",
                        sessionToken: authData.sessionToken
                    },
                    success: function( data ){
                        // TODO обработка ошибок
                        callback( data );
                    }
                });
            },
            getCampaigns: function( callback ){
                $.ajax({
                    url: "",
                    type: "post",
                    data:{
                        ajax: '1',
                        type: 'voluum_import',
                        action: "get_campaigns",
                        sessionToken: authData.sessionToken
                    },
                    success: function( data ){
                        // TODO обработка ошибок
                        callback( data );
                    }
                });
            },
            getTrafficSources: function( callback ){
                $.ajax({
                    url: "",
                    type: "post",
                    data:{
                        ajax: '1',
                        type: 'voluum_import',
                        action: "get_sources",
                        sessionToken: authData.sessionToken
                    },
                    success: function( data ){
                        // TODO обработка ошибок
                        callback( data );
                    }
                });
            },
            getAffiliateNetworks: function( callback ){
                $.ajax({
                    url: "",
                    type: "post",
                    data:{
                        ajax: '1',
                        type: 'voluum_import',
                        action: "get_networks",
                        sessionToken: authData.sessionToken
                    },
                    success: function( data ){
                        // TODO обработка ошибок
                        callback( data );
                    }
                });
            }
        };
        var importStuff = (function(){
           /**
           * @param data Array of campaigns' ID
           */
           function sendImport( action, dataToSend, callback ){
              return new Promise( function(resolve, reject){
                dataToSendJSON = JSON.stringify( dataToSend );
 
                $.ajax({
                    url: "",
                    type: 'post',
                    data:{
                        ajax: '1',
                        type: 'voluum_import',
                        sessionToken : authData.sessionToken,
                        action : action,
                        data: dataToSendJSON
                    },
                    success: function( data ){
                        data = JSON.parse( data );
                        data.elements = dataToSend;
                        callback( data );
                        resolve(data);
                    }
                }); 

              })
           }
           function importCampaigns( data, callback ){
            // todo добавить callback - совсем забыл про него
              if ( data.length==1 ){
                sendImport( 'import_campaigns', data, callback );                
              } else if ( data.length>1 ){
                // chanin promises
                var chain = sendImport('import_campaigns', [data[0]], function(){ VoluumImportWindow.makeRowLineInactive(data[0])} );
                // For all but last campaigns in chain just make row inactive
                // for last run default callback (make buttom Import active + write status of import)
                for (var i=1;i<data.length-1;i++){
                  const campID = data[i];
                  chain = chain.then( function(){ return sendImport('import_campaigns', [campID], function(){ VoluumImportWindow.makeRowLineInactive(campID) }) } );
                }
                chain = chain.then( function(){ return sendImport('import_campaigns', [ data[data.length-1] ], callback) } );

              }
           }
           // Arrays of landings
           function importLandings( data, callback ){
               sendImport( 'import_landings', data, callback );
           };
           // Arrays of offers
           function importOffers( data, callback ){
               sendImport( 'import_offers', data, callback );
           };
           function importTrafficSources( data, callback ){
               sendImport( 'import_sources', data, callback );
           }
           function importAffiliateNetworks( data, callback ){
               sendImport( 'import_networks', data, callback );
           }


           return {
               importLandings: importLandings,
               importOffers: importOffers,
               importCampaigns: importCampaigns,
               importTrafficSources: importTrafficSources,
               importAffiliateNetworks: importAffiliateNetworks
           }

       })();

        /* Just get info about functions */
        function getAuthData(){
            return authData;
        };

    return {
        auth: auth,
        getAuthData: getAuthData,
        getLanders: getStuff.getLanders,
        getOffers: getStuff.getOffers,
        getCampaigns: getStuff.getCampaigns,
        getTrafficSources: getStuff.getTrafficSources,
        getAffiliateNetworks: getStuff.getAffiliateNetworks,
        importLandings: importStuff.importLandings,
        importOffers: importStuff.importOffers,
        importCampaigns: importStuff.importCampaigns,
        importTrafficSources: importStuff.importTrafficSources,
        importAffiliateNetworks: importStuff.importAffiliateNetworks
    };

})();
