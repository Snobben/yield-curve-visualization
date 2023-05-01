// Load and parse the CSV file
d3.csv('treasuries_cleaned.csv').then((parsedData) => {
  // Convert the data into the desired format
  const formattedData = parsedData.map((row) => {
    const date = new Date(row.Date);
    // Extract the yield data and convert the rates to numbers
    const yields = Object.entries(row)
      .filter(([key, value]) => key !== 'Date')
      .map(([time, rate]) => ({ time, rate: parseFloat(rate) }));
    // Combine the date and yields in a single object
    return { date, yields };
  });

  // Create the visualization using the formatted data
  createVisualization(formattedData);
});

function createVisualization(data) {
  // Define the dimensions and margins for the visualization
  const width = 900;
  const height = 400;
  const margin = { top: 100, right: 60, bottom: 60, left: 60 };

  // Create an SVG element and set its dimensions and colour
  const svg = d3.select('svg').attr('width', width).attr('height', height).style('background-color', 'black');

  // Create a group element (g) and apply a translation to account for the margins
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  
  // Define the x-axis scale as a band scale based on the time labels
  const xScale = d3.scaleBand().domain(data[0].yields.map((d) => d.time)).range([0, width - margin.left - margin.right]).padding(0.1);

  // Define the y-axis scale as a linear scale based on the maximum yield rate
  const yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d3.max(d.yields, (yieldPoint) => yieldPoint.rate))]).range([height - margin.top - margin.bottom, 0]).nice();

  // Create the x-axis and y-axis using the defined scales
  const xAxis = d3.axisBottom(xScale).tickFormat(d => `${d}`).tickSize(-height + margin.top + margin.bottom).tickPadding(10);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}%`).tickSize(-width + margin.left + margin.right).tickPadding(10);

  // Add the x-axis and y-axis to the visualization with white text color
  const xAxisGroup = g
    .append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(xAxis)
    .attr('stroke', 'white');

  xAxisGroup.selectAll('.tick text').attr('dx', '-3em'); // Move the x-axis labels a bit to the left

  g.append('g').call(yAxis).attr('stroke', 'white');


 // Add the title
 const title = g
   .append('text')
   .text('US Treasury yield development in 2022') // Change the title text
   .attr('x', width / 2)
   .attr('y', -margin.top / 2)
   .attr('text-anchor', 'middle')
   .attr('fill', 'white') // Make the title white
   .attr('font-size', '24px')
   .attr('font-weight', 'bold');

  // Define the line generator for the yield curve using the x and y scales
  const line = d3.line().x((d) => xScale(d.time)).y((d) => yScale(d.rate)).curve(d3.curveMonotoneX);

  // Add a path element for the primary yield curve
  const primaryPath = g.append('path').attr('fill', 'none').attr('stroke', 'white').attr('stroke-opacity', 1).attr('stroke-width', 3);

  // Add a group element to contain the trace lines for previous data points
  const traceGroup = g.append('g');
  

   // Add a color scale for the trace lines
   const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, data.length - 1]);

   // Add a gradient colored rectangle
   const gradient = g.append('linearGradient')
     .attr('id', 'colorGradient')
     .attr('gradientUnits', 'objectBoundingBox') // Use objectBoundingBox to correctly scale the gradient
     .attr('x1', 0)
     .attr('y1', 0)
     .attr('x2', 1)
     .attr('y2', 0);
 
   gradient.append('stop')
     .attr('offset', '0%')
     .attr('stop-color', colorScale(0));
 
   gradient.append('stop')
     .attr('offset', '100%')
     .attr('stop-color', colorScale(data.length - 1));
 
   const gradientWidth = width - margin.left - margin.right;
   const gradientHeight = 10;
   const gradientPosX = 0;
   const gradientPosY = height - margin.bottom - gradientHeight;
 
   g.append('rect')
     .attr('x', gradientPosX)
     .attr('y', gradientPosY)
     .attr('width', gradientWidth)
     .attr('height', gradientHeight)
     .attr('fill', 'url(#colorGradient)');

  

  // Animation loop
  let index = 0;
  setInterval(() => {
    // Get the current data point and update the primary yield curve
    const currentData = data[index];
    primaryPath
      .datum(currentData.yields)
      .transition()
      .duration(200)
      .attr('d', line)
      .on('end', () => {
        // Add a new trace line for the current data point after the primary line transition ends
        traceGroup
          .append('path')
          .datum(currentData.yields)
          .attr('fill', 'none')
          .attr('stroke', colorScale(index))
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1)
          .attr('d', line);
      });

    // Update the date display
    dateDisplay.text(currentData.date.toLocaleDateString());

    // Increment the index and wrap around if necessary
    index = (index + 1) % data.length;
  }, 200);

  // Add a text element to display the current date
  const dateDisplay = g
    .append('text')
    .attr('x', width - 200)
    .attr('y', - 30)
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .attr('fill', 'white');

  let dataIndex = 0;

  function updatePath() {
    const currentData = data[dataIndex].yields;

    // Update the date display
    dateDisplay.text(data[dataIndex].date.toLocaleDateString());

    // Add a trace line for the previous data points
    if (dataIndex > 0) {
      const tracePath = traceGroup
        .append('path')
        .datum(currentData)
        .attr('fill', 'none')
        .attr('stroke', colorScale(dataIndex)) // Use the color scale to set the stroke color
        .attr('stroke-width', 1)
        .attr('d', line);

      tracePath.lower(); // Move the trace line below the primary line
    }

    primaryPath
      .datum(currentData)
      .transition()
      .duration(200) // Reduce the duration to make the date change faster
      .attr('d', line)
      .on('end', () => {
        dataIndex = (dataIndex + 1) % data.length;
        updatePath();
      });
  }

  updatePath();
}