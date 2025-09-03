# KingdomQuest Testing Framework

Comprehensive automated test suite for theological accuracy, content safety, accessibility compliance, and user experience quality.

## Directory Structure

```
tests/
├── unit/                 # Unit tests for components and utilities
│   ├── theology/         # TheologyGuard validation tests
│   ├── safety/          # SafetyModerator tests
│   ├── content/         # Content validation tests
│   └── age-tier/        # Age-tier logic tests
├── e2e/                 # End-to-end browser tests
│   ├── user-journey/    # Complete user workflow tests
│   ├── auth/           # Authentication flow tests
│   ├── navigation/     # Content navigation tests
│   └── accessibility/  # Accessibility compliance tests
├── fixtures/            # Mock data and test fixtures
│   ├── stories/        # Sample story content
│   ├── quizzes/        # Age-tiered quiz samples
│   ├── prayers/        # Prayer collections
│   ├── users/          # Test user profiles
│   └── media/          # Test media assets
└── utils/              # Testing utilities and helpers
```

## Testing Frameworks

- **Unit Tests**: Jest with TypeScript support
- **E2E Tests**: Playwright with multi-browser support
- **Accessibility**: @axe-core/playwright for WCAG 2.1 AA compliance
- **Coverage**: Minimum 80% coverage target

## Running Tests

```bash
# Run all unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run accessibility tests specifically
npm run test:a11y

# Generate coverage report
npm run test:coverage
```

## Compliance Focus

### Theological Accuracy
- Scripture citation validation (KJV/ESV attribution)
- Doctrinal content verification
- Age-appropriate theological concepts

### Content Safety
- Violence gating mechanisms
- Image policy enforcement
- Age-appropriate content filtering
- Inappropriate content blocklist validation

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- Color contrast validation
- Font size and responsive design

## Test Coverage Requirements

- **Minimum Coverage**: 80% across all metrics
- **Critical Paths**: 100% coverage for safety and theology validation
- **Age-Tier Logic**: Complete coverage across all age groups
- **Accessibility**: Full WCAG 2.1 AA compliance