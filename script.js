/* ============================================================
   SkillSwap — Community Skill Exchange & Learning Network
   Single script shared by every page. Data lives in localStorage.
   Pages call the render function matching document.body.dataset.page.
   ============================================================ */

const DB = {
  profile: 'ske_profile',
  members: 'ske_members',
  teach: 'ske_teach',
  learn: 'ske_learn',
  goals: 'ske_goals',
  activities: 'ske_activities',
};

const CATEGORIES = ['Programming', 'Design', 'Communication', 'Media', 'Marketing', 'Music', 'Language', 'Business', 'Data & Analytics', 'Lifestyle'];

/* ---------- storage helpers ---------- */

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error('Could not save data', e); }
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

function addDays(iso, days) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ---------- seed data (first run only) ---------- */

function seedIfEmpty() {
  if (!localStorage.getItem(DB.profile)) {
    save(DB.profile, {
      name: 'Guest Learner',
      education: 'B.Tech, Computer Science',
      college: '',
      interests: 'Web development, Design, Communication',
      bio: 'Curious about design and always happy to trade a coding lesson for one.',
      joined: todayISO(),
    });
  }
  if (!load(DB.teach, null)) {
    save(DB.teach, [
      { id: 1, name: 'Python Programming', category: 'Programming', level: 'Advanced' },
      { id: 2, name: 'Public Speaking', category: 'Communication', level: 'Intermediate' },
    ]);
  }
  if (!load(DB.learn, null)) {
    save(DB.learn, [
      { id: 1, name: 'Graphic Design', category: 'Design', priority: 'High' },
      { id: 2, name: 'Video Editing', category: 'Media', priority: 'Medium' },
    ]);
  }
  if (!load(DB.members, null)) {
    save(DB.members, [
      { id: 1, name: 'Meera Iyer', role: 'UI Design student', teach: ['Graphic Design', 'UI Design'], learn: ['Python Programming', 'Public Speaking'] },
      { id: 2, name: 'Arjun Nair', role: 'Media & Journalism', teach: ['Video Editing', 'Photography'], learn: ['Content Writing', 'Public Speaking'] },
      { id: 3, name: 'Divya Krishnan', role: 'Marketing intern', teach: ['Digital Marketing', 'Content Writing'], learn: ['Graphic Design'] },
      { id: 4, name: 'Rohan Verma', role: 'Music production hobbyist', teach: ['Guitar', 'Music Production'], learn: ['Python Programming'] },
      { id: 5, name: 'Sneha Pillai', role: 'Language enthusiast', teach: ['Spanish Language', 'Content Writing'], learn: ['Video Editing'] },
      { id: 6, name: 'Kabir Malhotra', role: 'Business student', teach: ['Public Speaking', 'Business Strategy'], learn: ['Graphic Design', 'Digital Marketing'] },
      { id: 7, name: 'Ananya Das', role: 'Data analyst in training', teach: ['Python Programming', 'Data Analysis'], learn: ['Music Production'] },
      { id: 8, name: 'Farhan Sheikh', role: 'Photography club lead', teach: ['Photography', 'Video Editing'], learn: ['Public Speaking'] },
    ]);
  }
  if (!load(DB.goals, null)) {
    const t = todayISO();
    save(DB.goals, [
      { id: 1, title: 'Learn the fundamentals of Graphic Design', skill: 'Graphic Design', targetDate: addDays(t, 21), progress: 40, status: 'active' },
      { id: 2, title: 'Get comfortable editing short videos', skill: 'Video Editing', targetDate: addDays(t, 35), progress: 10, status: 'active' },
    ]);
  }
  if (!load(DB.activities, null)) {
    const t = todayISO();
    save(DB.activities, [
      { id: 1, type: 'taught', skill: 'Python Programming', partner: 'Ananya Das', date: addDays(t, -6), minutes: 45, notes: 'Covered loops and functions.' },
      { id: 2, type: 'learned', skill: 'Graphic Design', partner: 'Meera Iyer', date: addDays(t, -2), minutes: 60, notes: 'Intro to layout and colour theory.' },
      { id: 3, type: 'taught', skill: 'Public Speaking', partner: 'Kabir Malhotra', date: addDays(t, -1), minutes: 30, notes: 'Practised a 3-minute pitch.' },
      { id: 4, type: 'learned', skill: 'Graphic Design', partner: 'Meera Iyer', date: t, minutes: 40, notes: 'Worked on a poster draft together.' },
    ]);
  }
}

