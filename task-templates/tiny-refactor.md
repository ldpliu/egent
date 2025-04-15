---
name: Tiny Refactor
description: Refactor the code of the specified repo.
parameters:
  repo_name:
    description: Name of the repo to refactor
dependencies:
  - knowledge/code/repos.md
  - knowledge/tools/git.md
  - knowledge/tools/github.md
  - knowledge/tools/noti.md
---

I want to continuously improve the code quality of the repository {{repo_name}} by making small changes each time, following the concept of "tiny refactor".

Actions:

- Checkout to the `main` branch, if there are any uncommitted changes, stash them.
- Review all the code and find a point that can be refactored
- Modify it
- Find unit-test related commands in the Makefile, run the unit tests, and if there are errors, make changes again, repeating until the unit tests pass without errors
- If error is hard to fix, notify the user with the error message, and stop the task waiting for user's next instruction.
- If no error occurs, deliver the code changes to github.
  - The branch name should be like `tiny-refactor-<repo-name>-<refactor-point>`, the refactor point should be concise and to the point.
  - The PR title should be concise, and the PR description should be detailed.
