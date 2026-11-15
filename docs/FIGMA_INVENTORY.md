# OSH Audit Pro — Figma Inventory

**Source:** https://throb-cipher-27889872.figma.site/  
**Original design link:** https://www.figma.com/make/6IZqAHTqqr89g25jIRRkJd/OSH-Audit-Pro-Design-Prototype?fullscreen=1  
**Inspected:** 5 November 2026  
**Source type:** published Figma Make application. The original Figma file is not readable without a Figma login; the published app is the visual/UX reference used for this inventory.

> The published app is a single-page React prototype. It keeps `/` in the address bar and changes screens through local UI state, so the routes below are the **MVP routes required by the prompt**, not routes that exist in the prototype. All `Implemented` values are `N` because implementation has not started yet.

## 1. Screen inventory

| Screen | Route | Components used | States | Implemented (Y/N) |
|---|---|---|---|---|
| Login | `/login` | Not present in Figma. Planned: app brand panel, auth card, email/password fields, submit button, links to register/reset, error alert. | Not in Figma. To build: idle, invalid, pending, server error, success. | N |
| Register | `/register` | Not present in Figma. Planned: auth card, name/email/password fields, terms note, submit, links. | Not in Figma. To build: idle, invalid, pending, server error, success. | N |
| Reset password | `/reset-password` | Not present in Figma. Planned: auth card, email field, submit, confirmation state. | Not in Figma. To build: idle, invalid, pending, sent, error. | N |
| Dashboard | `/` | App shell, sidebar, org switcher, top bar, global search, notification/help/profile controls, page header, quick actions (`New audit`, `Register company`, `Add workplace`, `Generate report`), 4 stat cards, risk-distribution donut, monthly-performance bars, corrective-action completion card, recent-audits table, `View all`. | Static loaded state only. No loading, empty, error, org-switch or permission states. | N |
| Companies | `/companies` | App shell, page header, `Add company`, search box, `All industries` and `Active` filters, company card grid, company initials/logo, industry, status chip, workplace/audit counters, last audit date, `View company profile`. | Static loaded state only. Filters/search have no observable behaviour. `Add company` has no modal. No empty/loading/error states. | N |
| Workplaces | `/companies/:id/workplaces` | App shell, page header, `Add workplace`, search, industry/status filters, workplace card grid, company/location line, open-findings count, audit count, last audit, `View workplace profile`. | Static loaded state only. `Add workplace` has no modal. Clicking a workplace opens the audit wizard, not a workplace profile. No empty/loading/error states. | N |
| Audits list + filters | `/audits` | Not present in Figma. Planned: app shell, page header, status/company/date filters, audit table or cards, empty state, pagination. | Not in Figma. To build: loaded, filtered empty, loading, error, permission states. | N |
| Audit create | `/audits/new` | 5-step wizard: step indicator (`Select company`, `Select workplace`, `Audit type`, `Details`, `Photographs`), choice cards with selected tick, audit-details form grid, upload drop zone, `Back` / `Continue`, `Save draft`, `Continue to upload`. | Steps 1–5, selected/unselected choices, completed-step ticks. No validation errors, no disabled continue, no pending state. | N |
| Inspection photographs / audit detail | `/audits/:id` | Page header, `Analyse photographs with AI`, upload drop zone, uploaded-photo count, `Select all`, 6 photo cards with check mark/number/name/caption, sticky footer `6 photographs ready`, `Captions saved automatically`. | Static loaded gallery. No per-file progress, cancel, delete, retry, upload error, empty gallery or selection-disabled state. | N |
| Findings editor | `/audits/:id/findings` | `Risk assessment review` header, `Save draft`, `Approve findings`, review meta card (audit/company/workplace/findings count), findings table toolbar, `Add row`, four headings `Section in the Workplace`, `Risk Level`, `Identified Hazards`, `Recommended Control Measures`, drag handle, 3 rows, row `•••`, `All findings reviewed` approval bar, `Continue to report`. | Static reviewed state. Cells are not editable, `Add row` has no handler, row menu has no handler, no status chips, no photo links, no validation, no empty table, no unreviewed-block state. | N |
| AI findings review | `/audits/:id/findings` (AI panel) | `AI photograph analysis` header, `AI analysis complete` chip, photo viewer with zoom controls, thumbnail strip, filename/caption, AI finding panel, `AI-generated finding`, `Requires review`, fields for Workplace section / Risk level / Identified hazard / Recommended control measures, AI disclaimer, `Edit finding`, `Reject`, `Accept finding`, sticky progress bar `0 of 6 findings reviewed`, `Review assessment`. | Complete + one accepted local state. Accept happens immediately with no confirmation. Edit and Reject have no handler. No loading, job progress, failure, retry, confidence indicator or rejected state. | N |
| Review and approval | `/audits/:id/review` | Not a separate screen in Figma. `Risk assessment review` is the closest screen: review meta, findings table, `Approve findings`, approval bar. No comments, request-changes, reviewer identity or role-specific controls. | Static approved-ready state. No pending review, approved, changes-requested or permission-denied states. | N |
| Report setup | `/audits/:id/report` | `Generate audit report` header, `Preview report`, report configuration card (company, workplace, audit type, date, auditor, approved findings, photographs, report language), template card (`Risk Assessment Audit — Version 1`, active template), miniature document preview, `Save report`, `Generate PDF`, `Generate Word report`. | Static ready state. No blocked/disabled state for unverified findings, no generating state, no failure state, no version history. | N |
| Report preview | `/audits/:id/report` (preview) | `Report preview` header, `Download PDF`, `Download Word`, page counter, zoom controls, `Edit findings`, document page with brand block, title, company/workplace/date meta, four-column table, `PHOTOGRAPHIC ILLUSTRATIONS`, two-column photo grid, figure captions, page number. | Static loaded state. Photos use `object-fit: cover` and fixed 150px height (cropping). Headers are shortened (`Section`, `Risk`, `Identified hazard`, `Recommended control`). No loading/error/generating states. | N |
| Report library and version history | `/reports` | Figma shows a placeholder module: page header, `Add new`, empty-feature card with icon, `Reports workspace`, explanatory copy, `Open module`. | Placeholder only. No list, versions, timestamps or downloads. | N |
| Corrective actions list + detail | `/actions`, `/actions/:id` | Page header, `Export action register`, 4 stat cards (total/open/overdue/completed), action detail card, risk badge, status chip, 5-step timeline, recommended control, responsible person, deadline, verification owner, evidence upload, `Browse files`. | Static detail state. No list, filters, assign/edit controls, status transition, empty, loading or error states. | N |
| Team and roles | `/team` | Figma shows a placeholder module: page header, `Add new`, empty-feature card with users icon, `Team workspace`, explanatory copy, `Open module`. | Placeholder only. No members, roles, invitations or permissions UI. | N |
| 403 | `/403` | Not present in Figma. Planned: error layout, status code, explanation, return-to-dashboard action. | Not in Figma. | N |
| 404 | `*` | Not present in Figma. Planned: error layout, status code, explanation, return-to-dashboard action. | Not in Figma. | N |
| Session expired | `/session-expired` | Not present in Figma. Planned: auth error layout, re-authentication action. | Not in Figma. | N |

