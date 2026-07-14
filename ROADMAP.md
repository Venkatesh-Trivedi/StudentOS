# StudentOS roadmap

StudentOS is being developed as a mobile-first web app for planning study work around subjects, chapters, homework, exams, revision, and study resources.

The direction remains:

> Open StudentOS and know what to study next, why it matters, and which material to use.

## Completed web milestones

- React, TypeScript, and Vite foundation
- Mobile-first interface with accessible forms and confirmation dialogs
- Versioned browser storage with migrations for supported older data
- Subjects and chapters, including inline renaming and deletion
- Homework linked to subjects and optional chapters, with completion and due-date groups
- Multi-subject exams, exam series, and frozen syllabus snapshots
- Today planning derived from homework, exams, and revision work
- Chapter confidence and scheduled revision tasks
- Website links and notes connected to subjects and chapters
- Manual local JSON export and import with validation, migration, preview, and confirmation
- Installable PWA shell with offline availability and an explicit update prompt

## Next priorities

- Continue refining Today recommendations and the core study-planning workflow
- Improve local-first reliability and backup guidance as real-device use grows
- Consider optional cloud sync as a later milestone, without making an account mandatory for local use
- Consider AI only after the non-AI workflow is useful and dependable

## Product focus

StudentOS should favour a focused study workflow over feature volume. Generic leaderboards, coins, social groups, extra timer modes, and random gamification are explicitly deprioritized.

## Archived legacy desktop prototype

The earlier Python desktop prototype is historical work, not the current application direction. Its v0.1.0–v0.9.0 milestones are retained in [CHANGELOG.md](CHANGELOG.md) for reference.

## Status

The web rewrite is in active development. Priorities may change as the core planning workflow is refined; no public release date or version has been set.
