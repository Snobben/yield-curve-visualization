// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Data source: 'csv' (static file) or 'bloomberg' (Bloomberg API)
  dataSource: 'csv',

  // CSV file configuration
  csvFile: 'brent_futures_curve.csv',

  // Bloomberg API configuration (dormant - requires Bloomberg Terminal/SAPI access)
  bloomberg: {
    // For Node.js backend using blpapi package:
    // npm install blpapi
    // Requires Bloomberg Terminal or SAPI subscription
    host: 'localhost',
    port: 8194,

    // For Bloomberg HTTP API:
    // Requires Bloomberg HTTP API service running
    httpApiUrl: 'https://your-bloomberg-http-api-host/request',

    // Brent futures contract tickers
    // Format: CO{Month}{Year} Comdty (e.g., COH26 Comdty = March 2026 Brent)
    // Month codes: F=Jan, G=Feb, H=Mar, J=Apr, K=May, M=Jun, N=Jul, Q=Aug, U=Sep, V=Oct, X=Nov, Z=Dec
    contracts: [
      'COH26 Comdty', // Front month example
      'COJ26 Comdty', // M2
      'COK26 Comdty', // M3
      // Add more contracts as needed
    ],

    // Fields to retrieve
    fields: ['PX_LAST', 'PX_SETTLE', 'VOLUME']
  }
};

// ============================================================================
// DATA LOADING FUNCTIONS
// ============================================================================

/**
 * Load data from static CSV file (DEFAULT - ACTIVE)
 */
async function loadDataFromCSV() {
  return d3.csv(CONFIG.csvFile).then((parsedData) => {
    // Convert the data into the desired format
    const formattedData = parsedData.map((row) => {
      const date = new Date(row.Date);
      // Extract the futures prices for different contract months
      const prices = Object.entries(row)
        .filter(([key, value]) => key !== 'Date')
        .map(([contract, price]) => ({
          contract,
          price: parseFloat(price),
          // Contract names: M1 = 1 month out, M2 = 2 months, etc.
          monthsOut: contract === 'M1' ? 1 : contract === 'M2' ? 2 :
                     contract === 'M3' ? 3 : contract === 'M6' ? 6 :
                     contract === 'M12' ? 12 : contract === 'M18' ? 18 :
                     contract === 'M24' ? 24 : contract === 'M36' ? 36 : 0
        }));
      // Combine the date and prices in a single object
      return { date, prices };
    });

    return formattedData;
  });
}

/**
 * Load data from Bloomberg API (DORMANT - requires configuration)
 *
 * USAGE INSTRUCTIONS:
 * 1. Set CONFIG.dataSource = 'bloomberg'
 * 2. Choose either Node.js (blpapi) or HTTP API approach below
 * 3. Configure your Bloomberg credentials/endpoints
 * 4. Install required dependencies (npm install blpapi OR set up HTTP API)
 * 5. Ensure Bloomberg Terminal or SAPI access is available
 */
async function loadDataFromBloomberg() {
  console.warn('Bloomberg API is configured but requires proper setup. See code comments for instructions.');

  // -------------------------------------------------------------------------
  // OPTION 1: Node.js Backend with blpapi package (requires Bloomberg Terminal/SAPI)
  // -------------------------------------------------------------------------
  /*
  // Uncomment this section for Node.js backend implementation
  // npm install blpapi

  const blpapi = require('blpapi');

  return new Promise((resolve, reject) => {
    const session = new blpapi.Session({
      host: CONFIG.bloomberg.host,
      port: CONFIG.bloomberg.port
    });

    session.on('SessionStarted', () => {
      console.log('Bloomberg session started');

      // Open reference data service
      session.openService('//blp/refdata', (err, svc) => {
        if (err) {
          reject(err);
          return;
        }

        // Create historical data request
        const request = svc.request('HistoricalDataRequest');

        // Add securities (futures contracts)
        CONFIG.bloomberg.contracts.forEach(contract => {
          request.append('securities', contract);
        });

        // Add fields
        CONFIG.bloomberg.fields.forEach(field => {
          request.append('fields', field);
        });

        // Set date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 2); // 2 years of history

        request.set('startDate', formatBloombergDate(startDate));
        request.set('endDate', formatBloombergDate(endDate));
        request.set('periodicitySelection', 'DAILY');

        // Send request
        session.request(request, (err, message) => {
          if (err) {
            reject(err);
            return;
          }

          // Process Bloomberg response
          const formattedData = processBloombergResponse(message);
          resolve(formattedData);

          session.stop();
        });
      });
    });

    session.on('SessionTerminated', () => {
      console.log('Bloomberg session terminated');
    });

    session.start();
  });
  */

  // -------------------------------------------------------------------------
  // OPTION 2: Bloomberg HTTP API (more modern, RESTful approach)
  // -------------------------------------------------------------------------
  /*
  // Uncomment this section for HTTP API implementation

  const response = await fetch(
    `${CONFIG.bloomberg.httpApiUrl}?ns=blp&service=refdata&type=HistoricalDataRequest`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        securities: CONFIG.bloomberg.contracts,
        fields: CONFIG.bloomberg.fields,
        startDate: formatBloombergDate(new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)),
        endDate: formatBloombergDate(new Date()),
        periodicitySelection: 'DAILY'
      })
    }
  );

  const data = await response.json();
  return processBloombergHttpResponse(data);
  */

  // Default: return empty array with warning
  console.error('Bloomberg API not configured. Please uncomment and configure one of the options above.');
  return [];
}

