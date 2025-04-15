---
name: Git
description: This part of content includes everything about how to use git in the egent.
---

# List branches

Use `git --no-pager branch` to list current branches.

# Create a commit

All commit need to be signed, when you want to run git commit, you need to add the `-s` flag, like this:

```bash
git commit -s -m "your commit message"
```

Commit message must be in English.

Commit messages should be concise and limited to no more than two sentences.

# Start a new task

If you start a new task, always check if you are at the default branch, and if branch is up to date with the upstream repo.

```bash
git checkout <default-branch>
git pull upstream <default-branch>
```

If the branch is not up to date, you need to rebase it.

```bash
git rebase upstream/<default-branch>
```

If you need to create a new branch, you can use the following command:

```bash
git checkout -b <new-branch>
```
