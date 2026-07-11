# 🎓 StudentOS

StudentOS is a student productivity desktop app built to help students manage homework, plan focus sessions, track study progress, and stay aware of upcoming exams.

It started as a simple homework tracker, but it is slowly becoming a full study command center for students.

> Built by a student, for students.

---

## ✨ What StudentOS Does

StudentOS helps students answer five important questions:

1. What homework do I need to finish?
2. What should I focus on today?
3. How long should I study?
4. What exams are coming up?
5. How much progress did I actually make?

---

## 🚀 Current Features

### 👋 First-Launch Onboarding
- Set up your name
- Choose default focus duration
- Choose default break duration
- New users get their own setup experience
- Local user data is stored separately per device/user

---

### 🏠 Dashboard
- Personalized greeting
- Pending homework count
- Due Soon card
- Study Time card
- Today’s Plan
- Next Exam Countdown
- Start Focus directly from planned tasks
- Quick navigation to all exams

---

### 📚 Smart Homework Manager
- Add homework tasks
- Set subject and task details
- Pick due dates with a custom calendar picker
- Prevent selecting today or past dates
- Set priority: Low, Normal, High
- Set effort: Small, Medium, Large, Custom
- Custom effort minutes
- Auto-sort tasks by urgency and priority
- Mark tasks complete
- Delete tasks
- Start focus sessions directly from homework

---

### 🗓 Exam Countdown
- Add upcoming exams
- Set subject, exam name, date, and notes
- Track how many days are left
- Dashboard shows the nearest exam
- View all upcoming exams sorted by date
- Highlight the nearest exam with a “Next Exam” badge
- Special countdown labels for Today and Tomorrow
- Polished upcoming exam cards

---

### ⏱ Focus Timer
- Flexible focus timer
- Preset focus durations
- Custom focus durations
- Break timer
- Auto-start break after focus
- Start Focus from homework tasks
- Attach homework task to a focus session
- Mark homework complete during focus
- Switch tasks during a running session
- Continue studying freely without attached task
- End & Log for interrupted sessions
- Reset session without logging
- Accurate study time tracking using seconds

---

### 📊 Progress
- Study time today
- Study time this week
- Weekly session count
- Best study day
- Supports accurate session tracking using seconds

---

### ⚙ Settings
- Change user name
- Change default focus duration
- Change default break duration
- Persistent settings
- Settings update Dashboard and Timer behavior

### 🔥 Study Streaks
- Track current study streak
- Track longest study streak
- Streaks are calculated from real focus sessions
- Dashboard shows current streak
- Progress page shows streak stats

---

## 🖼 Screenshots

### Dashboard — Top
![Dashboard Top](screenshots/dashboard_top.png)

### Dashboard — Bottom
![Dashboard Bottom](screenshots/dashboard_bottom.png)

### Homework Manager
![Homework Manager](screenshots/homework.png)

### Focus Timer
![Focus Timer](screenshots/timer.png)

### Progress
![Progress](screenshots/progress.png)

### Onboarding
![Onboarding](screenshots/onboarding.png)


---

## 🛠 Tech Stack

- Python
- CustomTkinter
- JSON for local data storage
- Pillow for generated icons
- PyInstaller for Windows builds
- Git and GitHub for version control

---

## 📁 Project Structure

```text
StudentOS/
│
├── main.py
├── app.py
├── theme.py
│
├── pages/
│   ├── dashboard.py
│   ├── homework.py
│   ├── exams.py
│   ├── timer.py
│   ├── progress.py
│   ├── settings.py
│   └── onboarding.py
│
├── widgets/
│   ├── sidebar.py
│   ├── stat_card.py
│   └── date_picker.py
│
├── services/
│   └── storage.py
│
├── assets/
│   └── icons/
│
├── screenshots/
│
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── FEEDBACK.md
├── LICENSE
├── requirements.txt
└── .gitignore
```

---

## 💾 Local Data Storage

StudentOS stores user data locally on the user’s own device.

Local app data includes:

- settings
- homework
- study sessions
- exams

In packaged Windows builds, user data is stored separately for each user, so another person opening the app should get their own onboarding and not someone else’s saved name/settings.

---

## ▶️ How to Run From Source

### 1. Clone the repository

```bash
git clone https://github.com/Venkatesh-Trivedi/StudentOS.git
cd StudentOS
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the app

```bash
python main.py
```

---

## 📦 Windows Build

StudentOS can be packaged as a Windows app using PyInstaller.

Basic build command:

```bash
pyinstaller --noconfirm --onedir --windowed --name StudentOS --add-data "assets;assets" main.py
```

The built app appears in:

```text
dist/StudentOS/StudentOS.exe
```

For sharing, zip the full `dist/StudentOS` folder and send the zip or attach it to a GitHub Release.

---

## 📌 Current Version

```text
v0.9.0 - Study Streaks
```

Completed milestones:

- v0.1.0 — Prototype
- v0.2.0 — Smart Homework System
- v0.3.0 — Connected Focus Workflow
- v0.4.0 — Study Stats
- v0.5.0 — Today’s Plan & Effort Estimates
- v0.6.0 — Settings
- v0.7.0 — Friend Testing Prep
- v0.8.0 — Exam Countdown
- v0.9.0 — Study Streaks

See [`ROADMAP.md`](ROADMAP.md) for the full roadmap.

---

## 🧪 Friend Testing

StudentOS is currently being tested with a small group of early users.

Testing focuses on:

- first launch onboarding
- adding homework
- using Today’s Plan
- starting focus sessions
- tracking progress
- adding exams
- checking exam countdowns
- finding confusing UI
- spotting bugs

Feedback is tracked in [`FEEDBACK.md`](FEEDBACK.md).

---

## 🔮 Planned Features

### Near Future
- Study streaks
- Better progress graphs
- Data export/import
- Reminders
- Study Vault / document library
- Spin wheel for deciding what to study

### Later
- Web / Android-friendly version
- AI tutor layer
- AI explanations using Study Vault context
- NCERT-based explanations
- Friendly explainer in English, Hindi, and Hinglish
- Practice questions
- Flashcards
- Rewards / XP system

---

## 📚 Study Vault Vision

Study Vault is a planned feature where students can store study-related files such as:

- PDFs
- notes
- worksheets
- question papers
- screenshots
- useful links

Later, Study Vault could give the AI tutor context so it can answer based on the student’s own study material instead of giving generic explanations.

Example future flow:

```text
Upload chapter PDF → Add homework → Ask AI → AI explains using saved material
```

---

## 🤖 AI Plans

AI is planned, but it will be added later after the core productivity system is stable.

The goal is not to make StudentOS just another chatbot. The AI should support the existing study workflow.

Future AI ideas:

- Explain homework topics
- Use NCERT textbook context
- Use Study Vault documents as context
- Explain in a friendly style
- Support English, Hindi, and Hinglish
- Generate exam-style answers
- Create practice questions
- Make flashcards
- Help revise before exams

---

## 🧠 Product Philosophy

StudentOS should not become a random collection of features.

Every feature should help students:

- plan better,
- focus better,
- finish tasks,
- prepare for exams,
- and understand their progress.

Core productivity features should stay free and ad-free.

---

## 🚫 What StudentOS Is Not

StudentOS is not meant to be:

- a distraction app
- a random gamified dashboard
- a replacement for studying
- a bloated app full of unused features

Gamification may be added later, but only if it helps students study better.

---

## 🧪 Status

StudentOS is currently in active development.

The app is not yet a finished public release, but the core workflow is working and being prepared through friend testing.

---

## 📜 License

This project is licensed under the MIT License.

See [`LICENSE`](LICENSE) for details.