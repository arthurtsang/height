# REQ-API-04: Real Data Integration for Adaptive Quiz

## 1. Overview

### 1.1 Purpose
This document specifies the requirements for integrating real-world statistical data from public APIs to replace hardcoded question weights with data-driven values.

### 1.2 Related Documents
- **Design**: SAD-004-real-data-integration.md
- **Previous Requirements**: REQ-API-03-statistical-adaptive-quiz.md
- **Data Sources**: backend/scripts/DATA_SOURCES.md

### 1.3 Scope
This enhancement affects:
- Data collection scripts
- Question weight generation
- API integration layer
- Caching and fallback mechanisms

## 2. Functional Requirements

### 2.1 Data Collection

#### FR-DC-001: Bulk API Fetching
**Priority**: MUST  
**Description**: System must fetch data for all countries in single API calls to avoid rate limiting.

**Acceptance Criteria**:
- Single API call retrieves data for all 20 countries
- No per-country iteration for bulk-capable APIs
- Response time < 5 seconds per API endpoint
- Handles pagination for large datasets

**Example**:
```javascript
// Good: Bulk fetch
const allCountries = await fetchAllCountries();

// Bad: Per-country iteration
for (const country of countries) {
  await fetchCountryData(country); // Avoid this
}
```

#### FR-DC-002: Multiple Data Sources
**Priority**: MUST  
**Description**: System must integrate with multiple public APIs and data sources.

**Required Sources**:
1. World Bank API - Transport, demographics
2. REST Countries API - Country metadata
3. ICO Data - Coffee consumption
4. Tea Europe - Tea consumption
5. Sports Federations - Sports popularity
6. NCD-RisC - Height data

**Acceptance Criteria**:
- Each source has dedicated fetch method
- All sources return normalized data format
- Failed sources don't block other sources
- Sources are documented with URLs and update frequency

#### FR-DC-003: Data Normalization
**Priority**: MUST  
**Description**: All raw data must be normalized to 0-100 scale for consistency.

**Acceptance Criteria**:
- Min-max normalization applied to all numeric data
- Handles edge cases (min = max, negative values, outliers)
- Preserves relative differences between countries
- Documented normalization formula

**Formula**:
```
normalized = ((value - min) / (max - min)) * 100
```

#### FR-DC-004: Caching Strategy
**Priority**: MUST  
**Description**: System must cache API responses to minimize API calls and ensure offline functionality.

**Acceptance Criteria**:
- In-memory cache for current session
- File-based cache persists between runs
- Cache TTL: 30 days for statistical data
- Cache invalidation on manual refresh
- Fallback to cache if API fails

**Cache Structure**:
```json
{
  "lastUpdated": "2026-05-24",
  "ttl": 2592000,
  "data": {
    "coffee": { "FI": 12.0, "US": 4.5, ... },
    "tea": { "GB": 1.9, "CN": 0.6, ... }
  }
}
```

#### FR-DC-005: Rate Limiting
**Priority**: MUST  
**Description**: System must respect API rate limits and implement delays between requests.

**Acceptance Criteria**:
- Minimum 1 second delay between API calls
- Exponential backoff for retries (1s, 2s, 4s, 8s)
- Maximum 3 retry attempts per endpoint
- Logs rate limit errors
- Continues with cached data if rate limited

### 2.2 Weight Generation

#### FR-WG-001: Question-Data Mapping
**Priority**: MUST  
**Description**: Each question must be mapped to appropriate data sources for weight generation.

**Acceptance Criteria**:
- All 73 questions have defined data source mappings
- Mapping documented in code comments
- Multiple data sources can contribute to single question
- Weights calculated using documented algorithm

**Example Mapping**:
```javascript
{
  questionId: "food_coffee",
  text: "Do you drink coffee daily?",
  dataSources: ["coffee_consumption"],
  algorithm: "direct_mapping",
  weights: {
    yes: { FI: 95, NO: 90, US: 70, CN: 20 },
    no: { FI: 5, NO: 10, US: 30, CN: 80 }
  }
}
```

