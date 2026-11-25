# User Flows — v0.1.0

This document specifies the core task paths, transitions, and user journeys for Exam App v0.1.0, accompanying the editable [user flows whiteboard](./).

## Primary Study Flows

### 1. Ordinary Question Practice
The core loop for day-to-day studying within a single competition:
```
Home 
  ──> Select Competition 
  ──> Questions Page (List View)
  ──> [Optional] Apply Subject / Topic Filter
  ──> [Optional] Set Auto-Check Toggle (On / Off)
  ──> Select Option for Question
        ├── Auto-check ON  ──> Immediate correctness feedback
        └── Auto-check OFF ──> Click "Verify" ──> Feedback displayed
```

### 2. Missed Questions Review ("Errei")
Practicing questions previously answered incorrectly:
```
Questions Page (or link from Performance)
  ──> Toggle "Errei" (Missed Questions) Filter
  ──> View questions where latest checked attempt was incorrect
  ──> Select and answer question
        ├── If answered INCORRECTLY ──> Remains in "Errei" filter, attempt logged
        └── If answered CORRECTLY   ──> Removed from "Errei" filter on reload, 
                                        all attempts preserved in history & metrics
```

### 3. Weak-Topic Practice from Performance
Targeted remediation from the analytics dashboard:
```
Sidebar Bottom Avatar 
  ──> Open Avatar Menu 
  ──> Select "Performance"
  ──> Review accuracy breakdown by Subject and Topic
  ──> Identify weak area (low accuracy / high mistake count)
  ──> Click weak topic link
  ──> Navigates directly to Questions Page, pre-filtered to selected Competition & Topic
```

### 4. Taking a Mock Exam
Simulating examination conditions:
```
Questions Page 
  ──> Click "Mock Exam" action
  ──> Configure session:
        ├── Competition-specific (follows exam rules) OR Mixed (2+ competitions)
        ├── Select question count (default official or custom)
        └── Set timer (or use default official duration)
  ──> Start timed session:
        ├── Timer starts counting down
        ├── Answer, skip, or change options at will
        ├── If interrupted (navigating away / closing):
        │     └── Timer automatically pauses, saved with remaining time
        └── If time expires:
              └── Automatic final submission with answers recorded so far
  ──> Click "Finish Mock Exam"
  ──> Results & Review screen (correct, incorrect, score, full review)
```

### 5. Resuming an Interrupted Mock
```
Home or Questions Page
  ──> Prompt / banner: "You have an unfinished mock exam in progress"
  ──> Click "Resume Mock Exam"
  ──> Returns to session: timer resumes from remaining time, previous answers intact
```

## Decisions & Verification Notes
- **Attempt tracking:** Every attempt is persistently logged. A subsequent correct answer clears a question from the active missed-question list, but never erases prior mistakes from historical accuracy calculations.
- **Timer policy:** Explicitly confirmed that mock exam timers pause upon leaving and resume upon return. Timeouts automatically submit.
- **Navigation scope:** Ordinary question practice is strictly scoped to one competition at a time. Multi-competition combination is restricted exclusively to mixed mock exams.
