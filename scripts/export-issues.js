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
    this.pendingSubTasks = new Set();
    this.epicIssues = new Set();
  }

  /**
   * Execute GitHub CLI command and return parsed JSON
   */
  static executeGhCommand(command) {
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
      const result = execSync(command, { encoding: 'utf8' });

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
   * Parse issue body and comments to identify sub-issue relationships
   */
  parseIssueRelationships(issue, comments) {
    const allText = [issue.body, ...comments.map((c) => c.body)].join(' ');

    // Strategy 1: Label-based relationships
    this.parseLabelBasedRelationships(issue);

    // Strategy 2: Related Issues section parsing
    this.parseRelatedIssuesSection(issue, allText);

    // Strategy 3: Traditional text patterns (for compatibility)
    this.parseTraditionalPatterns(issue, allText);
  }

  /**
   * Parse label-based relationships (sub-task, epic)
   */
  parseLabelBasedRelationships(issue) {
    const labels = issue.labels.map((label) => label.name);

    // If this issue has 'sub-task' label, try to find its parent epic
    if (labels.includes('sub-task')) {
      // Look for epic issues that could be the parent
      // We'll do this in a second pass after all issues are loaded
      this.pendingSubTasks.add(issue.number);
    }

    // If this issue has 'epic' label, mark it as a potential parent
    if (labels.includes('epic')) {
      this.epicIssues.add(issue.number);
    }
  }

  /**
   * Parse Related Issues section for references
   */
  parseRelatedIssuesSection(issue, allText) {
    // Look for "### Related Issues" section
    const relatedSection = allText.match(/### Related Issues\s*(.*?)(?=###|$)/s);
    if (relatedSection && relatedSection[1].trim() !== '_No response_') {
      const content = relatedSection[1].trim();

      // Extract issue numbers from Related Issues section
      const issueReferences = content.match(/#(\d+)/g);
      if (issueReferences) {
        issueReferences.forEach((ref) => {
          const referencedId = parseInt(ref.substring(1), 10);
          if (referencedId !== issue.number) {
            // For sub-tasks, referenced issues are likely parents
            const labels = issue.labels.map((label) => label.name);
            if (labels.includes('sub-task')) {
              this.issueRelationships.set(issue.number, referencedId);
              console.log(`Found relationship: #${issue.number} is child of #${referencedId} (Related Issues)`);
            }
          }
        });
      }

      // Look for specific context patterns
      const contextPatterns = [
        /Research in #(\d+)/gi,
        /Installation in #(\d+)/gi,
        /Pipeline in #(\d+)/gi,
        /Epic:?\s*#(\d+)/gi,
      ];

      contextPatterns.forEach((pattern) => {
        const matches = content.matchAll(pattern);
        // eslint-disable-next-line no-restricted-syntax
        for (const match of matches) {
          const parentId = parseInt(match[1], 10);
          if (parentId !== issue.number) {
            this.issueRelationships.set(issue.number, parentId);
            console.log(`Found relationship: #${issue.number} is child of #${parentId} (${match[0]})`);
          }
        }
      });
    }
  }

  /**
   * Parse traditional text patterns for backward compatibility
   */
  parseTraditionalPatterns(issue, allText) {
    const relationshipPatterns = [
      /sub-issue of #(\d+)/gi,
      /child of #(\d+)/gi,
      /relates to #(\d+)/gi,
      /part of #(\d+)/gi,
      /subtask of #(\d+)/gi,
    ];

    const parentPatterns = [
      /sub-issues?:?\s*#(\d+)/gi,
      /children:?\s*#(\d+)/gi,
      /subtasks?:?\s*#(\d+)/gi,
    ];

    // Look for this issue being a child of another
    // eslint-disable-next-line no-restricted-syntax
    for (const pattern of relationshipPatterns) {
      const matches = allText.matchAll(pattern);
      // eslint-disable-next-line no-restricted-syntax
      for (const match of matches) {
        const parentId = parseInt(match[1], 10);
        if (parentId !== issue.number) {
          this.issueRelationships.set(issue.number, parentId);
          console.log(`Found relationship: #${issue.number} is child of #${parentId} (traditional pattern)`);
          break; // Only take the first parent relationship found
        }
      }
    }

    // Look for this issue being a parent of others
    // eslint-disable-next-line no-restricted-syntax
    for (const pattern of parentPatterns) {
      const matches = allText.matchAll(pattern);
      // eslint-disable-next-line no-restricted-syntax
      for (const match of matches) {
        const childId = parseInt(match[1], 10);
        if (childId !== issue.number) {
          this.issueRelationships.set(childId, issue.number);
          console.log(`Found relationship: #${childId} is child of #${issue.number} (traditional pattern)`);
        }
      }
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
   * Process label-based relationships in second pass
   */
  processLabelBasedRelationships() {
    if (!this.pendingSubTasks || !this.epicIssues) {
      return;
    }

    console.log('Processing label-based relationships...');

    // For each sub-task, try to find its epic parent
    // eslint-disable-next-line no-restricted-syntax
    for (const subTaskId of this.pendingSubTasks) {
      // If this sub-task doesn't already have a parent relationship
      if (!this.issueRelationships.has(subTaskId)) {
        // Try to find the most appropriate epic for this sub-task
        // For now, we can use a simple heuristic: find epics that are logically related

        const subTaskIssue = this.issues.get(subTaskId);
        if (!subTaskIssue) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // Look for topic-based matching with epics
        // eslint-disable-next-line no-restricted-syntax
        for (const epicId of this.epicIssues) {
          const epicIssue = this.issues.get(epicId);
          if (!epicIssue) {
            // eslint-disable-next-line no-continue
            continue;
          }

          // Simple heuristic: if sub-task mentions topics related to the epic
          if (IssueExporter.areIssuesRelated(subTaskIssue, epicIssue)) {
            this.issueRelationships.set(subTaskId, epicId);
            console.log(`Found relationship: #${subTaskId} is child of #${epicId} (label-based matching)`);
            break; // Only assign to one epic
          }
        }
      }
    }
  }

  /**
   * Simple heuristic to determine if two issues are related based on content
   */
  static areIssuesRelated(subTask, epic) {
    // Convert titles and bodies to lowercase for matching
    const subTaskText = (`${subTask.title} ${subTask.body}`).toLowerCase();
    const epicText = (`${epic.title} ${epic.body}`).toLowerCase();

    // Define topic keywords for different epics
    const topicMappings = {
      'ui customization': ['color', 'font', 'style', 'css', 'theme', 'appearance', 'display'],
      'package management': ['npm', 'yarn', 'package', 'install', 'dependency', 'node'],
      typescript: ['typescript', 'type', 'ts', 'tsx', 'interface'],
      tailwind: ['tailwind', 'css', 'style', 'utility', 'classes'],
      modernization: ['upgrade', 'update', 'modern', 'latest', 'version'],
      docker: ['docker', 'container', 'image', 'build'],
    };

    // Check if epic and sub-task share common topics
    // eslint-disable-next-line no-restricted-syntax
    for (const [, keywords] of Object.entries(topicMappings)) {
      const epicHasTopic = keywords.some((keyword) => epicText.includes(keyword));
      const subTaskHasTopic = keywords.some((keyword) => subTaskText.includes(keyword));

      if (epicHasTopic && subTaskHasTopic) {
        return true;
      }
    }

    return false;
  }
  /**
   * Build nested issue structure based on relationships
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

        // Parse relationships
        this.parseIssueRelationships(rawIssue, comments);
      }

      // Second pass: process label-based relationships
      this.processLabelBasedRelationships();

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
