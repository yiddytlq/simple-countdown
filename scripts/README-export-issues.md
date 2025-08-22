# Issue Export Script

This script exports all GitHub repository issues (including sub-issues) to a structured JSON file using the gh-sub-issue extension for accurate relationship detection.

## Prerequisites

- [GitHub CLI](https://cli.github.com/) installed and authenticated
- Node.js (any recent version)
- **Recommended**: gh-sub-issue extension for accurate sub-issue relationship detection
- **Cross-platform compatibility**: Works on Windows, macOS, and Linux

## Setup

1. Install GitHub CLI if not already installed:
   ```bash
   # On macOS
   brew install gh
   
   # On Ubuntu/Debian
   sudo apt install gh
   
   # On Windows
   winget install GitHub.cli
   ```

2. Authenticate with GitHub:
   ```bash
   gh auth login
   ```

3. Install the gh-sub-issue extension (recommended):
   ```bash
   gh extension install yahsan2/gh-sub-issue
   ```

## Usage

Run the export script from the repository root:

```bash
# Using npm script
npm run export-issues

# Or directly
node scripts/export-issues.js
```

## Output

The script creates an `issues.json` file in the repository root with the following structure:

```json
[
  {
    "id": 123,
    "title": "Main issue",
    "state": "open",
    "author": "alice",
    "labels": ["feature"],
    "body": "Main issue body",
    "created_at": "2025-08-20T12:34:56Z",
    "comments": [
      {
        "id": 456,
        "body": "First comment",
        "author": "alice",
        "created_at": "2025-08-22T12:34:56Z"
      }
    ],
    "sub_issues": [
      {
        "id": 790,
        "title": "Sub-issue 1",
        "state": "open",
        "author": "alice",
        "labels": ["feature"],
        "body": "Sub-issue body",
        "created_at": "2025-08-22T12:34:56Z",
        "comments": [],
        "sub_issues": []
      }
    ]
  }
]
```

## Sub-Issue Relationship Detection

The script automatically detects sub-issue relationships by parsing issue bodies and comments for these patterns:

- "Sub-issue of #123"
- "Child of #123"  
- "Relates to #123"
- "Part of #123"
- "Subtask of #123"

And parent relationships:
- "Sub-issues: #456"
- "Children: #456"
- "Subtasks: #456"

## Data Fields

### Issue/Sub-Issue Fields
- `id` - Issue number
- `title` - Issue title
- `state` - "open" or "closed"
- `author` - GitHub username of creator
- `labels` - Array of label names
- `body` - Issue description text
- `created_at` - ISO timestamp
- `comments` - Array of comment objects
- `sub_issues` - Array of nested sub-issues

### Comment Fields
- `id` - Comment ID
- `body` - Comment text
- `author` - Commenter's username  
- `created_at` - ISO timestamp

## Error Handling

- If GitHub CLI is not authenticated, the script will show an error
- If comments cannot be fetched for an issue, it continues with an empty comments array
- The script processes up to 1000 issues (GitHub CLI limit)

## Example Output Stats

```
Export completed successfully!
- Total issues processed: 25
- Root issues: 20
- Relationships found: 5
- Output file: /path/to/repo/issues.json
```