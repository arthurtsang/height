# Data Sources for Country Statistics

This document describes the data sources used for collecting country statistics and how to update them.

## Overview

The height prediction quiz uses real-world statistical data to infer nationality through cultural preferences. This data should be updated regularly (quarterly recommended) to maintain accuracy.

## Data Categories

### 1. Height Data

**Primary Sources:**
- **NCD Risk Factor Collaboration** (2016 study)
  - URL: http://ncdrisc.org/
  - Most comprehensive global height study
  - Data for 200+ countries
  - Peer-reviewed and published in The Lancet

- **WHO Global Health Observatory**
  - URL: https://www.who.int/data/gho
  - API: https://ghoapi.azureedge.net/api/
  - Regular updates from member states

- **National Health Agencies**
  - CDC (US): https://www.cdc.gov/nchs/nhanes/
  - NHS (UK): https://digital.nhs.uk/
  - Statistics Canada: https://www.statcan.gc.ca/
  - Each country's health ministry

**Update Frequency:** Annually (height data changes slowly)

**How to Access:**
```bash
# WHO API example
curl "https://ghoapi.azureedge.net/api/WHOSIS_000001" # Mean BMI (related to height)

# For specific countries, check national health agency websites
# Most publish annual health surveys
```

### 2. Food Preferences

**Primary Sources:**

- **Google Trends**
  - URL: https://trends.google.com/
  - API: https://trends.google.com/trends/api (unofficial)
  - Search interest by country for food terms
  - Real-time data

- **World Food Atlas**
  - URL: https://www.tasteatlas.com/
  - Curated data on traditional foods by country
  - Community-driven ratings

- **National Dietary Surveys**
  - USDA Food Surveys (US)
  - EFSA Food Consumption Database (EU)
  - Country-specific nutrition surveys

**Update Frequency:** Quarterly (food trends change seasonally)

**How to Access:**
```javascript
// Google Trends (using pytrends or unofficial API)
// Example: Compare "pizza" vs "noodles" vs "tacos" by country

// Pseudo-code for Google Trends
const trends = await googleTrends.interestByRegion({
  keyword: ['pizza', 'noodles', 'tacos', 'curry', 'burgers'],
  startTime: new Date('2023-01-01'),
  endTime: new Date('2024-01-01'),
  geo: 'US' // Country code
});
```

**Alternative Approach:**
- Food delivery platform APIs (UberEats, DoorDash) - if available
- Restaurant review platforms (Yelp, TripAdvisor)
- Social media food hashtag analysis

### 3. Sports Preferences

**Primary Sources:**

- **International Sports Federations**
  - FIFA: https://www.fifa.com/
  - IOC: https://olympics.com/
  - NBA, NFL, MLB (US sports)
  - Each sport's governing body

- **Nielsen Sports**
  - URL: https://nielsensports.com/
  - Viewership and participation data
  - Some public reports available

- **Google Trends**
  - Search interest for sports by country
  - Seasonal patterns

**Update Frequency:** Annually (after major sporting events)

**How to Access:**
```bash
# FIFA rankings and participation data
curl "https://www.fifa.com/fifa-world-ranking/ranking-table/men/"

# Olympic medal counts (proxy for sport popularity)
curl "https://olympics.com/en/olympic-games/tokyo-2020/medals"

# Google Trends for sports interest
```

### 4. Climate Preferences

**Primary Sources:**

- **Köppen Climate Classification**
  - URL: http://koeppen-geiger.vu-wien.ac.at/
  - Scientific climate zones
  - Stable data (updates every 10 years)

- **World Bank Climate Data**
  - URL: https://data.worldbank.org/
  - API: https://api.worldbank.org/v2/
  - Temperature, precipitation data

- **Population Distribution**
  - Where people actually live within countries
  - Urban vs rural preferences

**Update Frequency:** Every 5 years (climate data is stable)

