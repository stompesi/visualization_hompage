const totalChart2 = {
  lineChart: {},
  barChart: {}
};

const colorClass2 = ['general', 'high', 'middle', 'low']                  

totalChart2.option = {
  margin: {top: 20, right: 30, bottom: 20, left: 30},
  transitionTime: 1000
};

totalChart2.lineChart.option = {
  type: 'txCount',
  color: d3.scaleOrdinal()
};

totalChart2.barChart.option = {
  type: 'txCount',
  color: d3.scaleOrdinal()
};


function translate2(x, y) {
  return `translate(${x}, ${y})`;
};

totalChart2.lineChart.option.color.domain(colorClass2).range(['#87cefa', '#ffe2e4', '#8b2e2e', '#207c7e']);
totalChart2.barChart.option.color.domain(colorClass2).range(['#87cefa', '#ffe2e4', '#8b2e2e', '#207c7e']);

// ---------- totalChart2 ---------- 
totalChart2.init = function(chartId) {
  const margin = totalChart2.option.margin;

  // Set svg
  const svg = d3.select(`#${chartId}`);

  totalChart2.svg = svg.append('g').attr('transform', translate2(margin.left, margin.top));
  totalChart2.lineChart.svg = totalChart2.svg;
  totalChart2.barChart.svg = totalChart2.svg;

  svg.attr('width', $(`#${chartId}`).width());

  totalChart2.width = svg.attr('width') - margin.left - margin.right;
  totalChart2.height = svg.attr('height') - margin.top - margin.bottom;

  totalChart2.lineChart.xScale = d3.scaleLinear().range([0, totalChart2.width]);
  totalChart2.lineChart.yScale = d3.scaleLinear().range([totalChart2.height, 0]);

  totalChart2.lineChart.line = d3.line();
  totalChart2.lineChart.line.x(path => totalChart2.lineChart.xScale(path.x));
  totalChart2.lineChart.line.y(path => totalChart2.lineChart.yScale(path.y));

  totalChart2.barChart.xScale = d3.scaleBand().range([0, totalChart2.width]).padding(0.05);
  totalChart2.barChart.yScale = d3.scaleLinear().range([totalChart2.height, 0]);

  totalChart2.svg.append('g')
    .attr("class", "x axis")
    .attr('transform', translate2(0, totalChart2.height))
    .call(d3.axisBottom(totalChart2.lineChart.xScale));

  totalChart2.svg.append('g')
    .attr("class", "y-left axis")
    .call(d3.axisLeft(totalChart2.lineChart.yScale));

  totalChart2.svg.append('g')
    .attr("class", "y-right axis")
    .attr("transform", translate2(totalChart2.width, 0))
    .call(d3.axisRight(totalChart2.barChart.yScale));
};

totalChart2.lineChart.update = () => {
  const lineChart = totalChart2.lineChart;
  const transition = d3.transition().duration(totalChart2.option.transitionTime);

  // Update data
  lineChart.updateData(function() {
    // Update axis\
    lineChart.xScale.domain(d3.extent(lineChart.datas.xAxis));
    lineChart.yScale.domain([lineChart.datas.yAxis.min, lineChart.datas.yAxis.max]);
    lineChart.svg.select(".x").transition(transition).call(d3.axisBottom(lineChart.xScale));
    lineChart.svg.select(".y-left").transition(transition).call(d3.axisLeft(lineChart.yScale));
    
    // Update line
    const lines = lineChart.svg.selectAll('.line').data(lineChart.datas.pathInfos, (pathInfo) => pathInfo.class)
    lineChart.insertLine(lines, transition);
    lineChart.updateLine(lines, transition);
    lineChart.removeLine(lines);
  });

};

totalChart2.lineChart.updateData = (callback) => {
  const lineChart = totalChart2.lineChart;
  $.ajax({
    type: "GET",
    url: `/api/lineChart/${lineChart.option.type}`,
    success: function(datas) {
      lineChart.datas = datas;
      callback();
    },
    error: function(err) {console.log(err)}
  });
};

