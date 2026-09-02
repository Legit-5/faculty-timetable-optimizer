# 🗓️ Faculty Timetable Optimizer

> **An AI-powered, conflict-free academic timetable scheduling engine built with Python & Flask.**

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.1-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📌 Overview

The **Faculty Timetable Optimizer** is an intelligent scheduling system designed to automate the complex task of assigning faculty lectures to time slots without conflicts. It uses a **Greedy Algorithm with Heuristic Scoring** to generate optimal timetables while respecting a comprehensive set of real-world constraints.

Whether you're managing a small department or a large institution, this tool eliminates scheduling headaches in seconds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Scheduling Engine** | Greedy + Heuristic algorithm for near-optimal solutions |
| 🚫 **Conflict Detection** | No double-booking, no overlapping lectures |
| 📅 **Flexible Configuration** | Custom faculty, subjects, days, and time slots |
| ⚖️ **Workload Balancing** | Distributes lectures fairly across all faculty |
| 🔁 **Anti-Fatigue Penalties** | Penalizes consecutive & repeated daily subject slots |
| 🔄 **Intelligent Substitution** | Qualified faculty substitution with constraint checks |
| 🆓 **Graceful Free Periods** | Handles unfillable slots cleanly |
| 🌐 **Web Interface** | Clean, interactive browser-based UI via Flask |

---

## 🧠 Algorithm Architecture

```
Algorithm : Greedy Search + Heuristic Scoring (Informed Search)
Decision  : Lowest Heuristic Score → Best Candidate at each step
```

**Constraints handled:**

- ✅ Compulsory Faculty–Subject Mapping (faculty can only teach assigned subjects)
- ✅ Faculty Day & Time-Slot Availability
- ✅ No Double-Booking / Overlapping Faculty Lectures
- ✅ Maximum Faculty Daily Lecture Limit
- ✅ Strict Time-Slot Interval Validation
- ✅ Subject Required Weekly Hours Satisfaction
- ✅ Consecutive Subject Penalization (Anti-fatigue)
- ✅ Daily Subject Repetition Penalization
- ✅ Global Faculty Workload Balancing
- ✅ Graceful Free-Period Handling for unfillable slots
- ✅ Intelligent Faculty Substitution with Qualification Checks

---

## 🗂️ Project Structure

```
faculty-timetable-optimizer/
├── app.py                  # Core Flask application & scheduling engine
├── requirements.txt        # Python dependencies
├── .gitignore              # Git ignored files
├── templates/
│   └── index.html          # Main HTML template (UI)
└── static/
    ├── css/
    │   └── style.css       # Stylesheet
    └── js/
        └── main.js         # Frontend JavaScript logic
```

---

## 🚀 Getting Started

### Prerequisites

- Python **3.8+**
- `pip` package manager

### 1. Clone the Repository

```bash
git clone https://github.com/Legit-5/faculty-timetable-optimizer.git
cd faculty-timetable-optimizer
```

### 2. Create a Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

Open your browser and navigate to:

```
http://127.0.0.1:5000
```

---

## ⚙️ Configuration

The app ships with sensible defaults that you can override via the web UI:

| Config | Default Values |
|---|---|
| **Faculty** | Prof. Rahul, Prof. Amit, Prof. Neha |
| **Subjects** | Python, DBMS, Statistics |
| **Days** | Monday – Friday |
| **Time Slots** | 09:00 AM – 01:00 PM (4 slots) |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ by **Aryan** — BSE Sem 1, AI/ML Coursework.

> *"Good scheduling is invisible. Bad scheduling is a crisis."*
