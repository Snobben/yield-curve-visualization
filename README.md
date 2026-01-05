# Financial Curves Visualization 📊

Interactive visualizations of Treasury Yields and Crude Oil Futures curves, featuring animated time-series analysis of financial market data.

## 🌐 Live Demo

Visit the live GitHub Pages site: **[https://snobben.github.io/yield-curve-visualization/](https://snobben.github.io/yield-curve-visualization/)**

## ✨ Features

### 🏛️ Treasury Yield Curve
- Animated visualization of US Treasury yield curves throughout 2022
- Shows the relationship between bond maturity and interest rates
- Detects inverted curves that historically signal recession
- Data from official US Treasury sources

### 🛢️ Brent Crude Oil Futures Curve
- Evolution of Brent crude oil futures prices (2023-2025)
- Automatic detection of Contango vs Backwardation market structures
- Shows futures term structure across different contract months
- Optional Bloomberg API integration (dormant, ready to activate)

### 🎨 Design
- Beautiful gradient UI with glassmorphism effects
- Smooth tab switching between visualizations
- Responsive design for mobile and desktop
- Color-coded historical traces showing time progression
- Real-time curve shape indicators

## 🚀 Quick Start

### View Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/Snobben/yield-curve-visualization.git
   cd yield-curve-visualization
   ```

2. Open `index.html` in your web browser (no build process needed!)

3. Switch between tabs to explore different visualizations

### Deploy to GitHub Pages

This project is ready for GitHub Pages deployment:

1. Go to your repository settings on GitHub
2. Navigate to **Settings → Pages**
3. Under "Source", select **Deploy from a branch**
4. Select the **main** branch and **/ (root)** folder
5. Click Save
6. Your site will be live at `https://[username].github.io/[repository-name]/`

## 📁 Project Structure

```
yield-curve-visualization/
├── index.html                      # Main page with tab system (COMBINED)
├── treasuries_cleaned.csv          # Treasury yield data (2022)
├── brent_futures_curve.csv         # Brent futures data (2023-2025)
├── README.md                       # This file
│
├── Legacy/Individual Files:
├── index-treasury-original.html    # Original treasury-only page (backup)
├── brent-futures.html             # Standalone Brent visualization
├── brent-futures-visualization.js # Brent viz with Bloomberg API code
├── yield-curve-visualization.js   # Treasury viz script
│
└── Documentation:
    ├── BRENT_FUTURES_API_RESEARCH.md  # API research findings
    └── BRENT_FUTURES_README.md        # Brent visualization docs
```

## 📊 Data Sources

### Treasury Yields
- **Source**: US Department of the Treasury (treasury.gov)
- **Format**: CSV with daily yield curve snapshots
- **Free**: Yes, public government data
- **Coverage**: 2022 data included

### Brent Crude Futures
- **Current**: Sample/historical data (static CSV)
- **Bloomberg API**: Dormant code ready for activation (requires subscription)
- **Alternative APIs**: Research document included (see `BRENT_FUTURES_API_RESEARCH.md`)

## 🔧 Technical Details

### Built With
- **D3.js v6** - Data visualization library
- **Vanilla JavaScript** - No build tools required
- **CSS3** - Modern styling with animations
- **HTML5** - Semantic markup

### Key Features
- **Lazy Loading**: Visualizations only initialize when their tab is clicked
- **Animation Control**: Automatically pauses when switching tabs
- **Error Handling**: Graceful degradation if data files are missing
- **Responsive**: Works on all screen sizes

## 🔮 Bloomberg API Integration

The Brent futures visualization includes **dormant Bloomberg API code** that can be activated:

1. See `brent-futures-visualization.js` for implementation
2. Set `CONFIG.dataSource = 'bloomberg'`
3. Uncomment your preferred API method (Node.js or HTTP)
4. Configure credentials
5. Requires Bloomberg Terminal or SAPI subscription

**Full documentation**: See `BRENT_FUTURES_README.md`

## 📚 Documentation

- **[BRENT_FUTURES_API_RESEARCH.md](BRENT_FUTURES_API_RESEARCH.md)** - Comprehensive research on Brent futures APIs
- **[BRENT_FUTURES_README.md](BRENT_FUTURES_README.md)** - Complete guide to Brent visualization features

## 🎓 Understanding the Curves

### Treasury Yield Curve Shapes
- **Normal** (upward): Longer bonds have higher yields → healthy economy
- **Inverted** (downward): Short-term > long-term → recession warning
- **Flat**: Minimal difference → economic uncertainty

### Futures Curve Shapes
- **Contango** (upward): Future prices > spot → normal market, storage costs
- **Backwardation** (downward): Spot > futures → supply shortage, high demand
- **Flat**: Balanced market expectations

## 🤝 Contributing

Contributions are welcome! Some ideas:
- Add more financial instruments (gold, silver, other commodities)
- Implement date range selectors
- Add comparison overlays
- Real-time data updates via APIs
- Export functionality (CSV, PNG)

## 📄 License

This project is open source. Treasury data is public domain (US Government). Bloomberg data access requires appropriate licensing.

## 🙏 Credits

- Inspired by James Eagle's yield curve animations
- Built with [D3.js](https://d3js.org/)
- Treasury data from [US Department of the Treasury](https://www.treasury.gov/)

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Enjoy exploring the curves!** 📈📉 
