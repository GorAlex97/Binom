"use strict";
var TtStuff = function(){

  var currentState = { loading: false }

  this.startLoading = function( semiTransparent ){
    BINOM.tt.addLoadingLayer(semiTransparent);
    currentState.loading = true;
  }
  this.endLoading = function(){
    BINOM.tt.removeLoadingLayer();
    currentState.loading = false;
    BINOM.tt.checkAndSetScrollbar();
  }

  // TODO options для например (сохранять не сохранять выделенные строки при перезагрузке страницы)
  this.fetchAndDrawTableData = function(url, options={}, callback){
    // get options
    const clearChecked = (typeof options.clearChecked!='undefined'?options.clearChecked:true);
    const transparentCoverLayer = (typeof options.transparentCoverLayer!='undefined'?options.transparentCoverLayer:true);

    this.startLoading(true);
    let fetchURL;
    if (typeof url=='undefined'){
        // by default it is sufficient just to add printdatatojson to url
        const GETS = URLUtils.getGETParamsAsObject();
        GETS.printdataasjson = 1;
        fetchURL = URLUtils.getURLWithNewGETS(GETS);
    } else {
        fetchURL = url;
    }
    const ttDataElement = BINOM.tt.tableOptions.tableWrapperElement.querySelector('.tt_data_view_wrapper');
    // todo get scroll position
    const scrollPosition = ttDataElement.scrollTop;

    fetch(fetchURL, {
      method: 'GET',
      credentials: 'include'
    })
        .then(r=>r.json())
        .then(d=>{
          // based on options clear or not clear
          if (clearChecked){
            // TODO clear checked
            BINOM.tt.markedRows.checked.splice(0);
            // sync with vue storage
            VmStoreSyncing.checkedRowsSync();
          }
          this.setAsyncFetchedDataToTT(d);
          this.endLoading();
          // todo change scroll position
          ttDataElement.scrollTop = scrollPosition;
        })
        .catch(e=>console.error(e))
  }

  this.fetchTableData = function( url, callback ){

    $.ajax({
      type: 'get',
      url: url,
      success: function(data){
        if ( typeof callback == 'function' ){
          callback( data );
        }
      }
    });
  }
  this.setAsyncFetchedDataToTT = function( data ){
    if ( typeof data == 'undefined' ){ // Есть в TT
    }
    if ( typeof data == 'string' ){// Лишнее
      try{
        data = JSON.parse( data );
      } catch (e) {
      }
    }
    // In case it was string was parsed above
    if ( typeof data == 'object' ){

      if ( data.dataSet == null ){ // Есть в tt
        // Нет в tt по ходу нужно сначала не добавлять - и если ошибка You tring to load multiple reports не появляется
        // прикрутить как-то в TT
        if ( data.error ){ 
          new TtErrors( data.error );
          return;
        }

        data.dataSet = new Array(); // есть в tt
      }
      if ( data.dataSet ){
        BINOM.tt.setData( data.dataSet );
      }
      
      if ( !data.total || data.dataSet==null || data.dataSet.length==0 ) data.total = []; // Есть в TT
        
      if ( data.total ){ // Есть в tt
        BINOM.tt.setTableTotal( data.total );
      }
      if ( data.pageOptions ) { // Есть в tt
        BINOM.tt.setPageOptions( data.pageOptions );  
      }
      
      BINOM.tt.redrawRows(); 

      BINOM.tt.redrawFooter(); // нету нужно добавить

    }
  }
}

const drawTTSettingsIcon = () => {
    var html = `
      <div class="tt_settings_button"></div>
    `;
    $(BINOM.tt.tableOptions.tableWrapperSelector).append(html);
    // Cross Icon - open settings window
    $('body').on('click', '.tt_settings_button', ()=>{
      window.vmStore.commit('TT/OPEN_TT_SETTINGS_MODAL');
    });
}