#### FR-WG-002: Weight Calculation Algorithms
**Priority**: MUST  
**Description**: System must support multiple weight calculation algorithms based on question type.

**Required Algorithms**:
1. **Direct Mapping**: Raw data → weights (e.g., coffee consumption)
2. **Inverse Correlation**: Opposite relationship (e.g., tea vs coffee)
3. **Composite Indicators**: Multiple data sources combined
4. **Cultural Adjustment**: Statistical data + cultural factors

**Acceptance Criteria**:
- Each algorithm is a separate function
- Algorithms are unit tested
- Algorithm selection is documented per question
- Weights always sum to ~100 per country

#### FR-WG-003: Probability Distribution Validation
**Priority**: MUST  
**Description**: Generated weights must form valid probability distributions.

**Acceptance Criteria**:
- Sum of weights per country: 90-110 (allows 10% tolerance)
- All weights are non-negative
- At least one answer has weight > 10 per country
- Variance across countries > 100 (meaningful discrimination)

**Validation**:
```javascript
function validateWeights(question) {
  for (const country of countries) {
    const sum = sumWeights(question, country);
    assert(sum >= 90 && sum <= 110);
    assert(calculateVariance(question) > 100);
  }
}
```

#### FR-WG-004: Fallback Weights
**Priority**: MUST  
**Description**: System must maintain fallback weights when real data is unavailable.

**Acceptance Criteria**:
- Current hardcoded weights serve as fallback
- Fallback weights stored in separate file
- System logs when using fallback
- Fallback weights are validated same as real weights

### 2.3 Question Design

#### FR-QD-001: Subtlety Requirements
**Priority**: MUST  
**Description**: Questions must be subtle and not directly ask about nationality, ethnicity, or height.

**Prohibited**:
- "What country are you from?"
- "What is your ethnicity?"
- "Are you tall?"
- "Are you taller than average?"

**Allowed**:
- "Do you drink coffee daily?"
- "What's your favorite sport to watch?"
- "Do you prefer warm or cold weather?"
- "Can you reach the top shelf easily?"

**Acceptance Criteria**:
- No direct nationality questions
- No ethnicity or race questions
- No direct height comparison questions
- All questions are culturally sensitive
- Questions use neutral, everyday language

#### FR-QD-002: Statistical Discrimination
**Priority**: MUST  
**Description**: Each question must provide meaningful discrimination between countries.

**Acceptance Criteria**:
- Variance across countries > 100
- At least 3 countries with weight > 70 for some answer
- At least 3 countries with weight < 30 for same answer
- No question where all countries have similar weights (±10)

**Example**:
```javascript
// Good: High variance
"Do you drink coffee daily?"
FI: 95, NO: 90, US: 70, CN: 20  // Variance: ~800

// Bad: Low variance
"Do you eat food?"
All countries: 100  // Variance: 0
```

#### FR-QD-003: Multi-Section Strategy
**Priority**: MUST  
**Description**: Questions must be organized into sections with dynamic termination.

**Sections**:
1. **Nationality Identification**
   - Goal: 90% confidence
   - Max: 15 questions
   - Strategy: High information gain first

2. **Height Deviation**
   - Goal: 85% confidence
   - Max: 10 questions
   - Strategy: Height-correlated questions

**Acceptance Criteria**:
- Sections are not visible to users
- Section transitions are seamless
- Each section tracks its own confidence
- Quiz terminates when ALL thresholds met OR max 25 questions
- No hard limit on total questions (25 is practical max)

#### FR-QD-004: Confidence Tracking
**Priority**: MUST  
**Description**: System must track confidence for all 4 attributes simultaneously.

**Attributes**:
- Nationality (20 countries)
- Sex (2 categories)
- Age Group (4 categories)
- Height Deviation (5 categories)

**Acceptance Criteria**:
- Each attribute has separate probability distribution
- Confidence calculated as max probability
- All attributes updated after each answer
- Progress shown to user (optional detail level)

### 2.4 Data Quality

