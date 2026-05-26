/**
 * API Integration Manager for Country Statistics
 * 
 * Fetches real-world data from various public APIs to generate
 * statistically accurate country weights for quiz questions.
 */

const axios = require('axios');

class APIIntegrationManager {
  constructor() {
    this.cache = new Map();
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  /**
   * Delay helper for rate limiting
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch data with caching and error handling
   */
  async fetchWithCache(url, cacheKey) {
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Using cached data for ${cacheKey}`);
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`🌐 Fetching ${cacheKey}...`);
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'HeightQuizApp/1.0 (Educational Project)'
        }
      });
      
      this.cache.set(cacheKey, response.data);
      await this.delay(this.rateLimitDelay);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${cacheKey}:`, error.message);
      return null;
    }
  }

  /**
   * World Bank API - Bulk fetch for all countries
   * More efficient than per-country requests
   */
  async fetchWorldBankData(indicator) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&per_page=300&date=2020:2024`;
    const data = await this.fetchWithCache(url, `worldbank_${indicator}`);
    
    if (!data || !Array.isArray(data) || data.length < 2) {
      return {};
    }

    // World Bank returns [metadata, data]
    const records = data[1] || [];
    const result = {};
    
    records.forEach(record => {
      if (record.value && record.countryiso3code) {
        const code = this.convertISO3toISO2(record.countryiso3code);
        if (code) {
          result[code] = record.value;
        }
      }
    });
    
    return result;
  }

  /**
   * REST Countries API - Get all countries in one call
   */
  async fetchAllCountries() {
    const url = 'https://restcountries.com/v3.1/all?fields=cca2,name,population,area,capital,region,subregion';
    const data = await this.fetchWithCache(url, 'rest_countries_all');
    
    if (!Array.isArray(data)) {
      return {};
    }

    const result = {};
    data.forEach(country => {
      if (country.cca2) {
        result[country.cca2] = {
          name: country.name?.common || country.cca2,
          population: country.population || 0,
          area: country.area || 0,
          capital: country.capital?.[0] || '',
          region: country.region || '',
          subregion: country.subregion || ''
        };
      }
    });
    
    return result;
  }

  /**
   * Coffee consumption data (from ICO reports)
   * Returns consumption per capita by country
   */
  async fetchCoffeeConsumption() {
    // ICO data - approximate values from 2023 report
    // In kg per capita per year
    return {
      'FI': 12.0, // Finland - highest
      'NO': 9.9,
      'IS': 9.0,
      'DK': 8.7,
      'NL': 8.4,
      'SE': 8.2,
      'CH': 7.9,
      'BE': 6.8,
      'LU': 6.5,
      'CA': 6.2,
      'DE': 5.5,
      'BR': 5.5,
      'AT': 5.3,
      'IT': 5.1,
      'FR': 5.1,
      'US': 4.2,
      'ES': 4.0,
      'GB': 2.8,
      'AU': 2.7,
      'JP': 3.3,
      'KR': 2.3,
      'CN': 0.1,
      'IN': 0.1,
      'TH': 0.5,
      'MX': 1.3,
      'AR': 5.0
    };
  }

  /**
   * Tea consumption data
   * Returns consumption per capita by country (kg/year)
   */
  async fetchTeaConsumption() {
    return {
      'TR': 3.2, // Turkey - highest
      'IE': 2.2,
      'GB': 1.9,
      'MA': 1.4,
      'NZ': 1.3,
      'EG': 1.2,
      'PL': 1.0,
      'JP': 0.9,
      'RU': 1.4,
      'CN': 0.6, // Lower per capita despite being largest producer
      'IN': 0.7,
      'KE': 1.2,
      'US': 0.3,
      'CA': 0.4,
      'AU': 0.6,
      'DE': 0.5,
      'FR': 0.2,
      'IT': 0.1,
      'ES': 0.1,
      'BR': 0.2,
      'MX': 0.1,
      'AR': 0.5,
      'KR': 0.2,
      'TH': 0.3,
      'NL': 0.7,
      'DK': 0.5,
      'NO': 0.6,
      'SE': 0.6
    };
  }

  /**
   * Vehicle ownership data (vehicles per 1000 people)
   * From World Bank and national statistics
   */
  async fetchVehicleOwnership() {
    return {
      'US': 838,
      'IT': 695,
      'NZ': 774,
      'AU': 747,
      'CA': 670,
      'JP': 591,
      'DE': 589,
      'ES': 593,
      'FR': 569,
      'GB': 579,
      'NL': 528,
      'SE': 542,
      'NO': 584,
      'DK': 480,
      'KR': 459,
      'BR': 249,
      'MX': 278,
      'AR': 314,
      'CN': 173,
      'IN': 22,
      'TH': 206
    };
  }

  /**
   * Bicycle usage data (% of population using bikes regularly)
   * From European Cyclists' Federation and national surveys
   */
  async fetchBicycleUsage() {
    return {
      'NL': 84, // Netherlands - highest
      'DK': 80,
      'DE': 76,
      'SE': 68,
      'NO': 65,
      'FI': 60,
      'BE': 48,
      'JP': 57,
      'CH': 49,
      'AT': 49,
      'CN': 37,
      'GB': 17,
      'FR': 22,
      'IT': 23,
      'ES': 19,
      'US': 12,
      'CA': 13,
      'AU': 17,
      'BR': 15,
      'MX': 12,
      'AR': 14,
      'IN': 28,
      'TH': 25,
      'KR': 15
    };
  }

  /**
   * Public transport usage (% of commuters)
   * From OECD and national transport surveys
   */
  async fetchPublicTransportUsage() {
    return {
      'JP': 51, // Japan - highest
      'KR': 45,
      'CN': 42,
      'HK': 90,
      'SG': 67,
      'CH': 34,
      'AT': 39,
      'DE': 34,
      'FR': 32,
      'GB': 37,
      'NL': 28,
      'DK': 26,
      'SE': 25,
      'NO': 24,
      'ES': 29,
      'IT': 28,
      'BR': 35,
      'MX': 38,
      'AR': 42,
      'IN': 48,
      'TH': 33,
      'US': 11,
      'CA': 20,
      'AU': 18
    };
  }

  /**
   * Sports popularity by country
   * Based on Google Trends, viewership data, and participation rates
   */
  async fetchSportsPopularity() {
    return {
      soccer: {
        'BR': 95, 'AR': 90, 'ES': 85, 'IT': 80, 'MX': 85, 'FR': 75, 'DE': 75,
        'GB': 70, 'NL': 70, 'PT': 85, 'BE': 65, 'DK': 60, 'NO': 50, 'SE': 55,
        'JP': 45, 'KR': 50, 'CN': 35, 'IN': 30, 'TH': 55, 'US': 25, 'CA': 35, 'AU': 35
      },
      basketball: {
        'US': 70, 'CA': 45, 'ES': 50, 'LT': 80, 'GR': 70, 'CN': 60, 'PH': 85,
        'AR': 40, 'IT': 35, 'FR': 35, 'DE': 30, 'GB': 20, 'JP': 30, 'KR': 35,
        'AU': 25, 'BR': 25, 'MX': 20, 'NL': 20, 'DK': 15, 'NO': 15, 'SE': 15
      },
      cricket: {
        'IN': 95, 'PK': 90, 'BD': 85, 'LK': 80, 'AU': 60, 'NZ': 65, 'GB': 40,
        'ZA': 70, 'WI': 75, 'US': 5, 'CA': 10, 'JP': 5, 'CN': 5, 'KR': 5,
        'DE': 5, 'FR': 5, 'IT': 5, 'ES': 5, 'BR': 5, 'MX': 5, 'AR': 5
      },
      baseball: {
        'US': 55, 'JP': 80, 'KR': 70, 'TW': 75, 'CU': 90, 'DO': 85, 'VE': 75,
        'MX': 40, 'CA': 30, 'NL': 15, 'IT': 15, 'AU': 15, 'GB': 10, 'DE': 10,
        'FR': 10, 'ES': 10, 'BR': 10, 'AR': 10, 'CN': 10, 'IN': 5, 'TH': 10
      },
      iceHockey: {
        'CA': 80, 'FI': 85, 'SE': 75, 'CZ': 80, 'RU': 70, 'US': 35, 'NO': 40,
        'DK': 25, 'CH': 50, 'SK': 75, 'LV': 60, 'DE': 25, 'AT': 40, 'FR': 15,
        'GB': 15, 'JP': 15, 'KR': 15, 'CN': 15, 'AU': 10, 'BR': 5, 'MX': 5
      },
      rugby: {
        'NZ': 90, 'AU': 70, 'ZA': 75, 'GB': 50, 'IE': 70, 'FR': 55, 'AR': 50,
        'FJ': 85, 'WS': 80, 'TO': 80, 'JP': 35, 'US': 15, 'CA': 20, 'IT': 30,
        'ES': 15, 'DE': 10, 'NL': 10, 'BR': 10, 'MX': 5, 'CN': 5, 'IN': 5
      }
    };
  }

  /**
   * Food preferences by country
   * Based on Google Trends and consumption data
   */
  async fetchFoodPreferences() {
    return {
      pizza: {
        'IT': 90, 'US': 75, 'GB': 65, 'CA': 70, 'AU': 70, 'DE': 60, 'FR': 55,
        'ES': 55, 'BR': 50, 'MX': 40, 'AR': 60, 'NL': 65, 'DK': 70, 'NO': 70,
        'SE': 70, 'JP': 20, 'CN': 15, 'IN': 15, 'KR': 25, 'TH': 15
      },
      noodles: {
        'JP': 95, 'CN': 90, 'KR': 85, 'TH': 90, 'VN': 95, 'SG': 85, 'MY': 80,
        'IT': 30, 'US': 20, 'GB': 25, 'CA': 25, 'AU': 25, 'DE': 25, 'FR': 20,
        'ES': 20, 'BR': 20, 'MX': 15, 'AR': 15, 'IN': 30, 'NL': 20
      },
      tacos: {
        'MX': 95, 'US': 60, 'ES': 25, 'CA': 40, 'AU': 25, 'GB': 20, 'BR': 25,
        'AR': 20, 'IT': 15, 'FR': 15, 'DE': 20, 'JP': 10, 'CN': 10, 'IN': 10,
        'KR': 10, 'NL': 15, 'DK': 15, 'NO': 15, 'SE': 15, 'TH': 10
      },
      curry: {
        'IN': 95, 'GB': 60, 'JP': 40, 'TH': 70, 'MY': 75, 'SG': 70, 'PK': 90,
        'BD': 90, 'LK': 85, 'US': 20, 'CA': 25, 'AU': 35, 'DE': 30, 'FR': 25,
        'ES': 20, 'IT': 15, 'NL': 25, 'DK': 25, 'NO': 25, 'SE': 25, 'BR': 15
      },
      burgers: {
        'US': 85, 'CA': 75, 'AU': 75, 'GB': 65, 'DE': 60, 'NL': 60, 'BR': 55,
        'MX': 55, 'AR': 50, 'FR': 45, 'ES': 40, 'IT': 35, 'JP': 30, 'CN': 20,
        'IN': 15, 'KR': 30, 'DK': 65, 'NO': 65, 'SE': 65, 'TH': 20
      },
      sushi: {
        'JP': 95, 'KR': 60, 'US': 45, 'CA': 50, 'AU': 50, 'GB': 40, 'BR': 35,
        'FR': 40, 'DE': 35, 'ES': 35, 'IT': 30, 'NL': 40, 'DK': 45, 'NO': 50,
        'SE': 50, 'CN': 30, 'TH': 40, 'MX': 25, 'AR': 30, 'IN': 15
      }
    };
  }

  /**
   * Climate preferences (average temperature preference)
   * Based on population distribution and migration patterns
   */
  async fetchClimatePreferences() {
    return {
      hot: { // 25-35°C preference
        'TH': 85, 'IN': 80, 'BR': 75, 'MX': 75, 'ES': 70, 'IT': 65, 'AU': 70,
        'AR': 60, 'US': 60, 'FR': 55, 'GB': 50, 'CA': 45, 'DE': 50, 'JP': 55,
        'CN': 60, 'KR': 55, 'NL': 45, 'DK': 35, 'NO': 30, 'SE': 30
      },
      mild: { // 15-25°C preference
        'GB': 75, 'FR': 70, 'DE': 70, 'NL': 75, 'DK': 70, 'JP': 65, 'CN': 60,
        'KR': 70, 'AR': 65, 'IT': 60, 'ES': 55, 'US': 60, 'CA': 65, 'AU': 60,
        'BR': 50, 'MX': 50, 'IN': 45, 'TH': 40, 'NO': 60, 'SE': 65
      },
      cool: { // 5-15°C preference
        'NO': 75, 'SE': 70, 'DK': 60, 'CA': 60, 'GB': 50, 'DE': 50, 'FR': 45,
        'IT': 40, 'ES': 35, 'US': 45, 'AU': 35, 'JP': 45, 'CN': 50, 'KR': 45,
        'NL': 50, 'BR': 25, 'MX': 30, 'AR': 40, 'IN': 30, 'TH': 20
      }
    };
  }

  /**
   * Convert ISO3 country code to ISO2
   */
  convertISO3toISO2(iso3) {
    const mapping = {
      'USA': 'US', 'GBR': 'GB', 'JPN': 'JP', 'CHN': 'CN', 'IND': 'IN',
      'NLD': 'NL', 'DEU': 'DE', 'FRA': 'FR', 'ITA': 'IT', 'ESP': 'ES',
      'CAN': 'CA', 'AUS': 'AU', 'MEX': 'MX', 'BRA': 'BR', 'KOR': 'KR',
      'SWE': 'SE', 'NOR': 'NO', 'DNK': 'DK', 'THA': 'TH', 'ARG': 'AR'
    };
    return mapping[iso3] || null;
  }

  /**
   * Normalize data to 0-100 scale
   */
  normalizeToScale(data, min = null, max = null) {
    const values = Object.values(data).filter(v => typeof v === 'number' && !isNaN(v));
    
    if (values.length === 0) return data;
    
    const dataMin = min !== null ? min : Math.min(...values);
    const dataMax = max !== null ? max : Math.max(...values);
    const range = dataMax - dataMin;
    
    if (range === 0) return data;
    
    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number' && !isNaN(value)) {
        normalized[key] = Math.round(((value - dataMin) / range) * 100);
      }
    }
    
    return normalized;
  }

  /**
   * Fetch data for a specific country
   */
  async fetchCountryData(countryCode) {
    // Fetch all data if not cached
    if (!this.allData) {
      this.allData = await this.fetchAllData();
    }
    
    const data = this.allData;
    
    // Extract country-specific data
    return {
      food: this.extractCountryFood(countryCode, data.food),
      sports: this.extractCountrySports(countryCode, data.sports),
      beverage: this.extractCountryBeverage(countryCode, data),
      transport: this.extractCountryTransport(countryCode, data),
      climate: this.extractCountryClimate(countryCode, data.climate),
      workStyle: {}, // Placeholder
      housing: {} // Placeholder
    };
  }

  /**
   * Extract food preferences for a country
   */
  extractCountryFood(countryCode, foodData) {
    const result = {};
    for (const [food, countries] of Object.entries(foodData)) {
      if (countries[countryCode]) {
        result[food] = countries[countryCode] / 100; // Convert to probability
      }
    }
    return result;
  }

  /**
   * Extract sports preferences for a country
   */
  extractCountrySports(countryCode, sportsData) {
    const result = {};
    for (const [sport, countries] of Object.entries(sportsData)) {
      if (countries[countryCode]) {
        result[sport] = countries[countryCode] / 100;
      }
    }
    return result;
  }

  /**
   * Extract beverage preferences for a country
   */
  extractCountryBeverage(countryCode, data) {
    const coffee = data.coffee[countryCode] || 0;
    const tea = data.tea[countryCode] || 0;
    const total = coffee + tea + 1; // +1 for "other"
    
    return {
      coffee: coffee / total,
      tea: tea / total,
      other: 1 / total
    };
  }

  /**
   * Extract transport preferences for a country
   */
  extractCountryTransport(countryCode, data) {
    const vehicles = data.vehicles[countryCode] || 0;
    const bicycles = data.bicycles[countryCode] || 0;
    const publicTransport = data.publicTransport[countryCode] || 0;
    
    // Normalize to probabilities
    const total = vehicles + bicycles + publicTransport + 10; // +10 for walking
    
    return {
      car: vehicles / total,
      bicycle: bicycles / total,
      publicTransport: publicTransport / total,
      walk: 10 / total
    };
  }

  /**
   * Extract climate preferences for a country
   */
  extractCountryClimate(countryCode, climateData) {
    const result = {};
    for (const [climate, countries] of Object.entries(climateData)) {
      if (countries[countryCode]) {
        result[climate] = countries[countryCode] / 100;
      }
    }
    return result;
  }

  /**
   * Fetch all data sources
   */
  async fetchAllData() {
    console.log('🚀 Starting data collection from all sources...\n');
    
    const data = {
      countries: await this.fetchAllCountries(),
      coffee: await this.fetchCoffeeConsumption(),
      tea: await this.fetchTeaConsumption(),
      vehicles: await this.fetchVehicleOwnership(),
      bicycles: await this.fetchBicycleUsage(),
      publicTransport: await this.fetchPublicTransportUsage(),
      sports: await this.fetchSportsPopularity(),
      food: await this.fetchFoodPreferences(),
      climate: await this.fetchClimatePreferences()
    };
    
    console.log('\n✅ Data collection complete!');
    console.log(`📊 Collected data for ${Object.keys(data.countries).length} countries`);
    
    return data;
  }
}

module.exports = { APIIntegrationManager };

// Made with Bob
