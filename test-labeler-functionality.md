# Labeler Functionality Test for Issue #99

## Overview
This document outlines how the `done:feature-branch` label functionality works according to the requirements in issue #99.

## Label Management Rules

### When a PR is merged into a non-master branch (e.g., `test-for-99`):
- **Add**: `done:feature-branch` label
- **Remove**: `status:in-review`, `status:changes-needed`, `status:approval-needed`, `status:info-needed`

### When a PR is merged into the `master` branch:
- **Add**: `status:done` label  
- **Remove**: All other status labels including `done:feature-branch`

## Test Scenarios

### Scenario 1: PR merged to test-for-99 branch
```yaml
Event: pull_request_target (closed)
Payload:
  pull_request:
    merged: true
    base:
      ref: "test-for-99"
    number: 123

Expected Result:
- Issue #123 gets labeled with "done:feature-branch"
- Any status labels like "status:in-review" are removed
```

### Scenario 2: PR merged to master branch
```yaml
Event: pull_request_target (closed)
Payload:
  pull_request:
    merged: true
    base:
      ref: "master"  
    number: 123

Expected Result:
- Issue #123 gets labeled with "status:done"
- "done:feature-branch" label is removed if present
- All other status labels are removed
```

## Implementation Details

The logic is handled in `.github/workflows/labeler.yml` in the `status-tracker` job:

1. Detects `pull_request_target` events with `closed` type
2. Checks if the PR was actually merged (not just closed)
3. Examines the target branch (`base.ref`) 
4. Applies appropriate labels based on whether target is `master` or another branch

## Benefits

- **Clear Status Tracking**: Issues show distinct states for "done in feature branch" vs "fully merged"
- **Automated Management**: No manual label management required
- **Conflict Resolution**: Ensures only appropriate status labels are present