#!/bin/bash

# CI/CD Setup Script
# This script helps set up GitHub Actions and Vercel integration

set -e

echo "🚀 CI/CD Pipeline Setup"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
fi

echo ""
echo "📋 Step 1: Vercel Setup"
echo "----------------------"
echo ""

# Login to Vercel
echo "Logging in to Vercel..."
vercel login

echo ""
echo "Linking project to Vercel..."
vercel link

echo ""
echo "Pulling environment variables..."
vercel env pull .env.vercel

echo ""
echo -e "${GREEN}✅ Vercel setup complete${NC}"
echo ""

# Extract Vercel credentials
if [ -f ".vercel/project.json" ]; then
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId": "[^"]*' | cut -d'"' -f4)
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*' | cut -d'"' -f4)
    
    echo "📝 Step 2: GitHub Secrets"
    echo "------------------------"
    echo ""
    echo "Add these secrets to your GitHub repository:"
    echo ""
    echo -e "${YELLOW}Settings → Secrets and variables → Actions → New repository secret${NC}"
    echo ""
    echo "VERCEL_ORG_ID:"
    echo -e "${GREEN}$ORG_ID${NC}"
    echo ""
    echo "VERCEL_PROJECT_ID:"
    echo -e "${GREEN}$PROJECT_ID${NC}"
    echo ""
    echo "VERCEL_TOKEN:"
    echo "Generate at: https://vercel.com/account/tokens"
    echo ""
else
    echo -e "${RED}❌ Could not find .vercel/project.json${NC}"
    echo "Please run 'vercel link' manually"
fi

echo ""
echo "🔐 Step 3: Optional Secrets"
echo "--------------------------"
echo ""
echo "For enhanced functionality, add these optional secrets:"
echo ""
echo "- CODECOV_TOKEN (for coverage reports)"
echo "  Get from: https://codecov.io/"
echo ""
echo "- SNYK_TOKEN (for security scanning)"
echo "  Get from: https://snyk.io/"
echo ""

echo ""
echo "🛡️  Step 4: Branch Protection"
echo "----------------------------"
echo ""
echo "Enable branch protection for 'main' branch:"
echo ""
echo "1. Go to: Settings → Branches → Add rule"
echo "2. Branch name pattern: main"
echo "3. Enable:"
echo "   ✅ Require status checks to pass before merging"
echo "   ✅ Require branches to be up to date before merging"
echo "   ✅ Lint Code"
echo "   ✅ Run Tests"
echo "   ✅ Build Project"
echo "   ✅ Status Check"
echo ""

echo ""
echo "🤖 Step 5: Enable Dependabot"
echo "---------------------------"
echo ""
echo "Enable Dependabot in repository settings:"
echo ""
echo "Settings → Code security and analysis"
echo "✅ Enable Dependabot alerts"
echo "✅ Enable Dependabot security updates"
echo "✅ Enable Dependabot version updates"
echo ""

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Add the GitHub secrets listed above"
echo "2. Configure branch protection rules"
echo "3. Enable Dependabot"
echo "4. Push to trigger your first workflow"
echo ""
echo "Test your pipeline:"
echo "  git add ."
echo "  git commit -m 'chore: setup CI/CD pipeline'"
echo "  git push"
echo ""
echo "View workflow runs:"
echo "  https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"
