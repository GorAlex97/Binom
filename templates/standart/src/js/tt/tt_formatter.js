//   из API данные уже отдаются с нужным количеством знаков, но при parseFloat количество скорее всего слетает
// Класс для строковых форматтеров (даллары, проценты, скобки, цвет и т.д.)
"use strict";
var TtFormatter = function(){

    var _defaultDecimalPlaces = 4;

    var _valueColorRed = {
      light: "#C62828",
      dark: '#C62828'
    };
    var _valueColorGreen = {
      light: "#388E3C",
      dark: '#32CD32'
    };
    var _valueColorGrey = {
      light: "#757575",
      dark: '#757575'
    };


    /* DEFAULT FORMATTERS */
    function toInt( initValue ){
      initValue = parseInt( initValue );
      return ~~initValue;
    }
    function dollarSign( initValue, value ){
      // To Float
      var initValue = parseFloat( initValue );
      // Value to String
      var value = ""+value;

      if ( initValue<0 || ( (''+value)[0]=='-') ){
        return '-$'+value.replace('-', "");
      } else {
        return '$'+value;
      }

      return value;
    }
    function percentageSign( initValue, value ){
      return value+'%';
    }
    function addBrackets( initValue, value ){
      var initValue = parseFloat( initValue );
      if ( initValue < 0 ){
        value = value.replace("-", "");
        return '(' + value + ')';  
      } 
      return value;
    }

    function threeNumeralCommas( initValue, value ){
      
      var initValueString = ""+initValue;
      var valueString = ""+value;

      var regFloat = /(?=\B(?:\d{3})+\b[\.])/g;
      var regInteger = /(?=\B(?:\d{3})+\b)/g;

      if ( valueString.indexOf('.') != -1 ){
        value = valueString.replace( regFloat, ',' );
      } else {
        value = valueString.replace( regInteger, ',' );
      }
      return value;
    }

    function decimalPlaces( initValue, value, columnName ){
      return value;
    }

    function readonlyInput( initValue, value, columnName ){
      if ( typeof value == "undefined" ){
        value = '';
      }
      return '<input style="width:100%" type="text" readonly value="' + value + '" />';
    }
    // Must be at end of fortammters list
    function redGreenGrey(initValue, value, columnName){
      var theme = window.$rootStore.state.Settings.settings.appearance || 'light';
      var initValueFloat = parseFloat( initValue );
      if ( initValueFloat > 0 ){
        return '<span style="color:'+_valueColorGreen[theme]+'">'+value+'</span>';
      } else if (  initValueFloat < 0 ){
        return '<span style="color:'+_valueColorRed[theme]+'">'+value+'</span>';
      } else {
        return '<span style="color:'+_valueColorGrey[theme]+'">'+value+'</span>';
      }

    }

    function customMeasure(initValue, value, columnName){
      var measure = BINOM.tt.tableOptions.columns[columnName].measure;
      return value+(''+measure);
    }

    function timestampToDate( initValue, value ){
      if ( value=='' ) return '';
      var date = new Date(parseInt(initValue)*1000);
      var year = date.getFullYear();
      var month = date.getMonth()+1;
      if (month<10){
        month = '0'+month;
      }
      var date = date.getDate();
      if ( date<10 ){
        date = '0'+date;
      }
      return year+'-'+month+'-'+date;
    }

    function timestampToDateTime(initValue, value) {
      if (value=='') return '';
      return moment.unix(value).format('YYYY-MM-DD HH:mm');
    }

    function zeroNone( value ){
      if ( value == '0' ){
        return 'none';
      }

      return value;

    }
    function zeroEmpty( value ){
      if ( value == '0' ){
        return '';
      } 

      return value;

    }
    function yesNo(value){
      if ( value=='0' ){ value=false; } 
      if ( value ){
        return 'Yes';
      } else {
        return 'No';
      }
    }
    function userGroupToWord( value ){
      value = +value;
      switch( value ){
        case(1):
          return 'Administrator';
        break;
        case(2):
          return 'User';
        break;
        case(3):
          return 'User <span style="color:#aaa">No Profit</span>';
        break;
      }
    }
    function timeValue( value ){
      var secs = +value;
      var formatted1;
      
      if ( !isNaN( secs ) ) {
        var hours = Math.floor( secs / 3600 );
        var minutes = Math.floor( (secs - hours*3600)/60 );
        var second = Math.ceil(secs - (hours*3600+minutes*60));
        return  (hours>0?hours+' h. ':'')+(minutes>0?minutes+' m. ':'')+second+' s.'; 
      } else {
        return '';
      }
    }

    function oneIsGlobal( value ){
      return value==1?'Global':value;
    }

    function dateTimeToDate(initValue, value) {
      return value.split(" ")[0];
    }

    function nullIsNone( value ){
      if ( !value || value=="null" ){
        return "";
      } else {
        return value;
      }
    }

    function colorCellText(string, formatterNames, columnName, rowData) {
      const { color=false } = rowData;
      if ( color && window.BINOM.COLORS_SET[color] ){
        return `<span style="color:${window.BINOM.COLORS_SET[color]};">${string}</span>`
      } else {
        return string;  
      }      
    }

    /* END DEFAULT FORMATTERS */
    var _formattersStorage = {
      dollarsign : dollarSign,
      percentagesign: percentageSign,
      brackets : addBrackets,
      threenumeralcommas : threeNumeralCommas,
      decimalplaces:decimalPlaces,
      readonlyinput: readonlyInput,
      redgreengrey: redGreenGrey,
      timestamptodate: timestampToDate,
      timestamptodatetime: timestampToDateTime,
      zeronone: zeroNone,
      nullisnone: nullIsNone,
      zeroempty: zeroEmpty,
      yesno: yesNo,
      toint: toInt,
      timevalue: timeValue,
      usergrouptoword: userGroupToWord,
      custommeasure: customMeasure,
      oneisglobal: oneIsGlobal,
      datetimetodate: dateTimeToDate,
      colorcelltext: colorCellText,
    };

    /**
    * @param func need to take two values initial value and formatted and return string with value
    */    
    var addFormatters = function( name, func ){
        if ( typeof func == 'function' ){
          var obj = {};
          obj[ name ] = func;
          this.formattersStorage.push( obj );
        }
    }

    /**
     * @param formatterNames [String,Array] one formatter name or array with names 
     * @return Array 
     */
    var getFormatters = function( formatterNames ){

      if ( typeof formatterNames == 'string' ){

        return _formattersStorage[ formatterNames ];

      } else if (typeof formatterNames == 'object' && formatterNames.length > 0 ) {
        
        var formatters = new Array();

        formatterNames.forEach(function(item){
          if ( typeof item == "object" ){
            addFormatter( item.name, item.func );
            formatters.push( _formattersStorage[item.name] );
          } else if ( typeof name == "string" ){
            formatters.push( _formattersStorage[item] );  
          }
          
        });
        return formatters;
      }
    }

    function addFormatter( name, func ){
      _formattersStorage[name] = func;
    }

    /**
     * @param string Sting to format
     * @param Array/String
     * @param columnName String need in serveral formatters
     */
    var formatString = function( string, formatterNames, columnName, rowData ){

      if ( typeof formatterNames == "undefined" ){
        return string;
      }

      var formatters = this.getFormatters( formatterNames ) || [];
      var newString = string;
      formatters.forEach( function(item){
        newString = item( string, newString, columnName, rowData );
      });
      return newString;
    }

    var getFormatterFunction = function( formatterName ){
      return _formattersStorage[ formatterName ];
    }

    return {
      formatString: formatString,
      getFormatters: getFormatters,
      getFormatterFunction: getFormatterFunction,
      addFormatters: addFormatters,

    }
}