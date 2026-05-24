# Requirements Directory

This directory contains all project requirements following the Definition of Done standards.

## Purpose

Requirements in this directory serve as the single source of truth for:
- Feature specifications with persona, context, and acceptance criteria
- Traceability between work items and implementation
- Test scenario mapping and coverage
- Design document references in `designs/` folder
- Definition of Done compliance tracking

## File Naming Convention

Requirements follow this naming pattern:
```
REQ-[CATEGORY]-[NUMBER]-[short-description].md
```

### Examples:
- `REQ-DATA-01-dataset-ingestion.md`
- `REQ-API-05-authentication-flow.md`
- `REQ-UI-12-dashboard-widgets.md`
- `REQ-INFRA-03-deployment-pipeline.md`

### Categories:
- **DATA** - Data processing, ingestion, storage
- **API** - API endpoints, integrations, services
- **UI** - User interface, frontend features
- **INFRA** - Infrastructure, deployment, DevOps
- **AUTH** - Authentication, authorization, security
- **TEST** - Testing infrastructure, frameworks
- **DOC** - Documentation, guides, runbooks

## Requirement Structure

Each requirement file must include:

1. **Persona** - Who needs this feature and why
2. **Context** - Background, business drivers, constraints
3. **Requirements** - Functional and non-functional expectations
4. **Acceptance Criteria** - Testable conditions using Given-When-Then
5. **Design References** - Links to ADD/ADR/SAD documents in `designs/`
6. **Test Scenarios** - Mapping to test files and coverage
7. **Definition of Done Checklist** - Compliance tracking

## Creating New Requirements

Use the Bob skill for requirement creation:

```
Bob, create a requirement for [feature description]
```

Or manually use the template:
```bash
cp .bob/skills/requirement-creation/requirement-template.md requirements/REQ-[CATEGORY]-[NUMBER]-[description].md
```

## Definition of Done

Before marking any requirement as **Done**, ensure:

✅ All DoD checklist items are completed
✅ Test scenarios are implemented and passing
✅ Design documents in `designs/` are linked and up-to-date
✅ Test report documented in requirement file
✅ PR includes requirement reference (REQ-XXX)

See `.bob/skills/requirement-creation/dod-checklist.md` for the complete checklist.

## Workflow

### 1. Create Requirement
- Use Bob skill or template
- Define persona, context, and acceptance criteria
- Link to design documents in `designs/` (or mark as pending)
- Map test scenarios

### 2. Development
- Create branch with requirement reference (e.g., `feature/REQ-DATA-01-ingestion`)
- Implement according to acceptance criteria
- Write tests annotated with requirement and category tags
- Update design docs in `designs/` if implementation diverges

### 3. Testing
- Run all automated tests
- Perform human verification of feature scenarios
- Generate test report
- Document test results in requirement file

### 4. Review
- Submit PR with requirement reference in title (e.g., `feat: dataset ingestion [REQ-DATA-01]`)
- Link requirement and design docs from `designs/` in PR description
- Address review feedback
- Verify design/implementation parity

### 5. Closure
- Complete all DoD checklist items
- Mark requirement status as "Done"
- Update any related documentation

## Status Values

Requirements use these status values:

- **Draft** - Initial creation, not yet reviewed
- **In Progress** - Active development
- **Ready for Review** - Implementation complete, awaiting review
- **Approved** - Reviewed and approved, ready for merge
- **Done** - All DoD items complete, work closed

## Integration with Design Documents

Requirements are traceable to design documents in `designs/`:

- Each requirement references design docs (ADD/ADR/SAD)
- Design docs reference related requirements
- Test scenarios validate design specifications
- PR descriptions link both requirements and designs
- Design/implementation parity is verified before closure

## Best Practices

✅ **Do:**
- Keep requirements focused on single features
- Write testable acceptance criteria
- Link to design documents in `designs/`
- Update requirements when implementation changes
- Complete DoD checklist before marking Done
- Document test reports in requirement files

❌ **Don't:**
- Mix multiple unrelated features in one requirement
- Skip design references
- Mark Done without test reports documented
- Leave design/implementation mismatches undocumented
- Close requirements without completing DoD checklist

## File Structure

```
project/
├── requirements/
│   ├── README.md (this file)
│   ├── REQ-DATA-01-dataset-ingestion.md
│   ├── REQ-API-05-authentication.md
│   └── REQ-UI-12-dashboard.md
├── designs/
│   ├── README.md
│   ├── ADD-001-system-architecture.md
│   ├── ADR-025-postgres-database.md
│   ├── SAD-012-ingestion-pipeline.md
│   └── diagrams/
│       └── system-overview.png
└── integration/
    └── features/
        └── dataset-ingestion.feature
```

## Resources

- **Skill Documentation:** `.bob/skills/requirement-creation/SKILL.md`
- **Template:** `.bob/skills/requirement-creation/requirement-template.md`
- **Examples:** `.bob/skills/requirement-creation/requirement-examples.md`
- **DoD Checklist:** `.bob/skills/requirement-creation/dod-checklist.md`
- **Design Docs:** `designs/README.md`

## Questions?

For questions about requirements or the Definition of Done, refer to:
1. The DoD checklist in `.bob/skills/requirement-creation/dod-checklist.md`
2. Example requirements in `.bob/skills/requirement-creation/requirement-examples.md`
3. Design documentation guidelines in `designs/README.md`
4. Your team's workflow documentation