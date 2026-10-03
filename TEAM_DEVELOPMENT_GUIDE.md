# CampusFlow Team Development Guide

## Current Baseline
* **Phase 3 Status**: Core verification complete. The application successfully handles RBAC, audience isolation, and publishing pipelines.
* **Baseline Commit**: `phase-3: verify integration and fix audience isolation`
* **Baseline Tag**: `phase-3-verified`

## Branching Rules
Do **NOT** work directly on `main`. Create feature branches based on your current task focus.
* `main`: Stable integration branch. Should always be deployable.
* `feature/student-ui`: For student-facing UI/UX enhancements.
* `feature/admin-ui`: For admin dashboard and notice workflow UI.
* `feature/backend-testing`: For backend tests and integration improvements.
* `feature/deployment`: For deployment scripts, documentation, or infrastructure code.

### Branch Naming
Use lowercase, hyphen-separated branch names prefixed with `feature/`, `bugfix/`, or `hotfix/`.

## Pull Request Rules
* **Focus**: One focused feature per PR. Avoid massive PRs touching unrelated systems.
* **Description**: Describe changes fully. State what was solved and how.
* **Verification**: Include tests where applicable. For frontend changes, include screenshots of the UI.
* **Security**: **NO SECRETS**. Never commit `.env` files, JWT keys, Cloudinary secrets, or DB passwords.
* **Refactoring**: No unrelated refactoring. Stick to the scope of your PR.

## Before Opening a PR
1. Build both frontend (`npm run build`) and backend (`npm run build`).
2. Run type-checks and existing tests (`npm run test`).
3. Inspect your `git diff` manually to ensure no debugging scratch files or logs are included.
4. Confirm no secrets have been accidentally included in configuration files like `.agents/mcp_config.json`.

## Review Rules
* Another team member must review the PR before merging.
* All CI/CD tests must pass (when configured).
* No direct push to `main` under any circumstances.

## File Ownership / Scope
* **Frontend Devs**: Focus on `frontend/src/*`. Avoid modifying `backend/src/routes/*` unless coordinating an API contract change.
* **Backend Devs**: Focus on `backend/src/*` and `backend/prisma/*`. Avoid changing `frontend/src/lib/api.ts` without notifying frontend devs.
* **Full Stack / Architects**: Oversee cross-cutting concerns (e.g. `shared/` types if implemented, deployment scripts).

## Conflict Prevention
* Coordinate on Discord/Slack before changing shared configuration files (e.g. `schema.prisma`, `tailwind.config.js`).
* Fetch and rebase `main` frequently to keep your feature branch up to date.

## Current Known Blockers
* **Cloudinary**: API keys are not set in the environment. File upload currently errors out cleanly before external API call.
* **Gemini**: API key is not set in the environment. AI summarization is currently blocked.
* **OCR Fallback**: The environment lacks Ghostscript/GraphicsMagick installations, meaning scanned PDFs cannot currently fallback to OCR.
