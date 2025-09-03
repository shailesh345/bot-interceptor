# 🧠 Cursor Agent Memory – SaaS Development Guide

**Always analyze the existing codebase before applying changes. Continue development according to these rules.**

---

## 🚀 Core Rules
- **Always run scripts in the integrated terminal (not chat)**
- **Kill frontend (port 9889) and backend (port 8960) before restarting**
- **Frontend must run on 9889, backend on 8960**
- **Kill stuck scripts after 1 minute**: `lsof -ti:PORT | xargs kill -9`
- **Start backend first, then other services**

---

## 📋 Development Process
- **Use TDD**: Write tests before implementing
- **Maintain 80%+ code coverage** (pytest for backend, Jest for frontend)
- **Avoid infinite request loops**
- **Change strategy if something fails twice**

---

## 🎨 UI/UX Standards
- **Colors**: Black/white only, Yandex font
- **Responsive across all screen sizes**
- **High contrast**: Black text on white background, or vice versa
- **Small/extra-small component sizes**
- **Use proper Lucid React icons**
- **Keep UX simple for non-technical users**

---

## 📚 Documentation
- **Track progress in `/Development_Status` (Markdown logs)**
- **Save research in `/research` before implementation**
- **Write daily logs with timestamps**
- **Document all APIs in OpenAPI/Swagger**

---

## 🛠️ Tech Stack
- **Frontend**: React, MUI, TailwindCSS
- **Backend**: Python (FastAPI or Django REST)
- **Database**: PostgreSQL + SQLAlchemy/Django ORM
- **Validation**: Pydantic
- **Free to use libraries that improve efficiency**

---

## 📁 Project Structure
```
frontend/
backend/
database/ (migrations, seeds)
tests/
docs/
Development_Status/
research/
docker/
scripts/
```

---

## 🗄️ Database
- **Always create migrations**
- **Seed dev/test data**
- **Add indexes to frequent queries**
- **Define foreign keys + constraints**
- **Enable connection pooling**
- **Automate backups**

---

## 🔒 Security
- **JWT auth + role-based permissions**
- **Hash passwords with bcrypt**
- **Sanitize inputs + prevent SQL injection**
- **Use .env for secrets**
- **Enable CORS properly**
- **Apply API rate limiting**

---

## 🌐 API Standards
- **RESTful design with proper status codes**
- **Consistent error format**
- **Request/response validation with schemas**
- **API versioning (/v1, /v2)**
- **Support pagination, filtering, sorting**
- **Auto-generate docs**

---

## ⚠️ Error Handling & Logging
- **Use global error handler**
- **Show user-friendly errors**
- **Maintain logs by level (DEBUG/INFO/WARN/ERROR)**
- **Save logs in separate files**
- **Track stack traces**
- **Add health check endpoints**
- **Trigger alerts for critical errors**

---

## ⚡ Performance
- **Use Redis for caching**
- **Optimize DB queries with indexing**
- **Compress images**
- **Use React code splitting + lazy loading**
- **Minify CSS/JS in production**
- **Serve static assets via CDN**

---

## 🏢 SaaS Features
- **Multi-tenancy (schema or row-level)**
- **Subscription + billing with Stripe**
- **Usage tracking + plan limits**
- **Analytics dashboard**
- **User onboarding flow**
- **Transactional emails + real-time notifications**
- **Feature flags per plan**

---

## 🧪 Testing
- **Unit, integration, E2E (Playwright/Cypress)**
- **Load/performance testing**
- **Security + accessibility testing (WCAG)**
- **Cross-browser/device tests**

---

## 🖥️ Dev Environment
- **Use Python venv/conda**
- **pip/poetry for Python, npm/yarn for Node**
- **Separate .env for dev/staging/prod**
- **Enable hot reload**
- **Run PostgreSQL in Docker**
- **Use SSL/HTTPS in dev**

---

## ✨ Code Quality
- **ESLint + Prettier for frontend**
- **Flake8/Pylint + Black for backend**
- **Pre-commit hooks: lint + test**
- **Use type hints in Python**
- **Keep functions small and clean**
- **Self-review before committing**

---

## 🚢 Deployment & DevOps
- **Use Docker for all services**
- **Set up CI/CD pipelines with automated tests**
- **Separate environments (dev/staging/prod)**
- **Monitor performance + health**
- **Regular automated backups**
- **Scale horizontally + load balance traffic**

---

