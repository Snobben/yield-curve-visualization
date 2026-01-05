// Treasury Data Service
// Handles fetching data from both local CSV and Treasury API

class TreasuryDataService {
  constructor() {
    this.cache = new Map();
    this.apiBaseUrl = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml';
  }

  /**
   * Load data from local CSV file
   * @param {string} csvPath - Path to CSV file
   * @returns {Promise<Array>} Formatted yield data
   */
  async loadFromCSV(csvPath) {
    const cacheKey = `csv:${csvPath}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      console.log('Loading from cache:', cacheKey);
      return this.cache.get(cacheKey);
    }

    try {
      const parsedData = await d3.csv(csvPath);

      if (!parsedData || parsedData.length === 0) {
        throw new Error('No data loaded from CSV file');
      }

      const formattedData = this.formatCSVData(parsedData);

      // Cache the result
      this.cache.set(cacheKey, formattedData);

      return formattedData;
    } catch (error) {
      console.error('Error loading CSV:', error);
      throw error;
    }
  }

  /**
   * Load data from Treasury API
   * @param {number} year - Year to fetch data for
   * @returns {Promise<Array>} Formatted yield data
   */
  async loadFromAPI(year) {
    const cacheKey = `api:${year}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      console.log('Loading from cache:', cacheKey);
      return this.cache.get(cacheKey);
    }

    try {
      const url = `${this.apiBaseUrl}?data=daily_treasury_yield_curve&field_tdr_date_value=${year}`;

      console.log('Fetching from Treasury API:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();
      const formattedData = this.parseXMLData(xmlText);

      if (formattedData.length === 0) {
        throw new Error(`No data available for year ${year}`);
      }

      // Cache the result
      this.cache.set(cacheKey, formattedData);

      return formattedData;
    } catch (error) {
      console.error('Error loading from API:', error);
      throw error;
    }
  }

  /**
   * Load data for a date range from Treasury API
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Formatted yield data
   */
  async loadDateRange(startDate, endDate) {
    const years = new Set();
    const currentYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    for (let year = currentYear; year <= endYear; year++) {
      years.add(year);
    }

    try {
      // Fetch data for all years in parallel
      const promises = Array.from(years).map(year => this.loadFromAPI(year));
      const results = await Promise.all(promises);

      // Flatten and filter by date range
      const allData = results.flat();
      const filtered = allData.filter(item => {
        return item.date >= startDate && item.date <= endDate;
      });

      // Sort by date
      filtered.sort((a, b) => a.date - b.date);

      return filtered;
    } catch (error) {
      console.error('Error loading date range:', error);
      throw error;
    }
  }

  /**
   * Format CSV data into standard format
   * @param {Array} parsedData - Raw CSV data from D3
   * @returns {Array} Formatted yield data
   */
  formatCSVData(parsedData) {
    return parsedData.map((row) => {
      const date = new Date(row.Date);

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date found: ${row.Date}`);
      }

      const yields = Object.entries(row)
        .filter(([key]) => key !== 'Date')
        .map(([time, rate]) => {
          const parsedRate = parseFloat(rate);
          if (isNaN(parsedRate)) {
            throw new Error(`Invalid rate found for ${time}: ${rate}`);
          }
          return { time, rate: parsedRate };
        });

      if (yields.length === 0) {
        throw new Error('No yield data found in row');
      }

      return { date, yields };
    });
  }

  /**
   * Parse XML data from Treasury API
   * @param {string} xmlText - Raw XML response
   * @returns {Array} Formatted yield data
   */
  parseXMLData(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Failed to parse XML data');
    }

    const entries = xmlDoc.querySelectorAll('entry');
    const data = [];

    // Map of XML field names to our time labels
    const fieldMap = {
      'BC_1MONTH': '1 Mo',
      'BC_2MONTH': '2 Mo',
      'BC_3MONTH': '3 Mo',
      'BC_6MONTH': '6 Mo',
      'BC_1YEAR': '1 Yr',
      'BC_2YEAR': '2 Yr',
      'BC_3YEAR': '3 Yr',
      'BC_5YEAR': '5 Yr',
      'BC_7YEAR': '7 Yr',
      'BC_10YEAR': '10 Yr',
      'BC_20YEAR': '20 Yr',
      'BC_30YEAR': '30 Yr'
    };

    entries.forEach(entry => {
      const dateElement = entry.querySelector('NEW_DATE');
      if (!dateElement) return;

      const dateStr = dateElement.textContent;
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        console.warn('Invalid date in XML:', dateStr);
        return;
      }

      const yields = [];

      Object.entries(fieldMap).forEach(([xmlField, timeLabel]) => {
        const element = entry.querySelector(xmlField);
        if (element && element.textContent) {
          const rate = parseFloat(element.textContent);
          if (!isNaN(rate)) {
            yields.push({ time: timeLabel, rate });
          }
        }
      });

      if (yields.length > 0) {
        data.push({ date, yields });
      }
    });

    // Sort by date (newest first from API, so reverse)
    data.sort((a, b) => a.date - b.date);

    return data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Export for use in main script
window.TreasuryDataService = TreasuryDataService;
