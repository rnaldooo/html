// Check network structure (optional)
  for (var i = 0; i < data.length; i++) {
    // Check parents
    for (var j = 0; j < data[i].parent.length; j++) {
      if (!(data[data[i].parent[j]].children.indexOf(data[i].id) > -1)) {
        alert(data[data[i].parent[j]].id + " does not have " + data[i].id + " as a child")
      }
    }
    // Check children
    for (var j = 0; j < data[i].children.length; j++) {
      if (!(data[data[i].children[j]].parent.indexOf(data[i].id) > -1)) {
        alert(data[data[i].children[j]].id + " does not have " + data[i].id + " as a parent")
      }
    }
  }
  // Size of canvas
  var width = 970,
    height = 970;
  //Zooming
  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
  var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);
  function zoomed() {
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
  }
  function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }
  function dragended(d) {
    d3.select(this).classed("dragging", false);
  }
  // Vars for positioning nodes into columns
  var nodes_with_pos = 0,
    columns = {};
  // Place nodes in to columns based on position of parents
  while (nodes_with_pos < Object.keys(data).length) {
    for (var i = 0; i < data.length; i++) {
      if (!("column" in data[i])) {
        if (data[i].parent.length == 0) {
          if ("0" in columns) {
            columns["0"].push(data[i].id)
          } else {
            columns["0"] = [data[i].id]
          }
          data[i]["column"] = 0
          nodes_with_pos += 1
        } else {
          var parents_located = true, parent_max = -1;
          for (var j = 0; j < data[i].parent.length; j++) {
            if ("column" in data[data[i].parent[j]]) {
              if (data[data[i].parent[j]].column > parent_max) {
                parent_max = data[data[i].parent[j]].column;
              }
            } else {
              parents_located = false;
            }
          }
          if (parents_located) {
            if ((parent_max + 1).toString() in columns) {
              columns[(parent_max + 1).toString()].push(data[i].id)
            } else {
              columns[(parent_max + 1).toString()] = [data[i].id]
            }
            data[i]["column"] = parent_max + 1
            nodes_with_pos += 1
          }
        }
      }
    }
  }
  // Sort nodes in columns to relatively match position of parents
  function sum_array(a) {
    var t = 0;
    $.each(a,function() {
        t += this;
    });
    return t / a.length;
  }
  function reorder(a,b) {
    a_parent_ave_pos = []
    for (var j = 0; j < data[a].parent.length; j++) {
      a_parent_ave_pos.push(columns[data[data[a].parent[j]].column].indexOf(data[a].parent[j]) / columns[data[data[a].parent[j]].column].length)
    }
    a_parent_ave_pos = sum_array(a_parent_ave_pos);
    b_parent_ave_pos = []
    for (var j = 0; j < data[b].parent.length; j++) {
      b_parent_ave_pos.push(columns[data[data[b].parent[j]].column].indexOf(data[b].parent[j]) / columns[data[data[b].parent[j]].column].length)
    }
    b_parent_ave_pos = sum_array(b_parent_ave_pos);
    if (a_parent_ave_pos < b_parent_ave_pos)
      return -1;
    else if (a_parent_ave_pos > b_parent_ave_pos)
      return 1;
    else
      return 0;
  }
  for (var i in columns) {
    if (i != "0") {
      columns[i].sort(reorder)
    }
  }
  // Assign nodes final x,y positions
  for (var i = 0; i < data.length; i++) {
    var x, y;
    x = (width * 0.5 / (Object.keys(columns).length)) * data[i].column + (width / (Object.keys(columns).length)/2)
    y = ((height *0.5 / (columns[data[i].column.toString()].length + 1)) * columns[data[i].column.toString()].indexOf(data[i].id)) + (height / (columns[data[i].column.toString()].length + 1))
    data[data[i].id]["x"] = x
    data[data[i].id]["y"] = y
  }
  // Get links for drawing
  var links = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].children.length > 0) {
      for (var j = 0; j < data[i].children.length; j++) {
        links.push({parent: data[i].id, child: data[data[i].children[j]].id, x1: data[i].x, y1: data[i].y, x2: data[data[i].children[j]].x, y2: data[data[i].children[j]].y})
      }
    }
  }
  var svg = d3.select("#graph").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(10,0)")
      .call(zoom);//.attr("transform", "translate(-500,0)")
  var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");
  var container = svg.append("g");
  // image icons
  var defs = svg.append('svg:defs');
  for (var i = 0; i < data.length; i++) {
    defs.append("svg:pattern")
        .attr("id", data[i].img)
        .attr("width", 20)
        .attr("height", 20)
        .append("svg:image")
        .attr("xlink:href", 'http://nealhorner.com/images/factorio/' + data[i].img + '.png')
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 0)
        .attr("y", 0);
  }
  var link = container.selectAll("line")
      .data(links)
    .enter().append("line")
      .attr("id", function(d) {return d.child + "" + d.parent})
      .attr("class", "link")
      .attr({ x1: function(d) { return d.x1; }, y1: function (d) { return d.y1; }, x2: function (d) { return d.x2; }, y2: function (d) { return d.y2; } })
  // var diagonal = d3.svg.diagonal()
  //     .projection(function(d) { return [d.y, d.x]; });
  var node = container.selectAll(".node")
      .data(data)
    .enter().append("g")
      .attr("id", function(d) { return d.id})
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  // Circle background
  node.append("circle")
      .attr("r", 10)
  // highlight relationships on mouseover
  function select_parents(d) {
    for (var i = 0; i < d.parent.length; i++) {
      select_parents(data[d.parent[i]]);
      $("#" + d.id + data[d.parent[i]].id).addClass("selected_parent_link")
      $("#" + d.parent[i]).addClass("selected_parent");
    }
  }
  function select_children(d) {
    for (var i = 0; i < d.children.length; i++) {
      select_children(data[d.children[i]]);
      $("#" + data[d.children[i]].id + d.id).addClass("selected_child_link")
      $("#" + d.children[i]).addClass("selected_child");
    }
  }
  function highlight(d) {
    $("#" + d.id).addClass("selected")
    select_parents(d)
    select_children(d)
  }
  function clear_selection() {
    $(".selected_parent").removeClass("selected_parent")
    $(".selected").removeClass("selected")
    $(".selected_child").removeClass("selected_child")
    $(".selected_parent_link").removeClass("selected_parent_link")
    $(".selected_child_link").removeClass("selected_child_link")
  }
  // Circle with image and on mouseover events
  node.append("circle")
      .attr("r", 10)
      .style("fill", function(d) { return "url(#" + d.img + ")"})
      .on("mouseover", function(d){highlight(d)})
      .on("mouseout", function(d){clear_selection()});
  // Text label for nodes
  node.append("text")
      .attr("dx", function(d) { return d.children ? -13 : 13; })
      .attr("dy", 3)
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; });