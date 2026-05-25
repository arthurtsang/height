# REQ-INFRA-01: AWS ECS Deployment Infrastructure

**Status:** REJECTED

**Related Work Items:** REQ-UI-01, REQ-API-01, SAD-001

---

## Persona
As a DevOps engineer responsible for deploying the height quiz application,
I need complete infrastructure-as-code using Terraform to deploy the application on AWS ECS, so the deployment is repeatable, version-controlled, and follows best practices.

---

## Context
In order to deploy the height quiz application reliably and cost-effectively on AWS,

**Background:**
- Application consists of frontend (static files) and backend API
- Need containerized deployment for consistency
- AWS ECS Fargate for serverless container management
- Infrastructure must be reproducible across environments (dev/staging/prod)
- Cost optimization is important for this fun project

**Constraints:**
- Must use Terraform for all infrastructure
- Deploy on AWS (company standard)
- Use ECS Fargate (no EC2 management)
- Budget: ~$70/month for dev, ~$140/month for prod
- Must support HTTPS
- No manual AWS console changes allowed

**Dependencies:**
- REQ-API-01 (backend API to deploy)
- REQ-UI-01 (frontend to deploy)
- AWS account with appropriate permissions
- Domain name (optional for MVP)

---

## Requirements

### Functional Requirements

1. **VPC and Networking**
   - VPC with public and private subnets across 2 AZs
   - Internet Gateway for public subnet access
   - NAT Gateway for private subnet outbound (optional for cost savings)
   - Security groups with least privilege access
   - Network ACLs for additional security

2. **Load Balancing**
   - Application Load Balancer (ALB) in public subnets
   - Target group for ECS service
   - Health check configuration
   - HTTPS listener with ACM certificate
   - HTTP to HTTPS redirect

3. **ECS Cluster and Service**
   - ECS Cluster for container orchestration
   - Fargate task definition for backend API
   - ECS Service with desired count of 2 (HA)
   - Auto-scaling based on CPU/memory
   - CloudWatch log group for container logs

4. **Container Registry**
   - ECR repository for Docker images
   - Lifecycle policy for image cleanup
   - Image scanning enabled

5. **Caching Layer**
   - ElastiCache Redis cluster
   - Single node for dev, multi-node for prod
   - Security group allowing ECS access only
   - Automatic failover (prod only)

6. **DNS and SSL**
   - Route53 hosted zone (if custom domain)
   - ACM certificate for HTTPS
   - DNS records pointing to ALB

7. **Monitoring and Logging**
   - CloudWatch log groups for ECS tasks
   - CloudWatch metrics for ECS, ALB, Redis
   - CloudWatch alarms for critical metrics
   - SNS topic for alarm notifications

8. **Secrets Management**
   - AWS Secrets Manager or Parameter Store
   - Store Redis connection details
   - Store any API keys or sensitive config

### Non-Functional Requirements

1. **Reliability:**
   - Multi-AZ deployment for high availability
   - Auto-scaling to handle traffic spikes
   - Health checks and automatic recovery
   - 99.9% uptime target

2. **Security:**
   - All traffic encrypted in transit (HTTPS)
   - Security groups with minimal access
   - No public access to Redis
   - IAM roles with least privilege
   - Secrets stored securely

3. **Cost Optimization:**
   - Use Fargate Spot for dev environment
   - Single NAT Gateway (or none for dev)
   - t3.micro Redis for dev
   - Lifecycle policies for log retention
   - Auto-scaling to scale down during low traffic

4. **Maintainability:**
   - All infrastructure defined in Terraform
   - Modular Terraform code (reusable modules)
   - Clear variable naming and documentation
   - Separate environments (dev/staging/prod)
   - State stored in S3 with locking

5. **Scalability:**
   - Auto-scaling from 2 to 4 tasks
   - ALB can handle increased traffic
   - Redis can be upgraded without downtime
   - Easy to add more environments

---

## Acceptance Criteria

### AC1: VPC Creation
**Given** Terraform code is applied
**When** VPC module is executed
**Then** a VPC is created with:
- CIDR block 10.0.0.0/16
- 2 public subnets in different AZs
- 2 private subnets in different AZs
- Internet Gateway attached
- Route tables configured correctly

**Test Category:** @req-infra-01 @networking
**Verification:** Automated (terraform plan/apply)

### AC2: Security Groups
**Given** infrastructure is deployed
**When** security groups are created
**Then** the following rules exist:
- ALB SG: Allow 80, 443 from 0.0.0.0/0
- ECS SG: Allow traffic from ALB SG only
- Redis SG: Allow 6379 from ECS SG only
- All outbound traffic allowed

**Test Category:** @req-infra-01 @security
**Verification:** Automated

### AC3: ALB Configuration
**Given** ALB is created
**When** configuration is applied
**Then** ALB has:
- Listeners on ports 80 and 443
- HTTP redirects to HTTPS
- Target group with health check on /api/health
- Health check interval 30s, timeout 5s
- Healthy threshold 2, unhealthy threshold 3