#### FR-DQ-001: Data Validation
**Priority**: MUST  
**Description**: All collected data must be validated before use.

**Validation Rules**:
1. No null or undefined values
2. Numeric values within expected ranges
3. All 20 countries have data
4. Probability distributions sum to ~1.0
5. No extreme outliers (>3 standard deviations)

**Acceptance Criteria**:
- Validation runs automatically after data collection
- Invalid data triggers warning and uses fallback
- Validation errors are logged with details
- System continues with partial data if possible

#### FR-DQ-002: Data Freshness
**Priority**: SHOULD  
**Description**: System should track and report data freshness.

**Acceptance Criteria**:
- Last update timestamp stored with data
- Warning if data > 90 days old
- Manual refresh command available
- Automated refresh script (monthly)

#### FR-DQ-003: Source Attribution
**Priority**: MUST  
**Description**: All data must be attributed to its source.

**Acceptance Criteria**:
- Each data point has source URL
- Source update date recorded
- Sources documented in DATA_SOURCES.md
- Attribution shown in admin interface

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-P-001: Data Collection Speed
**Priority**: MUST  
**Description**: Complete data collection must finish within reasonable time.

**Requirements**:
- Total collection time < 5 minutes for all sources
- Individual API call < 10 seconds
- Parallel fetching where possible
- Progress reporting during collection

#### NFR-P-002: Weight Generation Speed
**Priority**: MUST  
**Description**: Weight generation must be fast enough for development workflow.

**Requirements**:
- Generate weights for all 73 questions < 30 seconds
- Incremental generation supported (single question)
- Results cached for reuse
- No blocking of main application

### 3.2 Reliability

#### NFR-R-001: API Failure Handling
**Priority**: MUST  
**Description**: System must gracefully handle API failures.

**Requirements**:
- Fallback to cached data
- Fallback to hardcoded weights
- Log all failures with details
- Continue with partial data
- Never crash due to API failure

#### NFR-R-002: Data Consistency
**Priority**: MUST  
**Description**: Data must remain consistent across application restarts.

**Requirements**:
- File-based cache persists
- Atomic file writes (no partial writes)
- Version tracking for data format
- Migration support for format changes

### 3.3 Maintainability

#### NFR-M-001: Code Documentation
**Priority**: MUST  
**Description**: All data collection and weight generation code must be well documented.

**Requirements**:
- JSDoc comments for all functions
- Data source URLs in comments
- Algorithm explanations in comments
- Example usage in README

#### NFR-M-002: Automated Updates
**Priority**: SHOULD  
**Description**: Data updates should be automated where possible.

**Requirements**:
- Monthly cron job for data refresh
- Automated validation after refresh
- Email notification on failures
- Git commit of updated data

### 3.4 Security

#### NFR-S-001: API Key Management
**Priority**: MUST  
**Description**: API keys must be securely managed.

**Requirements**:
- Keys stored in environment variables
- No keys in source code
- No keys in logs
- Keys documented in .env.example

#### NFR-S-002: Data Privacy
**Priority**: MUST  
**Description**: No personal data collected or stored.

**Requirements**:
- Only aggregate statistical data
- No user tracking
- No PII in any data source
- GDPR compliant

## 4. API Specifications

### 4.1 APIIntegrationManager

#### Method: fetchAllCountries()
**Description**: Fetch metadata for all countries  
**Returns**: `Promise<Object>` - Country data indexed by code  
**Throws**: Error if API fails and no cache available

```javascript
{
  US: { name: "United States", population: 331000000, ... },
  GB: { name: "United Kingdom", population: 67000000, ... }
}
```

#### Method: fetchCoffeeConsumption()
**Description**: Fetch coffee consumption per capita (kg/year)  
**Returns**: `Promise<Object>` - Consumption indexed by country code  
**Cache**: 30 days

```javascript
{
  FI: 12.0,
  NO: 9.9,
  US: 4.5,
  CN: 0.1
}
```

#### Method: fetchTeaConsumption()
**Description**: Fetch tea consumption per capita (kg/year)  
**Returns**: `Promise<Object>` - Consumption indexed by country code  
**Cache**: 30 days

