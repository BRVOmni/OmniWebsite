# 🔄 GitLab Workflow Guide

**Corporate Food Service Dashboard**

---

## 📋 Overview

This guide explains how to use GitLab for collaboration, version control, and production deployment of the Corporate Food Service Dashboard.

**Repository:** https://gitlab.com/sbrv-group/omniprise

---

## 🏗️ GitLab Project Structure

### Main Branches

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production code | ✅ Protected |
| `develop` | Development integration | ✅ Protected |
| `feature/*` | Feature development | ❌ Not protected |
| `hotfix/*` | Emergency production fixes | ❌ Not protected |

### Directory Structure

```
corporate-food-dashboard/
├── src/                    # Source code
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # Utilities & helpers
│   └── hooks/             # Custom hooks
├── supabase/              # Database migrations
├── public/                # Static assets
├── CHANGELOG.md           # Version history
├── DEPLOYMENT.md          # Deployment guide
├── README.md              # Project documentation
└── .gitlab-ci.yml         # CI/CD configuration
```

---

## 🚀 Standard Workflow

### 1. Feature Development

**Step 1: Create Feature Branch**
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-issue` - Emergency fixes
- `refactor/component-name` - Code refactoring

**Step 2: Make Changes**
```bash
# Make your changes
npm run dev  # Test locally

# Run linting
npm run lint

# Build to verify
npm run build
```

**Step 3: Commit Changes**
```bash
git add .
git commit -m "feat: add feature description

- Detail what was added
- Mention any breaking changes
- Reference related issues

Co-Authored-By: Your Name <your.email>"
```

**Commit Message Format:**
```
type(scope): subject

body

footer
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(supervision): add auto-scheduling system
fix(alerts): resolve alert not showing for critical findings
docs(readme): update deployment instructions
```

**Step 4: Push and Create MR**
```bash
git push origin feature/your-feature-name
```

Then in GitLab:
1. Go to: Merge Requests → New Merge Request
2. Source: `feature/your-feature-name` → Target: `main`
3. Title: Follows commit message format
4. Description: Explain changes, add screenshots
5. Assign to: Team lead/reviewer
6. Create MR

**Step 5: Review and Merge**
- Request review from team members
- Address review feedback
- Update branch if needed
- Merge after approval

### 2. Hotfix Process (Emergency)

**For urgent production fixes:**

```bash
# From main branch
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Make minimal fix
# Test thoroughly
git add .
git commit -m "hotfix: fix critical issue in production"
git push origin hotfix/critical-issue

# Create MR to main
# Merge immediately after review
# Deploy to production
```

---

## 📝 Merge Request Guidelines

### MR Template

When creating a merge request, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All translations working (EN/ES)
- [ ] No hardcoded text
- [ ] Build passes: `npm run build`
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

### MR Review Checklist

**For Reviewers:**
- [ ] Code follows project style
- [ ] No hardcoded English text
- [ ] All translations keys exist
- [ ] Build passes without errors
- [ ] No console errors/warnings
- [ ] Responsive design maintained
- [ ] No security issues
- [ ] Documentation updated

---

## 🔄 CI/CD Pipeline

### Pipeline Stages

1. **Build** - Compile Next.js application
2. **Test** - Run linters and tests
3. **Deploy** - Deploy to environment (production/staging)

### Pipeline Status

Check pipeline status at:
- Project → CI/CD → Pipelines
- MR page → Pipelines tab

### Pipeline Failures

**If pipeline fails:**

1. **Check logs:**
   - Click on failed job
   - Review error messages
   - Identify the issue

2. **Common fixes:**
   - **Build fails:** Check for syntax errors, missing dependencies
   - **Lint fails:** Fix code style issues
   - **Deploy fails:** Check environment variables, Vercel token

3. **After fixing:**
   ```bash
   git add .
   git commit -m "fix: resolve pipeline failure"
   git push
   ```

---

## 🛠️ Common GitLab Tasks

### Viewing Project Activity

1. **Recent commits:** Project → Repository → Commits
2. **Merge requests:** Project → Merge Requests
3. **Issues:** Project → Issues
4. **Pipeline history:** Project → CI/CD → Pipelines

### Comparing Branches

1. Go to: Repository → Branches
2. Select branches to compare
3. View diffs side-by-side

### Reverting Changes

**Option 1: Create revert MR**
1. Go to: Repository → Commits
2. Find commit to revert
3. Click "Revert" button
4. Create merge request

**Option 2: Command line**
```bash
git revert <commit-hash>
git push origin branch-name
```

### Resolving Merge Conflicts

**When conflicts occur:**

```bash
# Update your branch
git fetch origin
git rebase origin/main

