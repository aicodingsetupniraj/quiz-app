# Context

How the agent spends its context window. This is a correctness rule, not a cost rule:
**everything loaded competes with the task for attention.** A session holding forty files
reasons worse about the one being changed than a session holding four, and it fails in a way
that looks like carelessness rather than like running out of room.

## Load narrowly

- **Locate, then read.** Search for the symbol to get paths and line numbers, then read that
  range. Reading a 2,000-line file to change ten lines spends the budget on 1,990 lines of
  noise.
- **Read a file once.** If it is already in this session, it is already known. Re-reading to
  "check" costs the same as the first read and adds nothing.
- Prefer the tool that returns paths over the one that returns contents, until you know which
  file you want.
- **Hand a broad search to a subagent.** A fan-out across a whole tree returns one answer to
  this session instead of fifty file dumps - that is what subagents are for, and it is the
  single largest saving available.

## Keep command output out of the window

- `head`, `tail`, `grep`, and a line range beat `cat` on anything long.
- **A failing test run is read by its failures**, not by its full output. Filter to them.
- Long output goes to a file, and the file is read in the part that matters. A build log
  pasted whole is thousands of tokens nobody reads twice.
- Never print a large file to inspect it when a search would answer the question.

## Do not restate

- Do not echo a file's contents back after editing it. The diff is the record.
- Do not summarise what was just read into the reply. Say what changed and why.
- Intermediate results - a list of matches, a plan, a table of findings - belong in a file if
  they are needed later, not repeated in the conversation.

## Start fresh at a task boundary

A long session accumulates dead ends, abandoned approaches, and stale file versions, all of
which still weigh on every turn. **A fresh session with a good `CLAUDE.md` beats a long one
carrying an hour of exploration.** Clear when the task changes.

That is what makes the next rule matter.

## The always-loaded set is a budget

`CLAUDE.md` and the rules it imports are paid on **every request, in every session, forever**.

- Keep `CLAUDE.md` under 200 lines. It is the highest-leverage file in the repository and the
  most expensive.
- **A rule that applies to one area is read when working in that area**, not imported
  globally. The import list at the bottom of `CLAUDE.md` is for what applies to nearly every
  change; everything else is routed by path.
- Detail that belongs to a stack lives in that stack's rule pack, and is read when a file in
  its `Paths:` line is being touched.
- Before adding to the always-loaded set, ask what it would displace. Something always does.

## When context is genuinely short

Say so, finish or checkpoint the current step, and write down what remains - in the plan
file, the PR description, or an issue. **Do not carry on quietly at reduced accuracy**; that
produces work that looks finished and is not, which is more expensive than stopping.
