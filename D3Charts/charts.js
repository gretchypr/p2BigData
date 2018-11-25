
$(document).ready(function(){
      displayWordCountChart();
      displayHashtags();
      displayKeywordChart();
      displayUserChart();
});

function displayWordCountChart() {
    var svg = d3.select("#word_count"),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    d3.csv("count_results.csv", function(error, data) {
      if (error) throw error;
      var root = {name: "WordCount", children: []};
      // Data obtained
        var count_results = [];
        // Date of first data
        var date = data[0]['date_created'];
        var time = data[0]['time_created'];
        var date_res = [];
        var time_res = [];
        for (var i = 0 ; i < data.length; i++) {
            if (date == data[i]['date_created']){
                if (time == data[i]['time_created'])
                {
                    time_res.push({name:data[i]['word'] + "-" + data[i]['count'], size:100});
                }
                else {
                    // Save all results for this date in the list
                    date_res.push({name:time,children:time_res});
                    time_res = [];
                    time = data[i]['time_created'];
                    time_res.push({name:data[i]['word'] + "-" + data[i]['count'], size:100});
                }

            }
            else{
                date_res.push({name:time,children:time_res});
                time_res = [];
                time = data[i]['time_created'];
                time_res.push({name:data[i]['word'] + "-" + data[i]['count'], size:100});
                // Add the results for the previous date
                count_results.push({name:date, children:date_res});
                date = data[i]['date_created'];
                date_res = [];
            }
        }

      root['children'] = count_results;
      root = d3.hierarchy(root)
          .sum(function(d) { return d.size; })
          .sort(function(a, b) { return b.value - a.value; });

      var focus = root,
          nodes = pack(root).descendants(),
          view;

      var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
          .style("fill", function(d) { return d.children ? color(d.depth) : null; })
          .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

      var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
          .attr("class", "label")
          .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
          .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
          .text(function(d) { return d.data.name; });

      var node = g.selectAll("circle,text");

      svg
          .style("background", color(-1))
          .on("click", function() { zoom(root); });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
              return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
          .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

      function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
      }
    });
}
function displayKeywordChart() {
    var svg = d3.select("#keywords"),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    d3.csv("keyword_results.csv", function(error, data) {
      if (error) throw error;
      var root = {name: "KeywordCount", children: []};
      // Data obtained
        var count_results = [];
        // Date of first data
        var date = data[0]['date_created'];
        var time = data[0]['time_created'];
        var date_res = [];
        var time_res = [];
        for (var i = 0 ; i < data.length; i++) {
            if (date == data[i]['date_created']){
                if (time == data[i]['time_created'])
                {
                    time_res.push({name:data[i]['keyword'] + "-" + data[i]['count'], size:100});
                }
                else {
                    // Save all results for this date in the list
                    date_res.push({name:time,children:time_res});
                    time_res = [];
                    time = data[i]['time_created'];
                    time_res.push({name:data[i]['keyword'] + "-" + data[i]['count'], size:100});
                }

            }
            else{
                date_res.push({name:time,children:time_res});
                time_res = [];
                time = data[i]['time_created'];
                time_res.push({name:data[i]['keyword'] + "-" + data[i]['count'], size:100});
                // Add the results for the previous date
                count_results.push({name:date, children:date_res});
                date = data[i]['date_created'];
                date_res = [];
            }
        }

      root['children'] = count_results;
      root = d3.hierarchy(root)
          .sum(function(d) { return d.size; })
          .sort(function(a, b) { return b.value - a.value; });

      var focus = root,
          nodes = pack(root).descendants(),
          view;

      var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
          .style("fill", function(d) { return d.children ? color(d.depth) : null; })
          .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

      var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
          .attr("class", "label")
          .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
          .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
          .text(function(d) { return d.data.name; });

      var node = g.selectAll("circle,text");

      svg
          .style("background", color(-1))
          .on("click", function() { zoom(root); });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
              return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
          .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

      function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
      }
    });
}
function displayUserChart() {
    var svg = d3.select("#users"),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    d3.csv("users_results.csv", function(error, data) {
      if (error) throw error;
      var root = {name: "Users", children: []};
      // Data obtained
        var count_results = [];
        // Date of first data
        var date = data[0]['date_created'];
        var time = data[0]['time_created'];
        var date_res = [];
        var time_res = [];
        for (var i = 0 ; i < data.length; i++) {
            if (date == data[i]['date_created']){
                if (time == data[i]['time_created'])
                {
                    time_res.push({name:data[i]['username'] + "-" + data[i]['tweets_posted'], size:100});
                }
                else {
                    // Save all results for this date in the list
                    date_res.push({name:time,children:time_res});
                    time_res = [];
                    time = data[i]['time_created'];
                    time_res.push({name:data[i]['username'] + "-" + data[i]['tweets_posted'], size:100});
                }

            }
            else{
                date_res.push({name:time,children:time_res});
                time_res = [];
                time = data[i]['time_created'];
                time_res.push({name:data[i]['username'] + "-" + data[i]['tweets_posted'], size:100});
                // Add the results for the previous date
                count_results.push({name:date, children:date_res});
                date = data[i]['date_created'];
                date_res = [];
            }
        }

      root['children'] = count_results;
      root = d3.hierarchy(root)
          .sum(function(d) { return d.size; })
          .sort(function(a, b) { return b.value - a.value; });

      var focus = root,
          nodes = pack(root).descendants(),
          view;

      var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
          .style("fill", function(d) { return d.children ? color(d.depth) : null; })
          .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

      var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
          .attr("class", "label")
          .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
          .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
          .text(function(d) { return d.data.name; });

      var node = g.selectAll("circle,text");

      svg
          .style("background", color(-1))
          .on("click", function() { zoom(root); });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
              return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
          .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

      function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
      }
    });
}
function displayHashtags() {
    d3.csv("hashtags_results.csv", function(error, data) {
      if (error) throw error;
      var root = {name: "Hashtags", children: []};
      // Data obtained
        var hash_results = [];
        // Date of first data
        var date = data[0]['date_created'];
        var time = data[0]['time_created'];
        var date_res = [];
        var time_res = [];
        for (var i = 0 ; i < data.length; i++) {
            if (date == data[i]['date_created']){
                if (time == data[i]['time_created'])
                {
                    time_res.push({name:data[i]['hashtag'] + "-" + data[i]['count'], size:100});
                }
                else {
                    // Save all results for this date in the list
                    date_res.push({name:time,children:time_res});
                    time_res = [];
                    time = data[i]['time_created'];
                    time_res.push({name:data[i]['hashtag'] + "-" + data[i]['count'], size:100});
                }

            }
            else{
                date_res.push({name:time,children:time_res});
                time_res = [];
                time = data[i]['time_created'];
                time_res.push({name:data[i]['hashtag'] + "-" + data[i]['count'], size:100});
                // Add the results for the previous date
                hash_results.push({name:date, children:date_res});
                date = data[i]['date_created'];
                date_res = [];
            }
        }
        root['children'] = hash_results;

     var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#hashtags")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(root, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
root['children'].forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 180});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}

    });
}