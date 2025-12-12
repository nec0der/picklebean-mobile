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

## Commit Grouping Rules

**CRITICAL**: Always group related files logically. Never create massive commits with vague messages.

### One Commit = One Logical Change

Each commit should represent a single, focused change. If you're fixing multiple unrelated things, make multiple commits.

### Grouping Strategy

**✅ GOOD Examples:**

```bash
# Dependencies only
git commit -m "fix: downgrade React to match React Native compatibility" package.json package-lock.json

# Single feature files
git commit -m "feat: add QR code scanner modal" src/components/features/play/QRScannerModal.tsx

# Related component files
git commit -m "refactor: extract lobby header component" \
  src/components/features/lobby/LobbyHeader.tsx \
  src/screens/LobbyDetailScreen.tsx
```

**❌ BAD Examples:**

```bash
# Too vague, too many files
git commit -m "Updated package" package.json package-lock.json [+150 other files]

# Unrelated changes together
git commit -m "Various fixes" [50 different files across the app]
```

### Common Scenarios

- **Dependencies**: `package.json` + `package-lock.json` only
- **New feature**: Files for that specific feature/component
- **Bug fix**: Only files related to that specific bug
- **Refactor**: Group by module/concern being refactored
- **Documentation**: Docs files only
- **Styling**: Style-related files only

### Maximum Files Per Commit

- **Dependencies**: 2 files (package.json + lock file)
- **Feature/Fix**: 3-5 related files
- **Refactor**: 5-10 files maximum
- **If more**: Split into multiple logical commits

## Before Committing

- [ ] Code follows style guide
- [ ] Tests pass
- [ ] No console.logs in code
- [ ] Types are correct
- [ ] Documentation updated
- [ ] No commented-out code
- [ ] Commit is focused on ONE logical change
- [ ] Only related files included
