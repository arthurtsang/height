# Definition of Done Checklist

This checklist is derived from the project's Definition of Done and must be completed before marking any requirement as **Done**.

---

## Overview

**Applies to:** User stories and traceable work documented in the `requirements/` directory.

**Source of truth:** Requirements in `requirements/` folder hold product scope and acceptance criteria. This checklist is the engineering **Definition of Done** that agents and humans follow before closing work.

---

## 1. Requirement Completeness

For each requirement in `requirements/`, the file **must** include:

- [ ] **Context** — Why we are doing this, background, constraints
- [ ] **Requirements** — Functional and non-functional expectations in prose the team agrees on
- [ ] **Acceptance criteria** — Testable, unambiguous bullets or checklist
- [ ] **Design references** — Links to `designs/` folder (ADD/ADR/SAD paths) or explicit "pending" status with follow-up noted
- [ ] **Design/implementation parity** — Before closure, confirm the `designs/` documents cited describe what actually shipped (API fields, pipeline shape, env wiring). If implementation diverged, update the design docs in the same delivery or file tracked doc debt with owner and due date

---

## 2. Tests and Traceability

- [ ] **Test scenarios** are documented and implemented (may span multiple `.feature` files under `integration/features/` or other test suites)
- [ ] Scenarios are **annotated** with:
  - [ ] The **requirement reference** (e.g., `REQ-DATA-01`)
  - [ ] A **category** tag (e.g., `@req-data-01`, `@dataset`, `@api`) so filters and reports map work to requirements
- [ ] **Feature scenarios** that represent acceptance behavior are **verified and approved by a human** (not only green automation)
- [ ] **All automated tests** for the change pass (local and/or CI as agreed for the requirement)
- [ ] A **test report** (e.g., test framework HTML report path, CI run URL, or attached log summary) is **documented in the requirement file** or linked before marking **Done**

---

## 3. Pull Requests

- [ ] **One primary PR per requirement** when practical (avoid mixing unrelated work)
- [ ] **PR title** includes **REQ ID** (e.g., `feat(portal): dataset ingestion [REQ-DATA-01]`)
- [ ] **PR description** links the requirement file and any design docs from `designs/`
- [ ] PR follows project coding standards and conventions

---

## 4. Code Integration

So code changes are traceable to requirements:

- [ ] **Requirement reference in branch names** (e.g., `feature/REQ-DATA-01-dataset-ingestion`)
- [ ] **Requirement reference in commit messages** (e.g., `feat: add dataset ingestion [REQ-DATA-01]`)
- [ ] **Requirement reference in PR titles** (e.g., `feat(portal): dataset X [REQ-DATA-01]`)

---

## 5. Infrastructure & Deployment

For requirements that involve infrastructure or deployment changes:

### Terraform Code Required
- [ ] **Terraform files** provided for all infrastructure resources
  - [ ] `main.tf` - Resource definitions
  - [ ] `variables.tf` - Input variables with descriptions
  - [ ] `outputs.tf` - Output values for resource references
  - [ ] `backend.tf` - State backend configuration
  - [ ] `terraform.tfvars.example` - Example variable values
- [ ] **Terraform validation** passes
  - [ ] `terraform fmt` applied (code formatted)
  - [ ] `terraform validate` passes (syntax valid)
  - [ ] `terraform plan` reviewed and approved
  - [ ] No hardcoded secrets or credentials

### Deployment Configuration
- [ ] **Container configuration** complete (if applicable)
  - [ ] `Dockerfile` with multi-stage build
  - [ ] `.dockerignore` file
  - [ ] ECS task definition
  - [ ] Container health checks defined
- [ ] **Environment configuration** documented
  - [ ] Environment variables listed
  - [ ] Secrets management configured (AWS Secrets Manager/Parameter Store)
  - [ ] Configuration files for each environment (dev/staging/prod)
- [ ] **Networking configuration** complete
  - [ ] VPC and subnet configuration
  - [ ] Security groups with least privilege
  - [ ] Load balancer configuration
  - [ ] DNS/Route53 setup (if applicable)

### Deployment Testing
- [ ] **Non-production deployment** successful
  - [ ] Deployed to dev environment
  - [ ] Health checks passing
  - [ ] Smoke tests completed
  - [ ] Logs accessible in CloudWatch
- [ ] **Monitoring configured**
  - [ ] CloudWatch metrics enabled
  - [ ] Alarms configured for critical metrics
  - [ ] Dashboard created (if needed)
  - [ ] Log aggregation working
- [ ] **Rollback procedure** tested
  - [ ] Previous version can be restored
  - [ ] Rollback documented in runbook
  - [ ] Zero-downtime deployment verified

### Infrastructure Documentation
- [ ] **Architecture diagrams** updated
  - [ ] Infrastructure diagram reflects deployed resources
  - [ ] Network diagram shows connectivity
  - [ ] Saved in `designs/diagrams/`