### Figma-only screens (not MVP scope)

| Screen | Route proposal | Components used | States | Implemented (Y/N) |
|---|---|---|---|---|
| Analytics | `/analytics` | Executive stat cards, risk-by-workplace chart, top-five workplace ranking, most-common-hazards ranking, recommendations table, `Generate consolidated summary`. | Static loaded. | N — out of scope |
| System administration | `/admin` | Platform-health banner, organization/user/AI-job/report counters, service health list, AI processing jobs, audit activity log, `Export log`. | Static loaded. | N — out of scope |
| Settings | `/settings` | Placeholder empty-feature module. | Placeholder. | N — out of scope |

## 2. Component inventory

| Component | Used on | Variants / states observed | Notes |
|---|---|---|---|
| Sidebar | Every app screen | Desktop fixed 255px; mobile drawer with scrim | Dark green `#0B493D`; white active pill; sections `SECTION A · APPLICATION` and `SECTION C · OPERATIONS`. No desktop collapse control. |
| Brand lockup | Sidebar, report document | Green mark, product name, tagline | `O` mark + `OSH Audit Pro` + `Smart Workplace Safety Auditing`. |
| Organization switcher | Sidebar | Visual static card with chevron | Not interactive in prototype. Shows `Apex Safety Group`. |
| Sidebar user | Sidebar | Avatar, name, role, overflow button | `Grace Wanjiku`, `Lead Auditor`; overflow button has no menu. |
| Top bar | Every app screen | Search, notification, help, avatar | Sticky white bar, 66px desktop / 58px mobile. Search is decorative. |
| Global search | Top bar | Search icon, placeholder, `⌘ K` | No results panel or shortcut handler. |
| Mobile navigation | Screens ≤760px | Home, Audits, Upload, Reports, Settings | Bottom fixed nav; sidebar becomes drawer. |
| Page header | Every screen | Eyebrow, title, subtitle, actions | Eyebrow uppercase green; title 27px. |
| Buttons | Everywhere | Primary, secondary, ghost, icon, disabled (not shown) | 38px min height, 9px radius, 12px text. No visible focus ring in CSS. |
| Stat card | Dashboard, Corrective actions, Analytics, Admin | Default, danger icon | White card, 14px radius, 27px value. |
| Chart card | Dashboard | Risk donut, monthly bars | Donut uses conic-gradient; bars are static. |
| Progress card | Dashboard | Completion percentage, split labels | Static. |
| Data table | Dashboard, Findings, Report document, Analytics | Header, body, scroll wrapper | Header 9px uppercase; rows 11px. |
| Status chip | Throughout | success, warning, info, high, medium, low, neutral | Risk chips in prototype do **not** use the prompt's exact risk colours. |
| Risk badge | Dashboard legend, findings table, AI panel, report document | HIGH/MEDIUM/LOW | Text plus colour. Needs centralised exact mapping. |
| Company card | Companies | Initials, name, industry, status, counters, last audit, profile link | Whole card is a button; click opens Workplaces list. |
| Workplace card | Workplaces | Initials, name, company/location, status, findings/audits, last audit | Whole card is a button; click opens audit wizard. |
| Empty-feature card | Reports, Team, Settings | Icon, title, copy, `Open module` | Placeholder pattern, not a true empty state. |
| Wizard step indicator | Audit create | Upcoming, active, completed | 5 steps; completed shows tick. |
| Choice card | Wizard steps 1–3 | Unselected, selected | Selected uses green border, soft-green glow, tick. |
| Form grid | Audit details | Two-column labels/inputs | No inline validation or help text. |
| Upload drop zone | Wizard step 5, Inspection photographs | Default, compact | Dashed border, icon, `Browse files`. Accepts `JPG, PNG or ZIP` in copy. |
| Photo card | Inspection photographs | Selected, unselected | Check badge, number, filename, caption. No delete/retry/progress. |
| Photo viewer | AI review | Zoom out/in, current thumbnail | Fixed single image; no gallery navigation wired. |
| AI finding panel | AI review | Unreviewed, accepted | Fields, `AI-generated finding`, `Requires review`, disclaimer, 3 actions. |
| Sticky action bar | AI review | Progress text, review action | Dark green bar. |
| Findings table | Findings editor | Static reviewed | `Add row`, drag handle and row menu are visual only. |
| Approval bar | Findings editor | Reviewed | Green confirmation bar + continue button. |
| Report configuration card | Report setup | Static data grid | 8 metadata pairs. |
| Template card | Report setup | Active template | Word-format template. |
| Document shell / page | Report setup, preview | Full, mini | 794px page, white, 52/55px padding; mini scale for setup. |
| Report table | Report preview | 4 columns | Shortened headers; risk chips. |
| Report photo grid | Report preview | Two columns | 335px columns, 150px `object-fit: cover` images. |
| Action detail card | Corrective actions | Static detail | Timeline, control, people, deadline, evidence. |
| Timeline | Corrective actions | 5 steps, completed steps | Static. |
| Evidence upload | Corrective actions | Dashed area, `Browse files` | No handler visible. |
| Admin health/jobs/activity | Admin | Static lists | Out of scope. |
| Analytics charts/lists | Analytics | Static lists and bars | Out of scope. |

