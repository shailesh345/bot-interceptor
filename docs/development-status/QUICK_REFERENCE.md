# Quick Reference - Development Rules

## 🚀 Before Starting Any Feature

### 1. Port Management (ALWAYS FIRST)
```bash
# Check if ports are free
./scripts/check_ports.sh

# Kill ports if needed
./scripts/check_ports.sh

# Start development environment
./scripts/start_development.sh
```

**Ports**: Frontend (9889), Backend (8960)

### 2. TDD Approach (MANDATORY)
1. **Write Test First** - Always write test before implementation
2. **Red** - Test should fail initially
3. **Green** - Implement minimal code to pass test
4. **Refactor** - Clean up code while keeping tests green

### 3. Research First (REQUIRED)
- Conduct market research before implementing
- Save findings in `research/` folder
- Apply research results to implementation

## 🎨 UI/UX Standards

### Colors (STRICT)
- **Primary**: Black (#000000) and White (#FFFFFF)
- **Secondary**: Light black, Gray, Dull white, Pure black
- **Font**: Yandex font family
- **Contrast**: Black text on white background, vice versa

### Components
- **Size**: Extra small/small font and UI component sizes
- **Icons**: Lucid React icons only
- **Responsive**: All screen sizes
- **UX**: Simple and intuitive for non-technical users

## 🧪 Testing Requirements

### Coverage Target: 80% Minimum
- **Unit Tests**: 90% (high priority)
- **Integration Tests**: 80% (medium priority)
- **E2E Tests**: 70% (lower priority)

### Test Commands
```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest --cov=app

# All tests
./scripts/run_all_tests.sh
```

## 🔧 Tech Stack

### Frontend
- **Framework**: React.js → TypeScript (target)
- **Testing**: Jest + React Testing Library
- **Styling**: Tailwind CSS
- **State**: Redux Toolkit

### Backend
- **Framework**: Python → FastAPI with Pydantic (target)
- **Database**: SQLite → PostgreSQL (target)
- **Testing**: Pytest
- **Validation**: Pydantic models

## 📚 Documentation

### Required Updates
- Update `Development_Status/DAILY_LOGS.md` after each session
- Update `Development_Status/COMPLIANCE_CHECKLIST.md` for rule compliance
- Document API endpoints in OpenAPI/Swagger format
- Create research files before implementing features

## 🚨 Error Handling

### When Things Go Wrong
1. **Wait 1 minute** if script is stuck
2. **Kill and retry** with new approach
3. **Change strategy** after 2 failed attempts
4. **Document issues** in daily logs
5. **Create new chat tab** for real-time fixes

## 📁 File Organization

### New Features
1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Update documentation
5. Run all tests
6. Update development status

### File Locations
- **Tests**: `tests/` folder
- **Research**: `research/` folder
- **Scripts**: `scripts/` folder
- **Status**: `Development_Status/` folder

## 🎯 Priority Order

### Week 1-2 (High Priority)
- [ ] TDD implementation
- [ ] 80% code coverage
- [ ] UI/UX standards
- [ ] TypeScript migration
- [ ] Pydantic implementation

### Month 1 (Medium Priority)
- [ ] Authentication & security
- [ ] Error handling & logging
- [ ] API documentation
- [ ] Database optimization

### Month 2-3 (Low Priority)
- [ ] Performance optimization
- [ ] SaaS features
- [ ] Advanced testing
- [ ] Monitoring

## 🔍 Quick Commands

### Development
```bash
# Start everything
./scripts/start_development.sh

# Check ports
./scripts/check_ports.sh

# Kill ports
./scripts/kill_ports.sh
```

### Testing
```bash
# Run all tests
./scripts/run_all_tests.sh

# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && pytest
```

### Database
```bash
# Run migrations
./scripts/run_migrations.sh

# Seed database
./scripts/seed_database.sh
```

## 📝 Daily Checklist

### End of Session
- [ ] Update daily logs
- [ ] Update compliance checklist
- [ ] Document any issues
- [ ] Plan next session
- [ ] Commit and push changes

### Start of Session
- [ ] Check port availability
- [ ] Review previous session notes
- [ ] Check compliance status
- [ ] Plan feature implementation
- [ ] Conduct research if needed

## 🚫 What NOT to Do

- ❌ Don't implement without tests (TDD violation)
- ❌ Don't skip research phase
- ❌ Don't ignore port management rules
- ❌ Don't use colors other than black/white
- ❌ Don't skip documentation updates
- ❌ Don't ignore 80% coverage requirement
- ❌ Don't use non-Lucid React icons
- ❌ Don't skip error handling

## ✅ Success Metrics

- **Code Coverage**: ≥80%
- **Test Passing**: 100%
- **Documentation**: Complete and up-to-date
- **Port Management**: Always working
- **TDD Process**: Strictly followed
- **Research**: Completed before implementation
- **Compliance**: All rules followed
