function initReportTT(initData, tableWrapperSelector) {
  if (typeof tableWrapperSelector === 'undefined') tableWrapperSelector = '#table-block';

  if (typeof window.TtReportStuff == 'undefined' ) {
    window.TtReportStuff = function(){

      var historyIsActive = (function(){
        if ( window.history ) return true;
        return false;
      })();

      var currentState = {};

      var total = cloneObject( BINOM.tt.tableTotal );

      var pureSumFooterColumns = (
        function(){
          var columnOptions, result=new Array();
          BINOM.tt.tableOptions.availableColumns.forEach( function(column){
            columnOption = BINOM.tt.tableOptions.columns[ column ];
            if ( columnOption.footer && (!columnOption.footerCalc || columnOption.footerCalc == 'sum') ){
              result.push( column );
            }
          });
          return result;
        }
      )();
      
      var complexFooterColumns = (
        function(){
          var columnOptions, result=new Array();
          BINOM.tt.tableOptions.availableColumns.forEach( function(column){
            columnOption = BINOM.tt.tableOptions.columns[ column ];
            if ( columnOption.footer && columnOption.footerCalc && columnOption.footerCalc != 'sum' ){
              result.push( column );
            }
          });
          return result;
        }
      )();

      // TAGS BLOCK
      this.addTagMarksBlock = function(){
        html = '<div class="token_tags">\
                  <span style="font-weight: normal;position: relative; top:-1px;">Marks:</span>\
                  <a style="cursor:pointer" data-tag-type="cross" class="tag_button tag_cross" id="tag_cross"> <img src="templates/standart/images/tags/tag_cross.png"  style="width: 11px;"></a>\
                  <a style="cursor:pointer" data-tag-type="minus" class="tag_button tag_minus" id="tag_minus"> <img src="templates/standart/images/tags/tag_minus.png"  style="width: 11px;"></a>\
                  <a style="cursor:pointer" data-tag-type="plus" class="tag_button tag_plus" id="tag_plus">  <img src="templates/standart/images/tags/tag_plus.png"   style="width: 11px;"></a>\
                  <a style="cursor:pointer" data-tag-type="check" class="tag_button tag_check" id="tag_check"> <img src="templates/standart/images/tags/tag_check.png"  style="width: 11px;"></a>\
                  <a style="cursor:pointer" data-tag-type="star" class="tag_button tag_star" id="tag_star">  <img src="templates/standart/images/tags/tag_star.png"   style="width: 11px;"></a>\
                  <a style="cursor:pointer" data-tag-type="pause" class="tag_button tag_pause" id="tag_pause"> <img src="templates/standart/images/tags/tag_pause.png"  style="width: 11px;"></a>\
                  <a style="cursor:pointer" data-tag-type="delete" class="tag_button tag_delete" id="tag_delete">  <img src="templates/standart/images/tags/tag_delete.png" style="width: 11px;"></a>\
                  <a id="tag_clear" data-tag-type="clear" class="tag_button tag_clear" style="cursor:pointer; font-weight: weight; color: #aaa;position: relative; top:-1px;">clear</a>\
                </div>';  
        $(BINOM.tt.tableOptions.tableWrapperSelector).append(html);
      }

      this.removeTokensBlock = function() {
       $(BINOM.tt.tableOptions.tableWrapperSelector).find('.token_tags').remove(); 
      }

      this.checkSetTokenMarks = function() {
        var GETs = URLUtils.getGETParamsAsObject();

        var group1 = BINOM.tt.tableOptions.reportGroups[0];
        var group2 = BINOM.tt.tableOptions.reportGroups[1];
        var group3 = BINOM.tt.tableOptions.reportGroups[2];

        if ( typeof GETs.camps == 'undefined' && typeof GETs.ts_id == 'undefined' && typeof GETs.rt_id == 'undefined' ){

          if ( (group1==27 || (group1>279 && group1<=290))
            || (group2==27 || (group2>279 && group2<=290))
            || (group3==27 || (group3>279 && group3<=290)) ) {

            if ( !$(BINOM.tt.tableOptions.tableWrapperSelector).find('.token_tags').length ){
              this.addTagMarksBlock();
            }
            
          } else {
            this.removeTokensBlock();
          }

        }
      }

      this.init = function(){
        this.setHandlers();
        // Adding sorting Arrow
        var sort = this.getSortingSettings();
        BINOM.tt.addArrowToTh( sort.order_type, sort.order_name );

        this.checkSetTokenMarks();    
      }

      this.getSortingSettings = function(){
        return BINOM.tt.getSortingDataReport();
      }

      // TODO Стрелочка сортировочки
      this.headerSortingClick = function( span ){
        if (currentState.loading) return;

        var column_name = $(span).parent().parent().attr( 'data-column' );

        if ( typeof column_name == 'undefined' || column_name == '' ){
          console.error( 'Can`t sorting. Can`t get column_name from data attr.' );
          return;
        }

        var oldSorting = this.getSortingSettings();
        var newSorting = {};
        if ( column_name == oldSorting.order_name ) {
          newSorting.order_name = oldSorting.order_name;
          if ( oldSorting.order_type == 'asc' ){
            newSorting.order_type = 'desc';
          } else {
            newSorting.order_type = 'asc';
          }
          $('[name=order_name]').val( newSorting.order_type );
        } else {
          newSorting.order_name = column_name;
          newSorting.order_type = 'desc';
        }

        this.doSort( newSorting );

        // ????? 
        // For refresh button
        $('[name=order_name]').val( newSorting.order_name );
        $('[name=order_type]').val( newSorting.order_type );

        // TODO Удалить все что ниже после того как передалаю кнопочки
        var groupLinks = $('.button_stat, .ul_children a');

        Array.prototype.forEach.call(groupLinks, function(a){
            var link = $(a).attr('href');

            if (!link) return;

            if (link.indexOf('order_name')!=-1){
              link = link.replace(/order_name=([^&]*)/, 'order_name='+newSorting.order_name);
            } else {
              link += '&order_name='+newSorting.order_name;
            }

            if (link.indexOf('order_type')!=-1){
              link = link.replace(/order_type=([^&]*)/, 'order_type='+newSorting.order_type);
            } else {
              link += '&order_type='+newSorting.order_type;
            }
            $(a).attr('href', link);
        });
      }

      this.setAsyncFetchedDataToTT = function( data ){
        TtReportStuff.prototype.setAsyncFetchedDataToTT( data );
        this.clearSubtractTotal();
      }

      this.doSort = function( newSorting ){
        
        var that = this;

        var newGets = {
          order_name: newSorting.order_name,
          order_type: newSorting.order_type,
        };

        URLUtils.changeGETsInURL(newGets);
        BINOM.tt.addArrowToTh( newSorting.order_type, newSorting.order_name );

        BINOM.tt.refetchData({
          queryOptions: {
            type_load: 2
          },
        });
      }
      // Deleting ico from row
      this.removeTokenTagFromRow = function( uid, tokenType ){
        var row = $("#ttrowuid"+uid) ;
        var ico = row.find( '.tag_ico' );
        ico.remove();
      }
      // Adding ico to row
      this.addTokenTagToRow = function( uid, tokenType ){
        var img = '<img src="templates/standart/images/tags/tag_'+tokenType+'.png" class="tag_ico">';
        var row = $("#ttrowuid"+uid);
        var oldIcon = row.find('.tag_ico');

        if ( oldIcon.length > 0 ){
          oldIcon.remove();
        }
        var tdFirstChild = $("td:first-child");
        if ( tdFirstChild.find('.cute_checkbox').length>0 ){
          row.find("td:first-child > span span:first-child").after( img );
        } else {
          row.find("td:first-child span:first-child").prepend( img );
        }
        
      }


      this.doSearchViaTag = function( tagType ){
        window.vmStore.commit('SET_SEARCH_VALUE', '#'+tagType);
        window.vmStore.dispatch('APPLY_REPORT_CONDITIONS');
      }

      this.clearSearchViaTag = function(){
        window.vmStore.commit('SET_SEARCH_VALUE', '');
        window.vmStore.dispatch('APPLY_REPORT_CONDITIONS');
      }

      // Return number of groups that are tokens
      this.getTokensGroup = function(){
        var group1 = BINOM.tt.tableOptions.reportGroups[0];
        var group2 = BINOM.tt.tableOptions.reportGroups[1];
        var group3 = BINOM.tt.tableOptions.reportGroups[2];
        var result = new Array();
        if ( group1==27 || (group1>279 && group1<=290) ){
          result.push(1);
        }
        if ( group2==27 || (group2>279 && group2<=290) ){
          result.push(2);
        }
        if (group3==27 || (group3>279 && group3<=290) ) {
          result.push(3); 
        }
        return result;
      }

      this.tagButtonClick = function( btn ){ 
        
        var that = this;

        var btn = $(btn);
        var markedRows = BINOM.tt.markedRows.selected.slice(0);
        if ( markedRows.length == 0 ) markedRows=BINOM.tt.markedRows.checked.slice(0);
        var tagType = btn.attr("data-tag-type");
        if ( markedRows.length > 0 ){

          var tokenGroups = this.getTokensGroup();
          
          var addTagsArr = new Array();
          var group1 = BINOM.tt.tableOptions.reportGroups[0];
          var camp_id = getURLParameter( 'camp_id' );
          // TODO GET TOKEN NUMBER
          var tokenName, rowData, groupLevel;
          var tokenedRows = new Array();
          // Making array for sending on server
          for (var i=0;i<markedRows.length;i++){
            
            rowData = BINOM.tt.tableData[ markedRows[i] ];

            // Is selected row belong tokens group
            if ( tokenGroups.indexOf(+rowData.level)!=-1 ){
              tokenedRows.push( markedRows[i] );
              
              tokenNumber = BINOM.tt.tableOptions.reportGroups[ rowData.level-1 ];
              
              tokenNumber = (tokenNumber==27 
                ? 1 
                : tokenNumber - 280);

              addTagsArr.push({ 
                  token_number: tokenNumber, 
                  camp_id: camp_id,
                  token_name: rowData.name,
                  tag_name: tagType
                });
            }

          }
          var addTagsJSON = JSON.stringify(addTagsArr);
          
          $.ajax({
            url:'',
            type: 'post',
            data: {
              ajax : 1,
              ajax_type : 'write',
              type: 'save_token_tags',
              data: addTagsJSON
            },
            success: function( data ){
              try {
                data = JSON.parse( data );
                if ( data.status == 'true' ){
                  if ( tagType == 'clear' ){
                    for (var i=0;i<tokenedRows.length;i++){
                      that.removeTokenTagFromRow( tokenedRows[i], tagType );

                      var tokenedRowData = BINOM.tt.tableData[ tokenedRows[i] ];
                      BINOM.tt.tableData.filter(function(row, index){
                        if ( row.name==tokenedRowData.name && row.level==tokenedRowData.level ) {
                          that.removeTokenTagFromRow( index, tagType );
                        }
                      });

                    }
                  } else {

                    for (var i=0;i<tokenedRows.length;i++){
                      that.addTokenTagToRow( tokenedRows[i], tagType );

                      var tokenedRowData = BINOM.tt.tableData[ tokenedRows[i] ];
                      BINOM.tt.tableData.filter(function(row, index){
                        if ( row.name==tokenedRowData.name && row.level==tokenedRowData.level ) {
                          that.addTokenTagToRow( index, tagType );
                        }
                      });

                    }

                  }
                } else if ( data.error ) {
                  makeBadAlertModal("Close", 'Error! ' + data.error ).show();
                }
              } catch (e) {
                console.error( 'Add Tag Error' );
                console.error( e );
              } finally {
                $(".selected_row").removeClass( "selected_row" );
                $(".checked_row .cute_checkbox").removeClass('checked');
                $(".checkallrows").removeClass( 'checked' );
                $(".checked_row").removeClass('checked_row');

                BINOM.tt.markedRows.selected = new Array();
                BINOM.tt.markedRows.checked = new Array();

                $("#drilldown").css( "display", "none" );

              }
            }
          });
        } else {
          if ( tagType == 'clear' ){
            this.clearSearchViaTag();
          } else {
            this.doSearchViaTag( tagType );
          }
        }

      }

      this.tagClearButtonClick = function( btn ){ 

      }

      this.tagDeleteButtonClick = function( btn ){ }

      this.setHandlers = function(){
        var that = this;
        // TT HEADER REPORT SORTING 
        $("body").on('click', '.tt_header_table th span', function(){ that.headerSortingClick( this ); });
        // TAG HANDLERS
        $("body").on("click", ".token_tags .tag_button", function(){ that.tagButtonClick( this ); });
      }


      // TODO Переименновать названия этих функций а то стремно как-то
      this.getIdNearestParentOfRow = function( uid ){
        var rowData = BINOM.tt.tableData[ uid ];
        if ( uid != 0 && rowData.level != 1 ){

          for ( var i=uid;i>=0;i-- ){
            
            if ( BINOM.tt.tableData[i].level < rowData.level ){
              return i;
            }
          }

        }
        return false;

      }

      this.getIdNearestChildrenOfRow = function( uid ){
        var rowData = BINOM.tt.tableData[uid];
        var reportLevels = BINOM.tt.tableOptions.reportLevels;
        var children = new Array();

        if ( rowData.level < reportLevels ){
          for ( var i=uid+1;i<BINOM.tt.tableData.length;i++ ){
            if ( BINOM.tt.tableData[i].level-rowData.level==1 ){
              children.push( i );
            } else if ( BINOM.tt.tableData[i].level==rowData.level ) {
              break;
            }
          }
        }
        return children;

      }

      this.getIdOfAllChildrenOfRow = function( uid ){

        var rowData = BINOM.tt.tableData[uid];
        var reportLevels =  BINOM.tt.tableOptions.reportLevels;
        var result = new Array();

        if ( reportLevels == 1 ){
          return false;
        } else {
          for ( var i=+uid+1;i<BINOM.tt.tableData.length;i++ ){
            if ( BINOM.tt.tableData[i].level > rowData.level ) result.push( ""+i );
            else break;
          }
        }

        return result;

      }

      this.getIdAllSiblings = function( uid ){
        var rowData = BINOM.tt.tableData[ uid ];
        var reportLevels = BINOM.tt.tableOptions.reportLevels;
        var siblings = new Array();
        var i, lpLvl;

        if ( reportLevels == 1 && rowData.levels == 1 ){
          return BINOM.tt.tableData.slice(0);
        } else {

          for (i = +uid-1;i>=0;i--){
            lpLvl = BINOM.tt.tableData[i].level;

            if ( lpLvl == rowData.level ) siblings.push( i );
            else if ( lpLvl < rowData.level ) break;
          }

          for (i = +uid+1;i<BINOM.tt.tableData.length;i++){
              lpLvl = BINOM.tt.tableData[i].level;

            if ( lpLvl == rowData.level ) siblings.push( i );
            else if ( lpLvl < rowData.level ) break;
          }

        }

        return siblings;

      }

      this.groupSelectedRowsByLevel = function(){
        var selectedUIDS = BINOM.tt.markedRows.selected.slice(0);
        var result = new Array( [], [], [] );
        var row, rowLevel;

        selectedUIDS.forEach( function(uid){
          row = BINOM.tt.tableData[uid];
          rowLevel = +row.level;
          if ( result[rowLevel-1].indexOf(rowLevel) == -1 ){
            result[rowLevel-1].push( uid );
          }
        }); 

        return result;
      }

      this.getMeaningfulForSubstractingRows = function(){
        
        var groupedSelected = this.groupSelectedRowsByLevel();

        var group1Selected = groupedSelected[0].slice(0);
        var group2Selected = groupedSelected[1].slice(0);
        var group3Selected = groupedSelected[2].slice(0);

        var result = new Array();
        // All selected firstGroupRows is meaningfull auto
        Array.prototype.push.apply( result, groupedSelected[0] );

        var row, rowLevel, rowParent, uid;
        // all children of selected first group is meaningless
        for (var i=0;i<groupedSelected[1].length;i++){
          
          uid = groupedSelected[1][i];
          row = BINOM.tt.tableData[ uid ];
          rowLevel = 2;
          
          if (typeof row.reportParent != undefined){
            rowParent = row.reportParent;
          } else {
            rowParent = $("#ttrowuid"+uid).attr("data-parent");
          }

          // all children of selected second group is meaningless
          groupedSelected[2].forEach(function(id){

            var rowLast, rowParentLast;
            rowLast = BINOM.tt.tableData[ id ];
            if (typeof row.reportParent != undefined){
              rowParentLast = rowLast.reportParent;
            } else {
              rowParentLast = $("#ttrowuid"+id).attr("data-parent");
            }

            // uid from loop above
            if ( rowParentLast == uid ){
              group3Selected.remove( ""+id );
            }

          });

          // Removing all children of firstGroup
          if ( result.indexOf( ""+rowParent ) != -1){
            group2Selected.remove( uid );
          }

        }
        
        Array.prototype.push.apply( result, group2Selected );
        Array.prototype.push.apply( result, group3Selected );

        return result;
      }

      this.recalculatingSelectedSubstr = function(){
        var meanSubstrRows = this.getMeaningfulForSubstractingRows();
        
        for ( var i=0;i<meanSubstrRows.length;i++ ){
          meanSubstrRows[i] = BINOM.tt.tableData[ meanSubstrRows[i] ];
        }

        total = cloneObject(BINOM.tt.tableTotal);
        this.redrawFooter( true );

        if ( meanSubstrRows.length ){
          this.subtractFromTotal( meanSubstrRows );
        }
      }

      this.multiLevelSelecting = function( uid ){

        var rowLevel = BINOM.tt.tableData[ uid ].level;
        var reportLevels =  BINOM.tt.tableOptions.reportLevels;

        var row = $('#ttrowuid'+uid);
        var rowSelected = row.hasClass('selected_row');
        if ( reportLevels == 1 ){
          var dataRow = BINOM.tt.tableData[uid];
          if ( rowSelected ){
            this.subtractFromTotal( [dataRow] );
          } else {
            this.addToTotal( [dataRow] );
          }

        } else if ( reportLevels == 2 ){

          if ( rowLevel == 1 ){
            // Select unselect all childrens
            // All children last group
            var children = this.getIdOfAllChildrenOfRow( uid );

            if ( row.hasClass('selected_row') ) {
              for (var i=0;i<children.length;i++){
                // TODO Вычитание
                // TODO ttStorage
                $('#ttrowuid' + children[i]).addClass('selected_row');
                if ( !BINOM.tt.markedRows.selected.includes( children[i] ) )
                  BINOM.tt.markedRows.selected.push( children[i] );
              }
            } else {
              for (var i=0;i<children.length;i++){
                // TODO Прибавление
                // TODO ttStorage
                $('#ttrowuid' + children[i]).removeClass('selected_row');
                BINOM.tt.markedRows.selected.remove( children[i] );
              }
            }

          } else if ( rowLevel == 2 ) {
            // Select unselect parents
            var siblings = this.getIdAllSiblings( uid );
            var countOfSelectedSiblings = 0;

            for (var i=0;i<siblings.length;i++) {
              if ( $('#ttrowuid'+siblings[i]).hasClass('selected_row') ){
                countOfSelectedSiblings += 1;
              }
            }
            
            var parentUID = $('#ttrowuid'+uid).attr('data-parent');
            var parentRow = $('#ttrowuid'+parentUID);

            if ( row.hasClass('selected_row') ){
              // TODO Вычитание
              if ( countOfSelectedSiblings==siblings.length ){
                parentRow.addClass( 'selected_row' );
                if ( !BINOM.tt.markedRows.selected.includes( parentUID ) )
                  BINOM.tt.markedRows.selected.push( parentUID );
              }
            } else {
              // TODO Прибавление
              parentRow.removeClass('selected_row');
              BINOM.tt.markedRows.selected.remove( parentUID );
            }
            
          }
          this.recalculatingSelectedSubstr();

        } else if ( reportLevels == 3 ){

          if ( rowLevel == 1 ){
            var children = this.getIdOfAllChildrenOfRow( uid );

            var tempRow;

            for ( var i=0;i<children.length;i++ ){
              tempRow = $('#ttrowuid'+children[i]);
              tempRowLvl = tempRow.attr( 'data-level' );
              if ( rowSelected ){
                // TODO ttStorage
                tempRow.addClass( 'selected_row' );

                if ( BINOM.tt.markedRows.selected.indexOf( children[i] ) == -1 ) {
                  BINOM.tt.markedRows.selected.push( children[i] );
                }

              } else {
                if ( tempRowLvl == 3 && tempRow.hasClass( 'selected_row' ) ){
                  // TODO сложение
                }
                // TODO ttStorage
                tempRow.removeClass( 'selected_row' );
                BINOM.tt.markedRows.selected.remove( children[i] );
              }
              
            }
          } else if ( rowLevel == 2 ) {
            // SelectUnselect children
            var children = this.getIdOfAllChildrenOfRow( uid );
            for ( var i=0;i<children.length;i++ ){
              var tempRow = $('#ttrowuid'+children[i]);
              if ( rowSelected ){
                if ( !tempRow.hasClass('selected_row') ){
                  // TODO вычитание
                }
                // TODO ttStorage
                tempRow.addClass( 'selected_row' );
                
                if ( BINOM.tt.markedRows.selected.indexOf( children[i] ) == -1 ) {
                  BINOM.tt.markedRows.selected.push( children[i] );
                }

              } else {

                if ( tempRow.hasClass('selected_row') ){
                  // TODO прибавление
                }
                // TODO ttStorage
                tempRow.removeClass( 'selected_row' );
                BINOM.tt.markedRows.selected.remove( children[i] );
              }
            }
            // Check siblings 
            var siblings = this.getIdAllSiblings( uid );
            var countOfSelectedSiblings = 0;
            var tempSiblingRow;
            for( var i=0;i<siblings.length;i++ ){
              tempSiblingRow = $('#ttrowuid'+siblings[i]);
              if ( tempSiblingRow.hasClass('selected_row') ){
                countOfSelectedSiblings += 1;
              }
            }

            var parentUID = row.attr('data-parent');
            var parentROW = $('#ttrowuid'+parentUID);
            if ( rowSelected ){
              if ( countOfSelectedSiblings == siblings.length  ){
                parentROW.addClass('selected_row'); 
                
                if ( BINOM.tt.markedRows.selected.indexOf( parentUID ) == -1 ) {
                  BINOM.tt.markedRows.selected.push( parentUID );
                }

              }
            } else  {
              // Remove parent mark
              parentROW.removeClass('selected_row');
              BINOM.tt.markedRows.selected.remove( parentUID );
              // TODO ttStorage
            }
            // Check parent
          } else if ( rowLevel == 3 ){
            // TODO 

            // Check siblings 
            var siblings = this.getIdAllSiblings( uid );

            var countOfSelectedSiblings = 0,
            tempRow;
            for ( var i=0;i<siblings.length;i++){
              
              tempRow = $('#ttrowuid'+siblings[i]);
              if ( tempRow.hasClass( 'selected_row' ) ){
                countOfSelectedSiblings += 1;
              } 

            }

            var parentUID = row.attr( 'data-parent' );
            var parentRow = $('#ttrowuid'+parentUID);

            // Check parent siblings
            var parentSiblings = this.getIdAllSiblings( +parentUID );
            var countOfSelectedParentSiblings = 0;
            for ( var i=0;i<parentSiblings.length;i++ ){
              
              tempRow = $('#ttrowuid' + parentSiblings[i]);
              if ( tempRow.hasClass( 'selected_row' ) ){
                countOfSelectedParentSiblings += 1;
              }

            }

            var grandParentUID = parentRow.attr( 'data-parent' );
            var grandParentRow = $('#ttrowuid'+grandParentUID);

            if ( rowSelected ){
              // TODO Вычитание
              if ( countOfSelectedSiblings == siblings.length ){
                parentRow.addClass( 'selected_row' );

                if ( countOfSelectedParentSiblings == parentSiblings.length ){
                  // TODO 
                  grandParentRow.addClass( 'selected_row' );
                  
                  if ( BINOM.tt.markedRows.selected.indexOf( grandParentUID ) == -1 ){
                    BINOM.tt.markedRows.selected.push( grandParentUID );
                  }

                  // TODO ttStorage
                }
                // TODO ttStorage
              }
            } else {
              // TODO Прибавление
              parentRow.removeClass( 'selected_row' );
              BINOM.tt.markedRows.selected.remove( parentUID );

              // TODO ttStorage
              // TODO unselect деда
              if ( grandParentRow.hasClass('selected_row') ){
                grandParentRow.removeClass( 'selected_row' );
                BINOM.tt.markedRows.selected.remove( grandParentUID );
              }
            }
          }

          this.recalculatingSelectedSubstr();

        }

      }

      this.onSelectRowHandler = function(uid){
        
        this.markAndSubtract( uid );
        
        if ( typeof setButtonState=='function' )
          setButtonState( uid );
        
        if ( BINOM.tt.markedRows.selected.length==0 ){
          $('#drilldown').css('display', 'none');
        }

      }

      /**
      * @param uid Integer 
      */
      this.markAndSubtract = function( uid ){
        this.multiLevelSelecting( uid );
      }

      // Change inner variable of TtReportStuff - total
      this.calculateComplexColumnTotal = function(){
        var formatter = BINOM.tt.getFormatter();
        var value, columnOption;
        var countOfDigits = 0;
        complexFooterColumns.forEach(function( columnKey ){
          columnOption = BINOM.tt.tableOptions.columns[ columnKey ];
          const { footerCalc: { calcFunc } } = BINOM.tt.tableOptions.columns[ columnKey ];
          if ( typeof calcFunc == "function" ){
            value = calcFunc( total );
          } else {
            throw new Error( "Unavailable type for calcFunc!" );
          }

          if (columnOption.footer == 'average') {
            var selectedRowsFirstLevelCount = BINOM.ttReportStuff.getSelectedRowsFirstLevelCount();
            var divisor =(BINOM.tt.tableDataCalculated.rowsCountByLevel['1'] - selectedRowsFirstLevelCount);
            if (!divisor) divisor = 1;
            value = BINOM.ttReportStuff.getSumByColumnWithoutSelected(columnKey) / divisor;
          }

          total[columnKey] = value;

          if ( BINOM.tt.tableData.length > 0 ){
            // Check count of digits via first line of tableData
            countOfDigits = BINOM.tt.getBuilder().getDigitsViaData( BINOM.tt.tableData[0], columnKey );
            if ( countOfDigits > 0 ){
              total[columnKey] = total[columnKey].toFixed( countOfDigits );
            }
          }
        });

      }
      this.getSumByColumnWithoutSelected = function( columnKey ) {
        var columnSum = 0;
        let reportLevel = BINOM.tt.tableOptions.reportLevels;
        for ( var i=0;i<BINOM.tt.tableData.length;i++ ){ 
          
          if ( !BINOM.tt.tableData[i].hidedFromTt && BINOM.tt.tableData[i].level == reportLevel && !BINOM.tt.markedRows.selected.includes(i.toString())) { 
            const value = BINOM.tt.tableData[i][columnKey] || 0; 
            columnSum += parseFloat( value ); 
          } 
        }
        return columnSum;
      }
      this.getSelectedRowsFirstLevelCount = function() {
        var result = 0;
        for (var i = 0; i < BINOM.tt.markedRows.selected.length; i++) {
          var rowIndex =  BINOM.tt.markedRows.selected[i];
          if ( BINOM.tt.tableData[rowIndex].level == '1' ) result++
        }
        return result;
      }
      this.getCurrentTotal = function(){
        return total;
      }
      /**
       * @param row Array of Objects
      */
      this.subtractFromTotal = function( rows ){
        // TODO получить столбцы-параметры, который должны быть вычтены
        var subtractObj = Object.create( null );
        rows.forEach(function( row ){
          pureSumFooterColumns.forEach(function(column){
            if ( typeof subtractObj[column] == "undefined" ){
              subtractObj[column] = +row[column];
            } else {
              subtractObj[column] += +row[column];
            }
          });
        });

        for ( prop in subtractObj ){
          var countOfDigits = BINOM.tt.getBuilder().getDigitsViaData( BINOM.tt.tableData[0], prop );
          
          total[prop] = +total[prop] - subtractObj[prop];
          total[prop] = total[prop].toFixed( countOfDigits );

        }
        
        this.calculateComplexColumnTotal();
        // Calling inner ttReportStuff redrawFooter function
        this.redrawFooter();
      }
      this.addToTotal = function( rows ){
        if ( rows.length && rows.length > 0 ){
          var subtractObj = Object.create( null );
          rows.forEach(function( row ){
            pureSumFooterColumns.forEach(function(column){
              if ( typeof subtractObj[column] == "undefined" ){
                subtractObj[column] = +row[column];
              } else {
                subtractObj[column] += +row[column];
              }
            });
          });
          for ( prop in subtractObj ){
            total[prop] = +total[prop] + subtractObj[prop];
            var countOfDigits = BINOM.tt.getBuilder().getDigitsViaData( BINOM.tt.tableData[0], prop );
            total[prop] = total[prop].toFixed( countOfDigits );
          }
        }
        
        this.calculateComplexColumnTotal();

        if ( BINOM.tt.markedRows.selected.length > 0 ){
          this.redrawFooter();
        } else {
          this.clearSubtractTotal();
        }
      }

      this.clearSubtractTotal = function(){
        total = cloneObject( BINOM.tt.tableTotal );
        this.redrawFooter( true );
      }
      /**
       * @param clear Boolean
      */
      this.redrawFooter = function( clear ){
        clear = clear || false;

        if ( clear ){
          BINOM.tt.redrawFooter();
        } else {
          BINOM.tt.redrawFooter( total );
        }

      }

      // Reset total subtracting on every refetchData
      // Means every refetch clearing chosen rows
      BINOM.tt.events.on('dataFetched', () => {
        total = Object.assign({}, BINOM.tt.tableTotal);
        //TODO::find out why edited columns don't added to tableTotal
        console.log('dataFetched', total);
      });

    }
    window.TtReportStuff.prototype = new TtStuff();
  }

  function drilldown_close(){
      var GETS = URLUtils.getGETParamsAsObject();
      GETS.group1 = GETS.drilldown;
      delete GETS.drilldown;
      URLUtils.changeURLWithNewGETS( GETS, {forcedRedirect: true} );
  }

  try {
    // Set TT
    var dataFromBack;
    if (typeof initData != 'undefined'){
      dataFromBack = initData;
    } else {
      dataFromBack = JSON.parse( window.JSONContainer );
    }
    $(".json_container").remove();

    var checkboxEnable = TT_checkCheckboxReportEnabled(dataFromBack.reportGroups);

    var tableReportOptions = {
        columns: {
          'group_name':{
            key: 'group_name',
            name: 'Name',
            align: 'left'
          },
        },
        tableKind: 'report',
        reportLevelProp: 'level',
        notesStatus: 'is_note',
        checkbox: checkboxEnable
    }

    if ( dataFromBack.amountOfGroup ){
      tableReportOptions.reportLevels = dataFromBack.amountOfGroup;
    }
    if ( dataFromBack.reportGroups ){
      tableReportOptions.reportGroups = dataFromBack.reportGroups;
      // Smoothly sync with vmStore
      // set groups' numbers to tt vuex module 
      window.vmStore.commit('TT/SET_REPORT_GROUPS', dataFromBack.reportGroups);
      // set group data to Stats vuex module
      var groupData = {
        group1: dataFromBack.reportGroups[0],
        group2: dataFromBack.reportGroups[1],
        group3: dataFromBack.reportGroups[2],
      }
      window.vmStore.commit('SET_REPORT_GROUPS', groupData);
    }

    if (dataFromBack.presets) {
      window.vmStore.commit('SET_REPORT_PRESETS', dataFromBack.presets);
    }

    if ( Array.isArray(dataFromBack.tsTokens) ) {
      window.vmStore.commit('SET_TRAFFIC_SOURCE_TOKENS', dataFromBack.tsTokens)
    } else {
      console.error('Traffic Source tokens for Report table was not passed!');
    }

    if ( Array.isArray(dataFromBack.lpTokens) ) {
      window.vmStore.commit('SET_LP_TOKENS', dataFromBack.lpTokens)
    }

    if (dataFromBack.filter){
      if (dataFromBack.filter.smart){
        var filter = dataFromBack.filter.smart;
        window.vmStore.commit('SET_APPLIED_FILTER', {name: filter.name, sfid: filter.id});
      } else if (dataFromBack.filter.simple){
        var filter = dataFromBack.filter.simple;
        window.vmStore.commit('SET_APPLIED_FILTER', {name: filter.name, fid: filter.id, filters: filter.filters});
      }
      
    }

    if (dataFromBack.reportFilters) {
      window.vmStore.commit('SET_SIMPLE_REPORT_FILTERS', dataFromBack.reportFilters.filters);
      window.vmStore.commit('SET_SMART_REPORT_FILTERS', dataFromBack.reportFilters.smartFilters);
    }

    if (dataFromBack.appliedFilter) {
      var f = dataFromBack.appliedFilter.simple || false;
      if (f && f.is_temp == "1") {
        window.vmStore.commit('SET_TEMP_APPLIED_FILTER', f);
      }
    }

    tableReportOptions.columnsSettings = dataFromBack.columnsSettings;
    tableReportOptions.tableWrapperSelector = tableWrapperSelector;
    const setButtonState = ()=>{};
    if ( dataFromBack.error ){
      TT_makeTT( dataFromBack, tableReportOptions, setButtonState, singleLineDrillDown );
    } else {
      TT_makeTT(
      {
          dataSet: dataFromBack.dataSet,
          total: dataFromBack.total,
          pageOptions: dataFromBack.pageOptions
        }, 
        tableReportOptions, 
        setButtonState, 
        singleLineDrillDown
      );
    }

    // create support objects for report table
    BINOM.ttReportStuff = new TtReportStuff();
    BINOM.ttPagination = new TtPagination();
    // initiate utils for report table after tt instance was created
    BINOM.ttReportStuff.init();
    BINOM.ttPagination.init();
    initContextMenu();

  } catch (e) {
    new TtErrors( e, '#table-block' );
  }
}
