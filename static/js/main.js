/**
 * Faculty Timetable Optimizer — Complete Frontend Client Logic
 * ============================================================
 * Handles:
 *  - Dynamic Faculty Cards with Subject-Mapping Checkboxes & Day Availability
 *  - Subject Required Hours Management & Real-Time Capacity Validation
 *  - Time Slot Builder with AM/PM formatting and Overlap Checking
 *  - Weekly Matrix Grid & Day Cards View with Free Period Rendering
 *  - Subject Hours & Faculty Workload Dashboards
 *  - Faculty Substitution System (Check, Auto-Assign, Apply)
 *  - College Viva Guide & Algorithm Explanation Modal
 *  - CSV Export & Print / PDF Formatting
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. DOM Element Selectors
  // -------------------------------------------------------------
  const generateBtn = document.getElementById('generate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const emptyState = document.getElementById('empty-state');
  const statsBar = document.getElementById('stats-bar');
  const toast = document.getElementById('toast');

  // View Containers
  const weeklyMatrixWrapper = document.getElementById('weekly-matrix-wrapper');
  const weeklyTableContainer = document.getElementById('weekly-table-container');
  const timetableContainer = document.getElementById('timetable-container');
  const viewControls = document.getElementById('view-controls');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewCardsBtn = document.getElementById('view-cards-btn');
  const printBtn = document.getElementById('print-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const validationBanner = document.getElementById('validation-banner');

  // Dashboards
  const hoursSummarySection = document.getElementById('hours-summary-section');
  const hoursSummaryContainer = document.getElementById('hours-summary-container');
  const workloadSection = document.getElementById('workload-section');
  const workloadContainer = document.getElementById('workload-container');

  // Capacity Stats
  const capTotalSlots = document.getElementById('cap-total-slots');
  const capReqHours = document.getElementById('cap-req-hours');
  const capStatus = document.getElementById('cap-status');

  // Faculty Section
  const facultyCardsContainer = document.getElementById('faculty-cards-container');
  const facultyAddInput = document.getElementById('faculty-add-input');
  const facultyAddBtn = document.getElementById('faculty-add-btn');

  // Subjects Section
  const subjectsContainer = document.getElementById('subjects-container');
  const subjectsAddInput = document.getElementById('subjects-add-input');
  const subjectsAddBtn = document.getElementById('subjects-add-btn');

  // Days Section
  const daysTagsContainer = document.getElementById('days-tags-container');
  const daysAddInput = document.getElementById('days-add-input');
  const daysAddBtn = document.getElementById('days-add-btn');

  // Time Slots Section
  const slotsTagsContainer = document.getElementById('slots-tags-container');
  const slotStartTime = document.getElementById('slot-start-time');
  const slotEndTime = document.getElementById('slot-end-time');
  const slotAddTimeBtn = document.getElementById('slot-add-time-btn');

  // Constraints
  const maxDailyVal = document.getElementById('max-daily-val');
  const maxDailyMinus = document.getElementById('max-daily-minus');
  const maxDailyPlus = document.getElementById('max-daily-plus');

  // Modals
  const substitutionModal = document.getElementById('substitution-modal');
  const subModalClose = document.getElementById('sub-modal-close');
  const openSubstitutionBtn = document.getElementById('open-substitution-btn');
  const footerSubLink = document.getElementById('footer-sub-link');
  const subFacultySelect = document.getElementById('sub-faculty-select');
  const subDaySelect = document.getElementById('sub-day-select');
  const subFindBtn = document.getElementById('sub-find-btn');
  const subResultsContainer = document.getElementById('sub-results-container');
  const subLecturesList = document.getElementById('sub-lectures-list');
  const subAutoAllBtn = document.getElementById('sub-auto-all-btn');
  const subApplyBtn = document.getElementById('sub-apply-btn');

  const vivaModal = document.getElementById('viva-modal');
  const vivaModalClose = document.getElementById('viva-modal-close');
  const openVivaBtn = document.getElementById('open-viva-btn');
  const footerVivaLink = document.getElementById('footer-viva-link');

  // -------------------------------------------------------------
  // 2. Application State Stores
  // -------------------------------------------------------------
  let facultyList = [];
  let subjectsList = [];
  let daysList = [];
  let slotsList = [];
  let subjectFacultyMap = {};
  let facultyAvailability = {};
  let subjectHours = {};
  let maxLecturesPerDay = 2;

  let currentTimetableData = null;
  let currentActiveView = 'grid';
  let currentSubstitutionData = null;

  const dayEmojis = {
    Monday: '📘',
    Tuesday: '📗',
    Wednesday: '📙',
    Thursday: '📕',
    Friday: '📓',
    Saturday: '📔',
    Sunday: '📒',
  };

  // -------------------------------------------------------------
  // 3. Helper & Notification Utilities
  // -------------------------------------------------------------
  function showToast(message, icon = '✅') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMsg = toast.querySelector('.toast-message');
    toastIcon.textContent = icon;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function getFacultyIndex(name) {
    const idx = facultyList.indexOf(name);
    return idx >= 0 ? idx % 5 : 0;
  }

  function formatTime12h(time24) {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const meridiem = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${meridiem}`;
  }

  // -------------------------------------------------------------
  // 4. Real-Time Capacity Calculator
  // -------------------------------------------------------------
  function updateCapacitySummary() {
    const totalSlots = daysList.length * slotsList.length;
    const totalReqHours = Object.values(subjectHours).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);

    capTotalSlots.textContent = `${totalSlots} slots (${daysList.length} days × ${slotsList.length} slots)`;
    capReqHours.textContent = `${totalReqHours}h required`;

    if (totalSlots === 0) {
      capStatus.className = 'capacity-badge capacity-badge--warn';
      capStatus.textContent = 'No slots configured';
    } else if (totalReqHours > totalSlots) {
      capStatus.className = 'capacity-badge capacity-badge--warn';
      capStatus.textContent = `⚠️ Overloaded (+${totalReqHours - totalSlots}h excess)`;
    } else {
      const free = totalSlots - totalReqHours;
      capStatus.className = 'capacity-badge capacity-badge--ok';
      capStatus.textContent = `Valid (${free} free periods expected)`;
    }
  }

  // -------------------------------------------------------------
  // 5. Render Configuration Controls
  // -------------------------------------------------------------
  function renderFacultyCards() {
    facultyCardsContainer.innerHTML = '';

    if (facultyList.length === 0) {
      facultyCardsContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:8px 0;">No faculty members added yet.</div>';
      return;
    }

    facultyList.forEach((teacher, tIdx) => {
      const card = document.createElement('div');
      card.className = 'faculty-card-item';

      if (!facultyAvailability[teacher]) {
        facultyAvailability[teacher] = { days: [...daysList] };
      }
      const teacherAvailDays = facultyAvailability[teacher].days || [];

      const mappedSubjects = Object.keys(subjectFacultyMap).filter(subj =>
        (subjectFacultyMap[subj] || []).includes(teacher)
      );

      let subjectsHtml = '';
      subjectsList.forEach((subj) => {
        const isChecked = mappedSubjects.includes(subj);
        subjectsHtml += `
          <label class="checkbox-chip ${isChecked ? 'active' : ''}">
            <input type="checkbox" class="fac-subj-check" data-teacher="${teacher}" data-subject="${subj}" ${isChecked ? 'checked' : ''} />
            <span>${subj}</span>
          </label>
        `;
      });

      let daysHtml = '';
      daysList.forEach((day) => {
        const isAvail = teacherAvailDays.includes(day);
        daysHtml += `
          <label class="checkbox-chip ${isAvail ? 'active' : ''}">
            <input type="checkbox" class="fac-day-check" data-teacher="${teacher}" data-day="${day}" ${isAvail ? 'checked' : ''} />
            <span>${day.substring(0, 3)}</span>
          </label>
        `;
      });

      card.innerHTML = `
        <div class="faculty-card-item__top">
          <span class="faculty-card-item__name">👨‍🏫 ${teacher}</span>
          <button class="faculty-card-item__remove" data-index="${tIdx}" title="Remove ${teacher}" type="button">✕ Remove</button>
        </div>
        <div class="faculty-card-item__section">
          <span class="faculty-card-item__label">📚 Taught Subjects (Compulsory):</span>
          <div class="checkbox-chips-grid">
            ${subjectsHtml || '<span style="font-size:0.75rem;color:var(--text-muted)">Add subjects first</span>'}
          </div>
        </div>
        <div class="faculty-card-item__section" style="margin-top:8px;">
          <span class="faculty-card-item__label">📆 Available Days:</span>
          <div class="checkbox-chips-grid">
            ${daysHtml || '<span style="font-size:0.75rem;color:var(--text-muted)">Add days first</span>'}
          </div>
        </div>
      `;

      facultyCardsContainer.appendChild(card);
    });

    facultyCardsContainer.querySelectorAll('.faculty-card-item__remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const removed = facultyList[idx];
        facultyList.splice(idx, 1);
        delete facultyAvailability[removed];

        Object.keys(subjectFacultyMap).forEach((s) => {
          subjectFacultyMap[s] = (subjectFacultyMap[s] || []).filter(t => t !== removed);
        });

        renderFacultyCards();
        updateCapacitySummary();
        showToast(`Removed "${removed}"`, '🗑️');
      });
    });

    facultyCardsContainer.querySelectorAll('.fac-subj-check').forEach((chk) => {
      chk.addEventListener('change', () => {
        const teacher = chk.dataset.teacher;
        const subj = chk.dataset.subject;
        if (!subjectFacultyMap[subj]) subjectFacultyMap[subj] = [];

        if (chk.checked) {
          if (!subjectFacultyMap[subj].includes(teacher)) {
            subjectFacultyMap[subj].push(teacher);
          }
          chk.parentElement.classList.add('active');
        } else {
          subjectFacultyMap[subj] = subjectFacultyMap[subj].filter(t => t !== teacher);
          chk.parentElement.classList.remove('active');
        }
      });
    });

    facultyCardsContainer.querySelectorAll('.fac-day-check').forEach((chk) => {
      chk.addEventListener('change', () => {
        const teacher = chk.dataset.teacher;
        const day = chk.dataset.day;
        if (!facultyAvailability[teacher]) facultyAvailability[teacher] = { days: [] };

        if (chk.checked) {
          if (!facultyAvailability[teacher].days.includes(day)) {
            facultyAvailability[teacher].days.push(day);
          }
          chk.parentElement.classList.add('active');
        } else {
          facultyAvailability[teacher].days = facultyAvailability[teacher].days.filter(d => d !== day);
          chk.parentElement.classList.remove('active');
        }
      });
    });
  }

  function renderSubjects() {
    subjectsContainer.innerHTML = '';

    if (subjectsList.length === 0) {
      subjectsContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:8px 0;">No subjects added yet.</div>';
      return;
    }

    subjectsList.forEach((subj, sIdx) => {
      const hours = subjectHours[subj] || 4;
      const row = document.createElement('div');
      row.className = 'subject-row-item';

      row.innerHTML = `
        <span class="subject-row-item__name">📖 ${subj}</span>
        <div class="subject-row-item__right">
          <div class="stepper-wrap">
            <button class="stepper-btn stepper-minus" data-subject="${subj}" type="button">−</button>
            <span class="stepper-val">${hours}h</span>
            <button class="stepper-btn stepper-plus" data-subject="${subj}" type="button">+</button>
          </div>
          <button class="tag-remove" data-index="${sIdx}" title="Remove ${subj}" type="button">✕</button>
        </div>
      `;

      subjectsContainer.appendChild(row);
    });

    subjectsContainer.querySelectorAll('.stepper-minus').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.subject;
        if (subjectHours[s] > 1) {
          subjectHours[s]--;
          renderSubjects();
          updateCapacitySummary();
        }
      });
    });

    subjectsContainer.querySelectorAll('.stepper-plus').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.subject;
        if (subjectHours[s] < 30) {
          subjectHours[s]++;
          renderSubjects();
          updateCapacitySummary();
        }
      });
    });

    subjectsContainer.querySelectorAll('.tag-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const removed = subjectsList[idx];
        subjectsList.splice(idx, 1);
        delete subjectHours[removed];
        delete subjectFacultyMap[removed];

        renderSubjects();
        renderFacultyCards();
        updateCapacitySummary();
        showToast(`Removed subject "${removed}"`, '🗑️');
      });
    });

    updateCapacitySummary();
  }

  function renderDaysTags() {
    daysTagsContainer.innerHTML = '';
    daysList.forEach((day, idx) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip tag-chip--slot-0';
      chip.innerHTML = `
        <span class="tag-label">${dayEmojis[day] || '📆'} ${day}</span>
        <button class="tag-remove" data-index="${idx}" title="Remove ${day}" type="button">✕</button>
      `;
      daysTagsContainer.appendChild(chip);
    });

    daysTagsContainer.querySelectorAll('.tag-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const removed = daysList[idx];
        daysList.splice(idx, 1);
        renderDaysTags();
        renderFacultyCards();
        updateCapacitySummary();
        showToast(`Removed "${removed}"`, '🗑️');
      });
    });

    updateCapacitySummary();
  }

  function renderSlotsTags() {
    slotsTagsContainer.innerHTML = '';
    slotsList.forEach((slot, idx) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip tag-chip--slot-1';
      chip.innerHTML = `
        <span class="tag-label">🕐 ${slot}</span>
        <button class="tag-remove" data-index="${idx}" title="Remove ${slot}" type="button">✕</button>
      `;
      slotsTagsContainer.appendChild(chip);
    });

    slotsTagsContainer.querySelectorAll('.tag-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const removed = slotsList[idx];
        slotsList.splice(idx, 1);
        renderSlotsTags();
        updateCapacitySummary();
        showToast(`Removed slot "${removed}"`, '🗑️');
      });
    });

    updateCapacitySummary();
  }

  // -------------------------------------------------------------
  // 6. Config Add Action Handlers
  // -------------------------------------------------------------
  function handleAddFaculty() {
    const val = facultyAddInput.value.trim();
    if (!val) {
      showToast('Please enter a faculty name!', '⚠️');
      facultyAddInput.focus();
      return;
    }
    if (facultyList.some(f => f.toLowerCase() === val.toLowerCase())) {
      showToast(`Faculty "${val}" already exists!`, '⚠️');
      facultyAddInput.focus();
      return;
    }

    facultyList.push(val);
    facultyAvailability[val] = { days: [...daysList] };
    facultyAddInput.value = '';
    renderFacultyCards();
    showToast(`Added "${val}". Remember to map subjects below!`, '✅');
  }
  facultyAddBtn.addEventListener('click', handleAddFaculty);
  facultyAddInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddFaculty(); });

  function handleAddSubject() {
    const val = subjectsAddInput.value.trim();
    if (!val) {
      showToast('Please enter a subject name!', '⚠️');
      subjectsAddInput.focus();
      return;
    }
    if (subjectsList.some(s => s.toLowerCase() === val.toLowerCase())) {
      showToast(`Subject "${val}" already exists!`, '⚠️');
      subjectsAddInput.focus();
      return;
    }

    subjectsList.push(val);
    subjectHours[val] = 4;
    subjectFacultyMap[val] = facultyList.length > 0 ? [facultyList[0]] : [];
    subjectsAddInput.value = '';

    renderSubjects();
    renderFacultyCards();
    updateCapacitySummary();
    showToast(`Added "${val}" successfully!`, '✅');
  }
  subjectsAddBtn.addEventListener('click', handleAddSubject);
  subjectsAddInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddSubject(); });

  function handleAddDay() {
    const val = daysAddInput.value.trim();
    if (!val) {
      showToast('Please enter a day name!', '⚠️');
      daysAddInput.focus();
      return;
    }
    if (daysList.some(d => d.toLowerCase() === val.toLowerCase())) {
      showToast(`Day "${val}" already exists!`, '⚠️');
      daysAddInput.focus();
      return;
    }

    daysList.push(val);
    Object.keys(facultyAvailability).forEach((f) => {
      if (!facultyAvailability[f].days.includes(val)) {
        facultyAvailability[f].days.push(val);
      }
    });

    daysAddInput.value = '';
    renderDaysTags();
    renderFacultyCards();
    updateCapacitySummary();
    showToast(`Added "${val}"!`, '✅');
  }
  daysAddBtn.addEventListener('click', handleAddDay);
  daysAddInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddDay(); });

  document.querySelectorAll('.btn-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'mon-fri') {
        daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      } else if (preset === 'mon-sat') {
        daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      } else if (preset === 'all-days') {
        daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      }

      Object.keys(facultyAvailability).forEach((f) => {
        facultyAvailability[f] = { days: [...daysList] };
      });

      renderDaysTags();
      renderFacultyCards();
      updateCapacitySummary();
      showToast(`Applied ${btn.textContent} preset!`, '✅');
    });
  });

  slotAddTimeBtn.addEventListener('click', () => {
    const startVal = slotStartTime.value;
    const endVal = slotEndTime.value;

    if (!startVal || !endVal) {
      showToast('Please select both start and end time!', '⚠️');
      return;
    }

    if (startVal >= endVal) {
      showToast('Start time must be earlier than End time!', '⚠️');
      return;
    }

    const slotStr = `${formatTime12h(startVal)} - ${formatTime12h(endVal)}`;
    if (slotsList.includes(slotStr)) {
      showToast(`Time slot "${slotStr}" already exists!`, '⚠️');
      return;
    }

    slotsList.push(slotStr);
    renderSlotsTags();
    updateCapacitySummary();
    showToast(`Added slot "${slotStr}"!`, '✅');
  });

  maxDailyMinus.addEventListener('click', () => {
    if (maxLecturesPerDay > 1) {
      maxLecturesPerDay--;
      maxDailyVal.textContent = maxLecturesPerDay;
    }
  });
  maxDailyPlus.addEventListener('click', () => {
    if (maxLecturesPerDay < 10) {
      maxLecturesPerDay++;
      maxDailyVal.textContent = maxLecturesPerDay;
    }
  });

  // -------------------------------------------------------------
  // 7. Timetable Generation API Call & Rendering
  // -------------------------------------------------------------
  async function generateTimetable() {
    if (facultyList.length === 0) {
      showToast('At least one faculty member is required!', '⚠️');
      return;
    }
    if (subjectsList.length === 0) {
      showToast('At least one subject is required!', '⚠️');
      return;
    }
    if (daysList.length === 0) {
      showToast('At least one day is required!', '⚠️');
      return;
    }
    if (slotsList.length === 0) {
      showToast('At least one time slot is required!', '⚠️');
      return;
    }

    const unmappedSubjects = subjectsList.filter(s => (subjectFacultyMap[s] || []).length === 0);
    if (unmappedSubjects.length > 0) {
      showToast(`Please map at least 1 faculty to: ${unmappedSubjects.join(', ')}`, '⚠️');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner"></span> Optimizing...';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty: facultyList,
          subjects: subjectsList,
          days: daysList,
          time_slots: slotsList,
          subject_faculty_map: subjectFacultyMap,
          faculty_availability: facultyAvailability,
          subject_hours: subjectHours,
          max_lectures_per_day: maxLecturesPerDay,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error' || data.error) {
        const errorMsg = data.error || 'Failed to generate timetable.';
        showToast(errorMsg, '❌');

        validationBanner.style.display = 'block';
        validationBanner.className = 'validation-banner validation-banner--error';
        validationBanner.innerHTML = `
          <div style="font-size:1.1rem;font-weight:700;margin-bottom:4px;">🚫 Timetable Generation Halted</div>
          <div>${errorMsg}</div>
        `;

        emptyState.style.display = 'block';
        timetableContainer.innerHTML = '';
        weeklyMatrixWrapper.style.display = 'none';
        statsBar.style.display = 'none';
        hoursSummarySection.style.display = 'none';
        workloadSection.style.display = 'none';
        viewControls.style.display = 'none';
        return;
      }

      currentTimetableData = data;

      renderValidationBanner(data);
      renderWeeklyMatrix(data);
      renderDayCards(data);
      renderHoursSummary(data);
      renderWorkloadDashboard(data);
      updateTopStats(data);

      emptyState.style.display = 'none';
      statsBar.style.display = 'grid';
      viewControls.style.display = 'flex';
      switchView(currentActiveView);

      showToast('Conflict-free timetable generated successfully!', '✅');
    } catch (err) {
      console.error('Error generating timetable:', err);
      showToast('Network or server error while generating timetable.', '❌');
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '⚡ Generate Timetable';
    }
  }

  generateBtn.addEventListener('click', generateTimetable);

  // -------------------------------------------------------------
  // 8. Timetable View Renderers
  // -------------------------------------------------------------
  function renderValidationBanner(data) {
    const { stats } = data;
    validationBanner.style.display = 'block';

    if (stats.warnings && stats.warnings.length > 0) {
      validationBanner.className = 'validation-banner validation-banner--warn';
      validationBanner.innerHTML = `
        <div style="font-weight:700;margin-bottom:4px;">⚠️ Timetable Generated with Partial Hours:</div>
        <ul style="padding-left:20px;margin-top:4px;">
          ${stats.warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      `;
    } else {
      validationBanner.className = 'validation-banner validation-banner--success';
      validationBanner.innerHTML = `
        <div style="font-weight:700;">✓ Valid Timetable Generated Successfully</div>
        <div style="font-size:0.85rem;color:#cbd5e1;margin-top:2px;">
          100% Conflict-free &bull; All hard constraints verified &bull; Workload balanced across faculty
        </div>
      `;
    }
  }

  function renderWeeklyMatrix(data) {
    const { timetable, days, time_slots } = data;
    weeklyTableContainer.innerHTML = '';

    const lookup = {};
    days.forEach((day) => {
      lookup[day] = {};
      (timetable[day] || []).forEach((lec) => {
        lookup[day][lec.time] = lec;
      });
    });

    let html = `<table class="weekly-table">`;
    html += `<thead><tr><th class="weekly-table__corner">Day \\ Time</th>`;
    time_slots.forEach((slot) => {
      html += `<th class="weekly-table__time-header">🕐 ${slot}</th>`;
    });
    html += `</tr></thead>`;

    html += `<tbody>`;
    days.forEach((day, dIdx) => {
      const emoji = dayEmojis[day] || '📄';
      html += `<tr class="weekly-table__row" style="animation-delay:${dIdx * 0.05}s">`;
      html += `<td class="weekly-table__day-cell"><span class="weekly-table__day-badge">${emoji} ${day}</span></td>`;

      time_slots.forEach((slot) => {
        const lec = lookup[day] && lookup[day][slot];
        if (lec) {
          if (lec.is_free) {
            html += `
              <td class="weekly-table__cell weekly-table__cell--free" title="${lec.reason || 'Free period'}">
                <div class="free-period-badge">☕ Free Period</div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">${lec.reason ? 'No classes scheduled' : ''}</div>
              </td>
            `;
          } else {
            const fIdx = getFacultyIndex(lec.faculty);
            html += `
              <td class="weekly-table__cell" data-faculty-index="${fIdx}">
                <div class="weekly-table__subject">📖 ${lec.subject}</div>
                <div class="weekly-table__faculty">👤 ${lec.faculty} ${lec.is_substituted ? '<span title="Substituted">🔄</span>' : ''}</div>
              </td>
            `;
          }
        } else {
          html += `<td class="weekly-table__cell weekly-table__cell--empty">—</td>`;
        }
      });

      html += `</tr>`;
    });
    html += `</tbody></table>`;

    weeklyTableContainer.innerHTML = html;
  }

  function renderDayCards(data) {
    const { timetable, days } = data;
    timetableContainer.innerHTML = '';

    days.forEach((day, dIdx) => {
      const lectures = timetable[day] || [];
      const card = document.createElement('div');
      card.className = 'day-card open';
      card.style.animationDelay = `${dIdx * 0.06}s`;

      const emoji = dayEmojis[day] || '📄';
      const scheduledCount = lectures.filter(l => !l.is_free).length;

      card.innerHTML = `
        <div class="day-card__header" onclick="this.parentElement.classList.toggle('open')">
          <div class="day-card__name">
            <span>${emoji} ${day}</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="day-card__count">${scheduledCount} lecture${scheduledCount !== 1 ? 's' : ''}</span>
            <span class="day-card__chevron">▼</span>
          </div>
        </div>
        <div class="day-card__body">
          <div class="day-card__slots">
            ${lectures.map((lec, i) => {
              if (lec.is_free) {
                return `
                  <div class="lecture-slot lecture-slot--free" style="animation-delay:${i * 0.04}s">
                    <span class="lecture-slot__time">🕐 ${lec.time}</span>
                    <span class="lecture-slot__subject" style="color:var(--text-muted);font-style:italic;">☕ — Free Period —</span>
                    <span class="lecture-slot__faculty" style="color:var(--text-muted);">${lec.reason || 'None'}</span>
                  </div>
                `;
              }
              const fIdx = getFacultyIndex(lec.faculty);
              return `
                <div class="lecture-slot" data-faculty-index="${fIdx}" style="animation-delay:${i * 0.04}s">
                  <span class="lecture-slot__time">🕐 ${lec.time}</span>
                  <span class="lecture-slot__subject">📖 ${lec.subject}</span>
                  <span class="lecture-slot__faculty">👤 ${lec.faculty} ${lec.is_substituted ? '(Substituted 🔄)' : ''}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      timetableContainer.appendChild(card);
    });
  }

  function switchView(view) {
    currentActiveView = view;
    if (view === 'grid') {
      viewGridBtn.classList.add('active');
      viewCardsBtn.classList.remove('active');
      weeklyMatrixWrapper.style.display = 'block';
      timetableContainer.style.display = 'none';
    } else {
      viewCardsBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      weeklyMatrixWrapper.style.display = 'none';
      timetableContainer.style.display = 'block';
    }
  }

  viewGridBtn.addEventListener('click', () => switchView('grid'));
  viewCardsBtn.addEventListener('click', () => switchView('cards'));

  function renderHoursSummary(data) {
    const { stats, subjects } = data;
    hoursSummarySection.style.display = 'block';

    let html = '<div class="hours-summary-grid">';
    subjects.forEach((subj, idx) => {
      const req = stats.required_hours[subj] || 0;
      const sched = stats.scheduled_hours[subj] || 0;
      const rem = Math.max(0, req - sched);
      const percent = req > 0 ? Math.min(100, Math.round((sched / req) * 100)) : 0;
      const isComplete = sched >= req;

      html += `
        <div class="hours-card ${isComplete ? 'hours-card--complete' : ''}" style="animation-delay:${idx * 0.06}s">
          <div class="hours-card__header">
            <span class="hours-card__name">📖 ${subj}</span>
            <span class="hours-card__status">${isComplete ? 'Completed ✅' : `${rem}h remaining ⚠️`}</span>
          </div>
          <div class="hours-card__bar-container">
            <div class="hours-card__bar" style="width:${percent}%"></div>
          </div>
          <div class="hours-card__details">
            <span class="hours-card__taught">Scheduled: <strong>${sched}h</strong></span>
            <span class="hours-card__required">Required: <strong>${req}h</strong></span>
            <span class="hours-card__percent">${percent}%</span>
          </div>
        </div>
      `;
    });
    html += '</div>';

    hoursSummaryContainer.innerHTML = html;
  }

  function renderWorkloadDashboard(data) {
    const { stats, faculty } = data;
    workloadSection.style.display = 'block';

    const maxLoad = Math.max(1, ...Object.values(stats.faculty_workload || {}));

    let html = '<div class="workload-grid">';
    faculty.forEach((teacher) => {
      const load = stats.faculty_workload[teacher] || 0;
      const percent = Math.round((load / maxLoad) * 100);

      html += `
        <div class="workload-card">
          <div class="workload-card__header">
            <span class="workload-card__name">👨‍🏫 ${teacher}</span>
            <span class="workload-card__lectures">${load} lecture${load !== 1 ? 's' : ''}</span>
          </div>
          <div class="hours-card__bar-container">
            <div class="hours-card__bar" style="width:${percent}%;background:var(--accent-gradient);"></div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;display:flex;justify-content:space-between;">
            <span>Workload Share</span>
            <span>${percent}%</span>
          </div>
        </div>
      `;
    });
    html += '</div>';

    workloadContainer.innerHTML = html;
  }

  function updateTopStats(data) {
    const { stats, days } = data;
    document.getElementById('stat-days').textContent = days.length;
    document.getElementById('stat-lectures').textContent = stats.total_lectures;
    document.getElementById('stat-free-periods').textContent = stats.free_periods;
    document.getElementById('stat-faculty').textContent = facultyList.length;
    document.getElementById('stat-validation').textContent = stats.validation.is_valid ? '100% (Valid)' : 'Warnings';
  }

  // -------------------------------------------------------------
  // 9. Export & Print Handlers
  // -------------------------------------------------------------
  printBtn.addEventListener('click', () => {
    window.print();
  });

  exportCsvBtn.addEventListener('click', () => {
    if (!currentTimetableData) {
      showToast('Please generate a timetable first!', '⚠️');
      return;
    }

    const { timetable, days } = currentTimetableData;
    let csv = `Day,Time Slot,Subject,Faculty,Status\n`;

    days.forEach((day) => {
      (timetable[day] || []).forEach((lec) => {
        csv += `"${day}","${lec.time}","${lec.subject}","${lec.faculty}","${lec.is_free ? 'Free' : 'Scheduled'}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `faculty_timetable_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported timetable to CSV!', '📥');
  });

  // -------------------------------------------------------------
  // 10. Faculty Substitution Modal & Logic
  // -------------------------------------------------------------
  function populateSubstitutionDropdowns() {
    subFacultySelect.innerHTML = '';
    subDaySelect.innerHTML = '';

    facultyList.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      subFacultySelect.appendChild(opt);
    });

    daysList.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      subDaySelect.appendChild(opt);
    });

    subResultsContainer.style.display = 'none';
  }

  function openSubstitutionModal() {
    if (!currentTimetableData) {
      showToast('Please generate a timetable first before managing substitutions!', '⚠️');
      return;
    }
    populateSubstitutionDropdowns();
    substitutionModal.classList.add('open');
  }

  openSubstitutionBtn.addEventListener('click', openSubstitutionModal);
  footerSubLink.addEventListener('click', openSubstitutionModal);
  subModalClose.addEventListener('click', () => substitutionModal.classList.remove('open'));

  subFindBtn.addEventListener('click', async () => {
    const absentFaculty = subFacultySelect.value;
    const absentDay = subDaySelect.value;

    if (!absentFaculty || !absentDay) {
      showToast('Please select both absent faculty and day.', '⚠️');
      return;
    }

    try {
      const res = await fetch('/api/substitution/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable: currentTimetableData.timetable,
          absent_faculty: absentFaculty,
          day: absentDay,
          subject_faculty_map: subjectFacultyMap,
          faculty_availability: facultyAvailability,
          faculty: facultyList,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        showToast(data.error || 'Failed to check substitutions.', '❌');
        return;
      }

      currentSubstitutionData = data;
      renderSubstitutionResults(data);
    } catch (err) {
      console.error(err);
      showToast('Error checking substitution possibilities.', '❌');
    }
  });

  function renderSubstitutionResults(data) {
    const { affected_lectures, absent_faculty, day } = data;
    subResultsContainer.style.display = 'block';

    if (affected_lectures.length === 0) {
      subLecturesList.innerHTML = `
        <div style="padding:16px;text-align:center;color:var(--text-muted);">
          No scheduled lectures found for <strong>${absent_faculty}</strong> on <strong>${day}</strong>.
        </div>
      `;
      subAutoAllBtn.style.display = 'none';
      subApplyBtn.style.display = 'none';
      return;
    }

    subAutoAllBtn.style.display = 'inline-flex';
    subApplyBtn.style.display = 'inline-flex';

    subLecturesList.innerHTML = '';
    affected_lectures.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'sub-lecture-card';

      let optionsHtml = '';
      if (item.available_substitutes.length === 0) {
        optionsHtml = `<span style="color:#f87171;font-size:0.85rem;font-weight:600;">🚫 No qualified available substitute</span>`;
      } else {
        optionsHtml = `
          <select class="sub-select sub-candidate-select" data-slot-index="${item.slot_index}" data-day="${day}">
            ${item.available_substitutes.map(s => `
              <option value="${s.faculty}" ${s.faculty === item.suggested_substitute ? 'selected' : ''}>
                ${s.faculty} (${s.current_workload} load) ${s.faculty === item.suggested_substitute ? '★ Recommended' : ''}
              </option>
            `).join('')}
          </select>
        `;
      }

      card.innerHTML = `
        <div class="sub-lecture-info">
          <div class="sub-lecture-title">📖 ${item.subject}</div>
          <div class="sub-lecture-time">🕐 ${item.time} &bull; Originally taught by ${item.absent_faculty}</div>
        </div>
        <div>
          ${optionsHtml}
        </div>
      `;

      subLecturesList.appendChild(card);
    });
  }

  subAutoAllBtn.addEventListener('click', () => {
    if (!currentSubstitutionData) return;
    document.querySelectorAll('.sub-candidate-select').forEach((sel) => {
      const slotIdx = parseInt(sel.dataset.slotIndex, 10);
      const matched = currentSubstitutionData.affected_lectures.find(l => l.slot_index === slotIdx);
      if (matched && matched.suggested_substitute) {
        sel.value = matched.suggested_substitute;
      }
    });
    showToast('Auto-assigned least-loaded qualified substitutes!', '⚡');
  });

  subApplyBtn.addEventListener('click', async () => {
    const selects = document.querySelectorAll('.sub-candidate-select');
    if (selects.length === 0) {
      showToast('No substitutions to apply.', '⚠️');
      return;
    }

    const substitutions = [];
    selects.forEach((sel) => {
      substitutions.push({
        day: sel.dataset.day,
        slot_index: parseInt(sel.dataset.slotIndex, 10),
        substitute_faculty: sel.value,
      });
    });

    try {
      const res = await fetch('/api/substitution/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable: currentTimetableData.timetable,
          substitutions: substitutions,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        showToast(data.error || 'Failed to apply substitutions.', '❌');
        return;
      }

      currentTimetableData.timetable = data.timetable;
      renderWeeklyMatrix(currentTimetableData);
      renderDayCards(currentTimetableData);

      substitutionModal.classList.remove('open');
      showToast(`Applied ${data.applied_count} substitution(s) to timetable!`, '✅');
    } catch (err) {
      console.error(err);
      showToast('Error applying substitution.', '❌');
    }
  });

  // -------------------------------------------------------------
  // 11. Viva Guide Modal
  // -------------------------------------------------------------
  openVivaBtn.addEventListener('click', () => vivaModal.classList.add('open'));
  footerVivaLink.addEventListener('click', () => vivaModal.classList.add('open'));
  vivaModalClose.addEventListener('click', () => vivaModal.classList.remove('open'));

  [substitutionModal, vivaModal].forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('open');
    });
  });

  // -------------------------------------------------------------
  // 12. Reset to Defaults
  // -------------------------------------------------------------
  function resetDefaults() {
    facultyList = JSON.parse(facultyCardsContainer.dataset.defaults || '[]');
    subjectsList = JSON.parse(subjectsContainer.dataset.defaults || '[]');
    daysList = JSON.parse(daysTagsContainer.dataset.defaults || '[]');
    slotsList = JSON.parse(slotsTagsContainer.dataset.defaults || '[]');
    subjectFacultyMap = JSON.parse(facultyCardsContainer.dataset.mapping || '{}');
    facultyAvailability = JSON.parse(facultyCardsContainer.dataset.availability || '{}');
    subjectHours = JSON.parse(subjectsContainer.dataset.hours || '{}');
    maxLecturesPerDay = 2;
    maxDailyVal.textContent = '2';

    renderFacultyCards();
    renderSubjects();
    renderDaysTags();
    renderSlotsTags();
    updateCapacitySummary();

    showToast('Reset configuration to default values.', '🔄');
  }

  resetBtn.addEventListener('click', resetDefaults);

  // -------------------------------------------------------------
  // 13. Initialization on Load
  // -------------------------------------------------------------
  resetDefaults();
  generateTimetable();
});
