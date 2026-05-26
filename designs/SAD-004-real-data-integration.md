# SAD-004: Real Data Integration for Adaptive Quiz

## 1. Overview

### 1.1 Purpose
This document describes the integration of real-world statistical data from public APIs and datasets to replace hardcoded question weights with data-driven values. This enhancement will improve the accuracy and credibility of the nationality inference system.

### 1.2 Scope
- Integration with public statistical APIs (World Bank, REST Countries, etc.)
- Automated data collection and normalization
- Question weight generation from real data
- Periodic data refresh mechanism
- Fallback strategies for API failures

### 1.3 Goals
1. **Accuracy**: Use real statistical data instead of estimates
2. **Transparency**: Document all data sources and methodologies
3. **Maintainability**: Automated data collection with minimal manual intervention
4. **Reliability**: Graceful degradation when APIs are unavailable
5. **Subtlety**: Questions remain indirect and culturally sensitive

## 2. System Architecture

### 2.1 Data Collection Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Collection Layer                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  World Bank  │  │ REST Countries│  │   ICO Data   │      │
│  │     API      │  │     API       │  │   (Coffee)   │      │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘      │
│         │                  │                   │              │
│         └──────────────────┼───────────────────┘              │
│                            │                                  │
│                   ┌────────▼────────┐                         │
│                   │ API Integration │                         │
│                   │    Manager      │                         │
│                   └────────┬────────┘                         │
│                            │                                  │
│                   ┌────────▼────────┐                         │
│                   │  Data Cache &   │                         │
│                   │  Normalization  │                         │
│                   └────────┬────────┘                         │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                  Weight Generation Layer                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Question Weight Generator                     │   │
│  │  - Maps raw data to question answers                  │   │
│  │  - Calculates country-specific weights (0-100)        │   │
│  │  - Validates probability distributions                │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│            ┌────────▼────────┐                                │
│            │  Enhanced       │                                │
│            │  Question Bank  │                                │
│            └─────────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Sources

#### Primary Sources
1. **World Bank Open Data API**
   - Transport statistics (vehicle ownership, public transport usage)
   - Economic indicators
   - Demographics
   - URL: `https://api.worldbank.org/v2`

2. **REST Countries API**
   - Country metadata
   - Geographic information
   - Languages and currencies
   - URL: `https://restcountries.com/v3.1`

3. **International Coffee Organization (ICO)**
   - Coffee consumption per capita
   - Production statistics
   - URL: Public datasets

4. **Tea & Infusions Europe**
   - Tea consumption statistics
   - Regional preferences

5. **Sports Federation Data**
   - FIFA membership and participation
   - Olympic participation rates
   - Regional sports popularity

#### Height Data Sources
1. **NCD Risk Factor Collaboration (2016)**
   - Peer-reviewed height data by country
   - Age and sex-specific measurements
   - Source: Published research paper

2. **National Health Agencies**
   - CDC (US), NHS (UK), etc.
   - Most recent national health surveys
   - Age-stratified data

### 2.3 Question Categories and Data Mapping

#### Food Preferences
- **Data Source**: Google Trends, Cultural Surveys, Food Atlas
- **Questions**: 12 questions about favorite foods
- **Mapping**: Consumption rates → country weights
- **Example**: Pizza consumption in Italy (high) vs Japan (low)

#### Beverage Preferences
- **Data Source**: ICO, Tea Europe, WHO
- **Questions**: 7 questions about coffee, tea, other beverages
- **Mapping**: Per capita consumption → preference weights
- **Example**: Coffee consumption: Finland (12kg/year) vs China (0.1kg/year)

#### Sports Preferences
- **Data Source**: FIFA, Olympic Committee, Sports Federations
- **Questions**: 7 questions about favorite sports
- **Mapping**: Participation rates + viewership → popularity weights
- **Example**: Cricket popularity: India (high) vs USA (low)

#### Transport Preferences
- **Data Source**: World Bank, OECD Transport Statistics
- **Questions**: 1 question about primary transport
- **Mapping**: Modal split data → transport weights
- **Example**: Bicycle usage: Netherlands (27%) vs USA (1%)

#### Climate Preferences
- **Data Source**: Köppen Climate Classification, Weather Data
- **Questions**: 3 questions about weather preferences
- **Mapping**: Actual climate zones → preference weights
- **Example**: Cold climate preference: Norway (high) vs Thailand (low)

#### Lifestyle & Work Style
- **Data Source**: OECD Better Life Index, Census Data
- **Questions**: 8 lifestyle + 3 work style questions
- **Mapping**: Survey data → lifestyle weights
- **Example**: Work-life balance: Denmark (high) vs Japan (low)