**Test Category:** @req-infra-01 @load-balancer
**Verification:** Automated

### AC4: ECS Task Definition
**Given** ECS task definition is created
**When** task is registered
**Then** task definition includes:
- Container image from ECR
- CPU: 256, Memory: 512
- Port mapping: 3000
- Environment variables for Redis
- CloudWatch logs configuration
- IAM execution role

**Test Category:** @req-infra-01 @ecs
**Verification:** Automated

### AC5: ECS Service Deployment
**Given** ECS service is created
**When** service is deployed
**Then** service has:
- Desired count: 2
- Launch type: Fargate
- Network mode: awsvpc
- Load balancer attached
- Health check grace period: 60s
- Deployment configuration: rolling update

**Test Category:** @req-infra-01 @ecs
**Verification:** Automated

### AC6: Auto-Scaling Configuration
**Given** ECS service is running
**When** auto-scaling is configured
**Then** scaling policy exists:
- Min capacity: 2
- Max capacity: 4
- Target CPU utilization: 70%
- Scale-out cooldown: 60s
- Scale-in cooldown: 300s

**Test Category:** @req-infra-01 @scaling
**Verification:** Automated

### AC7: Redis Cluster Creation
**Given** ElastiCache is provisioned
**When** Redis cluster is created
**Then** cluster has:
- Engine: Redis 7.x
- Node type: t3.micro (dev) or t3.small (prod)
- Number of nodes: 1 (dev) or 2 (prod)
- Automatic failover enabled (prod only)
- Encryption at rest enabled
- Encryption in transit enabled

**Test Category:** @req-infra-01 @redis
**Verification:** Automated

### AC8: CloudWatch Logging
**Given** ECS tasks are running
**When** application logs are generated
**Then** logs are:
- Sent to CloudWatch log group
- Retained for 7 days (dev) or 30 days (prod)
- Accessible via AWS console
- Structured in JSON format

**Test Category:** @req-infra-01 @logging
**Verification:** Manual

### AC9: CloudWatch Alarms
**Given** infrastructure is deployed
**When** alarms are created
**Then** alarms exist for:
- ECS CPU > 80% for 5 minutes
- ECS Memory > 80% for 5 minutes
- ALB 5xx errors > 10 in 5 minutes
- ALB target unhealthy count > 0
- Redis CPU > 75% for 5 minutes

**Test Category:** @req-infra-01 @monitoring
**Verification:** Automated

### AC10: Terraform State Management
**Given** Terraform is configured
**When** state backend is set up
**Then** state is:
- Stored in S3 bucket
- Encrypted at rest
- Versioned
- Locked using DynamoDB
- Separate state per environment

**Test Category:** @req-infra-01 @terraform
**Verification:** Manual

### AC11: Environment Separation
**Given** multiple environments exist
**When** Terraform is applied
**Then** each environment has:
- Separate VPC
- Separate ECS cluster
- Separate Redis cluster
- Environment-specific naming (dev-, staging-, prod-)
- Environment-specific sizing

**Test Category:** @req-infra-01 @environments
**Verification:** Automated

### AC12: Secrets Management
**Given** sensitive configuration exists
**When** secrets are stored
**Then** secrets are:
- Stored in AWS Secrets Manager
- Encrypted at rest
- Accessible only by ECS task role
- Rotated automatically (if applicable)
- Never in Terraform code or logs

**Test Category:** @req-infra-01 @security
**Verification:** Manual

### AC13: Health Check Validation
**Given** application is deployed
**When** ALB performs health checks
**Then** health checks:
- Target /api/health endpoint
- Return 200 OK when healthy
- Mark target unhealthy after 3 failures
- Mark target healthy after 2 successes
- Trigger auto-recovery if unhealthy

**Test Category:** @req-infra-01 @health
**Verification:** Automated

### AC14: HTTPS Configuration
**Given** ACM certificate is issued
**When** ALB is configured
**Then** HTTPS works:
- Certificate is valid
- TLS 1.2+ only
- HTTP redirects to HTTPS
- No certificate warnings
- Secure headers configured

**Test Category:** @req-infra-01 @security
**Verification:** Manual

### AC15: Cost Validation
**Given** infrastructure is running for 1 month
**When** AWS bill is reviewed
**Then** costs are:
- Dev environment: < $80/month
- Prod environment: < $150/month
- No unexpected charges
- Cost allocation tags applied

**Test Category:** @req-infra-01 @cost
**Verification:** Manual

---

## Design References

- **SAD:** [designs/SAD-001-height-prediction-app.md]
- **ADR:** [designs/ADR-001-aws-ecs-deployment.md] (to be created)
- **Architecture Diagram:** [designs/diagrams/aws-architecture.png] (to be created)
- **Terraform Modules:** terraform/modules/

