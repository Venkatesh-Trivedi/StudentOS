# StudentOS

StudentOS is a mobile-first student planning web app built with React, TypeScript, and Vite.

Its product promise is simple:

> Open StudentOS and know what to study next, why it matters, and which material to use.

StudentOS is in active development and is not yet a public release.

## Current features

### Subjects and chapters

- Create subjects and organise their chapters
- Rename subjects and chapters inline
- Delete subjects or chapters with a confirmation step

### Homework

- Add homework linked to a subject and, optionally, a chapter
- Set a due date and mark homework complete or incomplete
- View homework in Overdue, Due today, Upcoming, and Completed groups

### Exams

- Create standalone exams or group subject exams into an exam series
- Build an exam from one or more subject scopes
- Include an entire subject or selected chapters for each subject scope
- Keep an “Entire subject” syllabus as a frozen snapshot, so chapters added later are not silently included

### Local persistence

- Keep StudentOS data in the browser with versioned `localStorage`
- Migrate supported older data formats when the storage schema changes
- Preserve changes only after they have been saved successfully

## Data and privacy

StudentOS currently stores all data in the browser under one versioned local-storage record. There are no accounts, cloud sync, or server-side storage yet. Browser storage is specific to the browser and device where it is used.

## Development

From the repository root:

    npm install
    npm run dev
    npm run build
    npm run lint

## Tech stack

- React
- TypeScript
- Vite
- CSS
- Browser `localStorage`
- Oxlint

## Project structure

```text
src/
  app/                 Application composition and state ownership
  data/                Versioned browser storage
  features/
    subjects/          Subject UI and domain logic
    chapters/          Chapter UI and domain logic
    homework/          Homework UI and domain logic
    exams/             Exam and exam-series UI and domain logic
  shared/              Reusable components and styles
  types/               Shared StudentOS data types
```

## Legacy desktop prototype

The earlier Python desktop prototype is archived historical work. Any retained desktop screenshots and the v0.1.0–v0.9.0 history do not represent the current web rewrite; see [CHANGELOG.md](CHANGELOG.md) for that record.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
