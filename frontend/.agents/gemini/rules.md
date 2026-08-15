Before writing any code, creating any file, or starting any implementation task,
first check for relevant Agent Skills:

1. List all SKILL.md files under .agents/skills/, ~/.agents/skills/, and any
   agent-specific skills directories (e.g. .claude/skills/, .cursor/skills/,
   .gemini/skills/) that are available in this environment.
2. Read the frontmatter (name + description) of each one and identify any
   skill whose description plausibly matches the current task — even a partial
   match. Prefer being over-inclusive rather than missing a relevant skill.
3. If a matching skill is found, open and read the FULL SKILL.md content
   before doing anything else, and follow its instructions, conventions, and
   constraints as the primary guide for the task.
4. If a skill references other files, templates, or scripts, load those too
   before proceeding.
5. Only after this check is complete (or confirmed no skill applies) should
   you begin writing code, creating files, or producing output.

Do not skip this step for tasks that "seem simple" — skills often encode
project- or environment-specific constraints that aren't obvious from the
request alone.