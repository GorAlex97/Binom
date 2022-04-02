// GLOBAL
var __pageFormat = "statistic",
    __pageType = "users";

$(document).ready(function() {

    if($.getUrlVar("date")=="10" || $.cookie("date") == "10" || $.getUrlVar("date")=="12" || $.cookie("date") == "12"){
        $("#custom_date").css("display","block");
    }else{
        $("#custom_date").css("display","none");
    }
   
});

function infoStatClick(){
}


function dblClickRowHandler(id) {
  window.location.href = '?page=edit_user&user_id=' + id;
}

$(document).ready(function(){

    var dataFromBack = JSON.parse( window.JSONContainer );
    var tableUsersOptions = {
        columns: {
            'user_group':{
                key: 'user_group',
                name: 'Role',
                align: 'left',
                formatters: ['usergrouptoword']
            },
            // Because this settings taked from default and in TT_DEFAULT_SETTINGS 
            // this settings without dollarsign and redgreengrey because dollarsign taked from base
            // and redgreengrey need to be after dollarsign
            'profit' : {
              key: 'profit',
              name: 'Profit',
              footer: true,
              footerCalc: false,
              formatters: ['decimalplaces', 'threenumeralcommas' , 'dollarsign','redgreengrey'],
              stat: false,
              align: 'right',
              bold: true
            },
            'roi' : {
              key: 'roi',
              name: 'ROI',
              footer: false,
              formatters: ['decimalplaces', 'threenumeralcommas', 'percentagesign','redgreengrey'],
              stat: false,
              align: 'right',
              bold: true
            },
            'lp_ctr':{
              "key":"lp_ctr",
              "name":"LP CTR",
              "tab":"stat",
              "footer": false,
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","percentagesign"],
              "stat":false,
              "align":"right",
              "measure":"%"
            },
            cr: {
              "key":"cr",
              "name":"CR",
              "tab":"stat",
              "formatters":["decimalplaces","threenumeralcommas","percentagesign"],
              "footer": false,
              "measure":"%"
            },
            epc: {
              "key":"epc",
              "name":"EPC",
              "tab":"stat",
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],
              "footer": false,
              "measure":"$"
            },
            cpc: {
              "key":"cpc",
              "name":"CPC",
              "tab":"stat",
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],
              "footer": false,
              "measure":"$"
            },
            revenue: {
              "key":"revenue",
              "name":"Revenue",
              "tab":"stat",
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],
              "footer": false,
              "measure":"$"
            },
            cost: {
              "key":"cost",
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],
              "tab":"stat",
              "name":"Cost",
              "footer": false,
              "measure":"$"
            }
        },
        // Basis of basis
        // Order, what will render and etc.
        availableColumns: [ 
            'id', 
            'login', 
            'user_group', 
            'clicks', 
            'lp_ctr', 
            'leads', 
            'cr',  
            'epc', 
            'cpc', 
            'revenue', 
            'cost', 
         ],
        checkbox: false,
        footerDraw: false,
        findInColumns: [ 'login' ],
    }

    if ( dataFromBack.customColumnOptions ){
        tableUsersOptions.columns = dataFromBack.customColumnOptions;
        for (column in tableUsersOptions.columns){
            if ( tableUsersOptions.columns.hasOwnProperty(column) ){
                tableUsersOptions.availableColumns.push(column);
            }
        }
    }

    if ( !dataFromBack.noProfit ){
        tableUsersOptions.availableColumns.push('profit', 'roi');
    }

    tableUsersOptions.mainSetColumns = tableUsersOptions.availableColumns.slice(0);
    if ( dataFromBack.showedColumnsSettings ) tableUsersOptions.showedColumnsSettings = dataFromBack.showedColumnsSettings;
    
    TT_makeTT( dataFromBack.dataSet, tableUsersOptions, function() {}, dblClickRowHandler );
    
});