## 3. State inventory

### Global states

| State | Present in Figma? | Notes |
|---|---|---|
| Default/loaded | Yes | Every screen is pre-populated with static demo data. |
| Loading | No | No spinners, skeletons or pending buttons. |
| Empty | Only placeholder modules | Reports/Team/Settings use an empty-feature card; real data lists have no empty states. |
| Error | No | No inline errors, error pages, retry states or toast/alert patterns. |
| Success | Partial | Static success chips (`All findings reviewed`, `AI analysis complete`, `All systems operational`). |
| Hover | Partial | Buttons, nav items and icon buttons have hover styles. |
| Focus | Not demonstrated | CSS has no `:focus-visible` rule; keyboard focus relies on browser defaults. |
| Disabled | Not demonstrated | No disabled button styles or disabled examples. |
| Selected | Yes | Wizard choice cards and photo selection check marks. |
| Modal/dialog | No | No dialogs; `Add company`, `Add workplace`, `Edit finding` and row menus do not open anything. |
| Toast/notification | No | Bell icon is decorative. |

### Screen-specific states observed

| Screen | Observed states | Missing states to build |
|---|---|---|
| Dashboard | Loaded; organization card; stat cards; charts; table | Loading, empty, error, org switching, role-specific quick actions |
| Companies | Loaded; search/filter controls; status variants (`Active`, `Audit due`) | Empty, loading, error, create/edit modal, validation |
| Workplaces | Loaded; status variants; open-findings count | Empty, loading, error, create/edit, company-scoped filtering |
| Audit create | Steps 1–5; selected company/workplace/type; completed-step ticks | Validation, disabled continue, draft save, upload progress/error/retry |
| Inspection photographs | Uploaded grid, selected photos, captions | Empty, upload progress, cancel, delete, retry, upload failure |
| AI review | Complete; unreviewed; accepted (local) | Loading/job progress, failure/retry, edit modal, reject state, confirmation, confidence/uncertainty |
| Findings editor | Reviewed table; approval-ready state | Inline edit, validation, add/remove, status chips, photo links, empty, unreviewed block |
| Report setup | Ready; active template; mini preview | Blocked/disabled, generating, failure, saved versions |
| Report preview | Loaded; zoom; page counter; two-column photos | Loading, error, no-photos, long-content pagination |
| Corrective actions | Loaded detail; stats; evidence upload | Empty list, list view, detail edit, assign, status transitions, upload progress/error |
| Analytics | Loaded | Out of scope |
| Admin | Loaded | Out of scope |
| Reports / Team / Settings | Placeholder module | Real list/detail/empty/loading/error states |