# Fix conflicts in your editor
# Remove conflict markers
# Test your changes

# Continue rebase
git add .
git rebase --continue

# Force push (only for your feature branch)
git push --force-with-lease origin feature/your-feature
```

### Checking File History

```bash
# File history
git log --follow -- file.txt

# Who changed what
git blame file.txt

# View specific commit
git show <commit-hash>
```

---

## 📊 Project Management

### Using Issues

**Create issue for:**
- Bug reports
- Feature requests
- Documentation updates
- Technical debt

**Issue template:**
```markdown
## Type
- [ ] Bug
- [ ] Feature
- [ ] Improvement

## Priority
- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low

## Description
Detailed description of the issue or feature request

## Steps to Reproduce (for bugs)
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser:
- Device:
- User role:

## Screenshots
If applicable, add screenshots
```

### Using Milestones

**Create milestones for:**
- Sprints (2-week periods)
- Releases (version numbers)
- Quarterly goals

**Set up milestones:**
1. Project → Milestones → New Milestone
2. Title: v1.10.0 or Sprint 23
3. Dates: Start and end dates
4. Description: Goals and objectives
5. Add issues to milestone

### Using Labels

**Common labels:**
- `bug` - Bug reports
- `enhancement` - Feature requests
- `documentation` - Docs updates
- `critical` - Urgent issues
- `good first issue` - For newcomers
- `help wanted` - Community contributions

---

## 🔐 Security Best Practices

### GitLab Security Settings

1. **Branch Protection:**
   - `main` branch: Protected
   - Require merge request
   - Require approvals (at least 1)
   - Disable force push

2. **Variable Protection:**
   - Mark sensitive variables as protected
   - Mask secrets to hide in logs
   - Rotate keys regularly

3. **Access Control:**
   - Guest: View only
   - Reporter: View + issues
   - Developer: Push to non-protected branches
   - Maintainer: Full access
   - Owner: Billing + settings

### Secure Workflow

**DO:**
- ✅ Use environment variables for secrets
- ✅ Review all code before merging
- ✅ Keep dependencies updated
- ✅ Use branch protection rules
- ✅ Enable two-factor authentication

**DON'T:**
- ❌ Commit `.env.local` files
- ❌ Push secrets or API keys
- ❌ Disable branch protection
- ❌ Merge without review
- ❌ Force push to main

---

## 📈 Monitoring & Analytics

### GitLab Analytics

**Track team performance:**
- Project → Analytics → Repository Analytics
- View: commits, MRs, issues over time

**Pipeline analytics:**
- Project → CI/CD → Pipelines
- Success rate, duration trends

### Code Quality

**Merge Request analytics:**
- Average merge time
- Number of revisions
- Review participation

**Set goals:**
- Merge MRs within 48 hours
- Respond to reviews within 24 hours
- Keep pipelines under 5 minutes

---

## 🆘 Getting Help

### Internal Resources

1. **Project Documentation:**
   - README.md - Project overview
   - CHANGELOG.md - Version history
   - DEPLOYMENT.md - Deployment guide

2. **GitLab Documentation:**
   - https://docs.gitlab.com

3. **Team Communication:**
   - Create issue for blockers
   - Tag team members in MRs
   - Use project discussions

### Escalation Path

1. **Technical Issues:** Create issue, assign to tech lead
2. **Deployment Issues:** Check DEPLOYMENT.md, contact DevOps
3. **Urgent Production Issues:** Create hotfix branch, notify team immediately

---

**Last Updated:** 2026-03-20
**Version:** 1.9.0
