# Brent Crude Oil Futures Curve Visualization

An animated visualization of Brent crude oil futures curves over time, similar to the treasury yield curve visualization, showing the term structure of futures prices and how it evolves through different market conditions.

## Features

- **Animated Futures Curve**: Watch how the Brent futures curve evolves over time
- **Curve Shape Indicator**: Automatically identifies Contango (upward sloping) vs Backwardation (downward sloping)
- **Historical Traces**: See previous curves fading in the background with color-coded timeline
- **Flexible Data Sources**: Switch between static CSV data and Bloomberg API
- **Professional Styling**: Clean black background with color gradients showing time progression

## Files

- `brent-futures.html` - Main HTML page
- `brent-futures-visualization.js` - Visualization logic with dual data source support
- `brent_futures_curve.csv` - Sample static data (2023-2025)

## Quick Start (Static Data - FREE)

1. Open `brent-futures.html` in a web browser
2. The visualization will automatically load data from `brent_futures_curve.csv`
3. Watch the futures curve animate through time

That's it! No configuration needed for the static version.

## Understanding the Visualization

### Futures Curve Basics

The futures curve shows prices for Brent crude oil contracts with different delivery dates:
- **M1** = Front month (nearest delivery)
- **M2** = Second month
- **M3** = Third month
- **M6** = Six months out
- **M12** = Twelve months out
- **M24** = Twenty-four months out
- **M36** = Thirty-six months out

### Curve Shapes

**Contango** (Green indicator)
- Curve slopes upward (future prices > spot price)
- Common in stable markets with adequate supply
- Indicates storage costs and carrying charges
- Normal market structure

**Backwardation** (Red indicator)
- Curve slopes downward (future prices < spot price)
- Common during supply disruptions or high demand
- Indicates immediate scarcity or market stress
- Inverted market structure

### Reading the Chart

- **White line**: Current futures curve
- **Colored traces**: Historical curves (purple = oldest, yellow = newest)
- **X-axis**: Contract months (M1, M2, M3, etc.)
- **Y-axis**: Price in USD per barrel
- **Date display**: Top right corner shows current date
- **Curve shape**: Top right shows whether market is in Contango or Backwardation

## Advanced: Bloomberg API Integration (DORMANT)

The visualization includes complete Bloomberg API integration code that is dormant by default. This allows you to fetch real-time or historical Brent futures data directly from Bloomberg Terminal or Bloomberg Market Data services.

### Prerequisites

- Bloomberg Terminal subscription OR Bloomberg SAPI/HTTP API access
- Node.js environment (if using blpapi package)
- Bloomberg credentials and network access

### Activation Steps

#### Option A: Bloomberg Node.js API (blpapi package)

1. **Install Bloomberg API package**:
   ```bash
   npm install blpapi
   ```

2. **Configure settings** in `brent-futures-visualization.js`:
   ```javascript
   const CONFIG = {
     dataSource: 'bloomberg',  // Change from 'csv' to 'bloomberg'
     bloomberg: {
       host: 'localhost',       // Your Bloomberg API host
       port: 8194,              // Your Bloomberg API port
       contracts: [
         'COH26 Comdty',        // Customize your contracts
         'COJ26 Comdty',
         'COK26 Comdty',
         // Add more...
       ],
       fields: ['PX_LAST', 'PX_SETTLE', 'VOLUME']
     }
   };
   ```

3. **Uncomment the blpapi implementation** in the `loadDataFromBloomberg()` function (lines marked "OPTION 1")

4. **Run in Node.js environment** (requires backend server to handle Bloomberg connection)

#### Option B: Bloomberg HTTP API

1. **Set up Bloomberg HTTP API service** (requires Bloomberg infrastructure)

2. **Configure HTTP endpoint** in `brent-futures-visualization.js`:
   ```javascript
   const CONFIG = {
     dataSource: 'bloomberg',
     bloomberg: {
       httpApiUrl: 'https://your-bloomberg-http-api-host/request',
       // ... other settings
     }
   };
   ```

3. **Uncomment the HTTP API implementation** in the `loadDataFromBloomberg()` function (lines marked "OPTION 2")

4. **Can run in browser** (if CORS is properly configured)

### Bloomberg Contract Ticker Format

Brent crude futures use the format: `CO{Month}{Year} Comdty`

**Month Codes**:
- F = January
- G = February
- H = March
- J = April
- K = May
- M = June
- N = July
- Q = August
- U = September
- V = October
- X = November
- Z = December

**Examples**:
- `COH26 Comdty` = Brent Crude March 2026
- `COZ25 Comdty` = Brent Crude December 2025
- `COM26 Comdty` = Brent Crude June 2026

