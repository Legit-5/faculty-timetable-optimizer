"""
Faculty Timetable Optimizer - Flask Web Application
===================================================
A reliable, conflict-free timetable scheduling engine built with Python & Flask.

AI Algorithm Architecture:
--------------------------
Algorithm: Greedy Algorithm + Heuristic Scoring (Informed Search)
Decision Rule: Lowest Score = Best Candidate at each step
Constraints Handled:
  - Compulsory Faculty-Subject Mapping
  - Faculty Day Availability & Time-Slot Availability
  - No Double-Booking / Overlapping Faculty Lectures
  - Maximum Faculty Daily Lecture Limit
  - Strict Time-Slot Interval Validation (No Overlapping Slots)
  - Subject Required Hours Satisfaction
  - Consecutive Subject Penalization (Anti-fatigue)
  - Daily Subject Repetition Penalization
  - Global Faculty Workload Balancing
  - Graceful Free-Period Handling for unfillable slots
  - Intelligent Faculty Substitution with Qualification Checks
"""

import re
from datetime import datetime
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# ============================================================================
# 1. DEFAULT CONFIGURATION DATA
# ============================================================================
DEFAULT_FACULTY = ["Prof. Rahul", "Prof. Amit", "Prof. Neha"]
DEFAULT_SUBJECTS = ["Python", "DBMS", "Statistics"]
DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
DEFAULT_TIME_SLOTS = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
]

# Default Faculty-to-Subject Mapping (Compulsory: faculty can only teach mapped subjects)
DEFAULT_SUBJECT_FACULTY_MAP = {
    "Python": ["Prof. Rahul", "Prof. Neha"],
    "DBMS": ["Prof. Rahul", "Prof. Amit"],
    "Statistics": ["Prof. Amit", "Prof. Neha"],
}

# Default Weekly Required Hours per Subject
DEFAULT_SUBJECT_HOURS = {
    "Python": 6,
    "DBMS": 5,
    "Statistics": 5,
}