/* ---------- toast ---------- */

let toastTimer = null;
function showToast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- nav toggle ---------- */

function wireNavToggle() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
}

/* ---------- derived data ---------- */

function getProfile() { return load(DB.profile, {}); }
function getMembers() { return load(DB.members, []); }
function getTeach() { return load(DB.teach, []); }
function getLearn() { return load(DB.learn, []); }
function getGoals() { return load(DB.goals, []); }
function getActivities() { return load(DB.activities, []); }

function teachNames() { return getTeach().map(s => s.name); }
function learnNames() { return getLearn().map(s => s.name); }

function recommendedPartners(limit) {
  const myTeach = teachNames();
  const myLearn = learnNames();
  const scored = getMembers().map(m => {
    const canTeachMe = m.teach.filter(s => myLearn.includes(s));
    const wantsFromMe = m.learn.filter(s => myTeach.includes(s));
    return { member: m, canTeachMe, wantsFromMe, score: canTeachMe.length + wantsFromMe.length };
  }).filter(x => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return limit ? scored.slice(0, limit) : scored;
}

function currentStreak() {
  const dates = [...new Set(getActivities().map(a => a.date))].sort();
  if (dates.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const cur = new Date(dates[i] + 'T00:00:00');
    const diff = Math.round((cur - prev) / 86400000);
    run = diff === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const last = dates[dates.length - 1];
  const gap = Math.round((new Date(todayISO() + 'T00:00:00') - new Date(last + 'T00:00:00')) / 86400000);
  return gap <= 1 ? run : 0;
}

function achievementsList() {
  const teach = getTeach(), learn = getLearn(), goals = getGoals(), acts = getActivities();
  const taughtCount = acts.filter(a => a.type === 'taught').length;
  const learnedCount = acts.filter(a => a.type === 'learned').length;
  const doneGoals = goals.filter(g => g.status === 'done').length;
  const partners = new Set(acts.map(a => a.partner).filter(Boolean)).size;
  const streak = currentStreak();
  return [
    { icon: '🌱', name: 'First Steps', desc: 'List your first skill', earned: (teach.length + learn.length) > 0 },
    { icon: '🧑‍🏫', name: 'Knowledge Sharer', desc: 'Log 3 taught sessions', earned: taughtCount >= 3 },
    { icon: '📘', name: 'Eager Learner', desc: 'Log 3 learned sessions', earned: learnedCount >= 3 },
    { icon: '🏁', name: 'Goal Getter', desc: 'Complete a learning goal', earned: doneGoals >= 1 },
    { icon: '🔥', name: 'Consistent Learner', desc: 'Reach a 3-day streak', earned: streak >= 3 },
    { icon: '🤝', name: 'Community Builder', desc: 'Connect with 3+ partners', earned: partners >= 3 },
  ];
}

/* ==========================================================
   DASHBOARD (index.html)
   ========================================================== */

function renderDashboard() {
  const teach = getTeach(), learn = getLearn(), goals = getGoals();
  setText('stat-teach', teach.length);
  setText('stat-learn', learn.length);
  setText('stat-goals', goals.filter(g => g.status === 'active').length);
  setText('stat-streak', currentStreak());
  setText('stat-streak-sub', currentStreak() > 0 ? 'Keep it going' : 'Log a session to start one');
  setText('stat-teach-mini', teach.length);
  setText('stat-learn-mini', learn.length);
  setText('stat-goals-mini', goals.filter(g => g.status === 'active').length);

  const feed = document.getElementById('activity-feed');
  if (feed) {
    const items = [...getActivities()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    feed.innerHTML = items.length ? items.map(a => `
      <li class="${a.type}">
        <span class="activity-dot"></span>
        <div>
          <div>${a.type === 'taught' ? 'You taught' : 'You learned'} <strong>${escapeHTML(a.skill)}</strong>${a.partner ? ' with ' + escapeHTML(a.partner) : ''}</div>
          <div class="activity-time">${formatDate(a.date)} · ${a.minutes} min</div>
        </div>
      </li>
    `).join('') : '<li>No sessions logged yet — visit Activity to add one.</li>';
  }

  const partnersEl = document.getElementById('dash-partners');
  if (partnersEl) {
    const top = recommendedPartners(3);
    partnersEl.innerHTML = top.length ? top.map(renderMemberCard).join('') :
      '<p class="form-note">Add a few skills you teach and want to learn to see matches here.</p>';
  }
}

/* ==========================================================
   PROFILE (profile.html)
   ========================================================== */

function renderProfile() {
  const p = getProfile();
  setVal('p-name', p.name);
  setVal('p-college', p.college);
  setVal('p-education', p.education);
  setVal('p-interests', p.interests);
  setVal('p-bio', p.bio);
  setText('p-joined', formatDate(p.joined));
  setText('p-teach-count', getTeach().length);
  setText('p-learn-count', getLearn().length);
  setText('p-sessions-count', getActivities().length);

  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const updated = {
        ...p,
        name: document.getElementById('p-name').value.trim() || 'Guest Learner',
        college: document.getElementById('p-college').value.trim(),
        education: document.getElementById('p-education').value.trim(),
        interests: document.getElementById('p-interests').value.trim(),
        bio: document.getElementById('p-bio').value.trim(),
      };
      save(DB.profile, updated);
      showToast('Profile saved');
    });
  }
}

