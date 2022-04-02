//Установка значений массива настроек количества знаков после запятой
window.trends_show_profit = !Boolean(parseInt(<?php echo $arr_tpl['show_profit'] ?>));

var trendsPageUtils = {
    isDayDetailedOpened: function(){
        var GETS = URLUtils.getGETParamsAsObject();
        if ( GETS.day_detailed==1 ){
            $("#bnm-awesome-calendar").periodpicker('disable');
        } else {
            $("#bnm-awesome-calendar").periodpicker('enable');
        }
    },
    cachedDate: {
        date_trends: null,
        date_s_trends: null,
        date_e_trends: null
    }
}

//GLOBAL
var __pageFormat = "trends",
    __pageType   = "trends";

function getURLParameter(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] || ''
	);
}

function submitForm(){
  try {
    var $button = $("#refresh-btn");
    var params = Object.create(null);
    var filters = document.querySelectorAll("#act-form select").forEach(select=>{
      var selectName = select.name;
      var selectValue = select.value;
      params[selectName] = selectValue;
    })
    if ( params.date_trends && (params.date_trends==10 || params.date_trends==12) ){
      params.date_s_trends = document.querySelector("[name=date_s_trends]").value;
      params.date_e_trends = document.querySelector("[name=date_e_trends]").value;
    }

    URLUtils.changeGETsInURL( params )
      .then(()=>BINOM.tt.refetchData())

    if ( $button.hasClass("green-button") ){
      makeFilterBlockApplyButtonRefresh();
    } 

  } catch(e){
    window.location.reload();
  }

    
}