#### Entertainment
- **Data Source**: Streaming services, Box office data
- **Questions**: 7 questions about entertainment preferences
- **Mapping**: Consumption patterns → preference weights
- **Example**: Anime popularity: Japan (high) vs Brazil (medium)

## 3. Data Collection Process

### 3.1 Bulk API Fetching

```javascript
// Efficient bulk fetching for all countries
async fetchAllCountries() {
  // Single API call for all countries
  const response = await axios.get('https://restcountries.com/v3.1/all');
  return response.data;
}

async fetchWorldBankData(indicator) {
  // Bulk fetch for all countries
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}`;
  const response = await axios.get(url, {
    params: { format: 'json', per_page: 500 }
  });
  return response.data;
}
```

### 3.2 Data Normalization

All raw data is normalized to a 0-100 scale for consistency:

```javascript
normalizeToScale(value, min, max, scale = 100) {
  if (max === min) return scale / 2;
  return ((value - min) / (max - min)) * scale;
}
```

### 3.3 Caching Strategy

- **In-Memory Cache**: Store fetched data for current session
- **File Cache**: Save to JSON for offline use
- **TTL**: 30 days for statistical data
- **Fallback**: Use cached data if API fails

### 3.4 Rate Limiting

- **Delay**: 1 second between API calls
- **Bulk Requests**: Prefer single calls for all countries
- **Retry Logic**: Exponential backoff for failures
- **Respect Limits**: Follow API rate limit guidelines

## 4. Weight Generation Algorithm

### 4.1 Direct Mapping

For questions with direct statistical correlation:

```javascript
// Example: Coffee consumption
const coffeeData = await fetchCoffeeConsumption();
// Returns: { FI: 12.0, NO: 9.9, US: 4.5, CN: 0.1, ... }

// Map to question: "Do you drink coffee daily?"
const weights = {
  yes: {
    FI: 95,  // Very high consumption
    NO: 90,
    US: 70,
    CN: 20   // Very low consumption
  },
  no: {
    FI: 5,
    NO: 10,
    US: 30,
    CN: 80
  }
};
```

### 4.2 Inverse Correlation

For questions with inverse relationships:

```javascript
// Example: "Do you prefer tea over coffee?"
const teaWeight = teaConsumption[country];
const coffeeWeight = coffeeConsumption[country];
const ratio = teaWeight / (teaWeight + coffeeWeight);

weights.yes[country] = ratio * 100;
weights.no[country] = (1 - ratio) * 100;
```

### 4.3 Composite Indicators

For questions requiring multiple data sources:

```javascript
// Example: "Do you commute by bicycle?"
const bikeUsage = await fetchBicycleUsage();
const infrastructure = await fetchBikeInfrastructure();
const climate = await fetchClimateData();

// Weighted combination
weights[country] = (
  bikeUsage[country] * 0.6 +
  infrastructure[country] * 0.3 +
  climateSuitability[country] * 0.1
);
```

### 4.4 Cultural Adjustments

Some questions require cultural context beyond raw statistics:

```javascript
// Example: "Do you enjoy spicy food?"
const spiceConsumption = await fetchSpiceData();
const culturalFactor = getCulturalSpiceFactor(country);

weights[country] = spiceConsumption[country] * culturalFactor;
```

## 5. Question Design Principles

### 5.1 Subtlety Requirements

Questions must NOT:
- Directly ask about nationality ("What country are you from?")
- Ask about ethnicity or race
- Ask about height directly ("Are you tall?")
- Use stereotypes or offensive assumptions

Questions SHOULD:
- Ask about preferences and behaviors
- Use neutral, everyday language
- Have multiple plausible answers for any nationality
- Be culturally sensitive

### 5.2 Statistical Discrimination

Each question should provide meaningful discrimination between countries:

```javascript
// Good question: High variance across countries
"Do you drink coffee daily?"
- Finland: 95% yes
- China: 20% yes
- Variance: High ✓

