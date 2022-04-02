/**
 * @param options Object main optins object
 * @param tableWrapperSelector String Selector of block draw into
 * @param uid String uid of concrete table; each table on different page must have unique id
 */
"use strict";
var TtFactory = function( options ){
    return new Tt( options );
}

// New option leftBorderCustomizer Function 
// New option rowClickableElements Object {selector: function(rowData)}

// TODO репорты пагинация
// TODO возможно для поиска нужно будет добавлять в TableData элементы какой-то параметр
// Для скрытия типа { ..., hidedFromTt: true }
var Tt = function( options ){

    var _that = this;

    // Include inline formatters
    var _formatters = TtFormatter();
    // Include Methods for drawing table
    var _builderHelper = TtBuilder( _formatters );
        
    var _defaultCellPadding = 5;
    var _headerHeight = 30;
    var _maxColumnWidth = 700;
    var _minColumnWidth = 45;

    var _tableWrapperOffsetTop = 0;

    // Changing in stretchTable() that calling all the time since start
    var _minTableWidth = 1000;
    var _fontMinimized = 0;

    // clusterize.js object
    var _clusterize = null;
    // Lower threshold of rows when using clusterize.js
    var _minClusterizedRows = 300;

    var _showedColumns = new Array();

    this.handlersState = {
      checkbox: false,
      checkboxAll: false,
    }

    this.isFetchingData = false;

    this.markedRows = {
        checked: [],
        selected: [],
        lastMarked: null,
    }

    this.localStorageIsActive = (()=>{
        if (typeof localStorage === 'object') {
            try {
                localStorage.setItem('localStorage', 1);
                localStorage.removeItem('localStorage');
                return  true;
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    })();

    this.StorageUtils =  {
        getStorageValue: function(property_name){
            var result;
            if ( _that.localStorageIsActive ) {
                var result = localStorage[property_name];
            } else {
                result = $.cookie(property_name);
            }
            try{
                result = JSON.parse(result);
            } finally{
                return result;
            }
        },
        setStorageValue : function(property_name, value){
            if ( typeof value == 'object' ) {
                value = JSON.stringify( value );
            }
            if ( _that.localStorageIsActive ) {
                return localStorage[property_name] = value;
            } else {
                return $.cookie(property_name, value, {expires: 1});
            }
        }
    }

    // Data of table to draw
    this.tableData = new Array();

    this.renderedArrRows = new Array();

    this.rowRenderCallbacks = [];
    // Flag - was 
    this.columnWidthFromStorage = false;

    // It will rewrite after in prepareOptions
    // It needed for check data from localStorage
    this.tableOptions = Object.create( null );


    this.asyncLastHourData = null;
    /* Подготавливает опции 
        чекает на ошибки,
        с форматтерами - функциями вместо строк, 
        добавляет в настроки columnKeys, columnNames,
        достает некоторые из локейл сторейджа
    */

    this.getFormatter = function(){
      return _formatters;
    }

    this.isClusterized = function(){
      if ( _clusterize != null ){
        return true;
      } else {
        return false;
      }
    }

    // Read/Write function for handling Storage
    this.readStorage = function( key ){
      key = this.tableOptions.uid + '_'+key;
      var value;
      try {
        value = JSON.parse( localStorage.getItem(key) );
      } catch (e) {
        value = localStorage.getItem(key);
      }
      // TODO чекать есть ли вообще локалсторейдж (сделать после переноса на рабочий трекер)
      return value;
    }

    this.writeStorage = function( key, value ){
      key = this.tableOptions.uid + '_'+key;
      // TODO чекать есть ли вообще локалсторейдж
      localStorage.setItem(key, value);
    }

    this.getBuilder = function(){
      return _builderHelper;
    }

    // this.tableOptions = this.prepareOptions( options );
    this.tableOptions = options;
    this.tableOptions.scrollWidth = getScrollWidth();
    this.tableOptions.sortingOptions = Object.create( null );
    this.tableOptions.tabOpen  = false;

    if( this.tableOptions.availableColumns && !this.tableOptions.mainSetColumns )
      this.tableOptions.mainSetColumns = this.tableOptions.availableColumns;

    this.tableOptions.showedColumns = this.tableOptions.mainSetColumns;

    // Shortcut for short selector string
    var _wrapperEl = this.tableOptions.tableWrapperElement;
    var _wrapperEljQ = $(_wrapperEl);

    if (this.localStorageIsActive){
      var varOpen = localStorage.getItem('typeStatState');
      if ( varOpen == 1 && typeof this.tableOptions.underTabColumns != 'undefined' && this.tableOptions.underTabColumns.length ){
        this.tableOptions.showedColumns = this.tableOptions.underTabColumns;
        this.tableOptions.tabOpen = true;
      }
    }

    this.tableOptions.asyncDataTabLoaded = false;

    // Calculate width of table via sum of all columns
    function calculateWidthForTable( columnsWidth ){
      var sumWidth = 0;
      var column;
      for ( column in columnsWidth ){
        sumWidth += columnsWidth[ column ];
      }

      return sumWidth;
    }

    /**
     * @param options main Tt optins object
     * @return object { columnKey: size(int pixels) } 
    */
    function calculateDefaultWidthForColumns( OPTIONS ){
      var widths = {};
      
      OPTIONS.showedColumns.forEach(function( columnKey ){
        var columnSettings = OPTIONS.columns[columnKey];
        if ( typeof columnSettings == 'undefined' ){
          throw new Error( 'Columns defined in table settings was not defined in `columns` settings. #' + columnKey );
        }

        widths[columnKey] = 100;

      });

      return widths;
    }

    /**
      * Calculate width for columns based on SHowedColumns
      * check default width and Storage
    */
    this.calculateWidthForColumns = function(){
      var defaultWidths = calculateDefaultWidthForColumns( this.tableOptions );
      var storageWidths = this.readStorage( 'columnsWidth' );
      var resultWidths = {};
      this.tableOptions.showedColumns.forEach(function(column){
        if ( storageWidths != null && storageWidths[column] ){
          resultWidths[column] = storageWidths[column];
        } else {
          resultWidths[column] = defaultWidths[column];
        }
      });
      return resultWidths;
    }

    /**
     * Set width for all columns via colgroup
     * take width values from setWidthForColumns
     *
     * @param widths Object with 
     */
    this.setWidthForColumns = function(){
      var widths = this.tableOptions.columnWidth;
      var w;
      for ( w in widths ){
          _wrapperEljQ.find(`.tt_full_wrapper col.${w}_td`).css("width", widths[w] );
      }
    }


    /**
    * Correlate tt data conteiner based on window's height
    */
    this.correlateTableHeight = function(){

      var top = $(this.tableOptions.tableWrapperSelector).offset().top;

      if ( top != _tableWrapperOffsetTop ){
        _tableWrapperOffsetTop = top;
      }

      var offsetTop = document.getElementById("tt_data_wrapper").offsetTop;
      var height;

      var screenHeight;
      if ( typeof window.orientation != 'undefined' ) screenHeight = document.documentElement.clientHeight
      else screenHeight = window.innerHeight;

      if ( this.isBrowserFirefox ){
        height = screenHeight - _tableWrapperOffsetTop - 80;
      } else {
        height = screenHeight - _tableWrapperOffsetTop - 70;
      }

      if (this.tableOptions.fullWindowHeight){
        _wrapperEljQ.find(".tt_data_view_wrapper").css('height', height+'px');
      }      
    }

    this.destroyClusterize = function(){
      if ( _clusterize != null ){
        _clusterize.clear();
        _clusterize = null;
      }
    }

    this.isBrowserFirefoxOrSafari = (function(){
      
      if ( window.navigator ){
        var f = window.navigator.userAgent.search( 'Firefox' );
        var s = window.navigator.userAgent.search( 'Safari' );
        var isFirefoxOrSafari = false;
        if ( f != -1 ){
          isFirefoxOrSafari = true;
        } else if ( s != -1 ){
          var c = navigator.userAgent.search( 'Chrome' );
          if ( c == -1 ){
            isFirefoxOrSafari = true;
          }
        }
        return isFirefoxOrSafari;
      } else {
        return null;
      }
    })();

    this.isBrowserFirefox = (function(){
      if (window.navigator){
        var f = window.navigator.userAgent.search('Firefox')
        if ( f != -1 ) return true;
        else return false;
      }
    })();

    this.clusterizeNeeded = function(){

      var muchRows = this.tableData.length > _minClusterizedRows ;
      // TODO чек ис мобайл
      var notMobile = typeof window.orientation == "undefined";
      var notReport = this.tableOptions.tableKind != 'report';
      var notFirefoxOrSafari = !this.isBrowserFirefoxOrSafari;
      return (
        muchRows 
          && 
        notMobile 
          && 
        notReport 
          /*&&
        notFirefoxOrSafari */
      );

    };

    /**
     * Adds clusterize.js through array if count of rows > lower threshold
     * @param arr Array of tr strings
     */
    this.insertRowsInTable = function( arr ){
      var that = this;
      var clusterizeNeeded = this.clusterizeNeeded();

      // Much rows, desktop, not report
      if ( clusterizeNeeded || _clusterize!=null ){
          // Closure for clusterize callbacks
          if ( _clusterize != null ){
            _clusterize.update( arr );
          } else {
            _clusterize = new Clusterize({
              scrollElem: _wrapperEl.querySelector('.tt_data_view_wrapper'), 
              contentElem: _wrapperEl.querySelector('.contentArea'),
              rows: arr,
              callbacks : { 
                clusterWillChange: function (){
                },
                clusterChanged: function(){
                  that.markedRows.selected.forEach( function( item ){
                    $('#ttrowuid'+item).addClass('selected_row');
                  });
                  that.markedRows.checked.forEach( function( item ){
                    $('#ttrowuid'+item).addClass('checked_row');
                    $('#ttrowuid'+item).find('.checkrow').addClass('checked');
                  });
                  if ( that.tableOptions.tabOpen && that.tableOptions.asyncDataTabLoaded ){
                    $(".uil-async-css").replaceWith("-");
                    that.drawLastHourDataInTable();
                  }
                }
              }
            });

          }
      } else {
        _wrapperEljQ.find('.contentArea').html(arr);
        that.markedRows.selected.forEach( function( item ){
          $('#ttrowuid'+item).addClass('selected_row');
        });
        that.markedRows.checked.forEach( function( item ){
          $('#ttrowuid'+item).addClass('checked_row');
          $('#ttrowuid'+item).find('.checkrow').addClass('checked');
        });
      }
    }

    this.getClusterize = function(){
      return _clusterize;
    }

    this.checkDataOnErrors = (data)=>{
        // If passed string -> then parse JSON
        if ( typeof data == 'string' && data!='no_clicks' ){
            data = JSON.parse( data );
        }
        // Data was passed and was error props in that
        if ( data!=null && data.error ){
            var text = ''; 
            // There are few types of error that can be passed
            // First - just error: String
            if ( typeof data.error == 'string' ) {
              text = data.error;
            // Second - error-object: error: {errorInfo: String}
            } else if ( data.error.errorInfo ) {
              text = data.error.errorInfo; 
            // And for other thins that doesnt know what do with
            } else {
              text = 'error';
            }
            // Draw TtErrors
            TtErrors( text, '#table-block' );
            // ??
            throw new Error( 'Cant draw Table.' );
        } 
    }

    this.events = {
      events: {},
      on(eventName, fn){
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(fn)
      },
      off(eventName, fn){
        if (this.events[eventName]){
          const i = this.events[eventName].indexOf(fn)
          if ( i>-1 )
            this.events[eventName].splice(i,1);
        }
      },
      emit(eventName, payload){
        const fns = this.events[eventName];
        if ( fns ){
          fns.forEach((fn)=>fn(payload))
        }
      }
    }

    this.tableDataCalculated = {}

    this.setTableDataCalculatedOnSetData = function(data) {
      this.setMinMaxValues(data)
      this.setRowsCountByLevel(data);
    }

    this.setRowsCountByLevel = function(data) {
      const rowsCountByLevel = {
        '1': 0,
        '2': 0,
        '3': 0,
      };

      for (let i = 0; i < data.length; i++) {
        let rowLevel = data[i].level;
        rowsCountByLevel[rowLevel]++
      }

      this.tableDataCalculated.rowsCountByLevel = rowsCountByLevel;
    }

    this.setMinMaxValues = function(data){
      if ( !data.length ) return this.tableDataCalculated.minMaxColumnValues = {}; 

      var minMaxValues = {}
      this.tableOptions.showedColumns.forEach(columnName=>{
      
       if ( typeof parseFloat(data[0][columnName]) == "number" && !isNaN(parseFloat(data[0][columnName])) && columnName != 'id' && !this.tableOptions.listOfStringColumns.includes(columnName)  ){
         minMaxValues[columnName] = {}
         minMaxValues[columnName].min = parseFloat(data[0][columnName])
         minMaxValues[columnName].max = parseFloat(data[0][columnName])
       }
      })
      
      for(  var i = 1; i < data.length; i++){
       
       for ( var columnName in minMaxValues){
         if (data[i][columnName] < minMaxValues[columnName].min){
           minMaxValues[columnName].min = parseFloat(data[i][columnName])
         }
         
         if (data[i][columnName] > minMaxValues[columnName].max){
           minMaxValues[columnName].max = parseFloat(data[i][columnName])
         }
       }
     }
     
     
     this.tableDataCalculated.minMaxColumnValues = minMaxValues
    }

    /**
     * Check and set data for drawing
     * @param data [JSON,Array] Data to draw
     */
    this.setData = function( data ){
      this.checkDataOnErrors( data );
      
      // In case data is string try to parse JSON
      if ( typeof data == 'string' ){
        try {
          if ( data == 'no_clicks' )  data = new Array();
          else data = JSON.parse( data );
        } catch(e){
          throw new Error('Cant parse ');
        }
      } else if (data == null) {
        data = new Array();
      // In case when data is not JSON or Array throw error
      } else if (typeof data != 'object') {
        throw new Error( 'Cant parse data to draw' );
      }

      // Preediting data
      if ( typeof this.tableOptions.preDrawRowsDataEditing == "function" ){
        data = this.tableOptions.preDrawRowsDataEditing(data);
      }

      // Presorting data
      if ( data.length > 1 && this.tableOptions.tableKind == 'stats' && !this.tableOptions.blockSorting){
        this.presortingOnSetData( data );
      }

      this.setTableDataCalculatedOnSetData(data);

      // TODO добавить препоиск

      this.tableData = data;

      if ( this.searchInputElement ){
        const searchString  = this.searchInputElement.value;
        this.applySearchOnTableData( searchString );
      }

      this.events.emit('dataChange', this.tableData);

    }

    this.presortingOnSetData = function( data ){
      // Pre sorting via saved data
      var sortingOption = this.getSortingData();
      if ( typeof data[0][sortingOption.column] != 'undefined' ){
          data = this.sortArray(data, sortingOption.column, sortingOption.direction );
          this.sortingOptions = { column: sortingOption.column, direction: sortingOption.direction };
      } else {
        sortingOption = {direction: 'DESC', column: 'clicks'};
        this.sortingOptions = sortingOption;
        this.setSortingData( sortingOption );
        data = this.sortArray(data, sortingOption.column, sortingOption.direction );
      }
    }

    this.setTableTotal = function( tableTotal ){
      if ( typeof tableTotal != 'undefined' ){
        this.tableTotal = tableTotal;
      } else {
        this.tableTotal = [];
      }
    }

    this.setPageOptions = function( pageOptions ){

      if ( typeof pageOptions != 'undefined' ){
        if ( typeof pageOptions == 'string' ){
          try{
            pageOptions = JSON.parse( pageOptions );
          } catch(e){
            console.error( 'Incorrect pageOptions data' );
            console.error( e );
          }
        }
        this.pageOptions = pageOptions;
        if ( BINOM.ttPagination )
          BINOM.ttPagination.drawPaginationBlock()
      }
    }

    /**
      * Change this.renderedArrRows
      * id String/Integer id of element 
      * editFunc Function( row ) for editing row must return edit row in String '<tr><td>XXX</td></tr>'
      * 
      */
    this.editInRenderedRowsArray = function( id, editFunc ){

      if ( this.renderedArrRows == null || this.renderedArrRows.length == 0 ){
        return null;
      }

      if ( typeof editFunc != 'function' ){
        return;
      }

      var el, idRow, findedRow;
      for (var i=0,l=this.renderedArrRows.length;i<l;i++){
        el = document.createElement('template');
        el.innerHTML = this.renderedArrRows[i];
        idRow = el.content.childNodes[0].getAttribute('id').replace('ttrowuid', '');
        if ( idRow == id ){
          this.renderedArrRows[i] = editFunc( this.renderedArrRows[i] );
          findedRow = this.renderedArrRows[i];
          break;
        }

      }

      return findedRow;
      
    }

    this.updateRowViaClusterize = function( id, editFunc ){
      var findedRow = this.editInRenderedRowsArray( id, editFunc );

      var clusterized = this.isClusterized();

      if ( this.isClusterized() ){
        // TODO заменить на clusterize 
        this.getClusterize().update( this.renderedArrRows );
      } else {  
        $('#ttrowuid'+id).replaceWith( findedRow );
      }
    }

    /*
    * For reasons of HUMANREADABLE
    */
    this.updateRow = function( id, editFunc ){
      this.updateRowViaClusterize(id, editFunc);
    }


    this.getFooterTotal = function(DATA=this.tableData, OPTIONS=this.tableOptions){
      
      var footerSum = {};
      var calculatedColumns = [];
      
      // Get list of column that will be calculated as sum
      OPTIONS.showedColumns.forEach( function( columnKey ){

        var columnOption = OPTIONS.columns[columnKey] || {};

        if ( columnOption.footer ){
          if ( calculatedColumns.indexOf( columnKey )==-1 ){
            calculatedColumns.push( columnKey );
          }
        }
        if ( columnOption.footer && columnOption.footerCalc && columnOption.footerCalc.neededColumns ){
          
          columnOption.footerCalc.neededColumns.forEach(function(columnKeyNeeded){
            if ( calculatedColumns.indexOf( columnKeyNeeded ) == -1 ){
              calculatedColumns.push( columnKeyNeeded );
            }
          });

        }
      });

      calculatedColumns.forEach(function(columnKey){ 
 
        var columnOption = OPTIONS.columns[columnKey] || TT_DEFAULT_OPTIONS.columns[columnKey] || {}; 
 
        if ( columnOption.footer === false ) { 
          console.warn(`Column settings for column ${columnKey} setted as false but needed for footer. Calculate as sum.`); 
          columnOption.footer = true; 
          columnOption.footerCalc = 'sum'; 
        } else if ( typeof columnOption.footer == 'undefined' ){ 
          console.warn(`Column settings for column ${columnKey} not found. Calculate as sum.`); 
          columnOption.footer = true; 
          columnOption.footerCalc = 'sum'; 
        } 
 
 
        var columnSum = 0;
        var dataLength = 0; 
        for ( var i=0;i<DATA.length;i++ ){ 
          if ( !DATA[i].hidedFromTt ) { 
            const value = DATA[i][columnKey] || 0; 
            columnSum += parseFloat( value ); 
            dataLength++;
          } 
        } 
        if (columnOption.footerCalc == 'sum' || typeof columnOption.footerCalc == "undefined") { 
          footerSum[columnKey] = columnSum; 
        } else if (columnOption.footer == 'average') { 
          footerSum[columnKey] = columnSum / dataLength; 
        } else if(columnOption.footer == 'averageSmart') {
          footerSum[columnKey] = columnSum;
        }
      });
      
      OPTIONS.showedColumns.forEach(function(columnKey){ 
        var columnOption = OPTIONS.columns[columnKey] || {}; 
        if ( columnOption.footer && columnOption.footerCalc && columnOption.footerCalc.basedOnFinal ){ 
          if(columnOption.footer !== 'average') {
          if (typeof columnOption.footerCalc.calcFunc == 'function'){ 
            footerSum[columnKey] = columnOption.footerCalc.calcFunc( footerSum ); 
          } else { 
            throw new Error(`Undefined type of calcFunc ${typeof columnOption.footerCalc.calcFunc}`); 
          } 
          }
        } 
      });  

      const fixedDecimalsFooterSum = this.fixDecimalsInFooterSum( footerSum );
      return fixedDecimalsFooterSum;
    }

    this.getDigitsViaData = ( ROW, columnKey )=>{
      var val = ROW[columnKey];
      var valFract = (""+val).split('.')[1] || '';
      var result = valFract.replace(/[\$\%\)]/g, '').length;
      return valFract.replace(/[\$\%\)]/g, '').length;
    }

    this.fixDecimalsInFooterSum = (footerSum)=>{
      let result = footerSum;
      
      if (this.tableData.length>0) {
        const keys = Object.keys( footerSum );
        const footerSumFixedDecimals = {};

        keys.forEach(key=>{
          const columnOptions = this.tableOptions.columns[key] || {};
          // If noFormat option enabled then just return footerSumFixedDecimals
          const noFormat = (columnOptions.footerCalc && columnOptions.footerCalc.noFormat);

          if (noFormat){
            footerSumFixedDecimals[key] = footerSum[key];
            return;  
          }          

          // get count of digits after point from first line in table
          const rowDecimal = this.getDigitsViaData(this.tableData[0], key);
          const v = (+footerSum[key]).toFixed( rowDecimal );
          footerSumFixedDecimals[key] = v;
        })
        result = footerSumFixedDecimals;
      }
      
      return result;
    }

    this.fillReportFooterSum = (footerSum=this.tableTotal)=>{
      // check all available columns. Find custom column with generated
      // calcFunc (actual for custom column with avg total_type (scheme for calculate footer) ).
      /// calculate this and add to tableTotal
      const { availableColumns, columns: COLUMNS } = BINOM.tt.tableOptions;

      availableColumns.forEach( avColumn=>{
        const columnOption = COLUMNS[ avColumn ];
        if ( columnOption.footer && columnOption.footerCalc && columnOption.footerCalc.calcFuncGeneratedFromFormula ){
          if(columnOption.footer !== 'average') {
            footerSum[avColumn] = columnOption.footerCalc.calcFunc( footerSum );
          }
        }
      });
      return footerSum;
    }

    // Draw table
    /**
    * @param selector string css selector of block draw in
    */
    this.draw = function(){
      var html = '';
      if ( this.tableTotal ) {
        if ( this.tableData ){ // have table data
          this.tableTotal  = this.fillReportFooterSum();
          const fixedTableTotal = this.fixDecimalsInFooterSum(this.tableTotal);
          html = _builderHelper.makeTableBaseDeep( fixedTableTotal, this.tableOptions );
        } else { // have NOT table data
          html = _builderHelper.makeTableBaseDeep( [], this.tableOptions );
          console.error( 'Tt is report and total was not set. ' );
        }
      } else {
        // Make HTML environment of table 
        // TODO зачем туда отправляется this.tableData не понятно, там в этом месте ожидается 
        //  массив данных для футера
        const footerTotal = this.getFooterTotal( this.tableTotal, this.tableOptions );
        html = _builderHelper.makeTableBaseDeep( footerTotal, this.tableOptions );
      }

      $(`${this.tableOptions.tableWrapperSelector} .tt_full_wrapper`).remove();

      $( this.tableOptions.tableWrapperSelector ).prepend( html );
      var rowsArray = _builderHelper.makeRowsArray( this.tableData, this.tableOptions );

      this.renderedArrRows = rowsArray;
      this.insertRowsInTable( rowsArray );
      this.correlateTableHeight();
      this.postDraw();
      this.stretchTable();

      var sorting = this.getSortingData();
      if ( this.tableOptions.tableKind == 'stats' && !this.tableOptions.blockSorting ){
        this.addArrowToTh( sorting.direction, sorting.column );
      }

      // This will be calling when 
      // Tab was opened from lsetting in localstorage
      if ( this.tableOptions.tabOpen ){
        if ( !this.tableOptions.asyncDataTabLoaded  ){
          this.loadLastHour();
        } else {
          this.drawLastHourDataInTable();
        }
      }
    }

    this.observersRedraw = Object.create(null);

    this.addRedrawObserver = function( name, func ){
      if ( typeof name == 'string' && typeof func == 'function' ){
        this.observersRedraw[name] = func;
      } else {
        console.error( 'Cant add observer for tt redraw' );
        console.error( name, func );
      }
    }

    this.getRedrawObserver = function(){
      return observersRedraw;
    }

    this.removeRedrawObserver = function(name){
      if ( typeof name == 'string' ){
        delete this.observersRedraw[name];
      }
    }

    this.twitchObervsersRedraw = function(){
      var obs;
      for ( obs in this.observersRedraw ){
        this.observersRedraw[obs]();
      }
    }

    /**
     * @param selector String block draw into
     */
    this.redraw = function( selector ){
      this.addLoadingLayer();
      _clusterize = null;
      _that.dataWrapperWithScroll = false;
      this.draw();
      this.removeLoadingLayer();

      this.twitchObervsersRedraw();
    }

    this.redrawRows = function( options={} ){
      const { 
        saveScroll=false, 
        clearMarked=false,
        redrawFooter=false,
        redrawHeader=false,
      } = options;

      let scrollPosition = 0;
      if ( saveScroll ){
        scrollPosition = _wrapperEl.querySelector('.tt_data_view_wrapper').scrollTop;
      }

      this.reinitRows();
      if ( redrawFooter ){
        this.redrawFooter();
      }
      if ( redrawHeader ) {
        this.redrawHeader();
      }
      this.correlateHeaderFooter();
      
      if ( saveScroll ){
        _wrapperEl.querySelector('.tt_data_view_wrapper').scrollTop = scrollPosition;
      } else {
        _wrapperEl.querySelector('.tt_data_view_wrapper').scrollTop = 0;
      }

      if ( clearMarked ){
        const checkAllCheckbox = _wrapperEl.querySelector('.checkallrows.checked');
        if ( checkAllCheckbox ){
          checkAllCheckbox.classList.remove('checked');
        }
      }

      VmStoreSyncing.selectedRowsSync();

    }

    // Redraw Footer
    /**
     * @param total Object (for report only when need to draw footer with already calculated footer)
    */
    this.redrawFooter = function( total ){
      var html;
      if ( this.tableOptions.tableKind == 'report' ){
        total = total || this.tableTotal;
        const fixedTotal = this.fixDecimalsInFooterSum( total );
        html = _builderHelper.makeFooter( fixedTotal, this.tableOptions ).html;
      } else {
        const footerData = this.getFooterTotal(this.tableData, this.tableOptions);
        html = _builderHelper.makeFooter( footerData, this.tableOptions ).html;
      }
      // use parent because footer_border_wrapper
      _wrapperEljQ.find('.tt_footer_wrapper').parent().replaceWith( html );
      this.setWidthForColumns();
    }

    this.redrawHeader = function() {
      const header = _builderHelper.makeHeader(this.tableOptions).html;
      _wrapperEljQ.find('.tt_header_wrapper').parent().replaceWith(header);
      BINOM.tt.setWidthForColumns();
      if (!this.tableOptions.blockSorting) {
        const { direction, column } = this.getSortingData();
        this.addArrowToTh(direction, column);
      }      
    }

    this.postDraw = function(){
      this.correlateHeaderFooter();      
    }

    this.correlateHeaderFooter = function(){
      var widthFor = _wrapperEljQ.find(".tt_data_wrapper").width();
      // Раньше здесь было вычитание ширины скролла из общей ширины
      // Но это не нужно т.к. .width() уже берет ширину без учета скролла
      _wrapperEljQ.find(".tt_header_wrapper").css("width", widthFor);
      _wrapperEljQ.find(".tt_footer_wrapper").css("width", widthFor);
      _that.checkAndSetScrollbar();
    }

    // TODO чекать открытую вкладку
    this.closeTab = function(){
      var scrollPosition = _wrapperEljQ.find(".tt_data_view_wrapper").scrollTop();
      this.tableOptions.showedColumns = this.tableOptions.mainSetColumns;
      // TODO
      this.destroyClusterize();
      this.redraw();
      this.stretchTable();
      this.tableOptions.tabOpen = false;
      
      _wrapperEljQ.find(".tt_data_view_wrapper").scrollTop(scrollPosition);

      if (this.localStorageIsActive){
        localStorage.setItem('typeStatState',0);
      }
    }

    /**
    * Hide columns in showed tab and show column of tabName
    */
    this.openTab = function( ){
      if ( this.tableOptions.underTabColumns ){
        var scrollPosition = _wrapperEljQ.find(".tt_data_view_wrapper").scrollTop();
        this.tableOptions.showedColumns = this.tableOptions.underTabColumns;
        // TODO
        this.destroyClusterize();
        this.redraw();
        this.stretchTable();
        this.tableOptions.tabOpen = true;
        _wrapperEljQ.find(".tt_data_view_wrapper").scrollTop(scrollPosition);
        if ( !this.tableOptions.asyncDataTabLoaded  ){
          this.loadLastHour();
        } else {
          this.drawLastHourDataInTable();
        }

        if (this.localStorageIsActive){
          localStorage.setItem('typeStatState',1);
        }
      } else {
        console.warn( 'Try to open tab without undertab settings.' );
      }

    }

    this.asyncTabDataFetched = false;

    // TODO rewrite on fetch and promise
    this.loadLastHour = function(){
      if ( this.asyncTabDataFetched ) return; // if this flag equals false it means refetch in progress

      this.asyncTabDataFetched = false;

      var that = this;

      const formData = new FormData();
      formData.append('ajax', 1);
      formData.append('type', 'get_last_hour_stats')

      return fetch('', {
        credentials: 'include',
        method: 'POST',
        body: formData
      })
        .then(r=>r.json())
        .then(data=>{
          that.removeAsyncLoaderAnimation();
          that.asyncLastHourData = data;
          that.drawLastHourDataInTable();
          that.tableOptions.asyncDataTabLoaded = true;
          this.asyncTabDataFetched = false;
        })
        .catch(e=>{
          console.error( 'Cant load lasthour data' );
          console.error( e );
        })

    }

    this.removeAsyncLoaderAnimation = function(){
      $(".uil-async-css").replaceWith("");
    }

    /**
     * Вызывается так же во время 
     */
    this.drawLastHourDataInTable = function(){

      var that = this;

      if ( this.asyncLastHourData == null ){
        return;
      }

      this.asyncLastHourData.forEach(function(item){
        if ( $('#ttrowuid'+item.el_id).length > 0 ){
          var CLH = item.clicks_lh;
          var LLH = item.leads_lh;
          var PLH = item.profit_lh;

          var timevalueFunc = that.getFormatter().getFormatterFunction( 'timevalue' );

          //var formattersPLH = BINOM.tt.getFormatter().getFormatters(  );
          var PLH = that.getFormatter().formatString( PLH, BINOM.tt.tableOptions.columns['profit_lh'].formatters, 'profit_lh' );
          var lastleadDate = timevalueFunc( item.last_lead );

          _wrapperEljQ.find('#ttrowuid'+item.el_id+' .clicks_lh_td').html( '<span>'+CLH+'</span>' );
          _wrapperEljQ.find('#ttrowuid'+item.el_id+' .leads_lh_td').html( '<span>'+LLH+'</span>' );
          _wrapperEljQ.find('#ttrowuid'+item.el_id+' .profit_lh_td').html( '<span>'+PLH+'</span>' );
          _wrapperEljQ.find('#ttrowuid'+item.el_id+' .last_lead_td').html( '<span>'+lastleadDate+'</span>' );
        } 
      });
    }

    this.clearCheckedAndSelected = function(){
      // Remove selected
      $(this.tableOptions.tableWrapperSelector).find( 'tr.selected_row' ).removeClass('selected_row');
      this.markedRows.selected.splice(0);
      // Remove checked
      $(this.tableOptions.tableWrapperSelector).find( 'tr.checked_row .cute_checkbox.checked' ).removeClass('checked');
      $(this.tableOptions.tableWrapperSelector).find('.checkallrows.checked').removeClass('checked');
      $(this.tableOptions.tableWrapperSelector).find( 'tr.checked_row' ).removeClass('checked_row');
      this.markedRows.checked.splice(0);

      VmStoreSyncing.checkedRowsSync();
      VmStoreSyncing.selectedRowsSync();
    }

    this.changeShowedColumns = function( newShowedColumns ){
      
      var that = this;
      var wasChanged = false;

      if ( this.tableData.length > 100 ){
        this.addLoadingLayer();
      }
        // Is all column names validate (it include in array of columnKeys)
        newShowedColumns.forEach(function(item){
          if ( that.tableOptions.columns[item] == -1 ){
            throw new Error( 'Can`t show '+item+' column. ' );       
          }
        });

        // check Was array of showed columns changed
        // in other words it need to redraw table?
        if ( newShowedColumns.length != that.tableOptions.showedColumns.length ){
          wasChanged = true;
        } else {
          var inOld = true;
          newShowedColumns.forEach( function( item ){
            if ( that.tableOptions.showedColumns.indexOf(item) == -1 ){
              inOld = false;
              return false;
            }
          });

          if ( !inOld ){
            wasChanged = true;
          }

        }
        
        if ( wasChanged ){
          that.tableOptions.mainSetColumns = newShowedColumns;

          if ( !that.tableOptions.tabOpen ){
            that.tableOptions.showedColumns = that.tableOptions.mainSetColumns;
            // TODO расчитывать ширину для новых колонок
            that.tableOptions.columnWidth = that.calculateWidthForColumns();
            if ( that.tableOptions.tableWidth != "100%" ){
              that.tableOptions.tableWidth = calculateWidthForTable( that.tableOptions.columnWidth );
            }
            that.redraw();
            that.stretchTable();
            $(window).trigger("resize");
          } 
         
        }

        that.removeLoadingLayer();

    }

    this.getFactWidthOfNeighborColumn = function( column ){

      var numberOfColumn = this.tableOptions.showedColumns.indexOf(column); 
      var nextColumnKey = this.tableOptions.showedColumns[numberOfColumn+1];

      return $(".tt_header_wrapper ."+nextColumnKey+"_th").outerWidth();
    }

    this.getDefaultWidthOfNeighborColumn = function( column ){
      var numberOfColumn = this.tableOptions.showedColumns.indexOf(column); 
      var nextColumnKey = this.tableOptions.showedColumns[numberOfColumn+1];

      return this.tableOptions.columnWidth[nextColumnKey];
    }

    this.changeColumnWidth = function(column, value){

      if ( !this.tableOptions.sizeChanged ){
        this.tableOptions.sizeChanged = true;
      } 

      value = Math.floor( value );

      if ( value > _maxColumnWidth ){
        value = _maxColumnWidth;
      }
      if ( value < _minColumnWidth ){
        value = _minColumnWidth;
      }

      // Value to percent
      value = value/$(this.tableOptions.tableWrapperSelector).width()*100+"%";
      $("col."+column+"_td").css("width", value);
    }

    /* It need to be called one time (in this.draw() now) */
    this.makeResizeHooksAlive = function(){
      var that = this;

      $("body").on("mousedown", `${this.tableOptions.tableWrapperSelector} .resize-table-hook`, function(e){

        e = e || event;

        var startClickX = e.pageX;
        var column = $(e.target).attr( 'data-column' );
        var columnNumber = that.tableOptions.showedColumns.indexOf( column );

        var currentWidth = parseInt( _wrapperEljQ.find(`.${column}_th`).outerWidth() );

        var neighborColumnWidth = that.getFactWidthOfNeighborColumn( column );

        var columnCaret = _wrapperEljQ.find(`.${column}_th .resize-table-hook-caret`);

        var deltaX = 0;

        // Calculate limit of caret
        // var deltaXLimitColumnRight = _maxColumnWidth - currentWidth;
        var deltaXLimitColumnLeft = _minColumnWidth - currentWidth;
 
        if ( that.tableOptions.tableKind=='report' && columnNumber == 0 ){
          deltaXLimitColumnLeft += 360 - _minColumnWidth;         
        }

        // var deltaXLimitColumnNeighborRight = -(_maxColumnWidth - neighborColumnWidth);
        var deltaXLimitColumnNeighborLeft = -(_minColumnWidth - neighborColumnWidth);

        columnCaret.css("display", "inline-block");

        var edge  = null;

        // Set width of hook's caret
        columnCaret.css("height",
          window.innerHeight - $(that.tableOptions.tableWrapperSelector).offset().top-5);

        document.body.style.cursor = 'ew-resize';

        function onMouseUp(e){

          document.body.style.cursor = 'default';
          document.onmouseup = null;
          document.onmousemove = null;
          // Caret moved on
          var deltaFact = deltaX;

          if ( edge != null ){
            deltaX = edge;
          }
          columnCaret.css("height", _headerHeight);
          columnCaret.css("display", "none");
          columnCaret.css("right", "");

          // Reset all moves
          if ( e.pageX<0 ){
            columnCaret.css('background-color', '');
            return;
          }

          var currentCursorX = e.pageX;

          if ( Math.abs(deltaX)<=2 ){
            return;
          }

          var numberOfColumn = that.tableOptions.showedColumns.indexOf(column); 
          var nextColumnKey = that.tableOptions.showedColumns[numberOfColumn+1];

          // Check how many percents moved
          var percentsMove = deltaX/_wrapperEljQ.width()*100;

          var oldWidthPercents = parseFloat( _wrapperEljQ.find(`colgroup col.${column}_td`)[0].style.width.replace("%") );
          var oldWidthPercentsNeighbor;
          if ( _wrapperEljQ.find(`colgroup col.${nextColumnKey}_td`).length > 0 ){
            oldWidthPercentsNeighbor = parseFloat( _wrapperEljQ.find(`colgroup col.${nextColumnKey}_td`)[0].style.width.replace("%") );
          } else {
            return;
          }

          _wrapperEljQ.find(`colgroup col.${column}_td`).width(oldWidthPercents+percentsMove+"%");
          _wrapperEljQ.find(`colgroup col.${nextColumnKey}_td`).width(oldWidthPercentsNeighbor-percentsMove+"%");

          // $("colgroup col."+column+"_td").width(oldWidthPercents+percentsMove+"%");
          // $("colgroup col."+nextColumnKey+"_td").width(oldWidthPercentsNeighbor-percentsMove+"%");
        }

        document.onmousemove = function(e){
          var currentCursorX = e.pageX;
          if( currentCursorX<0 ) {
            onMouseUp(e);
            return;
          }

          deltaX = currentCursorX - startClickX;

          var tempNewWidth = currentWidth+deltaX;

          var potentialWidthOfNeighborColumn = neighborColumnWidth+deltaX*(-1);

          /*if ( deltaX<=deltaXLimitColumnNeighborRight ){
            edge = deltaXLimitColumnNeighborRight;
          } else*/ if ( deltaX>=deltaXLimitColumnNeighborLeft ){
            edge = deltaXLimitColumnNeighborLeft;
          /* } else if ( deltaX>=deltaXLimitColumnRight ){
            edge = deltaXLimitColumnRight;*/
          } else if ( deltaX<=deltaXLimitColumnLeft ){
            edge = deltaXLimitColumnLeft;
          } else {
            edge = null;
          }

          if ( edge == null ) {
            columnCaret.css("right", (-1)*deltaX );
            if ( columnCaret.css('background-color') ){
              columnCaret.css('background-color', '');
            }
          } else {
            columnCaret.css('background-color', 'rgba(200, 10,20,0.6)');
            columnCaret.css("right", (-1)*edge );
          } 
        }

        document.onmouseup = function(e){
          onMouseUp(e);
        }

      });
    }

    this.reinitRows = function(){
      var arr = _builderHelper.makeRowsArray(this.tableData, this.tableOptions);
      this.insertRowsInTable(arr);
    }

    this.makeShowHideReportButtonsAlive = function(){
      var this_tt = this;
      $('body').on('click', '.report_row_toggler', function( e ){
        e = e || event;
        var row = $(this).parent().parent().parent();
        if ( $(this).hasClass('report_row_toggler_up') ){
          $(this).removeClass( 'report_row_toggler_up' );
          $(this).addClass( 'report_row_toggler_down' );
          this_tt.hideRowsBelow( row );
        } else {
          $(this).removeClass( 'report_row_toggler_down' );
          $(this).addClass( 'report_row_toggler_up' );
          this_tt.showRowsBelow( row );
        }

        e.stopPropagation();
        e.stopImmediatePropagation();
      });

    }

    // FOR REPORTS ONLY
    /**
    * @param row Jquery Object
    */
    this.hideRowsBelow = function( row ){
      var nextRow = row.next();
      var rowLevel = row.attr('data-level');
      while( nextRow.attr('data-level') > rowLevel ){
        nextRow.css('display', 'none');
        nextRow = nextRow.next();
      }

    }

    this.showRowsBelow = function( row ){
      var nextRow = row.next();
      var rowLevel = row.attr('data-level');
      while( nextRow.attr('data-level') > rowLevel ){
        nextRow.css('display', 'table-row');
        nextRow = nextRow.next();
      }
    }

    /* It need to be called one time (in this.draw() now) */
    // Default way for sorting, applied only in stats
    this.makeSortingByHeaderAlive = function(){
      var that = this;
      
      // Default sorting
      // Set handlers for sorting only on stats pages
      if ( this.tableOptions.tableKind == 'stats' ) { 
        $('body').on('click', `${this.tableOptions.tableWrapperSelector} .tt_header_table th span`, function(){
          if ( $(this).hasClass('inactive') ) return;
          var columnKey = $(this).parent().parent().attr('data-column');
          setTimeout( function(){ that.doSort( columnKey ); }, 10);
        });
      }
      // At report it will do through reportStuff
    }

    this.applySearchOnTableData = (searchString)=>{
      var that = this;
      var searchByregExp = false;
      // Get regexp from search input
      if ( searchString.startsWith('<{/') && searchString.endsWith('/}>') && searchString.length > 5){
        searchByregExp = true
        try{
          var regExp = new RegExp( searchString.slice(3, searchString.length - 3) )
        } catch(e){
          searchByregExp = false
        }
      }
      // Check in tag searching
      const { tagSearch=false } = this.tableOptions;
      let tagSearchFunction = null;
      if ( tagSearch && tagSearch.startSign && searchString[0]===tagSearch.startSign ){
        const { column=false, entry='full' } = tagSearch;
        if ( column ){
          tagSearchFunction = (rowData) => {
            // TODO EXPAND THIS WHEN TAGS (TAGS MAYBE ARRAY OF SOMETHING)
            return rowData[column] === searchString.substr(1).toLowerCase();
          }
        }
      }

      for ( var i=0;i<this.tableData.length;i++ ){
        var suit = false;
        // Via tagSearching
        if ( tagSearchFunction ){
          if ( tagSearchFunction(this.tableData[i]) ){
            that.tableData[i].hidedFromTt = false;
            suit = true;
          }          
        } else {
          // Via findInColumns option - include/regexp
          this.tableOptions.findInColumns.forEach(function( columnKey ){
            var value = that.tableData[i][columnKey];

            if ( value === null || typeof value == "undefined" ){
              value = 0;
            }

            if (typeof value != "string" ){
              value = value.toString();
            }

            if ( value.toLowerCase().indexOf( searchString.toLowerCase() ) != -1 || searchByregExp && regExp.test(value) != false ) {
              that.tableData[i].hidedFromTt = false;
              suit = true;
              return false;
            };
          });

        }
        if ( suit == false ){
          this.tableData[i].hidedFromTt = true;
        }
      }
    }

    // TODO протестить на большом количестве строк
    this.doSearch = function( searchString ){
      this.applySearchOnTableData(searchString)

      this.reinitRows();
      BINOM.tt.checkAndSetScrollbar();
      this.redrawFooter();

      VmStoreSyncing.meaningfulRowsSync();

    }

    // Sorting tableData by columnName
    // via optimized quicksort
    this.sortArray = function( arr, columnName, direction ){
      
      if ( !this.tableOptions.columns[columnName] ){
        return arr;
      }

      if ( arr.length <= 1 ) return arr;

      var prepareData;
      var compareFunc, compareF;

      if ( this.tableOptions.columns[columnName].format && this.tableOptions.columns[columnName].format == 'string' ){
        prepareData = function(a){ if(typeof a == 'string') {return a.toUpperCase().trim();} else if (a && a.toString) { return a.toString().toUpperCase().trim(); } else { return ""; } }
      } else {
        prepareData = function(a){ if (a===null) return 0; else return parseFloat(a) };
      }

      if ( direction == "ASC" ){
        compareF = function(a,b){
          if ( a<=b ){
            return true;
          }
          return false;
        }
      } else {
        compareF = function(a,b){
          if ( a>=b ){
            return true;
          }
          return false;
        }
      }

      // format of cap column is #Number (count in pool at now)# / #Number (pool)#
      if ( columnName == 'cap' ){
        compareFunc = function(a,b){
          var splittedA = a.split(" / ");
          let floatA;
          if (splittedA.length!=2) {
            if ( direction=="ASC" ) floatA = Infinity;
            else floatA = -Infinity;
          } else {
              floatA = splittedA[0] / splittedA[1];  
          }
          
          var splittedB = b.split(" / ");
          let floatB;
          if (splittedB.length!=2) {
            if ( direction=="ASC" ) floatB = Infinity;
            else floatB = -Infinity;
          } else {
            floatB = splittedB[0] / splittedB[1];
          }

          return compareF(floatA, floatB);
        }
      }  else {
        compareFunc = compareF;
      }

      // Stealed from jsperf sorting-algorithms test 
      // Working perfectly 
      function swap(ary, a, b) {
           var t = ary[a];
           ary[a] = ary[b];
           ary[b] = t;
      }
      function fast_quicksort(ary) {
          var stack = [];
          var entry = [0,ary.length,2 * Math.floor(Math.log(ary.length)/Math.log(2))];
          stack.push(entry);
          while(stack.length > 0) {
              entry = stack.pop();
              var start = entry[0];
              var end = entry[1];
              var depth = entry[2];
              if(depth == 0) {
               ary = shell_sort_bound(ary,start,end);
               continue;
              }
              depth--;
              var pivot = Math.round((start + end) / 2);
                  
              var pivotNewIndex = inplace_quicksort_partition(ary,start,end, pivot);
              if(end - pivotNewIndex > 16) {
                  entry = [pivotNewIndex,end,depth];
                  stack.push(entry);
              }
              if(pivotNewIndex - start > 16) {
                  entry = [start,pivotNewIndex,depth];
                  stack.push(entry);
              }
          }
          ary = insertion_sort(ary);
          return ary;
      }
      // Insertion sort
      function insertion_sort(ary) {
        for(var i=1,l=ary.length;i<l;i++) {
          var value = ary[i];
          for(var j=i - 1;j>=0;j--) {
            if(compareFunc(prepareData(ary[j][columnName]), prepareData(value[columnName]) ))
              break;
            ary[j+1] = ary[j];
          }
          ary[j+1] = value;
        }
        return ary;
      }
      function inplace_quicksort_partition(ary, start, end, pivotIndex) {
          var i = start, j = end;
          var pivot = ary[pivotIndex];
          
          while(true) {
              if ( direction == 'ASC' ){
                while(prepareData(ary[i][columnName]) < prepareData(pivot[columnName])) {i++};
              } else {
                while(prepareData(ary[i][columnName]) > prepareData(pivot[columnName])) {i++};
              }
              j--;
              if ( direction == 'ASC' ){
                while( prepareData(pivot[columnName]) < prepareData(ary[j][columnName]) ) {j--};
              } else {
                while( prepareData(pivot[columnName]) > prepareData(ary[j][columnName]) ) {j--};
              }
              if(!(i<j)) {
                  return i;
              }
              swap(ary,i,j);
              i++;
         }
      }
      function shell_sort_bound(ary,start,end) {
        // Находит центр между началом и концом
        var inc = Math.round((start + end)/2),
            i, j, t;

        while (inc >= start) {
            // цикл от центра к концу
            for (i = inc; i < end; i++) {
                t = ary[i];
                j = i;

                while (j >= inc && prepareData(ary[j - inc][columnName]) > prepareData(t[columnName])) {
                    ary[j] = ary[j - inc];
                    j -= inc;
                }

                ary[j] = t;
            }
            inc = Math.round(inc / 2.2);
        }

        return ary;
      }

      return fast_quicksort( arr );
    }

    this.addArrowToTh = function(sortingDirection, columnName){

      if ( typeof sortingDirection != 'string' ){
        console.error( 'addArrowToTh error. Incorrect sortingDirection: '+sortingDirection+'. It needed to be String!.' );
        return;
      }

      sortingDirection = sortingDirection.toLowerCase();

      var arrowFileName = (sortingDirection=='desc'?'down_3.png':'up_3.png');
      var arrowHtml = ' <img src="'+TEMPLATES_IMAGES+arrowFileName+'" class="direction_sort_icon" >';

      if ( sortingDirection == 'asc' ) {
        $(`${this.tableOptions.tableWrapperSelector} .direction_sort_icon`).remove();
        // Whitespace for padding
        $(`${this.tableOptions.tableWrapperSelector} .${columnName}_th .header_table_th_content_wrapper span`).prepend( arrowHtml+" " );
      } else {
        $(`${this.tableOptions.tableWrapperSelector} .direction_sort_icon`).remove();
        // Whitespace for padding
        $(`${this.tableOptions.tableWrapperSelector} .${columnName}_th .header_table_th_content_wrapper span`).prepend( arrowHtml+" " );
      }

    }

    this.getSortingDataReport = function() {
      //todo перенести из reportStuff
      var getsObj = URLUtils.getGETParamsAsObject();
      var sorting = {};
      var reportGroup = BINOM.tt.tableOptions.reportGroups;

      if ( getsObj.order_name ){
        sorting.order_name = getsObj.order_name;
      } else {
        if ( reportGroup[0]==31 || reportGroup[0]==25 || reportGroup[0]==26 ) {
           sorting.order_name = 'name';
        } else {
          sorting.order_name = 'clicks';
        }
      }

      if ( getsObj.order_type ){
        sorting.order_type = getsObj.order_type;
      } else {
        if ( reportGroup[0]==31 || reportGroup[0]==25 || reportGroup[0]==26 ){
          sorting.order_type  = 'asc';
        } else {
          sorting.order_type = 'desc';  
        }
      }

      return sorting;
    }

    this.getSortingData = function(){
      if (this.tableOptions.tableKind === 'report') {
        const {
          order_type: direction,
          order_name: column
        } = this.getSortingDataReport();
        return { direction, column };
      }

      var sorting = this.StorageUtils.getStorageValue( 'tt_sorting' );
      if ( typeof sorting == 'object' ){
        return sorting;
      } else {
        const defaultSortingColumn = this.tableOptions.defaultSortingColumn || 'clicks';
        const defaultSortingDirection = this.tableOptions.defaultSortingDirection || 'DESC';

        var sortingOption = {column: defaultSortingColumn, direction: defaultSortingDirection};
        this.setSortingData( sortingOption );
        return sortingOption;
      }
    }

    /**
      * 
      * Can take prop: String value: String 
      *  or 
      * Object { column: string, direction: string }
      * 
      */
    this.setSortingData = function(prop, value){

      if ( typeof prop == 'object' ){
        this.StorageUtils.setStorageValue( 'tt_sorting', prop );  
        this.sortingOptions = prop;
      } else if ( typeof 'prop' == 'string' ){
        var oldSortingOpt = this.StorageUtils.getStorageValue( 'tt_sorting' );
        this.sortingOptions[prop] = value;
        oldSortingOpt[prop] = value;
        this.StorageUtils.setStorageValue( 'tt_sorting', oldSortingOpt );
      }

    }

    this.doSort = function( columnName ){
      var columnOption = this.tableOptions.columns[columnName] || {};

      var that = this;

      var sortingOption = this.getSortingData(),
          newSortinDirection = ( sortingOption.direction == 'DESC' ? 'ASC' : 'DESC' );

      this.setSortingData({ direction: newSortinDirection, column: columnName });
      var columnFormat = '';
      if ( !columnOption.format ) {
        columnFormat = 'number';
      } else {
        columnFormat = columnOption.format;
      }

      this.addArrowToTh( newSortinDirection, columnName );

      setTimeout(function(){
        that.tableData = that.sortArray( that.tableData, columnName, newSortinDirection );
        that.redrawRows();
        if (that.tableOptions.tabOpen) {
          that.drawLastHourDataInTable();
        }
        _that.events.emit('dataChange', this.tableData);
        _that.events.emit('dataSort', this.tableData);
      }, 50);

    }

    this.setResizeActions = function(){
      var that = this;

      $(window).on('resize', function(){
        
        that.correlateTableHeight();

        var tableWidth = _wrapperEljQ.find(".tt_data_wrapper").width();
        _wrapperEljQ.find(".tt_header_wrapper").css("width", tableWidth);
        _wrapperEljQ.find(".tt_footer_wrapper").css("width", tableWidth);

        _that.checkAndSetScrollbar();

      }); 

    }

    // Position of header and footer changed by scroll of data view
    this.setScrollAction = function(){
    }

    this.stretchTableSize = function(){
      $(".tt_data_wrapper").css( "width", "100%" );
      this.tableOptions.tableWidth = "100%";

      // I dont know why, but width of main wrapper changing
      $(".tt_header_wrapper").css( "width", $(".tt_data_wrapper").width() );
      $(".tt_footer_wrapper").css( "width", $(".tt_data_wrapper").width() );
    };

    this.checkColumnUnderHiddenTab = function( item ){
      var columnSettings = this.tableOptions.columns[item];
      if ( columnSettings.tab  && columnSettings.tab != this.tableOptions.tabs.showed ){
        return true;
      } else {
        return false;
      }
    }

    // Set for table and column (in percents) min sizes
    this.setMaxContentWidth = function( options ){
      var widthData = this.columnsMaxContentWidth( options );
      var sumOfWidths = 0;
      var p;
      for ( p in widthData.widths ){
        sumOfWidths += widthData.widths[p];
      }
      $(this.tableOptions.tableWrapperSelector).css( 'min-width', sumOfWidths+'px' );
      _minTableWidth = sumOfWidths;

      this.tableOptions.columnWidth = widthData.percents;
      this.setWidthForColumns();
    }

    // Calculate width for each column
    /**
    * @return Object {percents: widths in percents, widths: min widths in pixels }
    */
    this.columnsMaxContentWidth = function( options ){
      
      options = options || { unlimitColumns: [] };

      var that = this;

      var widths = {};
      var percents = {};
      var sum = 0;
      var tableWidth = $(this.tableOptions.tableWrapperSelector).width();

      this.tableOptions.showedColumns.forEach(function( item, index ){
        
        var max = _minColumnWidth;

        if ( $(".tt_data_table ."+item+"_td span").eq(0).find('input').length > 0 ){

          max = 100;

        } else {

          // Find max content width
          $(".tt_data_table ."+item+"_td span").each(function(i, el){
            var w = $(el).outerWidth();
            if ( !options.unlimitColumns || options.unlimitColumns.indexOf( item ) == -1 ){
              // Limit column width from above
              if ( w>_maxColumnWidth ) {
                w = _maxColumnWidth;
              }
            }

            if ( w>max ) max = w;

          });

        }

        var footerWidth = $(".tt_footer_table ."+item+"_footer_td span").outerWidth();
        if ( footerWidth>max ){
          max = footerWidth;
        }

        var headerWidth = $(".tt_header_table ."+item+"_th span").outerWidth();
        if ( headerWidth>max ){
          max = headerWidth;
        }


        if ( that.tableOptions.tableKind == 'report' && index == 0 && max < 350 ){
          max = 350;
        }

        widths[item] = max+16;
        sum += widths[item];
        
      });

      this.tableOptions.showedColumns.forEach(function( item ){
          percents[item] = widths[item]/sum*100+"%";
      });
      return {percents: percents, widths:widths};
    }
    _that.dataWrapperWithScroll = false;
    var checkAndSetScrollbarTimeout = 0;
    this.checkAndSetScrollbar = function(){
      clearTimeout(checkAndSetScrollbarTimeout);
      checkAndSetScrollbarTimeout = setTimeout( function(){
        var dataViewWrapper = _wrapperEljQ.find('.tt_data_view_wrapper');
        var needScroll = dataViewWrapper.hasScrollBar();

        if ( needScroll )
        {

          if ( !_that.dataWrapperWithScroll )
          {
            dataViewWrapper.css('overflow-y', 'scroll');
            var header = _wrapperEljQ.find( '.tt_header_wrapper' );

            var headerWidth = header[0].offsetWidth;
            var scrollWidth = _that.tableOptions.scrollWidth;
            var newHeaderWidth = headerWidth - scrollWidth;

            header.css('width', newHeaderWidth);

            var footer = _wrapperEljQ.find( '.tt_footer_wrapper' );
            footer.css('width', newHeaderWidth);
            // TODO делать отступы
            _that.dataWrapperWithScroll = true;
          }
        } else  {
          if ( _that.dataWrapperWithScroll )
          {
            dataViewWrapper.css('overflow-y', 'hidden');
            var table = _wrapperEljQ.find('.tt_data_view_wrapper');
            var tableWidth = table[0].offsetWidth;

            var header = _wrapperEljQ.find( '.tt_header_wrapper' );
            var footer = _wrapperEljQ.find( '.tt_footer_wrapper' );

            header.css('width', tableWidth);
            footer.css('width', tableWidth);

            _that.dataWrapperWithScroll = false;
          }
          
        }
      }, 100);

    }

    // Core of cute view
    /**
      * Calculate width of each column based on content 
      * and correlate 
      * @param Options Object forStretch
    */
    this.stretchTable = function( options ){
      // Loading blocker
      this.addLoadingLayer();
      // For async
      // Set for columns min widths
      _that.setMaxContentWidth( options );
      // Set table width as 100%
      _that.stretchTableSize();

      $(window).trigger( 'resize' );
      // Clear from loading animation
      _that.removeLoadingLayer();
    }

    // Add on table block 
    this.addLoadingLayer = function( semiTransparent=false ){
      let style = '';
      if (semiTransparent)
        style = 'opacity:0.3;';
      $(this.tableOptions.tableWrapperSelector).append(`<div style="${style}" class="tt_loading_wrapper"></div>`);
    }

    this.removeLoadingLayer = function(){
      $(".tt_loading_wrapper").remove(); 
    }

    this.setLoadingIcon = function(){
      
    }
    this.clearLoadingIcon = function(){
      
    }

    this.setShowedColumns = function(){
      
      var that = this;
      // TODO в зависимости от вкладки
      this.tableOptions.showedColumns = this.tableOptions.mainSetColumns();

    }

    this.init = function( selector ){
      _tableWrapperOffsetTop = $(this.tableOptions.tableWrapperSelector).offset().top;
      var that = this;
      // Set onmousemove, onmouseup on resize hooks
      this.makeResizeHooksAlive();
      // Set handlers for sorting
      this.makeSortingByHeaderAlive();
      // Set click on report show/hide
      if ( this.tableOptions.tableKind == 'report' ){
        this.makeShowHideReportButtonsAlive();
      }

      // Set actions on resize. correlateTableheight etc.
      this.setResizeActions();
      // Draw Table
      this.draw();
      // By some kind of cause scroll event cannot be setted through 
      // delegeate events.
      this.setScrollAction();

    }

    // Return array with values of ids property data
    this.getTableDataIds = function( arr ){
    
      var result = new Array();
      if ( typeof arr != "undefined"){
        if ( BINOM.tt.tableOptions.tableKind=='report' ){
          result = arr.map(function(item, i){ return i; });
        } else {
          result = arr.map(function(item){ return item.id });
        }
      } else {
        result = this.tableData.map(function(item){ return item.id });
      }
      return result;
    }

    this.getShowedTableDataIds = function( arr ){
      const propUnique = BINOM.tt.tableOptions.unique;
      var result = new Array();
      if ( typeof arr != "undefined"){
        var arrFiltered = arr.filter( (item)=>{ return item.hidedFromTt!==true; } );

        if ( BINOM.tt.tableOptions.tableKind=='report' ){
          result = arrFiltered.map(function(item, i){ return String(i); });
        } else {
          result = arrFiltered.map(function(item){ return item[propUnique] });
        }
      } else {
        var arrFiltered = this.tableData.filter( (item)=>{ return item.hidedFromTt!==true; } );
        result = arrFiltered.map(function(item){ return item[propUnique] });
      }
      return result;

    }

    this.getCheckedMeaningful = function(){
      if ( typeof this.markedRows.checked == 'undefined' ) return;
      var meaningChecked = this.markedRows.checked.filter(( item )=>{
        var rowData = BINOM.tt.tableData.findObjectByProp('id', item);
        return !(rowData.hidedFromTt===true);
      });
      return meaningChecked;
    }

    this.getSelectedMeaningful = function(){
      if ( typeof this.markedRows.selected == 'undefined' ) return;
      var meaningSelected = this.markedRows.selected.filter(( item )=>{
        var rowData = BINOM.tt.tableData.findObjectByProp('id', item);
        return !(rowData.hidedFromTt===true);
      });
      return meaningSelected;
    }

    this.fetchViaPrintDataAsJSON = function( {queryOptions} ){
        const GETS = URLUtils.getGETParamsAsObject();
        GETS.printdataasjson = 1;
        for (let p in queryOptions)
          GETS[p] = queryOptions[p];

        const fetchURL = URLUtils.getURLWithNewGETS( GETS );

        return fetch(fetchURL,{
          method: 'GET',
          credentials: 'include'
        })
          .then(r=>r.json())
          .then(d=>{
            let dataSet = false;

            // Check on reload page when not authed
            if (d && typeof d == "object"){
              const { status=false, message=false, error=false } = d;
              if ( (this.tableOptions.tableKind === 'report' && error!== false) || (status=="error" && message=="auth") ){
                window.location.reload();
                return;
              }
            }

            if ( !d ){
              dataSet = [];
            } else if ( typeof d.dataSet != 'undefined' ){ // Object with dataSet and other
              // dataSet maybe null too
              dataSet = d.dataSet || [];
              const { tableKind }  = this.tableOptions;
              if (d.pageOptions) {
                this.setPageOptions( d.pageOptions );  
              } else if ( tableKind == 'conversion' || tableKind == 'report' || tableKind == 'clicklog' ) {
                console.warn('"pageOptions" for table was not passed')
              }

              if (this.tableOptions.tableKind === 'report') {
                // Only in this case total and pageOptions may be passed
                if ( !d.total || d.dataSet==null || d.dataSet.length==0 ) {
                  d.total = [];
                  console.warn('"total" for Report table was not passed');
                }

                if (d.total) {
                  this.setTableTotal( d.total );
                }

                if (d.amountOfGroup) {
                  this.tableOptions.reportLevels = d.amountOfGroup;
                } else {
                  console.warn('"amountOfGroup" for Report table was not passed');
                }
                if (d.reportGroups) {
                  this.tableOptions.reportGroups = d.reportGroups;
                  VmStoreSyncing.reportGroupsSync();
                  this.tableOptions.checkbox = TT_checkCheckboxReportEnabled(this.tableOptions.reportGroups);
                } else {
                  console.warn('"reportGroups" for Report table was not passed');
                }
                if ( Array.isArray(d.tsTokens) ) {
                  window.vmStore.commit('SET_TRAFFIC_SOURCE_TOKENS', d.tsTokens)
                } else {
                  console.warn('Traffic Source tokens for Report table was not passed!');
                }

                // Add Token Marks if needed
                if (BINOM.ttReportStuff) {
                  BINOM.ttReportStuff.checkSetTokenMarks();
                } else {
                  console.warn('Try to check TokenMarks but ttReportStuff not found!');
                }

              }

            } else if ( Array.isArray(d) ){ // Just array passed
              dataSet = d;
            } else {
              throw new Error('Cannot parse data from server!');
            }

            this.setData( dataSet );
            return d;
          })
    }

    /**
     * @param options 
     *  loadingLayer
    */
    this.refetchData = function(options={}) {
      this.events.emit('startRefetchData')

      const { 
        loadingLayer=true, 
        saveScroll=true, 
        clearMarked=true,
        clientSorting=true,
        serverSorting=false,
        queryOptions={},
        willDrawCallback=() => {},
      } = options;


      if ( loadingLayer && !_wrapperEljQ.find('.tt_loading_wrapper').length ){
        const semiTransparentLoadingLayer = true;
        this.addLoadingLayer( semiTransparentLoadingLayer );
      }

      if ( clearMarked ){
        this.markedRows.checked.splice(0);
        this.markedRows.selected.splice(0);
        window.VmStoreSyncing.sync();
      }

      this.isFetchingData = true;

      if (this.tableOptions.tableKind == 'report' && window.vmStore._mutations.SET_REPORT_LOADING_STATE) {
        window.vmStore.commit(`SET_REPORT_LOADING_STATE`, true);
      }

      const { checkbox: checkboxBefore } = this.tableOptions;

      return this.fetchViaPrintDataAsJSON({ queryOptions })
        .then((d) => {
          this.isFetchingData = false;
          this.events.emit('dataFetched');
          const { checkbox: checkboxNow } = this.tableOptions;

          let redrawHeader = false; 
          if ( checkboxBefore !== checkboxNow ) {
            redrawHeader = true;
          }

          this.redrawRows({ 
            saveScroll,
            clearMarked,
            redrawHeader,
            redrawFooter: true,
          });

          this.stretchTable();

          if (loadingLayer) {
            this.removeLoadingLayer();
          }

          if (this.tableOptions.tabOpen) { // if tab Info opened just send fetch on load last hour
            this.loadLastHour();
          }

          if (this.tableOptions.tableKind === "report") {
            this.redrawFooter();
            if (this.tableOptions.checkbox && !checkboxBefore) {
              if (!this.handlersState.checkbox) TT_addCheckboxDefaultHandlers();
              if (!this.handlersState.checkboxAll) TT_addCheckboxAllHandler();
            }
          }

          if (this.tableOptions.tableKind == 'report' && window.vmStore._mutations.SET_REPORT_LOADING_STATE) {
            window.vmStore.commit(`SET_REPORT_LOADING_STATE`, false);
          }

          return d;
        })
        .catch((e) => {
          console.error(e);
          this.isFetchingData = false;
          if (loadingLayer){
            this.removeLoadingLayer();
          }
          if (this.tableOptions.tableKind == 'report' && window.vmStore._mutations.SET_REPORT_LOADING_STATE) {
            window.vmStore.commit(`SET_REPORT_LOADING_STATE`, false);
          }
        })

    }

    this.onColumnsSettingsChanged = function(){
        const parsedColumnsSettings = parseColumnsSettingsToTTSettings( BINOM.tt.tableOptions.columnsSettings );
        // columns in tt format
        BINOM.tt.columns = parsedColumnsSettings.columns;
        const oldMainSetColumns = BINOM.tt.tableOptions.mainSetColumns;
        const newMainSetColumns = parsedColumnsSettings.mainSetColumns;

        // list of showed columns
        BINOM.tt.tableOptions.mainSetColumns = parsedColumnsSettings.mainSetColumns;
        if (!BINOM.tt.tableOptions.tabOpen){
          BINOM.tt.tableOptions.showedColumns = parsedColumnsSettings.mainSetColumns;
        }
        BINOM.tt.tableOptions.availableColumns = parsedColumnsSettings.availableColumns;
        
        // Check is in new main set column some columns for which table have no data
        if ( BINOM.tt.tableData.length>0 ){
          for (let i=0;i<newMainSetColumns.length;i++){
            if (typeof BINOM.tt.tableData[0][newMainSetColumns[i]] == "undefined"){
              this.refetchData()
                .then(() => this.redraw())
                return;
            }
          }
        }

        this.redraw()

    }

    this.searchInputElement = null;

    this.addSearch = function( input ){
      var tout = 0;

      let inputElement;
      if ( typeof input == "string" ) inputElement = document.querySelector(input);
      else if (input instanceof Element) inputElement = input;
      else throw new Error( "Incorrect type of search input!" );

      this.searchInputElement = inputElement;

      if ( inputElement.value && inputElement.value.trim() ){
        this.applySearchOnTableData( inputElement.value );
      }

      // function used in helper search change handler
      function saveSearchInStorage( searchValue ){

        if ( BINOM._localStorageIsActive ){
          var page = getURLParameter('page').toLowerCase();
          var obj = localStorage.getItem('searching');

          if ( page == '' ){
            page = 'campaigns';
          }

          if ( page == 'campaigns' || page == 'landing_page' || page == 'offers' ){
            if ( obj ){
              obj = JSON.parse( obj );
              obj[page] = searchValue;
              localStorage.setItem( 'searching', JSON.stringify( obj ) );
            } else {
              obj = {};
              obj[page] = searchValue;
              localStorage.setItem( 'searching', JSON.stringify( obj ) );
            }
          }
        }

      }


      $(inputElement).on('input', ()=>{
        clearTimeout( tout );
        tout = setTimeout( ()=>{ 
          // this is tt
          saveSearchInStorage( inputElement.value );
          this.doSearch( inputElement.value );
          if ( typeof BINOM.tt.tableOptions.setButtonState === 'function' ) BINOM.tt.tableOptions.setButtonState();
        }, 300 );
      });

    }

}