**How to Access:**
```bash
# World Bank API - Average temperature
curl "https://api.worldbank.org/v2/country/US/indicator/AG.LND.PRCP.MM?format=json"

# Population density by climate zone
# Combine with census data
```

### 5. Beverage Preferences

**Primary Sources:**

- **International Coffee Organization**
  - URL: https://www.ico.org/
  - Coffee consumption by country
  - Annual reports

- **Tea & Infusions Organization**
  - URL: https://www.teaandinfusions.org/
  - Tea consumption statistics

- **Euromonitor International**
  - URL: https://www.euromonitor.com/
  - Beverage market research
  - Some free reports

- **Google Trends**
  - Search interest for beverages

**Update Frequency:** Annually

**How to Access:**
```bash
# Check annual reports from beverage organizations
# Most publish free summary statistics

# Google Trends for "coffee" vs "tea" by country
```

### 6. Transportation Preferences

**Primary Sources:**

- **OECD Transport Statistics**
  - URL: https://data.oecd.org/transport/
  - API: https://stats.oecd.org/restsdmx/sdmx.ashx/
  - Modal split data (car, public transit, bike, walk)

- **World Bank Transport Data**
  - URL: https://data.worldbank.org/topic/transport
  - API: https://api.worldbank.org/v2/
  - Vehicle ownership, infrastructure

- **National Transportation Surveys**
  - US: National Household Travel Survey
  - EU: Eurostat transport statistics
  - Each country's transport ministry

**Update Frequency:** Every 2-3 years

**How to Access:**
```bash
# OECD API - Passenger transport
curl "https://stats.oecd.org/restsdmx/sdmx.ashx/GetData/ITF_PASSENGER_TRANSPORT/USA.TOTAL.PASS_KM/all?format=json"

# World Bank - Vehicles per capita
curl "https://api.worldbank.org/v2/country/US/indicator/IS.VEH.PCAR.P3?format=json"
```

### 7. Work Style Preferences

**Primary Sources:**

- **OECD Better Life Index**
  - URL: https://www.oecdbetterlifeindex.org/
  - Work-life balance indicators
  - Annual updates

- **Remote Work Statistics**
  - Buffer State of Remote Work
  - GitLab Remote Work Report
  - National labor statistics

- **LinkedIn Workforce Reports**
  - URL: https://economicgraph.linkedin.com/
  - Job market trends by country

**Update Frequency:** Annually (more frequent post-COVID)

**How to Access:**
```bash
# OECD Better Life Index data
# Available as downloadable datasets

# National labor force surveys
# Check each country's statistics office
```

### 8. Housing Preferences

**Primary Sources:**

- **National Census Data**
  - US Census: https://data.census.gov/
  - Eurostat: https://ec.europa.eu/eurostat
  - Each country's census bureau

- **OECD Housing Statistics**
  - URL: https://data.oecd.org/housing/
  - Dwelling types, ownership rates

- **UN Habitat**
  - URL: https://unhabitat.org/
  - Global housing data

**Update Frequency:** Every 5-10 years (census cycles)

**How to Access:**
```bash
# US Census API - Housing units
curl "https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N&for=state:*"

# OECD housing data
# Available as downloadable datasets
```

## Data Collection Script

### Setup

```bash
cd backend/scripts
npm install axios cheerio dotenv
```

### Usage

```bash
# Collect data for all countries
node collect-country-statistics.js

# Collect data for specific country
node collect-country-statistics.js --country=US

# Specify output path
node collect-country-statistics.js --output=./custom-output.json
```

### Environment Variables

Create a `.env` file in the `backend/scripts` directory:

```env
# Google Trends (if using unofficial API)
GOOGLE_TRENDS_API_KEY=your_key_here

# World Bank API (no key required, but rate limited)
WORLD_BANK_API_URL=https://api.worldbank.org/v2

# OECD API (no key required)
OECD_API_URL=https://stats.oecd.org/restsdmx/sdmx.ashx

# WHO API (no key required)
WHO_API_URL=https://ghoapi.azureedge.net/api
```