// -------------------------------------------------------------------------
// Bloomberg Helper Functions (DORMANT)
// -------------------------------------------------------------------------

/**
 * Format date for Bloomberg API (YYYYMMDD)
 */
function formatBloombergDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Process Bloomberg blpapi response (Node.js)
 */
function processBloombergResponse(message) {
  const formattedData = [];

  // Parse Bloomberg message structure
  // Note: Actual implementation depends on blpapi message format
  // This is a placeholder showing the expected structure

  /*
  message.forEach(element => {
    const securityData = element.element('securityData');
    const fieldData = securityData.element('fieldData');

    fieldData.forEach(dataPoint => {
      const date = new Date(dataPoint.get('date'));
      const prices = CONFIG.bloomberg.contracts.map((contract, idx) => ({
        contract: contract,
        price: dataPoint.get(CONFIG.bloomberg.fields[0]),
        monthsOut: idx + 1
      }));

      formattedData.push({ date, prices });
    });
  });
  */

  return formattedData;
}

/**
 * Process Bloomberg HTTP API response
 */
function processBloombergHttpResponse(data) {
  const formattedData = [];

  // Parse HTTP API response
  // Note: Actual implementation depends on response structure
  // This is a placeholder showing the expected structure

  /*
  if (data.data && Array.isArray(data.data)) {
    const dateMap = new Map();

    data.data.forEach(securityData => {
      const security = securityData.security;
      const fieldDataArray = securityData.fieldData || [];

      fieldDataArray.forEach(dataPoint => {
        const dateStr = dataPoint.date;
        const price = dataPoint[CONFIG.bloomberg.fields[0]];

        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, {
            date: new Date(dateStr),
            prices: []
          });
        }

        dateMap.get(dateStr).prices.push({
          contract: security,
          price: price,
          monthsOut: CONFIG.bloomberg.contracts.indexOf(security) + 1
        });
      });
    });

    formattedData = Array.from(dateMap.values())
      .sort((a, b) => a.date - b.date);
  }
  */

  return formattedData;
}

// ============================================================================
// MAIN DATA LOADER (routes to appropriate source)
// ============================================================================

async function loadData() {
  console.log(`Loading data from source: ${CONFIG.dataSource}`);

  switch (CONFIG.dataSource) {
    case 'csv':
      return loadDataFromCSV();
    case 'bloomberg':
      return loadDataFromBloomberg();
    default:
      console.error(`Unknown data source: ${CONFIG.dataSource}`);
      return loadDataFromCSV(); // Fallback to CSV
  }
}

// ============================================================================
// VISUALIZATION CODE
// ============================================================================