**Design/Implementation Parity:** 
- [ ] Infrastructure matches architecture diagram
- [ ] All resources defined in Terraform
- [ ] No manual AWS console changes
- [ ] Security best practices followed

---

## Test Scenarios

### Test Coverage Map
| Acceptance Criterion | Test File/Suite | Test Scenario ID | Status |
|---------------------|-----------------|------------------|--------|
| AC1 | terraform/test/vpc_test.go | @req-infra-01 VPC | Pending |
| AC2 | terraform/test/security_test.go | @req-infra-01 SG | Pending |
| AC3 | terraform/test/alb_test.go | @req-infra-01 ALB | Pending |
| AC4 | terraform/test/ecs_test.go | @req-infra-01 Task def | Pending |
| AC5 | terraform/test/ecs_test.go | @req-infra-01 Service | Pending |
| AC6 | terraform/test/scaling_test.go | @req-infra-01 Scaling | Pending |
| AC7 | terraform/test/redis_test.go | @req-infra-01 Redis | Pending |
| AC8 | manual/logging.md | @req-infra-01 Logs | Pending |
| AC9 | terraform/test/alarms_test.go | @req-infra-01 Alarms | Pending |
| AC10 | manual/state.md | @req-infra-01 State | Pending |
| AC11 | terraform/test/env_test.go | @req-infra-01 Envs | Pending |
| AC12 | manual/secrets.md | @req-infra-01 Secrets | Pending |
| AC13 | integration/health_test.go | @req-infra-01 Health | Pending |
| AC14 | manual/https.md | @req-infra-01 HTTPS | Pending |
| AC15 | manual/cost.md | @req-infra-01 Cost | Pending |

### Test Annotations Required
- **Requirement reference:** `REQ-INFRA-01`
- **Category tags:** `@infrastructure`, `@terraform`, `@aws`, `@ecs`
- **Feature tags:** `@req-infra-01`

### Human Verification Required
- [ ] Infrastructure deployed successfully to dev
- [ ] Application accessible via ALB
- [ ] Logs visible in CloudWatch
- [ ] Alarms configured and tested
- [ ] Costs within budget
- [ ] Security groups properly configured
- [ ] HTTPS working correctly

### Test Report
[Test results will be documented here once infrastructure is deployed]

---

## Definition of Done Checklist

### 1. Requirement Completeness
- [x] Context explains why we are doing this
- [x] Requirements (functional & non-functional) are documented
- [x] Acceptance criteria are testable and unambiguous
- [x] Design references are linked to `designs/` folder
- [ ] Design/implementation parity is confirmed

### 2. Tests and Traceability
- [ ] Test scenarios documented and mapped to acceptance criteria
- [ ] Test scenarios annotated with requirement reference (REQ-INFRA-01)
- [ ] Terraform validation passes
- [ ] Infrastructure deployed to dev successfully
- [ ] All health checks passing
- [ ] Test report documented in this requirement file

### 3. Pull Request
- [ ] PR title includes REQ ID (e.g., "infra: AWS ECS deployment [REQ-INFRA-01]")
- [ ] PR description links this requirement file and design docs
- [ ] Terraform code reviewed and approved

### 4. Code Integration
- [ ] Requirement reference in branch name (e.g., feature/REQ-INFRA-01-ecs-infra)
- [ ] Requirement reference in commit messages
- [ ] All DoD items satisfied

### 5. Infrastructure & Deployment
- [x] Terraform code provided for all AWS resources
- [ ] terraform fmt applied
- [ ] terraform validate passes
- [ ] terraform plan reviewed
- [ ] Deployed to dev environment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Rollback procedure tested
- [ ] Architecture diagram created
- [ ] Deployment runbook created

### 6. Documentation
- [ ] Terraform modules documented
- [ ] Variable descriptions complete
- [ ] Output descriptions complete
- [ ] README with deployment instructions
- [ ] Troubleshooting guide
- [ ] Cost breakdown documented

---

## Notes

**Open Questions:**
- Do we need a custom domain or can we use ALB DNS?
- Should we use NAT Gateway in dev or allow direct internet access?
- Do we want blue/green deployment capability?
- Should we set up CI/CD pipeline now or later?

**Assumptions:**
- AWS account already exists with appropriate permissions
- Terraform state bucket will be created manually first
- ACM certificate can be requested (if custom domain)
- Budget approved for estimated costs
- Single region deployment (us-east-1 or us-west-2)

**Follow-up Items:**
- Create ADR for AWS ECS decision - Owner: TBD, Due: TBD
- Create architecture diagram - Owner: TBD, Due: TBD
- Set up CI/CD pipeline (separate requirement) - Owner: TBD, Due: TBD
- Create deployment runbook - Owner: TBD, Due: TBD
- Set up cost alerts - Owner: TBD, Due: TBD