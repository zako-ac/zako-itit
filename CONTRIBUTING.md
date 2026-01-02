# Contributing to zako-itit

Thank you for considering contributing to zako-itit! This document outlines the steps and guidelines to make contributions smoother and consistent.

## Table of Contents
- [Purpose](#purpose)
- [Code of Conduct](#code-of-conduct)
- [How to Report Bugs](#how-to-report-bugs)
- [How to Propose Features](#how-to-propose-features)
- [Development Setup](#development-setup)
- [Discord Bot Development](#discord-bot-development)
- [Branching and Workflow](#branching-and-workflow)
- [Coding Style](#coding-style)
- [Database Schema Changes](#database-schema-changes)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Tests and CI](#tests-and-ci)
- [Language and Communication](#language-and-communication)
- [Templates](#templates)

## Purpose
zako-itit is a hybrid TypeScript + C Discord bot for issue tracking. The bot uses discord.js v14 for Discord integration, a native C addon (N-API) for database operations with SQLite, and Jest for testing.

We welcome all types of contributions:
- Bug fixes and issue reports
- New features and enhancements
- Documentation improvements
- Test coverage additions
- Code refactoring and optimization

## Code of Conduct
Please be respectful and considerate of others when contributing to this project.

## How to Report Bugs
- Steps to reproduce
- Expected vs actual behavior
- Required information (environment, versions, logs)
- Minimal reproducible example

## How to Propose Features
- Describe the problem
- Proposed solution
- Alternatives considered
- Backwards compatibility considerations

## Development Setup

### Prerequisites
- Node.js >= 18.0.0 (check with `node --version`)
- Python 3.x (required for node-gyp)
- C/C++ compiler toolchain:
  - Linux: `build-essential` package (`sudo apt-get install build-essential`)
  - macOS: Xcode Command Line Tools (`xcode-select --install`)
  - Windows: Visual Studio Build Tools
- Docker (optional, for containerized development)
- Git for version control

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/zako-itit.git
   cd zako-itit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   This will automatically compile the C native addon via node-gyp.

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your bot. See [README.md](README.md#environment-variables) for environment variable details.

4. Build the project:
   ```bash
   npm run build
   ```
   This runs both `npm run build:native` (C addon) and `npm run build:ts` (TypeScript).

5. Run tests:
   ```bash
   npm test
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Development

Alternatively, use Docker for development:

Build the Docker image
```bash
docker build -t zako-itit .

docker run -d \
  --name zako-bot \
  --env-file .env \
  -v ./data:/app/data \
  zako-itit
```

Or use Docker Compose:
```bash
docker-compose up -d
```

### Troubleshooting

Native addon compilation fails:
- Ensure C/C++ compiler is installed
- On Linux, install `build-essential` and `python3`
- On macOS, install Xcode Command Line Tools
- On Windows, install Visual Studio Build Tools with C++ support

Database errors:
- Check that the `./data/` directory exists and is writable
- Default database location: `./data/issues.db`
- Database is automatically created on first run

Discord bot connection fails:
- Verify `DISCORD_TOKEN` in `.env` is correct
- Check bot has necessary permissions in Discord Developer Portal
- Ensure bot is invited to your test server

## Discord Bot Development

### Setting Up Your Test Bot

1. Create a Discord application:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Navigate to the "Bot" section and click "Add Bot"
   - Copy the bot token and add it to your `.env` file as `DISCORD_TOKEN`

2. Configure bot permissions:
   - In the Developer Portal, go to OAuth2 > URL Generator
   - Select scopes: `bot` and `applications.commands`
   - Select bot permissions:
     - Send Messages
     - Embed Links
     - Read Message History
     - Use Application Commands
   - Copy the generated URL and use it to invite the bot to your test server

3. Create a test Discord server:
   - Create a private server for testing to avoid affecting production users
   - Invite your bot using the URL from step 2
   - Get your Discord user ID for admin testing (enable Developer Mode in Discord settings, right-click your name, Copy ID)
   - Add your user ID to `ADMIN_IDS` in `.env` to test admin-only commands

### Testing Commands

For a complete list of available commands, see [README.md](README.md#commands).

Testing tips:
- Test all command variations (with/without optional parameters)
- Test pagination with more than 5 issues
- Test admin commands with and without admin permissions
- Verify error handling for invalid inputs
- Check that embeds display correctly

### Debugging

- Use Discord Developer Portal's "OAuth2" section to verify bot permissions
- Check console logs for errors when commands fail
- Verify environment variables are loaded correctly
- Ensure SQLite database is being created and populated
- Use `/ping` to verify bot is responding

## Branching and Workflow
This project uses a simplified Git workflow with a single main branch.

- `main` - Production-ready code. All pull requests merge here.

Contributor workflow:
1. Fork the repository
2. Create a feature branch in your fork:
   - For features: `feat/your-feature-name`
   - For bug fixes: `fix/bug-description`
   - For documentation: `docs/description`
3. Make your changes and commit following our commit message guidelines (see below)
4. Push your branch and open a pull request against `main`
5. Address review feedback
6. After approval, your PR will be merged

Keep PRs focused and small. Use rebase or merge strategies as agreed with reviewers.

## Coding Style

### TypeScript

- Follow TypeScript strict mode features as configured in `tsconfig.json`
- Use `async/await` over raw Promises for better readability
- Meaningful names: Use descriptive variable and function names
- Type safety: Prefer explicit types over `any` when possible
- JSDoc comments: Add documentation for public APIs and complex functions
- Consistent formatting: Follow the existing code style in the project

Example:
```typescript
// Good
async function getIssueById(id: number): Promise<Issue | null> {
  return nativeAddon.getIssue(id);
}

// Avoid
function getIssue(x: any) {
  return nativeAddon.getIssue(x);
}
```

### C (Native Addon)

- Follow existing patterns in `native/src/` directory
- Error handling: Add proper error handling for all N-API calls
- Memory safety: Ensure no memory leaks (free allocated resources)
- Documentation: Add comments for new native functions
- Return values: Use consistent error codes (-1 for errors, 0/1 for success)

Example:
```c
// Always check N-API call results
napi_status status = napi_create_string_utf8(env, str, NAPI_AUTO_LENGTH, &result);
if (status != napi_ok) {
  napi_throw_error(env, NULL, "Failed to create string");
  return NULL;
}
```

### General Guidelines

- Keep functions small and focused - one responsibility per function
- Self-documenting code - write clear code that explains itself
- Add comments only when necessary - explain "why" not "what"
- Follow existing project structure - maintain consistency with current patterns
- No dead code - remove commented-out code before committing

## Database Schema Changes

When modifying the SQLite database schema:

### Guidelines

1. Create migration scripts if applicable
   - Add version tracking for schema changes
   - Ensure migrations can be applied incrementally
   - Document the migration process

2. Test on a copy of production data
   - Never test schema changes directly on production
   - Verify data integrity after migration
   - Test rollback procedures

3. Document schema changes in PR description
   - Explain why the schema change is needed
   - List all affected tables and columns
   - Describe any data migration required
   - Note any breaking changes

4. Update TypeScript interfaces
   - Modify type definitions in `src/types/issue.ts` to match schema changes
   - Update native addon type bindings in `src/types/native.d.ts`
   - Ensure type safety across TypeScript and C boundary

5. Reference existing schema
   - Current schema is documented in [README.md](README.md#database-schema)
   - Native C code in `native/src/database.c` contains schema initialization
   - Schema version tracking in `schema_version` table

When adding new columns or tables, update both the C code (`native/src/database.c`) and TypeScript types (`src/types/issue.ts` and `src/types/native.d.ts`).

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>: <description>

[optional body]
```

### Rules

- Keep subject line under 72 characters
- Use imperative mood ("add" not "added", "fix" not "fixed")
- Capitalize the first letter of the description
- No period at the end of the subject line

### Commit Types

- `feat:` - New features (e.g., "feat: Add issue priority filtering")
- `fix:` - Bug fixes (e.g., "fix: Resolve database connection timeout")
- `docs:` - Documentation changes (e.g., "docs: Update setup instructions")
- `refactor:` - Code changes that neither fix bugs nor add features
- `chore:` - Maintenance tasks, dependency updates (e.g., "chore: Upgrade discord.js to v14.2")
- `test:` - Adding or updating tests
- `perf:` - Performance improvements
- `ci:` - CI/CD configuration changes

### Scope Usage

This project generally does not use scopes (e.g., `feat(auth):`). Keep commits simple with just the type and description:
- Good: `feat: Add OAuth2 support`
- Avoid: `feat(auth): Add OAuth2 support`

### Examples from This Project

Good commits:
```
feat: Display delay time in ping command
feat: Add schema versioning and migration support
fix: Handle null values in issue status check
docs: Update README.md with Docker setup instructions
refactor: Add TypeScript type safety to native module imports
chore: Upgrade Node.js version to 20-alpine in Dockerfile
test: Add pagination test coverage
```

Bad commits:
```
✗ Added new feature              # Use imperative mood: "Add"
✗ fix: bug                       # Too vague, describe what was fixed
✗ WIP                           # Not descriptive
✗ Update stuff                   # Missing type prefix
✗ feat: add new feature.        # Remove trailing period
```

### Commit Body (Optional)

For complex changes, add a body after a blank line:
```
feat: Add OAuth2 support

Implement Google OAuth2 authentication for user login.
This allows users to authenticate using their Google accounts
instead of Discord-only authentication.
```

## Pull Request Process

Before opening a PR:
- Ensure all tests pass: `npm test`
- Build succeeds: `npm run build`
- Code follows style guidelines
- Update documentation if needed

PR description should include:
- Summary of what changed and why
- Related issue references (e.g., "Closes #123" or "Fixes #456")
- Testing steps or test coverage added
- Any breaking changes or migration notes

Review process:
- All PRs target the `main` branch
- At least one maintainer approval required
- Address review feedback promptly
- Keep PR scope focused (avoid unrelated changes)
- All checks must pass before merging

## Tests and CI

### Running Tests Locally

This project uses Jest with ts-jest for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test files are located in the `tests/` directory and use the `.test.ts` or `.spec.ts` suffix.

### Writing Tests

Test requirements:
- All new features should include tests
- Bug fixes should include regression tests to prevent the bug from reoccurring
- Tests should be deterministic (no flaky tests)
- Aim for meaningful coverage, not just high percentages

Testing guidelines:
- Test both TypeScript logic and Discord command handlers
- Mock Discord.js client and interactions when testing commands
- For native addon testing, ensure proper cleanup of resources
- Use descriptive test names that explain what is being tested

Example test structure:
```typescript
describe('paginateIssues', () => {
  it('should return empty result for empty array', () => {
    const result = paginateIssues([], 1, 5);
    expect(result.items).toEqual([]);
    expect(result.currentPage).toBe(1);
  });

  it('should handle pagination correctly', () => {
    const issues = createMockIssues(10);
    const result = paginateIssues(issues, 1, 5);
    expect(result.items).toHaveLength(5);
    expect(result.totalPages).toBe(2);
  });
});
```

### CI Expectations

Currently, there is no automated CI/CD pipeline configured. Before merging, ensure:
- All tests pass locally (`npm test`)
- Build succeeds (`npm run build`)
- No TypeScript compilation errors
- Code follows style guidelines

Future CI integration may include automated testing, linting, and build verification on pull requests.

## Language and Communication
- Prefer writing code comments, docstrings, and repository documentation in English for wider accessibility.
- PR titles and comments: English preferred but other languages are acceptable—ensure clarity and useful context.

## Templates (examples)
- Issue template: title, description, steps to reproduce, expected behavior, environment
- PR template: summary, related issues, type of change, checklist (tests, docs, changelog)