The `/workspace` folder contains repositories downloaded from GitHub.

- All originate from the user `xuezhaojun`.
- They are forks of repositories from organizations like `stolostron`, `open-cluster-management-io`, and `openshift`.

---

The default branch of these repositories is usually the `main` branch, but some repositories have `master` as their default branch.

For repositories forked from `stolostron`, in addition to the `main` branch, there are branches for previous releases following the naming pattern `backplane-2.x`.

The currently active `stolostron` release branches range from `backplane-2.4` to `backplane-2.9`.

---

The repositories have nicknames that can be used in task descriptions to refer to them. The nicknames table is as follows:

| Repository                       | Nickname          |
| -------------------------------- | ----------------- |
| managedcluster-import-controller | import-controller |
| multicloud-operators-foundation  | foundation        |

---

All commit need to be signed, when you want to run git commit, you need to add the `-s` flag, like this:

```bash
git commit -s -m "your commit message"
```

Commit messages should be concise and limited to no more than two sentences.

---

When creating a PR, always remember to create it targeting the upstream repo, not your forked repo.

Use the gh command line tool to create a PR from your fork to the upstream repo, using the `--head` flag to avoid interactive prompts.

```bash
gh pr create --base <upstream-repo> --head <your-fork> --title "PR title" --body "PR description"
```

Keep the PR title concise. In the PR description, provide detailed reasoning for the changes using Markdown format and make sure to use the `$''` syntax (ANSI-C quoting), as it correctly interprets escape sequences.
