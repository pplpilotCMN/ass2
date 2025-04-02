// bubble chart with d3 force layout, visualising sentiment counts (positive, neutral, negative)
// per airline from kaggle twitter us airline sentiment dataset via a dropdown

let allData = [];
const width = 950, height = 950; // svg dimensions

// load and check required data from csv file
async function loadData() {
  try {
    const data = await d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv");

    if (!data || data.length === 0) {
      console.error("no data found in csv file.");
      return;
    }

    // ensure required columns exist in dataset
    const requiredColumns = ["airline", "airline_sentiment"];
    if (!requiredColumns.every(col => data[0]?.[col] !== undefined)) {
      console.error("required columns missing > airline and/or airline_sentiment.");
      return;
    }

    processData(data);
    initialiseVisualisation();
  } catch (error) {
    console.error("error loading csv file.", error);
  }
}

// process data by grouping counts of sentiments per airline
function processData(data) {
  const sentimentCounts = d3.rollup(
    data,
    airlineData => d3.rollup(airlineData, d => d.length, d => d.airline_sentiment),
    d => d.airline
  );

  sentimentCounts.forEach((sentiments, airline) => {
    sentiments.forEach((count, sentiment) => {
      if (!airline || !sentiment || isNaN(count)) {
        console.warn(`invalid data for airline: ${airline}, sentiment: ${sentiment}, count: ${count}`);
        return;
      }

      allData.push({
        airline,
        sentiment,
        count,
        x: width / 2 + (Math.random() - 0.5) * width * 0.5,
        y: height / 2 + (Math.random() - 0.5) * height * 0.5
      });
    });
  });
  console.log("processed data-", allData);
}

// initialise svg, force simulation, tooltip, and dropdown
function initialiseVisualisation() {
  const svg = d3.select("#bubble-chart").attr("width", width).attr("height", height);
  const sentimentColours = { positive: "green", neutral: "orange", negative: "red" };
  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(allData, d => d.count)])
    .range([15, 130]);
  const bubbleGroup = svg.append("g");

  // tooltip for displaying airline and sentiment count
  const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "white")
    .style("padding", "10px")
    .style("border-radius", "10px")
    .style("font-size", "18px");

  // force simulation to position bubbles dynamically
  const forceSimulation = d3.forceSimulation()
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .force("collide", d3.forceCollide(d => radiusScale(d.count) + 5))
    .on("tick", () => {
      bubbleGroup.selectAll(".bubble-group")
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

  renderBubbles(allData, bubbleGroup, forceSimulation, radiusScale, sentimentColours, tooltip);
  setupDropdown(forceSimulation, radiusScale, sentimentColours, bubbleGroup, tooltip);
}

// Render bubbles for given data
function renderBubbles(data, bubbleGroup, forceSimulation, radiusScale, sentimentColours, tooltip) {
  if (!data || data.length === 0) {
    console.warn("no data available to render bubbles.");
    return;
  }
  console.log("rendering bubbles for data:", data);
  bubbleGroup.selectAll(".bubble-group").remove();

  const bubbles = bubbleGroup.selectAll(".bubble-group")
    .data(data, d => d.airline + d.sentiment)
    .enter().append("g")
    .attr("class", "bubble-group");

  bubbles.append("circle")
    .attr("r", d => Math.max(15, radiusScale(d.count)))
    .attr("fill", d => sentimentColours[d.sentiment] || "gray")
    .attr("stroke", "black")
    .attr("stroke-width", 3)
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
             .html(`<strong>${d.airline}</strong><br>${d.count} ${d.sentiment} tweets`)
             .style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY + 10) + "px");
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });

  // airline label inside bubble
  bubbles.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.3em")
    .style("fill", "white")
    .style("font-size", d => Math.max(12, radiusScale(d.count) / 3) + "px")
    .text(d => d.airline.length > 10 ? d.airline.substring(0, 10) + "..." : d.airline);

  forceSimulation.nodes(data).alpha(1).restart();
}

// setup dropdown for filtering bubbles by airline
function setupDropdown(forceSimulation, radiusScale, sentimentColours, bubbleGroup, tooltip) {
  const uniqueAirlines = Array.from(new Set(allData.map(d => d.airline)));

  d3.select("#airline-dropdown")
    .on("change", function() {
      const selectedAirline = this.value;
      const filteredData = selectedAirline === "all" ? allData : allData.filter(d => d.airline === selectedAirline);
      console.log(`filtered data for ${selectedAirline}:`, filteredData);

      if (!filteredData.length) {
        console.warn(`no data available for airline: ${selectedAirline}`);
      }
      renderBubbles(filteredData, bubbleGroup, forceSimulation, radiusScale, sentimentColours, tooltip);
    })
    .selectAll("option")
    .data(["all"].concat(uniqueAirlines))
    .enter().append("option")
    .attr("value", d => d)
    .text(d => d);
}

// load dataset and initialise visualisation
loadData();
