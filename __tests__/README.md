# Testing Guide

This directory contains all tests for the Quiz App project.

## Test Structure

```
__tests__/
├── api/                    # API route tests
│   ├── auth/
│   │   ├── login.test.js
│   │   └── signup.test.js
│   └── questions.test.js
├── lib/                    # Library/utility tests
│   └── auth.test.js
├── services/               # Service layer tests
│   ├── quizService.test.js
│   └── leaderboardService.test.js
└── utils/                  # Test utilities
    └── testUtils.js
```

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only API tests
npm run test:api
```

## Test Coverage

Current coverage targets:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Writing Tests

### Unit Tests

Test individual functions and modules:

```javascript
import { hashPassword } from '@/app/lib/auth';

describe('hashPassword', () => {
  it('should hash a password successfully', async () => {
    const password = 'testPassword123';
    const hashed = await hashPassword(password);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);
  });
});
```

### API Tests

Test API routes with mocked dependencies:

```javascript
import { POST } from '@/app/api/auth/login/route';
import { createMockRequest } from '../utils/testUtils';

describe('POST /api/auth/login', () => {
  it('should login successfully', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### Service Tests

Test business logic with mocked external dependencies:

```javascript
import { fetchQuestions } from '@/app/services/quizService';

describe('fetchQuestions', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should fetch questions successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response_code: 0, results: [] }),
    });

    const questions = await fetchQuestions({});

    expect(questions).toEqual([]);
  });
});
```

## Test Utilities

### Mock Data

Use predefined mock data from `testUtils.js`:

```javascript
import { mockUser, mockQuestion, mockResult } from '../utils/testUtils';
```

### Mock MongoDB

```javascript
import { mockCollection, resetMocks } from '../utils/testUtils';

beforeEach(() => {
  resetMocks();
  mockCollection.findOne.mockResolvedValue(mockUser);
});
```

### Mock Requests

```javascript
import { createMockRequest } from '../utils/testUtils';

const request = createMockRequest({
  method: 'POST',
  url: 'http://localhost:3000/api/test',
  headers: { 'Content-Type': 'application/json' },
  body: { key: 'value' },
});
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
   ```javascript
   it('should do something', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = doSomething(input);
     
     // Assert
     expect(result).toBe('expected');
   });
   ```

2. **One assertion per test**: Keep tests focused
   ```javascript
   // Good
   it('should return user email', () => {
     expect(user.email).toBe('test@example.com');
   });
   
   it('should return user name', () => {
     expect(user.name).toBe('Test User');
   });
   ```

3. **Use descriptive test names**: Make failures clear
   ```javascript
   // Good
   it('should reject login with invalid email format', () => {
     // ...
   });
   
   // Bad
   it('should fail', () => {
     // ...
   });
   ```

4. **Clean up after tests**: Reset mocks and state
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
     resetMocks();
   });
   ```

5. **Test edge cases**: Don't just test happy paths
   ```javascript
   it('should handle empty input', () => {
     expect(validate('')).toBe(false);
   });
   
   it('should handle null input', () => {
     expect(validate(null)).toBe(false);
   });
   
   it('should handle undefined input', () => {
     expect(validate(undefined)).toBe(false);
   });
   ```

6. **Mock external dependencies**: Keep tests isolated
   ```javascript
   jest.mock('@/app/lib/mongodb');
   jest.mock('@/app/lib/email');
   ```

## Debugging Tests

### Run specific test file
```bash
npm test -- auth.test.js
```

### Run specific test
```bash
npm test -- -t "should login successfully"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

CI configuration ensures:
- All tests pass
- Coverage thresholds met
- No console errors
- Linting passes

## Troubleshooting

### Tests timing out
Increase timeout in jest.config.js:
```javascript
testTimeout: 10000
```

### Mock not working
Ensure mock is defined before import:
```javascript
jest.mock('@/app/lib/module');
import { function } from '@/app/lib/module';
```

### Coverage not accurate
Clear Jest cache:
```bash
npm test -- --clearCache
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Mocking Guide](https://jestjs.io/docs/mock-functions)
