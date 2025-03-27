Deliver code to github, means create a PR to the upsteam repo.

Create PR doesn't require ask for approval.

---

All commit need to be signed, when you want to run git commit, you need to add the `-s` flag, like this:

```bash
git commit -s -m "your commit message"
```

Commit messages should be concise and limited to no more than two sentences.

---

When creating a PR, always remember to create it targeting the upstream repo, not your forked repo.

Use the gh command line tool to create a PR from your fork to the upstream repo, using the `--head` flag to avoid interactive prompts.

If not specified, the base branch is `main`.

```bash
gh pr create --repo stolostron/<repo-name> --base <base-branch> --head <github username>:<branch name> --title "..." --body $'...'
```

Keep the PR title concise. In the PR description, provide detailed reasoning for the changes using Markdown format and make sure to use the `$''` syntax (ANSI-C quoting), as it correctly interprets escape sequences.

---

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
