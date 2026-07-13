# StudentOS

StudentOS is a mobile-first student planning web app built with React, TypeScript, and Vite.

Its product promise is simple:

> Open StudentOS and know what to study next, why it matters, and which material to use.

StudentOS is in active development and is not yet a public release.

## Current features

### Today and revision

- See a focused Today plan derived from upcoming homework, exams, and revision tasks
- Track chapter confidence and schedule revision work
- Complete homework and revision tasks from the relevant planning screens

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

### Study resources

- Save website links and plain-text notes for a subject or chapter
- Surface relevant study material alongside Today and revision work
- Open links safely and manage resources without uploading their contents

### Local persistence and backups

- Keep StudentOS data in the browser with versioned `localStorage`
- Migrate supported older data formats when the storage schema changes
- Download a readable JSON backup containing the complete StudentOS dataset
- Preview and confirm a JSON restore before it replaces the data currently stored in StudentOS
- Preserve current data if an imported backup is invalid or cannot be saved

## Data and privacy

StudentOS currently stores all data in the browser under one versioned local-storage record. Data remains specific to the browser and device where the app is used.

Backups are manual and local: StudentOS downloads a JSON file to the device, and a selected backup is read in the browser when restored. Backup data is not uploaded to a server. There are still no accounts, automatic backups, or cloud sync.

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
- Browser `localStorage`, Blob, and File APIs
- Oxlint

## Project structure

```text
src/
  app/                 Application composition and state ownership
  data/                Versioned storage, migration, and backup logic
  features/
    today/             Daily study recommendations
    subjects/          Subject UI and domain logic
    chapters/          Chapter UI and domain logic
    homework/          Homework UI and domain logic
    exams/             Exam and exam-series UI and domain logic
    revision/          Confidence and revision planning
    resources/         Link and note resources
    backup/            Data export and import screen
  shared/              Reusable components, utilities, and styles
  types/               Shared StudentOS data types
```

## Legacy desktop prototype

The earlier Python desktop prototype is archived historical work. Any retained desktop screenshots and the v0.1.0–v0.9.0 history do not represent the current web rewrite; see [CHANGELOG.md](CHANGELOG.md) for that record.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
