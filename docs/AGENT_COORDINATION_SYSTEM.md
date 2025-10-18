# Agent Coordination System

## Overview

This document establishes a comprehensive coordination system for multiple AI agents working on the Bluequee2 medical practice management system. The system ensures efficient collaboration, prevents conflicts, and enables agents to compare their work effectively.

## Agent Work Isolation Matrix

| Agent Type | Primary Files | Secondary Files | Avoid | Coordinate With |
|------------|---------------|-----------------|-------|-----------------|
| **Backend Agent** | `src/api/*`<br>`env.example`<br>`src/hooks/useApi.*` | `src/contexts/AuthContext.*`<br>`src/utils/security.*` | UI components<br>Styling files | Security Agent |
| **Frontend Agent** | `src/components/*`<br>`src/pages/*`<br>`src/index.css`<br>`src/App.*` | `src/components/ui/*`<br>`tailwind.config.js` | API configuration<br>Backend logic | Performance Agent |
| **DevOps Agent** | `Dockerfile`<br>`docker-compose*`<br>`nginx.conf`<br>`deploy.sh` | `package.json`<br>`vite.config.js` | Application code<br>Component logic | All agents |
| **Testing Agent** | `src/tests/*`<br>`vitest.config.js`<br>`playwright.config.js`<br>`test-*.js` | All source files (read-only) | Modifying source code | All agents |
| **Performance Agent** | `vite.config.js`<br>`src/pages/index.*` (lazy loading)<br>`src/lib/utils.*` | `package.json`<br>`tailwind.config.js` | Component logic<br>Business logic | Frontend Agent |
| **Security Agent** | `src/contexts/AuthContext.*`<br>`src/components/ProtectedRoute.*`<br>`src/utils/security.*` | `src/api/base44Client.*`<br>`src/utils/permissionMatrix.*` | UI styling<br>Component design | Backend Agent |
| **Documentation Agent** | `docs/*`<br>`README.md`<br>`CONTRIBUTING.md` | All files (read-only) | Code changes | All agents |

## Agent Communication Protocol

### 1. Daily Status Updates

Each agent must provide daily status updates in the following format:

```markdown
## Agent Status Report - [DATE]

### Agent: [AGENT_TYPE]
### Current Task: [TASK_DESCRIPTION]
### Files Modified: [LIST_OF_FILES]
### Progress: [PERCENTAGE_COMPLETE]
### Blockers: [ANY_BLOCKERS]
### Next Steps: [PLANNED_ACTIONS]
### Coordination Needed: [WITH_WHICH_AGENTS]
```

### 2. Cross-Agent Communication

#### Integration Points
- **Backend ↔ Security**: Authentication implementation
- **Frontend ↔ Performance**: Code splitting and optimization
- **All ↔ Testing**: Test coverage and quality assurance
- **DevOps ↔ All**: Deployment and infrastructure changes

#### Communication Channels
1. **Immediate Coordination**: Direct agent-to-agent communication
2. **Status Sharing**: Centralized status board
3. **Conflict Resolution**: Escalation to coordination system
4. **Integration Planning**: Scheduled coordination meetings

### 3. Conflict Prevention

#### File Lock System
```bash
# Before modifying shared files, agents must:
1. Check file lock status
2. Request lock if needed
3. Coordinate with other agents
4. Release lock after completion
```

#### Pre-commit Checks
- Verify no conflicts with other agents' work
- Ensure all tests pass
- Validate code quality standards
- Check integration points

## Progress Tracking System

### 1. Work Progress Dashboard

| Agent | Current Task | Progress | Files Modified | Last Update | Status |
|-------|--------------|----------|----------------|-------------|---------|
| Backend | API Integration | 75% | 3 files | 2 hours ago | Active |
| Frontend | Patient Forms | 60% | 5 files | 1 hour ago | Active |
| Testing | E2E Tests | 40% | 2 files | 3 hours ago | Active |
| Security | Auth Implementation | 90% | 2 files | 30 min ago | Review |

### 2. Comparison System

#### Code Comparison
- **Before/After**: Show changes made by each agent
- **Integration Impact**: Highlight how changes affect other agents
- **Quality Metrics**: Compare code quality across agents

#### Feature Comparison
- **Functionality**: Compare implemented features
- **Performance**: Compare performance improvements
- **Security**: Compare security implementations

### 3. Integration Status

