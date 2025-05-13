### Playbook Repository Structure

Egent uses a structured playbook repository to organize knowledge and playbooks. Here's a typical playbook repository structure:

```
playbook-repo/
├── knowledge/
│   ├── tool/
│   │   ├── git.md
│   │   └── github.md
│   ├── code/
│   │   └── repo.md
│   └── team-member.md
└── playbooks/
    ├── release-related/
    │   ├── upgrade-go-version.md
    │   └── bump-up-go-pkg.md
    ├── bugfix-related/
    │   └── CVE-auto-fix.md
    └── general-task.md
```

This is just an example, you can organize your context repo as you like.

### Core Concepts

#### 1. Knowledge

Each knowledge file contains a description of the knowledge domain. A knowledge file will be referenced by the playbooks.

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

#### 2. Playbook

Playbook define repeatable workflows that agents can execute. Each playbook includes:

- `description` of the playbook's purpose
- `example` usage scenarios
- `parameters` for playbook execution
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

- [server foundation agent playbook](https://github.com/stolostron/server-foundation-agent-playbook)
