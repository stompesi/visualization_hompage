const pieChart = {};

const pie = new d3pie("pie_chart", {
	"size": {
		"canvasHeight": 295,
		"canvasWidth": 500,
		"pieOuterRadius": "100%"
	},
	"data": {}
});

pieChart.update = function(start, end) {
	console.log(start, end)
	const data = [
			{
				"label": "When's it going to be done?",
				"value": 20,
				"color": "#7e3838"
			},
			{
				"label": "Bennnnn!",
				"value": 20,
				"color": "#7e6538"
			},
			{
				"label": "Oh, god.",
				"value": 20,
				"color": "#7c7e38"
			},
			{
				"label": "But it's Friday night!",
				"value": 20,
				"color": "#587e38"
			},
			{
				"label": "Again?",
				"value": 100,
				"color": "#387e45"
			}
		];
		
	$.ajax({
    type: "GET",
    url: `/api/pieChart/${start}/${end}`,
    success: function(datas) {
      
      callback();
    },
    error: function(err) {console.log(err)}
	});
	
	

	pie.updateProp("data.content", data);
}




