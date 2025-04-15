---
name: Github
description: This part of content includes everything about how to use github in the egent.
---

# Create PR

When creating a PR, always remember to create it targeting the upstream repo, not your forked repo.

Use the gh command line tool to create a PR from your fork to the upstream repo, using the `--head` flag to avoid interactive prompts.

If not specified, the base branch is `main`.

```bash
gh pr create --repo stolostron/<repo-name> --base <base-branch> --head <github username>:<branch name> --title "..." --body $'...'
```

Keep the PR title concise. In the PR description, provide detailed reasoning for the changes using Markdown format and make sure to use the `$''` syntax (ANSI-C quoting), as it correctly interprets escape sequences.

PR title and description must be in English.
