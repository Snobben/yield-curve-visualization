# Brent Crude Oil Futures API Research

## Executive Summary

Creating a Brent futures curve visualization similar to the treasury yield curve is **technically possible but challenging** due to data availability constraints. Unlike treasury yield data (which is freely available from government sources), Brent futures curve data with multiple contract maturities is **not freely available** from public APIs.

## Current Treasury Yield Implementation

The existing visualization uses:
- Static CSV file (`treasuries_cleaned.csv`) hosted locally
- D3.js for visualization
- Data format: Date + multiple maturity points (similar to what we'd need for futures curve)

## Available Data Sources for Brent Futures

### 1. Free/Government Sources (LIMITED - Spot Prices Only)

#### ✅ FRED API (Federal Reserve Economic Data)
- **URL**: https://fred.stlouisfed.org/series/DCOILBRENTEU
- **Data**: Brent spot prices (NOT futures curve)
- **Coverage**: 1987-05-20 to present
- **Frequency**: Daily
- **Cost**: FREE
- **API**: Yes, fully documented
- **Limitation**: Only spot prices, no futures contracts with different maturities
- **Use Case**: Good for historical price analysis, NOT suitable for futures curve visualization

#### ✅ EIA API (U.S. Energy Information Administration)
- **URL**: https://www.eia.gov/dnav/pet/hist/rbrted.htm
- **Data**: Europe Brent Spot Price FOB
- **Coverage**: May 20, 1987 to present
- **Cost**: FREE (U.S. government data)
- **API**: Yes, open data API available
- **Limitation**: Primarily spot prices, limited futures data
- **Use Case**: Historical spot price analysis

### 2. Commercial APIs (Spot Prices + Some Futures Data)

#### ⚠️ Oil Price API
- **URL**: https://www.oilpriceapi.com/
- **Brent Futures Endpoint**: https://www.oilpriceapi.com/brent-futures-api
- **Data**: ICE Brent futures with up to **96 contract months**
- **Update Frequency**: Every 5 minutes during market hours
- **Historical Data**: Back to 1976
- **Cost**: PAID (7-day free trial available)
- **API**: REST API with documentation
- **Use Case**: IDEAL for futures curve - provides actual curve with multiple maturities
- **Limitation**: Requires paid subscription after trial

#### ⚠️ Commodities API
- **URL**: https://commodities-api.com/
- **Data**: Real-time and historical commodity prices including Brent crude
- **Coverage**: Historical from Sep 20, 2021
- **Cost**: Free tier available with limits, paid plans for more features
- **API**: REST API
- **Limitation**: May not provide full futures curve with all contract maturities

#### ⚠️ Nasdaq Data Link (formerly Quandl)
- **URL**: https://data.nasdaq.com/
- **Data**: Various commodity data including continuous futures
- **API Access**: Requires free API key registration
- **Rate Limits**:
  - Anonymous: 20 calls/10min, 50 calls/day
  - With API key: 300 calls/10sec, 2,000 calls/10min, 50,000 calls/day
- **Cost**: Free data available, premium datasets require payment
- **Search**: https://data.nasdaq.com/search?filters=["Free"]
- **Use Case**: Worth exploring for free futures datasets
- **Limitation**: Availability of Brent futures curve data uncertain

#### ⚠️ API Ninjas
- **URL**: https://api-ninjas.com/api/commodityprice
- **Data**: Real-time commodity prices based on rolling futures contracts
- **Exchanges**: CME, NYMEX, etc.
- **Cost**: Free tier available
- **Limitation**: May not provide full term structure

### 3. Professional Data Providers (EXPENSIVE)

#### ❌ Databento
- **URL**: https://databento.com/datasets/IFEU.IMPACT
- **Data**: ICE Brent Crude Futures (BRN) - comprehensive data
- **Coverage**: Full futures curve from ICE iMpact feed
- **Cost**: $125 free credits, then **exchange fees start at $875/month**
- **Use Case**: Professional/institutional use only
- **Limitation**: Prohibitively expensive for personal projects

#### ❌ ICE Direct
- **URL**: https://www.ice.com/products/219/Brent-Crude-Futures/data
- **Data**: Official ICE Brent futures data
- **Cost**: Professional licensing required
- **Limitation**: Not accessible for individual/hobby projects

## Key Challenges for Futures Curve Visualization

### 1. **Futures Curve vs Spot Price**
- **Spot Price**: Single price point for immediate delivery
- **Futures Curve**: Multiple prices for contracts with different expiration dates (e.g., Feb 2026, Mar 2026, Apr 2026... up to 96 months out)
- **Treasury Analogy**: Similar to how treasury yields show rates for 1M, 3M, 6M, 1Y, 2Y, 5Y, 10Y, 30Y

### 2. **Data Structure Needed**
For a proper futures curve visualization, you need:
```
Date, Contract1_Price, Contract2_Price, Contract3_Price, ..., ContractN_Price
2026-01-05, 60.10, 60.50, 61.00, 61.30, ...
```
Where each contract represents a different expiration month.

### 3. **Free API Limitations**
Most free APIs provide:
- ✅ Spot prices (single point)
- ✅ Maybe front-month futures price
- ❌ NOT the full futures curve (all contract months)

## Recommendations

### Option A: Use Paid API for Real-Time Curve (Best Quality)
**Cost**: ~$30-100/month depending on provider
1. Use **Oil Price API** or similar commercial service
2. Fetch real-time futures curve data (all 96 contract months)
3. Build dynamic visualization like the treasury curve
4. **Pros**: Professional quality, real-time data, full curve
5. **Cons**: Monthly cost required

### Option B: Static Dataset Approach (Like Current Treasury Implementation)
**Cost**: FREE (one-time data collection)
1. Use free trial from Oil Price API or other service
2. Collect historical futures curve data for a specific period (e.g., 2023-2024)
3. Create a static CSV file similar to `treasuries_cleaned.csv`
4. Build visualization using this static data
5. **Pros**: FREE, works exactly like current treasury visualization
6. **Cons**: Data becomes stale, no real-time updates, limited historical period

### Option C: Hybrid - Free API + Manual Curve Construction
**Cost**: FREE
1. Use FRED or EIA API for spot prices
2. Manually collect futures curve snapshots from publicly available sources
3. Combine into a dataset for visualization
4. **Pros**: FREE
5. **Cons**: Labor-intensive, limited accuracy, not real-time

### Option D: Focus on Spot Price Trends (Simpler Alternative)
**Cost**: FREE
1. Use FRED or EIA API for historical Brent spot prices
2. Create a different visualization showing spot price trends over time
3. Not a "futures curve" but still interesting commodity visualization
4. **Pros**: FREE, easy to implement, reliable data source
5. **Cons**: Not a futures curve, different from treasury approach

## Conclusion

**For a true Brent futures curve visualization comparable to the treasury yield curve:**
- **Best realistic option**: Option B (Static Dataset using free trial data)
- **Professional option**: Option A (Paid API subscription)
- **Alternative**: Option D (Spot price visualization instead)

The fundamental challenge is that futures curve data (multiple contract months) is proprietary exchange data that requires licensing fees, unlike government treasury data which is freely available.

## Next Steps

Please decide which approach you'd like to pursue:
1. Would you be willing to use a paid API (~$30-100/month)?
2. Would you prefer to create a static visualization using trial data?
3. Would you like to pivot to a spot price trend visualization instead?
4. Should we explore Nasdaq Data Link more thoroughly for potentially free datasets?

## Sources

- [FRED Brent Crude Oil Data](https://fred.stlouisfed.org/series/DCOILBRENTEU)
- [EIA Brent Spot Prices](https://www.eia.gov/dnav/pet/hist/rbrted.htm)
- [Oil Price API - Brent Futures](https://www.oilpriceapi.com/brent-futures-api)
- [Commodities API](https://commodities-api.com/)
- [Nasdaq Data Link](https://data.nasdaq.com/)
- [API Ninjas Commodity Price API](https://api-ninjas.com/api/commodityprice)
- [Databento ICE Brent Futures](https://databento.com/datasets/IFEU.IMPACT/futures/BRN)
- [ICE Brent Futures Official](https://www.ice.com/products/219/Brent-Crude-Futures/data)
- [API for Commodity Data - Nasdaq](https://blog.data.nasdaq.com/api-for-commodity-data)
- [GitHub Oil Prices Dataset](https://github.com/datasets/oil-prices)