totalChart2.lineChart.insertLine = (lines, transition) => {
  const lineChart = totalChart2.lineChart;
  lines.enter()
  .append('path')
    .attr('class', 'line')
    .attr('data-line', pathInfo => pathInfo.class)
    .attr('d', pathInfo => lineChart.line(pathInfo.values))
    .style("stroke", pathInfo => lineChart.option.color(colorClass2.indexOf(pathInfo.class)))
    .style('opacity', 0.0)
      // .on('mouseover', function () { mouseoverHandler(d3.select(this).attr('data-line')) })
      // .on("mouseout", function () { mouseoutHandler(d3.select(this).attr('data-line')) })
  .transition(transition).delay(totalChart2.option.transitionTime)
    .style('opacity', 1.0);
};

totalChart2.lineChart.updateLine = (lines, transition) => {
  const lineChart = totalChart2.lineChart;
  lines.transition(transition)
    .attr("d", pathInfo => totalChart2.lineChart.line(pathInfo.values))
    .style("stroke", pathInfo => lineChart.option.color(colorClass2.indexOf(pathInfo.class)))
};

totalChart2.lineChart.removeLine = (lines) => {
  lines.exit().remove();
};



totalChart2.barChart.update = () => {
  const barChart = totalChart2.barChart;
  const transition = d3.transition().duration(totalChart2.option.transitionTime);

  // Update data
  barChart.updateData(function() {
    // Update axis
    barChart.xScale.domain(barChart.datas.xAxis);
    barChart.yScale.domain([0, barChart.datas.yAxis.max]);
  
    barChart.svg.select(".x").transition(transition).call(d3.axisBottom(barChart.xScale));
    barChart.svg.select(".y-right").transition(transition).call(d3.axisRight(barChart.yScale));
  
    // Update bar
    const bars = totalChart2.svg.selectAll('rect').data(barChart.datas.values, (rectInfo) => rectInfo.class);
    barChart.insertBar(bars, transition);
    barChart.updateBar(bars, transition);
    barChart.removeBar(bars);
  });
};

totalChart2.barChart.updateData = (callback) => {
  const barChart = totalChart2.barChart;

  $.ajax({
    type: "GET",
    url: `/api/barChart/${barChart.option.type}`,
    success: function(datas) {
      barChart.datas = datas;
      callback();
    },
    error: function(err) {console.log(err)}
  });
};


totalChart2.barChart.insertBar = (bars, transition) => {
  const barChart = totalChart2.barChart;
  bars.enter()
  .append('rect')
    .attr('class', 'bar')
    .attr('data-bar', rect => rect.x)
    .attr("x", rect => barChart.xScale(rect.x))
    .attr("y", rect => barChart.yScale(rect.y))
    .attr("width", barChart.xScale.bandwidth())
    .attr("height", rect => totalChart2.height - barChart.yScale(rect.y))
    .style('fill', rect => barChart.option.color(colorClass2.indexOf(barChart.datas.class)))
    .style('opacity', 0)
      // .on('mouseover', function () { mouseoverHandler(d3.select(this).attr('data-bar')) })
      // .on("mouseout", function () { mouseoutHandler(d3.select(this).attr('data-bar')) })
    .transition(transition).delay(totalChart2.option.transitionTime)
      .style('opacity', 0.5)
};

totalChart2.barChart.updateBar = (bars, transition) => {
  const barChart = totalChart2.barChart;

  bars.transition(transition)
    .attr("x", rect => barChart.xScale(rect.x))
    .attr("y", rect => barChart.yScale(rect.y))
    .attr("width", barChart.xScale.bandwidth())
    .attr("height", rect => totalChart2.height - barChart.yScale(rect.y))
    .style('fill', rect => barChart.option.color(colorClass2.indexOf(barChart.datas.class)))
};

totalChart2.barChart.removeBar = (bars) => {
  bars.exit().remove();
};
$(document).on('ready', function() {
  totalChart2.init('sub_chart_2');
  setTimeout(function() {
    totalChart2.lineChart.update();
    totalChart2.barChart.update();
  }, 2000);
});
