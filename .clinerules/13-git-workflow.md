# Git Workflow

## Commit Messages

Follow conventional commits format:

```
feat: add user profile editing
fix: resolve crash on empty lobby list
refactor: extract lobby card component
perf: optimize FlatList rendering in leaderboard
docs: update README with setup instructions
test: add tests for useGame hook
chore: update dependencies
style: format code with prettier
```

## Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes bug nor adds feature
- `perf`: Performance improvement
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `style`: Code style changes (formatting, semicolons, etc)

## Commit Message Rules for AI Execution

**CRITICAL**: When using `execute_command` to commit, ALWAYS use short, single-line messages.

```bash
# ✅ CORRECT: Short, single-line
git commit -m "feat: add play screen implementation"
git commit -m "fix: resolve auto-join race condition"
git commit -m "docs: add game flow documentation"

# ❌ INCORRECT: Multi-line (breaks command execution)
git commit -m "feat: add play screen

This includes:
- Tab navigation
- Join flow
- Multiple features"
```

**Why**: Multi-line strings in shell commands cause execution failures. Keep messages concise. Detailed information belongs in:
- Code comments
- Documentation files
- Pull request descriptions
- Not in commit messages executed via command line

## Branch Strategy

```
main              - Production-ready code
develop           - Integration branch
feature/name      - New features
fix/description   - Bug fixes
refactor/name     - Refactoring
```

## Branch Naming

```
feature/user-authentication
feature/lobby-system
fix/login-crash
fix/memory-leak-flatlist
refactor/extract-hooks
perf/optimize-images
```

## Before Committing

- [ ] Code follows style guide
- [ ] Tests pass
- [ ] No console.logs in code
- [ ] Types are correct
- [ ] Documentation updated
- [ ] No commented-out code