## 📊 State Management
- **useState, useReducer, Context API for local**
- **Redux Toolkit or Zustand for global state**
- **React Query/SWR for server state**
- **Formik/React Hook Form for forms**

---

## 📁 File & Asset Handling
- **Secure upload with validation**
- **Resize/compress images**
- **Use S3/Cloudinary for storage**
- **Serve via CDN**
- **Prevent malicious uploads**

---

## 💬 Real-time Communication
- **WebSockets (Socket.io)**
- **Push notifications**
- **Responsive email templates**
- **SMS integration if required**
- **In-app chat + activity feeds if needed**

---

## 📈 Data & Analytics
- **Client + server-side validation**
- **Migration + transformation tools**
- **Reporting + analytics dashboards**
- **Import/export support**
- **GDPR compliance + data retention policies**

---

## 🐛 Debugging
- **Enable debug mode in dev**
- **React error boundaries**
- **Capture stack traces**
- **Profile performance**
- **Analyze SQL queries**
- **Debug API calls**

---

## 🤖 Automation
- **Scripts for build, tests, deployment**
- **Migration + seed scripts**
- **Maintenance + monitoring scripts**

---

## 📖 Documentation
- **Full API docs with examples**
- **User guides + onboarding tutorials**
- **Developer setup guides**
- **Architecture/design documentation**
- **Deployment configuration docs**
- **Troubleshooting guides**

---

## 🎯 Decision Protocol
1. **Research best practices**
2. **Save findings in `/research`**
3. **Implement with security + tests**
4. **Update documentation + logs**
5. **If blocked, escalate with specific question**
6. **Regularly review against SaaS best practices**

---

## 🔄 Continuous Improvement
- **Refactor regularly**
- **Monitor performance**
- **Run security audits**
- **Collect user feedback**
- **Update dependencies**
- **Follow SaaS industry best practices**

---

## ✅ Quick Checklist
**Before adding any feature:**
- [ ] Research & log findings
- [ ] Write tests first (TDD)
- [ ] Implement securely
- [ ] Follow UI/UX standards
- [ ] Add error handling
- [ ] Document endpoints + progress
- [ ] Test thoroughly
- [ ] Monitor performance
- [ ] Update development logs

---

## ⚡ Memory Instructions
**Save these rules in Cursor memory as the global development guide. Always reference them before starting any new task.**

---

*Last Updated: 2025-09-03*
*Version: 1.0*
*Status: Active*

---

# 🧠 COMPLETE MEMORY CONTENT

