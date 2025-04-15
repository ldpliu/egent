---
name: Upgrade Hive API
description: Upgrade the Hive API of the specified repos to the latest version.
parameters:
  train_number:
    description: Train number
dependencies:
  - knowledge/code/repos.md
  - knowledge/tools/git.md
  - knowledge/tools/github.md
  - knowledge/tools/noti.md
---

The repos we need to operate on:

- `managedcluster-import-controller`
- `multicloud-operators-foundation`

The goal is to upgrade the `hive/apis` dependency of the above repos to the latest version.

The process is as follows, for each repo:

- Checkout to the `main` branch, if there are any uncommitted changes, stash them.
- Sync the branch with latest upstream `main` branch.
- Create a new branch, named "upgrade-hive-apis-in-train-{{train_number}}"
- Run `go get github.com/openshift/hive/apis@master`.
- If there is vendor in the project, run `go mod tidy && go mod vendor` and if there is not, only run `go mod tidy`
- Run checks -- `make build` and `make test`, if any error occurs, report the error and ask for next step instruction to see whether should continue on.
- If any error occurs, notify the user with the error message, and stop the task waiting for user's next instruction.
- If no error occurs, deliver the code changes to github.
  - The branch name should be like `upgrade-hive-api-in-train-{{train_number}}`.
  - The PR title should be concise, and the PR description should be detailed.
