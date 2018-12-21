let lastBlockNumber = 0;
const mainChart = {};

function numberWithCommas(n) {
    var parts=n.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1].substring(0, 3) : "");
}


mainChart.init = function () {
    this.chartId = '#kagiChart';
    this.option  = {
        width: $('#container').width(),
        height: 300,
        margin: {top: 30, right: 50, bottom: 100, left: 100},
        chartTheme:  "light",
        caption:  "",
        subCaption:  "",
        reversalType:  "diff", // use "diff" for difference in value; use "pct" for percentage change
        reversalValue:  5,
        unit:  "$",
        isPrecedingUnit: true,
        rallyColor:  "#2ecc71",
        rallyThickness:  2,
        rallyThicknessOnHover:  5,
        declineColor:  "#e74c3c",
        declineThickness:  2,
        declineThicknessOnHover:  4,
        showBreakPoints: true,
        breakPointColor: "#3498db",
        breakPointRadius: "2",
        breakPointRadiusOnHover: 5,
        showBreakPointText: true,
        showBreakPointTooltips: true,
        showRangeTooltips: true,
        showLegend: true,
        showAnimation: true,
        animationDurationPerTrend: 100, // in seconds
        animationEase: "linear"
    };

    $('#chart_theme, #am_color, #pm_color, #am_border_size, #pm_border_size, #animation_speed').on('change', function() {
        const option = $(this).data('option') ;
        mainChart.option[option] = $(this).val();
        mainChart.draw();
    });

    this.draw();
};

mainChart.updateData = (callback) => {
    $.ajax({
        type: "GET",
        url: `/api/kagiChart/${mainChart.option.type}/${startDate}/${endDate}`,
        success: function(datas) {
            mainChart.datas = datas;
            callback();
        },
        error: function(err) {console.log(err)}
    });
}
mainChart.draw = function () {
    mainChart.updateData(function() {
        $(mainChart.chartId).html('');
        KagiChart(mainChart.datas, mainChart.option);
    });
};

function getCurrentState() {
  $.ajax({
    type: "GET",
    url: "https://api.blockcypher.com/v1/eth/main",
    success: function(data) {
      if(lastBlockNumber != data.height) {
        lastBlockNumber = data.height;
        $('#block_height').text(numberWithCommas(lastBlockNumber));
        $.ajax({
            type: "GET",
            url: `https://etherchain.org/api/basic_stats`,
            success: function(data) {
                console.log(data);
                $('#block_time').text(numberWithCommas(data.currentStats.block_time) + "s");
                $('#tps').text(numberWithCommas(data.currentStats.tps));
                $('#hash_rate').text(numberWithCommas(parseInt(data.currentStats.hashrate / 100000000000) / 10) + 'TH/s');
                $('#difficulty').text(numberWithCommas(parseInt(data.currentStats.difficulty / 100000000000) / 10) + 'T');
            },
            error: function(err) {console.log(err)}
          });
      }
      $('#unconfirmed_transactions').text(numberWithCommas(data.unconfirmed_count));
    },
    error: function(err) {console.log(err)}
  });
}

$(document).on('ready', () => {
    getCurrentState();
    mainChart.init();

    $('[data-event-changePriceType]').on('click', function() {
        mainChart.option.type = $(this).attr('data-event-changePriceType');
        mainChart.draw();
      });

    
    mainChart.draw();
      
    // setInterval(getCurrentState, 20000);
});

