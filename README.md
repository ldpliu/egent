# Egent

Egent aims to be the platform that bridges **engineer teams** and **agents**.

It now can handle the following tedious and trivial tasks for our team:

- Tiny refactor a repo
- Upgrade the Hive API every train
- Bump up a dependency of a repo
- Upgrade the Go version of a repo

## Table of Contents

- [Demo](#demo)
- [How to use](#how-to-use)
  - [Workspace](#workspace)
  - [Context](#context)
  - [Tools](#tools)
  - [Worklogs](#worklogs)
- [FAQ](#faq)
  - [Why not just script it?](#why-not-just-script-it)
  - [When can it handle more complex tasks?](#when-can-it-handle-more-complex-tasks)
- [Key Mindset Shifts For Engineers](#key-mindset-shifts-for-engineers)
  - [Let AI do, you help](#let-ai-do-you-help)
  - [Start managing the "shadow knowledge"](#start-managing-the-shadow-knowledge)
- [Roadmap](#roadmap)

## Demo

https://github.com/user-attachments/assets/9be64685-7774-4be2-b144-1d9d4f347c73

In this demo, we want to let the agent make a tiny refactor on the import-controller repository. Throughout the process, we interact with Cursor three times:

1. Enter Follow @start.md run task: tiny refactor import-controller
2. When Cursor reaches the tool usage limit(25 times currently, it will raise or support customized in the furture), we need to click to continue
3. When `make lint` takes too long, we instruct the agent to skip this step and continue. This interaction demonstrates that **you can communicate with the agent during the process**.

The agent ultimately summarized the task in the `/worklogs` directory and delivered a PR. This represents **a complete development cycle, from requirement specification to final result**.

The PR: https://github.com/stolostron/managedcluster-import-controller/pull/558

https://github.com/user-attachments/assets/4bfb8a4e-e3c3-451c-8bd7-1dc875340d03

In this demo, the prompt is `Follow @start.md and run task: upgrade go version to 1.24 for repo cluster-proxy and import-controller`, this demo shows the agent could handle tasks requires modify multiple repos.

The PRs:
* https://github.com/stolostron/managedcluster-import-controller/pull/556
* https://github.com/open-cluster-management-io/cluster-proxy/pull/231

## How to use

First, you need to set the right cursor settings:

- Cursor version: 0.47.x
- Enable `auto-run` mode.
- Review changes set to `Auto-run`.
- Model Preference: Thinking (claude-3.7-sonnet)

If you want to start a new task, make sure you are in the `Agent` mode, then:

1. Type `Follow @start.md and run task: <your task>`, it could be a short sentence if there is a task template for it.
   - For examples: `Tiny refactor import-controller` or `Hive API Upgrade for train 27`.
   - It could also be very detailed if it's a new task that agent never done before.

The agent works with the following components:

![Egent Architecture](arch.png)

- #### Workspace:
  - Create the `/workspace` folder, and git clone all the repositories you want your agent to work on.
- #### Context:
  - Task-Templates: `/task-templates`
    - In professional settings, engineers typically receive brief task descriptions but can quickly transform them into detailed execution plans based on their **experience**.
    - Task templates aim to achieve this process: you only need to provide a brief task description, and the Agent will automatically **map it into a comprehensive execution plan**.
  - Knowledge: `/knowledge`
    - Add everything you want to use as context for the agent.
    - Particularly **shadow knowledge** - the implicit information experienced engineers possess. This includes repository architecture, PR submission workflows, team coding standards, and other tacit knowledge typically acquired through experience.
    - For adding **domain knowledge**, you can also leverage Cursor's [Docs feature](https://docs.cursor.com/context/@-symbols/@-docs), which allows you to seamlessly integrate external documentation and reference materials that your agent can access and utilize during tasks.
- #### Tools:
  - There are mainly **2** types of tools the agent can use: the **command line tools** and **MCPs**.
  - For examples:
    - I want the agent to create PRs, so I need to install [gh](https://cli.github.com/) in my machine.
    - I also want the agent to send notification to me when the task is done, so I install the [noti](https://github.com/variadico/noti) in my machine.
  - Cursor also has good [MCP](https://modelcontextprotocol.io/introduction) support, you can also add MCP Servers in the Cursor's settings.
- #### Worklogs:
  - The agent will plan, record, and summarize in a worklog file under the `/worklogs` folder.
  - It's a way for user to better observe agent activities and status.

## FAQ

### Why not just script it?

If you happen to be an expert in scripting languages and don't require readability, maintainability, or compatibility, you could certainly use scripts to accomplish tasks like `upgrading Go version`.

However, to complete another task shown in the Demo -- `performing a Tiny Refactor on a project to improve code quality` -- requires **"intelligence"** rather than just **"automation"** capabilities.

### When can it handle more complex tasks?

Aren't models already PhD-level smart, capable of answering extremely difficult math and programming questions?

Yes, but current models are limited to **"answering questions"** rather than **"completing tasks"**.

According to this [research](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/), today's most advanced models(Claude 3.7 sonnect) achieve nearly **100%** success on tasks that human experts complete in **under 4 minutes**. However, for tasks requiring about **1 hour** of expert time, AI reliability drops to **50%**, and for **4-hour** expert tasks, AI success rates fall to just **10%**.

This explains why AI excels on benchmarks but hasn't yet automated everyday work.

BUT AI's task completion abilities are improving rapidly, **doubling every 7 months**.

Within 2-4 years, AI will be capable of executing complex tasks that take a full week to complete.

While we can wait for that moment, we can also proactively take actions to stay ahead of the curve and even contribute to this future.

## Key Mindset Shifts For Engineers

### Let AI do, you help

| Approach            | Result             | Limitation                                                                                                                                                                                                                          |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **You do, AI help** | **Saving time**    | Speed is **limited by your biological characteristics**: humans only have 2 eyes, 2 hands, our bodies need rest, theoretically our brains can only process one thing at a time, and our reading and understanding speed is limited. |
| **AI do, you help** | **Attention free** | Multiple AI agents can work in parallel, the production can be scaled up by adding more agents.                                                                                                                                     |

### Start managing the "shadow knowledge"

Unlike domain knowledge, shadow knowledge is rarely documented and exists primarily in engineers' minds, including:

- Project code structure
- Project release process
- Code submission standards
- Team collaboration processes
- Code review criteria
- And more

This shadow knowledge constitutes what we call "experience" and determines an engineer's growth from novice to expert.

When we want Agents to work like experts, we must first incorporate this shadow knowledge into their context and memory.

In this project, we currently use a file-based approach to integrate shadow knowledge into the Agent's context. In the future, specialized tools for managing shadow knowledge will likely emerge, and agents will develop the ability to learn this knowledge autonomously.

## Roadmap

Test with Models capabilities:

- Try more complex tasks, for example: simple feature development, or bug fixing.
- Integrate with more MCP tools: Slack, [Browser Use](https://docs.browser-use.com/introduction), Kubernetes, etc.

**Around Agent:**

Tools evolve constantly - today it's Cursor, tomorrow it might be something else. Teams may develop their own agents or integrate multiple agents from different sources to work together. So this project **doesn't aim to build agents themselves, but rather to explore opportunities in the ecosystem surrounding them**:

- Task management: build a system for different roles (PM, Dev, QA) to submit, reuse, review and track tasks, making them easily consumable by agents.
- Knowledge management: create a system to capture team knowledge, integrate with enterprise apps, and enable two-way knowledge sharing between engineers and agents.
- Tools: implement enterprise-level security for agent tool access.
- Agent Observability: develop solutions to track agent activities, progress, issues, and permission requests.

The form of product looks like:

![Project form](roadmap.png)
