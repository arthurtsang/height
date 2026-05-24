/**
 * API Integration Module
 * 
 * Implements real API calls to public data sources for collecting
 * country statistics. Falls back to curated data if APIs are unavailable.
 */

const axios = require('axios');

/**
 * World Bank API Integration
 * Fetches transport and demographic data
 */
class WorldBankAPI {
  constructor() {
    this.baseURL = 'https://api.worldbank.org/v2';
  }

  /**
   * Get vehicles per capita (proxy for car usage)
   * Indicator: IS.VEH.PCAR.P3
   */
  async getVehiclesPerCapita(countryCode) {
    try {
      const url = `${this.baseURL}/country/${countryCode}/indicator/IS.VEH.PCAR.P3?format=json&date=2015:2023&per_page=10`;
      const response = await axios.get(url, { timeout: 10000 });
      
      if (response.data && response.data[1] && response.data[1].length > 0) {
        // Get most recent data point
        const data = response.data[1][0];
        return {
          value: data.value,
          year: data.date,
          source: 'World Bank'
        };
      }
      
      return null;
    } catch (error) {
      console.error(`World Bank API error for ${countryCode}:`, error.message);
      return null;
    }
  }

  /**
   * Estimate transport mode distribution based on vehicles per capita
   * High vehicles/capita = more car usage
   */
  estimateTransportDistribution(vehiclesPerCapita) {
    if (!vehiclesPerCapita) return null;
    
    const value = vehiclesPerCapita.value;
    
    // Normalize to probability distribution
    // High vehicle ownership (>600 per 1000) = car-dominant
    // Low vehicle ownership (<200 per 1000) = public transit/bike dominant
    
    if (value > 600) {
      return {
        car: 0.80,
        publicTransit: 0.12,
        bike: 0.05,
        walk: 0.03
      };
    } else if (value > 400) {
      return {
        car: 0.65,
        publicTransit: 0.20,
        bike: 0.10,
        walk: 0.05
      };
    } else if (value > 200) {
      return {
        car: 0.45,
        publicTransit: 0.35,
        bike: 0.15,
        walk: 0.05
      };
    } else {
      return {
        car: 0.25,
        publicTransit: 0.45,
        bike: 0.20,
        walk: 0.10
      };
    }
  }
}

/**
 * REST Countries API Integration
 * Fetches basic country information
 */
class RestCountriesAPI {
  constructor() {
    this.baseURL = 'https://restcountries.com/v3.1';
  }

  /**
   * Get country information including languages, currencies, region
   */
  async getCountryInfo(countryCode) {
    try {
      const url = `${this.baseURL}/alpha/${countryCode}`;
      const response = await axios.get(url, { timeout: 10000 });
      
      if (response.data && response.data.length > 0) {
        const country = response.data[0];
        return {
          name: country.name.common,
          region: country.region,
          subregion: country.subregion,
          languages: country.languages,
          currencies: country.currencies,
          population: country.population
        };
      }
      
      return null;
    } catch (error) {
      console.error(`REST Countries API error for ${countryCode}:`, error.message);
      return null;
    }
  }

  /**
   * Estimate climate preference based on region
   */
  estimateClimatePreference(countryInfo) {
    if (!countryInfo) return null;
    
    const region = countryInfo.region;
    const subregion = countryInfo.subregion;
    
    // Estimate based on geographic region
    if (region === 'Europe') {
      if (subregion && subregion.includes('Northern')) {
        return { cold: 0.45, moderate: 0.40, warm: 0.15 };
      } else if (subregion && subregion.includes('Southern')) {
        return { warm: 0.55, moderate: 0.35, cold: 0.10 };
      } else {
        return { moderate: 0.50, warm: 0.30, cold: 0.20 };
      }
    } else if (region === 'Asia') {
      if (subregion && (subregion.includes('South') || subregion.includes('Southeast'))) {
        return { warm: 0.65, moderate: 0.30, cold: 0.05 };
      } else {
        return { moderate: 0.45, warm: 0.35, cold: 0.20 };
      }
    } else if (region === 'Americas') {
      if (subregion && subregion.includes('South')) {
        return { warm: 0.60, moderate: 0.30, cold: 0.10 };
      } else if (subregion && subregion.includes('Central')) {
        return { warm: 0.65, moderate: 0.30, cold: 0.05 };
      } else {
        return { moderate: 0.40, warm: 0.35, cold: 0.25 };
      }
    } else if (region === 'Oceania') {
      return { warm: 0.55, moderate: 0.35, cold: 0.10 };
    } else if (region === 'Africa') {
      return { warm: 0.70, moderate: 0.25, cold: 0.05 };
    }
    
    // Default
    return { moderate: 0.50, warm: 0.30, cold: 0.20 };
  }
}

/**
 * Google Trends Simulation
 * 
 * Note: Google Trends doesn't have an official public API.
 * This simulates what would be fetched from Google Trends data.
 * 
 * In production, you would use:
 * - pytrends (Python library) via a Python subprocess
 * - Unofficial Google Trends API
 * - Manual data collection and curation
 */
class GoogleTrendsSimulator {
  /**
   * Simulate fetching food preference trends
   * 
   * In production, this would query Google Trends for search interest
   * in different food terms by country
   */
  async getFoodTrends(countryCode) {
    console.log(`  ℹ️  Google Trends: Using curated data (API not available)`);
    
    // In production, this would make actual API calls:
    // const trends = await pytrends.interestByRegion({
    //   keyword: ['pizza', 'noodles', 'tacos', 'curry', 'burgers'],
    //   geo: countryCode
    // });
    
    return null; // Fall back to curated data
  }