- [ ] **Deployment runbook** updated
  - [ ] Step-by-step deployment instructions
  - [ ] Rollback procedures
  - [ ] Troubleshooting guide
  - [ ] Cost estimates documented
- [ ] **Terraform documentation** complete
  - [ ] Module README with usage examples
  - [ ] Variable descriptions clear
  - [ ] Output descriptions clear
  - [ ] Dependencies documented

---

## 6. Closure

A requirement is **Done** only when:

- [ ] All items in sections 1-5 above are satisfied
- [ ] All stakeholders have approved the implementation
- [ ] No blocking issues or technical debt remain untracked
- [ ] Requirement status updated to "Done" in the requirement file
- [ ] Infrastructure is deployed and operational (if applicable)
- [ ] Deployment verified in non-production environment

---

## 7. Documentation

- [ ] Implementation is documented in relevant design docs in `designs/` (ADD/ADR/SAD)
- [ ] Any divergence from original design is documented with rationale
- [ ] API changes are reflected in OpenAPI/Swagger specifications
- [ ] README or runbook updated if needed
- [ ] Configuration or environment changes are documented
- [ ] Infrastructure diagrams updated to reflect deployed resources

---

## Quick Reference: Test Annotation Format

### Required Annotations in Test Scenarios

```gherkin
@req-data-01 @dataset @integration
Feature: Dataset Ingestion
  As a data engineer
  I need to ingest datasets from external sources
  
  @req-data-01 @dataset
  Scenario: Successfully ingest CSV dataset
    Given a valid CSV file is available
    When the ingestion process is triggered
    Then the dataset is imported successfully
```

**Key elements:**
- Requirement reference: `@req-data-01`
- Category tags: `@dataset`, `@api`, `@portal`, etc.
- Feature context tags: `@integration`, `@unit`, etc.

---

## Infrastructure Code Structure

### Terraform Organization
```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   └── prod/
├── modules/
│   ├── ecs-service/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── alb/
│   ├── redis/
│   └── networking/
└── README.md
```

### Required Files for ECS Deployment
```
project/
├── Dockerfile
├── .dockerignore
├── docker-compose.yml (for local dev)
├── terraform/
│   └── [as above]
└── docs/
    └── deployment-runbook.md
```

---

## Common Pitfalls to Avoid

❌ **Don't:**
- Mark requirement Done without test report documented
- Skip human verification of feature scenarios
- Mix multiple unrelated requirements in one PR
- Update implementation without updating design docs in `designs/`
- Close requirement with pending design documentation
- Deploy infrastructure without Terraform code
- Hardcode secrets or credentials in Terraform or code
- Skip deployment testing in non-production environments
- Deploy to production without monitoring/alerts
- Forget to document rollback procedures

✅ **Do:**
- Complete all checklist items before marking Done
- Document test reports in requirement files
- Keep PRs focused on single requirements
- Maintain design/implementation parity in `designs/` folder
- Document any design divergence with rationale
- Provide complete Terraform code for all infrastructure
- Use AWS Secrets Manager or Parameter Store for secrets
- Test deployments in dev/staging before production
- Configure monitoring and alerts before production deployment
- Update infrastructure diagrams after deployment
- Document deployment procedures in runbooks

---

## File Structure Reference

```
project/
├── requirements/
│   ├── README.md
│   ├── REQ-DATA-01-dataset-ingestion.md
│   └── REQ-INFRA-01-ecs-deployment.md
├── designs/
│   ├── README.md
│   ├── ADD-001-system-architecture.md
│   ├── ADR-001-aws-ecs-deployment.md
│   ├── SAD-001-height-prediction-app.md
│   └── diagrams/
│       ├── system-overview.png
│       ├── aws-architecture.png
│       └── network-diagram.png
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── modules/
│       ├── ecs-service/
│       ├── alb/
│       └── networking/
├── src/
│   └── [application code]
├── Dockerfile
├── docker-compose.yml
└── docs/
    └── deployment-runbook.md
```

---

## Deployment Checklist Quick Reference

### Before Deployment
- [ ] Terraform code reviewed and approved
- [ ] Secrets configured in AWS Secrets Manager
- [ ] Environment variables documented
- [ ] Health checks defined
- [ ] Monitoring/alerts configured

### During Deployment
- [ ] Deploy to dev first
- [ ] Run smoke tests
- [ ] Verify logs in CloudWatch
- [ ] Check health checks passing
- [ ] Monitor metrics during rollout

### After Deployment
- [ ] Verify application functionality
- [ ] Check all integrations working
- [ ] Review CloudWatch metrics
- [ ] Update documentation
- [ ] Notify stakeholders

---

## Notes

- This checklist applies to **all** requirements in `requirements/`
- Infrastructure changes **require** Terraform code - no manual AWS console changes
- All deployments must go through dev/staging before production
- Requirement file status alone does not replace proper verification
- When in doubt, verify with the team before marking a requirement Done
- Keep this checklist updated as the Definition of Done evolves