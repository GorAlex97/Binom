/**
 *  Width of column settings via colgroup 
 *  Footer sum also calculated in this Builder ( concrete in makeTableBody )
 */
"use strict";
var TtBuilder = function( formatter ){

    var _formatter = formatter;
    var _clusterize = null;

    var _LEFT_BORDER_WIDTH = 4;

    /**
     * @param options Object options of tt
     * @param blockType 
     */
    function makeColgroup( options, blockType ){

      var html = '<colgroup>';

      options.showedColumns.forEach(function( item, index ){
        var colgroupStyle = '', colgroupClass = '';
        var columnOption = options.columns[item];

        html += `<col data-column="${item}" class="${item}_td ${colgroupClass}"></col>`;

      });

      html += '</colgroup>';

      return {html:html};
    }

    function getHeaderFooterWidth( OPTIONS ){
      var correlaterWidth = $(OPTIONS.tableWrapperSelector).width();

      var widthValue = '';
      if ( OPTIONS.tableWidth=="100%" ){
        widthValue = correlaterWidth ;
      } else {
        widthValue = OPTIONS.tableWidth;
      }
      return widthValue;
    }

    /**
     * length of both arrays need to be equal
     * @param optionKeys Array of keys in DataArray
     * @param optionNames Array of column name for thead
     */
    function makeHeader( OPTIONS ){
      var html = '';
      var ths = '';
      var colgroup = makeColgroup( OPTIONS, "header" ).html;

      OPTIONS.showedColumns.forEach(function( columnKey, index ){
        var columnOption = OPTIONS.columns[columnKey] || Object.create(null);
        var align = getAlignStyle( columnOption );
        var cellClass = columnKey+'_th';

        // Checkbox
        var checkboxHTML = '';
        if ( OPTIONS.checkbox && columnKey == OPTIONS.mainSetColumns[0] ){
          checkboxHTML = '<div style="top:8px;left:0px;" class="checkrow checkallrows cute_checkbox "></div>';
          cellClass += ' cell_with_checkbox';
        }

        var spanClass = '';
        if ( (!columnOption.tab || columnOption.tab == 'stat') && !OPTIONS.blockSorting ){
          spanClass = 'active';
        } else {
          spanClass = 'inactive';
        }


        var columnName = ( columnOption.name?columnOption.name:columnKey );

        const thStyle = align;

        ths += `
          <th data-column="${columnKey}" class="${cellClass}" style="${thStyle}" >
              <div class="header_table_th_content_wrapper" title="${columnName}">
                ${checkboxHTML}
                <span class="${spanClass}"> ${columnName} </span>
              </div>
            <div data-column="${columnKey}" class="resize-table-hook-${columnKey} resize-table-hook"></div>
            <div data-column="${columnKey}" class="resize-table-hook-caret-${columnKey} resize-table-hook-caret"></div>
          </th>
        `;

      });

      html = `
        <div class="tt_header_border_wrapper">
          <div class="tt_header_wrapper" id="tt_header_wrapper" style="width:${getHeaderFooterWidth(OPTIONS)}px;";>
            <table class="tt_header_table" draggable="false">
              ${colgroup}
              <tr draggable="false"> ${ths} </tr>
            </table>
          </div>
        </div>
      `;

      return {html:html};
    }

    function makeRowsArrayDefault(DATA, OPTIONS){ 
      var rowArr = new Array();
      
      for (var i=0; i<DATA.length;i++){
        if (DATA[i].hidedFromTt != true) {
          var preparedRowData = DATA[i];
          var rowResult = makeTableRow( preparedRowData, OPTIONS, i);
          rowArr.push(rowResult.html);
        }
      }

      return rowArr;
    }

    function makeRowsArrayReport(DATA, OPTIONS){ 
        var rowArr = new Array(),
          parentRow = -1, 
          parentRow1=-1, parentRow2=-1, 
          currentRowNearestParent=-1, rowLevel;

        var groupsCount;

        if (OPTIONS.reportLevels) {// firstly check from settings
            groupsCount = OPTIONS.reportLevels;
        } else {
            groupsCount = 1;
        }

        var rowArr = new Array();

        for (var i=0; i<DATA.length;i++){
          if (DATA[i].hidedFromTt != true) {
            // var preparedRowData = prepareRowDataForDraw( DATA[i], OPTIONS );
            var preparedRowData = DATA[i];
            if ( groupsCount == 1 ){
              // nuff doing
            } else {
              rowLevel = DATA[i].level;
              if ( rowLevel == 1 ) {
                parentRow1 = i;
                currentRowNearestParent = -1;
              } else if ( rowLevel == 2 ){
                parentRow2 = i;
                currentRowNearestParent = parentRow1;
              } else if ( rowLevel == 3 ){
                currentRowNearestParent = parentRow2;
              }
            }
            DATA[i].reportParent = currentRowNearestParent;
            var rowResult = makeTableRow( preparedRowData, OPTIONS, i, currentRowNearestParent);
            rowArr.push(rowResult.html);
          }
        }

        return rowArr;
    }

    function makeRowsArray( DATA, OPTIONS ){
      if ( OPTIONS.tableKind=='report' ) {
        return makeRowsArrayReport(DATA, OPTIONS);
      } else {
        return makeRowsArrayDefault(DATA, OPTIONS);
      }
    }

    function makeAsyncTD( value, columnOption, OPTIONS  ){

      var cellClass = columnOption.key+'_td';
      var cellStyle = '';
      var cellContent = '';
      var align = getAlignStyle( columnOption );

      cellStyle += align;

      if ( !OPTIONS.asyncDataTabLoaded ){
        cellContent = asyncAnimation;
      } else {
        cellContent = '';
      }

      return '<td class='+cellClass+' style="'+cellStyle+'" >'+cellContent+'</td>';
    }

    function makeTD( value, columnOption, OPTIONS, cellOpts, rowData=[] ){
      // todo в случае оффера передавать туда еще и currency
      var cellClass = columnOption.key+'_td';
      var cellStyle= '';
      var cellContent = '';
      var cellContentAfter = '';
      var align = getAlignStyle( columnOption );
      var dataAttr = ''

      var cellValue;
      if ( Array.isArray( value ) ){
        cellValue = value[0];
      } else {
        cellValue = value;
      }

      if ( window.TT_COLORIZE == 3 ){
        
        if ( BINOM.tt.tableDataCalculated.minMaxColumnValues[columnOption.key] && columnOption.format != 'string' && BINOM.__page != 'clicklog' ){
          
          var minColumnValue = BINOM.tt.tableDataCalculated.minMaxColumnValues[columnOption.key].min
          var maxColumnValue = BINOM.tt.tableDataCalculated.minMaxColumnValues[columnOption.key].max
          
          var cell = getProportianalTransparentCellColor( minColumnValue,  maxColumnValue, cellValue, true )
          dataAttr     = 'data-tt-colorize-cell="1"'
          cellStyle   += 'background:' + cell.bgColor + ';'
          if(cell.fontColor) {
            cellStyle   += 'color: ' + cell.fontColor + ';'
          }
        }
      }

      function escapeHTML(unsafe) {
        unsafe = unsafe || "";
          return unsafe
               .replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
      }

      if ( columnOption.format == 'string' ){
        cellValue = escapeHTML( ""+cellValue );
      }

      if ( columnOption.bold ){
        cellStyle += 'font-weight:bold;';
      }
      cellStyle += align;

      if ( OPTIONS.checkbox && columnOption.key == OPTIONS.mainSetColumns[0] ){
        cellContent += `<span><div class="checkrow cute_checkbox"></div></span>`;
        cellClass += ' cell_with_checkbox';
      }

      if (cellOpts.cellAlarm){
        cellClass += ' cell_alarm';
      }

      // ReportOptions
      if ( cellOpts.tagged ){
        
        cellOpts.tagged.forEach( function(tag){
          
          if ( tag.type == "tag_ico" ){
            var imageName = ""; 
            if ( tag.name.indexOf('tag') == -1 ){
              imageName = "tag_"+tag.name+".png";
            } else {
              imageName = tag.name+".png";
            }
            
            var tagCreateDate = tag.create_date || '';

            cellContent += `<img title="${tagCreateDate}" src="templates/standart/images/tags/${imageName}" class="tag_ico">`;
            if ( tag.name == 'tag_pause' || tag.name == 'tag_delete' ) cellStyle += 'color:gray;';
          } else if ( tag.type == 'lang' ){
            cellContentAfter += `<span class="tag_lang">${tag.name}</span>`;
          }
        });

      }

      if ( cellOpts.reportToggle ){
        cellContent += '<span class="report_row_toggler report_row_toggler_up"></span>'; 
      }
      if ( (typeof cellValue == 'undefined' || cellValue == null) && !columnOption.generated ) {
        cellValue = '';
      } else {
        var formattedValue = _formatter.formatString( cellValue, columnOption.formatters, columnOption.key, rowData );
        if ( columnOption.key == 'name' ){

          if (cellOpts.nameTitle){
            cellContent += `<span title="${cellOpts.nameTitle}">${formattedValue}</span>`;
          } else {
            cellContent += '<span>'+formattedValue+'</span>';
          }
          
        } else {
          cellContent += formattedValue;
        }
      }

      if ( cellOpts.noteStar ){
        cellContent += '<img style="margin-left:4px;" width="9px" src="templates/standart/images/green-star.png">';
      }

      if (cellOpts.thirdPartyEnabled) {
        cellContent += `<span class="report-row-third-party-icon"></span>`;
      }

      // Needed to move to another module
      // TODO нужно отрефакторить эту фигню - лишняя зависимость от BINOM
      if ( columnOption.key == 'name' ){
        if ( typeof BINOM!='undefined' && BINOM.__page == 'landing_page' ){
          
          if ( Array.isArray( value ) ) {
            var lang = value[1] || '';
            cellContentAfter += `<span style="color: #aaa;"> ${lang} </span>`;
          }
           
        } else if ( typeof BINOM!='undefined' && BINOM.__page == 'offers' ) {
          var payout = value[1] || '';
          try {

            let currencySign = '$';
            if ( typeof value[2] != 'undefined' ){
              const currency = value[2];
              currencySign = window.BINOM.defaultLists.getCurrencySign(currency);
            }

            if ( payout != 'auto' ){
              payout = currencySign+(parseInt(+payout*100)/100);
            }

          } catch (e) {

          }
          cellContentAfter += ` <span style="color: #aaa;"> ${payout} </span>`;
        } else if ( typeof BINOM!='undefined' && BINOM.__page == 'campaigns' ){
          var rotation_name = value[1] || '';
          cellContentAfter += ` <span style="color:#aaa;">${rotation_name}</span> `;
        }
      }

      return `<td style="${cellStyle}" class="${cellClass}" ${dataAttr}><span>${cellContent+cellContentAfter}</span></td>`;
    }

    function makeTableRow( rowData, OPTIONS, indexRow, rowNearestParentID ){
      
      indexRow = indexRow || 0;
      var white = indexRow%2 || 0;

      var rowClass = '';

      var zebraStyle;
      if (white==1){
        zebraStyle = ';background-color: #F5F5F5;';
      } else {
        zebraStyle = ';background-color: #FFFFFF;';
      }

      var html = '';
      var tds = '';

      // For report Rows  
      // TODO может быть нужно вынести в отдельный класс
      var reportClass = '';
     
      if ( OPTIONS.tableKind == 'report' ){
        reportClass = 'report_row'
        var level = rowData[OPTIONS.reportLevelProp];
        if ( level == 1 ){
          reportClass += ' row_level_1';
        } else if ( level == 2 ) {
          reportClass += ' row_level_2';
        } else if ( level == 3 ) {
          reportClass += ' row_level_3';
        }
      }

      var tdCounter = 0;

      var noted = false;
      if ( OPTIONS.notesStatus ){
        // TODO очень странное условие
        const notedAttrValue = rowData[OPTIONS.notesStatus];
        if ( !notedAttrValue || notedAttrValue=="0" ){
          noted = false;
        } else {
          noted = true;
        }
      }

      // TAGs
      var tagged = false;
      if ( OPTIONS.tableKind == 'report' ){
        if ( rowData.tags && rowData.tags.length && rowData.tags.length>0 ){
          tagged = new Array();
          rowData.tags.forEach(function( tag ){
            try{
              tagged.push( JSON.parse(tag) );
            } catch(e) {
              console.error( '!CATCHED!' );
              console.error( e );
            }
          });
        }
      }

      var needToggler = false;
      if ( rowData[OPTIONS.reportLevelProp] < OPTIONS.reportLevels ){
        needToggler = true;
      }

      // Making TDs
      OPTIONS.showedColumns.forEach(function(columnKey, cellIndex){

        tdCounter += 1;
        var columnOption = OPTIONS.columns[columnKey] || {};
        var tdHTML = '';
        var cellData;
        // Making td for async loaded data
        if ( columnOption.async ){
          tdHTML = makeAsyncTD( rowData[columnKey], columnOption, OPTIONS );
        } else {
          var cellOpts = {};
          if ( OPTIONS.tableKind == 'report' ){
            if ( tagged && cellIndex == 0 ){
              // TODO добавить конкретно тег
              cellOpts.tagged = tagged;
            }
            if ( needToggler && cellIndex == 0 ){
              cellOpts.reportToggle = true;
            } 
          } else if ( OPTIONS.notesStatus ){
            const starIconColumnKey = OPTIONS.starIconColumn || 'name';
            cellOpts.noteStar = (noted && columnKey == starIconColumnKey);            
          }
          
          // Specific double value name
          // TODO как-то зарефакторить это. лишняя не нужная привязка к BINOM
          cellData = rowData[columnKey];
          if ( columnKey == 'name' ){
            if ( typeof BINOM!='undefined' && BINOM.__page == 'landing_page' ) {
              var lang = rowData.lang || '';
              cellData = [ rowData[columnKey], lang ];
              // highlit banned landings
              if (rowData.is_banned && rowData.is_banned=='1'){
                cellOpts.cellAlarm = true;
                cellOpts.nameTitle = 'Lander’s domain is banned';
              }
            } else if ( typeof BINOM!='undefined' && BINOM.__page == 'offers' ) {
              var payout;
              if ( rowData.auto_payout != '1' ){
                payout = rowData.payout || '';
              } else {
                payout = 'auto';
              }
              cellData = [ rowData[columnKey], payout ];
              if ( rowData.currency ){
                cellData[2] = rowData.currency;
              }
              if (rowData.is_banned && rowData.is_banned=='1'){
                cellOpts.cellAlarm = true;
                cellOpts.nameTitle = 'Offer’s domain is banned';
              }

            } else if ( typeof BINOM!='undefined' && BINOM.__page == 'campaigns' ){
              var rotationName = rowData.rotation_name;
              cellData = [ rowData[columnKey], rotationName ];

              if (rowData.is_banned && rowData.is_banned=='1'){
                cellOpts.cellAlarm = true;
                cellOpts.nameTitle = 'Campaign’s domain is banned';
              }
              if (rowData.camp_ts_integration_id !== null) {
                cellOpts.thirdPartyEnabled = true;
              }

            } else if ( typeof BINOM != 'undefined' && BINOM.__page == 'traffic_sources' ) {
              if (rowData.ts_integration_id !== null) {
                cellOpts.thirdPartyEnabled = true;
              }
            }

          }

          tdHTML = makeTD( cellData, columnOption, OPTIONS, cellOpts, rowData );
        }

        tds += tdHTML;
        return;

      });

      var checkColorizeResult;

      let leftBorderCustomizeStyle = "";
      if (typeof OPTIONS.leftBorderCustomizer == "function"){
        const color = OPTIONS.leftBorderCustomizer(rowData);
        leftBorderCustomizeStyle = `border-left: ${_LEFT_BORDER_WIDTH}px solid ${color};`;
      }

      checkColorizeResult = checkForTrColorize( rowData['roi'], rowData['profit'] );
      
      var colorizeRowStyle = checkColorizeResult[0] || "";
      var colorizeRowClass = checkColorizeResult[1] || "";

      // Data unique
      var idUnique = '';
      var dataAttrUnique = '';

      if (OPTIONS.unique && OPTIONS.uniqueDataAttr){
        dataAttrUnique  = `data-tt-row-uid="${String(rowData[OPTIONS.unique])}"`;
      } else if (OPTIONS.unique && OPTIONS.tableKind != 'report' ){
        const uniqueVal = String(rowData[OPTIONS.unique]);
        idUnique = 'id="ttrowuid'+uniqueVal.replace(/\s/g,'_')+'"';
      } else if ( OPTIONS.tableKind == 'report' ){
        idUnique = 'id="ttrowuid'+indexRow+'"';
      }

      // Data level
      var dataLevel = '';
      var dataParent = '';
      if ( OPTIONS.tableKind == 'report' ){
        dataLevel = 'data-level="'+rowData[OPTIONS.reportLevelProp]+'"';
        dataParent = 'data-parent="'+rowNearestParentID+'"';
      }

      // Is Marked
      var markedClass = '';
      if (rowData.tt && rowData.tt.marked){
        markedClass += 'selected_row';
      }

      rowClass = reportClass+' '+colorizeRowClass+' '+markedClass;
      var rowStyle = colorizeRowStyle+leftBorderCustomizeStyle;

      // Is deleted row
      var deletedClass = '';
      if ( OPTIONS.deletedStatus && rowData[OPTIONS.deletedStatus] == 0 ){
        deletedClass = 'deleted_item';
      }

      html += `<tr ${idUnique} ${dataLevel} ${dataParent} style="${rowStyle}" class="${rowClass} ${deletedClass}" ${dataAttrUnique} > `+
                tds +
              '</tr>';
      return { html : html };
    }    

    function getAlignStyle( columnOption ){
        columnOption = columnOption || Object.create(null);
        var align = '';
        // TableAlign 
        if ( columnOption.align ){
          align = `text-align:${columnOption.align};`;
        } else {
          align = 'text-align:right;'
        }

        return align;
    }



    function makeTableCell(){
    }

    function getDigitsViaData( ROW, columnKey ){
      
      var val = ROW[columnKey];

      var valFract = (""+val).split('.')[1] || '';
      
      var result = valFract.replace(/[\$\%\)]/g, '').length;

      return valFract.replace(/[\$\%\)]/g, '').length;
    }

    // TODO Учитывать поиск
    /* @param DATA Array
     *
     *  In case tableKind = "report" DATA - is total Array
     *  In case tableKind = "stats" DATA - is dataSet Array
     *
    */
    function makeFooter(DATA, OPTIONS){
      if ( typeof DATA == 'undefined' ){
        DATA = new Array();
      }

      var html = '';
      var tds = '';
      var footerSum;

      if ( OPTIONS.footerDraw === false ){
        footerSum = new Array();
      } else if ( OPTIONS.tableKind == 'stats' ){
        footerSum = DATA;
      } else if ( OPTIONS.tableKind == 'report' ) {
        footerSum = DATA;
      } else {
        footerSum = new Array();
      }

      var colgroup = makeColgroup( OPTIONS, "footer" ).html;

      OPTIONS.showedColumns.forEach(function(columnKey){

        var columnOption = OPTIONS.columns[columnKey] || {};
        var value;
        var align = getAlignStyle(columnOption);
        
        var countOfDigits;

        const noFormat = (columnOption.footerCalc && columnOption.footerCalc.noFormat);

        if ( columnOption.footer && typeof footerSum[columnKey] != 'undefined' && footerSum[columnKey]!==false && ( !isNaN(footerSum[columnKey]) || noFormat ) ){
          value = footerSum[columnKey];
          
          if ( !noFormat )  {
            value = _formatter.formatString( value, columnOption.formatters, columnKey, footerSum );  
          }
          
        } else {
          value = '';
        }

        // Set width
        var tdStyle = '';
        if ( columnOption.bold ){
          tdStyle += 'font-weight:bold;';
        }
        tdStyle += align;

        // Tab class
        var tabClass='';
        if ( columnOption.tab ) {
          tabClass = 'undertab '+columnOption.tab + '_tab ';
        } 

        tds += ` <td
                  class="${tabClass+(value==''?' empty_footer_td ':'')+columnKey}_footer_td"\
                  style="${tdStyle}" >
                  <span>${value}</span>
                </td> `;
      });

      html = `
      <div class="tt_footer_border_wrapper">\
        <div class="tt_footer_wrapper" style="width:${getHeaderFooterWidth(OPTIONS)}px;";>\
          <table class="tt_footer_table">\
            ${colgroup}
            ${tds}
          </table>\
        </div>\
      </div>\
      `;

      return {html:html};
    }

    /**
     *  Draw table besides data's tbody
     *  @param DATAFROFOOTER Array/Object maybe full TableData for calculate
     *    or especially object
     */
    function makeTableBaseDeep( DATAFORFOOTER, OPTIONS ){
      
      var header = makeHeader( OPTIONS ).html;
      var footer = makeFooter( DATAFORFOOTER, OPTIONS ).html;

      var widthValue = ( OPTIONS.tableWidth=="100%"? OPTIONS.tableWidth : OPTIONS.tableWidth+"px" );

      var style = '';
      if (!OPTIONS.fullWindowHeight){
        style = 'height:100%;overflow-y:scroll;';
      }

      var html = `
                <div class="tt_full_wrapper">
                  ${header}
                  <div class="tt_data_view_wrapper" id="tt_data_view_wrapper" style="${style}">
                    <div class="tt_data_wrapper" id="tt_data_wrapper"  style="width:${widthValue};">
                      <table class="tt_data_table">
                        ${makeColgroup(OPTIONS).html}
                        <tbody class="contentArea">
                        </tbody>
                      </table>
                    </div>
                  </div>
                  ${footer}
                </div>
      `;

      return html;
    }

    return {
        makeHeader: makeHeader,
        makeFooter: makeFooter,
        makeRowsArray: makeRowsArray,
        getHeaderFooterWidth: getHeaderFooterWidth,
        makeTableBaseDeep: makeTableBaseDeep,
        makeColgroup: makeColgroup,
        getDigitsViaData: getDigitsViaData
    }
};