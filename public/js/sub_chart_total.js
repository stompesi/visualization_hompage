const pieChart = {};

const pie = new d3pie("pie_chart", {
	"size": {
		"canvasHeight": 295,
		"canvasWidth": 500,
		"pieOuterRadius": "100%"
	},
	"data": {
		"content": [
			{
				"label": "When's it going to be done?",
				"value": 20,
				"color": "#7e3838"
			}
		]
	}
});

pieChart.update = function() {
	$.ajax({
    type: "GET",
    url: `/api/pieChart/${startDate}/${endDate}`,
    success: function(data) {
      pie.updateProp("data.content", data);
    },
    error: function(err) {console.log(err)}
	});	
}

pieChart.update();