/* ==========================================================
   SKILLS (skills.html) — manage + discover + match
   ========================================================== */

function renderSkills() {
  populateCategorySelects();

  const teachForm = document.getElementById('teach-form');
  if (teachForm) {
    teachForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('t-name').value.trim();
      if (!name) return;
      const list = getTeach();
      list.push({
        id: nextId(list), name,
        category: document.getElementById('t-category').value,
        level: document.getElementById('t-level').value,
      });
      save(DB.teach, list);
      teachForm.reset();
      showToast(`Added "${name}" to skills you teach`);
      paintTeachList();
      paintDiscovery();
    });
  }

  const learnForm = document.getElementById('learn-form');
  if (learnForm) {
    learnForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('l-name').value.trim();
      if (!name) return;
      const list = getLearn();
      list.push({
        id: nextId(list), name,
        category: document.getElementById('l-category').value,
        priority: document.getElementById('l-priority').value,
      });
      save(DB.learn, list);
      learnForm.reset();
      showToast(`Added "${name}" to skills you want to learn`);
      paintLearnList();
      paintDiscovery();
    });
  }

  paintTeachList();
  paintLearnList();
  paintDiscovery();

  const search = document.getElementById('discover-search');
  const catFilter = document.getElementById('discover-category');
  if (search) search.addEventListener('input', paintDiscovery);
  if (catFilter) catFilter.addEventListener('change', paintDiscovery);
}

function populateCategorySelects() {
  ['t-category', 'l-category'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.options.length === 0) {
      el.innerHTML = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  });
  const filter = document.getElementById('discover-category');
  if (filter && filter.options.length <= 1) {
    filter.innerHTML = '<option value="">All categories</option>' + CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  }
}

function paintTeachList() {
  const ul = document.getElementById('teach-list');
  if (!ul) return;
  const list = getTeach();
  ul.innerHTML = list.length ? list.map(s => `
    <li class="skill-row">
      <div><div class="s-name">${escapeHTML(s.name)}</div><div class="s-meta">${escapeHTML(s.category)} · ${escapeHTML(s.level)}</div></div>
      <button class="btn btn-danger btn-sm" onclick="removeSkill('teach', ${s.id})">Remove</button>
    </li>
  `).join('') : '<li class="empty"><p>You haven\'t listed anything to teach yet.</p></li>';
}

function paintLearnList() {
  const ul = document.getElementById('learn-list');
  if (!ul) return;
  const list = getLearn();
  ul.innerHTML = list.length ? list.map(s => `
    <li class="skill-row">
      <div><div class="s-name">${escapeHTML(s.name)}</div><div class="s-meta">${escapeHTML(s.category)} · ${escapeHTML(s.priority)} priority</div></div>
      <button class="btn btn-danger btn-sm" onclick="removeSkill('learn', ${s.id})">Remove</button>
    </li>
  `).join('') : '<li class="empty"><p>Nothing on your wishlist yet.</p></li>';
}

