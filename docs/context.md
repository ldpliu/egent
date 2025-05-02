### Context Repository Structure

Egent uses a structured context repository to organize knowledge and task templates. Here's a typical context repository structure:

```
context-repo/
├── knowledge/
│   ├── tool/
│   │   ├── git.md
│   │   └── github.md
│   ├── code/
│   │   └── repo.md
│   └── team-member.md
└── task-templates/
    ├── release-related/
    │   ├── upgrade-go-version.md
    │   └── bump-up-go-pkg.md
    ├── bugfix-related/
    │   └── CVE-auto-fix.md
    └── general-task.md
```

This is just an example, you can organize your context repo as you like.

### Core Concepts

#### 1. Knowledge Base

Each knowledge file contains a description of the knowledge domain. A knowledge file will be referenced by the task templates.

Example: `frontend-team-repositories.md`

```
---
description: All github repositories that own by our frontend team.
---

# Frontend Team Repositories

- [repo1](https://github.com/stolostron/repo1)
- [repo2](https://github.com/stolostron/repo2)
- [repo3](https://github.com/stolostron/repo3)

```

#### 2. Task Templates

Task templates define repeatable workflows that agents can execute. Each template includes:

- `description` of the task's purpose
- `example` usage scenarios
- `parameters` for task execution
- `dependencies` list referencing required knowledge files

Example: upgrade go version

```
---
description: Upgrade the go version of the frontend team's project.
example: "upgrade the go version of frontend team's project to go 1.24"
parameters:
  - name: go-version
    description: The go version to upgrade to
    required: true
dependencies:
  - knowledge/frontend-team-repositories.md
---

# Upgrade Go Version
...

```

## Examples

- [server foundation dev context](https://github.com/stolostron/server-foundation-dev-context)
