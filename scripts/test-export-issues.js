#!/usr/bin/env node

/**
 * Test version of the issue export script with mock data
 * This validates the JSON structure and logic without requiring GitHub CLI
 */

const fs = require('fs');
const path = require('path');

// Mock data that simulates GitHub API responses
const mockIssues = [
  {
    number: 123,
    title: "Main feature implementation",
    state: "OPEN",
    author: { login: "alice" },
    labels: [{ name: "feature" }, { name: "priority-high" }],
    body: "This is the main issue for implementing the new feature.\n\nSub-issues: #124, #125",
    createdAt: "2025-08-20T12:34:56Z",
    updatedAt: "2025-08-21T10:15:30Z"
  },
  {
    number: 124,
    title: "Sub-task: Frontend implementation", 
    state: "OPEN",
    author: { login: "bob" },
    labels: [{ name: "frontend" }, { name: "feature" }],
    body: "Sub-issue of #123\n\nImplement the frontend components.",
    createdAt: "2025-08-22T12:34:56Z",
    updatedAt: "2025-08-22T14:20:10Z"
  },
  {
    number: 125,
    title: "Sub-task: Backend API",
    state: "CLOSED", 
    author: { login: "charlie" },
    labels: [{ name: "backend" }, { name: "feature" }],
    body: "Part of #123\n\nImplement the backend API endpoints.",
    createdAt: "2025-08-22T13:45:20Z",
    updatedAt: "2025-08-25T09:30:45Z"
  },
  {
    number: 126,
    title: "Nested sub-task",
    state: "OPEN",
    author: { login: "alice" },
    labels: [{ name: "subtask" }],
    body: "Child of #124\n\nThis is a nested sub-task.",
    createdAt: "2025-08-25T12:34:56Z", 
    updatedAt: "2025-08-25T12:34:56Z"
  },
  {
    number: 127,
    title: "Independent issue",
    state: "OPEN",
    author: { login: "dave" },
    labels: [{ name: "bug" }],
    body: "This is an independent issue with no relationships.",
    createdAt: "2025-08-26T08:15:30Z",
    updatedAt: "2025-08-26T08:15:30Z"
  }
];

const mockComments = {
  123: [
    {
      id: "456",
      body: "This looks good, let's proceed with the sub-tasks.",
      author: "alice",
      createdAt: "2025-08-21T14:30:00Z"
    },
    {
      id: "457", 
      body: "I'll work on the frontend part #124",
      author: "bob",
      createdAt: "2025-08-22T09:00:00Z"
    }
  ],
  124: [
    {
      id: "500",
      body: "Started working on this. Need to create sub-task #126 for the complex component.",
      author: "bob", 
      createdAt: "2025-08-25T11:00:00Z"
    }
  ],
  125: [
    {
      id: "600",
      body: "API endpoints completed and tested.",
      author: "charlie",
      createdAt: "2025-08-25T09:00:00Z"
    }
  ],
  126: [
    {
      id: "700",
      body: "Working on the component implementation.",
      author: "alice",
      createdAt: "2025-08-25T15:00:00Z"
    }
  ],
  127: [] // No comments
};

class MockIssueExporter {
  constructor() {
    this.issues = new Map();
    this.issueRelationships = new Map();
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
          break;
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
   * Transform mock GitHub issue data to our required format
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
      sub_issues: []
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
   * Test export function using mock data
   */
  async testExport() {
    console.log('Running test export with mock data...');
    
    // Process mock issues
    for (const rawIssue of mockIssues) {
      console.log(`Processing issue #${rawIssue.number}: ${rawIssue.title}`);
      
      // Get mock comments
      const comments = mockComments[rawIssue.number] || [];
      
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

    // Write to test file
    const outputPath = path.join(process.cwd(), 'issues-test.json');
    fs.writeFileSync(outputPath, JSON.stringify(nestedIssues, null, 2));

    console.log(`\nTest export completed successfully!`);
    console.log(`- Total issues processed: ${this.issues.size}`);
    console.log(`- Root issues: ${nestedIssues.length}`);
    console.log(`- Relationships found: ${this.issueRelationships.size}`);
    console.log(`- Output file: ${outputPath}`);

    // Validate JSON structure
    this.validateJsonStructure(nestedIssues);

    return nestedIssues;
  }

  /**
   * Validate that the JSON structure matches requirements
   */
  validateJsonStructure(data) {
    console.log('\nValidating JSON structure...');
    
    const requiredFields = ['id', 'title', 'state', 'author', 'labels', 'body', 'created_at', 'comments', 'sub_issues'];
    const commentFields = ['id', 'body', 'author', 'created_at'];
    
    function validateIssue(issue, depth = 0) {
      const prefix = '  '.repeat(depth);
      console.log(`${prefix}Validating issue #${issue.id}: ${issue.title}`);
      
      // Check required fields
      for (const field of requiredFields) {
        if (!(field in issue)) {
          throw new Error(`Missing required field '${field}' in issue #${issue.id}`);
        }
      }
      
      // Validate field types
      if (typeof issue.id !== 'number') throw new Error(`Issue id should be number, got ${typeof issue.id}`);
      if (typeof issue.title !== 'string') throw new Error(`Issue title should be string`);
      if (!['open', 'closed'].includes(issue.state)) throw new Error(`Invalid state: ${issue.state}`);
      if (!Array.isArray(issue.labels)) throw new Error(`Labels should be array`);
      if (!Array.isArray(issue.comments)) throw new Error(`Comments should be array`);
      if (!Array.isArray(issue.sub_issues)) throw new Error(`Sub_issues should be array`);
      
      // Validate comments
      for (const comment of issue.comments) {
        for (const field of commentFields) {
          if (!(field in comment)) {
            throw new Error(`Missing required comment field '${field}' in issue #${issue.id}`);
          }
        }
      }
      
      // Recursively validate sub-issues
      for (const subIssue of issue.sub_issues) {
        validateIssue(subIssue, depth + 1);
      }
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Root data should be an array');
    }
    
    for (const issue of data) {
      validateIssue(issue);
    }
    
    console.log('✅ JSON structure validation passed!');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const exporter = new MockIssueExporter();
  exporter.testExport()
    .then(() => {
      console.log('\n🎉 All tests passed! The structure is valid.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = MockIssueExporter;