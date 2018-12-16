const totalChart = {
  lineChart: {},
  barChart: {}
};

const colorClass = ['general', 'high', 'middle', 'low']                  

totalChart.option = {
  margin: {top: 20, right: 30, bottom: 20, left: 30},
  transitionTime: 1000
};

totalChart.lineChart.option = {
  type: 'txCount',
  color: d3.scaleOrdinal()
};

totalChart.barChart.option = {
  type: 'txCount',
  color: d3.scaleOrdinal()
};


function translate(x, y) {
  return `translate(${x}, ${y})`;
};

totalChart.lineChart.option.color.domain(colorClass).range(['#87cefa', '#ffe2e4', '#8b2e2e', '#207c7e']);
totalChart.barChart.option.color.domain(colorClass).range(['#87cefa', '#ffe2e4', '#8b2e2e', '#207c7e']);

// ---------- totalChart ---------- 
totalChart.init = function(chartId) {
  const margin = totalChart.option.margin;

  // Set svg
  const svg = d3.select(`#${chartId}`);

  totalChart.svg = svg.append('g').attr('transform', translate(margin.left, margin.top));
  totalChart.lineChart.svg = totalChart.svg;
  totalChart.barChart.svg = totalChart.svg;

  svg.attr('width', $(`#${chartId}`).width());

  totalChart.width = svg.attr('width') - margin.left - margin.right;
  totalChart.height = svg.attr('height') - margin.top - margin.bottom;

  totalChart.lineChart.xScale = d3.scaleLinear().range([0, totalChart.width]);
  totalChart.lineChart.yScale = d3.scaleLinear().range([totalChart.height, 0]);

  totalChart.lineChart.line = d3.line();
  totalChart.lineChart.line.x(path => totalChart.lineChart.xScale(path.x));
  totalChart.lineChart.line.y(path => totalChart.lineChart.yScale(path.y));

  totalChart.barChart.xScale = d3.scaleBand().range([0, totalChart.width]).padding(0.05);
  totalChart.barChart.yScale = d3.scaleLinear().range([totalChart.height, 0]);

  totalChart.svg.append('g')
    .attr("class", "x axis")
    .attr('transform', translate(0, totalChart.height))
    .call(d3.axisBottom(totalChart.lineChart.xScale));

  totalChart.svg.append('g')
    .attr("class", "y-left axis")
    .call(d3.axisLeft(totalChart.lineChart.yScale));

  totalChart.svg.append('g')
    .attr("class", "y-right axis")
    .attr("transform", translate(totalChart.width, 0))
    .call(d3.axisRight(totalChart.barChart.yScale));
};

totalChart.lineChart.update = () => {
  const lineChart = totalChart.lineChart;
  const transition = d3.transition().duration(totalChart.option.transitionTime);

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

totalChart.lineChart.updateData = (callback) => {
  const lineChart = totalChart.lineChart;
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

totalChart.lineChart.insertLine = (lines, transition) => {
  const lineChart = totalChart.lineChart;
  lines.enter()
  .append('path')
    .attr('class', 'line')
    .attr('data-line', pathInfo => pathInfo.class)
    .attr('d', pathInfo => lineChart.line(pathInfo.values))
    .style("stroke", pathInfo => lineChart.option.color(colorClass.indexOf(pathInfo.class)))
    .style('opacity', 0.0)
      // .on('mouseover', function () { mouseoverHandler(d3.select(this).attr('data-line')) })
      // .on("mouseout", function () { mouseoutHandler(d3.select(this).attr('data-line')) })
  .transition(transition).delay(totalChart.option.transitionTime)
    .style('opacity', 1.0);
};

totalChart.lineChart.updateLine = (lines, transition) => {
  const lineChart = totalChart.lineChart;
  lines.transition(transition)
    .attr("d", pathInfo => totalChart.lineChart.line(pathInfo.values))
    .style("stroke", pathInfo => lineChart.option.color(colorClass.indexOf(pathInfo.class)))
};

totalChart.lineChart.removeLine = (lines) => {
  lines.exit().remove();
};



totalChart.barChart.update = () => {
  const barChart = totalChart.barChart;
  const transition = d3.transition().duration(totalChart.option.transitionTime);

  // Update data
  barChart.updateData(function() {
    // Update axis
    barChart.xScale.domain(barChart.datas.xAxis);
    barChart.yScale.domain([0, barChart.datas.yAxis.max]);
  
    barChart.svg.select(".x").transition(transition).call(d3.axisBottom(barChart.xScale));
    barChart.svg.select(".y-right").transition(transition).call(d3.axisRight(barChart.yScale));
  
    // Update bar
    const bars = totalChart.svg.selectAll('rect').data(barChart.datas.values, (rectInfo) => rectInfo.class);
    barChart.insertBar(bars, transition);
    barChart.updateBar(bars, transition);
    barChart.removeBar(bars);
  });
};

totalChart.barChart.updateData = (callback) => {
  const barChart = totalChart.barChart;

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


totalChart.barChart.insertBar = (bars, transition) => {
  const barChart = totalChart.barChart;
  bars.enter()
  .append('rect')
    .attr('class', 'bar')
    .attr('data-bar', rect => rect.x)
    .attr("x", rect => barChart.xScale(rect.x))
    .attr("y", rect => barChart.yScale(rect.y))
    .attr("width", barChart.xScale.bandwidth())
    .attr("height", rect => totalChart.height - barChart.yScale(rect.y))
    .style('fill', rect => barChart.option.color(colorClass.indexOf(barChart.datas.class)))
    .style('opacity', 0)
      // .on('mouseover', function () { mouseoverHandler(d3.select(this).attr('data-bar')) })
      // .on("mouseout", function () { mouseoutHandler(d3.select(this).attr('data-bar')) })
    .transition(transition).delay(totalChart.option.transitionTime)
      .style('opacity', 0.5)
};

totalChart.barChart.updateBar = (bars, transition) => {
  const barChart = totalChart.barChart;

  bars.transition(transition)
    .attr("x", rect => barChart.xScale(rect.x))
    .attr("y", rect => barChart.yScale(rect.y))
    .attr("width", barChart.xScale.bandwidth())
    .attr("height", rect => totalChart.height - barChart.yScale(rect.y))
    .style('fill', rect => barChart.option.color(colorClass.indexOf(barChart.datas.class)))
};

totalChart.barChart.removeBar = (bars) => {
  bars.exit().remove();
};
$(document).on('ready', function() {
  totalChart.init('sub_chart_1');
  setTimeout(function() {
    totalChart.lineChart.update();
    totalChart.barChart.update();
  }, 2000);
});
