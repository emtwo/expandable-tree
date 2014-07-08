var svg = d3.select("svg");

var width  = svg.attr("width"),
    height = svg.attr("height"),
    maxWeight = 1,
    minWeight = 1000000000,
    MAX_NODE_RADIUS = 85,
    MIN_NODE_RADIUS = 30,
    MAIN_RADIUS = 100,
    LINK_LENGTH = 0,
    colors = d3.scale.category20();

var mainNode = {"id": 0,
                "name": "YOU",
                "x": width / 2 - MAIN_RADIUS / 2,
                "y": height / 2 - MAIN_RADIUS / 2,
                "fixed": true,
                "radius": MAIN_RADIUS }

var originalNodes = [mainNode], links = [], nodeList = {};
populateGraphDFS(categories, 0);
createNodeList();

var force = d3.layout.force()
    .charge(-6000)
    .gravity(0.001)
    .on("tick", tick);

svg.append("rect")
    .attr("width", width)
    .attr("height", height);

var link, node;

var nodes = originalNodes;
scaleGraphWeights();
update();

function update() {
  force
    .nodes(nodes)
    .links(links)
    .start();

  link = svg.selectAll(".link")
  link = link.data(links);
  link.exit().remove();
  link.enter().append("line")
    .attr("class", "link");

  node = svg.selectAll(".node");
  node = node.data(nodes, function(d) { return  d.id; });
  node.exit().remove();
  node.enter().append("g")
    .attr("class", "node")
    .on("click", click)
    .call(force.drag);

  node.append("circle")
    .attr("class", "node")
    .attr("r", function(d) { return d.radius; } )
    .style('fill', function(d) { return  colors(d.id); })

  node.append("text")
    .text(function(d) { return d.name; })
    .style("font-size", "1px")
    .each(getSize)
    .style("font-size", function(d) { return d.scale + "px"; })
}

function populateGraphDFS(root, parentID) {
  if (Object.keys(root).length > 0) {
    for (var child in root) {
      var currLength = originalNodes.length;
      var weight = root[child]["weight"]
      if (weight < minWeight) {
        minWeight = weight;
      }
      if (weight > maxWeight) {
        maxWeight = weight;
      }

      var hasChildren = root[child]["children"];
      originalNodes.push({"id": currLength, "radius": weight, "name": child});
      links.push({"source": parentID, "target": currLength});
      if (hasChildren) {
        populateGraphDFS(root[child]["children"], currLength);
      }
    }
  }
}

function scaleGraphWeights() {
  var oldRange = (maxWeight - minWeight);
  var newRange = (MAX_NODE_RADIUS - MIN_NODE_RADIUS);
  for (var i in originalNodes) {
    var node = originalNodes[i];
    if (node.id == 0) continue;
    node["radius"] = (((node["radius"] - minWeight) * newRange) / oldRange) + 30;
  }
}

function createNodeList() {
  for (var i in links) {
    var link = links[i];
    if (!nodeList[link.source]) {
      nodeList[link.source] = {"children": []};
    }
    nodeList[link.source].children.push(link.target);  
  }
}

function click(d) {
  if (d3.event.defaultPrevented) return; // click suppressed

  if (!nodeList[d.id]) {
    return; // leaf nodes.
  }
  if (nodeList[d.id].children) {
    nodeList[d.id]._children = nodeList[d.id].children;
    nodeList[d.id].children = null;
  } else {
    nodeList[d.id].children = nodeList[d.id]._children;
    nodeList[d.id]._children = null;
  }
  recomputeNodes();
  update();
}

function addChild(nodeID, parentID) {
  nodes.push(originalNodes[nodeID]);

  var parent = nodes.length - 1;
  links.push({"source": parentID, "target": parent});

  if (nodeList[nodeID] && nodeList[nodeID].children) {
    for (var childIndex in nodeList[nodeID].children) {
      var childID = originalNodes[nodeList[nodeID].children[childIndex]].id;
      addChild(childID, parent);
    }
  }
}

function recomputeNodes() {
  links = [];
  nodes = [];
  addChild(mainNode.id, 0);
}

function getSize(d) {
  var bbox = this.getBBox(),
      cbbox = this.parentNode.getBBox(),
      scale = Math.min(cbbox.width/bbox.width, cbbox.height/bbox.height);
  d.scale = scale;
}

function tick() {
  link.attr("x1", function(d) { return (Math.max(d.source.radius, Math.min(width - d.source.radius, d.source.x))); })
      .attr("y1", function(d) { return (Math.max(d.source.radius, Math.min(height - d.source.radius, d.source.y))); })
      .attr("x2", function(d) { return (Math.max(d.target.radius, Math.min(width - d.target.radius, d.target.x))); })
      .attr("y2", function(d) { return (Math.max(d.target.radius, Math.min(height - d.target.radius, d.target.y))); });

  node.attr("transform", function (d) {
    return "translate(" + (Math.max(d.radius, Math.min(width - d.radius, d.x))) + "," + (Math.max(d.radius, Math.min(height - d.radius, d.y))) + ")";
  });
}
