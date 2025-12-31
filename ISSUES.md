# Identified Issues

This document contains a list of identified issues in the codebase that should be addressed.

---

## Issue 1: Native Module Import Lacks Type Safety

**Type:** Code Quality / Type Safety
**Severity:** Medium
**Location:** Multiple files (`src/index.ts`, `src/interactions/modals.ts`, `src/interactions/buttons.ts`, `src/commands/issue/*.ts`)

### Description
The native module is imported using `require()` without proper TypeScript type safety. While `src/types/native.d.ts` exists with type definitions, the actual imports don't use it.

### Current Code
```typescript
const native = require('../build/Release/zako_itit.node');
```

### Suggested Fix
Import with proper typing:
```typescript
import type { NativeAddon } from '../types/native';
const native: NativeAddon = require('../build/Release/zako_itit.node');
```

### Impact
- TypeScript compiler won't catch type mismatches
- IDE autocomplete doesn't work for native module methods
- Potential runtime errors if native API changes

---

## Issue 2: Caller Audit for `list_issues` Return Value

**Type:** Code Quality / Audit
**Severity:** Low
**Location:** `native/src/issue_ops.c`, lines 127-135 and callers in `addon.c`

### Description
In the `list_issues` function, if `realloc` fails, the code correctly frees the original pointer, sets `*issues` to `NULL`, and returns 0 to indicate failure. This is the correct approach to prevent memory leaks. However, callers should be audited to ensure they properly check the return value before using the issues pointer.

### Current Code (Correctly Implemented)
```c
Issue *new_issues = (Issue *)realloc(*issues, capacity * sizeof(Issue));
if (new_issues == NULL) {
    free(*issues);
    *issues = NULL;
    sqlite3_finalize(stmt);
    return 0;
}
```

### Suggested Action
Audit all callers of `list_issues` to verify they check the return value before accessing the issues array. The current implementation in `addon.c` (`ListIssues` function) correctly checks the return value.

---

## Issue 3: Inconsistent Maximum Length Constants

**Type:** Code Quality
**Severity:** Low
**Location:** `native/src/addon.c` and `native/include/types.h`

### Description
The struct defines `name[256]` and `detail[2048]`, but the addon defines `MAX_NAME_LEN 255` and `MAX_DETAIL_LEN 2047`. While this is technically correct (leaving room for null terminator), it's confusing and should be documented or made consistent.

### Current Code
```c
// types.h
char name[256];
char detail[2048];

// addon.c
#define MAX_NAME_LEN 255
#define MAX_DETAIL_LEN 2047
```

### Suggested Fix
Add comments explaining the difference, or use the same defines in both files.

---

## Issue 4: Missing Input Validation for Tag Enum Values

**Type:** Bug / Security
**Severity:** Medium
**Location:** `native/src/addon.c`, `CreateIssue` function

### Description
The `tag` parameter is cast directly to `IssueTag` without validating that it's within the valid enum range (0-2). While the TypeScript code validates this in `handleModalSubmit`, direct API calls could pass invalid values.

### Current Code
```c
issue_id = create_issue(name, detail, (IssueTag)tag, user_id);
```

### Suggested Fix
Add validation before casting:
```c
if (tag < 0 || tag > 2) {
    napi_throw_range_error(env, NULL, "Tag must be 0, 1, or 2");
    return NULL;
}
```

Note: The TypeScript code in `handleModalSubmit` does validate the tag value, but having validation in the native layer provides defense-in-depth.

---

## Issue 5: Missing Validation for Status in `update_issue_status`

**Type:** Bug / Security
**Severity:** Medium
**Location:** `native/src/addon.c`, `UpdateIssueStatus` function

### Description
The `new_status` parameter is cast directly to `IssueStatus` without validating that it's within the valid enum range (0-3).

### Current Code
```c
int result = update_issue_status(id, (IssueStatus)new_status);
```

### Suggested Fix
Add validation before the call:
```c
if (new_status < 0 || new_status > 3) {
    napi_throw_range_error(env, NULL, "Status must be 0, 1, 2, or 3");
    return NULL;
}
```

---

## Issue 6: Missing Automated Tests

**Type:** Enhancement / Testing
**Severity:** High
**Location:** Entire codebase

