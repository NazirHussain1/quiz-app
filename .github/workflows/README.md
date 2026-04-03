# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated testing, building, and deployment.

## Workflows

### 1. Main CI/CD Pipeline (`main.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

1. **Install Dependencies**
   - Caches `node_modules` for faster subsequent runs
   - Caches Next.js build cache
   - Uses `npm ci` for reproducible builds

2. **Lint Code**
   - Runs ESLint on all code
   - Fails if linting errors found
   - Uses cached dependencies

3. **Run Tests**
   - Executes Jest test suite with coverage
   - Uploads coverage to Codecov
   - Archives test results as artifacts
   - Requires 70% coverage threshold

4. **Build Project**
   - Builds Next.js application
   - Verifies build succeeds
   - Uploads build artifacts
   - Checks build size

5. **Security Audit**
   - Runs `npm audit` for vulnerabilities
   - Executes Snyk security scan
   - Continues on non-critical issues

6. **Deploy to Vercel**
   - Only runs on `main` branch pushes
   - Deploys to production
   - Comments deployment URL on PR

7. **Status Check**
   - Required check for branch protection
   - Fails if any critical job fails
   - Prevents merge if build broken

**Optimizations:**
- Parallel job execution
- Aggressive caching (node_modules, Next.js cache)
- Concurrency control (cancels outdated runs)
- Artifact retention (7 days)

### 2. Preview Deployment (`preview.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Features:**
- Deploys preview to Vercel
- Comments PR with preview URL
- Auto-updates on new commits
- Isolated preview environment

### 3. Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests

**Features:**
- Reviews dependency changes
- Checks for security vulnerabilities
- Blocks problematic licenses (GPL-3.0, AGPL-3.0)
- Comments summary in PR

### 4. Performance Monitoring (`performance.yml`)

**Triggers:**
- Push to `main`
- Pull requests to `main`

**Features:**
- Lighthouse CI audits
- Bundle size analysis
- Performance regression detection
- Uploads performance reports

### 5. Dependabot (`dependabot.yml`)

**Features:**
- Weekly dependency updates (Mondays 9 AM)
- Groups related updates
- Ignores major version updates for stable deps
- Auto-labels PRs
- Updates GitHub Actions versions

## Setup Instructions

### 1. Required Secrets

Add these secrets in GitHub repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required:**
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

**Optional:**
- `JWT_SECRET` - JWT secret for tests (auto-generated if not set)
- `MONGODB_URI` - MongoDB connection for tests
- `NEXTAUTH_SECRET` - NextAuth secret for tests
- `CODECOV_TOKEN` - Codecov upload token
- `SNYK_TOKEN` - Snyk security scan token

### 2. Get Vercel Credentials

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Get credentials
vercel env pull .env.vercel
cat .vercel/project.json
```

Copy values:
- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

Generate token:
- Go to https://vercel.com/account/tokens
- Create new token → Copy to `VERCEL_TOKEN`

### 3. Branch Protection Rules

Enable branch protection for `main`:

```
Settings → Branches → Add rule
```

**Required status checks:**
- ✅ Lint Code
- ✅ Run Tests
- ✅ Build Project
- ✅ Status Check

**Settings:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Include administrators

### 4. Enable Dependabot

```
Settings → Code security and analysis → Dependabot
```

- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates
- ✅ Enable Dependabot version updates

## Workflow Execution

### On Push to Main

```
1. Install Dependencies (parallel with cache)
2. Lint + Test + Security (parallel)
3. Build Project
4. Deploy to Vercel Production
5. Status Check
```

### On Pull Request

```
1. Install Dependencies
2. Lint + Test + Security (parallel)
3. Build Project
4. Deploy Preview to Vercel
5. Comment PR with preview URL
6. Dependency Review
7. Performance Check
8. Status Check (blocks merge if failed)
```

## Performance Optimizations

### Caching Strategy

1. **node_modules Cache**
   - Key: `package-lock.json` hash
   - Saves ~2-3 minutes per run
   - Restored in all jobs

2. **Next.js Build Cache**
   - Key: package-lock + source files hash
   - Speeds up builds by 50-70%
   - Incremental builds

3. **npm Cache**
   - Built-in Node.js action cache
   - Caches npm global cache
   - Faster `npm ci` execution

### Parallel Execution

Jobs run in parallel when possible:
- Lint, Test, Security run simultaneously
- Only Build waits for all three
- Deploy waits for Build + Security

### Concurrency Control

- Cancels outdated workflow runs
- Saves CI minutes
- Faster feedback on latest changes

## Monitoring & Debugging

### View Workflow Runs

```
Actions tab → Select workflow → View run
```

### Download Artifacts

```
Workflow run → Artifacts section → Download
```

Available artifacts:
- Test results and coverage
- Build artifacts (.next/)
- Bundle analysis reports
- Performance reports

### Debug Failed Runs

1. Check job logs for errors
2. Review test output in artifacts
3. Check coverage reports
4. Verify environment variables
5. Test locally with same Node version

### Local Testing

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run tests
npm run test:ci

# Build project
npm run build

# Check for issues
npm audit
```

## Cost Optimization

### GitHub Actions Minutes

- Free tier: 2,000 minutes/month
- Typical run: 5-8 minutes
- ~250-400 runs/month on free tier

### Optimization Tips

1. Use caching aggressively
2. Cancel outdated runs
3. Run expensive jobs conditionally
4. Use matrix builds sparingly
5. Optimize test execution time

## Troubleshooting

### Build Fails on CI but Works Locally

- Check Node.js version matches
- Verify environment variables
- Clear local cache: `rm -rf .next node_modules`
- Run `npm ci` instead of `npm install`

### Tests Timeout

- Increase timeout in jest.config.js
- Check for hanging promises
- Mock external API calls
- Use `--runInBand` for serial execution

### Deployment Fails

- Verify Vercel credentials
- Check Vercel project settings
- Review deployment logs
- Ensure build succeeds locally

### Cache Issues

- Clear cache: Delete workflow cache in Actions tab
- Update cache key in workflow
- Verify cache paths are correct

## Best Practices

1. **Keep workflows fast** - Target < 10 minutes
2. **Use caching** - Cache everything possible
3. **Fail fast** - Run quick checks first
4. **Parallel execution** - Run independent jobs in parallel
5. **Clear feedback** - Use descriptive job names
6. **Security first** - Run security checks on every PR
7. **Monitor performance** - Track build times and bundle size
8. **Clean artifacts** - Set retention periods
9. **Document changes** - Update this README
10. **Test locally** - Verify before pushing

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js CI/CD Guide](https://nextjs.org/docs/deployment)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Jest CI Configuration](https://jestjs.io/docs/configuration#ci-boolean)
- [Codecov Documentation](https://docs.codecov.com/docs)
