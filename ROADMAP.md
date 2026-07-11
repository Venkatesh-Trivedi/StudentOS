# StudentOS Roadmap

StudentOS is a student productivity app focused on helping students plan work, focus on tasks, track study progress, and eventually learn with an AI-powered explainer.

The goal is simple:

> Help students know what to do, focus on it, and track real progress.

---

## ✅ Completed

### v0.1.0 - Prototype
- [x] Basic desktop app window
- [x] Dark theme
- [x] Sidebar navigation
- [x] Dashboard page
- [x] Homework manager
- [x] JSON data storage
- [x] Git repository setup
- [x] README.md
- [x] ROADMAP.md
- [x] LICENSE

---

### v0.2.0 - Smart Homework System
- [x] Add homework tasks
- [x] Mark homework complete
- [x] Delete homework tasks
- [x] Homework due dates
- [x] Custom calendar date picker
- [x] Prevent selecting today or past dates
- [x] Homework priority: Low, Normal, High
- [x] Homework effort: Small, Medium, Large, Custom
- [x] Custom effort minutes
- [x] Sort homework by urgency and priority
- [x] Dashboard pending homework count
- [x] Dashboard Due Soon card
- [x] Improved homework form labels
- [x] Improved homework action buttons

---

### v0.3.0 - Connected Focus Workflow
- [x] Flexible focus timer
- [x] Preset focus durations
- [x] Custom focus durations
- [x] Break timer
- [x] Auto-start break after focus session
- [x] Session complete message after break
- [x] Start Focus from homework tasks
- [x] Attach homework task to focus session
- [x] Mark homework complete during focus session
- [x] Switch to another task during a running session
- [x] Continue studying freely without attached task
- [x] End & Log for interrupted sessions
- [x] Reset session without logging
- [x] Accurate study time tracking using seconds
- [x] Prevent fake 1-minute logs from very short sessions
- [x] Avoid duplicate study logs

---

### v0.4.0 - Study Stats
- [x] Study session logging
- [x] Progress page
- [x] Study time today
- [x] Study time this week
- [x] Weekly session count
- [x] Best study day this week
- [x] Dashboard Study Time card
- [x] Support old `focus_minutes` logs and new `focus_seconds` logs

---

### v0.5.0 - Today’s Plan & Effort Estimates
- [x] Today’s Plan section on Dashboard
- [x] Generate today’s plan from homework due dates and priority
- [x] Show top 3 tasks to work on today
- [x] Suggest focus duration using task effort
- [x] Separate priority from effort
- [x] Start Focus from Today’s Plan
- [x] Attach planned task to Timer page
- [x] Preselect suggested focus duration where possible

---

### v0.6.0 - Settings
- [x] Settings page
- [x] Store settings in `data/settings.json`
- [x] User name setting
- [x] Default focus duration setting
- [x] Default break duration setting
- [x] Dashboard greeting uses saved user name
- [x] Timer uses saved default focus/break values
- [x] Persistent settings storage

---

### v0.7.0 - Friend Testing Prep
- [x] First-launch onboarding screen
- [x] User name setup during onboarding
- [x] Default focus duration setup during onboarding
- [x] Default break duration setup during onboarding
- [x] `onboarding_completed` setting
- [x] Better Coming Soon placeholder pages
- [x] Generated/sidebar icon improvements
- [x] App is less hardcoded and more friend-ready

---

### v0.8.0 - Exam Countdown
- [x] Exams page
- [x] Add upcoming exams
- [x] Exam date validation
- [x] Dashboard next exam countdown
- [x] View all exams navigation
- [x] Upcoming exams list sorted by nearest date
- [x] Next Exam badge
- [x] Polished countdown cards

### v0.9.0 - Study Streaks
- [x] Current study streak
- [x] Longest study streak
- [x] Dashboard streak card
- [x] Progress page streak stats
- [x] Streak calculation from study sessions
- [x] Study streak dashboard icon

