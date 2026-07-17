# Done:Feature-Branch Labeling Implementation

This document explains the implementation of automatic `done:feature-branch` labeling for issue #99.

## Overview

The labeler workflow now automatically manages issue labels based on which branch a PR is merged into:

- **Non-master branch merges** → Add `done:feature-branch` label to linked issue
- **Master branch merges** → Add `status:done` label to linked issue, remove `done:feature-branch`

## Key Changes Made

### 1. Simplified Event Triggers

**Before:**

```yaml
on:
  status:
  check_suite:
    types: [completed]
```

**After:**

```yaml
on:
  pull_request_target:
    types: [closed]
```

**Why:** Removed resource-intensive `status:` and `check_suite:` events that caused performance issues in the previous implementation.

### 2. Issue-Based Labeling Logic

```javascript
if (eventType === 'pull_request_target') {
  if (context.payload.pull_request.merged) {
    const targetBranch = context.payload.pull_request.base.ref;

    // Extract linked issue number from PR title or body
    const prTitle = context.payload.pull_request.title || '';
    const prBody = context.payload.pull_request.body || '';
    const issuePattern = /(?:fix(?:es|ed)?|close(?:s|d)?|resolve(?:s|d)?)\s*#(\d+)/i;
    let linkedIssueMatch = prTitle.match(issuePattern) || prBody.match(issuePattern);

    if (linkedIssueMatch) {
      issueNumber = parseInt(linkedIssueMatch[1]); // Label the ISSUE, not the PR

      if (targetBranch === 'master') {
        // Master merge: status:done
        labelsToAdd.push('status:done');
        labelsToRemove.push(...statusLabels.filter((l) => l !== 'status:done'));
      } else {
        // Non-master merge: done:feature-branch
        labelsToAdd.push('done:feature-branch');
        labelsToRemove.push(
          'status:in-review',
          'status:changes-needed',
          'status:approval-needed',
          'status:info-needed',
        );
      }
    }
  }
}
```

**Key Change:** The workflow now extracts the linked issue number from PR title/body patterns like "Fixes #99" and labels the **issue**, not the pull request.

## Usage Examples

### Scenario 1: Feature Branch Testing

1. Create PR from `fix-bug-123` → `test-for-99`
2. Merge the PR
3. **Result:** Issue gets `done:feature-branch` label

### Scenario 2: Production Release

1. Create PR from `test-for-99` → `master`
2. Merge the PR
3. **Result:** Issue gets `status:done` label, `done:feature-branch` removed

## Benefits

- **Performance:** No more excessive workflow runs from status events
- **Reliability:** Simple branch-based logic instead of complex status checking
- **Clarity:** Clear distinction between "done in feature branch" vs "fully merged"
- **Automation:** No manual label management required

## Testing

The implementation has been validated with comprehensive test cases covering:

- ✅ PR merged into `test-for-99` → `done:feature-branch` added
- ✅ PR merged into `master` → `status:done` added, `done:feature-branch` removed
- ✅ PR merged into other feature branches → `done:feature-branch` added
- ✅ PR closed without merge → No label changes

## Files Modified

- `.github/workflows/labeler.yml` - Simplified workflow with branch-based labeling logic