## Data Validation

The collection script automatically validates:

1. **Probability Distributions**: All category probabilities must sum to 1.0 (±0.01)
2. **Required Fields**: Country code, name, height data
3. **Data Ranges**: Heights within reasonable ranges (140-210cm)
4. **Completeness**: All categories present for each country

## Manual Data Updates

If APIs are unavailable, you can manually update data:

1. Research current statistics from official sources
2. Update `backend/src/data/country-statistics.json`
3. Run validation:
   ```bash
   node collect-country-statistics.js --validate-only
   ```

## Data Quality Guidelines

### Minimum Standards

- **Source Credibility**: Use government agencies, international organizations, peer-reviewed studies
- **Recency**: Data should be from last 5 years (height data can be older)
- **Sample Size**: Prefer sources with large, representative samples
- **Methodology**: Transparent data collection methods

### Red Flags

- ❌ Data from single blog posts or unverified sources
- ❌ Stereotypes or assumptions without data backing
- ❌ Outdated data (>10 years old for most categories)
- ❌ Small sample sizes (<1000 respondents)

## API Rate Limits

Be respectful of API rate limits:

- **Google Trends**: ~100 requests/hour (unofficial)
- **World Bank**: No official limit, but use delays
- **OECD**: No official limit, but use delays
- **WHO**: No official limit, but use delays

The collection script includes 2-second delays between countries.

## Contributing New Data Sources

To add a new data source:

1. Add source to `DATA_SOURCES.md` (this file)
2. Implement fetcher function in `collect-country-statistics.js`
3. Add validation rules
4. Update tests
5. Document API keys/credentials needed

## Troubleshooting

### "No data available for country X"

- Check if country is in supported list
- Verify API endpoints are accessible
- Check for API key issues
- Use fallback data temporarily

### "Probabilities don't sum to 1.0"

- Script will auto-normalize
- Check for missing categories
- Verify source data quality

### "API rate limit exceeded"

- Increase delay between requests
- Use cached data
- Spread collection over multiple days

## Legal & Ethical Considerations

### Data Usage Rights

- ✅ Public domain data (government statistics)
- ✅ Creative Commons licensed data
- ✅ APIs with terms allowing commercial use
- ❌ Copyrighted data without permission
- ❌ Scraped data violating ToS

### Privacy

- Only use aggregated, anonymized data
- No individual-level data
- No PII (Personally Identifiable Information)

### Bias Mitigation

- Use diverse data sources
- Avoid stereotyping
- Regular bias audits
- User feedback mechanism

## Update Schedule

Recommended update frequency:

| Category | Frequency | Reason |
|----------|-----------|--------|
| Height | Annually | Slow changes |
| Food | Quarterly | Seasonal trends |
| Sports | Annually | After major events |
| Climate | Every 5 years | Stable data |
| Beverage | Annually | Market changes |
| Transport | Every 2-3 years | Infrastructure changes |
| Work Style | Annually | Rapid changes (post-COVID) |
| Housing | Every 5-10 years | Census cycles |

## Resources

### Useful Tools

- **pytrends**: Python library for Google Trends
  - https://github.com/GeneralMills/pytrends

- **World Bank API Client**
  - https://github.com/mledoze/countries

- **REST Countries API**
  - https://restcountries.com/

### Learning Resources

- OECD Data Portal: https://data.oecd.org/
- World Bank Open Data: https://data.worldbank.org/
- UN Data: http://data.un.org/
- Google Dataset Search: https://datasetsearch.research.google.com/

## Support

For questions or issues with data collection:

1. Check this documentation
2. Review script logs for errors
3. Verify API endpoints are accessible
4. Open an issue with details

---

**Last Updated**: 2026-05-24  
**Maintainer**: Development Team  
**Version**: 1.0.0