$(document).ready(function() {
	
    var rows = document.querySelectorAll("table.table_stat tr");

    var dataFromBack = JSON.parse( $('.json_container').html() );

    var tableCampaignOptions = {
        columns: {
            date_name: {
                key: 'date_name',
                name: 'Date'
            },
            // Because this settings taked from default and in TT_DEFAULT_SETTINGS 
            // this settings without dollarsign and redgreengrey because dollarsign taked from base
            // and redgreengrey need to be after dollarsign
            'profit' : {
              key: 'profit',
              name: 'Profit',
              footer: true,
              footerCalc: 'sum',
              formatters: ['decimalplaces', 'threenumeralcommas' , 'dollarsign', 'brackets','redgreengrey'],
              stat: false,
              align: 'right',
              bold: true
            },
            'roi' : {
              key: 'roi',
              name: 'ROI',
              footer: true,
              footerCalc: {
                basedOnFinal: true,
                neededColumns: ['cost', 'profit'],
                calcFunc: function( sumFooter ){
                  var profit = (+sumFooter['profit']).toFixed( 5 );
                  var cost = (+sumFooter['cost']).toFixed( 5 );
                  if ( cost==0 ){
                    return 0;
                  } else {
                    return profit/cost*100;
                  }
                }
              },
              formatters: ['decimalplaces', 'threenumeralcommas', 'percentagesign','redgreengrey'],
              stat: false,
              align: 'right',
              bold: true
            },
            'lp_clicks':{
              name: 'LP Clicks',
              footer: true,
              footerCalc: 'sum'
            },
            'lp_ctr':{
              "key":"lp_ctr",
              "name":"LP CTR",
              "tab":"stat",
              "footer":true,
              "footerCalc":{
                "basedOnFinal":true,
                "neededColumns":["clicks","lp_clicks"],
                calcFunc: function( sumFooter ){
                  if ( sumFooter['clicks'] > 0 ) {
                    return sumFooter['lp_clicks']/sumFooter['clicks']*100;
                  } else {
                    return 0;
                  }
                }
              },
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
              "footer":true,
              "footerCalc":{
                "basedOnFinal":true,
                "neededColumns":["leads","clicks"],
                calcFunc: function( sumFooter ){
                  var sumLeads = sumFooter['leads'];
                  if ( typeof sumLeads == 'undefined' || isNaN(sumLeads) ){
                    sumLeads = sumFooter['cnt_cnv'];
                  }
                  if ( sumFooter['clicks'] > 0 ){
                    return sumLeads/sumFooter['clicks']*100;
                  } else {
                    return 0;
                  }
                }
              },
              "measure":"%"
            },
            epc: {
              "key":"epc",
              "name":"EPC",
              "tab":"stat",
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],
              "footer":"sum",
              "footerCalc":{
                basedOnFinal: true,
                neededColumns: ['clicks', 'revenue'],
                calcFunc: function( sumFooter ){
                  var sumRev = sumFooter['revenue'];
                  if ( typeof sumRev == 'undefined' || isNaN( sumRev ) ){
                    sumRev = sumFooter['summ_cnv'];
                  }
                  if ( sumFooter['clicks'] > 0 ){
                    return sumRev/sumFooter['clicks'];
                  } else {
                    return 0;
                  }
                }
              },
              "measure":"$"
            },
            cpc: {
              "key":"cpc",
              "name":"CPC",
              "tab":"stat",
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],
              "footer":"sum",
              "footerCalc":{
                "basedOnFinal":true,
                "neededColumns":["clicks","cost"],
                calcFunc: function( sumFooter ){
                  
                  var sumSpend = sumFooter['cost'];
                  if ( typeof sumSpend == 'undefined' || isNaN(sumSpend) ){
                    sumSpend = sumFooter['Spend'];
                  }

                  if ( sumFooter['clicks'] > 0 ){
                    return sumSpend/sumFooter['clicks'];
                  } else {
                    return 0;
                  }
                }
              },
              "measure":"$"
            },
            revenue: {
              "key":"revenue",
              "name":"Revenue",
              "tab":"stat",
              "formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],
              "footer":"sum",
              "footerCalc":"sum",
              "measure":"$"
            },
            cost: {
              "key":"cost","formatters":["decimalplaces","threenumeralcommas","threenumeralcommas","dollarsign","brackets"],"tab":"stat","name":"Cost","footer":"sum","measure":"$"
            }
        },
        blockSorting: true,
        unique: 'date_name'
    }

    // console.log( dataFromBack.columnsSettings );
    // if ( dataFromBack.columnsSettings ) tableCampaignOptions.columnsSettings = dataFromBack.columnsSettings;

    if ( typeof dataFromBack.noProfit!='undefined' && dataFromBack.noProfit!=1 ){
        tableCampaignOptions.availableColumns = [
          'date_name', 
           'clicks',
           'lp_ctr',
           'leads',
           'cr',
           'epc',
           'cpc',
           'revenue',
           'cost',
           'profit',
           'roi'
        ];
    } else {
        tableCampaignOptions.availableColumns = [
            'date_name', 
            'clicks',
            'lp_ctr',
            'leads',
            'cr',
            'cpc',
            'cost',
        ];
    }

    tableCampaignOptions.mainSetColumns = tableCampaignOptions.availableColumns.slice(0);

    function doubleClickOnTrendRow( date ){

        var GETS = URLUtils.getGETParamsAsObject();
        var date_gradation = GETS.date_gradation || $.cookie("date_gradation") || $('[name=date_gradation]').val();
        
        if (date_gradation==61){
            const daysDiff = moment().diff(date, 'days');
            if ( daysDiff<=30 ){
                var GETS = URLUtils.getGETParamsAsObject();
                trendsPageUtils.cachedDate.date_trends = $('[name=date_trends]').val() || $.cookie("date_trends");
                trendsPageUtils.cachedDate.date_s_trends = $('[name=date_s_trends]').val() || $.cookie("date_s_trends");
                trendsPageUtils.cachedDate.date_e_trends = $('[name=date_e_trends]').val() || $.cookie("date_e_trends");

                URLUtils.changeGETsInURL({
                    date_trends:12, 
                    date_gradation:64, 
                    day_detailed: 1, 
                    date_s_trends:date, 
                    date_e_trends:date
                }, {forcedRedirect: false});

                $("[name=date_gradation]").val(64).prop("disabled", true);
                $("[name=date_trends]").val(12).prop("disabled", true);
                if ( $('#bnm-awesome-calendar').periodpicker('picker').options.timepicker )
                  $('#bnm-awesome-calendar').periodpicker('setOption', 'timepicker', false)
                $("#custom_date").css("display", "block");
                trendsPageUtils.isDayDetailedOpened();
                // $('#bnm-awesome-calendar').periodpicker('setOption', 'timepicker', false)
                $('#bnm-awesome-calendar').periodpicker('value', date);
                makeFilterBlockApplyButtonRefresh();

                BINOM.tt.refetchData();
                $(".close-day-detailed-button").css("display", "inline");
            } else {
                var win = makeBadAlertModal("OK", "Hourly based trends are only<br> available for the last 30 days!");
                win.show()
            }
        }
    }

    $(".close-day-detailed-button").on("click", function(){
        var GETS = URLUtils.getGETParamsAsObject();

        var cachedDate = trendsPageUtils.cachedDate;
        
        var date_s_trends = moment().format('YYYY-MM-DD');
        var date_e_trends = moment().format('YYYY-MM-DD');

        var date_gradation = 61;
        var date_trends = 5;
        if ( cachedDate ){

            if (cachedDate.date_trends){
                date_trends = cachedDate.date_trends;
                if (date_trends==12){
                    $('#custom_date').css('display', 'block')
                } else {
                    $('#custom_date').css('display', 'none')
                }
            }

            if (cachedDate.date_s_trends){
                date_s_trends = cachedDate.date_s_trends;
            }

            if (cachedDate.date_e_trends){
                date_e_trends = cachedDate.date_e_trends;
            }

        }

        GETS.date_trends = date_trends;
        GETS.date_s_trends = date_s_trends;
        GETS.date_e_trends = date_e_trends;
        GETS.date_gradation = date_gradation;
        $("[name=date_gradation]").val( date_gradation ).prop("disabled", false);
        $("[name=date_trends]").val( date_trends ).prop("disabled", false);
        
        delete GETS.day_detailed;

        URLUtils.changeURLWithNewGETS(GETS);
        $(".close-day-detailed-button").css("display", "none");

        // Will trigger BINOM.tt.refetchData()
        $('#bnm-awesome-calendar').periodpicker('value', [date_s_trends, date_e_trends])
        makeFilterBlockApplyButtonRefresh();
        BINOM.tt.refetchData();
        // Enable periodpicker
        trendsPageUtils.isDayDetailedOpened();
    })

    TT_makeTT( dataFromBack, tableCampaignOptions, function(){}, doubleClickOnTrendRow );

    trendsGraph.dateGradation = dataFromBack.dateGradation;

    if(getURLParameter("chart")=='true'){
        trendsGraph.open();
    }

    // FILTERS HANDLER TODAY|YESTERDAY CAN BE USED ONLY WITH HOURS
    $('[name=date_trends]').on('change', function(e){
        var dateTrends = $(this).val();
        var dateGradation = $('[name=date_gradation]').val();

        if (dateTrends==1 || dateTrends==2){ // Today or yesterday - dateGradation is hours
            dateGradation = 64;
        } else if ( dateGradation==64 ){ // dateGradation - Hours, but date_trends is not today and not yesterday
            dateGradation = 61
        } 
        $('[name=date_gradation]').val(dateGradation);

        setCustomDateBlock(dateTrends);
        if ( dateTrends==12 ){
            $("#refresh-btn").removeClass("blue-button").addClass("green-button");
            $("#refresh-btn").html("<img src=\'templates/standart/images/w-ok.png\' class=\'icon\' style=\'position: relative; top: 1px;\'>Apply");
        } else {

          URLUtils.changeGETsInURL({
              date_trends: dateTrends, 
              date_gradation: dateGradation
          });
          BINOM.tt.refetchData();

        }
       
        // e.stopImmediatePropagation();
    });

    $('[name=date_gradation]').on('change', function(e){
        var dateGradation = $(this).val();
        var dateTrends = $('[name=date_trends]').val();
        if (dateGradation==64){
            dateTrends = 1;
            $('#custom_date').css('display', 'none')
        } else if (dateTrends==1 || dateTrends==2) {
            dateTrends = 11;
        }

        $('[name=date_trends]').val(dateTrends)

        URLUtils.changeGETsInURL({
            date_gradation: dateGradation,
            date_trends: dateTrends
        });
        BINOM.tt.refetchData();

        // $("#act-form").submit();
        e.stopImmediatePropagation();
    });


    BINOM.tt.events.on('dataChange', (d)=>{
        // Sync graph with data
        if ( window.trendsGraph.graph_open===null ){ // Do not open yet
            window.trendsGraph.parseTableToGetData();
        } else if ( window.trendsGraph.graph_open===true || window.trendsGraph.graph_open===false ) {
            window.trendsGraph.syncChartWithTable();
        }
    });

    // Disable inputs if day_detailed in url
    trendsPageUtils.isDayDetailedOpened();

    // disabled selects when day_detailed open
    var GETS = URLUtils.getGETParamsAsObject();
    if ( GETS.day_detailed==1 ){
        $('[name=date_trends]').prop("disabled", true);
        $('[name=date_gradation]').prop("disabled", true);
    }

});
window.trendsGraph = null;

