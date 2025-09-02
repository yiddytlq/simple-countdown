# Labeler Workflow Fix: Multiple Issue References

## Problem
The labeler workflow was only processing the first issue reference in PR titles and bodies when PRs were merged. This meant that if a PR mentioned multiple issues like:

```
Closes #112  
Closes #113  
Closes #114  
Closes #115  
Closes #116
```

Only issue #112 would receive the appropriate `done:feature-branch` or `status:done` label.

## Root Cause
The original regex pattern used `.match()` which only returns the first match:

```javascript
const issuePattern = /(?:fix(?:es|ed)?|close(?:s|d)?|resolve(?:s|d)?)\s*#(\d+)/i;
let linkedIssueMatch = prTitle.match(issuePattern) || prBody.match(issuePattern);
```

## Solution
Updated the workflow to use `.matchAll()` with a global regex flag to find ALL issue references:

```javascript
const issuePattern = /(?:fix(?:es|ed)?|close(?:s|d)?|resolve(?:s|d)?)\s*#(\d+)/gi;
const linkedIssueMatches = Array.from(combinedText.matchAll(issuePattern));
```

Then iterate through each match to apply labels to all referenced issues:

```javascript
for (const match of linkedIssueMatches) {
  const issueNumber = parseInt(match[1]);
  // Apply labeling logic to each issue individually
}
```

## Testing Results
Before the fix:
- PR with 5 issue references → Only 1 issue labeled
- Total issues processed: 2 out of 10

After the fix:
- PR with 5 issue references → All 5 issues labeled  
- Total issues processed: 10 out of 10

## Files Modified
- `.github/workflows/labeler.yml` - Updated regex and processing logic
- Added console logging for better debugging

## Benefits
- ✅ All issues mentioned in PR descriptions now get proper labels
- ✅ Maintains backward compatibility with single issue references
- ✅ Improves issue tracking accuracy
- ✅ Better debugging with console logs