### Description
The codebase lacks any automated tests for both TypeScript and C code. This makes it difficult to:
- Verify functionality after changes
- Prevent regressions
- Document expected behavior

### Suggested Fix
Add test infrastructure:
1. For TypeScript: Add Jest or Vitest with mocked Discord.js interactions
2. For C code: Add unit tests for database operations

---

## Issue 7: Error Messages Not Propagated to Users

**Type:** UX / Error Handling
**Severity:** Low
**Location:** `native/src/issue_ops.c` and `native/src/database.c`

### Description
Error messages in the C code are only written to stderr using `fprintf`. These messages are not propagated to the Discord bot users, making debugging difficult for end users.

### Current Code
```c
fprintf(stderr, "Failed to prepare statement: %s\n", sqlite3_errmsg(db));
```

### Suggested Fix
Consider implementing an error message buffer that can be queried from TypeScript, or return error codes with specific meanings.

---

## Issue 8: User-Unfriendly Tag Input in Modal

**Type:** UX Enhancement
**Severity:** Low
**Location:** `src/commands/issue/new.ts`

### Description
The issue creation modal requires users to enter a numeric value (0, 1, or 2) for the tag field. This is not user-friendly and prone to errors.

### Current Code
```typescript
const tagInput = new TextInputBuilder()
    .setCustomId('issue_tag')
    .setLabel('Tag (0=Bug, 1=Feature, 2=Enhancement)')
    .setStyle(TextInputStyle.Short)
```

### Suggested Fix
Consider using a Select Menu component instead of text input for tag selection, which would provide a better UX with dropdown options.

---

## Issue 9: Missing Database Schema Versioning/Migration

**Type:** Enhancement
**Severity:** Medium
**Location:** `native/src/database.c`

### Description
The database initialization creates the table if it doesn't exist, but there's no mechanism for schema versioning or migrations. If the schema needs to change in future versions, existing databases would need manual migration.

### Suggested Fix
Add a `schema_version` table and implement migration functions to handle schema changes.

---

## Issue 10: No Rate Limiting or Abuse Prevention

**Type:** Security / Enhancement
**Severity:** Medium
**Location:** Discord command handlers

### Description
There's no rate limiting implemented for issue creation or other operations. A malicious user could spam the bot with commands, potentially causing DoS or filling the database.

### Suggested Fix
Implement rate limiting per user for commands like `/issue new`.

---

## Issue 11: Consider Filtering Deleted Issues by Default

**Type:** Enhancement / UX
**Severity:** Low
**Location:** `native/src/issue_ops.c`, `list_issues` function

### Description
The `list_issues` function returns all issues unless explicitly filtered by status. Users can filter by status (including filtering out deleted issues by passing status 0, 1, or 2), but there's no documentation on recommended filtering practices.

### Current Behavior
All issues are returned unless the `status` filter parameter is provided.

### Suggested Fix
Consider one of:
1. Document that users should filter by status to exclude deleted issues
2. Add a convenience parameter to exclude deleted issues by default
3. Update the `/issue list` command to exclude deleted issues by default unless specifically requested

---

## Issue 12: Code Structure Could Be More Resilient

**Type:** Code Quality
**Severity:** Very Low
**Location:** `native/src/addon.c`, `CreateIssue` function

### Description
In the `CreateIssue` function, input validation correctly jumps to cleanup on errors. The current code is safe because no SQLite statement is prepared before the validation checks. This is noted as a code quality observation for future maintenance.

### Suggested Action
When adding new code to this function, ensure that resources are properly tracked for cleanup. Consider adding comments to indicate that the cleanup label is safe because no statement has been prepared at that point.

---

## Summary

| Issue | Type | Severity | Status |
|-------|------|----------|--------|
| #1 | Type Safety | Medium | Open |
| #2 | Code Quality | Low | Open |
| #3 | Code Quality | Low | Open |
| #4 | Input Validation | Medium | Open |
| #5 | Input Validation | Medium | Open |
| #6 | Testing | High | Open |
| #7 | Error Handling | Low | Open |
| #8 | UX | Low | Open |
| #9 | Enhancement | Medium | Open |
| #10 | Security | Medium | Open |
| #11 | Enhancement | Low | Open |
| #12 | Code Quality | Very Low | Open |
