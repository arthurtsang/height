# Designs Directory

This directory contains all design documentation for the project, including Architecture Decision Documents (ADD), Architecture Decision Records (ADR), and Solution Architecture Documents (SAD).

## Purpose

Design documents in this directory serve as:
- Technical specifications for features and systems
- Architecture decisions and their rationale
- Solution designs for complex problems
- Reference documentation for implementation
- Historical record of design evolution

## Document Types

### Architecture Decision Document (ADD)
Comprehensive documents describing the overall architecture of a system or major component.

**Use for:**
- System architecture overviews
- Component interaction diagrams
- Technology stack decisions
- Infrastructure architecture

**Naming:** `ADD-[NUMBER]-[description].md`
- Example: `ADD-001-microservices-architecture.md`

### Architecture Decision Record (ADR)
Lightweight documents capturing specific architectural decisions and their context.

**Use for:**
- Technology choices (e.g., database selection)
- Design pattern decisions
- API design choices
- Security approach decisions

**Naming:** `ADR-[NUMBER]-[description].md`
- Example: `ADR-025-use-postgres-for-primary-database.md`

### Solution Architecture Document (SAD)
Detailed technical designs for specific features or solutions.

**Use for:**
- Feature implementation designs
- Integration specifications
- Data flow diagrams
- API contracts and schemas

**Naming:** `SAD-[NUMBER]-[description].md`
- Example: `SAD-012-dataset-ingestion-pipeline.md`

## Document Structure

Each design document should include:

### 1. Header
```markdown
# [DOC-TYPE]-[NUMBER]: [Title]

**Status:** Draft | Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Authors:** [Names]
**Related Requirements:** [REQ-XXX, REQ-YYY]
```

### 2. Context
- Background and motivation
- Problem statement
- Constraints and assumptions

### 3. Decision/Design
- Proposed solution or decision
- Technical details
- Diagrams and specifications
- API contracts or data models

### 4. Consequences
- Benefits and advantages
- Trade-offs and limitations
- Impact on other systems
- Migration or implementation considerations

### 5. Alternatives Considered
- Other options evaluated
- Why they were not chosen

### 6. References
- Related design docs
- External resources
- Standards or best practices

## Workflow

### Creating Design Documents

1. **Identify Need**
   - New feature requiring design
   - Architectural decision to document
   - Complex problem needing solution design

2. **Draft Document**
   - Use appropriate template (ADD/ADR/SAD)
   - Include all required sections
   - Add diagrams and specifications

3. **Review Process**
   - Share with team for feedback
   - Update based on review comments
   - Mark as "Proposed" when ready

4. **Approval**
   - Team reviews and approves
   - Mark as "Accepted"
   - Link from requirements

5. **Implementation**
   - Reference during development
   - Update if implementation diverges
   - Maintain design/implementation parity

### Updating Existing Documents

When implementation diverges from design:

1. **Document Divergence**
   - Add note explaining why design changed
   - Include rationale for divergence
   - Update diagrams and specifications

2. **Update Status**
   - Keep status as "Accepted" if still valid
   - Mark as "Superseded" if replaced by new design
   - Mark as "Deprecated" if no longer applicable

3. **Link Updates**
   - Update related requirements
   - Cross-reference new design docs
   - Maintain traceability

## Design/Implementation Parity

**Critical Rule:** Design documents must describe what actually shipped.

Before marking a requirement as Done:
- [ ] Verify design docs match implementation
- [ ] Update docs if implementation diverged
- [ ] Document rationale for any changes
- [ ] Ensure diagrams reflect actual system

If design updates are deferred:
- Create tracked follow-up task
- Assign owner and due date
- Document in requirement notes

## File Organization

```
designs/
├── README.md (this file)
├── ADD-001-system-architecture.md
├── ADD-002-data-architecture.md
├── ADR-001-use-golang.md
├── ADR-002-rest-api-design.md
├── SAD-001-authentication-flow.md
├── SAD-002-dataset-ingestion.md
└── diagrams/
    ├── system-overview.png
    ├── data-flow.png
    └── api-architecture.png
```

### Diagrams Subfolder

Store all diagrams in `designs/diagrams/`:
- Architecture diagrams
- Sequence diagrams
- Data flow diagrams
- Entity relationship diagrams
- Component diagrams

**Naming:** `[doc-id]-[description].[ext]`
- Example: `ADD-001-system-overview.png`

## Integration with Requirements

Design documents are referenced in requirements:

```markdown
## Design References

- **ADD:** [designs/ADD-001-system-architecture.md]
- **ADR:** [designs/ADR-025-postgres-database.md]
- **SAD:** [designs/SAD-012-ingestion-pipeline.md]
```

Requirements link to designs, designs reference requirements:
- Bidirectional traceability
- Clear relationship between spec and design
- Easy navigation between documents

## Status Values

- **Draft** - Work in progress, not ready for review
- **Proposed** - Ready for team review and feedback
- **Accepted** - Approved and ready for implementation
- **Deprecated** - No longer applicable, kept for history
- **Superseded** - Replaced by newer design (link to replacement)

## Best Practices

✅ **Do:**
- Write clear, concise design documents
- Include diagrams and visual aids
- Document alternatives considered
- Keep designs up-to-date with implementation
- Link designs to requirements
- Use consistent naming conventions

❌ **Don't:**
- Skip design documentation for complex features
- Leave designs outdated after implementation
- Mix multiple unrelated decisions in one document
- Forget to update status when designs change
- Create designs without linking to requirements

## Templates

Templates for each document type are available:
- `ADD-template.md` - Architecture Decision Document template
- `ADR-template.md` - Architecture Decision Record template
- `SAD-template.md` - Solution Architecture Document template

## Questions?

For questions about design documentation:
1. Review existing design docs for examples
2. Check the DoD checklist for design requirements
3. Consult with the team on design approach
4. Refer to requirements for context and scope