# Default Faculty Day Availability (True = Available)
DEFAULT_FACULTY_AVAILABILITY = {
    "Prof. Rahul": {"days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
    "Prof. Amit": {"days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
    "Prof. Neha": {"days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
}

# Heuristic Scoring Weights
DEFAULT_MAX_LECTURES_PER_DAY = 2
CONSECUTIVE_PENALTY_WEIGHT = 10000  # Strong discouragement for same subject back-to-back
DAILY_REPEAT_PENALTY_WEIGHT = 250   # Discouragement for crowding same subject on same day
REMAINING_HOURS_BONUS_WEIGHT = 60   # Preference for subjects with most remaining hours
FACULTY_WORKLOAD_WEIGHT = 15        # Load balancing penalty to distribute lectures fairly


# ============================================================================
# 2. CUSTOM EXCEPTIONS
# ============================================================================
class TimetableValidationError(Exception):
    """Raised when user input fails structural or logical validation."""
    pass


class TimetableConflictError(Exception):
    """Raised when a conflict-free timetable is mathematically or logically impossible."""
    pass


# ============================================================================
# 3. TIME SLOT PARSING & OVERLAP VALIDATION
# ============================================================================
def parse_time_to_minutes(time_str: str) -> int:
    """
    Parse a single time string like '9:00 AM', '09:00', '1:30 PM' into minutes from midnight.
    Supports 12-hour AM/PM and 24-hour formats.
    """
    cleaned = time_str.strip()
    # Check for 12-hour AM/PM format
    for fmt in ("%I:%M %p", "%I %p", "%I:%M%p", "%I%p", "%H:%M"):
        try:
            dt = datetime.strptime(cleaned, fmt)
            return dt.hour * 60 + dt.minute
        except ValueError:
            continue
    
    # Regex fallback for formats like "09:00"
    match = re.match(r"^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$", cleaned)
    if match:
        h, m, meridiem = int(match.group(1)), int(match.group(2)), match.group(3)
        if meridiem:
            meridiem = meridiem.upper()
            if meridiem == "PM" and h < 12:
                h += 12
            elif meridiem == "AM" and h == 12:
                h = 0
        return h * 60 + m

    raise TimetableValidationError(
        f"Invalid time format: '{time_str}'. Please use standard formats like '09:00 AM' or '02:00 PM'."
    )


def validate_and_normalize_time_slots(time_slots):
    """
    Validates and standardizes time slots.
    Ensures:
      1. Non-empty list
      2. Each slot has format 'START - END'
      3. Start time is strictly before End time
      4. No duplicate time slots
      5. No overlapping time slot intervals (e.g. 9:00-10:00 and 9:30-10:30 are rejected)
    """
    if not time_slots or not isinstance(time_slots, list):
        raise TimetableValidationError("At least one time slot is required.")

    parsed_intervals = []
    normalized_slots = []
    seen_slots = set()

    for idx, slot in enumerate(time_slots):
        if not isinstance(slot, str) or not slot.strip():
            raise TimetableValidationError(f"Time slot #{idx + 1} cannot be empty.")
        
        slot_str = slot.strip()
        if "-" not in slot_str:
            raise TimetableValidationError(
                f"Time slot '{slot_str}' must contain a hyphen separator, e.g. '09:00 AM - 10:00 AM'."
            )
        
        parts = [p.strip() for p in slot_str.split("-", 1)]
        if len(parts) != 2 or not parts[0] or not parts[1]:
            raise TimetableValidationError(
                f"Invalid time slot interval: '{slot_str}'. Must have both start and end time."
            )

        start_min = parse_time_to_minutes(parts[0])
        end_min = parse_time_to_minutes(parts[1])

        if start_min >= end_min:
            raise TimetableValidationError(
                f"Invalid time slot '{slot_str}': Start time ({parts[0]}) must be earlier than End time ({parts[1]})."
            )

        # Normalized string representation
        sh, sm = divmod(start_min, 60)
        eh, em = divmod(end_min, 60)
        s_mer = "AM" if sh < 12 else "PM"
        e_mer = "AM" if eh < 12 else "PM"
        sh_12 = sh if 1 <= sh <= 12 else (sh - 12 if sh > 12 else 12)
        eh_12 = eh if 1 <= eh <= 12 else (eh - 12 if eh > 12 else 12)
        
        norm_slot = f"{sh_12:02d}:{sm:02d} {s_mer} - {eh_12:02d}:{em:02d} {e_mer}"

        if norm_slot in seen_slots:
            raise TimetableValidationError(f"Duplicate time slot detected: '{slot_str}'.")

        seen_slots.add(norm_slot)
        parsed_intervals.append((start_min, end_min, norm_slot))

    # Sort intervals chronologically by start time
    parsed_intervals.sort(key=lambda x: x[0])

    # Check for overlapping time slots
    for i in range(len(parsed_intervals) - 1):
        curr_start, curr_end, curr_name = parsed_intervals[i]
        next_start, next_end, next_name = parsed_intervals[i + 1]

        if curr_end > next_start:
            raise TimetableValidationError(
                f"Overlapping time slots detected: '{curr_name}' overlaps with '{next_name}'. "
                f"Please ensure time slots do not clash with each other."
            )

    normalized_slots = [item[2] for item in parsed_intervals]
    return normalized_slots


# ============================================================================
# 4. COMPREHENSIVE INPUT VALIDATION
# ============================================================================
def validate_inputs(
    faculty,
    subjects,
    days,
    time_slots,
    subject_faculty_map,
    faculty_availability,
    subject_hours,
):
    """
    Validates all configuration inputs before starting timetable generation.
    Returns cleaned and normalized data structures.
    """
    # 1. Validate Faculty
    if not faculty or not isinstance(faculty, list):
        raise TimetableValidationError("At least one faculty member is required.")
    
    cleaned_faculty = []
    seen_faculty = set()
    for f in faculty:
        if not isinstance(f, str) or not f.strip():
            raise TimetableValidationError("Faculty names cannot be empty or whitespace only.")
        f_name = f.strip()
        if f_name.lower() in seen_faculty:
            raise TimetableValidationError(f"Duplicate faculty name detected: '{f_name}'. Faculty names must be unique.")
        seen_faculty.add(f_name.lower())
        cleaned_faculty.append(f_name)

    # 2. Validate Subjects
    if not subjects or not isinstance(subjects, list):
        raise TimetableValidationError("At least one subject is required.")
    
    cleaned_subjects = []
    seen_subjects = set()
    for s in subjects:
        if not isinstance(s, str) or not s.strip():
            raise TimetableValidationError("Subject names cannot be empty or whitespace only.")
        s_name = s.strip()
        if s_name.lower() in seen_subjects:
            raise TimetableValidationError(f"Duplicate subject name detected: '{s_name}'. Subject names must be unique.")
        seen_subjects.add(s_name.lower())
        cleaned_subjects.append(s_name)

    # 3. Validate Days
    if not days or not isinstance(days, list):
        raise TimetableValidationError("At least one day is required.")
    
    cleaned_days = []
    seen_days = set()
    for d in days:
        if not isinstance(d, str) or not d.strip():
            raise TimetableValidationError("Day names cannot be empty or whitespace only.")
        d_name = d.strip()
        if d_name.lower() in seen_days:
            raise TimetableValidationError(f"Duplicate day detected: '{d_name}'. Days must be unique.")
        seen_days.add(d_name.lower())
        cleaned_days.append(d_name)

    # 4. Validate & Normalize Time Slots
    normalized_time_slots = validate_and_normalize_time_slots(time_slots)

    # 5. Validate Faculty-Subject Mapping (Compulsory)
    cleaned_mapping = {}
    if not subject_faculty_map or not isinstance(subject_faculty_map, dict):
        raise TimetableValidationError(
            "Faculty-to-Subject mapping is compulsory. Every subject must be mapped to at least one faculty member."
        )

    # Check that each subject in subjects list is mapped to at least one valid faculty
    for subj in cleaned_subjects:
        mapped_teachers = subject_faculty_map.get(subj, [])
        if isinstance(mapped_teachers, str):
            mapped_teachers = [mapped_teachers]
        
        if not mapped_teachers:
            raise TimetableValidationError(
                f"Subject '{subj}' has no assigned faculty. Please assign at least one qualified faculty member."
            )
        
        valid_mapped = []
        for t in mapped_teachers:
            t_clean = t.strip() if isinstance(t, str) else ""
            if t_clean not in cleaned_faculty:
                raise TimetableValidationError(
                    f"Subject '{subj}' is mapped to unknown faculty '{t}'. Faculty must exist in the faculty list."
                )
            if t_clean not in valid_mapped:
                valid_mapped.append(t_clean)

        if not valid_mapped:
            raise TimetableValidationError(f"Subject '{subj}' has no valid faculty assigned.")
        cleaned_mapping[subj] = valid_mapped

    # Check that each faculty is mapped to at least one subject
    faculty_with_subject = set()
    for teachers in cleaned_mapping.values():
        faculty_with_subject.update(teachers)
    
    for f in cleaned_faculty:
        if f not in faculty_with_subject:
            raise TimetableValidationError(
                f"Faculty '{f}' has no subject assigned. Every faculty member must teach at least one subject."
            )

    # 6. Validate Subject Hours
    cleaned_hours = {}
    total_required_hours = 0
    for subj in cleaned_subjects:
        hours = subject_hours.get(subj, 4) if subject_hours else 4
        try:
            hours_int = int(hours)
        except (ValueError, TypeError):
            raise TimetableValidationError(f"Required hours for subject '{subj}' must be a positive integer.")
        
        if hours_int <= 0:
            raise TimetableValidationError(f"Required hours for subject '{subj}' must be greater than 0 (got {hours_int}).")
        
        cleaned_hours[subj] = hours_int
        total_required_hours += hours_int

    # 7. Total Capacity Validation
    total_available_slots = len(cleaned_days) * len(normalized_time_slots)
    if total_required_hours > total_available_slots:
        raise TimetableValidationError(
            f"Impossible Timetable: Total required subject hours ({total_required_hours}h) exceed "
            f"available timetable slots ({len(cleaned_days)} days × {len(normalized_time_slots)} slots = {total_available_slots} slots). "
            f"Please reduce required hours or add more days/time slots."
        )

    # 8. Clean Faculty Availability
    cleaned_availability = {}
    for f in cleaned_faculty:
        avail = faculty_availability.get(f, {}) if faculty_availability else {}
        if isinstance(avail, dict):
            avail_days = avail.get("days", cleaned_days)
        elif isinstance(avail, (list, set)):
            avail_days = list(avail)
        else:
            avail_days = cleaned_days
        
        # Filter available days to only valid days in the current day schedule
        valid_days = [d for d in avail_days if d in cleaned_days]
        if not valid_days:
            raise TimetableValidationError(
                f"Faculty '{f}' has 0 available days in the current schedule. "
                f"Faculty must be available on at least one scheduled day."
            )
        cleaned_availability[f] = {"days": valid_days}

    return (
        cleaned_faculty,
        cleaned_subjects,
        cleaned_days,
        normalized_time_slots,
        cleaned_mapping,
        cleaned_availability,
        cleaned_hours,
    )


# ============================================================================
# 5. GREEDY ALGORITHM WITH HEURISTIC SCORING
# ============================================================================
def calculate_heuristic_score(
    subject: str,
    faculty_member: str,
    day: str,
    slot_idx: int,
    day_lectures: list,
    daily_faculty_load: dict,
    faculty_total_load: dict,
    remaining_hours: dict,
    faculty_index_offset: int,
) -> float:
    """
    Heuristic Scoring Function:
    Lower score = Better choice.
    
    Components:
      1. Consecutive Penalty (10,000): Avoid back-to-back lectures of the same subject.
      2. Daily Repeat Penalty (250 * count): Avoid scheduling the same subject multiple times in a day.
      3. Remaining Hours Bonus (-60 * remaining): Prioritize subjects with more pending hours.
      4. Faculty Workload Penalty (15 * total_load): Distribute teaching load evenly across faculty.
      5. Rotation Offset: Minor tie-breaker to ensure round-robin fairness.
    """
    # 1. Consecutive Penalty
    consecutive_penalty = 0
    if day_lectures and day_lectures[-1]["subject"] == subject:
        consecutive_penalty = CONSECUTIVE_PENALTY_WEIGHT

    # 2. Daily Repeat Penalty
    subject_count_today = sum(1 for lec in day_lectures if lec["subject"] == subject)
    daily_repeat_penalty = DAILY_REPEAT_PENALTY_WEIGHT * subject_count_today

    # 3. Remaining Hours Bonus (negative penalty = advantageous)
    remaining = remaining_hours.get(subject, 0)
    remaining_hours_bonus = REMAINING_HOURS_BONUS_WEIGHT * remaining

    # 4. Faculty Workload Load-Balancing Penalty
    current_load = faculty_total_load.get(faculty_member, 0)
    faculty_workload_penalty = FACULTY_WORKLOAD_WEIGHT * current_load

    # 5. Rotation Offset (tie-breaker)
    rotation_offset = faculty_index_offset * 0.1

    # Total Heuristic Score
    score = (
        consecutive_penalty
        + daily_repeat_penalty
        - remaining_hours_bonus
        + faculty_workload_penalty
        + rotation_offset
    )
    return score


def generate_timetable(
    faculty=None,
    subjects=None,
    days=None,
    time_slots=None,
    subject_faculty_map=None,
    faculty_availability=None,
    subject_hours=None,
    existing_schedules=None,
    max_lectures_per_day=DEFAULT_MAX_LECTURES_PER_DAY,
):
    """
    Generate an optimal, conflict-free weekly timetable using a Greedy Algorithm
    with Heuristic Scoring.
    
    Algorithm Flow:
      1. Validate all inputs and constraints.
      2. Initialize schedule state (remaining hours, busy tracker, workload counters).
      3. Iterate through each (day, slot) cell.
      4. Filter valid (subject, faculty) candidate pairs meeting all constraints:
         - Subject has remaining hours > 0
         - Faculty is mapped to the subject
         - Faculty is available on this day
         - Faculty is not busy in this slot
         - Faculty has not exceeded daily lecture limit
      5. Calculate heuristic score for each valid candidate.
      6. Greedily pick the candidate with the lowest score.
      7. If no candidate is valid, assign a '— Free Period —' with an explanation.
      8. Update state and continue.
      9. Perform full final validation and return structured result.
    """
    # 1. Input Validation
    (
        faculty,
        subjects,
        days,
        time_slots,
        subject_faculty_map,
        faculty_availability,
        subject_hours,
    ) = validate_inputs(
        faculty=faculty or DEFAULT_FACULTY,
        subjects=subjects or DEFAULT_SUBJECTS,
        days=days or DEFAULT_DAYS,
        time_slots=time_slots or DEFAULT_TIME_SLOTS,
        subject_faculty_map=subject_faculty_map or DEFAULT_SUBJECT_FACULTY_MAP,
        faculty_availability=faculty_availability or DEFAULT_FACULTY_AVAILABILITY,
        subject_hours=subject_hours or DEFAULT_SUBJECT_HOURS,
    )

    # 2. State Initialization
    remaining_hours = {subj: subject_hours[subj] for subj in subjects}
    scheduled_hours = {subj: 0 for subj in subjects}
    faculty_total_load = {t: 0 for t in faculty}
    faculty_busy = {t: set() for t in faculty}

    # Load external existing busy slots if any
    if existing_schedules and isinstance(existing_schedules, dict):
        for teacher, slots in existing_schedules.items():
            if teacher in faculty_busy and isinstance(slots, (list, set)):
                for s in slots:
                    if isinstance(s, (list, tuple)) and len(s) == 2:
                        faculty_busy[teacher].add((s[0], s[1]))

    timetable = {}
    free_periods_count = 0
    warnings = []

    # 3. Main Greedy Loop over Days and Time Slots
    for day in days:
        timetable[day] = []
        daily_faculty_load = {t: 0 for t in faculty}

        for slot_idx, slot in enumerate(time_slots):
            # Find all valid (subject, faculty) candidate pairs
            valid_candidates = []

            for subj in subjects:
                if remaining_hours[subj] <= 0:
                    continue  # Subject required hours already fulfilled

                qualified_faculty = subject_faculty_map.get(subj, [])
                for t_idx, teacher in enumerate(qualified_faculty):
                    # Constraint A: Faculty Available on this Day
                    if day not in faculty_availability.get(teacher, {}).get("days", []):
                        continue
                    
                    # Constraint B: Faculty Not Busy in this Slot
                    if (day, slot) in faculty_busy.get(teacher, set()):
                        continue

                    # Constraint C: Daily Lecture Limit (Max 2 lectures per day)
                    if daily_faculty_load.get(teacher, 0) >= max_lectures_per_day:
                        continue

                    # Calculate heuristic score for this valid candidate
                    score = calculate_heuristic_score(
                        subject=subj,
                        faculty_member=teacher,
                        day=day,
                        slot_idx=slot_idx,
                        day_lectures=timetable[day],
                        daily_faculty_load=daily_faculty_load,
                        faculty_total_load=faculty_total_load,
                        remaining_hours=remaining_hours,
                        faculty_index_offset=t_idx,
                    )

                    valid_candidates.append({
                        "subject": subj,
                        "faculty": teacher,
                        "score": score,
                    })

            # 4. Decision: Select candidate with LOWEST score or assign Free Period
            if valid_candidates:
                # Sort by score ascending (Greedy Choice)
                valid_candidates.sort(key=lambda x: x["score"])
                best_choice = valid_candidates[0]

                chosen_subject = best_choice["subject"]
                chosen_faculty = best_choice["faculty"]

                # Assign lecture
                timetable[day].append({
                    "time": slot,
                    "subject": chosen_subject,
                    "faculty": chosen_faculty,
                    "is_free": False,
                    "reason": "",
                })

                # Update State
                remaining_hours[chosen_subject] -= 1
                scheduled_hours[chosen_subject] += 1
                faculty_total_load[chosen_faculty] += 1
                daily_faculty_load[chosen_faculty] += 1
                faculty_busy[chosen_faculty].add((day, slot))

            else:
                # No valid candidate available -> Mark as Free Period
                free_periods_count += 1
                
                # Formulate helpful reason
                if all(rem <= 0 for rem in remaining_hours.values()):
                    reason = "All subject required hours have been successfully scheduled."
                else:
                    pending_subjs = [s for s, r in remaining_hours.items() if r > 0]
                    reason = f"No eligible/available faculty for remaining subjects ({', '.join(pending_subjs)})."

                timetable[day].append({
                    "time": slot,
                    "subject": "— Free Period —",
                    "faculty": "None",
                    "is_free": True,
                    "reason": reason,
                })

    # 5. Subject Hours Check & Warnings
    incomplete_subjects = []
    for subj in subjects:
        req = subject_hours[subj]
        sched = scheduled_hours[subj]
        if sched < req:
            incomplete_subjects.append(subj)
            warnings.append(
                f"Subject '{subj}' required {req}h but only {sched}h could be scheduled ({req - sched}h remaining)."
            )

    # 6. Final Timetable Validation
    validation_report = validate_final_timetable(
        timetable=timetable,
        faculty=faculty,
        subjects=subjects,
        days=days,
        time_slots=time_slots,
        subject_faculty_map=subject_faculty_map,
        faculty_availability=faculty_availability,
    )

    return {
        "status": "success",
        "timetable": timetable,
        "days": days,
        "time_slots": time_slots,
        "faculty": faculty,
        "subjects": subjects,
        "subject_faculty_map": subject_faculty_map,
        "faculty_availability": faculty_availability,
        "stats": {
            "total_slots": len(days) * len(time_slots),
            "total_lectures": sum(scheduled_hours.values()),
            "free_periods": free_periods_count,
            "scheduled_hours": scheduled_hours,
            "required_hours": subject_hours,
            "remaining_hours": remaining_hours,
            "faculty_workload": faculty_total_load,
            "is_complete": len(incomplete_subjects) == 0,
            "warnings": warnings,
            "validation": validation_report,
        }
    }


# ============================================================================
# 6. FINAL TIMETABLE VALIDATION
# ============================================================================
def validate_final_timetable(
    timetable,
    faculty,
    subjects,
    days,
    time_slots,
    subject_faculty_map,
    faculty_availability,
):
    """
    Verifies that the generated timetable satisfies all academic rules:
      - Zero faculty collisions (no teacher double-booked in same day/slot).
      - No faculty teaching an unmapped subject.
      - No faculty teaching on an unavailable day.
      - Structure consistency.
    """
    faculty_slot_check = {f: set() for f in faculty}
    violations = []

    for day in days:
        day_lectures = timetable.get(day, [])
        for lec in day_lectures:
            if lec.get("is_free", False):
                continue
            
            t = lec["faculty"]
            s = lec["subject"]
            time_str = lec["time"]

            # Check double-booking
            if (day, time_str) in faculty_slot_check.get(t, set()):
                violations.append(f"Faculty collision: '{t}' is double-booked on {day} at {time_str}.")
            else:
                faculty_slot_check[t].add((day, time_str))

            # Check mapping
            if t not in subject_faculty_map.get(s, []):
                violations.append(f"Invalid assignment: '{t}' is assigned to unmapped subject '{s}'.")

            # Check day availability
            if day not in faculty_availability.get(t, {}).get("days", []):
                violations.append(f"Availability violation: '{t}' is assigned on unavailable day '{day}'.")

    return {
        "is_valid": len(violations) == 0,
        "violations": violations,
        "message": "Valid Timetable Generated Successfully" if len(violations) == 0 else "Validation warnings detected."
    }


# ============================================================================
# 7. FACULTY SUBSTITUTION SYSTEM
# ============================================================================
def check_substitution(
    timetable: dict,
    absent_faculty: str,
    absent_day: str,
    subject_faculty_map: dict,
    faculty_availability: dict,
    faculty_list: list,
):
    """
    Finds all lectures taught by absent_faculty on absent_day and discovers
    all qualified, available substitutes sorted by least total workload.
    """
    if absent_day not in timetable:
        raise TimetableValidationError(f"Day '{absent_day}' not found in timetable.")
    
    if absent_faculty not in faculty_list:
        raise TimetableValidationError(f"Faculty '{absent_faculty}' is not in the faculty list.")

    # 1. Compute current total workload of all faculty members
    current_workloads = {f: 0 for f in faculty_list}
    for d, lectures in timetable.items():
        for lec in lectures:
            if not lec.get("is_free", False) and lec.get("faculty") in current_workloads:
                current_workloads[lec["faculty"]] += 1

    # 2. Find lectures occupied by other faculty in that day/slot
    occupied_slots = {}
    for d, lectures in timetable.items():
        for lec in lectures:
            if not lec.get("is_free", False):
                occupied_slots[(d, lec["time"], lec["faculty"])] = True

    # 3. Find affected lectures of absent faculty
    day_lectures = timetable[absent_day]
    affected_lectures = []

    for slot_idx, lec in enumerate(day_lectures):
        if not lec.get("is_free", False) and lec.get("faculty") == absent_faculty:
            subj = lec["subject"]
            time_slot = lec["time"]

            # Find qualified substitutes mapped to this subject
            qualified = subject_faculty_map.get(subj, [])
            valid_substitutes = []

            for candidate in qualified:
                if candidate == absent_faculty:
                    continue  # Cannot substitute self
                
                # Check candidate available on this day
                if absent_day not in faculty_availability.get(candidate, {}).get("days", []):
                    continue

                # Check candidate is NOT already busy at (absent_day, time_slot)
                if (absent_day, time_slot, candidate) in occupied_slots:
                    continue

                valid_substitutes.append({
                    "faculty": candidate,
                    "current_workload": current_workloads.get(candidate, 0),
                    "is_qualified": True,
                })

            # Sort substitutes by workload ascending (least loaded preferred)
            valid_substitutes.sort(key=lambda x: x["current_workload"])
            suggested_substitute = valid_substitutes[0]["faculty"] if valid_substitutes else None

            affected_lectures.append({
                "slot_index": slot_idx,
                "time": time_slot,
                "subject": subj,
                "absent_faculty": absent_faculty,
                "suggested_substitute": suggested_substitute,
                "available_substitutes": valid_substitutes,
                "has_substitute": len(valid_substitutes) > 0,
            })

    return {
        "absent_faculty": absent_faculty,
        "day": absent_day,
        "affected_lectures_count": len(affected_lectures),
        "affected_lectures": affected_lectures,
    }


def apply_substitutions(timetable: dict, substitutions: list):
    """
    Applies user-selected or auto substitutions to the existing timetable in memory.
    substitutions: [ {"day": "Monday", "slot_index": 0, "substitute_faculty": "Prof. Amit"} ]
    """
    updated_timetable = {d: [dict(lec) for lec in lecs] for d, lecs in timetable.items()}
    applied_count = 0

    for sub in substitutions:
        day = sub.get("day")
        idx = sub.get("slot_index")
        new_faculty = sub.get("substitute_faculty")

        if day in updated_timetable and 0 <= idx < len(updated_timetable[day]):
            if new_faculty:
                updated_timetable[day][idx]["faculty"] = new_faculty
                updated_timetable[day][idx]["is_substituted"] = True
                applied_count += 1

    return {
        "status": "success",
        "applied_count": applied_count,
        "timetable": updated_timetable,
    }


# ============================================================================
# 8. FLASK APPLICATION ROUTES
# ============================================================================
@app.route("/")
def index():
    """Render the main single-page application interface."""
    return render_template(
        "index.html",
        faculty=DEFAULT_FACULTY,
        subjects=DEFAULT_SUBJECTS,
        days=DEFAULT_DAYS,
        time_slots=DEFAULT_TIME_SLOTS,
        subject_faculty_map=DEFAULT_SUBJECT_FACULTY_MAP,
        subject_hours=DEFAULT_SUBJECT_HOURS,
        faculty_availability=DEFAULT_FACULTY_AVAILABILITY,
    )


@app.route("/api/generate", methods=["POST"])
def api_generate():
    """
    API Endpoint: Generate Timetable
    Accepts full JSON configuration and returns conflict-free schedule.
    """
    try:
        data = request.get_json() or {}

        faculty = data.get("faculty")
        subjects = data.get("subjects")
        days = data.get("days")
        time_slots = data.get("time_slots")
        subject_faculty_map = data.get("subject_faculty_map")
        faculty_availability = data.get("faculty_availability")
        subject_hours = data.get("subject_hours")
        existing_schedules = data.get("existing_schedules")
        max_lectures_per_day = data.get("max_lectures_per_day", DEFAULT_MAX_LECTURES_PER_DAY)

        result = generate_timetable(
            faculty=faculty,
            subjects=subjects,
            days=days,
            time_slots=time_slots,
            subject_faculty_map=subject_faculty_map,
            faculty_availability=faculty_availability,
            subject_hours=subject_hours,
            existing_schedules=existing_schedules,
            max_lectures_per_day=max_lectures_per_day,
        )
        return jsonify(result)

    except TimetableValidationError as e:
        return jsonify({"status": "error", "error": str(e), "error_type": "Validation"}), 400

    except TimetableConflictError as e:
        return jsonify({"status": "error", "error": str(e), "error_type": "Conflict"}), 400

    except Exception as e:
        return jsonify({"status": "error", "error": f"Internal scheduling error: {str(e)}", "error_type": "System"}), 500


@app.route("/api/substitution/check", methods=["POST"])
def api_substitution_check():
    """
    API Endpoint: Check Substitution
    Finds affected lectures and eligible qualified substitutes.
    """
    try:
        data = request.get_json() or {}
        timetable = data.get("timetable")
        absent_faculty = data.get("absent_faculty")
        day = data.get("day")
        subject_faculty_map = data.get("subject_faculty_map") or DEFAULT_SUBJECT_FACULTY_MAP
        faculty_availability = data.get("faculty_availability") or DEFAULT_FACULTY_AVAILABILITY
        faculty_list = data.get("faculty") or DEFAULT_FACULTY

        if not timetable or not absent_faculty or not day:
            return jsonify({"status": "error", "error": "timetable, absent_faculty, and day are required."}), 400

        result = check_substitution(
            timetable=timetable,
            absent_faculty=absent_faculty,
            absent_day=day,
            subject_faculty_map=subject_faculty_map,
            faculty_availability=faculty_availability,
            faculty_list=faculty_list,
        )
        return jsonify({"status": "success", **result})

    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 400


@app.route("/api/substitution/apply", methods=["POST"])
def api_substitution_apply():
    """
    API Endpoint: Apply Substitution
    Updates the timetable with confirmed replacements.
    """
    try:
        data = request.get_json() or {}
        timetable = data.get("timetable")
        substitutions = data.get("substitutions", [])

        if not timetable or not substitutions:
            return jsonify({"status": "error", "error": "timetable and substitutions list are required."}), 400

        result = apply_substitutions(timetable=timetable, substitutions=substitutions)
        return jsonify(result)

    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 400


@app.route("/api/algorithm-info", methods=["GET"])
def api_algorithm_info():
    """Returns documentation and explanation of the Greedy Heuristic Algorithm for Viva."""
    return jsonify({
        "algorithm_name": "Greedy Algorithm with Heuristic Scoring",
        "search_type": "Informed / Heuristic Search",
        "is_machine_learning": False,
        "decision_rule": "Lowest Score = Best Choice at each (Day, TimeSlot)",
        "heuristic_formula": "Score = Consecutive_Penalty + Daily_Repeat_Penalty - Remaining_Hours_Bonus + Workload_Penalty + Rotation_Offset",
        "viva_talking_points": [
            "1. Why Greedy? It makes locally optimal choices at each time slot in O(D * S * F) time.",
            "2. Heuristic Scoring ensures subjects with high remaining hours are prioritized, while avoiding faculty fatigue and lecture repetition.",
            "3. Hard Constraints (Faculty mapping, Availability, No Double Booking) are strictly enforced before scoring.",
            "4. Soft Constraints (Fair workload balancing, no consecutive identical lectures) are optimized via penalty weights.",
            "5. Future Enhancements: Genetic Algorithms (GA), Constraint Satisfaction Problems (CSP), Classroom/Lab allocation."
        ]
    })


# ============================================================================
# 9. MAIN ENTRY POINT
# ============================================================================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