function createVisualization(data) {
  // Define the dimensions and margins for the visualization
  const width = 900;
  const height = 400;
  const margin = { top: 100, right: 60, bottom: 60, left: 60 };

  // Create an SVG element and set its dimensions and colour
  const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background-color', 'black');

  // Create a group element (g) and apply a translation to account for the margins
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Define the x-axis scale based on months out
  const xScale = d3.scaleBand()
    .domain(data[0].prices.map((d) => d.contract))
    .range([0, width - margin.left - margin.right])
    .padding(0.1);

  // Define the y-axis scale based on price range
  const yScale = d3.scaleLinear()
    .domain([
      d3.min(data, (d) => d3.min(d.prices, (p) => p.price)) * 0.95, // 5% below min
      d3.max(data, (d) => d3.max(d.prices, (p) => p.price)) * 1.05  // 5% above max
    ])
    .range([height - margin.top - margin.bottom, 0])
    .nice();

  // Create the x-axis and y-axis using the defined scales
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d => d)
    .tickSize(-height + margin.top + margin.bottom)
    .tickPadding(10);

  const yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => `$${d.toFixed(2)}`)
    .tickSize(-width + margin.left + margin.right)
    .tickPadding(10);

  // Add the x-axis and y-axis to the visualization with white text color
  const xAxisGroup = g
    .append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(xAxis)
    .attr('stroke', 'white');

  xAxisGroup.selectAll('.tick text')
    .attr('dx', '-1em')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  g.append('g')
    .call(yAxis)
    .attr('stroke', 'white');

  // Add the title
  const title = g
    .append('text')
    .text('Brent Crude Oil Futures Curve (2023-2025)')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '24px')
    .attr('font-weight', 'bold');

  // Add axis labels
  g.append('text')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', height - margin.top - margin.bottom + 50)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '14px')
    .text('Contract Month');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height - margin.top - margin.bottom) / 2)
    .attr('y', -45)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '14px')
    .text('Price (USD/barrel)');

  // Define the line generator for the futures curve
  const line = d3.line()
    .x((d) => xScale(d.contract) + xScale.bandwidth() / 2)
    .y((d) => yScale(d.price))
    .curve(d3.curveMonotoneX);

  // Add a path element for the primary futures curve
  const primaryPath = g.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-opacity', 1)
    .attr('stroke-width', 3);

  // Add a group element to contain the trace lines for previous data points
  const traceGroup = g.append('g');

  // Add a color scale for the trace lines
  const colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain([0, data.length - 1]);

  // Add a gradient colored rectangle
  const gradient = g.append('linearGradient')
    .attr('id', 'colorGradient')
    .attr('gradientUnits', 'objectBoundingBox')
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
  const gradientPosY = height - margin.bottom - gradientHeight - 40;

  g.append('rect')
    .attr('x', gradientPosX)
    .attr('y', gradientPosY)
    .attr('width', gradientWidth)
    .attr('height', gradientHeight)
    .attr('fill', 'url(#colorGradient)');

  // Add curve shape indicator
  const curveIndicator = g
    .append('text')
    .attr('x', width - margin.left - margin.right - 150)
    .attr('y', -50)
    .attr('font-size', '14px')
    .attr('font-weight', 'normal')
    .attr('fill', 'yellow');

  // Add a text element to display the current date
  const dateDisplay = g
    .append('text')
    .attr('x', width - margin.left - margin.right - 150)
    .attr('y', -30)
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .attr('fill', 'white');

  let dataIndex = 0;

  function updatePath() {
    const currentData = data[dataIndex].prices;

    // Update the date display
    dateDisplay.text(data[dataIndex].date.toLocaleDateString());

    // Determine curve shape (Contango vs Backwardation)
    const firstPrice = currentData[0].price;
    const lastPrice = currentData[currentData.length - 1].price;
    const curveShape = lastPrice > firstPrice ? 'Contango' :
                       lastPrice < firstPrice ? 'Backwardation' : 'Flat';
    const curveColor = curveShape === 'Contango' ? '#00ff00' :
                       curveShape === 'Backwardation' ? '#ff6b6b' : '#ffff00';

    curveIndicator
      .text(`Shape: ${curveShape}`)
      .attr('fill', curveColor);

    // Add a trace line for the previous data points
    if (dataIndex > 0) {
      const tracePath = traceGroup
        .append('path')
        .datum(currentData)
        .attr('fill', 'none')
        .attr('stroke', colorScale(dataIndex))
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1)
        .attr('d', line);

      tracePath.lower(); // Move the trace line below the primary line
    }

    primaryPath
      .datum(currentData)
      .transition()
      .duration(200)
      .attr('d', line)
      .on('end', () => {
        dataIndex = (dataIndex + 1) % data.length;
        updatePath();
      });
  }

  updatePath();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Load data and create visualization when page loads
loadData().then((data) => {
  if (data && data.length > 0) {
    console.log(`Loaded ${data.length} data points`);
    createVisualization(data);
  } else {
    console.error('No data loaded. Please check your data source configuration.');
  }
}).catch((error) => {
  console.error('Error loading data:', error);
});