function removeSkill(kind, id) {
  const key = kind === 'teach' ? DB.teach : DB.learn;
  const list = load(key, []).filter(s => s.id !== id);
  save(key, list);
  showToast('Removed');
  if (kind === 'teach') paintTeachList(); else paintLearnList();
  paintDiscovery();
}

function renderMemberCard(entry) {
  const m = entry.member;
  const initials = m.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const teachTags = entry.canTeachMe.map(s => `<span class="tag tag-teach">${escapeHTML(s)}</span>`).join('');
  const learnTags = entry.wantsFromMe.map(s => `<span class="tag tag-learn">${escapeHTML(s)}</span>`).join('');
  return `
    <div class="pin-card member-card pin-teal">
      <div class="member-top">
        <div class="avatar">${initials}</div>
        <div><div class="member-name">${escapeHTML(m.name)}</div><div class="member-role">${escapeHTML(m.role)}</div></div>
        <div class="match-score">${entry.score} match${entry.score === 1 ? '' : 'es'}</div>
      </div>
      ${teachTags ? `<div class="section-label">Can teach you</div><div class="tag-row">${teachTags}</div>` : ''}
      ${learnTags ? `<div class="section-label">Wants to learn from you</div><div class="tag-row">${learnTags}</div>` : ''}
      <div class="goal-actions">
        <button class="btn btn-amber btn-sm" onclick="addGoalFromMember(${m.id})">Set a learning goal</button>
      </div>
    </div>
  `;
}

function paintDiscovery() {
  const grid = document.getElementById('discovery-grid');
  if (!grid) return;
  const q = (document.getElementById('discover-search')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('discover-category')?.value || '';

  const members = getMembers().filter(m => {
    const haystack = (m.name + ' ' + m.teach.join(' ') + ' ' + m.learn.join(' ')).toLowerCase();
    const matchesQ = !q || haystack.includes(q);
    const matchesCat = !cat || CATEGORY_MAP[m.teach[0]] === cat || m.teach.some(s => CATEGORY_MAP[s] === cat) || m.learn.some(s => CATEGORY_MAP[s] === cat);
    return matchesQ && matchesCat;
  });

  const count = document.getElementById('discover-count');
  if (count) count.textContent = `${members.length} member${members.length === 1 ? '' : 's'}`;

  if (members.length === 0) {
    grid.innerHTML = `<div class="empty"><div class="empty-mark">🔍</div><p>No members match your search.</p></div>`;
    return;
  }

  const myTeach = teachNames();
  const myLearn = learnNames();
  grid.innerHTML = members.map(m => {
    const canTeachMe = m.teach.filter(s => myLearn.includes(s));
    const wantsFromMe = m.learn.filter(s => myTeach.includes(s));
    return renderMemberCard({ member: m, canTeachMe, wantsFromMe, score: canTeachMe.length + wantsFromMe.length });
  }).join('');
}

function addGoalFromMember(memberId) {
  const m = getMembers().find(x => x.id === memberId);
  if (!m) return;
  const myLearn = learnNames();
  const skill = m.teach.find(s => myLearn.includes(s)) || m.teach[0] || 'a new skill';
  const goals = getGoals();
  goals.push({
    id: nextId(goals),
    title: `Learn ${skill} from ${m.name}`,
    skill, targetDate: addDays(todayISO(), 30), progress: 0, status: 'active',
  });
  save(DB.goals, goals);
  showToast(`Goal added: learn ${skill} from ${m.name}`);
}

/* crude skill → category lookup, used only for the discovery filter */
const CATEGORY_MAP = {
  'Graphic Design': 'Design', 'UI Design': 'Design',
  'Video Editing': 'Media', 'Photography': 'Media',
  'Digital Marketing': 'Marketing', 'Content Writing': 'Marketing',
  'Guitar': 'Music', 'Music Production': 'Music',
  'Spanish Language': 'Language',
  'Public Speaking': 'Communication', 'Business Strategy': 'Business',
  'Python Programming': 'Programming', 'Data Analysis': 'Data & Analytics',
};

/* ==========================================================
   GOALS (goals.html)
   ========================================================== */

function renderGoals() {
  const form = document.getElementById('goal-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('g-title').value.trim();
      const skill = document.getElementById('g-skill').value.trim();
      const target = document.getElementById('g-target').value;
      if (!title) return;
      const goals = getGoals();
      goals.push({ id: nextId(goals), title, skill, targetDate: target || addDays(todayISO(), 30), progress: 0, status: 'active' });
      save(DB.goals, goals);
      form.reset();
      showToast('Learning goal added');
      paintGoals();
      paintAchievements();
    });
  }
  paintGoals();
  paintAchievements();
}

