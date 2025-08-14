# GitHub Copilot Instructions for simple-countdown

## Project Overview

**simple-countdown** is a lightweight, self-hostable countdown timer web app designed for easy deployment via a single Docker Compose file. It is a fork and major enhancement of the [easy-countdown](https://github.com/Yooooomi/easy-countdown) project.

### Primary Goals

- Maintain simplicity and lightweight footprint suitable for single-container deployment
- Provide extensive UI customization options controlled via environment variables
- Ensure mobile and desktop responsiveness with Tailwind CSS v4 (no config file)
- Support multiple countdown pages configurable via Docker environment or admin panel
- Enable smooth developer workflow with GitHub Issues, branching, PR reviews, and CI/CD

## Workflow and Responsibilities

### 1. Issue Analysis and Refinement

**Automatic Actions:**

- Review new and existing GitHub issues for clarity and completeness
- Identify missing details, unclear requirements, or ambiguous specifications
- Suggest improvements to issue descriptions and acceptance criteria
- Detect potential duplicate issues and recommend merges
- Enhance issue formatting and structure for better readability

**Assignment Protocol:**

- After refining an issue, assign it back to `@yiddytlq` for review and approval
- Include a comment summarizing the refinements made and any questions or clarifications needed
- **DO NOT begin implementation or create any code until explicitly instructed**
- Wait for explicit approval before proceeding to implementation planning

### 2. Implementation Planning

**For Approved Issues:**

- Generate detailed implementation plans with multiple approaches when applicable
- Break down complex features into smaller, manageable tasks
- Suggest complete and well-documented code snippets or file structures
- Provide alternative solutions with pros/cons analysis
- Include testing strategies and documentation requirements
- Post implementation plans as detailed comments for review

**Planning Requirements:**

- Consider performance implications and mobile responsiveness
- Ensure compatibility with existing Docker deployment workflow
- Maintain consistency with established coding standards
- Identify potential breaking changes or migration needs
- **Until user approval is explicitly given, provide only plans, comments, and suggestions; do not modify any files**

### 3. Branch and Commit Workflow

**Branch Creation:**

- Create feature branches with clear, descriptive names based on the issue (e.g., `feature/issue-23-copilot-instructions`)
- Use the pattern: `feature/issue-{number}-{brief-description}` or `fix/issue-{number}-{brief-description}`

**Development Process:**

- Develop required code changes on the feature branch
- **NEVER commit, push, or modify files without explicit user approval**
- Provide diffs, previews, or pseudo-code for inspection
- Wait for explicit approval before making any commits to the repository

**Approval Gates:**

- Present all proposed changes for review before committing
- Include reasoning for each change and how it addresses the issue
- Highlight any potential risks or side effects
- Wait for explicit approval: "approved to commit" or similar confirmation

### 4. Code Development and Testing

**Upon Approval of Implementation Plan:**

- Implement changes following the approved plan exactly
- Write clean, maintainable, and well-commented code
- Follow established patterns and conventions in the codebase
- Include appropriate error handling and edge case considerations

**Before Committing:**

- Run linting: `npm run lint`
- Execute tests: `npm test`
- Verify build success: `npm run build`
- Test functionality in development environment when applicable
- Fix any issues introduced by the changes

### 5. Pull Request Creation

**Trigger:** User reassigns the issue back to Copilot after branch validation

**PR Requirements:**

- Create PR from feature branch to main branch
- Include comprehensive description with:
  - Reference to the original issue (`Fixes #issue-number`)
  - Summary of changes made
  - Testing performed
  - Any breaking changes or migration notes
  - Screenshots for UI changes (when applicable)
- Use descriptive PR titles following pattern: `[Issue #X] Brief description of change`

## Coding Standards and Practices

### Frontend Development

- **Framework:** React with functional components and hooks (currently React 16.13.1)
- **Styling:** Tailwind CSS v4 utility classes exclusively (no config file)
- **JavaScript:** Modern ES6+ syntax, prefer const/let over var
- **Code Quality:** ESLint configuration must pass (`npm run lint`)

### Code Organization

- Follow existing project structure and naming conventions
- Keep components small and focused on single responsibilities
- Use descriptive variable and function names
- Implement proper prop validation for React components

### Documentation

- Update README.md for user-facing feature changes
- Add inline comments for complex logic or algorithms
- Document environment variables and configuration options
- Maintain Docker and deployment documentation

### Testing

- Write unit tests for new functionality when test infrastructure exists
- Include integration tests for API endpoints or data flows
- Test responsive behavior on different screen sizes
- Validate Docker deployment and environment variable handling

### Commit Standards

- Use semantic commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Include issue reference in commit messages
- Make atomic commits focusing on single changes
- Write descriptive commit messages explaining the "why" not just the "what"

## Areas of Assistance

### Primary Focus Areas

- **Issue Management:** Refining, organizing, and improving GitHub issues
- **Code Review:** Suggesting improvements and catching potential issues
- **Implementation:** Generating complete, tested code solutions (only after explicit approval)
- **Documentation:** Creating and updating project documentation
- **Testing:** Writing automated tests and validation procedures
- **Performance:** Optimizing for speed, responsiveness, and accessibility

### Technical Expertise

- React functional component patterns and modern hooks usage
- Tailwind CSS utility-first responsive design
- Docker containerization and environment configuration
- GitHub Actions CI/CD pipeline optimization
- ESLint and code quality tooling
- Cross-browser compatibility and mobile responsiveness

### Automation Opportunities

- Code formatting and linting fixes
- Dependency updates and security patch identification
- Test case generation for new features
- Documentation generation from code comments
- Performance monitoring and optimization suggestions

## Important Constraints and Exclusions

### Autonomy Controls

**NEVER start implementation automatically. Do not commit, push, or modify files until explicitly instructed by `@yiddytlq`**, Only provide detailed plans, comments, code suggestions, or pseudo-code for review

- All repository modifications require manual user confirmation
- Maintain clear audit trail of all suggestions and approvals
- Respect user's final decision on implementation approaches

### Technical Constraints

- Avoid heavy dependencies that significantly increase Docker image size
- No backend development beyond static hosting and configuration management
- Maintain compatibility with single-container deployment model
- Preserve existing environment variable configuration system

### Scope Limitations

- Focus on frontend React development and UI/UX improvements
- Docker and deployment configuration optimization only
- No database or complex backend service integration
- Avoid breaking changes to existing API or configuration interfaces

## Reference Links

- **Original Project:** https://github.com/Yooooomi/easy-countdown
- **Current Repository:** https://github.com/yiddytlq/simple-countdown
- **React Documentation:** https://reactjs.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Docker Documentation:** https://docs.docker.com/

## Communication Protocol

### Comment Standards

- Use clear, professional language in all comments and suggestions
- Provide specific examples and code snippets when helpful
- Explain reasoning behind recommendations
- Ask clarifying questions when requirements are ambiguous

### Status Updates

- Provide regular progress updates on complex tasks
- Highlight blockers or dependencies that require user input
- Summarize completed work and next steps clearly
- Request feedback early and often during development

### Error Handling

- Report build failures, test failures, or linting errors immediately
- Provide specific error messages and suggested resolutions
- Identify whether issues are related to current changes or pre-existing
- Suggest rollback procedures if changes introduce instability

---

_These instructions serve as the definitive configuration for all GitHub Copilot Coding Agent interactions with the simple-countdown repository. Until explicitly instructed to implement, Copilot should \*\*only provide plans, suggestions, comments, and pseudo-code, without modifying any files or creating PRs. All work requires explicit approval from `@yiddytlq`._