#### Method: fetchVehicleOwnership()
**Description**: Fetch vehicles per 1000 people  
**Returns**: `Promise<Object>` - Vehicles indexed by country code  
**Cache**: 30 days

#### Method: fetchBicycleUsage()
**Description**: Fetch % of population using bicycles regularly  
**Returns**: `Promise<Object>` - Percentage indexed by country code  
**Cache**: 30 days

#### Method: fetchPublicTransportUsage()
**Description**: Fetch % of commuters using public transport  
**Returns**: `Promise<Object>` - Percentage indexed by country code  
**Cache**: 30 days

#### Method: fetchSportsPopularity()
**Description**: Fetch popularity scores for major sports by country  
**Returns**: `Promise<Object>` - Nested object: sport → country → score  
**Cache**: 30 days

```javascript
{
  football: { US: 30, GB: 90, BR: 95 },
  cricket: { US: 5, GB: 70, IN: 95 },
  baseball: { US: 85, JP: 80, GB: 10 }
}
```

#### Method: fetchFoodPreferences()
**Description**: Fetch food preference scores by country  
**Returns**: `Promise<Object>` - Nested object: food → country → score  
**Cache**: 30 days

#### Method: fetchClimatePreferences()
**Description**: Fetch climate preference distributions  
**Returns**: `Promise<Object>` - Nested object: climate → country → score  
**Cache**: 30 days

#### Method: normalizeToScale(value, min, max, scale)
**Description**: Normalize value to 0-100 scale  
**Parameters**:
- `value`: Raw value to normalize
- `min`: Minimum value in dataset
- `max`: Maximum value in dataset
- `scale`: Target scale (default 100)

**Returns**: `number` - Normalized value

#### Method: fetchCountryData(countryCode)
**Description**: Fetch all data for a specific country  
**Parameters**: `countryCode` - ISO 3166-1 alpha-2 code  
**Returns**: `Promise<Object>` - All statistics for country

```javascript
{
  food: { pizza: 0.7, sushi: 0.3, ... },
  sports: { football: 0.8, cricket: 0.1, ... },
  beverage: { coffee: 0.6, tea: 0.3, other: 0.1 },
  transport: { car: 0.7, bicycle: 0.1, ... },
  climate: { cold: 0.2, temperate: 0.6, hot: 0.2 },
  workStyle: {},
  housing: {}
}
```

### 4.2 Weight Generator

#### Method: generateWeights(question, apiData)
**Description**: Generate country weights for a question from API data  
**Parameters**:
- `question`: Question object with data source mapping
- `apiData`: Fetched API data

**Returns**: `Object` - Weights for each answer option

```javascript
{
  yes: { US: 70, GB: 75, JP: 60, ... },
  no: { US: 30, GB: 25, JP: 40, ... }
}
```

#### Method: validateWeights(weights)
**Description**: Validate generated weights  
**Parameters**: `weights` - Generated weights object  
**Returns**: `boolean` - True if valid  
**Throws**: Error with validation details if invalid

## 5. Testing Requirements

### 5.1 Unit Tests

#### UT-001: API Integration Tests
**Coverage**: All fetch methods in APIIntegrationManager  
**Tests**:
- Successful API calls return expected format
- Failed API calls use cache
- Rate limiting delays are applied
- Normalization produces correct values

#### UT-002: Weight Generation Tests
**Coverage**: All weight calculation algorithms  
**Tests**:
- Direct mapping produces correct weights
- Inverse correlation works correctly
- Composite indicators combine properly
- Weights sum to ~100 per country

#### UT-003: Validation Tests
**Coverage**: All validation functions  
**Tests**:
- Invalid data is detected
- Probability distributions are validated
- Variance checks work correctly
- Edge cases handled (min=max, negatives)

### 5.2 Integration Tests

#### IT-001: End-to-End Data Collection
**Test**: Run complete data collection pipeline  
**Verify**:
- All APIs are called
- Data is cached
- Weights are generated
- Output file is valid JSON

