# SkillSwap — Community Skill Exchange & Learning Network

A self-contained website for discovering learning partners and tracking
skill exchange, built with plain **HTML, CSS and JavaScript** — no
frameworks, no build step, no Bootstrap or jQuery. Open `index.html` in a
browser and it works.

## Pages

| File            | Purpose                                                                 |
|-------------------|--------------------------------------------------------------------------|
| `index.html`     | Dashboard — key stats, recommended learning partners, recent activity. |
| `profile.html`   | Profile — personal & academic details, interests, a personal snapshot. |
| `skills.html`    | Skills — manage what you teach/want to learn, and discover & match with community members. |
| `goals.html`     | Goals — set learning goals, track progress, and view unlocked achievements. |
| `activity.html`  | Activity — log teaching/learning sessions, view history, simple analytics, and export your learning record. |

All pages share one stylesheet (`style.css`) and one script (`script.js`).

## How data is stored

There's no backend or database. Everything — your profile, skills, goals,
activity log, and the seeded community directory — is kept in the
browser's `localStorage`, under these keys:

- `ske_profile`
- `ske_members` (the sample community used for matching/discovery)
- `ske_teach` / `ske_learn` (your own skills)
- `ske_goals`
- `ske_activities`

The first time you open the site, `script.js` seeds a sample profile, a
community of members with varied skills, a couple of goals and a few
logged sessions, so every page has something to show. After that, changes
you make are saved automatically and persist between visits **in the same
browser on the same device**.

## Features

- **Profile management** — personal & academic details, interests, bio.
- **Skill management** — add/remove skills you teach (with category and
  level) and skills you want to learn (with category and priority).
- **Skill discovery & matching** — browse the seeded community, search and
  filter by category, and see a match score based on skill overlap
  (who can teach you, and who wants to learn from you). One click turns a
  match into a learning goal.
- **Learning goals** — create goals with a target date, bump progress,
  mark complete, or delete.
- **Achievement system** — six badges that unlock automatically based on
  your skills, sessions, streak and completed goals.
- **Activity tracking & analytics** — log taught/learned sessions with a
  partner, duration and notes; view history, weekly count, total hours,
  current streak, and a simple bar breakdown by category.
- **Data export** — download a plain-text learning record summarising your
  profile, skills, goals, achievements and full session history.

## File structure

```
skill-exchange-network/
├── index.html
├── profile.html
├── skills.html
├── goals.html
├── activity.html
├── style.css
├── script.js
└── README.md
```

## Notes for customising

- The seeded community and the skill→category lookup used for filtering
  and analytics live near the top of `script.js` (`CATEGORY_MAP` and the
  `ske_members` seed inside `seedIfEmpty`) — edit these to change the
  sample data.
- Achievement thresholds are defined in `achievementsList()` in
  `script.js`.
- To reset all data, clear the `ske_*` keys from the browser's
  localStorage (or clear site data) and reload.
- Colours, fonts and spacing are all defined as CSS variables at the top
  of `style.css` under `:root`.
