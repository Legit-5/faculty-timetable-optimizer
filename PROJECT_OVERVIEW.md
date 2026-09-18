# 📅 Faculty Timetable Optimizer — Project & Algorithm Guide

An intelligent, conflict-free timetable generation web application built with **Python (Flask)**, **HTML5**, **Modern CSS**, and **Vanilla JavaScript**.

---

## 🌟 1. Project Overview & Viva Presentation Summary

**Faculty Timetable Optimizer** is an automated scheduling web application engineered to solve the complex academic challenge of generating **100% conflict-free, balanced, and workload-distributed class timetables**.

### 🎯 Key Objectives & Real-World Constraints Solved
* **Zero Faculty Collisions**: Prevents double-booking across shared time slots.
* **Compulsory Faculty-Subject Mapping**: Guarantees teachers only teach subjects they are qualified for.
* **Faculty Day Availability**: Respects teacher working days and leaves.
* **Workload Balancing**: Distributes teaching hours evenly across available faculty members.
* **Subject Anti-Fatigue (Anti-Repetition)**: Penalizes scheduling the same subject back-to-back or clustering multiple lectures of the same subject on the same day.
* **Intelligent Substitution Manager**: Dynamically detects absent faculty lectures and recommends least-loaded, qualified substitutes.
* **Free Period Management**: Gracefully assigns clear `— Free Period —` slots when subject requirements are fulfilled or no faculty is available.
* **Capacity & Overlap Validation**: Detects overlapping time intervals (e.g. `9:00 AM - 10:00 AM` vs `9:30 AM - 10:30 AM`) and verifies total required hours do not exceed total available slots.

---

## 🧠 2. AI Algorithm Architecture (College Viva Guide)

### 📌 What Algorithm Does This Project Use?
* **Algorithm Name**: Greedy Algorithm with Heuristic Scoring (Informed Search).
* **Search Strategy**: At each step `(Day, TimeSlot)`, evaluate all eligible `(Subject, Faculty)` candidates and choose the one with the **lowest heuristic score**.
* **Is this Machine Learning?**: **NO.** Machine Learning relies on training sets and statistical probabilities. A timetable optimizer requires **100% hard constraint satisfaction**, which heuristic search solves deterministically and explainably.

### 💡 Heuristic Scoring Formula:
$$\text{Score} = \text{Consecutive\_Penalty} + \text{Daily\_Repeat\_Penalty} - \text{Remaining\_Hours\_Bonus} + \text{Workload\_Penalty} + \text{Rotation\_Offset}$$

| Penalty / Bonus Term | Weight | Purpose |
| :--- | :--- | :--- |
| **Consecutive Penalty** | `+10,000` | Prevents the same subject from being taught back-to-back in adjacent slots. |
| **Daily Repeat Penalty** | `+250 × count` | Discourages crowding the same subject multiple times on the same day. |
| **Remaining Hours Bonus** | `-60 × remaining` | Prioritizes subjects with the highest pending hours to ensure completion. |
| **Faculty Workload Penalty** | `+15 × total_load` | Balances teaching load across all faculty members. |
| **Rotation Offset** | `+0.1 × index` | Minor tie-breaker ensuring fair round-robin rotation. |

---

## 🪜 3. Step-by-Step Algorithm Workflow

```
[ Step 1: Input & Interval Validation ]
   ├── Validate unique faculty names, subjects, days, and non-overlapping time slots
   └── Check Total Capacity: Total Required Hours <= Total Days * Total Slots
            │
            ▼
[ Step 2: Initialize State Stores ]
   ├── remaining_hours = { "Python": 6, "DBMS": 5, "Statistics": 5 }
   ├── faculty_total_load = { "Prof. Rahul": 0, "Prof. Amit": 0, ... }
   └── faculty_busy = { "Prof. Rahul": set(), ... }
            │
            ▼
[ Step 3: Iterate Over Each Day & Time Slot ]
   └── For each Day in Days:
         └── For each Slot in Time Slots:
                  │
                  ├─► [ Step 4: Candidate Filtering (Hard Constraints) ]
                  │     For every subject where remaining_hours > 0:
                  │        For every faculty mapped to that subject:
                  │           ✓ Faculty is available on this Day?
                  │           ✓ Faculty is NOT busy in (Day, Slot)?
                  │           ✓ Faculty daily lectures < Max Daily Limit (2)?
                  │
                  ├─► [ Step 5: Heuristic Scoring & Greedy Selection ]
                  │     Calculate score for each valid (Subject, Faculty) pair.
                  │     ├── Candidates exist? -> Pick candidate with MINIMUM score.
                  │     └── No candidate valid? -> Assign "— Free Period —".
                  │
                  └─► [ Step 6: Update State ]
                        remaining_hours[subject] -= 1
                        faculty_total_load[faculty] += 1
                        faculty_busy[faculty].add((Day, Slot))
            │
            ▼
[ Step 7: Final Verification & Dashboards ]
   ├── Verify zero collisions and complete subject hours
   └── Return Timetable, Subject Hours Summary, and Faculty Workload Chart
```

---

## 👥 4. Faculty Substitution System

When an instructor is absent:
1. Identifies all affected lectures for that teacher on the specified day.
2. Checks **Faculty-Subject Mapping**: only teachers qualified to teach that subject are considered.
3. Checks **Availability & Busy Slots**: verifies the candidate is free at that specific day and time slot.
4. Ranks substitutes by **Current Workload (Ascending)** to assign the least-loaded teacher.
5. Allows 1-click **Auto-Assign** or individual replacement, live updating the weekly timetable.

---

## 🛠️ 5. Project Structure & API Endpoints

```text
faculty-timetable-optimizer/
├── app.py                  # Main Flask application & Greedy Heuristic engine
├── requirements.txt        # Python package dependencies (Flask)
├── static/
│   ├── css/
│   │   └── style.css       # Responsive glassmorphism UI & Print styles
│   └── js/
│       └── main.js         # Interactive client controller & substitution tool
├── templates/
│   └── index.html          # Frontend presentation & viva guide modals
└── README.md               # Documentation & setup guide
```

### REST API Endpoints
* `GET /` — Main web interface.
* `POST /api/generate` — Generates conflict-free timetable.
* `POST /api/substitution/check` — Discovers qualified available substitutes.
* `POST /api/substitution/apply` — Applies confirmed substitutions to the active schedule.
* `GET /api/algorithm-info` — Returns algorithm metadata for educational presentations.

---

## 🚀 6. Future Enhancements
1. **Genetic Algorithms (GA)**: Multi-objective evolutionary search.
2. **Constraint Satisfaction Problems (CSP)**: Backtracking with Arc Consistency (AC-3).
3. **Room & Lab Allocation**: Integrating physical room and equipment capacity.
4. **Student Batch Clashes**: Multi-section student elective support.