// Trends graph
// Get data for draw from BINOM.tt.tableData
trendsGraph = {
    //Dumb for c3-chart object
    chart : new Object, 

    //Data of table
    data: new Array,
    isTooltipInitialized: false,
    graph_open: null,
    dateGradation: 61,

    open: function(){
        if (this.graph_open === null){
            this.init();
            this.graph_open = true;
			$("#chart_show").detach();
			$("#act-form").append('<input type="hidden" name="chart" value="true" id="chart_show">');
        } else if (this.graph_open === true) {
            $(".graph-wrapper").css("display", "none");

			$("#chart_show").detach();
			$("#act-form").append('<input type="hidden" name="chart" value="false" id="chart_show">');
			
            //For table height auto sizing
            $(window).trigger("resize");
            this.graph_open = false;
        } else if (this.graph_open === false){
            $(".graph-wrapper").css("display", "block");
			
			$("#chart_show").detach();
			$("#act-form").append('<input type="hidden" name="chart" value="true" id="chart_show">');

            //For table height auto sizing
            $(window).trigger("resize");
            this.graph_open = true;
        }
    },

    init: function(){
        var graphic_block = `
            <div class="graph-container">
                <div class='graph-wrapper stat-container' style='margin-top:0px;margin-bottom: 10px'>\
                    <canvas id='bnm-trends-chart'></canvas>\
                </div>
            </div>    
        `;

        $(".top_block").after(graphic_block);
        $(".stat-container").toggleClass("constriction-transition");

        trendsGraph.parseTableToGetData();
        this.bindGraph();
        $(window).trigger("resize");
    },

    getChartData: function(){
        this.parseTableToGetData()

        return {
            labels: this.data['x'].reverse(),
            datasets: this.getDataColumnsConfig()
        }
    },

    syncChartWithTable: function(){
        var data = this.getChartData();
        this.chart.data = data;
        this.chart.update()
    },


    getDataColumnsConfig: function(){
      var clicksData = this.data['1'].reverse()
          costsData =  this.data['2'].reverse()
          
          profitBarColors = []
          profitBarBorderColors = []

          if ( window.trends_show_profit ){
            var profitData = this.data['4'].reverse()
            var revenueData = this.data['3'].reverse()
            var leadsData = this.data['5'].reverse()

            for ( var i = 0; i < profitData.length; i++ ){
              if ( profitData[i] < 0 ){
                profitBarBorderColors.push( 'rgba(255, 0, 0, 0.9)' )
                profitBarColors.push( 'rgba(255, 0, 0, 0.9)' )
              } else{
                profitBarBorderColors.push( 'rgba(102, 187, 106, 0.9)' )
                profitBarColors.push( 'rgba(102, 187, 106, 0.9)' )
              }
            } 
          }   
      
      var datasets = [
            {
              type: 'line',
              label: 'Clicks',
              data: clicksData,
              yAxisID: 'y-axis-2',
              backgroundColor: 'rgba(3, 155, 229, 0.9)',
              borderColor: 'rgba(3, 155, 229, 0.9)',
              fill: false
            },
            {
              type: 'line',
              label: 'Costs',
              data: costsData,
              yAxisID: "y-axis-1",
              backgroundColor: 'rgba(211, 47, 47, 0.9)',
              borderColor: 'rgba(211, 47, 47, 0.9)',
              fill: false
            },
      ]
      if ( window.trends_show_profit ){
        datasets.unshift( 
              {
                type: 'bar',
                label: 'Profit',
                data:  profitData,
                yAxisID: "y-axis-1",
                backgroundColor: profitBarColors,
                borderColor: profitBarBorderColors,
                fill: false
              },
              {
                type: 'line',
                label: 'Revenue',
                data: revenueData,
                yAxisID: "y-axis-1",
                backgroundColor: 'rgba(104, 159, 56, 0.9)',
                borderColor: 'rgba(104, 159, 56, 0.9)',
                fill: false
              },
              {
                type: 'line',
                label: 'Leads',
                data: leadsData,
                yAxisID: "y-axis-2",
                backgroundColor: 'rgba(123, 31, 162, 0.9)',
                borderColor: 'rgba(123, 31, 162, 0.9)',
                fill: false
              }
        )
      }
      return datasets
    },
    bindGraph: function(){
        var ctx = document.getElementById("bnm-trends-chart").getContext("2d");
        var chart_data = this.getChartData();

       this.chart = new Chart(ctx, {
         type: 'bar',
         data: chart_data,
         options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                    left: 8,
                    right: 8,
                    top: 20,
                    bottom: 20
                }
              },
              hover: {
                onHover: function(e, el) {
                  $("#bnm-trends-chart").css("cursor", "default");
                }
              },
              tooltips: {
                  enabled: false,
                  mode: 'index',
                  axis: 'y',
                  intersect: false,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  titleFontColor: '#000',
                  bodyFontColor: '#000',
                  borderColor: 'gray',
                  borderWidth: 1,
                  bodySpacing: 9,
                  titleSpacing: 6,
                  caretSize: 0,
                  cornerRadius: 0,
                  callbacks:{
                    label: function(tooltipItem, data){
                        if ( data.datasets[tooltipItem.datasetIndex].label == 'Profit' || data.datasets[tooltipItem.datasetIndex].label == 'Revenue' || data.datasets[tooltipItem.datasetIndex].label == 'Costs' ){                        
                            var labelVal = data.datasets[tooltipItem.datasetIndex].label + ' $' + tooltipItem.yLabel.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
                            if ( tooltipItem.yLabel < 0 ){
                                labelVal = labelVal.replace('-', '$');
                                labelVal = labelVal.replace('$', '-');
                            } 
                            return labelVal
                      } else {
                        var formattedValue =   data.datasets[tooltipItem.datasetIndex].label + ' ' + tooltipItem.yLabel.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')                        
                        return formattedValue.substr(0, formattedValue.length - 3)
                      }
                    }
                  },
                  custom: function(tooltip) {

                      var that = this;
                      // Tooltip Element
                      var tooltipEl = document.getElementById('chartjs-tooltip');
                      var chartDelimeterLine = document.getElementById('chartjs-tooltip-delimeter-line')
                      var xSclaePosition = this._chart.scales['x-axis-0'].bottom - this._chart.scales['x-axis-0'].height
                    
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.classList.add('bnm-chartjs-custom-tooltip');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.innerHTML = "<table></table>";
                        chartDelimeterLine = document.createElement('span');
                        chartDelimeterLine.id = 'chartjs-tooltip-delimeter-line';
                        this._chart.canvas.parentNode.appendChild(tooltipEl);
                        this._chart.canvas.parentNode.appendChild(chartDelimeterLine);
                    }
              
                    // Hide if no tooltip
                    if (tooltip.opacity === 0) {
                         tooltipEl.style.opacity = 0;
                        chartDelimeterLine.style.opacity = 0
                        return;
                    }
                            
                    function getBody(bodyItem) {
                        return bodyItem.lines;
                    }
              
                    // Set Text
                    if (tooltip.body) {
                        var titleLines = tooltip.title || [];
                        var bodyLines = tooltip.body.map(getBody);
              
                        var innerHtml = '<thead class="bnm-chartjs-custom-tooltip__header">';
                      
                        titleLines.forEach(function(title) {
                            innerHtml += '<tr><th>' + title + '</th><th></th></tr>';
                        });
                        innerHtml += '</thead><tbody>';
              
                        bodyLines.forEach(function(body, i) {                       
                            var lineTextArr = body[0].split(' ')
                            var lineTitle = lineTextArr.shift()
                            var lineValue = lineTextArr.join('')
                            var colors = tooltip.labelColors[i];
                            var style = 'background:' + colors.backgroundColor;
                            style += '; border-color:' + colors.borderColor;
                            style += '; border-width: 2px'; 
                            var span = '<span class="bnm-chartjs-custom-tooltip__key" style="' + style + '"></span>';
                            innerHtml += '<tr><td>' + span + lineTitle + '</td>' + '<td>' + lineValue + '</td></tr>';
                        });
                        innerHtml += '</tbody>';
              
                        var tableRoot = tooltipEl.querySelector('table');
                        tableRoot.innerHTML = innerHtml;
                    }
                    
                    if ( !this.isTooltipInitialized ){       
                        this.isTooltipInitialized = true
                        $( this._chart.canvas.parentNode ).on('mousemove', function(e){                     
                            if ( e.offsetY > xSclaePosition ){
                                tooltipEl.style.opacity = 0;
                                chartDelimeterLine.style.opacity = 0
                                return 
                            }
                            if ( e.offsetY + $(tooltipEl).height() < xSclaePosition ){
                                tooltipEl.style.top =   e.offsetY + 'px';
                            } else {
                                tooltipEl.style.top =   e.offsetY - 150 + 'px';
                        }                        
                        tooltipEl.style.opacity = 1;              
                        chartDelimeterLine.style.opacity = 0.5;
                      })
                    }
                    chartDelimeterLine.style.height = xSclaePosition - 6 + 'px';
                    chartDelimeterLine.style.left =  tooltip.caretX + 'px';
                   
                    var tooltipOffsetRight = $(this._chart.canvas.parentNode).width() - (tooltip.x + 10) -  $(tooltipEl).width(); 
                    if ( tooltipOffsetRight < $(tooltipEl).width()  ){
                        tooltipEl.style.left  =  tooltip.caretX - $(tooltipEl).width() - 10 + 'px';
                    } else{
                        tooltipEl.style.left  =  tooltip.caretX + 10 + 'px';
                    }
                  }
              },
              legend: {
                  position: 'bottom',
                  fontFamily: 'OpenSans, sans-serif',
                  onHover: function(e, el){
                      document.getElementById("bnm-trends-chart").style.cursor = 'pointer' 
                  }
              },
              scales: {
                  yAxes: [
                  {
                      type: "linear", 
                      display: true,
                      position: "left",
                      id: "y-axis-1",
                      scaleLabel: {
                          display: true,
                          labelString: '$$$'
                      },
                      ticks:{
                        beginAtZero: true,
                        callback: function(value){
                          if ( Math.abs( value ) >= 10000 ){
                            return value / 1000 + 'K'
                          } else {
                            return value.toFixed(1)
                          }
                        }
                      }
                  },
                  {
                      type: "linear",
                      display: true,
                      position: "right",
                      id: "y-axis-2" ,
                      scaleLabel: {
                          display: true,
                          labelString: 'Volume'
                      },
                      ticks:{
                        beginAtZero: true,
                        callback: function(value){
                          if ( Math.abs( value ) >= 10000 ){
                            return value / 1000 + 'K'
                          } else {
                            return value.toFixed(1)
                          }
                        }
                      }
                  }]
               }
         }
     });
    },
    randomValue: function(min, max){
        return Math.floor(Math.random() * (max - min)) + min;
    },
    parseTableToGetData: function(){
        var rows = $(".stat-container .body-container tr"),
        rows_objects=[],
        row_object;
        /*
            x - date
            1 - Clicks
            2 - Cost
            3 - Revenue
            4 - Profit
            5 - Leads

        */

        var week_reg=/\d{4}-(\d{2}-\d{2}) - \d{4}-(\d{2}-\d{2})/g,
            week_str, result, is_week; 

        is_week = false;
        if ( this.dateGradation == 63 ){
            is_week = true;
        }

        for (var i=0; i<BINOM.tt.tableData.length; i++){
            row_object = {};
            if (is_week){
                row_object['x'] = BINOM.tt.tableData[i].date_name.replace(week_reg, "$1 - $2");
            } else {
                row_object['x'] = BINOM.tt.tableData[i].date_name;
            }
            row_object['1'] = BINOM.tt.tableData[i].clicks;
            
            row_object['2'] = BINOM.tt.tableData[i].cost;
            if (window.trends_show_profit){
                row_object['3'] = BINOM.tt.tableData[i].revenue;
                row_object['4'] = BINOM.tt.tableData[i].profit;
                row_object['5'] = BINOM.tt.tableData[i].leads;
            }
            rows_objects.push(row_object);
        }
       
        //Sorting by date
       /* rows_objects.sort(function(a,b){
            x1 = new Date(a["x"]);
            x2 = new Date (b["x"]);
            return x1 - x2;
        });*/

        this.data['x'] = [];
        this.data['1'] = [];
        this.data['2'] = [];

        if (window.trends_show_profit){
            this.data['3'] = [];
            this.data['4'] = [];
            this.data['5'] = [];
        }

        for (var i=0; i<rows_objects.length; i++){
            this.data['x'].push(rows_objects[i]["x"]);
            this.data['1'].push(rows_objects[i]["1"]);
            this.data['2'].push(rows_objects[i]["2"]);

            if (window.trends_show_profit){
                this.data['3'].push(rows_objects[i]["3"]);
                this.data['4'].push(rows_objects[i]["4"]);
                this.data['5'].push(rows_objects[i]["5"]);
            }
            
        }
    },
}