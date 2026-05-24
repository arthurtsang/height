# Requirement Template

Use this template as a starting point for creating new requirements that comply with the Definition of Done.

---

# [REQ-ID]: [Clear, Descriptive Title]

**Status:** Draft | In Progress | Ready for Review | Approved | Done

**Related Work Items:** [Reference to related requirements or tracking IDs]

---

## Persona
As a [specific role/user type],
[additional context about who they are, their goals, and why they need this feature]

---

## Context
In order to [achieve specific goal or solve specific problem],

**Background:**
[Why we are doing this - business drivers, user pain points, strategic goals, constraints]

**Constraints:**
- [Technical constraints]
- [Business constraints]
- [Timeline or resource constraints]

**Dependencies:**
- [Other requirements or systems this depends on]
- [External integrations or APIs]

---

## Requirements

### Functional Requirements
1. [Specific functional expectation in clear prose the team agrees on]
2. [Another functional requirement]
3. [Integration or data requirement]
4. [User interaction or workflow requirement]

### Non-Functional Requirements
1. **Performance:** [Response time, throughput, scalability expectations]
2. **Security:** [Authentication, authorization, data protection requirements]
3. **Reliability:** [Uptime, error handling, recovery expectations]
4. **Accessibility:** [WCAG compliance, keyboard navigation, screen reader support]
5. **Scalability:** [Load handling, concurrent users, data volume]

---

## Acceptance Criteria

### AC1: [Criterion Title - Happy Path]
**Given** [initial state or precondition]
**When** [action or event occurs]
**Then** [expected outcome or result]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

### AC2: [Criterion Title - Another Scenario]
**Given** [another precondition]
**When** [another action]
**Then** [another expected outcome]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

### AC3: [Edge Case or Boundary Condition]
**Given** [edge case setup]
**When** [boundary condition triggered]
**Then** [expected handling behavior]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

### AC4: [Error Handling Criterion]
**Given** [error condition setup]
**When** [error occurs]
**Then** [expected error handling and user feedback]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

### AC5: [Non-Functional Criterion]
[Performance, security, or other non-functional requirement with measurable threshold]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

---

## Design References

- **ADD:** [designs/ADD-XXX-architecture-name.md] or "Pending"
- **ADR:** [designs/ADR-XXX-decision-name.md] or "Pending"
- **SAD:** [designs/SAD-XXX-solution-name.md] or "Pending"
- **API Specs:** [Link to OpenAPI/Swagger docs if applicable]
- **Data Models:** [Link to schema definitions if applicable]
- **UI/UX Designs:** [Link to mockups or wireframes in designs/diagrams/ if applicable]

**Design/Implementation Parity:** 
- [ ] Design documents reviewed and approved
- [ ] Implementation matches design specifications
- [ ] Any divergence from design is documented with rationale
- [ ] Design docs in `designs/` updated to reflect what actually shipped

---

## Test Scenarios

### Test Coverage Map
| Acceptance Criterion | Test File/Suite | Test Scenario ID | Status |
|---------------------|-----------------|------------------|--------|
| AC1 | integration/features/[feature].feature | @[tag] Scenario 1 | Pending |
| AC2 | integration/features/[feature].feature | @[tag] Scenario 2 | Pending |
| AC3 | integration/features/[feature].feature | @[tag] Scenario 3 | Pending |
| AC4 | integration/features/[feature].feature | @[tag] Scenario 4 | Pending |
| AC5 | integration/features/[feature].feature | @[tag] Scenario 5 | Pending |

### Test Annotations Required
- **Requirement reference:** `REQ-XXX` (e.g., `@req-data-01`)
- **Category tags:** `@[category]` (e.g., @dataset, @api, @portal, @integration)
- **Feature tags:** Additional context tags as needed

### Human Verification Required
- [ ] [Specific scenario requiring human approval]
- [ ] [UI/UX validation]
- [ ] [Business logic verification]

### Test Report
[Link to test report or document results here once tests are complete]
- CI Run: [URL]
- Local Test Results: [Summary or path to report]
- Date: [YYYY-MM-DD]

---

## Definition of Done Checklist

Before marking this requirement as **Done**, verify all items:

### 1. Requirement Completeness
- [ ] Context explains why we are doing this (background, constraints)
- [ ] Requirements (functional & non-functional) are documented in prose
- [ ] Acceptance criteria are testable and unambiguous
- [ ] Design references are linked to `designs/` folder or pending status is explicitly documented
- [ ] Design/implementation parity is confirmed (docs in `designs/` describe what shipped)

### 2. Tests and Traceability
- [ ] Test scenarios documented and mapped to acceptance criteria
- [ ] Test scenarios annotated with requirement reference (REQ-XXX)
- [ ] Test scenarios annotated with category tags (@category)
- [ ] Feature scenarios verified and approved by a human
- [ ] All automated tests pass (local and/or CI)
- [ ] Test report documented in this requirement file before marking Done

### 3. Pull Request
- [ ] PR title includes REQ ID (e.g., "feat(portal): dataset X [REQ-DATA-01]")
- [ ] PR description links this requirement file and design docs from `designs/`
- [ ] One primary PR per requirement (when practical, avoid mixing unrelated work)

### 4. Code Integration
- [ ] Requirement reference included in branch name (e.g., feature/REQ-DATA-01-dataset-ingestion)
- [ ] Requirement reference in commit messages
- [ ] All DoD items satisfied before marking requirement Done

### 5. Documentation
- [ ] Implementation documented in relevant design docs in `designs/` (ADD/ADR/SAD)
- [ ] Any design divergence documented with rationale (or tracked as doc debt)
- [ ] API changes reflected in OpenAPI/Swagger specs
- [ ] README or runbook updated if needed
- [ ] Configuration or environment changes documented

---

## Notes
[Additional context, open questions, assumptions, or follow-up items]

**Open Questions:**
- [Question 1]
- [Question 2]

**Assumptions:**
- [Assumption 1]
- [Assumption 2]

**Follow-up Items:**
- [Follow-up task 1 - owner and due date]
- [Follow-up task 2 - owner and due date]