// It uses function getKeyCode from binomscript
var TtKeyboard = function(){

  this.upDownBlocked = false;

  var ARROW_UP = 38;
  var ARROW_DOWN = 40;
  var ENTER = 13;
  var ARROW_LEFT = 37;
  var ARROW_RIGHT = 39;

  this.ttKeyboardAvailable = function(){
    if ( this.upDownBlocked ){
      return false; 
    }
    var modalWindows = $('.window');
    for ( var i=0;i<modalWindows.length;i++ ){
      // Way to check visibility
      if ( modalWindows[i].offsetHeight != 0 ){
        return false;
      }
    }
    return true;
  }

  //TODO проверить есть ли вверху/внизу не открывшийся кластер
  function getLastRow(){
    var scrollHeight = $(".tt_data_view_wrapper")[0].scrollHeight;

    $(".tt_data_view_wrapper").scrollTop( scrollHeight );

    var lastRow = $(BINOM.tt.tableOptions.tableWrapperElement).find('.tt_data_table tr:last-child');
    return $(BINOM.tt.tableOptions.tableWrapperElement).find('.tt_data_table tr:last-child');
  }

  function getFirstRow(){
    return $(BINOM.tt.tableOptions.tableWrapperElement).find('.tt_data_table tr:first-child');
  }

  this.isFocusedInput = function(e){
    var focusedInput = $('body input:focus');
    if ( focusedInput.length >0 ) return true;
    else return false;
  }

  // TODO если 
  // Все это не будет работать с кластерайзом
  this.arrowUpHandler = function( e ){
    
    if ( this.isFocusedInput() ) return;

    e.preventDefault();
    if ( this.upDownBlocked ){
      return;
    }

    var e = e || event;
    
    var markedRow = $(BINOM.tt.tableOptions.tableWrapperElement).find('.selected_row');

    var prevRow = markedRow.prev();
    if ( prevRow.length != 0 ){
      var rowOffsetTop = prevRow[0].offsetTop;
      var tableHeight = $(".tt_data_view_wrapper").height();
      var tableScroll = $(".tt_data_view_wrapper").scrollTop();

      var rowTableScrollDifference = tableScroll - rowOffsetTop;

      if ( rowTableScrollDifference > 0 ){
        $(".tt_data_view_wrapper").scrollTop( tableScroll - rowTableScrollDifference - 1 );
      }
      // Global function from tt
      markRow( prevRow );
    } else {
      if ( BINOM.tt.isClusterized() ){
        var scrollHeight = $(".tt_data_view_wrapper")[0].scrollHeight;
        $(".tt_data_view_wrapper").scrollTop( scrollHeight );
        var that = this;
        this.upDownBlocked = true;
        // Hope clusterize will render bottom cluster
        setTimeout(function(){
          markRow( $(BINOM.tt.tableOptions.tableWrapperElement).find('.tt_data_table tr:last-child') );
          that.upDownBlocked = false;
        }, 150);
      } else {
        var lastRow = getLastRow();
        $(".tt_data_view_wrapper").scrollTop(scrollHeight);
        markRow( lastRow );
      }
    }
    if ( typeof BINOM.tt.tableOptions.setButtonState == 'function' ) BINOM.tt.tableOptions.setButtonState();
  }

  this.arrowDownHandler = function( e ){
    
    if ( this.isFocusedInput() ) return;

    e.preventDefault();
    if ( this.upDownBlocked ){
      return;
    }

    var e = e || event;
    
    var markedRow = $(BINOM.tt.tableOptions.tableWrapperElement).find(".selected_row");

    var nextRow = markedRow.next();
    if ( nextRow.length != 0 ){

      var rowOffsetTop = nextRow[0].offsetTop;
      var tableHeight = $(".tt_data_view_wrapper").height();
      var tableScroll = $(".tt_data_view_wrapper").scrollTop();

      var rowTableScrollDifference = rowOffsetTop - (tableHeight + tableScroll - 25);

      if ( rowTableScrollDifference > 0 ) {
        $(".tt_data_view_wrapper").scrollTop( tableScroll + rowTableScrollDifference );
      }

      markRow( nextRow );
    } else {
      if ( BINOM.tt.isClusterized() ){
        $(".tt_data_view_wrapper").scrollTop( 0 );
        var that = this;
        this.upDownBlocked = true;
        setTimeout(function(){
          markRow( $(BINOM.tt.tableOptions.tableWrapperElement).find('.tt_data_table tr:first-child') );
          that.upDownBlocked = false;
        }, 150);
      } else {
        var firstRow = getFirstRow();
        $(".tt_data_view_wrapper").scrollTop(0);
        markRow( firstRow );
      }
    }
    if ( typeof BINOM.tt.tableOptions.setButtonState == 'function' ) BINOM.tt.tableOptions.setButtonState();
  }

  this.arrowLeftHandler = function(){

    if ( this.isFocusedInput() ) return;

    if ( BINOM.tt.tableOptions.tabOpen ){
      BINOM.tt.closeTab();
    } else {
      BINOM.tt.openTab();
    }
  }
  this.arrowRightHandler = function(){

    if ( this.isFocusedInput() ) return;
    
    if ( BINOM.tt.tableOptions.tabOpen ){
      BINOM.tt.closeTab();
    } else {
      BINOM.tt.openTab();
    }
  }

  this.enterHandler = function(){
    var row = $('.selected_row');
    if ( row.length > 0 ){
      row.trigger('dblclick');
    }
  }

  this.setHandler = function(){
    var that = this;
    $(document).on('keydown', function( e ){

      if ( BINOM.keyPressed.shift ){
        $(".tt_data_table").addClass( 'block_allocation' );
      } else {
        $(".tt_data_table").removeClass( 'block_allocation' );
      }

      var e = e || event;
      var keyCode = getKeyCode( e );
      var available = that.ttKeyboardAvailable();
      if ( !available ) {
        return;
      }

      switch(keyCode){
        case(ARROW_UP):
          that.arrowUpHandler( e );
        break;
        case(ARROW_DOWN):
          that.arrowDownHandler( e );
        break;
        case(ARROW_LEFT):
          that.arrowLeftHandler();
        break;
        case(ARROW_RIGHT):
          that.arrowRightHandler();
        break;
        case(ENTER):
          that.enterHandler();
        break;
      }
    });
    $(window).blur(function(){
      $(".tt_data_table").removeClass( 'block_allocation' );
    });
  }

  this.init = function(){
    this.setHandler();
  }
}