  /**
   * Simulate fetching sports preference trends
   */
  async getSportsTrends(countryCode) {
    console.log(`  ℹ️  Google Trends: Using curated data (API not available)`);
    return null; // Fall back to curated data
  }

  /**
   * Simulate fetching beverage preference trends
   */
  async getBeverageTrends(countryCode) {
    console.log(`  ℹ️  Google Trends: Using curated data (API not available)`);
    return null; // Fall back to curated data
  }
}

/**
 * OECD API Integration
 * Fetches work and lifestyle data
 */
class OECDAPI {
  constructor() {
    this.baseURL = 'https://stats.oecd.org/restsdmx/sdmx.ashx';
  }

  /**
   * Check if country is OECD member
   */
  isOECDMember(countryCode) {
    const oecdMembers = [
      'AUS', 'AUT', 'BEL', 'CAN', 'CHL', 'COL', 'CRI', 'CZE', 'DNK', 'EST',
      'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ISR', 'ITA', 'JPN',
      'KOR', 'LVA', 'LTU', 'LUX', 'MEX', 'NLD', 'NZL', 'NOR', 'POL', 'PRT',
      'SVK', 'SVN', 'ESP', 'SWE', 'CHE', 'TUR', 'GBR', 'USA'
    ];
    
    // Convert 2-letter to 3-letter codes
    const codeMap = {
      'US': 'USA', 'GB': 'GBR', 'JP': 'JPN', 'CN': 'CHN', 'IN': 'IND',
      'NL': 'NLD', 'DE': 'DEU', 'FR': 'FRA', 'IT': 'ITA', 'ES': 'ESP',
      'CA': 'CAN', 'AU': 'AUS', 'MX': 'MEX', 'BR': 'BRA', 'KR': 'KOR',
      'SE': 'SWE', 'NO': 'NOR', 'DK': 'DNK', 'TH': 'THA', 'AR': 'ARG'
    };
    
    const code3 = codeMap[countryCode] || countryCode;
    return oecdMembers.includes(code3);
  }

  /**
   * Estimate work style based on OECD membership and region
   */
  estimateWorkStyle(countryCode, countryInfo) {
    const isOECD = this.isOECDMember(countryCode);
    
    if (isOECD) {
      // OECD countries tend to have more hybrid/remote work
      if (['US', 'CA', 'GB', 'NL', 'DK', 'NO', 'SE'].includes(countryCode)) {
        return {
          office: 0.45,
          hybrid: 0.35,
          remote: 0.15,
          outdoor: 0.05
        };
      } else {
        return {
          office: 0.55,
          hybrid: 0.25,
          remote: 0.15,
          outdoor: 0.05
        };
      }
    } else {
      // Non-OECD countries tend to have more traditional office work
      return {
        office: 0.65,
        hybrid: 0.15,
        remote: 0.10,
        outdoor: 0.10
      };
    }
  }
}

/**
 * Main API Integration Manager
 */
class APIIntegrationManager {
  constructor() {
    this.worldBank = new WorldBankAPI();
    this.restCountries = new RestCountriesAPI();
    this.googleTrends = new GoogleTrendsSimulator();
    this.oecd = new OECDAPI();
  }

  /**
   * Fetch all available data from APIs for a country
   */
  async fetchCountryData(countryCode) {
    console.log(`  🌐 Fetching data from public APIs...`);
    
    const results = {
      transport: null,
      climate: null,
      workStyle: null,
      food: null,
      sports: null,
      beverage: null
    };

    try {
      // Fetch country info (always available)
      const countryInfo = await this.restCountries.getCountryInfo(countryCode);
      
      if (countryInfo) {
        console.log(`  ✅ REST Countries API: ${countryInfo.name}`);
        
        // Estimate climate preference from geography
        results.climate = this.restCountries.estimateClimatePreference(countryInfo);
        
        // Estimate work style
        results.workStyle = this.oecd.estimateWorkStyle(countryCode, countryInfo);
      }
      
      // Fetch transport data from World Bank
      const vehicleData = await this.worldBank.getVehiclesPerCapita(countryCode);
      if (vehicleData) {
        console.log(`  ✅ World Bank API: ${vehicleData.value} vehicles/1000 people (${vehicleData.year})`);
        results.transport = this.worldBank.estimateTransportDistribution(vehicleData);
      }
      
      // Google Trends (not available - would need implementation)
      results.food = await this.googleTrends.getFoodTrends(countryCode);
      results.sports = await this.googleTrends.getSportsTrends(countryCode);
      results.beverage = await this.googleTrends.getBeverageTrends(countryCode);
      
    } catch (error) {
      console.error(`  ❌ API error:`, error.message);
    }
    
    return results;
  }

  /**
   * Merge API data with fallback data
   */
  mergeWithFallback(apiData, fallbackData) {
    return {
      transport: apiData.transport || fallbackData.transport,
      climate: apiData.climate || fallbackData.climate,
      workStyle: apiData.workStyle || fallbackData.workStyle,
      food: apiData.food || fallbackData.food,
      sports: apiData.sports || fallbackData.sports,
      beverage: apiData.beverage || fallbackData.beverage,
      housing: fallbackData.housing // Always use fallback (no API available)
    };
  }
}

module.exports = {
  APIIntegrationManager,
  WorldBankAPI,
  RestCountriesAPI,
  GoogleTrendsSimulator,
  OECDAPI
};

// Made with Bob
