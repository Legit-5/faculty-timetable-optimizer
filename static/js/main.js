/**
 * Faculty Timetable Optimizer AI — Complete Frontend Client
 * ==========================================================
 * Version 3.0 — Premium SaaS Dashboard Edition
 *
 * Sections:
 *  1. DOM Selectors & App State
 *  2. Navigation (Sidebar, Topbar)
 *  3. Toast Notifications
 *  4. Confirm Dialog
 *  5. Loading Overlay
 *  6. Capacity Calculator
 *  7. Render: Faculty Cards & Mapping & Availability
 *  8. Render: Subjects & Hours
 *  9. Render: Days Tags
 * 10. Render: Time Slot Tags
 * 11. Config Add/Remove Action Handlers
 * 12. Timetable Generation API Call
 * 13. Render: Analytics Dashboard (Timetable Page + Analytics Page)
 * 14. Render: Weekly Grid & Day Cards (Premium Design)
 * 15. Render: Dashboard Page
 * 16. Render: Substitution Page
 * 17. Export & Print
 * 18. Reset to Defaults
 * 19. Initialization
 */

document.addEventListener('DOMContentLoaded', () => {

  // ===========================================================================
  // 1. DOM SELECTORS
  // ===========================================================================
  const sidebar            = document.getElementById('sidebar');
  const sidebarOverlay     = document.getElementById('sidebar-overlay');
  const hamburgerBtn       = document.getElementById('hamburger-btn');
  const navItems           = document.querySelectorAll('.nav-item[data-page]');
  const pageSections       = document.querySelectorAll('.page-section');
  const topbarTitle        = document.getElementById('topbar-title');
  const topbarSep          = document.getElementById('topbar-sep');
  const topbarSub          = document.getElementById('topbar-sub');
  const timetableStatusPill = document.getElementById('timetable-status-pill');
  const timetableNavBadge  = document.getElementById('timetable-nav-badge');

  // Config — Faculty
  const facultyCardsContainer   = document.getElementById('faculty-cards-container');
  const facultyMappingContainer  = document.getElementById('faculty-mapping-container');
  const facultyAvailContainer    = document.getElementById('faculty-availability-container');
  const facultyAddInput          = document.getElementById('faculty-add-input');
  const facultyAddBtn            = document.getElementById('faculty-add-btn');
  const facultyError             = document.getElementById('faculty-error');

  // Config — Subjects
  const subjectsContainer  = document.getElementById('subjects-container');
  const subjectsAddInput   = document.getElementById('subjects-add-input');
  const subjectsAddBtn     = document.getElementById('subjects-add-btn');
  const subjectError       = document.getElementById('subject-error');

  // Config — Days
  const daysTagsContainer  = document.getElementById('days-tags-container');
  const daysAddInput       = document.getElementById('days-add-input');
  const daysAddBtn         = document.getElementById('days-add-btn');
  const dayError           = document.getElementById('day-error');

  // Config — Slots
  const slotsTagsContainer = document.getElementById('slots-tags-container');
  const slotStartTime      = document.getElementById('slot-start-time');
  const slotEndTime        = document.getElementById('slot-end-time');
  const slotAddBtn         = document.getElementById('slot-add-btn');
  const slotError          = document.getElementById('slot-error');

  // Config — Constraints
  const maxDailyVal    = document.getElementById('max-daily-val');
  const maxDailyMinus  = document.getElementById('max-daily-minus');
  const maxDailyPlus   = document.getElementById('max-daily-plus');

  // Capacity Banner
  const capTotalSlots = document.getElementById('cap-total-slots');
  const capReqHours   = document.getElementById('cap-req-hours');
  const capStatus     = document.getElementById('cap-status');

  // Buttons
  const generateBtn      = document.getElementById('generate-btn');
  const resetBtn         = document.getElementById('reset-btn');
  const regenerateBtn    = document.getElementById('regenerate-btn');
  const printBtn         = document.getElementById('print-btn');
  const exportCsvBtn     = document.getElementById('export-csv-btn');
  const gotoConfigureBtn = document.getElementById('goto-configure-btn');
  const gotoGenerateBtn  = document.getElementById('goto-generate-btn');

  // Timetable area
  const validationBanner     = document.getElementById('validation-banner');
  const emptyState           = document.getElementById('empty-state');
  const analyticsArea        = document.getElementById('analytics-area');
  const timetableActionRow   = document.getElementById('timetable-action-row');
  const weeklyMatrixWrapper  = document.getElementById('weekly-matrix-wrapper');
  const weeklyTableContainer = document.getElementById('weekly-table-container');
  const dayCardsWrapper      = document.getElementById('day-cards-wrapper');
  const dayCardsContainer    = document.getElementById('day-cards-container');
  const viewGridBtn          = document.getElementById('view-grid-btn');
  const viewCardsBtn         = document.getElementById('view-cards-btn');
  const hoursSummary         = document.getElementById('hours-progress-container');
  const workloadSummary      = document.getElementById('workload-progress-container');

  // Stats (timetable page)
  const statLectures = document.getElementById('stat-lectures');
  const statFree     = document.getElementById('stat-free');
  const statRequired = document.getElementById('stat-required');
  const statCompleted= document.getElementById('stat-completed');
  const statRemaining= document.getElementById('stat-remaining');
  const statFaculty  = document.getElementById('stat-faculty-count');

  // Substitution
  const subRequiresTimetable = document.getElementById('sub-requires-timetable');
  const subFormArea          = document.getElementById('sub-form-area');
  const subFacultySelect     = document.getElementById('sub-faculty-select');
  const subDaySelect         = document.getElementById('sub-day-select');
  const subFindBtn           = document.getElementById('sub-find-btn');
  const subResultsArea       = document.getElementById('sub-results-area');
  const subResultsSubtitle   = document.getElementById('sub-results-subtitle');
  const subLecturesList      = document.getElementById('sub-lectures-list');
  const subAutoBtn           = document.getElementById('sub-auto-btn');
  const subApplyBtn          = document.getElementById('sub-apply-btn');

  // Confirm dialog
  const confirmDialog    = document.getElementById('confirm-dialog');
  const confirmIcon      = document.getElementById('confirm-icon');
  const confirmTitle     = document.getElementById('confirm-title');
  const confirmMsg       = document.getElementById('confirm-msg');
  const confirmOkBtn     = document.getElementById('confirm-ok-btn');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

  // Loading overlay
  const loadingOverlay = document.getElementById('loading-overlay');

  // Toast
  const toastContainer = document.getElementById('toast-container');

  // Workflow steps
  const wfSteps = [
    document.getElementById('wf-step-1'),
    document.getElementById('wf-step-2'),
    document.getElementById('wf-step-3'),
    document.getElementById('wf-step-4'),
    document.getElementById('wf-step-5'),
    document.getElementById('wf-step-6'),
  ];

  // Dashboard elements
  const dashStatFaculty    = document.getElementById('dash-stat-faculty');
  const dashStatSubjects   = document.getElementById('dash-stat-subjects');
  const dashStatLectures   = document.getElementById('dash-stat-lectures');
  const dashStatFree       = document.getElementById('dash-stat-free');
  const dashStatCompleted  = document.getElementById('dash-stat-completed');
  const dashStatRemaining  = document.getElementById('dash-stat-remaining');
  const dashStatConflicts  = document.getElementById('dash-stat-conflicts');
  const dashStatStatus     = document.getElementById('dash-stat-status');
  const dashDetailFaculty  = document.getElementById('dash-detail-faculty');
  const dashDetailSubjects = document.getElementById('dash-detail-subjects');
  const dashDetailLectures = document.getElementById('dash-detail-lectures');
  const dashDetailFree     = document.getElementById('dash-detail-free');
  const dashDetailCompleted= document.getElementById('dash-detail-completed');
  const dashDetailRemaining= document.getElementById('dash-detail-remaining');
  const dashDetailConflicts= document.getElementById('dash-detail-conflicts');
  const dashDetailStatus   = document.getElementById('dash-detail-status');
  const dashEmptyCta       = document.getElementById('dash-empty-cta');
  const dashAnalyticsCards = document.getElementById('dash-analytics-cards');
  const dashHoursProgress  = document.getElementById('dash-hours-progress');
  const dashWorkloadProgress = document.getElementById('dash-workload-progress');
  const dashRefreshBtn     = document.getElementById('dash-refresh-btn');
  const dashGotoConfigureBtn = document.getElementById('dash-goto-configure-btn');

  // Analytics page elements
  const analyticsEmpty    = document.getElementById('analytics-empty');
  const analyticsContent  = document.getElementById('analytics-content');
  const anaStatCompleted  = document.getElementById('ana-stat-completed');
  const anaStatRemaining  = document.getElementById('ana-stat-remaining');
  const anaStatFree       = document.getElementById('ana-stat-free');
  const anaStatConflicts  = document.getElementById('ana-stat-conflicts');
  const anaHoursProgress  = document.getElementById('ana-hours-progress');
  const anaWorkloadProgress = document.getElementById('ana-workload-progress');
  const anaCompletionProgress = document.getElementById('ana-completion-progress');
  const anaConflictStatus = document.getElementById('ana-conflict-status');

  // ===========================================================================
  // 2. APP STATE
  // ===========================================================================
  let facultyList        = [];
  let subjectsList       = [];
  let daysList           = [];
  let slotsList          = [];
  let subjectFacultyMap  = {};
  let facultyAvailability= {};
  let subjectHours       = {};
  let maxLecturesPerDay  = 2;

  let currentTimetableData     = null;
  let currentSubstitutionData  = null;
  let currentActiveView        = 'grid';
  let currentPage              = 'page-configure';
  let confirmCallback          = null;

  const PAGE_META = {
    'page-dashboard':    { title: 'Dashboard',             sub: 'System overview and quick stats' },
    'page-configure':    { title: 'Configuration',         sub: 'Faculty, Subjects, Days & Time Slots' },
    'page-timetable':    { title: 'Timetable',             sub: 'Generated weekly schedule & analytics' },
    'page-substitution': { title: 'Faculty Substitution',  sub: 'Manage absences and find substitutes' },
    'page-analytics':    { title: 'Analytics',             sub: 'Detailed scheduling insights and statistics' },
    'page-algorithm':    { title: 'Algorithm Info',        sub: 'Greedy Heuristic Engine reference & Viva guide' },
  };

  // Subject color classes (7 rotating)
  const SUBJECT_COLOR_CLASSES = ['c1','c2','c3','c4','c5','c6','c7'];
  // Faculty colors for avatars and workload bars
  const FACULTY_COLORS = ['#6366f1','#06b6d4','#14b8a6','#f59e0b','#ec4899','#22c55e','#a855f7'];

  function getSubjectColorClass(subject) {
    const idx = subjectsList.indexOf(subject);
    return SUBJECT_COLOR_CLASSES[(idx >= 0 ? idx : 0) % SUBJECT_COLOR_CLASSES.length];
  }

  function getFacultyIndex(name) {
    const idx = facultyList.indexOf(name);
    return idx >= 0 ? idx % FACULTY_COLORS.length : 0;
  }

  function getFacultyInitials(name) {
    return name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/i, '')
               .split(' ')
               .slice(0, 2)
               .map(w => w[0] || '')
               .join('')
               .toUpperCase() || '?';
  }

  function formatTime12h(time24) {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const mer = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${mer}`;
  }

  const DAY_EMOJIS = {
    Monday: '🔵', Tuesday: '🟢', Wednesday: '🟡',
    Thursday: '🟠', Friday: '🔴', Saturday: '🟣', Sunday: '⚪',
  };

  // Animated counter for stat values
  function animateCounter(el, targetVal, suffix = '', duration = 600) {
    const numericTarget = parseFloat(targetVal) || 0;
    const start = performance.now();
    const startVal = 0;

    function step(now) {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased   = 1 - Math.pow(1 - elapsed, 3);
      const current = Math.round(startVal + (numericTarget - startVal) * eased);
      el.textContent = current + suffix;
      if (elapsed < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ===========================================================================
  // 2. NAVIGATION
  // ===========================================================================
  function navigateTo(pageId) {
    currentPage = pageId;

    pageSections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });

    const meta = PAGE_META[pageId] || {};
    topbarTitle.textContent = meta.title || pageId;
    topbarSub.textContent   = meta.sub   || '';
    topbarSep.style.display = meta.sub ? 'inline' : 'none';

    // Dashboard: refresh stats
    if (pageId === 'page-dashboard') renderDashboard();

    // Analytics: refresh
    if (pageId === 'page-analytics') renderAnalyticsPage();

    // Substitution: check prereqs
    if (pageId === 'page-substitution') {
      if (!currentTimetableData) {
        subRequiresTimetable && (subRequiresTimetable.style.display = 'block');
        subFormArea && (subFormArea.style.display = 'none');
      } else {
        subRequiresTimetable && (subRequiresTimetable.style.display = 'none');
        subFormArea && (subFormArea.style.display = 'block');
        populateSubstitutionDropdowns();
      }
    }

    // Close mobile sidebar
    if (sidebar.classList.contains('open')) closeMobileSidebar();
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(item.dataset.page); }
    });
  });

  // Mobile sidebar
  function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.style.display = 'block';
    setTimeout(() => sidebarOverlay.style.opacity = 1, 10);
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.style.opacity = 0;
    setTimeout(() => sidebarOverlay.style.display = 'none', 250);
  }

  hamburgerBtn && hamburgerBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) closeMobileSidebar();
    else openMobileSidebar();
  });

  sidebarOverlay && sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // Button navigation shortcuts
  gotoConfigureBtn   && gotoConfigureBtn.addEventListener('click',   () => navigateTo('page-configure'));
  gotoGenerateBtn    && gotoGenerateBtn.addEventListener('click',    () => { navigateTo('page-configure'); setTimeout(generateTimetable, 200); });
  dashGotoConfigureBtn && dashGotoConfigureBtn.addEventListener('click', () => navigateTo('page-configure'));
  dashRefreshBtn     && dashRefreshBtn.addEventListener('click',     () => renderDashboard());

  const analyticsGotoBtn = document.getElementById('analytics-goto-generate-btn');
  analyticsGotoBtn && analyticsGotoBtn.addEventListener('click', () => { navigateTo('page-configure'); setTimeout(generateTimetable, 200); });

  // Topbar search (filter nav items)
  const topbarSearch = document.getElementById('topbar-search');
  topbarSearch && topbarSearch.addEventListener('input', () => {
    const q = topbarSearch.value.trim().toLowerCase();
    navItems.forEach(item => {
      const label = item.querySelector('.nav-item__label');
      if (!label) return;
      item.style.display = (!q || label.textContent.toLowerCase().includes(q)) ? '' : 'none';
    });
  });

  // Notification bell
  const notifBtn = document.getElementById('notif-btn');
  const notifDot = document.getElementById('notif-dot');
  notifBtn && notifBtn.addEventListener('click', () => {
    showToast('No new notifications.', 'info');
    if (notifDot) notifDot.style.display = 'none';
  });

  // Settings btn
  document.getElementById('settings-btn') && document.getElementById('settings-btn').addEventListener('click', () => {
    showToast('Settings panel coming soon!', 'info');
  });

  // Profile clicks
  document.getElementById('topbar-profile-btn') && document.getElementById('topbar-profile-btn').addEventListener('click', () => {
    showToast('Admin User — Scheduler | Faculty Timetable Optimizer AI', 'info');
  });
  document.getElementById('sidebar-profile-btn') && document.getElementById('sidebar-profile-btn').addEventListener('click', () => {
    showToast('Admin User — Scheduler | Faculty Timetable Optimizer AI', 'info');
  });

  // Workflow step helper
  function setWorkflowStep(step) {
    wfSteps.forEach((el, i) => {
      if (!el) return;
      el.classList.remove('done', 'current');
      if (i < step - 1)       el.classList.add('done');
      else if (i === step - 1) el.classList.add('current');
    });
  }

  // ===========================================================================
  // 3. TOAST NOTIFICATIONS
  // ===========================================================================
  const TOAST_ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span class="toast__icon">${TOAST_ICONS[type] || '🔔'}</span><span class="toast__msg">${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 3500);
  }

  // ===========================================================================
  // 4. CONFIRM DIALOG
  // ===========================================================================
  function showConfirm(title, msg, onOk, icon = '🗑️', okLabel = 'Remove') {
    if (confirmIcon) confirmIcon.textContent  = icon;
    if (confirmTitle) confirmTitle.textContent = title;
    if (confirmMsg) confirmMsg.textContent   = msg;
    if (confirmOkBtn) confirmOkBtn.textContent = okLabel;
    confirmCallback = onOk;
    confirmDialog.classList.add('open');
  }

  confirmOkBtn && confirmOkBtn.addEventListener('click', () => {
    confirmDialog.classList.remove('open');
    if (confirmCallback) { confirmCallback(); confirmCallback = null; }
  });

  confirmCancelBtn && confirmCancelBtn.addEventListener('click', () => {
    confirmDialog.classList.remove('open');
    confirmCallback = null;
  });

  // ===========================================================================
  // 5. LOADING OVERLAY
  // ===========================================================================
  function showLoading() { loadingOverlay.classList.add('visible'); }
  function hideLoading() { loadingOverlay.classList.remove('visible'); }

  // ===========================================================================
  // 6. CAPACITY CALCULATOR
  // ===========================================================================
  function updateCapacitySummary() {
    const totalSlots    = daysList.length * slotsList.length;
    const totalRequired = Object.values(subjectHours).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
    const free          = totalSlots - totalRequired;

    capTotalSlots.textContent = `${totalSlots} (${daysList.length}d × ${slotsList.length} slots)`;
    capReqHours.textContent   = `${totalRequired}h required`;

    capStatus.className = 'capacity-status';
    if (totalSlots === 0) {
      capStatus.classList.add('capacity-status--warn');
      capStatus.textContent = '⚠ No slots configured';
    } else if (totalRequired > totalSlots) {
      capStatus.classList.add('capacity-status--error');
      capStatus.textContent = `⛔ Overloaded (+${totalRequired - totalSlots}h excess)`;
    } else {
      capStatus.classList.add('capacity-status--ok');
      capStatus.textContent = `✓ Valid — ${free} free period${free !== 1 ? 's' : ''} expected`;
    }
  }

  // ===========================================================================
  // 7. RENDER: FACULTY CARDS + MAPPING + AVAILABILITY
  // ===========================================================================
  function renderFacultyCards() {
    facultyCardsContainer.innerHTML = '';

    if (facultyList.length === 0) {
      facultyCardsContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;padding:8px 0;">No faculty added yet. Use the input above to add faculty members.</div>';
      renderFacultyMapping();
      renderFacultyAvailability();
      return;
    }

    facultyList.forEach((teacher, tIdx) => {
      if (!facultyAvailability[teacher]) {
        facultyAvailability[teacher] = { days: [...daysList] };
      }

      const initials = getFacultyInitials(teacher);
      const color    = FACULTY_COLORS[tIdx % FACULTY_COLORS.length];

      const card = document.createElement('div');
      card.className = 'faculty-card';

      card.innerHTML = `
        <div class="faculty-card__top">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
            <div class="faculty-card__avatar" style="background:${color};">${initials}</div>
            <span class="faculty-card__name">${teacher}</span>
          </div>
          <button class="btn btn--danger btn--sm fac-remove-btn" data-index="${tIdx}" type="button" aria-label="Remove ${teacher}">✕ Remove</button>
        </div>
      `;

      facultyCardsContainer.appendChild(card);
    });

    facultyCardsContainer.querySelectorAll('.fac-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx     = parseInt(btn.dataset.index, 10);
        const removed = facultyList[idx];
        showConfirm(
          'Remove Faculty Member',
          `Remove "${removed}" from the timetable? This will also clear their subject mappings and availability.`,
          () => {
            facultyList.splice(idx, 1);
            delete facultyAvailability[removed];
            Object.keys(subjectFacultyMap).forEach(s => {
              subjectFacultyMap[s] = (subjectFacultyMap[s] || []).filter(t => t !== removed);
            });
            renderFacultyCards();
            updateCapacitySummary();
            showToast(`Removed "${removed}"`, 'info');
          }
        );
      });
    });

    renderFacultyMapping();
    renderFacultyAvailability();
  }

  function renderFacultyMapping() {
    if (!facultyMappingContainer) return;
    facultyMappingContainer.innerHTML = '';

    if (facultyList.length === 0 || subjectsList.length === 0) {
      facultyMappingContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;">Add faculty and subjects above to configure mappings.</div>';
      return;
    }

    facultyList.forEach(teacher => {
      const block = document.createElement('div');
      block.style.cssText = 'margin-bottom:16px;';

      const initials = getFacultyInitials(teacher);
      const idx      = facultyList.indexOf(teacher);
      const color    = FACULTY_COLORS[idx % FACULTY_COLORS.length];

      let chipsHtml = '';
      subjectsList.forEach(subj => {
        const isChecked = (subjectFacultyMap[subj] || []).includes(teacher);
        chipsHtml += `
          <label class="checkbox-chip ${isChecked ? 'active' : ''}">
            <input type="checkbox" class="fac-subj-check"
              data-teacher="${teacher}" data-subject="${subj}" ${isChecked ? 'checked' : ''} />
            <span>${subj}</span>
          </label>
        `;
      });

      block.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:0.68rem;font-weight:700;color:#fff;flex-shrink:0;">${initials}</div>
          <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">${teacher}</span>
        </div>
        <div class="checkbox-chips">${chipsHtml}</div>
      `;

      facultyMappingContainer.appendChild(block);
    });

    facultyMappingContainer.querySelectorAll('.fac-subj-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const teacher = chk.dataset.teacher;
        const subj    = chk.dataset.subject;
        if (!subjectFacultyMap[subj]) subjectFacultyMap[subj] = [];

        if (chk.checked) {
          if (!subjectFacultyMap[subj].includes(teacher)) subjectFacultyMap[subj].push(teacher);
          chk.closest('.checkbox-chip').classList.add('active');
        } else {
          subjectFacultyMap[subj] = subjectFacultyMap[subj].filter(t => t !== teacher);
          chk.closest('.checkbox-chip').classList.remove('active');
        }
      });
    });
  }

  function renderFacultyAvailability() {
    if (!facultyAvailContainer) return;
    facultyAvailContainer.innerHTML = '';

    if (facultyList.length === 0 || daysList.length === 0) {
      facultyAvailContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;">Add faculty and days above to configure availability.</div>';
      return;
    }

    facultyList.forEach(teacher => {
      if (!facultyAvailability[teacher]) facultyAvailability[teacher] = { days: [...daysList] };
      const teacherDays = facultyAvailability[teacher].days || [];

      const block = document.createElement('div');
      block.style.cssText = 'margin-bottom:14px;';

      const idx   = facultyList.indexOf(teacher);
      const color = FACULTY_COLORS[idx % FACULTY_COLORS.length];
      const inits = getFacultyInitials(teacher);

      let chipsHtml = '';
      daysList.forEach(day => {
        const isAvail = teacherDays.includes(day);
        chipsHtml += `
          <label class="checkbox-chip ${isAvail ? 'active' : ''}">
            <input type="checkbox" class="fac-day-check"
              data-teacher="${teacher}" data-day="${day}" ${isAvail ? 'checked' : ''} />
            <span>${day.substring(0, 3)}</span>
          </label>
        `;
      });

      block.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:0.68rem;font-weight:700;color:#fff;flex-shrink:0;">${inits}</div>
          <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">${teacher}</span>
        </div>
        <div class="checkbox-chips">${chipsHtml}</div>
      `;

      facultyAvailContainer.appendChild(block);
    });

    facultyAvailContainer.querySelectorAll('.fac-day-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const teacher = chk.dataset.teacher;
        const day     = chk.dataset.day;
        if (!facultyAvailability[teacher]) facultyAvailability[teacher] = { days: [] };

        if (chk.checked) {
          if (!facultyAvailability[teacher].days.includes(day)) facultyAvailability[teacher].days.push(day);
          chk.closest('.checkbox-chip').classList.add('active');
        } else {
          facultyAvailability[teacher].days = facultyAvailability[teacher].days.filter(d => d !== day);
          chk.closest('.checkbox-chip').classList.remove('active');
        }
      });
    });
  }

  // ===========================================================================
  // 8. RENDER: SUBJECTS & HOURS
  // ===========================================================================
  function renderSubjects() {
    subjectsContainer.innerHTML = '';

    if (subjectsList.length === 0) {
      subjectsContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;padding:4px 0;">No subjects added yet.</div>';
      updateCapacitySummary();
      return;
    }

    subjectsList.forEach((subj, sIdx) => {
      const hours = subjectHours[subj] || 4;
      const row   = document.createElement('div');
      row.className = 'subject-item';

      row.innerHTML = `
        <span class="subject-item__name">📖 ${subj}</span>
        <div class="subject-item__right">
          <div class="stepper">
            <button class="stepper__btn subj-minus" data-subject="${subj}" type="button" aria-label="Decrease hours">−</button>
            <span class="stepper__val">${hours}h</span>
            <button class="stepper__btn subj-plus" data-subject="${subj}" type="button" aria-label="Increase hours">+</button>
          </div>
          <button class="btn btn--danger btn--sm btn--icon-only subj-remove" data-index="${sIdx}" title="Remove ${subj}" type="button" aria-label="Remove ${subj}">✕</button>
        </div>
      `;

      subjectsContainer.appendChild(row);
    });

    subjectsContainer.querySelectorAll('.subj-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.subject;
        if (subjectHours[s] > 1) { subjectHours[s]--; renderSubjects(); }
      });
    });

    subjectsContainer.querySelectorAll('.subj-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.subject;
        if (subjectHours[s] < 40) { subjectHours[s]++; renderSubjects(); }
      });
    });

    subjectsContainer.querySelectorAll('.subj-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx     = parseInt(btn.dataset.index, 10);
        const removed = subjectsList[idx];
        showConfirm(
          'Remove Subject',
          `Remove "${removed}"? This will also clear its faculty mappings.`,
          () => {
            subjectsList.splice(idx, 1);
            delete subjectHours[removed];
            delete subjectFacultyMap[removed];
            renderSubjects();
            renderFacultyCards();
            updateCapacitySummary();
            showToast(`Removed subject "${removed}"`, 'info');
          }
        );
      });
    });

    updateCapacitySummary();
  }

  // ===========================================================================
  // 9. RENDER: DAYS TAGS
  // ===========================================================================
  function renderDaysTags() {
    daysTagsContainer.innerHTML = '';

    daysList.forEach((day, idx) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip tag-chip--day';
      chip.innerHTML = `
        <span>${DAY_EMOJIS[day] || '📅'} ${day}</span>
        <button class="tag-chip__remove day-remove" data-index="${idx}" title="Remove ${day}" type="button" aria-label="Remove ${day}">✕</button>
      `;
      daysTagsContainer.appendChild(chip);
    });

    daysTagsContainer.querySelectorAll('.day-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx     = parseInt(btn.dataset.index, 10);
        const removed = daysList[idx];
        daysList.splice(idx, 1);
        renderDaysTags();
        renderFacultyAvailability();
        updateCapacitySummary();
        showToast(`Removed "${removed}"`, 'info');
      });
    });

    updateCapacitySummary();
  }

  // ===========================================================================
  // 10. RENDER: TIME SLOT TAGS
  // ===========================================================================
  function renderSlotsTags() {
    slotsTagsContainer.innerHTML = '';

    slotsList.forEach((slot, idx) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip tag-chip--slot';
      chip.innerHTML = `
        <span>🕐 ${slot}</span>
        <button class="tag-chip__remove slot-remove" data-index="${idx}" title="Remove slot" type="button" aria-label="Remove slot">✕</button>
      `;
      slotsTagsContainer.appendChild(chip);
    });

    slotsTagsContainer.querySelectorAll('.slot-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx     = parseInt(btn.dataset.index, 10);
        const removed = slotsList[idx];
        slotsList.splice(idx, 1);
        renderSlotsTags();
        updateCapacitySummary();
        showToast(`Removed slot "${removed}"`, 'info');
      });
    });

    updateCapacitySummary();
  }

  // ===========================================================================
  // 11. CONFIG ADD/REMOVE ACTION HANDLERS
  // ===========================================================================
  function showFieldError(el, msg) {
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 4000);
  }

  function handleAddFaculty() {
    const val = facultyAddInput.value.trim();
    if (!val) { showFieldError(facultyError, 'Please enter a faculty name.'); facultyAddInput.focus(); return; }
    if (facultyList.some(f => f.toLowerCase() === val.toLowerCase())) {
      showFieldError(facultyError, `"${val}" already exists.`); facultyAddInput.focus(); return;
    }
    facultyList.push(val);
    facultyAvailability[val] = { days: [...daysList] };
    facultyAddInput.value = '';
    renderFacultyCards();
    updateCapacitySummary();
    showToast(`Added "${val}". Don't forget to map subjects!`, 'success');
  }

  facultyAddBtn.addEventListener('click', handleAddFaculty);
  facultyAddInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddFaculty(); });

  function handleAddSubject() {
    const val = subjectsAddInput.value.trim();
    if (!val) { showFieldError(subjectError, 'Please enter a subject name.'); subjectsAddInput.focus(); return; }
    if (subjectsList.some(s => s.toLowerCase() === val.toLowerCase())) {
      showFieldError(subjectError, `"${val}" already exists.`); subjectsAddInput.focus(); return;
    }
    subjectsList.push(val);
    subjectHours[val] = 4;
    subjectFacultyMap[val] = facultyList.length > 0 ? [facultyList[0]] : [];
    subjectsAddInput.value = '';
    renderSubjects();
    renderFacultyMapping();
    updateCapacitySummary();
    showToast(`Added subject "${val}"`, 'success');
  }

  subjectsAddBtn.addEventListener('click', handleAddSubject);
  subjectsAddInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddSubject(); });

  function handleAddDay() {
    const val = daysAddInput.value.trim();
    if (!val) { showFieldError(dayError, 'Please enter a day name.'); daysAddInput.focus(); return; }
    if (daysList.some(d => d.toLowerCase() === val.toLowerCase())) {
      showFieldError(dayError, `"${val}" already exists.`); daysAddInput.focus(); return;
    }
    daysList.push(val);
    Object.keys(facultyAvailability).forEach(f => {
      if (!facultyAvailability[f].days.includes(val)) facultyAvailability[f].days.push(val);
    });
    daysAddInput.value = '';
    renderDaysTags();
    renderFacultyAvailability();
    updateCapacitySummary();
    showToast(`Added "${val}"`, 'success');
  }

  daysAddBtn.addEventListener('click', handleAddDay);
  daysAddInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddDay(); });

  // Day presets
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'mon-fri')  daysList = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
      if (preset === 'mon-sat')  daysList = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      if (preset === 'all')      daysList = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

      Object.keys(facultyAvailability).forEach(f => {
        facultyAvailability[f] = { days: [...daysList] };
      });
      renderDaysTags();
      renderFacultyAvailability();
      updateCapacitySummary();
      showToast(`Applied ${btn.textContent.trim()} preset`, 'success');
    });
  });

  slotAddBtn && slotAddBtn.addEventListener('click', () => {
    const startVal = slotStartTime.value;
    const endVal   = slotEndTime.value;
    if (!startVal || !endVal) { showFieldError(slotError, 'Please pick both start and end time.'); return; }
    if (startVal >= endVal)   { showFieldError(slotError, 'Start time must be before end time.'); return; }

    const slotStr = `${formatTime12h(startVal)} - ${formatTime12h(endVal)}`;
    if (slotsList.includes(slotStr)) { showFieldError(slotError, `Slot "${slotStr}" already exists.`); return; }

    slotsList.push(slotStr);
    renderSlotsTags();
    updateCapacitySummary();
    showToast(`Added slot "${slotStr}"`, 'success');
  });

  maxDailyMinus && maxDailyMinus.addEventListener('click', () => {
    if (maxLecturesPerDay > 1) { maxLecturesPerDay--; maxDailyVal.textContent = maxLecturesPerDay; }
  });
  maxDailyPlus && maxDailyPlus.addEventListener('click', () => {
    if (maxLecturesPerDay < 10) { maxLecturesPerDay++; maxDailyVal.textContent = maxLecturesPerDay; }
  });

  // ===========================================================================
  // 12. TIMETABLE GENERATION API CALL
  // ===========================================================================
  async function generateTimetable() {
    // Pre-flight validation
    if (facultyList.length === 0) { showToast('At least one faculty member is required.', 'warning'); return; }
    if (subjectsList.length === 0) { showToast('At least one subject is required.', 'warning'); return; }
    if (daysList.length === 0) { showToast('At least one scheduled day is required.', 'warning'); return; }
    if (slotsList.length === 0) { showToast('At least one time slot is required.', 'warning'); return; }

    const unmapped = subjectsList.filter(s => (subjectFacultyMap[s] || []).length === 0);
    if (unmapped.length > 0) {
      showToast(`Map at least 1 faculty to: ${unmapped.join(', ')}`, 'warning');
      return;
    }

    showLoading();
    setWorkflowStep(3);

    try {
      const response = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          faculty:              facultyList,
          subjects:             subjectsList,
          days:                 daysList,
          time_slots:           slotsList,
          subject_faculty_map:  subjectFacultyMap,
          faculty_availability: facultyAvailability,
          subject_hours:        subjectHours,
          max_lectures_per_day: maxLecturesPerDay,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error' || data.error) {
        const errMsg = data.error || 'Failed to generate timetable. Please check your configuration.';
        hideLoading();
        setWorkflowStep(2);

        validationBanner.style.display = 'block';
        validationBanner.innerHTML = `
          <div class="alert-banner alert-banner--error">
            <span class="alert-banner__icon">🚫</span>
            <div class="alert-banner__content">
              <div class="alert-banner__title">Timetable Generation Failed</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">${errMsg}</div>
            </div>
          </div>
        `;

        emptyState.style.display     = 'flex';
        analyticsArea.style.display  = 'none';
        timetableActionRow.style.display = 'none';
        navigateTo('page-timetable');
        showToast(errMsg, 'error');
        return;
      }

      currentTimetableData = data;
      hideLoading();
      setWorkflowStep(4);

      // Render timetable UI
      renderValidationBanner(data);
      renderAnalyticsDashboard(data);
      renderWeeklyGrid(data);
      renderDayCards(data);

      emptyState.style.display         = 'none';
      analyticsArea.style.display      = 'block';
      timetableActionRow.style.display = 'flex';

      // Update status pill & nav badge
      timetableStatusPill.textContent = 'Generated';
      timetableStatusPill.classList.add('active');
      timetableNavBadge && (timetableNavBadge.style.display = 'inline');
      if (notifDot) notifDot.style.display = 'block';

      navigateTo('page-timetable');
      showToast('Conflict-free timetable generated successfully!', 'success');

    } catch (err) {
      hideLoading();
      setWorkflowStep(1);
      showToast('Network or server error while generating timetable.', 'error');
    }
  }

  generateBtn && generateBtn.addEventListener('click', generateTimetable);
  regenerateBtn && regenerateBtn.addEventListener('click', generateTimetable);

  // ===========================================================================
  // 13. RENDER: ANALYTICS DASHBOARD (Timetable page)
  // ===========================================================================
  function renderValidationBanner(data) {
    validationBanner.style.display = 'block';
    const { stats } = data;

    if (stats.warnings && stats.warnings.length > 0) {
      validationBanner.innerHTML = `
        <div class="alert-banner alert-banner--warning">
          <span class="alert-banner__icon">⚠️</span>
          <div class="alert-banner__content">
            <div class="alert-banner__title">Timetable Generated with Partial Hours</div>
            <ul style="padding-left:16px;margin-top:6px;display:flex;flex-direction:column;gap:3px;">
              ${stats.warnings.map(w => `<li style="font-size:0.8rem;color:var(--text-secondary);">${w}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    } else {
      validationBanner.innerHTML = `
        <div class="alert-banner alert-banner--success">
          <span class="alert-banner__icon">✅</span>
          <div class="alert-banner__content">
            <div class="alert-banner__title">Valid Timetable — 100% Conflict-Free</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">All hard constraints verified · Zero faculty collisions · Workload balanced across all faculty</div>
          </div>
        </div>
      `;
    }
  }

  function buildProgressRow(label, sched, req, colorClass, customColor) {
    const pct   = req > 0 ? Math.min(100, Math.round((sched / req) * 100)) : 0;
    const isDone= sched >= req;
    const fillClass = customColor ? '' : (isDone ? 'progress-fill--success' : 'progress-fill--warning');
    const fillStyle = customColor ? `background:${customColor};` : '';

    return `
      <div class="progress-row">
        <div class="progress-row__top">
          <span class="progress-row__label">${label}</span>
          <span class="progress-row__val">${sched}${req ? ' / ' + req : ''}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${fillClass}" style="width:0%;${fillStyle}" data-target="${pct}"></div>
        </div>
      </div>
    `;
  }

  function renderAnalyticsDashboard(data) {
    const { stats, faculty } = data;
    const totalRequired  = Object.values(stats.required_hours  || {}).reduce((a, b) => a + b, 0);
    const totalCompleted = Object.values(stats.scheduled_hours || {}).reduce((a, b) => a + b, 0);
    const totalRemaining = Math.max(0, totalRequired - totalCompleted);

    // Stat cards
    statLectures.textContent  = stats.total_lectures || 0;
    statFree.textContent      = stats.free_periods   || 0;
    statRequired.textContent  = `${totalRequired}h`;
    statCompleted.textContent = `${totalCompleted}h`;
    statRemaining.textContent = `${totalRemaining}h`;
    statFaculty.textContent   = (faculty || []).length;

    statRemaining.className = `stat-card__value stat-card__value--${totalRemaining === 0 ? 'success' : 'warning'}`;

    // Subject Hours Progress
    if (hoursSummary) {
      hoursSummary.innerHTML = '';
      (data.subjects || []).forEach(subj => {
        const req   = stats.required_hours[subj]  || 0;
        const sched = stats.scheduled_hours[subj] || 0;
        hoursSummary.innerHTML += buildProgressRow(`📖 ${subj}`, sched, req, null, null);
      });
      animateProgressBars(hoursSummary);
    }

    // Faculty Workload Progress
    if (workloadSummary) {
      workloadSummary.innerHTML = '';
      const maxLoad = Math.max(1, ...Object.values(stats.faculty_workload || {}));
      (data.faculty || []).forEach(teacher => {
        const load  = stats.faculty_workload[teacher] || 0;
        const color = FACULTY_COLORS[facultyList.indexOf(teacher) % FACULTY_COLORS.length];
        workloadSummary.innerHTML += buildProgressRow(teacher, load, maxLoad, null, color);
      });
      animateProgressBars(workloadSummary);
    }
  }

  function animateProgressBars(container) {
    requestAnimationFrame(() => {
      (container || document).querySelectorAll('.progress-fill[data-target]').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.target + '%'; }, 80);
      });
    });
  }

  // ===========================================================================
  // 14. RENDER: WEEKLY GRID & DAY CARDS (Premium Design)
  // ===========================================================================
  function renderWeeklyGrid(data) {
    const { timetable, days, time_slots } = data;
    weeklyTableContainer.innerHTML = '';

    // Build lookup: day → slot → lecture
    const lookup = {};
    days.forEach(day => {
      lookup[day] = {};
      (timetable[day] || []).forEach(lec => { lookup[day][lec.time] = lec; });
    });

    let html = '<table class="weekly-table">';

    // Header — days as columns, time as row labels
    html += '<thead><tr>';
    html += '<th>Time \\ Day</th>';
    days.forEach(day => {
      const emoji = DAY_EMOJIS[day] || '📅';
      html += `<th>${emoji} ${day}</th>`;
    });
    html += '</tr></thead>';

    // Rows — time slots
    html += '<tbody>';
    time_slots.forEach(slot => {
      const slotParts = slot.split(' - ');
      const slotStart = slotParts[0] || slot;
      const slotEnd   = slotParts[1] || '';

      html += '<tr>';
      html += `<td>
        <div class="time-label">
          <div class="time-label__main">${slotStart}</div>
          ${slotEnd ? `<div class="time-label__sub">→ ${slotEnd}</div>` : ''}
        </div>
      </td>`;

      days.forEach(day => {
        const lec = lookup[day] && lookup[day][slot];

        if (!lec) {
          html += `<td><div class="free-period-cell"><span class="free-period-cell__label">—</span></div></td>`;
          return;
        }

        if (lec.is_free) {
          html += `
            <td>
              <div class="free-period-cell" title="${lec.reason || 'Free period'}">
                <span class="free-period-cell__label">FREE PERIOD</span>
              </div>
            </td>
          `;
        } else {
          const subjIdx = subjectsList.indexOf(lec.subject);
          const colorClass = `lecture-card--c${((subjIdx >= 0 ? subjIdx : 0) % 7) + 1}`;
          const subBadge = lec.is_substituted
            ? '<div class="substituted-badge">🔄 Substituted</div>'
            : '';
          html += `
            <td>
              <div class="lecture-card ${colorClass}" title="${lec.subject} — ${lec.faculty}">
                <div class="lecture-card__subject">${lec.subject}</div>
                <div class="lecture-card__faculty">👤 ${lec.faculty}</div>
                <div class="lecture-card__time">${lec.time}</div>
                ${subBadge}
              </div>
            </td>
          `;
        }
      });

      html += '</tr>';
    });
    html += '</tbody></table>';

    weeklyTableContainer.innerHTML = html;
  }

  function renderDayCards(data) {
    const { timetable, days } = data;
    dayCardsContainer.innerHTML = '';

    days.forEach(day => {
      const lectures = timetable[day] || [];
      const lecCount  = lectures.filter(l => !l.is_free).length;
      const emoji     = DAY_EMOJIS[day] || '📅';

      const card = document.createElement('div');
      card.className = 'day-card';

      const rows = lectures.map(lec => {
        if (lec.is_free) {
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
              <span style="font-size:0.68rem;color:var(--text-muted);font-family:'JetBrains Mono',monospace;white-space:nowrap;min-width:80px;">${lec.time.split(' - ')[0]}</span>
              <span style="font-size:0.75rem;color:var(--text-subtle);font-style:italic;">☕ Free Period</span>
            </div>
          `;
        }
        const subjIdx    = subjectsList.indexOf(lec.subject);
        const colorIdx   = ((subjIdx >= 0 ? subjIdx : 0) % 7) + 1;
        const colorMap   = ['#6366f1','#06b6d4','#14b8a6','#f59e0b','#ec4899','#22c55e','#a855f7'];
        const borderColor = colorMap[(colorIdx - 1) % colorMap.length];
        const subBadge = lec.is_substituted ? '<span class="substituted-badge" style="font-size:0.55rem;">🔄 Sub</span>' : '';
        return `
          <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);border-left:3px solid ${borderColor};padding-left:10px;margin-left:-12px;">
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.78rem;font-weight:700;color:var(--text-primary);">${lec.subject} ${subBadge}</div>
              <div style="font-size:0.68rem;color:var(--text-muted);">👤 ${lec.faculty}</div>
              <div style="font-size:0.62rem;color:var(--text-subtle);font-family:'JetBrains Mono',monospace;">${lec.time}</div>
            </div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="day-card__header">
          <span class="day-card__name">${emoji} ${day}</span>
          <span class="day-card__count">${lecCount} lecture${lecCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="day-card__body">${rows}</div>
      `;

      dayCardsContainer.appendChild(card);
    });
  }

  function switchView(view) {
    currentActiveView = view;
    if (view === 'grid') {
      viewGridBtn.classList.add('active');
      viewCardsBtn.classList.remove('active');
      weeklyMatrixWrapper.style.display = 'block';
      dayCardsWrapper.style.display     = 'none';
    } else {
      viewCardsBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      weeklyMatrixWrapper.style.display = 'none';
      dayCardsWrapper.style.display     = 'block';
    }
  }

  viewGridBtn  && viewGridBtn.addEventListener('click',  () => switchView('grid'));
  viewCardsBtn && viewCardsBtn.addEventListener('click', () => switchView('cards'));

  // ===========================================================================
  // 15. RENDER: DASHBOARD PAGE
  // ===========================================================================
  function renderDashboard() {
    // Always update config stats
    animateCounter(dashStatFaculty,  facultyList.length,   '');
    animateCounter(dashStatSubjects, subjectsList.length,  '');

    if (dashDetailFaculty)  dashDetailFaculty.textContent  = facultyList.length > 0 ? facultyList.slice(0,3).join(', ') + (facultyList.length > 3 ? '…' : '') : 'No faculty configured';
    if (dashDetailSubjects) dashDetailSubjects.textContent = subjectsList.length > 0 ? subjectsList.slice(0,3).join(', ') + (subjectsList.length > 3 ? '…' : '') : 'No subjects configured';

    if (!currentTimetableData) {
      // No timetable yet
      if (dashStatLectures)   dashStatLectures.textContent  = '0';
      if (dashStatFree)       dashStatFree.textContent      = '0';
      if (dashStatCompleted)  dashStatCompleted.textContent = '0h';
      if (dashStatRemaining)  dashStatRemaining.textContent = '0h';
      if (dashStatConflicts)  dashStatConflicts.textContent = '0';
      if (dashStatStatus)     dashStatStatus.textContent    = 'Not Set';
      if (dashDetailLectures) dashDetailLectures.textContent = 'Generate timetable first';
      if (dashDetailFree)     dashDetailFree.textContent    = '—';
      if (dashDetailCompleted)dashDetailCompleted.textContent = '—';
      if (dashDetailRemaining)dashDetailRemaining.textContent = '—';
      if (dashDetailConflicts)dashDetailConflicts.textContent = 'No timetable yet';
      if (dashDetailStatus)   dashDetailStatus.textContent  = 'Configure and generate';
      if (dashEmptyCta)       dashEmptyCta.style.display    = 'flex';
      if (dashAnalyticsCards) dashAnalyticsCards.style.display = 'none';
      return;
    }

    if (dashEmptyCta)       dashEmptyCta.style.display    = 'none';
    if (dashAnalyticsCards) dashAnalyticsCards.style.display = 'grid';

    const { stats, faculty } = currentTimetableData;
    const totalRequired  = Object.values(stats.required_hours  || {}).reduce((a, b) => a + b, 0);
    const totalCompleted = Object.values(stats.scheduled_hours || {}).reduce((a, b) => a + b, 0);
    const totalRemaining = Math.max(0, totalRequired - totalCompleted);
    const conflicts      = (stats.validation && stats.validation.violations) ? stats.validation.violations.length : 0;
    const isComplete     = stats.is_complete;

    // Animate numbers
    animateCounter(dashStatLectures,  stats.total_lectures || 0, '');
    animateCounter(dashStatFree,      stats.free_periods   || 0, '');
    animateCounter(dashStatCompleted, totalCompleted, 'h');
    animateCounter(dashStatRemaining, totalRemaining, 'h');
    animateCounter(dashStatConflicts, conflicts, '');

    if (dashStatStatus) dashStatStatus.textContent = isComplete ? '✅ Complete' : '⚠ Partial';

    if (dashDetailLectures) dashDetailLectures.textContent = `Across ${daysList.length} days`;
    if (dashDetailFree)     dashDetailFree.textContent     = `${stats.free_periods || 0} free slot${(stats.free_periods||0) !== 1 ? 's' : ''}`;
    if (dashDetailCompleted)dashDetailCompleted.textContent = `of ${totalRequired}h required`;
    if (dashDetailRemaining)dashDetailRemaining.textContent = totalRemaining === 0 ? 'All hours covered ✓' : `${totalRemaining}h still needed`;
    if (dashDetailConflicts)dashDetailConflicts.textContent = conflicts === 0 ? 'Zero violations ✓' : `${conflicts} violation${conflicts !== 1 ? 's' : ''}`;
    if (dashDetailStatus)   dashDetailStatus.textContent   = isComplete ? 'All subject hours met' : 'Some hours not scheduled';

    // Subject progress
    if (dashHoursProgress) {
      dashHoursProgress.innerHTML = '';
      (currentTimetableData.subjects || []).forEach(subj => {
        const req   = stats.required_hours[subj]  || 0;
        const sched = stats.scheduled_hours[subj] || 0;
        dashHoursProgress.innerHTML += buildProgressRow(`📖 ${subj}`, sched, req, null, null);
      });
      animateProgressBars(dashHoursProgress);
    }

    // Faculty workload
    if (dashWorkloadProgress) {
      dashWorkloadProgress.innerHTML = '';
      const maxLoad = Math.max(1, ...Object.values(stats.faculty_workload || {}));
      (currentTimetableData.faculty || []).forEach(teacher => {
        const load  = stats.faculty_workload[teacher] || 0;
        const color = FACULTY_COLORS[facultyList.indexOf(teacher) % FACULTY_COLORS.length];
        dashWorkloadProgress.innerHTML += buildProgressRow(teacher, load, maxLoad, null, color);
      });
      animateProgressBars(dashWorkloadProgress);
    }
  }

  // ===========================================================================
  // 15b. RENDER: ANALYTICS PAGE
  // ===========================================================================
  function renderAnalyticsPage() {
    if (!currentTimetableData) {
      analyticsEmpty   && (analyticsEmpty.style.display = 'block');
      analyticsContent && (analyticsContent.style.display = 'none');
      return;
    }

    analyticsEmpty   && (analyticsEmpty.style.display = 'none');
    analyticsContent && (analyticsContent.style.display = 'block');

    const { stats } = currentTimetableData;
    const totalRequired  = Object.values(stats.required_hours  || {}).reduce((a, b) => a + b, 0);
    const totalCompleted = Object.values(stats.scheduled_hours || {}).reduce((a, b) => a + b, 0);
    const totalRemaining = Math.max(0, totalRequired - totalCompleted);
    const conflicts      = (stats.validation && stats.validation.violations) ? stats.validation.violations.length : 0;

    if (anaStatCompleted) anaStatCompleted.textContent = `${totalCompleted}h`;
    if (anaStatRemaining) anaStatRemaining.textContent = `${totalRemaining}h`;
    if (anaStatFree)      anaStatFree.textContent      = stats.free_periods || 0;
    if (anaStatConflicts) anaStatConflicts.textContent = conflicts;

    // Subject progress
    if (anaHoursProgress) {
      anaHoursProgress.innerHTML = '';
      (currentTimetableData.subjects || []).forEach(subj => {
        const req   = stats.required_hours[subj]  || 0;
        const sched = stats.scheduled_hours[subj] || 0;
        anaHoursProgress.innerHTML += buildProgressRow(`📖 ${subj}`, sched, req, null, null);
      });
      animateProgressBars(anaHoursProgress);
    }

    // Faculty workload
    if (anaWorkloadProgress) {
      anaWorkloadProgress.innerHTML = '';
      const maxLoad = Math.max(1, ...Object.values(stats.faculty_workload || {}));
      (currentTimetableData.faculty || []).forEach(teacher => {
        const load  = stats.faculty_workload[teacher] || 0;
        const color = FACULTY_COLORS[facultyList.indexOf(teacher) % FACULTY_COLORS.length];
        anaWorkloadProgress.innerHTML += buildProgressRow(teacher, load, maxLoad, null, color);
      });
      animateProgressBars(anaWorkloadProgress);
    }

    // Completion overview
    if (anaCompletionProgress) {
      const totalSlots = (currentTimetableData.days || []).length * (currentTimetableData.time_slots || []).length;
      const pct = totalSlots > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
      anaCompletionProgress.innerHTML = `
        ${buildProgressRow('Scheduled vs Required', totalCompleted, totalRequired, null, null)}
        ${buildProgressRow('Slots Used', totalCompleted, totalSlots, null, null)}
        ${buildProgressRow('Free Periods', stats.free_periods || 0, totalSlots, null, null)}
      `;
      animateProgressBars(anaCompletionProgress);
    }

    // Conflict status
    if (anaConflictStatus) {
      if (conflicts === 0) {
        anaConflictStatus.innerHTML = `
          <div class="alert-banner alert-banner--success">
            <span class="alert-banner__icon">✅</span>
            <div class="alert-banner__content">
              <div class="alert-banner__title">Zero Conflicts Detected</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);">All hard constraints satisfied. No faculty double-bookings. No unmapped assignments.</div>
            </div>
          </div>
        `;
      } else {
        const violationHtml = (stats.validation.violations || []).map(v =>
          `<li style="font-size:0.78rem;color:var(--danger-light);padding:4px 0;">${v}</li>`
        ).join('');
        anaConflictStatus.innerHTML = `
          <div class="alert-banner alert-banner--error">
            <span class="alert-banner__icon">⚠️</span>
            <div class="alert-banner__content">
              <div class="alert-banner__title">${conflicts} Conflict${conflicts !== 1 ? 's' : ''} Detected</div>
              <ul style="padding-left:16px;margin-top:8px;">${violationHtml}</ul>
            </div>
          </div>
        `;
      }
    }
  }

  // ===========================================================================
  // 16. SUBSTITUTION PAGE
  // ===========================================================================
  function populateSubstitutionDropdowns() {
    subFacultySelect.innerHTML = '';
    subDaySelect.innerHTML     = '';
    subResultsArea && (subResultsArea.style.display = 'none');

    facultyList.forEach(f => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = f;
      subFacultySelect.appendChild(opt);
    });

    daysList.forEach(d => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = d;
      subDaySelect.appendChild(opt);
    });
  }

  subFindBtn && subFindBtn.addEventListener('click', async () => {
    const absentFaculty = subFacultySelect.value;
    const absentDay     = subDaySelect.value;

    if (!absentFaculty || !absentDay) { showToast('Please select both faculty and day.', 'warning'); return; }

    showLoading();
    try {
      const res  = await fetch('/api/substitution/check', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          timetable:            currentTimetableData.timetable,
          absent_faculty:       absentFaculty,
          day:                  absentDay,
          subject_faculty_map:  subjectFacultyMap,
          faculty_availability: facultyAvailability,
          faculty:              facultyList,
        }),
      });
      const data = await res.json();
      hideLoading();

      if (!res.ok || data.status === 'error') {
        showToast(data.error || 'Failed to check substitutions.', 'error'); return;
      }

      currentSubstitutionData = data;
      renderSubstitutionResults(data, absentDay);

    } catch (err) {
      hideLoading();
      showToast('Error checking substitutions.', 'error');
    }
  });

  function renderSubstitutionResults(data, day) {
    const { affected_lectures, absent_faculty } = data;
    subResultsArea.style.display = 'block';
    subResultsSubtitle.textContent = `${absent_faculty} on ${day} — ${affected_lectures.length} affected lecture(s)`;

    if (affected_lectures.length === 0) {
      subLecturesList.innerHTML = `
        <div class="alert-banner alert-banner--info">
          <span class="alert-banner__icon">ℹ️</span>
          <div class="alert-banner__content">
            <div class="alert-banner__title">No Affected Lectures</div>
            <div>${absent_faculty} has no scheduled lectures on ${day}.</div>
          </div>
        </div>
      `;
      subAutoBtn && (subAutoBtn.style.display = 'none');
      subApplyBtn && (subApplyBtn.style.display = 'none');
      return;
    }

    subAutoBtn  && (subAutoBtn.style.display  = 'inline-flex');
    subApplyBtn && (subApplyBtn.style.display = 'inline-flex');

    subLecturesList.innerHTML = '';
    affected_lectures.forEach(item => {
      const row = document.createElement('div');
      row.className = 'sub-lecture-row';

      let substituteHtml = '';
      if (item.available_substitutes.length === 0) {
        substituteHtml = `
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="sub-status sub-status--unavail">✕ No Substitute Available</span>
          </div>
        `;
      } else {
        const opts = item.available_substitutes.map(s => `
          <option value="${s.faculty}" ${s.faculty === item.suggested_substitute ? 'selected' : ''}>
            ${s.faculty} (${s.current_workload} lectures)${s.faculty === item.suggested_substitute ? ' ★' : ''}
          </option>
        `).join('');

        substituteHtml = `
          <div class="sub-lecture-row__subs">
            <div class="sub-lecture-row__sub-label">Assign Substitute</div>
            <div class="sub-select-row">
              <select class="form-select sub-candidate-select"
                data-slot-index="${item.slot_index}" data-day="${day}">${opts}</select>
              <span class="sub-status sub-status--avail">✓ Available</span>
            </div>
          </div>
        `;
      }

      row.innerHTML = `
        <div class="sub-lecture-row__top">
          <span class="sub-lecture-row__subj">📖 ${item.subject}</span>
          <span class="sub-lecture-row__time">🕐 ${item.time}</span>
          <span class="sub-lecture-row__absent">✕ ${item.absent_faculty}</span>
        </div>
        ${substituteHtml}
      `;
      subLecturesList.appendChild(row);
    });
  }

  subAutoBtn && subAutoBtn.addEventListener('click', () => {
    if (!currentSubstitutionData) return;
    document.querySelectorAll('.sub-candidate-select').forEach(sel => {
      const slotIdx = parseInt(sel.dataset.slotIndex, 10);
      const matched = currentSubstitutionData.affected_lectures.find(l => l.slot_index === slotIdx);
      if (matched && matched.suggested_substitute) sel.value = matched.suggested_substitute;
    });
    showToast('Auto-assigned least-loaded qualified substitutes!', 'success');
  });

  subApplyBtn && subApplyBtn.addEventListener('click', async () => {
    const selects = document.querySelectorAll('.sub-candidate-select');
    if (selects.length === 0) { showToast('No substitutions to apply.', 'warning'); return; }

    const substitutions = [];
    selects.forEach(sel => {
      substitutions.push({
        day:               sel.dataset.day,
        slot_index:        parseInt(sel.dataset.slotIndex, 10),
        substitute_faculty: sel.value,
      });
    });

    showLoading();
    try {
      const res  = await fetch('/api/substitution/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ timetable: currentTimetableData.timetable, substitutions }),
      });
      const data = await res.json();
      hideLoading();

      if (!res.ok || data.status === 'error') { showToast(data.error || 'Failed to apply substitutions.', 'error'); return; }

      currentTimetableData.timetable = data.timetable;
      renderWeeklyGrid(currentTimetableData);
      renderDayCards(currentTimetableData);
      setWorkflowStep(5);

      subResultsArea.style.display = 'none';
      showToast(`Applied ${data.applied_count} substitution(s)!`, 'success');
      navigateTo('page-timetable');

    } catch (err) {
      hideLoading();
      showToast('Error applying substitutions.', 'error');
    }
  });

  // ===========================================================================
  // 17. EXPORT & PRINT
  // ===========================================================================
  printBtn && printBtn.addEventListener('click', () => window.print());

  exportCsvBtn && exportCsvBtn.addEventListener('click', () => {
    if (!currentTimetableData) { showToast('Please generate a timetable first.', 'warning'); return; }

    const { timetable, days } = currentTimetableData;
    let csv = 'Day,Time Slot,Subject,Faculty,Status\n';
    days.forEach(day => {
      (timetable[day] || []).forEach(lec => {
        csv += `"${day}","${lec.time}","${lec.subject}","${lec.faculty}","${lec.is_free ? 'Free Period' : lec.is_substituted ? 'Substituted' : 'Scheduled'}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.download = `timetable_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setWorkflowStep(6);
    showToast('Exported timetable to CSV!', 'success');
  });

  // ===========================================================================
  // 18. RESET TO DEFAULTS
  // ===========================================================================
  function resetDefaults() {
    facultyList         = JSON.parse(facultyCardsContainer.dataset.defaults   || '[]');
    subjectsList        = JSON.parse(subjectsContainer.dataset.defaults        || '[]');
    daysList            = JSON.parse(daysTagsContainer.dataset.defaults        || '[]');
    slotsList           = JSON.parse(slotsTagsContainer.dataset.defaults       || '[]');
    subjectFacultyMap   = JSON.parse(facultyCardsContainer.dataset.mapping     || '{}');
    facultyAvailability = JSON.parse(facultyCardsContainer.dataset.availability || '{}');
    subjectHours        = JSON.parse(subjectsContainer.dataset.hours           || '{}');
    maxLecturesPerDay   = 2;
    if (maxDailyVal) maxDailyVal.textContent = '2';

    renderFacultyCards();
    renderSubjects();
    renderDaysTags();
    renderSlotsTags();
    updateCapacitySummary();
    setWorkflowStep(1);
  }

  resetBtn && resetBtn.addEventListener('click', () => {
    showConfirm(
      'Reset Configuration',
      'Reset all settings to their default values? Any custom changes will be lost.',
      () => {
        resetDefaults();
        showToast('Reset to default configuration.', 'info');
      },
      '🔄',
      'Reset'
    );
  });

  // ===========================================================================
  // 19. INITIALIZATION
  // ===========================================================================
  function init() {
    resetDefaults();
    navigateTo('page-configure');
  }

  init();

}); // DOMContentLoaded
