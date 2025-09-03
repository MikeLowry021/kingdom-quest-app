# CI/CD Integration Guide

**Automated Testing Pipeline Setup for KingdomQuest**

## Overview

This document outlines the setup and configuration for continuous integration and continuous deployment (CI/CD) pipelines that ensure theological accuracy, content safety, and accessibility compliance for KingdomQuest.

## GitHub Actions Workflow

### Main Workflow File (`.github/workflows/test.yml`)

```yaml
name: KingdomQuest Testing Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: true

  theology-validation:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run theology validation tests
      run: npm run test:theology
    
    - name: Validate scripture citations
      run: npm run validate:scripture
    
    - name: Check doctrinal soundness
      run: npm run validate:doctrine

  safety-moderation:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run safety moderation tests
      run: npm run test:safety
    
    - name: Validate content filtering
      run: npm run validate:content-filter
    
    - name: Test age-tier restrictions
      run: npm run validate:age-tiers

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [theology-validation, safety-moderation]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Install Playwright browsers
      run: npx playwright install
    
    - name: Build application
      run: npm run build
    
    - name: Start application
      run: npm start &
    
    - name: Wait for application
      run: npx wait-on http://localhost:3000
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/

  accessibility-tests:
    runs-on: ubuntu-latest
    needs: e2e-tests
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Install Playwright browsers
      run: npx playwright install
    
    - name: Build application
      run: npm run build
    
    - name: Start application
      run: npm start &
    
    - name: Wait for application
      run: npx wait-on http://localhost:3000
    
    - name: Run accessibility tests
      run: npm run test:a11y
    
    - name: Generate accessibility report
      run: npm run report:a11y
    
    - name: Upload accessibility report
      uses: actions/upload-artifact@v3
      with:
        name: accessibility-report
        path: a11y-report/
```

## Package.json Test Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:theology": "jest --testPathPattern=tests/unit/theology",
    "test:safety": "jest --testPathPattern=tests/unit/safety",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "playwright test --grep=accessibility",
    "validate:scripture": "node scripts/validate-scripture.js",
    "validate:doctrine": "node scripts/validate-doctrine.js",
    "validate:content-filter": "node scripts/validate-content-filter.js",
    "validate:age-tiers": "node scripts/validate-age-tiers.js",
    "report:a11y": "node scripts/generate-a11y-report.js"
  }
}
```

## Quality Gates

### Pre-commit Hooks (`.husky/pre-commit`)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run unit tests
npm run test:unit

# Run theology validation
npm run validate:scripture

# Run safety validation
npm run validate:content-filter
```

### Pull Request Requirements

1. **Code Coverage**: Minimum 80% overall coverage
2. **Theology Tests**: 100% pass rate on theology validation
3. **Safety Tests**: 100% pass rate on safety moderation
4. **Accessibility**: WCAG 2.1 AA compliance
5. **E2E Tests**: All critical user journeys pass

## Branch Protection Rules

### Main Branch Protection
- Require pull request reviews (minimum 2 reviewers)
- Require status checks to pass before merging:
  - unit-tests
  - theology-validation  
  - safety-moderation
  - e2e-tests
  - accessibility-tests
- Require branches to be up to date before merging
- Restrict pushes to matching branches

### Develop Branch Protection
- Require pull request reviews (minimum 1 reviewer)
- Require status checks to pass before merging:
  - unit-tests
  - theology-validation
  - safety-moderation

## Environment-Specific Testing

### Staging Environment
```yaml
staging-tests:
  runs-on: ubuntu-latest
  environment: staging
  
  steps:
  - name: Run full test suite against staging
    env:
      TEST_BASE_URL: https://staging.kingdomquest.com
    run: |
      npm run test:e2e
      npm run test:a11y
      npm run validate:content
```

### Production Environment
```yaml
production-smoke-tests:
  runs-on: ubuntu-latest
  environment: production
  if: github.ref == 'refs/heads/main'
  
  steps:
  - name: Run smoke tests against production
    env:
      TEST_BASE_URL: https://kingdomquest.com
    run: |
      npm run test:smoke
      npm run test:critical-paths
```

## Monitoring and Alerting

### Test Failure Notifications
```yaml
  notify-failures:
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests, theology-validation, safety-moderation]
    if: failure()
    
    steps:
    - name: Send Slack notification
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#dev-alerts'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Coverage Tracking
```yaml
  coverage-report:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
    - name: Comment PR with coverage
      uses: marocchino/sticky-pull-request-comment@v2
      with:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        path: coverage/coverage-summary.json
```

## Performance Testing Integration

### Lighthouse CI
```yaml
  lighthouse:
    runs-on: ubuntu-latest
    needs: e2e-tests
    
    steps:
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v9
      with:
        configPath: '.lighthouserc.json'
        uploadArtifacts: true
        temporaryPublicStorage: true
```

### Load Testing
```yaml
  load-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Run load tests
      run: |
        npm run test:load
        npm run analyze:performance
```

## Security Testing

### OWASP ZAP Security Testing
```yaml
  security-tests:
    runs-on: ubuntu-latest
    needs: e2e-tests
    
    steps:
    - name: ZAP Scan
      uses: zaproxy/action-full-scan@v0.4.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'
```

## Deployment Pipeline

### Staging Deployment
```yaml
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [unit-tests, theology-validation, safety-moderation, e2e-tests]
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Deploy to staging
      run: |
        npm run build
        npm run deploy:staging
    
    - name: Run post-deployment tests
      run: |
        npm run test:staging
```

### Production Deployment
```yaml
  deploy-production:
    runs-on: ubuntu-latest
    needs: [staging-tests, accessibility-tests, security-tests]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      run: |
        npm run build
        npm run deploy:production
    
    - name: Run post-deployment smoke tests
      run: |
        npm run test:smoke:production
```