### Responsive states

| Breakpoint | Observed behaviour |
|---|---|
| Desktop (>1100px) | Fixed 255px sidebar, top bar, 4-column stats, 3-column dashboard grid, 2-column report layout, 2-column photo grid. |
| Tablet (≤1100px) | Dashboard 2 columns; report layout stacks; mini document preview hidden; stats/photo grid 2 columns; analysis layout stacks. |
| Mobile (≤760px) | Sidebar becomes off-canvas drawer with scrim; top bar shrinks; mobile bottom nav appears; stats 2 columns; page title 23px; report document zooms to 43%; tables scroll horizontally. |

## 4. User flows observed

1. **App entry** → Dashboard. No login, registration, reset-password, session-expiry or logout flow exists.
2. **Sidebar navigation** → Dashboard, Companies, Workplaces, Audits, AI Analysis, Reports, Corrective Actions, Analytics, Team, Settings, Admin. All screens change local state without changing the URL.
3. **Dashboard quick actions** → `New audit`, `Register company`, `Add workplace`, `Generate report`. Only `New audit` visibly navigates (to the audit wizard).
4. **Dashboard recent audits** → `Open audit` opens `Risk assessment review` for the first audit.
5. **Company card** → Workplaces list (not a company profile).
6. **Workplace card** → Create-audit wizard at step 1.
7. **Create audit flow** → Select company → select workplace → select audit type → audit details → photographs → `Continue to upload` → Inspection photographs.
8. **Inspection photographs** → `Analyse photographs with AI` → AI photograph analysis.
9. **AI review** → `Accept finding` immediately marks `Finding accepted` and increments review count. `Edit finding` and `Reject` are visual only. `Review assessment` goes to Risk assessment review.
10. **Risk assessment review** → `Approve findings` goes directly to Generate audit report; `Continue to report` does the same.
11. **Generate audit report** → `Preview report` opens Report preview.
12. **Report preview** → `Download PDF` / `Download Word` have no handlers; `Edit findings` has no handler.
13. **Corrective actions** → static detail page; no list-to-detail flow.
14. **Mobile** → hamburger opens drawer; scrim closes it; bottom nav switches main sections.