// Poor question: Low variance
"Do you breathe air?"
- All countries: 100% yes
- Variance: None ✗
```

### 5.3 Multi-Section Strategy

#### Section 1: Nationality Identification (Dynamic)
- **Goal**: Reach 90% confidence in nationality
- **Max Questions**: 15
- **Strategy**: High information gain questions first
- **Termination**: When confidence ≥ 90% OR max reached

#### Section 2: Height Deviation (Dynamic)
- **Goal**: Reach 85% confidence in height category
- **Max Questions**: 10
- **Strategy**: Height-correlated questions
- **Termination**: When confidence ≥ 85% OR max reached

**Total Max**: 25 questions (no hard limit, but practical maximum)

### 5.4 Confidence Tracking

Track confidence for all 4 attributes:
- **Nationality**: 20 countries
- **Sex**: 2 categories (male, female)
- **Age Group**: 4 categories (child, teen, adult, senior)
- **Height Deviation**: 5 categories (way_below, below, average, above, way_above)

## 6. Implementation Plan

### 6.1 Phase 1: Data Collection Infrastructure
- [x] Create APIIntegrationManager class
- [x] Implement bulk API fetching methods
- [x] Add caching and rate limiting
- [ ] Create fallback data structure
- [ ] Test API integrations

### 6.2 Phase 2: Weight Generation
- [ ] Create weight generation script
- [ ] Map each question to data sources
- [ ] Generate weights for all 73 questions
- [ ] Validate probability distributions
- [ ] Compare with hardcoded weights

### 6.3 Phase 3: Integration
- [ ] Update question-bank-enhanced.json with real weights
- [ ] Update country-statistics.json with real data
- [ ] Test inference accuracy
- [ ] Deploy to production

### 6.4 Phase 4: Maintenance
- [ ] Create automated refresh script
- [ ] Set up monthly data updates
- [ ] Monitor API availability
- [ ] Track inference accuracy metrics

## 7. Data Quality Assurance

### 7.1 Validation Rules

1. **Probability Distributions**: All answer weights for a country must sum to reasonable values
2. **Coverage**: All 20 countries must have weights for each question
3. **Variance**: Questions must show meaningful variance across countries
4. **Consistency**: Related questions should have correlated weights

### 7.2 Testing Strategy

```javascript
// Test 1: Probability sum
for (const question of questions) {
  for (const country of countries) {
    const sum = sumWeights(question, country);
    assert(sum >= 90 && sum <= 110, 'Weights should sum to ~100');
  }
}

// Test 2: Variance check
for (const question of questions) {
  const variance = calculateVariance(question);
  assert(variance > 100, 'Question should discriminate between countries');
}

// Test 3: Known cases
assert(coffeeQuestion.yes.FI > 90, 'Finland should love coffee');
assert(coffeeQuestion.yes.CN < 30, 'China should prefer tea');
```

### 7.3 Fallback Strategy

If API data is unavailable:
1. Use cached data from previous successful fetch
2. Use curated fallback data (current hardcoded weights)
3. Log warning and continue with degraded accuracy
4. Never fail the quiz due to data unavailability

## 8. Privacy and Ethics

### 8.1 Data Privacy
- No personal data collected from APIs
- Only aggregate statistical data used
- No user tracking or profiling
- All data is public domain

### 8.2 Cultural Sensitivity
- Avoid stereotypes in question design
- Use neutral language
- Respect cultural differences
- No offensive or discriminatory content

### 8.3 Transparency
- Document all data sources
- Explain methodology in README
- Provide confidence scores to users
- Allow users to see how inference works

## 9. Success Metrics

### 9.1 Accuracy Metrics
- **Nationality Accuracy**: % of correct nationality predictions
- **Height Accuracy**: Mean absolute error in cm
- **Confidence Calibration**: Correlation between confidence and accuracy

### 9.2 User Experience Metrics
- **Question Count**: Average questions to reach confidence thresholds
- **Completion Rate**: % of users who complete the quiz
- **Satisfaction**: User feedback on question quality

### 9.3 System Metrics
- **API Availability**: % uptime of data sources
- **Cache Hit Rate**: % of requests served from cache
- **Data Freshness**: Age of statistical data

## 10. Future Enhancements

### 10.1 Additional Data Sources
- Google Trends API (real-time search trends)
- Social media analytics (cultural preferences)
- E-commerce data (purchasing patterns)
- Streaming service data (entertainment preferences)

### 10.2 Machine Learning
- Train models on real quiz responses
- Improve weight accuracy over time
- Detect new cultural patterns
- Personalize question selection

### 10.3 Expanded Coverage
- Add more countries (50+ total)
- Add regional variations (US states, UK regions)
- Add more demographic attributes
- Improve age and sex inference

## 11. References

### 11.1 Data Sources
- World Bank Open Data: https://data.worldbank.org/
- REST Countries API: https://restcountries.com/
- NCD Risk Factor Collaboration: https://www.ncdrisc.org/
- OECD Statistics: https://stats.oecd.org/

### 11.2 Research Papers
- "A century of trends in adult human height" (NCD-RisC, 2016)
- "Global dietary patterns and nutrition transition" (WHO, 2020)
- "Transport modal split in OECD countries" (ITF, 2021)

### 11.3 Technical Documentation
- Bayesian Inference: https://en.wikipedia.org/wiki/Bayesian_inference
- Information Theory: https://en.wikipedia.org/wiki/Information_gain
- Statistical Normalization: https://en.wikipedia.org/wiki/Normalization_(statistics)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-24  
**Author**: Bob (AI Software Engineer)  
**Status**: Draft