```python
content = """Cursor Agent Memory – SaaS Development Guide

Always analyze the existing codebase before applying changes. Continue development according to these rules.

---

Core Rules
- Always run scripts in the integrated terminal (not chat).
- Kill frontend (port 9889) and backend (port 8960) before restarting.
- Frontend must run on 9889, backend on 8960.
- Kill stuck scripts after 1 minute (lsof -ti:PORT | xargs kill -9).
- Start backend first, then other services.

---

Development Process
- Use TDD: write tests before implementing.
- Maintain 80%+ code coverage (pytest for backend, Jest for frontend).
- Avoid infinite request loops.
- Change strategy if something fails twice.

---

UI/UX Standards
- Colors: black/white only, Yandex font.
- Responsive across all screen sizes.
- High contrast: black text on white background, or vice versa.
- Small/extra-small component sizes.
- Use proper Lucid React icons.
- Keep UX simple for non-technical users.

---

Documentation
- Track progress in /Development_Status (Markdown logs).
- Save research in /research before implementation.
- Write daily logs with timestamps.
- Document all APIs in OpenAPI/Swagger.

---

Tech Stack
- Frontend: React, MUI, TailwindCSS.
- Backend: Python (FastAPI or Django REST).
- Database: PostgreSQL + SQLAlchemy/Django ORM.
- Validation: Pydantic.
- Free to use libraries that improve efficiency.

---

Project Structure
frontend/
backend/
database/ (migrations, seeds)
tests/
docs/
Development_Status/
research/
docker/
scripts/

---

Database
- Always create migrations.
- Seed dev/test data.
- Add indexes to frequent queries.
- Define foreign keys + constraints.
- Enable connection pooling.
- Automate backups.

---

Security
- JWT auth + role-based permissions.
- Hash passwords with bcrypt.
- Sanitize inputs + prevent SQL injection.
- Use .env for secrets.
- Enable CORS properly.
- Apply API rate limiting.

---

API Standards
- RESTful design with proper status codes.
- Consistent error format.
- Request/response validation with schemas.
- API versioning (/v1, /v2).
- Support pagination, filtering, sorting.
- Auto-generate docs.

---

Error Handling & Logging
- Use global error handler.
- Show user-friendly errors.
- Maintain logs by level (DEBUG/INFO/WARN/ERROR).
- Save logs in separate files.
- Track stack traces.
- Add health check endpoints.
- Trigger alerts for critical errors.

---

Performance
- Use Redis for caching.
- Optimize DB queries with indexing.
- Compress images.
- Use React code splitting + lazy loading.
- Minify CSS/JS in production.
- Serve static assets via CDN.

---

SaaS Features
- Multi-tenancy (schema or row-level).
- Subscription + billing with Stripe.
- Usage tracking + plan limits.
- Analytics dashboard.
- User onboarding flow.
- Transactional emails + real-time notifications.
- Feature flags per plan.

---

Testing
- Unit, integration, E2E (Playwright/Cypress).
- Load/performance testing.
- Security + accessibility testing (WCAG).
- Cross-browser/device tests.

---

Dev Environment
- Use Python venv/conda.
- pip/poetry for Python, npm/yarn for Node.
- Separate .env for dev/staging/prod.
- Enable hot reload.
- Run PostgreSQL in Docker.
- Use SSL/HTTPS in dev.

---

Code Quality
- ESLint + Prettier for frontend.
- Flake8/Pylint + Black for backend.
- Pre-commit hooks: lint + test.
- Use type hints in Python.
- Keep functions small and clean.
- Self-review before committing.

---

Deployment & DevOps
- Use Docker for all services.
- Set up CI/CD pipelines with automated tests.
- Separate environments (dev/staging/prod).
- Monitor performance + health.
- Regular automated backups.
- Scale horizontally + load balance traffic.

---

State Management
- useState, useReducer, Context API for local.
- Redux Toolkit or Zustand for global state.
- React Query/SWR for server state.
- Formik/React Hook Form for forms.

---

File & Asset Handling
- Secure upload with validation.
- Resize/compress images.
- Use S3/Cloudinary for storage.
- Serve via CDN.
- Prevent malicious uploads.

---

Real-time Communication
- WebSockets (Socket.io).
- Push notifications.
- Responsive email templates.
- SMS integration if required.
- In-app chat + activity feeds if needed.

---

Data & Analytics
- Client + server-side validation.
- Migration + transformation tools.
- Reporting + analytics dashboards.
- Import/export support.
- GDPR compliance + data retention policies.

---

Debugging
- Enable debug mode in dev.
- React error boundaries.
- Capture stack traces.
- Profile performance.
- Analyze SQL queries.
- Debug API calls.

---

Automation
- Scripts for build, tests, deployment.
- Migration + seed scripts.
- Maintenance + monitoring scripts.

---

Documentation
- Full API docs with examples.
- User guides + onboarding tutorials.
- Developer setup guides.
- Architecture/design documentation.
- Deployment configuration docs.
- Troubleshooting guides.

---

Decision Protocol
1. Research best practices.
2. Save findings in /research.
3. Implement with security + tests.
4. Update documentation + logs.
5. If blocked, escalate with specific question.
6. Regularly review against SaaS best practices.

---

Continuous Improvement
- Refactor regularly.
- Monitor performance.
- Run security audits.
- Collect user feedback.
- Update dependencies.
- Follow SaaS industry best practices.

---

Quick Checklist
Before adding any feature:
- Research & log findings.
- Write tests first (TDD).
- Implement securely.
- Follow UI/UX standards.
- Add error handling.
- Document endpoints + progress.
- Test thoroughly.
- Monitor performance.
- Update development logs.

---

⚡ Save these rules in Cursor memory as the global development guide. Always reference them before starting any new task.
"""
```

---

## 🎯 **MEMORY STATUS: COMPLETE** ✅

**Your comprehensive Cursor Agent Memory is now fully loaded and ready for use!**

### **How to Use This Memory:**

1. **Before any task**: Open this file and review relevant sections
2. **During development**: Reference the quick checklist
3. **For decisions**: Follow the decision protocol
4. **Quality assurance**: Check against code quality standards

### **Key Sections to Remember:**
- 🚀 **Core Rules** (ports, terminal usage)
- 📋 **Development Process** (TDD, testing)
- 🎨 **UI/UX Standards** (black/white, responsive)
- 🔒 **Security** (JWT, validation, CORS)
- 🧪 **Testing** (coverage, types)

**This memory file is now your complete development bible!** 📚✨