### Available Bloomberg Fields

Common fields for futures data:
- `PX_LAST` - Last price
- `PX_SETTLE` - Settlement price
- `PX_OPEN` - Opening price
- `PX_HIGH` - High price
- `PX_LOW` - Low price
- `VOLUME` - Trading volume
- `OPEN_INT` - Open interest

### Switching Between Data Sources

Simply change the `dataSource` configuration:

```javascript
// Use static CSV (default - FREE)
const CONFIG = {
  dataSource: 'csv',
  // ...
};

// Use Bloomberg API (requires subscription)
const CONFIG = {
  dataSource: 'bloomberg',
  // ...
};
```

## Data Format

### CSV Format (Static Data)

```csv
Date,M1,M2,M3,M6,M12,M18,M24,M36
2023-01-01,85.50,84.80,84.20,82.50,80.00,78.50,77.00,75.00
2023-02-01,83.20,82.90,82.50,81.20,79.50,78.20,76.80,75.20
...
```

Each row represents:
- **Date**: Date of the snapshot
- **M1-M36**: Prices for contracts at different maturities

### Internal Data Structure

After loading, data is formatted as:
```javascript
[
  {
    date: Date object,
    prices: [
      { contract: 'M1', price: 85.50, monthsOut: 1 },
      { contract: 'M2', price: 84.80, monthsOut: 2 },
      // ...
    ]
  },
  // ...
]
```

## Customization

### Adjust Animation Speed

In `brent-futures-visualization.js`, change the duration:
```javascript
.transition()
.duration(200)  // milliseconds per frame (lower = faster)
```

### Modify Time Range

Edit the CSV file or adjust Bloomberg API date range:
```javascript
const startDate = new Date();
startDate.setFullYear(startDate.getFullYear() - 2); // 2 years of history
```

### Change Visual Style

Colors, fonts, and dimensions can be customized in the `createVisualization()` function:
- Background: `.style('background-color', 'black')`
- Curve colors: `colorScale` variable
- Dimensions: `width`, `height`, `margin` variables

## Troubleshooting

### Visualization not loading
- Check browser console for errors (F12)
- Ensure D3.js library loads correctly
- Verify CSV file is in the same directory

### Bloomberg API not working
- Verify Bloomberg Terminal/SAPI is running
- Check host and port configuration
- Ensure correct contract ticker format
- Review Bloomberg API credentials and permissions
- Check console logs for specific error messages

### Data format errors
- Ensure CSV dates are in YYYY-MM-DD format
- Verify all price values are valid numbers
- Check that all rows have the same number of columns

## Resources

### Documentation
- [D3.js Documentation](https://d3js.org/)
- [Bloomberg API Library](https://www.bloomberg.com/professional/support/api-library/)
- [Bloomberg blpapi-node GitHub](https://github.com/bloomberg/blpapi-node)
- [Bloomberg HTTP API Guide](https://github.com/bloomberg/blpapi-http)

### Learning Resources
- [Understanding Contango and Backwardation](https://www.investopedia.com/terms/c/contango.asp)
- [Crude Oil Futures Trading](https://www.cmegroup.com/education/courses/introduction-to-crude-oil.html)
- [ICE Brent Futures Contract Specs](https://www.ice.com/products/219/Brent-Crude-Futures)

## License

This visualization is provided as-is for educational and personal use. Bloomberg data access requires appropriate licensing from Bloomberg L.P.

## Comparison to Treasury Yield Curve

| Feature | Treasury Yields | Brent Futures |
|---------|----------------|---------------|
| **Data Source** | Free (U.S. Treasury) | Proprietary (requires licensing) |
| **X-axis** | Maturity (3M, 6M, 1Y, etc.) | Contract Month (M1, M2, M3, etc.) |
| **Y-axis** | Yield (%) | Price ($/barrel) |
| **Curve Shapes** | Normal, Inverted, Flat | Contango, Backwardation, Flat |
| **Indicates** | Interest rate expectations | Supply/demand dynamics |
| **Free API** | ✅ Yes (Treasury.gov) | ❌ No (commercial only) |

## Next Steps

1. **For static use**: Enjoy the visualization with the included sample data
2. **For real data**: Consider using a free trial from Oil Price API to populate CSV with recent data
3. **For Bloomberg users**: Follow activation steps above to connect to live Bloomberg data
4. **For developers**: Extend the code to add features like date range selection, contract comparison, or export functionality

## Questions or Issues?

See the main research document `BRENT_FUTURES_API_RESEARCH.md` for detailed information about data sources and API options.