## 🔜 Next Planned Versions

### v0.9.0 - Data & Backup
- [ ] Export homework, settings, and study logs
- [ ] Import saved data
- [ ] Backup data as a `.zip` or `.json`
- [ ] Add warning before clearing data
- [ ] Add basic data validation
- [ ] Make app safer for real users

---

### v1.0.0 - Public Beta
- [ ] Stable homework system
- [ ] Stable focus workflow
- [ ] Stable study logging
- [ ] Stable progress page
- [ ] Stable settings/onboarding
- [ ] Clean README with screenshots
- [ ] Add app screenshots
- [ ] Add usage guide
- [ ] Add known issues section
- [ ] Create GitHub release
- [ ] Share with a small public group

---

## 🧪 Testing Checklist Before Sharing

Before giving StudentOS to friends:

- [ ] First launch onboarding works
- [ ] Settings save correctly
- [ ] Dashboard greeting updates
- [ ] Homework tasks save after restart
- [ ] Due dates save correctly
- [ ] Priority saves correctly
- [ ] Effort saves correctly
- [ ] Homework sorting works
- [ ] Today’s Plan shows correct tasks
- [ ] Start Focus from Homework works
- [ ] Start Focus from Today’s Plan works
- [ ] Mark task complete during focus works
- [ ] Switch task during focus works
- [ ] End & Log saves accurate time
- [ ] Reset discards session
- [ ] Dashboard study time updates
- [ ] Progress page stats update
- [ ] App does not crash when files are missing
- [ ] App does not crash after restart

---

## 🔮 Future Features

### Goals Page
- [ ] Daily goals
- [ ] Weekly goals
- [ ] Goal completion tracking
- [ ] Link goals to homework/study sessions
- [ ] Show goal progress on dashboard

---

### Advanced Progress
- [ ] Study streak
- [ ] Subject-wise study time
- [ ] Weekly graph
- [ ] Monthly summary
- [ ] Best focus duration
- [ ] Most productive day
- [ ] Completed tasks over time

---

### Better Planning
- [ ] Smarter Today’s Plan
- [ ] Tomorrow’s Plan
- [ ] Weekly plan
- [ ] Suggest task order from due date, priority, and effort
- [ ] Warn when too many tasks are due soon
- [ ] Suggest breaks after long workload

---

### Mobile / Web Future
StudentOS is currently a PC desktop app. Many students may prefer Android, so a mobile-friendly version may come later.

Possible future direction:

- [ ] Web app version
- [ ] Android-friendly PWA
- [ ] Mobile dashboard
- [ ] Mobile homework manager
- [ ] Mobile focus timer
- [ ] Sync between PC and mobile

---

### AI Tutor Layer
AI will be added later after the core productivity system is stable.

Planned AI features:

- [ ] NCERT textbook context
- [ ] Friendly explainer
- [ ] Preferred language: English, Hindi, Hinglish
- [ ] Explain homework topics
- [ ] Exam-answer generator
- [ ] Practice question generator
- [ ] Flashcards
- [ ] Quick revision mode
- [ ] Doubt solving from homework tasks
- [ ] “Explain like a friend” mode

Important rule:

> AI should support the workflow, not replace the core app.

---

## Product Philosophy

StudentOS should not become a random collection of features.

Every feature should help answer one of these questions:

1. What do I need to do?
2. What should I focus on now?
3. How long will it take?
4. How much progress did I actually make?
5. What should I learn or revise next?

---

## Monetization Philosophy

Early versions should be:

- Free
- No ads
- Student-friendly
- Easy to share

Possible future monetization, much later:

- Optional supporter version
- Premium AI credits
- Cloud sync
- Extra themes
- Advanced analytics

Core productivity features should stay free.

---

## Long-Term Vision

StudentOS should become:

> A study command center made by a student, for students.

It should help students plan better, focus better, and understand their learning better — without distractions, ads, or unnecessary complexity.