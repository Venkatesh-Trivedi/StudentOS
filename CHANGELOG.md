# Changelog

## Unreleased — Web rewrite

### Added

- React, TypeScript, and Vite foundation for the StudentOS web app
- Strict TypeScript configuration and Oxlint
- Mobile-first interface for subjects, chapters, homework, and exams
- Versioned browser `localStorage` with migrations for supported data versions
- Subjects and chapters with inline renaming and deletion
- Homework linked to subjects and optional chapters, with completion and due-date grouping
- Reusable accessible confirmation dialog for destructive actions
- Multi-subject exams with subject and chapter scopes
- Exam series for grouping related exams
- Frozen “Entire subject” exam syllabus snapshots, preventing later chapter additions from changing existing exams
- Today planning derived from homework, exams, and revision work
- Chapter confidence and scheduled revision tasks
- Subject- and chapter-linked website and note resources
- Manual local JSON backup export and import with shared validation, migration, preview, and replacement confirmation

## Legacy desktop prototype

The history below describes the archived Python desktop prototype. It does not describe the current web rewrite.

### v0.9.0 — Study Streaks

#### Added

- Study Streak card on the Dashboard
- Current and longest streak tracking from study sessions
- Streak statistics on the Progress page

#### Improved

- Daily-use focus on the Dashboard
- Motivation data on the Progress page

### v0.8.0 — Exam Countdown

#### Added

- Exams page for upcoming exams with subject, name, date, and notes
- Persistent exam storage
- Dashboard exam countdown and navigation to all exams
- Upcoming-exam list sorted by nearest date, with Next Exam, Today, and Tomorrow labels

#### Improved

- Exam countdown cards and page layout
- Student-focused dashboard planning

### v0.7.0 — Friend Testing Prep

#### Added

- First-launch onboarding
- User name and default focus/break duration setup

#### Improved

- Prepared the desktop app for friend testing

### v0.6.0 — Settings

#### Added

- Settings page
- Persistent user name and default focus/break duration settings

### v0.5.0 — Today’s Plan & Effort Estimates

#### Added

- Task effort selector and custom effort minutes
- Today’s Plan on the Dashboard
- Suggested focus duration and Start Focus actions for planned work

#### Improved

- Homework form labels
- Separation of task priority and effort

### v0.4.0 — Study Stats

#### Added

- Progress page
- Study time today and this week
- Weekly session count and best study day

#### Improved

- Dashboard and progress statistics powered by study-session data

### v0.3.0 — Connected Focus Workflow

#### Added

- Start Focus actions on homework
- Homework attached to focus sessions
- Task completion and switching during a session
- End and log support for interrupted sessions
- Second-accurate study-time logging

#### Improved

- Homework card actions
- Dashboard study-time accuracy

### v0.2.0 — Smart Homework System

#### Added

- Homework creation, completion, deletion, and due dates
- Custom calendar date picker with past-date prevention
- Priority and effort settings, including custom effort minutes
- Homework sorting by urgency and priority
- Dashboard homework and due-soon summaries

### v0.1.0 — Prototype

#### Added

- Initial Python desktop app window with a dark theme and sidebar navigation
- Dashboard and homework manager
- JSON data storage
- Repository, documentation, and MIT License setup
