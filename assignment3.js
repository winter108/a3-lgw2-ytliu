var width = 960,
    height = 500;

var projection = d3.geo.albers()
    .translate([width / 2, height / 2])
    .scale(1080);

var path = d3.geo.path()
    .projection(projection);

var voronoi = d3.geom.voronoi()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .clipExtent([[0, 0], [width, height]]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "airports.csv")
    .defer(d3.csv, "flights.csv")
    .defer(d3.csv, "newTeamLocations.csv")
    .defer(d3.csv, "numbers.csv")
    .defer(d3.csv, "teamLocationsCoordinates.csv")
    .await(ready);

function sanitize(str) {
  return str.toLowerCase().replace(/[ \-()]/g, "");
}

function ready(error, us, airports, flights, teamLocations, numbers, tlc) {
  var airportById = d3.map(),
      positions = [],
      cityNames = [];
      uniqueTeamNames = [],
      teamNameToCoordinates = {},
      finalData = {},
      finalDataArray = [],
      selectTeamNameStr = "Pittsburgh,Wisconsin,Carleton College,Oregon,Central Florida,Luther,Minnesota," + 
      "Tufts,Colorado,Texas,California,Georgia Tech,North Carolina,Washington,Michigan,"  +
      "Ohio,California-Davis,Cornell",
      selectTeamNameList = [],
      teamData = {};

  selectTeamNameList = selectTeamNameStr.split(',');
  for (var i = 0; i < selectTeamNameList.length; i++) {
      selectTeamNameList[i] = sanitize(selectTeamNameList[i]);
  };

  teamLocations.forEach(function(tl) {
      tlc.forEach(function(t) {
          if (sanitize(t.name) === sanitize(tl.City)) {
            tl.latitude = t.latitude;
            tl.longitude = t.longitude;
          };
      });
  });

  numbers.forEach(function(d) {
      if (uniqueTeamNames.indexOf(d.WinningTeam) === -1) {
        uniqueTeamNames.push(d.WinningTeam);
      };
      if (uniqueTeamNames.indexOf(d.LosingTeam) === -1) {
        uniqueTeamNames.push(d.LosingTeam);
      };

      if (!finalData[d.WinningTeam]) {
        finalData[d.WinningTeam] = {TeamName: d.WinningTeam}
        finalData[d.WinningTeam].win = [];
        finalData[d.WinningTeam].lose = [];
      };

      if (!finalData[d.LosingTeam]){
        finalData[d.LosingTeam] = {TeamName: d.LosingTeam};
        finalData[d.LosingTeam].win = [];
        finalData[d.LosingTeam].lose = [];
      }
      finalData[d.WinningTeam].win.push({source: finalData[d.WinningTeam], target: finalData[d.LosingTeam]});
      finalData[d.LosingTeam].lose.push({source: finalData[d.LosingTeam], target: finalData[d.WinningTeam]});
  });

  for (var key in finalData) {
    if (selectTeamNameList.indexOf(sanitize(key)) > -1) {
      finalData[key].isTop20 = true;  
    } else {
      finalData[key].isTop20 = false;  
    }
      finalDataArray.push(finalData[key]);
  };

  console.log(finalDataArray);

  uniqueTeamNames.forEach(function (name) {
    teamLocations.forEach(function (t) {
          if (sanitize(t.Team).indexOf(sanitize(name)) > -1) {
            teamNameToCoordinates[sanitize(name)] =  [t.longitude, t.latitude];
          }
      });
  });

  finalDataArray.forEach(function(d) {
    if (teamNameToCoordinates[sanitize(d.TeamName)] && teamNameToCoordinates[sanitize(d.TeamName)][0] && teamNameToCoordinates[sanitize(d.TeamName)][1]) {
      d[0] = +teamNameToCoordinates[sanitize(d.TeamName)][0];
      d[1] = +teamNameToCoordinates[sanitize(d.TeamName)][1];
      d.longitude = teamNameToCoordinates[sanitize(d.TeamName)][0];
      d.latitude = teamNameToCoordinates[sanitize(d.TeamName)][1];
      var position = projection(d);
      d.x = position[0];
      d.y = position[1];
    } else {
      d.deleted = true;
    }
  });

  finalDataArray.forEach(function(d) {
    d.win = d.win.filter(function(w) {
      return w.source[0] && w.target[0];
    });
    d.lose = d.lose.filter(function(w) {
      return w.source[0] && w.target[0];
    });
  });

  finalDataArray = finalDataArray.filter(function (d) {
    return !d.deleted;
  });

  svg.append("path")
      .datum(topojson.feature(us, us.objects.land))
      .attr("class", "states")
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "state-borders")
      .attr("d", path);

  var noneTop20DataArray = finalDataArray.filter(function (d) {
    return !d.isTop20;
  });

  var top20DataArray = finalDataArray.filter(function (d) {
    return d.isTop20;
  });

  voronoi(top20DataArray)
      .forEach(function(d) { d.point.cell = d; });
  console.log(finalDataArray);

  svg.selectAll(".place-label")
    .data(top20DataArray)
  .enter().append("text")
    .attr("class", "place-label")
    .attr("transform", function(d) { 
      if (teamNameToCoordinates[sanitize(d.TeamName)]) {
        return "translate(" + projection(teamNameToCoordinates[sanitize(d.TeamName)]) + ")"; 
      } else {
        return "";
      };
    })
    .attr("dy", ".35em")
    .attr("dx", "7px")
    .text(function(d) { return d.TeamName; });


  var airport = svg.append("g")
      .attr("class", "airports")
    .selectAll("g")
      .data(top20DataArray)
    .enter().append("g")
      .attr("class", "airport");

  airport.append("path")
      .attr("class", "airport-cell")
      .attr("d", function(d) { 
        if (!d.cell || !d.cell.length || d.cell.join("L").indexOf('NaN') > -1) {
          return null;
        } else {
          return "M" + d.cell.join("L") + "Z" ;  
        }
      })
      .on("mouseover", function (d){
        d.win.forEach(function (w){
          d3.selectAll("." + w.target.TeamName).classed('visible', true);
          d3.selectAll("." + w.target.TeamName).classed('invisible', false);
        });
        d.lose.forEach(function (w){
          d3.selectAll("." + w.target.TeamName).classed('visible', true);
          d3.selectAll("." + w.target.TeamName).classed('invisible', false);
        });
      })
      .on("mouseleave", function (d){
        d.win.forEach(function (w){
          d3.selectAll("." + w.target.TeamName).classed('visible', false);
          d3.selectAll("." + w.target.TeamName).classed('invisible', true);
        });
        d.lose.forEach(function (w){
          d3.selectAll("." + w.target.TeamName).classed('visible', false);
          d3.selectAll("." + w.target.TeamName).classed('invisible', true);
        });
      });
  airport.append("g")
      .attr("class", "airport-arcs lose")
    .selectAll("path")
      .data(function(d) { 
        return d.lose; 
      })
    .enter().append("path")
      .attr("d", function(d) {
        return path({type: "LineString", coordinates: [d.source, d.target]}); 
      });

  airport.append("g")
      .attr("class", "airport-arcs win")
    .selectAll("path")
      .data(function(d) { 
        return d.win; })
    .enter().append("path")
      .attr("d", function(d) {
        return path({type: "LineString", coordinates: [d.source, d.target]}); 
      });

  airport.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x +  "," + d.y +  ")"; })
      .attr("r", function(d) { return 3; });

  var noneTop20Container = svg.append("g")
      .attr("class", "circle-container")
    .selectAll("g")
      .data(noneTop20DataArray)
    .enter().append("g")
      .attr("class", "nonetop20circle");

  var circles = noneTop20Container.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("r", function(d, i) { return 3; })
      .attr("class", function(d) {
        return d.TeamName + ' invisible';
      })
      
      noneTop20Container.append("text")
        .attr("class", function (d) {
          return d.TeamName + " place-label invisible"; 
        })
        .attr("transform", function(d) { 
      if (teamNameToCoordinates[sanitize(d.TeamName)]) {
        return "translate(" + projection(teamNameToCoordinates[sanitize(d.TeamName)]) + ")"; 
      } else {
        return "";
      };
    })
      .attr("dy", ".5em")
      .attr("dx", "7px")
      .text(function(d) { return d.TeamName; });

  
}