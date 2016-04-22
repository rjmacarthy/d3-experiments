///<reference path="./typings/main.d.ts"/>

var json = require("json!./data/offers.json").Collection;
var properties = require("json!./data/properties.json").Collection;

var d3 = require('d3');
var grouped = false;

const draw = (json) => {
  render(json);
}

const render = (json) => {
  var width = 960,
    height = 600;

  d3.select("#host").selectAll("*").remove();

  var fill = d3.scale.category10();

  var nodes = json.map(function (d, i) {
    var status;
    if (d.OfferStatus) {
      status = d.OfferStatus.SystemName
    } else {
      status = d.RoleStatus.SystemName;
    }
    return {
      index: i,
      status: status,
      prop: d
    };
  });

  var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .on("tick", tick)
    .start();

  var svg = d3.select("#host").append("svg")
    .attr("width", width)
    .attr("height", height);

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .attr("r", function (d, i) {
      return d.prop.AskingPrice.PriceValue / 100000 + 6;
    })
    .style("fill", function (d, i) {
      switch (d.status) {
        case "Valued":
          return "#f2bd72";
        case "InstructionToSell":
          return "#33cc99"
        case "OfferAccepted":
          return "#da2c01"
        default:
          return "#385595";
      }
    })
    .style("stroke", function (d, i) { return d3.rgb(fill(i & 3)).darker(2); })
    .call(force.drag)
    .on("mousedown", function () { d3.event.stopPropagation(); });

  svg.style("opacity", 1e-6)
    .transition()
    .duration(1000)
    .style("opacity", 1);

  function tick(e) {


    if (grouped) {
      var k = 6 * e.alpha;
      nodes.forEach(function (o, i) {
        o.y += o.status === "Valued" ? k : -k;
        o.x += o.status === "InstructionToSell" ? k : -k;
        o.x += o.status === "OfferAccepted" ? k : -k;
      });
    }

    node.attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  }

}

d3.select("#separate")
  .on("click", () => {
    grouped = true;
    draw(properties);
  })

d3.select("#group")
  .on("click", () => {
    grouped = false;
    draw(properties);
  })

draw(properties);