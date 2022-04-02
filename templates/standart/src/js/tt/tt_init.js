$(document).ready(function(){
  BINOM.ttSettingsAvailable = (function(){
    var settingsAvailablePages = ['campaigns', 'landing_page', 'offers', 'rotations', 'affiliate_networks', 'traffic_sources', 'stats'];

    if ( settingsAvailablePages.indexOf( BINOM.__page ) == -1 ) return false;

    if ( BINOM.__page == 'stats' ){
      var GETS = URLUtils.getGETParamsAsObject();
      if ( GETS.leads == 1 ) return false;
    }

    return true;
  })();

  if ( ['campaigns', 'landing_page', 'offers', 'affiliate_networks', 'traffic_sources', 'rotations', 'users'].indexOf(BINOM.__pageType) != -1 ) {
    if ( $('[name=search_name]').length ){
      var tout = 0;
      // Set on search input handler
      $('[name=search_name]').on('input', function(){
        var that = this;
        clearTimeout( tout );
        tout = setTimeout( function(){ 
          //BINOM.tt.clearCheckedAndSelected();
          BINOM.tt.doSearch( $(that).val() );
          if ( typeof BINOM.tt.tableOptions.setButtonState === 'function' ) BINOM.tt.tableOptions.setButtonState();
        }, 300 );
      });
    }
  }

  $('body').on( 'click', '.header_table_th_content_wrapper', function(e){
    e = e || event;

    var column = $(this).parent().attr('data-column');
    if ( e.detail == 3 ){
      if ( e.target.tagName == 'SPAN' ) return;
      BINOM.tt.stretchTable( { unlimitColumns:[column] } );
    }

  });

  // For mobile remove 
  if ( typeof window.orientation != 'undefined' ){
    $('.table-wrapper').css('overflow-x', '');
  }

  window.VmStoreSyncing  = {
    checkedRowsSync: function(){
      if ( !window.vmStore || typeof BINOM.tt.markedRows=='undefined' || typeof BINOM.tt.markedRows.checked=='undefined' ) 
        return;
      window.vmStore.commit('TT/setCheckedRows', BINOM.tt.markedRows.checked);
      window.vmStore.commit('TT/setMeaningfulSelectedRows', BINOM.tt.getCheckedMeaningful());
    },
    selectedRowsSync: ()=>{
      if ( !window.vmStore || typeof BINOM.tt.markedRows=='undefined' || typeof BINOM.tt.markedRows.selected=='undefined' ) 
        return;
      window.vmStore.commit('TT/setSelectedRows', BINOM.tt.markedRows.selected);
      window.vmStore.commit('TT/setMeaningfulCheckedRows', BINOM.tt.getSelectedMeaningful());
    },
    meaningfulRowsSync: function(){
      if ( !window.vmStore || typeof BINOM.tt.markedRows=='undefined' || typeof BINOM.tt.markedRows.selected=='undefined' ) 
        return;
      window.vmStore.commit('TT/setMeaningfulSelectedRows', BINOM.tt.getCheckedMeaningful());
      window.vmStore.commit('TT/setMeaningfulCheckedRows', BINOM.tt.getSelectedMeaningful());
    },
    reportGroupsSync: () => {
      if ( !window.vmStore || typeof BINOM.tt.markedRows=='undefined' || typeof BINOM.tt.markedRows.selected=='undefined' ) 
        return;
      window.vmStore.commit('TT/SET_REPORT_GROUPS', BINOM.tt.tableOptions.reportGroups);
    },
    sync: ()=>{
      window.VmStoreSyncing.checkedRowsSync();
      window.VmStoreSyncing.selectedRowsSync();
      window.VmStoreSyncing.meaningfulRowsSync();
    }
  }

  if (window.BNM_DISABLE_SHORTCUTS !== "1") {
    BINOM.ttKeyboard = new TtKeyboard();
  }
});