function paintGoals() {
  const grid = document.getElementById('goals-grid');
  if (!grid) return;
  const goals = [...getGoals()].sort((a, b) => (a.status === b.status ? a.targetDate.localeCompare(b.targetDate) : a.status === 'active' ? -1 : 1));

  if (goals.length === 0) {
    grid.innerHTML = `<div class="empty"><div class="empty-mark">🎯</div><p>No learning goals yet — add one above.</p></div>`;
    return;
  }

  grid.innerHTML = goals.map(g => {
    const overdue = g.status === 'active' && g.targetDate < todayISO();
    return `
      <div class="pin-card goal-card ${g.status === 'done' ? 'pin-teal' : overdue ? 'pin-coral' : ''}">
        <div class="goal-top">
          <div>
            <div class="goal-title">${escapeHTML(g.title)}</div>
            <div class="goal-target">${g.status === 'done' ? 'Completed' : overdue ? 'Was due' : 'Target'} ${formatDate(g.targetDate)}</div>
          </div>
          <div class="goal-pct">${g.progress}%</div>
        </div>
        <div class="progress-track"><div class="progress-fill ${overdue ? 'due' : ''}" style="width:${g.progress}%"></div></div>
        <div class="goal-actions">
          ${g.status === 'active' ? `
            <button class="btn btn-outline btn-sm" onclick="bumpGoal(${g.id}, 10)">+10%</button>
            <button class="btn btn-teal btn-sm" onclick="completeGoal(${g.id})">Mark complete</button>
          ` : `<span class="badge badge-done">Done</span>`}
          <button class="btn btn-danger btn-sm" onclick="deleteGoal(${g.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function bumpGoal(id, delta) {
  const goals = getGoals();
  const g = goals.find(x => x.id === id);
  if (!g) return;
  g.progress = Math.min(100, g.progress + delta);
  if (g.progress >= 100) g.status = 'done';
  save(DB.goals, goals);
  paintGoals();
  paintAchievements();
}

function completeGoal(id) {
  const goals = getGoals();
  const g = goals.find(x => x.id === id);
  if (!g) return;
  g.status = 'done';
  g.progress = 100;
  save(DB.goals, goals);
  showToast('Goal marked complete');
  paintGoals();
  paintAchievements();
}

function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  save(DB.goals, getGoals().filter(g => g.id !== id));
  paintGoals();
  paintAchievements();
}

function paintAchievements() {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;
  grid.innerHTML = achievementsList().map(a => `
    <div class="achv ${a.earned ? 'earned' : ''}">
      <div class="achv-icon">${a.icon}</div>
      <div class="achv-name">${a.name}</div>
      <div class="achv-desc">${a.desc}</div>
    </div>
  `).join('');
}

/* ==========================================================
   ACTIVITY (activity.html) — logging, history, analytics, export
   ========================================================== */

function renderActivity() {
  const partnerSel = document.getElementById('a-partner');
  if (partnerSel) {
    const members = getMembers();
    partnerSel.innerHTML = '<option value="">No specific partner</option>' +
      members.map(m => `<option value="${escapeHTML(m.name)}">${escapeHTML(m.name)}</option>`).join('');
  }
  const dateInput = document.getElementById('a-date');
  if (dateInput && !dateInput.value) dateInput.value = todayISO();

  const form = document.getElementById('activity-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const skill = document.getElementById('a-skill').value.trim();
      if (!skill) return;
      const list = getActivities();
      list.push({
        id: nextId(list),
        type: document.getElementById('a-type').value,
        skill,
        partner: document.getElementById('a-partner').value,
        date: document.getElementById('a-date').value || todayISO(),
        minutes: Math.max(5, parseInt(document.getElementById('a-minutes').value, 10) || 30),
        notes: document.getElementById('a-notes').value.trim(),
      });
      save(DB.activities, list);
      form.reset();
      dateInput.value = todayISO();
      showToast('Session logged');
      paintHistory();
      paintAnalytics();
    });
  }

  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportSummary);

  paintHistory();
  paintAnalytics();
}

function paintHistory() {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;
  const list = [...getActivities()].sort((a, b) => b.date.localeCompare(a.date));

  const count = document.getElementById('history-count');
  if (count) count.textContent = `${list.length} session${list.length === 1 ? '' : 's'} logged`;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-mark">📝</div><p>No sessions logged yet.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(a => `
    <tr>
      <td>${a.type === 'taught' ? '<span class="badge badge-taught">Taught</span>' : '<span class="badge badge-learned">Learned</span>'}</td>
      <td><span class="cell-title">${escapeHTML(a.skill)}</span></td>
      <td>${escapeHTML(a.partner || '—')}</td>
      <td>${formatDate(a.date)}</td>
      <td>${a.minutes} min</td>
      <td class="cell-sub">${escapeHTML(a.notes || '—')}</td>
    </tr>
  `).join('');
}

function paintAnalytics() {
  const acts = getActivities();
  setText('an-total', acts.length);
  const totalMin = acts.reduce((s, a) => s + a.minutes, 0);
  setText('an-hours', Math.round((totalMin / 60) * 10) / 10);
  setText('an-streak', currentStreak());

  const weekAgo = addDays(todayISO(), -7);
  setText('an-week', acts.filter(a => a.date >= weekAgo).length);

  const chart = document.getElementById('category-chart');
  if (chart) {
    const counts = {};
    acts.forEach(a => {
      const cat = CATEGORY_MAP[a.skill] || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = entries.length ? entries[0][1] : 1;
    chart.innerHTML = entries.length ? entries.map(([cat, n]) => `
      <div class="bar-row">
        <div class="bar-label">${escapeHTML(cat)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(n / max) * 100}%"></div></div>
        <div class="bar-count">${n}</div>
      </div>
    `).join('') : '<p class="form-note">Log a session to see your activity by category.</p>';
  }
}

function exportSummary() {
  const p = getProfile();
  const lines = [];
  lines.push('SKILLSWAP — LEARNING RECORD');
  lines.push('Exported ' + formatDate(todayISO()));
  lines.push('');
  lines.push('PROFILE');
  lines.push(`Name: ${p.name || '—'}`);
  lines.push(`Education: ${p.education || '—'}`);
  lines.push(`College: ${p.college || '—'}`);
  lines.push(`Interests: ${p.interests || '—'}`);
  lines.push('');
  lines.push('SKILLS I TEACH');
  getTeach().forEach(s => lines.push(`- ${s.name} (${s.category}, ${s.level})`));
  lines.push('');
  lines.push('SKILLS I WANT TO LEARN');
  getLearn().forEach(s => lines.push(`- ${s.name} (${s.category}, ${s.priority} priority)`));
  lines.push('');
  lines.push('LEARNING GOALS');
  getGoals().forEach(g => lines.push(`- [${g.status === 'done' ? 'done' : g.progress + '%'}] ${g.title} — target ${formatDate(g.targetDate)}`));
  lines.push('');
  lines.push('ACHIEVEMENTS');
  achievementsList().filter(a => a.earned).forEach(a => lines.push(`- ${a.name}`));
  lines.push('');
  lines.push('ACTIVITY HISTORY');
  [...getActivities()].sort((a, b) => a.date.localeCompare(b.date)).forEach(a => {
    lines.push(`- ${formatDate(a.date)} · ${a.type} · ${a.skill}${a.partner ? ' with ' + a.partner : ''} · ${a.minutes} min`);
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'skillswap-learning-record.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Summary downloaded');
}

/* ---------- misc ---------- */

function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function setVal(id, value) { const el = document.getElementById(id); if (el) el.value = value || ''; }

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- boot ---------- */

document.addEventListener('DOMContentLoaded', () => {
  seedIfEmpty();
  wireNavToggle();

  const page = document.body.dataset.page;
  if (page === 'dashboard') renderDashboard();
  if (page === 'profile') renderProfile();
  if (page === 'skills') renderSkills();
  if (page === 'goals') renderGoals();
  if (page === 'activity') renderActivity();
});
