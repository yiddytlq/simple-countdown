# GitHub Copilot Instructions for simple-countdown

## Project Overview

**simple-countdown** is a lightweight, self-hostable countdown timer web app designed for easy deployment via a single Docker Compose file. It is a fork and major enhancement of the [easy-countdown](https://github.com/Yooooomi/easy-countdown) project.

### Primary Goals

- Maintain simplicity and lightweight footprint suitable for single-container deployment
- Provide extensive UI customization options controlled via environment variables
- Ensure mobile and desktop responsiveness with Tailwind CSS v4 (no config file)
- Support multiple countdown pages configurable via Docker environment or admin panel
- Enable smooth developer workflow with GitHub Issues, branching, PR reviews, and CI/CD

---

## Copilot Operational Modes

Copilot operates only when **assigned** and **explicitly instructed** via labels or comment triggers.

### 1. Review Mode (Default)

- Triggered by comment: `@copilot review`
- Only reads comments, issues, PRs, and code snippets.
- Provides suggestions, summaries, and recommendations **as comments only**.
- **Never modify files, commit, push, or run builds**.

### 2. Plan/Analysis Mode

- Triggered by comment: `@copilot plan`
- Reads project files, documentation, or issue context.
- Summarizes tasks, proposes implementation plans, or highlights potential issues.
- **No code changes are made**; only comments and structured plans.

### 3. Implementation Mode

- Triggered by comment: `@copilot implement`
- Only runs after explicit approval via label or comment.
- Generates code snippets, pseudo-code, and proposed branch/commit structures.
- Posts detailed plans/comments **before** any commits or PRs.
- Commits, pushes, or PRs **require explicit "approved to commit" confirmation**.

### 3a. Branch Selection Logic

When creating a new branch or PR, Copilot must **not assume `master` as the base by default**. Instead, follow this logic:

1. **Check the current issue**  
   - If the issue has a linked branch, base all changes and the PR on that branch.  

2. **Check parent issues recursively**  
   - If the current issue does not have a linked branch, check its parent issue.  
   - Continue climbing the parent chain until a branch is found.  

3. **Fallback**  
   - If no branch is linked at any level, then base changes on `master`.  

Branches should follow the pattern:
```
{issue-type}/issue-{number}-{short-description}
```

PRs must always target the **same branch that was identified as the base** by this logic.

---

## Mode Activation Protocol

1. Copilot is **never active by default**.
2. To activate Copilot:
   - Add one of the labels to the issue:
     - `copilot:review`
     - `copilot:plan`
     - `copilot:implement`
   - Comment `@copilot review`, `@copilot plan`, or `@copilot implement`
   - Only then will Copilot be assigned to the issue.
3. After finishing the task or posting the requested plan/code, Copilot **must automatically unassign itself**.
4. Reassignment is required to continue work in a new mode or task.

---

## Workflow and Responsibilities

### 1. Issue Analysis and Refinement

- Review new and existing GitHub issues for clarity and completeness.
- Suggest improvements, detect duplicates, and enhance formatting.
- **Do not start implementation unless explicitly instructed**.
- Provide detailed comments and plans for review.

### 2. Implementation Planning

- Break down complex features into smaller tasks.
- Suggest multiple approaches with pros/cons analysis.
- Include testing strategies, documentation requirements, and branch/commit previews.
- **Until user approval is given, provide only plans, comments, and pseudo-code.**

### 3. Branch and Commit Workflow

- Feature branches follow pattern: `feature/issue-{number}-{brief-description}`.
- Copilot only proposes branch names, structures, and commits **for review**.
- **Do not commit, push, or modify files without explicit user approval.**

### 4. Code Development and Testing

- Only after plan approval:
  - Implement changes exactly as planned.
  - Write clean, maintainable, and well-commented code.
  - Run linting, tests, and builds before committing.
- Post diffs or previews for inspection **before any action is taken**.

### 5. Pull Request Creation

- Triggered only after user reassignment and approval.
- PRs must include:
  - Reference to original issue
  - Summary of changes
  - Testing performed
  - Any breaking changes or migration notes
  - Screenshots for UI changes (if applicable)

---

## Coding Standards and Practices

- **Framework:** React functional components with hooks (React 16.13.1)
- **Styling:** Tailwind CSS v4 utility classes only (no config file)
- **JavaScript:** Modern ES6+ syntax
- **Code Quality:** ESLint must pass (`npm run lint`)
- Follow existing project structure, naming conventions, and prop validation
- Include inline comments and documentation where needed

---

## Important Constraints

- **NEVER act without explicit assignment via label/comment.**
- Only respond with plans, suggestions, pseudo-code, or comments unless approved.
- Maintain audit trail of all suggestions and approvals.
- Respect final user decision on implementation approaches.
- Avoid breaking changes to API or configuration interfaces.
- No backend or complex service modifications unless explicitly instructed.

---

## Automation Recommendations

- Labels for control:
  - `copilot:review` → Review Mode
  - `copilot:plan` → Analysis/Planning Mode
  - `copilot:implement` → Implementation Mode
- Automatic unassignment upon task completion.
- User comment reassigns Copilot for new tasks or modes.

---

## Communication Protocol

- Use clear, professional language.
- Provide reasoning for recommendations.
- Summarize tasks, next steps, and blockers.
- Post updates regularly for complex tasks.
- Do not act on ambiguous instructions without clarification.

---

### Completion Protocol

- After finishing any task triggered by `@copilot plan`, `@copilot review`, or `@copilot implement`:
  - Add the label `copilot:done` to the issue.
  - Optionally leave a summary comment describing what was completed.
- Once `copilot:done` is added, Copilot will automatically be unassigned from the issue.

## Reference Links

- [Original Project](https://github.com/Yooooomi/easy-countdown)
- [Current Repository](https://github.com/yiddytlq/simple-countdown)
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

**Summary:** Copilot will **only act when explicitly instructed** using labels and comments. Modes control the depth of work (Review, Plan, Implement). Unassignment occurs automatically after each task. No work is performed without explicit approval from `@yiddytlq`.
