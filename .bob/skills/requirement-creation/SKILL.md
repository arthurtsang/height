---
name: requirement-creation
description: Create well-structured requirements with acceptance criteria, context, persona, and Definition of Done compliance
---

When creating requirements, follow this structured approach to ensure completeness, clarity, and compliance with the Definition of Done.

## Requirement Structure

Each requirement must include these essential components to satisfy the Definition of Done:

### 1. Persona
Identify who this requirement is for:
- Define the user role or stakeholder
- Describe their relationship to the system
- Explain their goals and motivations
- Format: "As a [role/persona]..."

### 2. Context
Provide the background and rationale (DoD requirement):
- Explain **why** we are doing this
- Describe the problem being solved
- Include relevant business or technical context
- Reference any dependencies or constraints
- Document background information
- Format: "In order to [achieve goal/solve problem]..."

### 3. Requirements (Functional & Non-Functional)
Define what needs to be built (DoD requirement):
- List functional expectations in clear prose
- Include non-functional requirements (performance, security, scalability)
- Specify technical constraints or dependencies
- Reference any API contracts, data models, or integration points

### 4. Acceptance Criteria
Define clear, testable conditions for completion (DoD requirement):
- List specific, measurable, **testable** criteria
- Use "Given-When-Then" format for behavioral scenarios
- Include both functional and non-functional requirements
- Ensure criteria are verifiable and unambiguous
- Cover edge cases and error scenarios
- Each criterion should be implementable as a test scenario

### 5. Design References
Link to design documentation (DoD requirement):
- Reference relevant ADD (Architecture Decision Document) in `designs/`
- Reference relevant ADR (Architecture Decision Record) in `designs/`
- Reference relevant SAD (Solution Architecture Document) in `designs/`
- If design is pending, state explicitly and note follow-up needed
- Format: Link to `designs/ADD-XXX-name.md` or note "Design pending"

### 6. Test Scenarios
Outline how acceptance criteria will be verified (DoD requirement):
- Map acceptance criteria to test scenarios
- Specify test categories (e.g., @dataset, @api, @integration)
- Note if scenarios span multiple test files
- Indicate which tests require human verification vs automation

## Output Format

Create requirements in the `requirements/` folder using this structure:

```markdown
# [REQ-ID]: [Clear, Concise Title]

**Status:** Draft | In Progress | Ready for Review | Approved | Done

**Related Work Items:** [Reference to related requirements or tracking IDs]

---

## Persona
As a [role/user type],
[additional context about who they are, their goals, and why they need this feature]

---

## Context
In order to [achieve specific goal or solve specific problem],

**Background:**
[Why we are doing this - business drivers, user pain points, strategic goals]

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
1. [Specific functional expectation in clear prose]
2. [Another functional requirement]
3. [Integration or data requirement]

### Non-Functional Requirements
1. **Performance:** [Response time, throughput, scalability expectations]
2. **Security:** [Authentication, authorization, data protection requirements]
3. **Reliability:** [Uptime, error handling, recovery expectations]
4. **Accessibility:** [WCAG compliance, keyboard navigation, screen reader support]

---

## Acceptance Criteria

### AC1: [Criterion Title]
**Given** [precondition]
**When** [action or event occurs]
**Then** [expected outcome]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

### AC2: [Criterion Title]
**Given** [another precondition]
**When** [another action]
**Then** [another expected outcome]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

### AC3: [Edge Case or Error Handling]
[Describe edge case scenario and expected behavior]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

### AC4: [Non-Functional Criterion]
[Performance, security, or other non-functional requirement]

**Test Category:** @[category-tag]
**Verification:** Automated | Manual | Both

---

## Design References

- **ADD:** [designs/ADD-XXX-architecture-name.md] or "Pending"
- **ADR:** [designs/ADR-XXX-decision-name.md] or "Pending"
- **SAD:** [designs/SAD-XXX-solution-name.md] or "Pending"
- **API Specs:** [Link to OpenAPI/Swagger docs if applicable]
- **Data Models:** [Link to schema definitions if applicable]

**Design/Implementation Parity:** 
- [ ] Design documents reviewed and approved
- [ ] Implementation matches design specifications
- [ ] Any divergence from design is documented with rationale

---

## Test Scenarios

### Test Coverage Map
| Acceptance Criterion | Test File/Suite | Test Scenario ID | Status |
|---------------------|-----------------|------------------|--------|
| AC1 | integration/features/[feature].feature | @[tag] Scenario 1 | Pending |
| AC2 | integration/features/[feature].feature | @[tag] Scenario 2 | Pending |
| AC3 | integration/features/[feature].feature | @[tag] Scenario 3 | Pending |

### Test Annotations Required
- Requirement reference: `REQ-XXX`
- Category tags: `@[category]` (e.g., @dataset, @api, @portal)
- Feature tags: `@[req-id]` (e.g., @req-data-02)

---

## Definition of Done Checklist

Before marking this requirement as **Done**, verify:

### 1. Requirement Completeness
- [ ] Context explains why we are doing this
- [ ] Requirements (functional & non-functional) are documented
- [ ] Acceptance criteria are testable and unambiguous
- [ ] Design references are linked to `designs/` folder or pending status is documented
- [ ] Design/implementation parity is confirmed

### 2. Tests and Traceability
- [ ] Test scenarios documented and mapped to acceptance criteria
- [ ] Test scenarios annotated with requirement reference and category tags
- [ ] Feature scenarios verified and approved by human
- [ ] All automated tests pass (local and/or CI)
- [ ] Test report documented in requirement or linked

### 3. Pull Request
- [ ] PR title includes REQ ID
- [ ] PR description links requirement and design docs in `designs/`
- [ ] One primary PR per requirement (when practical)

### 4. Code Integration
- [ ] Requirement reference included in branch name, commits, PR title
- [ ] All DoD items satisfied before marking requirement Done

### 5. Documentation
- [ ] Implementation documented in relevant design docs in `designs/`
- [ ] Any design divergence documented with rationale
- [ ] API changes reflected in specs
- [ ] README or runbook updated if needed

---

## Notes
[Additional context, open questions, or follow-up items]
```

## Best Practices

- **Be specific**: Avoid vague language; use concrete, measurable terms
- **Stay focused**: Each requirement should address a single feature or capability
- **Think user-first**: Frame requirements from the user's perspective
- **Consider edge cases**: Include error handling and boundary conditions
- **Make it testable**: Ensure each criterion can be verified objectively
- **Link to designs**: Always reference or create design documentation in `designs/`
- **Plan for tests**: Think about test scenarios while writing acceptance criteria
- **Follow DoD**: Use the checklist to ensure nothing is missed

## File Naming Convention

Save requirements in the `requirements/` folder using this pattern:
- `REQ-[CATEGORY]-[NUMBER]-[short-description].md`
- Examples:
  - `REQ-DATA-01-dataset-ingestion.md`
  - `REQ-API-05-authentication-flow.md`
  - `REQ-UI-12-dashboard-widgets.md`

## Design Document References

Link to design documents in the `designs/` folder:
- `designs/ADD-XXX-name.md` - Architecture Decision Documents
- `designs/ADR-XXX-name.md` - Architecture Decision Records
- `designs/SAD-XXX-name.md` - Solution Architecture Documents

Refer to `requirement-template.md` for a detailed template, `requirement-examples.md` for sample requirements, and `dod-checklist.md` for the complete Definition of Done reference.