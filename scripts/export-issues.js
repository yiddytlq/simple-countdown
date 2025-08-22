#!/usr/bin/env node

/**
 * Export GitHub repository issues and sub-issues to JSON
 * 
 * This script uses GitHub CLI to fetch all issues, comments, and builds
 * a nested structure representing issue relationships.
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
    this.issueRelationships = new Map(); // Maps child issue ID to parent issue ID
  }

  /**
   * Execute GitHub CLI command and return parsed JSON
   */
  executeGhCommand(command) {
    try {
      const result = execSync(command, { encoding: 'utf8' });
      return JSON.parse(result);
    } catch (error) {
      console.error(`Error executing command: ${command}`);
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Fetch all issues from the repository
   */
  async fetchAllIssues() {
    console.log('Fetching all issues...');
    
    const command = `gh issue list --state all --json number,title,state,author,labels,body,createdAt,updatedAt --limit 1000`;
    const issues = this.executeGhCommand(command);
    
    console.log(`Found ${issues.length} issues`);
    return issues;
  }

  /**
   * Fetch comments for a specific issue
   */
  async fetchIssueComments(issueNumber) {
    try {
      // Use --json without jq to get raw JSON, then parse in Node.js for cross-platform compatibility
      const command = `gh issue view ${issueNumber} --json comments`;
      const result = execSync(command, { encoding: 'utf8' });
      
      if (!result.trim()) {
        return [];
      }
      
      const data = JSON.parse(result);
      // Transform the comments to our desired format
      const comments = (data.comments || []).map(comment => ({
        id: comment.id,
        body: comment.body,
        author: comment.author.login,
        createdAt: comment.createdAt
      }));
      
      return comments;
    } catch (error) {
      console.warn(`Could not fetch comments for issue #${issueNumber}: ${error.message}`);
      return [];
    }
  }

  /**
   * Parse issue body and comments to identify sub-issue relationships
   */
  parseIssueRelationships(issue, comments) {
    const relationshipPatterns = [
      /sub-issue of #(\d+)/gi,
      /child of #(\d+)/gi,
      /relates to #(\d+)/gi,
      /part of #(\d+)/gi,
      /subtask of #(\d+)/gi
    ];

    const parentPatterns = [
      /sub-issues?:?\s*#(\d+)/gi,
      /children:?\s*#(\d+)/gi,
      /subtasks?:?\s*#(\d+)/gi
    ];

    const allText = [issue.body, ...comments.map(c => c.body)].join(' ');

    // Look for this issue being a child of another
    for (const pattern of relationshipPatterns) {
      const matches = allText.matchAll(pattern);
      for (const match of matches) {
        const parentId = parseInt(match[1]);
        if (parentId !== issue.number) {
          this.issueRelationships.set(issue.number, parentId);
          console.log(`Found relationship: #${issue.number} is child of #${parentId}`);
          break; // Only take the first parent relationship found
        }
      }
    }

    // Look for this issue being a parent of others
    for (const pattern of parentPatterns) {
      const matches = allText.matchAll(pattern);
      for (const match of matches) {
        const childId = parseInt(match[1]);
        if (childId !== issue.number) {
          this.issueRelationships.set(childId, issue.number);
          console.log(`Found relationship: #${childId} is child of #${issue.number}`);
        }
      }
    }
  }

  /**
   * Transform GitHub issue data to our required format
   */
  transformIssueData(issue, comments) {
    return {
      id: issue.number,
      title: issue.title,
      state: issue.state.toLowerCase(),
      author: issue.author.login,
      labels: issue.labels.map(label => label.name),
      body: issue.body || '',
      created_at: issue.createdAt,
      comments: comments.map(comment => ({
        id: parseInt(comment.id),
        body: comment.body,
        author: comment.author,
        created_at: comment.createdAt
      })),
      sub_issues: [] // Will be populated later
    };
  }

  /**
   * Build nested issue structure based on relationships
   */
  buildNestedStructure() {
    const rootIssues = [];
    const issueMap = new Map();

    // First pass: create all issue objects
    for (const [id, issue] of this.issues) {
      issueMap.set(id, { ...issue, sub_issues: [] });
    }

    // Second pass: build relationships
    for (const [childId, parentId] of this.issueRelationships) {
      const childIssue = issueMap.get(childId);
      const parentIssue = issueMap.get(parentId);

      if (childIssue && parentIssue) {
        parentIssue.sub_issues.push(childIssue);
      }
    }

    // Third pass: collect root issues (those without parents)
    for (const [id, issue] of issueMap) {
      if (!this.issueRelationships.has(id)) {
        rootIssues.push(issue);
      }
    }

    return rootIssues;
  }

  /**
   * Main export function
   */
  async exportIssues() {
    try {
      console.log('Starting issue export...');

      // Check if gh CLI is available and authenticated
      try {
        execSync('gh auth status', { stdio: 'pipe' });
      } catch (error) {
        throw new Error('GitHub CLI is not authenticated. Please run "gh auth login" first.');
      }

      // Fetch all issues
      const rawIssues = await this.fetchAllIssues();

      // Process each issue
      for (const rawIssue of rawIssues) {
        console.log(`Processing issue #${rawIssue.number}: ${rawIssue.title}`);
        
        // Fetch comments for this issue
        const comments = await this.fetchIssueComments(rawIssue.number);
        
        // Transform to our format
        const transformedIssue = this.transformIssueData(rawIssue, comments);
        
        // Store the issue
        this.issues.set(rawIssue.number, transformedIssue);
        
        // Parse relationships
        this.parseIssueRelationships(rawIssue, comments);
      }

      // Build nested structure
      console.log('Building nested issue structure...');
      const nestedIssues = this.buildNestedStructure();

      // Write to file
      const outputPath = path.join(process.cwd(), 'issues.json');
      fs.writeFileSync(outputPath, JSON.stringify(nestedIssues, null, 2));

      console.log(`\nExport completed successfully!`);
      console.log(`- Total issues processed: ${this.issues.size}`);
      console.log(`- Root issues: ${nestedIssues.length}`);
      console.log(`- Relationships found: ${this.issueRelationships.size}`);
      console.log(`- Output file: ${outputPath}`);

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