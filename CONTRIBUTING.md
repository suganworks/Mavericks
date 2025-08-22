# Contributing to Mavericks

Thanks for your interest in contributing!

## Ground Rules
- Follow Conventional Commits for messages (feat:, fix:, chore:, docs:, refactor:, test:)
- Keep PRs focused and under ~400 lines of diff when possible
- Include tests for logic changes
- Update docs/README if behavior or environment changes

## Development Setup
```bash
npm install
npm run dev
```
Run tests:
```bash
npm test
```

## Branching
- `main` = stable
- Feature branches: `feat/<short-name>`
- Fix branches: `fix/<issue-id-or-short>`

## Commit Message Format
```
<type>(optional scope): <description>

[optional body]
[optional footer]
```
Types: feat, fix, docs, chore, refactor, test, perf, build, ci

## Pull Requests
- Fill PR template
- Link related issues (`Closes #123`)
- Ensure `npm run lint` passes
- Ensure tests pass
- Provide before/after screenshots for UI changes

## Code Style
- ESLint enforces core rules
- Prefer functional React components with hooks
- Keep components focused; extract complex logic to hooks/utils

## Testing Guidelines
- Add at least one positive and one edge case
- Prefer unit tests for pure functions; integration tests for composed UI (future)

## Security
- Never commit secrets; rotate immediately if leaked
- Report vulnerabilities privately (see SECURITY.md once added)

## Release Process (Future)
- Semantic versioning via automated workflow (planned)

## Questions?
Open a discussion or issue.
