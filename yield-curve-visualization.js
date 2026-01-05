// Configuration
const CONFIG = {
  dataSource: 'treasuries_cleaned.csv',
  width: 900,
  height: 400,
  margin: { top: 100, right: 60, bottom: 60, left: 60 },
  animationDuration: 200,
  title: 'US Treasury Yield Development',
  colors: {
    background: 'black',
    primary: 'white',
    traceOpacity: 0.4
  },
  dateDisplay: {
    x: 700, // width - 200
    y: -30,
    fontSize: '16px'
  },
  title: {
    fontSize: '24px',
    yOffset: 0.5 // fraction of margin.top
  }
};

/**
 * Create visualization with playback controls
 * @param {Array} data - Formatted yield data
 * @param {Function} onFrameUpdate - Callback for each frame update
 * @returns {Object} Visualization control object
 */
function createVisualizationWithControls(data, onFrameUpdate) {
  // Use configuration for dimensions and margins
  const { width, height, margin, animationDuration, colors } = CONFIG;

  // Select the SVG element
  const svg = d3.select('#yield-curve-chart')
    .attr('width', width)
    .attr('height', height)
    .style('background-color', colors.background);

  // Create a group element (g) and apply a translation to account for the margins
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  
  // Define the x-axis scale as a band scale based on the time labels
  const xScale = d3.scaleBand().domain(data[0].yields.map((d) => d.time)).range([0, width - margin.left - margin.right]).padding(0.1);

  // Define the y-axis scale as a linear scale based on the maximum yield rate
  const yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d3.max(d.yields, (yieldPoint) => yieldPoint.rate))]).range([height - margin.top - margin.bottom, 0]).nice();

  // Create the x-axis and y-axis using the defined scales
  const xAxis = d3.axisBottom(xScale).tickFormat(d => `${d}`).tickSize(-height + margin.top + margin.bottom).tickPadding(10);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}%`).tickSize(-width + margin.left + margin.right).tickPadding(10);

  // Add the x-axis and y-axis to the visualization
  const xAxisGroup = g
    .append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(xAxis)
    .attr('stroke', colors.primary);

  xAxisGroup.selectAll('.tick text').attr('dx', '-3em'); // Move the x-axis labels a bit to the left

  g.append('g').call(yAxis).attr('stroke', colors.primary);


 // Add the title
 const titleText = g
   .append('text')
   .attr('id', 'chart-title')
   .text(CONFIG.title)
   .attr('x', width / 2)
   .attr('y', -margin.top * CONFIG.title.yOffset)
   .attr('text-anchor', 'middle')
   .attr('fill', colors.primary)
   .attr('font-size', CONFIG.title.fontSize)
   .attr('font-weight', 'bold');

  // Define the line generator for the yield curve using the x and y scales
  const line = d3.line().x((d) => xScale(d.time)).y((d) => yScale(d.rate)).curve(d3.curveMonotoneX);

  // Add a path element for the primary yield curve
  const primaryPath = g.append('path')
    .attr('fill', 'none')
    .attr('stroke', colors.primary)
    .attr('stroke-opacity', 1)
    .attr('stroke-width', 3)
    .style('cursor', 'pointer')
    .on('mouseover', function() {
      d3.select(this).attr('stroke-width', 4);
    })
    .on('mousemove', function(event) {
      const [mouseX] = d3.pointer(event, g.node());
      const hoveredTime = xScale.domain().find((d) => {
        const bandWidth = xScale.bandwidth();
        const x = xScale(d);
        return mouseX >= x && mouseX <= x + bandWidth;
      });

      if (hoveredTime && data[dataIndex]) {
        const yieldData = data[dataIndex].yields.find(y => y.time === hoveredTime);
        if (yieldData) {
          tooltip
            .style('opacity', 1)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .html(`
              <div class="tooltip-title">${hoveredTime} (Current)</div>
              <div class="tooltip-content">
                <span>Rate:</span><span>${yieldData.rate.toFixed(2)}%</span>
                <span>Date:</span><span>${data[dataIndex].date.toLocaleDateString()}</span>
              </div>
            `);
        }
      }
    })
    .on('mouseout', function() {
      d3.select(this).attr('stroke-width', 3);
      tooltip.style('opacity', 0);
    });

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

  // Add a text element to display the current date
  const dateDisplay = g
    .append('text')
    .attr('id', 'date-display-svg')
    .attr('x', CONFIG.dateDisplay.x)
    .attr('y', CONFIG.dateDisplay.y)
    .attr('font-size', CONFIG.dateDisplay.fontSize)
    .attr('font-weight', 'bold')
    .attr('fill', colors.primary);

  // Add tooltips
  const tooltip = d3.select('#tooltip');
  let hoveredTraceIndex = null;

  // Create a highlight path that will show the full curve when hovering
  const highlightPath = g.append('path')
    .attr('fill', 'none')
    .attr('stroke', '#FFD700')
    .attr('stroke-width', 2)
    .attr('opacity', 0)
    .attr('pointer-events', 'none');

  let dataIndex = 0;
  let isPlaying = false;
  let animationTimeoutId = null;

  function updatePath(immediate = false) {
    const currentData = data[dataIndex].yields;

    // Update the date display
    dateDisplay.text(data[dataIndex].date.toLocaleDateString());

    // Call the frame update callback
    if (onFrameUpdate) {
      onFrameUpdate(dataIndex);
    }

    // Add a trace line for the previous data points
    if (dataIndex > 0) {
      const traceIndex = dataIndex;
      const tracePath = traceGroup
        .append('path')
        .datum(currentData)
        .attr('class', 'trace-line')
        .attr('data-index', traceIndex)
        .attr('fill', 'none')
        .attr('stroke', colorScale(traceIndex))
        .attr('stroke-opacity', colors.traceOpacity)
        .attr('stroke-width', 1)
        .attr('d', line)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          // Highlight this trace
          hoveredTraceIndex = traceIndex;
          d3.select(this)
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1);

          // Show highlight curve
          highlightPath
            .datum(currentData)
            .attr('d', line)
            .attr('opacity', 0.6);

          // Show tooltip with this trace's data
          const traceDate = data[traceIndex].date;
          tooltip
            .style('opacity', 1)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .html(`
              <div class="tooltip-title">Historical Curve</div>
              <div class="tooltip-content">
                <span>Date:</span><span>${traceDate.toLocaleDateString()}</span>
                <span>Hover over points for rates</span><span></span>
              </div>
            `);
        })
        .on('mousemove', function(event) {
          const [mouseX] = d3.pointer(event, g.node());
          const hoveredTime = xScale.domain().find((d) => {
            const bandWidth = xScale.bandwidth();
            const x = xScale(d);
            return mouseX >= x && mouseX <= x + bandWidth;
          });

          if (hoveredTime && data[traceIndex]) {
            const yieldData = data[traceIndex].yields.find(y => y.time === hoveredTime);
            if (yieldData) {
              tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .html(`
                  <div class="tooltip-title">${hoveredTime}</div>
                  <div class="tooltip-content">
                    <span>Rate:</span><span>${yieldData.rate.toFixed(2)}%</span>
                    <span>Date:</span><span>${data[traceIndex].date.toLocaleDateString()}</span>
                  </div>
                `);
            }
          }
        })
        .on('mouseout', function() {
          hoveredTraceIndex = null;
          d3.select(this)
            .attr('stroke-width', 1)
            .attr('stroke-opacity', colors.traceOpacity);

          highlightPath.attr('opacity', 0);
          tooltip.style('opacity', 0);
        });

      tracePath.lower(); // Move the trace line below the primary line
    }

    const duration = immediate ? 0 : animationDuration;

    primaryPath
      .datum(currentData)
      .transition()
      .duration(duration)
      .attr('d', line)
      .on('end', () => {
        if (isPlaying) {
          dataIndex = (dataIndex + 1) % data.length;
          updatePath();
        }
      });
  }

  // Control object to expose to external code
  const control = {
    play: function() {
      if (!isPlaying) {
        isPlaying = true;
        updatePath();
      }
    },

    pause: function() {
      isPlaying = false;
      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
      }
    },

    seekTo: function(index) {
      if (index >= 0 && index < data.length) {
        dataIndex = index;

        // Clear all trace lines
        traceGroup.selectAll('path').remove();

        // Redraw trace lines up to current index with hover functionality
        for (let i = 1; i <= dataIndex; i++) {
          const traceIndex = i;
          const tracePath = traceGroup
            .append('path')
            .datum(data[i].yields)
            .attr('class', 'trace-line')
            .attr('data-index', traceIndex)
            .attr('fill', 'none')
            .attr('stroke', colorScale(i))
            .attr('stroke-opacity', colors.traceOpacity)
            .attr('stroke-width', 1)
            .attr('d', line)
            .style('cursor', 'pointer')
            .on('mouseover', function(event) {
              hoveredTraceIndex = traceIndex;
              d3.select(this)
                .attr('stroke-width', 3)
                .attr('stroke-opacity', 1);

              highlightPath
                .datum(data[traceIndex].yields)
                .attr('d', line)
                .attr('opacity', 0.6);

              const traceDate = data[traceIndex].date;
              tooltip
                .style('opacity', 1)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .html(`
                  <div class="tooltip-title">Historical Curve</div>
                  <div class="tooltip-content">
                    <span>Date:</span><span>${traceDate.toLocaleDateString()}</span>
                    <span>Hover over points for rates</span><span></span>
                  </div>
                `);
            })
            .on('mousemove', function(event) {
              const [mouseX] = d3.pointer(event, g.node());
              const hoveredTime = xScale.domain().find((d) => {
                const bandWidth = xScale.bandwidth();
                const x = xScale(d);
                return mouseX >= x && mouseX <= x + bandWidth;
              });

              if (hoveredTime && data[traceIndex]) {
                const yieldData = data[traceIndex].yields.find(y => y.time === hoveredTime);
                if (yieldData) {
                  tooltip
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px')
                    .html(`
                      <div class="tooltip-title">${hoveredTime}</div>
                      <div class="tooltip-content">
                        <span>Rate:</span><span>${yieldData.rate.toFixed(2)}%</span>
                        <span>Date:</span><span>${data[traceIndex].date.toLocaleDateString()}</span>
                      </div>
                    `);
                }
              }
            })
            .on('mouseout', function() {
              hoveredTraceIndex = null;
              d3.select(this)
                .attr('stroke-width', 1)
                .attr('stroke-opacity', colors.traceOpacity);

              highlightPath.attr('opacity', 0);
              tooltip.style('opacity', 0);
            });

          tracePath.lower();
        }

        // Update the primary path immediately
        const currentData = data[dataIndex].yields;
        dateDisplay.text(data[dataIndex].date.toLocaleDateString());

        primaryPath
          .datum(currentData)
          .attr('d', line);

        // Call the frame update callback
        if (onFrameUpdate) {
          onFrameUpdate(dataIndex);
        }
      }
    },

    getCurrentIndex: function() {
      return dataIndex;
    },

    isPlaying: function() {
      return isPlaying;
    }
  };

  // Store control globally for app.js
  window.visualizationControl = control;

  return control;
}