var TtPagination = function( options ){
  options = options || {};
  var _clicklogPagination = options.clicklog || false;

  var containerPaginationClass = "tt_report_pagination";
  var containerPaginationSelector = "."+containerPaginationClass;

  // PAGINTAION
  // MAKE HTML
  const makeSelectPageNumber = () => {

    var optionsHTML = '';
    var optionsHTML = '';
    
    var pageOptions = BINOM.tt.pageOptions;
    var amountOfPages, numPage;

    if ( typeof pageOptions != 'undefined' ){
      amountOfPages = pageOptions.amountOfPages;
      numPage = pageOptions.numPage;
    }  else {
      amountOfPages = 1;
      numPage = 1;
    }

    for (var i=1;i<=amountOfPages;i++){
      optionsHTML += '<option value='+i+' '+(i==numPage?'selected':'')+' >'+i+'</option>';
    }

    var html = '\
        <select style="width:60px;" class="num_page_select">\
          '+optionsHTML+'\
        </select>';
    return html;
  }
  const makeSelectAmountOnPage = () => {
    var amountOnPage;
    
    if ( BINOM.tt.pageOptions ) {
      amountOnPage = BINOM.tt.pageOptions.amountOnPage;
    } else {
      amountOnPage = 1;
    }

    var html = `
        <select style="width:60px;" class="amount_on_page_select">
          <option value="50"   ${(amountOnPage==50?'selected':'')}>50</option>
          <option value="100"  ${(amountOnPage==100?'selected':'')}>100</option>
          <option value="200"  ${(amountOnPage==200?'selected':'')}>200</option>
          <option value="500"  ${(amountOnPage==500?'selected':'')}>500</option>
          <option value="1000" ${(amountOnPage==1000?'selected':'')}>1000</option>
          ${(!_clicklogPagination?`<option value="All"  ${(amountOnPage=="All"?'selected':'')}>All</option>`:"")}
        </select>`;

    return html;
  }
  this.makePaginationBlock = function(){

    var selectPageNumberHTML = makeSelectPageNumber();
    var selectAmountOnPageHTML = makeSelectAmountOnPage();

    var pageOptions = BINOM.tt.pageOptions;

    var numPage, amountOfPages;
    if ( typeof pageOptions != 'undefined' ){
      numPage = pageOptions.numPage;
      amountOfPages = pageOptions.amountOfPages;
    } else {
      numPage = 1;
      amountOfPages = 1;
    }

    var html = '\
      <div class="tt_report_pagination">\
        <span class="prev-page-button bnm-button '+(numPage<=1?'bnm-button--disabled':'bnm-button-gray')+'">Prev</span>\
        <span class="next-page-button bnm-button '+(numPage==amountOfPages?'bnm-button--disabled':'bnm-button-gray')+'">Next</span>\
        '+selectPageNumberHTML+'\
        <span class="amount-of-pages">/ '+amountOfPages+'</span>\
        '+selectAmountOnPageHTML+'\
      </div>\
    ';
    return html;
  }
  this.drawPaginationBlock = function(){
    if ( !BINOM.tt.tableOptions.tableWrapperSelector ){
      throw new Error( 'Try to do report stuff but TT is not drawed yet;' );
    } 

    var tableBlockSelector = BINOM.tt.tableOptions.tableWrapperSelector;
    var paginationHTML = this.makePaginationBlock();

    if ( $(containerPaginationSelector).length == 0 ){
      $(tableBlockSelector).append( paginationHTML );
    } else {
      $(containerPaginationSelector).replaceWith( paginationHTML );
    }

  }

  this.numPageChange = function( select ) {
    if (BINOM.tt.isFetchingData) return;

    var that = this;
    const num_page = $(select).val();

    const newGets = { num_page };
    URLUtils.changeGETsInURL(newGets);

    const queryOptions = {};
    if (BINOM.tt.tableOptions.tableKind === 'report') {
      queryOptions.type_load = 3;
    }

    BINOM.tt.refetchData({
      saveScroll: false, 
      queryOptions,
    });
  }

  this.amountOnPageChange = function( select ) {
    if (BINOM.tt.isFetchingData) return;

    var that = this;
    const val_page = $(select).val();
    const num_page = 1;

    const newGets = {
      val_page,
      num_page,
    };
    
    BINOM.tt.pageOptions.amountOnPage = val_page;
    BINOM.tt.pageOptions.numPage = 1;

    URLUtils.changeGETsInURL(newGets);

    const queryOptions = {};
    if (BINOM.tt.tableOptions.tableKind === 'report') {
      queryOptions.type_load = 3;
    }

    BINOM.tt.refetchData({
      saveScroll: false,
      queryOptions,
    });

  }

  this.nextButtonClick = function(button) {
    if (BINOM.tt.isFetchingData) return;
    var button = $(button);
    if (button.hasClass("button_inactive")) return;
    var that = this;
    var currentPage = BINOM.tt.pageOptions.numPage;
    var amountOfPages = BINOM.tt.pageOptions.amountOfPages;
    if (currentPage == amountOfPages) return;

    const newGets = {num_page: +currentPage+1};
    URLUtils.changeGETsInURL(newGets);

    const queryOptions = {};
    if (BINOM.tt.tableOptions.tableKind === 'report') {
      queryOptions.type_load = 3;
    }

    BINOM.tt.refetchData({
      saveScroll: false, 
      queryOptions,
    });

  }

  this.prevButtonClick = function(button) {
    if (BINOM.tt.isFetchingData) return;
    var button = $(button);
    if ( button.hasClass("button_inactive") ) return;
    var that = this;
    var currentPage = BINOM.tt.pageOptions.numPage;
    var amountOfPages = BINOM.tt.pageOptions.amountOfPages;
    if ( currentPage == 1 ) return;

    const newGets = {num_page: +currentPage-1};
    URLUtils.changeGETsInURL(newGets);

    const queryOptions = {};
    if (BINOM.tt.tableOptions.tableKind === 'report') {
      queryOptions.type_load = 3;
    }

    BINOM.tt.refetchData({
      saveScroll: false, 
      queryOptions,
    });

  }

  // END MAKE HTML

  this.setHandlers = function(){
    var that = this;

    $("body").on("click", containerPaginationSelector+" .prev-page-button", function(){ that.prevButtonClick( this ); }); 
    $("body").on("click", containerPaginationSelector+" .next-page-button", function(){ that.nextButtonClick( this ); }); 

    $("body").on("change", containerPaginationSelector+" .num_page_select", function(){ that.numPageChange(this); } );
    $("body").on("change", containerPaginationSelector+" .amount_on_page_select", function(){ that.amountOnPageChange(this); } );
  }

  this.init = function(){
    // TODO Pagination BLOCK
    this.drawPaginationBlock();
    this.setHandlers();
  }
}

var TtErrors = function( text, tableWrapperSelector ){
  if (text instanceof Error) {
    text = `<pre>${text.message}  ${text.stack}</pre>`;
  }

  tableWrapperSelector = tableWrapperSelector || BINOM.tt.tableOptions.tableWrapperSelector;
  if ( typeof tableWrapperSelector == 'undefined' ) console.error( '#TTERRORS block to draw undefined' );

  function makeHTML( text ){
    var systemMessageOptions = {
      type: 'error',
      header: 'Error!',
      subheader: `
        <span>An error occurred while build the table.</span><br>
        <span>Please, contact our support.</span>
      `,
      text: text
    };

    var html = `<div class="tt_error_wrapper">`+BINOM.UTILS.makeInnerMessage( systemMessageOptions )+`</div>`;

    return html;
  }

  function draw( text, tableWrapperSelector ){
    var html = makeHTML( text );
    $(tableWrapperSelector).html( html );
  }

  function drawError(){
    draw( text, tableWrapperSelector );
  }

  drawError();
}