| Integration Point | Status | Backend Agent | Frontend Agent | Security Agent | Testing Agent |
|-------------------|--------|---------------|----------------|----------------|---------------|
| Authentication | ✅ Complete | ✅ Ready | ✅ Ready | ✅ Ready | ✅ Tested |
| Patient Management | 🔄 In Progress | ✅ Ready | 🔄 Working | ✅ Ready | 🔄 Testing |
| Billing System | ⏳ Pending | ⏳ Pending | ⏳ Pending | ✅ Ready | ⏳ Pending |

## Quality Gates

### 1. Pre-Integration Checks

Each agent must complete these checks before integration:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No conflicts with other agents' work
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance impact assessed

### 2. Integration Testing

- **Unit Tests**: Each agent's code must have unit tests
- **Integration Tests**: Cross-agent functionality must be tested
- **E2E Tests**: End-to-end workflows must be tested
- **Performance Tests**: Performance impact must be measured

### 3. Review Process

1. **Self Review**: Agent reviews their own changes
2. **Peer Review**: Another agent reviews the changes
3. **Integration Review**: Cross-agent impact assessment
4. **Final Review**: System-wide impact evaluation

## Coordination Commands

### 1. Status Commands

```bash
# Get current status of all agents
./coordinate.sh status

# Get status of specific agent
./coordinate.sh status --agent=backend

# Get integration status
./coordinate.sh integration-status
```

### 2. Coordination Commands

```bash
# Request coordination with another agent
./coordinate.sh request-coordination --agent=frontend --reason="API integration"

# Check for conflicts
./coordinate.sh check-conflicts --files="src/api/apiClient.js"

# Schedule integration meeting
./coordinate.sh schedule-integration --agents="backend,security" --topic="auth implementation"
```

### 3. Progress Commands

```bash
# Update progress
./coordinate.sh update-progress --agent=backend --progress=75 --task="API integration"

# Compare progress
./coordinate.sh compare-progress --agents="frontend,backend"

# Generate progress report
./coordinate.sh progress-report --format=markdown
```

## Conflict Resolution Process

### 1. Conflict Detection

- **Automatic**: System detects file conflicts
- **Manual**: Agents report potential conflicts
- **Integration**: Conflicts discovered during integration

### 2. Conflict Resolution Steps

1. **Identify**: Determine the nature of the conflict
2. **Communicate**: Notify all affected agents
3. **Coordinate**: Plan resolution approach
4. **Resolve**: Implement solution
5. **Verify**: Test resolution
6. **Document**: Record resolution for future reference

### 3. Escalation Process

1. **Agent Level**: Direct communication between agents
2. **Coordination Level**: System coordination
3. **Management Level**: Human intervention if needed

## Best Practices

### 1. Communication

- **Be Proactive**: Communicate early and often
- **Be Clear**: Use specific, actionable language
- **Be Collaborative**: Work together, not in isolation
- **Be Responsive**: Respond to coordination requests promptly

### 2. Code Quality

- **Follow Standards**: Adhere to established coding standards
- **Write Tests**: Include comprehensive test coverage
- **Document Changes**: Document all significant changes
- **Review Code**: Participate in code reviews

### 3. Integration

- **Plan Early**: Plan integrations before implementation
- **Test Thoroughly**: Test all integration points
- **Monitor Continuously**: Monitor integration health
- **Document Patterns**: Document integration patterns

## Monitoring and Metrics

### 1. Performance Metrics

- **Velocity**: Tasks completed per day
- **Quality**: Bug rate, test coverage
- **Collaboration**: Cross-agent coordination success
- **Integration**: Integration success rate

### 2. Health Checks

- **Code Quality**: Automated quality checks
- **Test Coverage**: Test coverage metrics
- **Integration Health**: Integration point monitoring
- **Performance**: Performance regression detection

### 3. Reporting

- **Daily Reports**: Daily progress and status
- **Weekly Reports**: Weekly summary and metrics
- **Monthly Reports**: Monthly analysis and improvements

## Emergency Procedures

### 1. Critical Issues

- **Immediate Notification**: Alert all agents immediately
- **Emergency Coordination**: Rapid response coordination
- **Rollback Procedures**: Quick rollback if needed
- **Post-Incident Review**: Learn from incidents

### 2. System Failures

- **Backup Procedures**: Use backup systems
- **Recovery Plans**: Implement recovery procedures
- **Communication**: Keep all agents informed
- **Documentation**: Document all actions taken

## Conclusion

This coordination system ensures efficient collaboration between multiple AI agents while maintaining code quality and preventing conflicts. Success depends on adherence to the established protocols and active participation in the coordination process.

For questions or issues, contact the coordination system or refer to the specific agent documentation.
