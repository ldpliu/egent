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