## 5. Required MVP screens missing from Figma

The following screens are required by the prompt but have no Figma frame:

- Login
- Register
- Reset password
- Audits list and filters
- Dedicated audit detail (the prototype has an inspection-photo screen but no audit summary/detail)
- Dedicated review/approval screen with reviewer decisions and request-changes
- Report library and version history
- Team and roles management
- 403
- 404
- Session expired
- Tenant-isolation / permission-denied states

The following required states are missing across nearly every screen:

- Loading, empty, error and success states
- Role-based hidden/disabled controls
- Form validation and pending-submit states
- Upload progress, cancel, retry and delete
- AI job progress, failure and retry
- Confirmation dialogs for AI acceptance
- Focus-visible and keyboard-dialog behaviour
- Organization switching and cache reset

## 6. Design observations for implementation

- The prototype is a Vite/React single-page app with local state, not a routed application.
- It uses plain CSS classes and CSS variables, not Tailwind or shadcn/ui. Tokens can be mapped directly into `src/design/tokens.ts` and `tailwind.config.ts`.
- Primary palette matches the prompt: `#126B58`, `#0B493D`, `#F8FAF9`, `#172B27`, `#E2E8E5`.
- Typography: Inter; body 14px/21px; page title 27px; compact labels 9–11px; buttons 12px.
- Radius: cards 14px; buttons 9px; choice cards 12px; chips 6px; avatars/icon buttons 50%.
- Shadow: `0 1px 2px #0f2d260a, 0 8px 26px #0f2d260d`.
- Layout: sidebar 255px; top bar 66px; main max-width 1600px with 30px/34px padding; grid gaps 14px.
- Figma risk chips use non-prompt colours for MEDIUM and LOW. The prompt's exact colours must override them.
- Figma report preview uses `object-fit: cover`; the prompt requires preserved aspect ratios, so the implementation will use `object-fit: contain` (or an explicit natural aspect-ratio box).
- Figma report headers are shortened; the implementation must use the four exact headings from the prompt.

## 7. Coverage summary

| Category | Figma coverage | Implementation status |
|---|---|---|
| App shell and navigation | Strong | Not built |
| Dashboard | Strong | Not built |
| Companies / workplaces lists | Strong visual, static behaviour | Not built |
| Audit creation wizard | Strong visual, incomplete behaviour | Not built |
| Photo upload | Visual only | Not built |
| AI review | Visual only | Not built |
| Findings table | Visual only | Not built |
| Report setup / preview | Visual only | Not built |
| Review / approval | Partial | Not built |
| Report library / versions | Placeholder | Not built |
| Corrective actions | Visual only | Not built |
| Team / roles | Placeholder | Not built |
| Auth | Missing | Not built |
| Error / permission screens | Missing | Not built |
| Loading / empty / error states | Missing | Not built |
| Responsive layouts | Good CSS coverage | Not built |
| Accessibility / focus states | Weak | Not built |