#### IT-002: Fallback Scenarios
**Test**: Simulate API failures  
**Verify**:
- System uses cached data
- System uses fallback weights
- No crashes or errors
- Warnings are logged

### 5.3 Manual Tests

#### MT-001: Question Quality Review
**Test**: Human review of all 73 questions  
**Verify**:
- Questions are subtle
- No offensive content
- Culturally sensitive
- Good discrimination

#### MT-002: Weight Accuracy Review
**Test**: Compare generated weights with known facts  
**Verify**:
- Coffee weights match consumption data
- Sports weights match popularity
- Transport weights match modal split
- No obvious errors

## 6. Deployment Requirements

### 6.1 Initial Deployment

#### DR-001: Data Collection
**Steps**:
1. Run `node backend/scripts/collect-country-statistics.js`
2. Verify output in `backend/src/data/country-statistics.json`
3. Run validation tests
4. Commit to git

#### DR-002: Weight Generation
**Steps**:
1. Run weight generation script
2. Update `backend/src/data/question-bank-enhanced.json`
3. Run validation tests
4. Compare with hardcoded weights
5. Commit to git

### 6.2 Ongoing Maintenance

#### DR-003: Monthly Updates
**Schedule**: First day of each month  
**Steps**:
1. Run data collection script
2. Run weight generation
3. Run validation tests
4. Review changes
5. Commit and deploy

#### DR-004: Emergency Updates
**Trigger**: API changes, data quality issues  
**Steps**:
1. Identify issue
2. Fix code or data
3. Run full test suite
4. Deploy hotfix

## 7. Success Criteria

### 7.1 Functional Success
- [ ] All 73 questions have real data-driven weights
- [ ] All 20 countries have complete data
- [ ] Weights pass all validation tests
- [ ] Fallback system works correctly
- [ ] No US bias in question selection

### 7.2 Quality Success
- [ ] Nationality accuracy > 70%
- [ ] Height prediction MAE < 5cm
- [ ] Average questions to completion < 20
- [ ] No offensive or insensitive questions
- [ ] User satisfaction > 4/5

### 7.3 Technical Success
- [ ] Data collection completes in < 5 minutes
- [ ] All APIs have < 1% failure rate
- [ ] Cache hit rate > 95%
- [ ] Code coverage > 80%
- [ ] Documentation complete

## 8. Risks and Mitigations

### 8.1 API Availability
**Risk**: Public APIs may be unavailable or rate limited  
**Impact**: High - Cannot generate weights  
**Mitigation**:
- Implement robust caching
- Maintain fallback weights
- Use multiple data sources
- Monitor API health

### 8.2 Data Quality
**Risk**: API data may be inaccurate or outdated  
**Impact**: Medium - Reduces inference accuracy  
**Mitigation**:
- Validate all data
- Cross-reference multiple sources
- Manual review of weights
- Regular updates

### 8.3 Cultural Sensitivity
**Risk**: Questions may be offensive in some cultures  
**Impact**: High - Damages reputation  
**Mitigation**:
- Human review of all questions
- Cultural sensitivity guidelines
- User feedback mechanism
- Quick removal of problematic questions

## 9. Appendix

### 9.1 Country Codes
ISO 3166-1 alpha-2 codes for all 20 countries:
US, GB, JP, CN, IN, NL, DE, FR, IT, ES, CA, AU, MX, BR, KR, SE, NO, DK, TH, AR

### 9.2 Data Source URLs
- World Bank: https://api.worldbank.org/v2
- REST Countries: https://restcountries.com/v3.1
- NCD-RisC: https://www.ncdrisc.org/
- OECD: https://stats.oecd.org/

### 9.3 Glossary
- **Bayesian Inference**: Statistical method for updating probabilities
- **Information Gain**: Measure of how much a question reduces uncertainty
- **Modal Split**: Distribution of transport modes in a population
- **Normalization**: Scaling data to a standard range

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-24  
**Author**: Bob (AI Software Engineer)  
**Status**: Draft  
**Approved By**: Pending