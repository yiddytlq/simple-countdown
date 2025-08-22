#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Export GitHub repository issues and sub-issues to JSON using gh-sub-issue extension
 *
 * This script uses GitHub CLI and the gh-sub-issue extension to fetch all issues
 * and their sub-issue relationships, building a nested structure.
 *
 * Requirements:
 * - GitHub CLI (gh) installed and authenticated
 * - gh-sub-issue extension: gh extension install yahsan2/gh-sub-issue
 *
 * Usage: node scripts/export-issues.js
 * Output: issues.json in repository root
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class IssueExporter {
  constructor() {
    this.issues = new Map();
    // Maps child issue ID to parent issue ID (only one parent per child)
    this.issueRelationships = new Map();
  }

  /**
   * Execute GitHub CLI command and return parsed JSON
   */
  static executeGhCommand(command) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
      });
      return JSON.parse(result);
    } catch (error) {
      console.error(`Error executing command: ${command}`);
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Check if gh-sub-issue extension is available
   */
  static checkSubIssueExtension() {
    try {
      execSync('gh sub-issue --help', {
        stdio: 'pipe',
        env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch all issues from the repository
   */
  static fetchAllIssues() {
    console.log('Fetching all issues...');

    const command = 'gh issue list --state all --json number,title,state,author,labels,body,createdAt,updatedAt --limit 1000';
    const issues = IssueExporter.executeGhCommand(command);

    console.log(`Found ${issues.length} issues`);
    return issues;
  }

  /**
   * Fetch comments for a specific issue
   */
  static async fetchIssueComments(issueNumber) {
    try {
      // Use --json without jq to get raw JSON, then parse in Node.js for
      // cross-platform compatibility
      const command = `gh issue view ${issueNumber} --json comments`;
      const result = execSync(command, {
        encoding: 'utf8',
        env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
      });

      if (!result.trim()) {
        return [];
      }

      const data = JSON.parse(result);
      // Transform the comments to our desired format
      const comments = (data.comments || []).map((comment) => ({
        id: comment.id,
        body: comment.body,
        author: comment.author.login,
        createdAt: comment.createdAt,
      }));

      return comments;
    } catch (error) {
      console.warn(`Could not fetch comments for issue #${issueNumber}: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch sub-issues for a specific issue using gh-sub-issue extension
   */
  static fetchSubIssues(issueNumber) {
    try {
      const command = `gh sub-issue list ${issueNumber} --json`;
      const result = execSync(command, {
        encoding: 'utf8',
        env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
      });

      if (!result.trim()) {
        return [];
      }

      const data = JSON.parse(result);
      return data || [];
    } catch (error) {
      // If the command fails, it likely means no sub-issues exist for this issue
      // or the extension isn't available
      return [];
    }
  }

  /**
   * Transform GitHub issue data to our required format
   */
  static transformIssueData(issue, comments) {
    return {
      id: issue.number,
      title: issue.title,
      state: issue.state.toLowerCase(),
      author: issue.author.login,
      labels: issue.labels.map((label) => label.name),
      body: issue.body || '',
      created_at: issue.createdAt,
      comments: comments.map((comment) => ({
        id: parseInt(comment.id, 10),
        body: comment.body,
        author: comment.author,
        created_at: comment.createdAt,
      })),
      sub_issues: [], // Will be populated later
    };
  }

  /**
   * Build nested issue structure based on relationships from gh-sub-issue extension
   */
  buildNestedStructure() {
    const rootIssues = [];
    const issueMap = new Map();

    // First pass: create all issue objects
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, issue] of this.issues) {
      issueMap.set(id, { ...issue, sub_issues: [] });
    }

    // Second pass: build relationships
    // eslint-disable-next-line no-restricted-syntax
    for (const [childId, parentId] of this.issueRelationships) {
      const childIssue = issueMap.get(childId);
      const parentIssue = issueMap.get(parentId);

      if (childIssue && parentIssue) {
        parentIssue.sub_issues.push(childIssue);
      }
    }

    // Third pass: collect root issues (those without parents)
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, issue] of issueMap) {
      if (!this.issueRelationships.has(id)) {
        rootIssues.push(issue);
      }
    }

    return rootIssues;
  }

  /**
   * Parse issue body and comments to identify sub-issue relationships (fallback method)
   * Note: Each issue can only have one parent in the hierarchy structure
   */
  parseIssueRelationships(issue, comments) {
    const allText = [issue.body, ...comments.map((c) => c.body)].join('\n');

    // Skip if relationship already found (prioritize earlier detection methods)
    if (this.issueRelationships.has(issue.number)) {
      return;
    }

    // Patterns for "Epic:" references - indicates this issue is a child of the epic
    // (HIGHEST PRIORITY)
    const epicPattern = /_?Epic:\s*#(\d+)_?/gi;
    const epicMatches = allText.matchAll(epicPattern);
    // eslint-disable-next-line no-restricted-syntax
    for (const match of epicMatches) {
      const parentId = parseInt(match[1], 10);
      if (parentId !== issue.number && !this.issueRelationships.has(issue.number)) {
        this.issueRelationships.set(issue.number, parentId);
        console.log(`Found relationship: #${issue.number} is child of #${parentId} (Epic reference)`);
        return; // Only one parent per issue
      }
    }

    // Patterns for "Research in #X" type references (MEDIUM PRIORITY)
    const contextualPattern = /(?:research|installation|pipeline|task|sub-?task|work|part)\s+in\s+#(\d+)/gi;
    const contextualMatches = allText.matchAll(contextualPattern);
    // eslint-disable-next-line no-restricted-syntax
    for (const match of contextualMatches) {
      const parentId = parseInt(match[1], 10);
      if (parentId !== issue.number && !this.issueRelationships.has(issue.number)) {
        this.issueRelationships.set(issue.number, parentId);
        console.log(`Found relationship: #${issue.number} is child of #${parentId} (contextual reference)`);
        return; // Only one parent per issue
      }
    }

    // Find Related Issues section and parse it properly (LOWER PRIORITY)
    const relatedSectionMatch = allText.match(/### Related Issues\s*([\s\S]*?)(?=###|$)/);
    if (relatedSectionMatch) {
      const relatedContent = relatedSectionMatch[1];

      // Special handling for epic issues - if this issue has "epic" label,
      // the related issues are its children, not parents
      const isEpic = issue.labels && issue.labels.some((label) => label.name === 'epic');

      if (isEpic) {
        // Look for list items like "- #2", "- #3", "- #25" and make them children of this epic
        const listItemMatches = relatedContent.matchAll(/[-*]\s*#(\d+)/g);
        // eslint-disable-next-line no-restricted-syntax
        for (const match of listItemMatches) {
          const childId = parseInt(match[1], 10);
          if (childId !== issue.number && !this.issueRelationships.has(childId)) {
            this.issueRelationships.set(childId, issue.number);
            console.log(`Found relationship: #${childId} is child of #${issue.number} (Epic child list)`);
          }
        }
      } else {
        // For non-epic issues, look for the first parent reference
        // Look for list items like "- #2", "- #3", "- #25"
        const listItemMatches = relatedContent.matchAll(/[-*]\s*#(\d+)/g);
        // eslint-disable-next-line no-restricted-syntax
        for (const match of listItemMatches) {
          const parentId = parseInt(match[1], 10);
          if (parentId !== issue.number && !this.issueRelationships.has(issue.number)) {
            this.issueRelationships.set(issue.number, parentId);
            console.log(`Found relationship: #${issue.number} is child of #${parentId} (Related Issues list)`);
            return; // Only one parent per issue
          }
        }

        // Look for single issue references in related issues section
        const singleRefMatches = relatedContent.matchAll(/(?:^|\s)#(\d+)(?=\s|$)/g);
        // eslint-disable-next-line no-restricted-syntax
        for (const match of singleRefMatches) {
          const parentId = parseInt(match[1], 10);
          if (parentId !== issue.number && !this.issueRelationships.has(issue.number)) {
            this.issueRelationships.set(issue.number, parentId);
            console.log(`Found relationship: #${issue.number} is child of #${parentId} (Related Issues reference)`);
            return; // Only one parent per issue
          }
        }
      }
    }

    // Traditional relationship patterns (LOWEST PRIORITY)
    const relationshipPatterns = [
      /sub-?issue of #(\d+)/gi,
      /child of #(\d+)/gi,
      /relates to #(\d+)/gi,
      /part of #(\d+)/gi,
      /subtask of #(\d+)/gi,
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const pattern of relationshipPatterns) {
      const matches = allText.matchAll(pattern);
      // eslint-disable-next-line no-restricted-syntax
      for (const match of matches) {
        const parentId = parseInt(match[1], 10);
        if (parentId !== issue.number && !this.issueRelationships.has(issue.number)) {
          this.issueRelationships.set(issue.number, parentId);
          console.log(`Found relationship: #${issue.number} is child of #${parentId} (traditional pattern)`);
          return; // Only one parent per issue
        }
      }
    }
  }

  /**
   * Main export function
   */
  async exportIssues() {
    try {
      console.log('Starting issue export...');

      // Check if gh CLI is available and authenticated
      try {
        execSync('gh auth status', {
          stdio: 'pipe',
          env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
        });
      } catch (error) {
        throw new Error('GitHub CLI is not authenticated. Please run "gh auth login" first.');
      }

      // Check if gh-sub-issue extension is available
      const hasSubIssueExtension = IssueExporter.checkSubIssueExtension();
      if (hasSubIssueExtension) {
        console.log('✓ gh-sub-issue extension detected');
      } else {
        console.log('⚠ gh-sub-issue extension not available, using fallback text parsing');
        console.log('  Install with: gh extension install yahsan2/gh-sub-issue');
      }

      // Fetch all issues
      const rawIssues = IssueExporter.fetchAllIssues();

      // Process each issue
      // eslint-disable-next-line no-restricted-syntax
      for (const rawIssue of rawIssues) {
        console.log(`Processing issue #${rawIssue.number}: ${rawIssue.title}`);

        // Fetch comments for this issue
        // eslint-disable-next-line no-await-in-loop
        const comments = await IssueExporter.fetchIssueComments(rawIssue.number);

        // Transform to our format
        const transformedIssue = IssueExporter.transformIssueData(rawIssue, comments);

        // Store the issue
        this.issues.set(rawIssue.number, transformedIssue);

        if (hasSubIssueExtension) {
          // Use gh-sub-issue extension to get relationships
          try {
            // eslint-disable-next-line no-await-in-loop
            const result = IssueExporter.fetchSubIssues(rawIssue.number);

            // The gh sub-issue list command returns:
            // { parent: {...}, subIssues: [...], total: N, openCount: N }
            if (result && result.subIssues && result.subIssues.length > 0) {
              result.subIssues.forEach((subIssue) => {
                // Extract issue number from the subIssue object
                let subIssueNumber;
                if (typeof subIssue === 'object' && subIssue.number) {
                  subIssueNumber = subIssue.number;
                } else if (typeof subIssue === 'string') {
                  const match = subIssue.match(/#(\d+)/);
                  if (match) {
                    subIssueNumber = parseInt(match[1], 10);
                  }
                } else if (typeof subIssue === 'number') {
                  subIssueNumber = subIssue;
                }

                if (subIssueNumber && subIssueNumber !== rawIssue.number) {
                  this.issueRelationships.set(subIssueNumber, rawIssue.number);
                  console.log(`Found relationship: #${subIssueNumber} is child of #${rawIssue.number} (gh-sub-issue extension)`);
                }
              });
            }
          } catch (error) {
            console.warn(`Could not fetch sub-issues for #${rawIssue.number}: ${error.message}`);
          }
        } else {
          // Fallback to text parsing
          this.parseIssueRelationships(rawIssue, comments);
        }
      }

      // Build nested structure
      console.log('Building nested issue structure...');
      const nestedIssues = this.buildNestedStructure();

      // Write to file
      const outputPath = path.join(process.cwd(), 'issues.json');
      fs.writeFileSync(outputPath, JSON.stringify(nestedIssues, null, 2));

      console.log('\\nExport completed successfully!');
      console.log(`- Total issues processed: ${this.issues.size}`);
      console.log(`- Root issues: ${nestedIssues.length}`);
      console.log(`- Relationships found: ${this.issueRelationships.size}`);
      console.log(`- Output file: ${outputPath}`);

      if (hasSubIssueExtension) {
        console.log('- Method: gh-sub-issue extension');
      } else {
        console.log('- Method: text pattern parsing (fallback)');
      }

      return nestedIssues;
    } catch (error) {
      console.error('Export failed:', error.message);
      throw error;
    }
  }
}

// Run the export if this script is executed directly
if (require.main === module) {
  const exporter = new IssueExporter();
  exporter.exportIssues()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = IssueExporter;
