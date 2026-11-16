# Decision Log

This file records every conflict between the Figma prototype, the prompt, and the practical constraints of the MVP. The rule used throughout is: **Figma controls layout, spacing, components and flow; the prompt controls business rules, exact headings and risk colours.**

## D-001 — Figma access method

- **Conflict:** The Figma Make share URL requires a Figma login and exposes no frames to an unauthenticated viewer.
- **Decision:** Use the published site `https://throb-cipher-27889872.figma.site/` as the visual/UX source. It is the same prototype but without the Figma editor chrome.
- **Consequence:** The inventory is based on the rendered application at desktop, tablet and mobile breakpoints. Editable frames, layer names and Figma component properties are not available.
- **Status:** Accepted.

## D-002 — Build tool

- **Conflict:** The project-plan architecture text mentions Next.js; the stack table and the prompt require Vite + React.
- **Decision:** Use **Vite + React 18 + TypeScript**. No Next.js.
- **Status:** Accepted.

## D-003 — Workspace organization vs client company

- **Conflict:** Figma shows `Apex Safety Group` as the active workspace organization, while `Greenfield Workplace Solutions` is shown as a client company. The prompt requires Greenfield as the demo organization and Riverside Safety Partners as a second tenant used only for isolation testing.
- **Decision:**
  - Active demo organization: **Greenfield Workplace Solutions Ltd.**
  - Second tenant: **Riverside Safety Partners**.
  - Client companies inside Greenfield: fictional names such as Apex Manufacturing Ltd., Kifaru Logistics Group and Mwangaza Food Industries.
  - No real client branding is used.
- **Consequence:** The sidebar organization switcher shows Greenfield by default; Riverside only appears for isolation tests and is never mixed with Greenfield data.
- **Status:** Accepted.

## D-004 — Missing authentication screens

- **Conflict:** Figma has no login, register or reset-password screens.
- **Decision:** Build the three auth screens using the existing design language (dark green brand panel, white card, Inter, 9px/14px radii, same focus and error patterns). Do not invent a second visual system.
- **Status:** Accepted; visual details will be documented when the auth screens are implemented.

## D-005 — Missing audits list

- **Conflict:** The `Audits` navigation item opens the create-audit wizard directly; there is no audits list or filters.
- **Decision:** Implement `/audits` as a proper list with status, company and date filters, styled after the Companies/Workplaces card and table patterns. Add a `New audit` action that opens the wizard.
- **Status:** Accepted.

## D-006 — Audit detail

- **Conflict:** Figma has an inspection-photograph screen but no audit overview/detail screen.
- **Decision:** Implement `/audits/:id` as the audit workspace containing summary metadata, tabs/links, photo gallery and upload. Keep the Figma inspection-photograph visual language.
- **Status:** Accepted.

## D-007 — Review and approval

- **Conflict:** Figma calls the screen `Risk assessment review` and gives it an `Approve findings` button. It has no reviewer role, no request-changes action and no approval/audit trail.
- **Decision:** Split the concepts:
  - `/audits/:id/findings` is the auditor's editable findings workspace.
  - `/audits/:id/review` is the reviewer's approval screen with approve and request-changes actions.
  - Auditors cannot approve; reviewers cannot edit findings.
- **Status:** Accepted.

## D-008 — Report library and versions

- **Conflict:** Figma's `Reports` screen is an empty placeholder.
- **Decision:** Build `/reports` as a report library with generated versions, timestamps, status and DOCX/PDF download controls. Use the Companies table/card visual language.
- **Status:** Accepted.

## D-009 — Team and roles

- **Conflict:** Figma's `Team` screen is an empty placeholder.
- **Decision:** Build `/team` as an admin-only team table with member, role, status and edit/invite controls. Roles: `admin`, `auditor`, `reviewer`, `viewer`.
- **Status:** Accepted.

## D-010 — Error and session screens

- **Conflict:** Figma has no 403, 404, permission-denied or session-expired screens.
- **Decision:** Add these screens using the same card, typography and button system. They must be reachable by real routing and not only by direct URL.
- **Status:** Accepted.

## D-011 — Analytics, Admin and Settings

- **Conflict:** Figma includes `Analytics` (executive dashboards), `Admin` (platform health, all organizations, AI jobs, audit log) and `Settings`. The prompt explicitly puts extensive analytics, billing/subscriptions and third-party integrations out of scope.
- **Decision:** Do **not** build Analytics or Admin. Do not expose them in the MVP navigation. Settings is not an MVP screen; organization/profile controls live in the org switcher and profile menu. This is a deliberate scope reduction, not an accidental omission.
- **Status:** Accepted; will be revisited only if the user expands scope.

## D-012 — AI wording and status

- **Conflict:** Figma says `AI-generated finding` and `Requires review`; the prompt requires the visible label **“AI suggestion, not verified”** until human acceptance/edit.
- **Decision:** Use the exact prompt label on every AI suggestion card and in the findings row status. Add `Needs verification` where a specific claim cannot be verified. Never auto-approve AI output.
- **Status:** Accepted.

## D-013 — AI acceptance confirmation

- **Conflict:** Figma's `Accept finding` immediately changes to `Finding accepted` with no confirmation.
- **Decision:** Accept must open a confirmation dialog that summarises the finding and makes clear that a human is verifying it. Only after confirmation does the row move to the table as `Verified`.
- **Status:** Accepted.

## D-014 — AI confidence/uncertainty

- **Conflict:** Figma has no confidence or uncertainty indicator.
- **Decision:** Add a confidence/uncertainty indicator to each AI suggestion. Show it as text plus a visual meter, with an accessible label. Never use it to imply approval.
- **Status:** Accepted.

## D-015 — Risk colours

- **Conflict:** Figma's status chips use different colours for MEDIUM and LOW:
  - Figma MEDIUM: pale background with dark yellow text.
  - Figma LOW: pale green background with dark green text.
  - Prompt requires exact pairs: HIGH `#FF0000`/white, MEDIUM `#FFD966`/black, LOW `#00B050`/white.
- **Decision:** The prompt's exact pairs win. All risk rendering must go through one `RiskBadge` component and one `design/risk.ts` constants file. Labels always include the words HIGH, MEDIUM or LOW.
- **Status:** Accepted.

## D-016 — Findings and report headings

- **Conflict:** Figma visually uppercases headings and the report preview shortens them to `Section`, `Risk`, `Identified hazard`, `Recommended control`.
- **Decision:** Use exactly, in this order:
  1. `Section in the Workplace`
  2. `Risk Level`
  3. `Identified Hazards`
  4. `Recommended Control Measures`
  Use title case in the DOM/accessible name and apply uppercase only as a visual style if desired. The report preview must use the same four headings.
- **Status:** Accepted.

## D-017 — Report photos and aspect ratio

- **Conflict:** Figma uses `object-fit: cover` with fixed 150px height, cropping photos.
- **Decision:** Use a two-column grid below the table with `object-fit: contain` and an explicit aspect-ratio box so images are not distorted or cropped. The acceptance test will assert two columns and preserved ratio.
- **Status:** Accepted.

## D-018 — Upload restrictions

- **Conflict:** Figma says `JPG, PNG or ZIP up to 50 MB`. The prompt requires images only, configurable max size, progress, cancel and retry.
- **Decision:** Accept images only (`image/jpeg`, `image/png`, `image/webp` by default), configurable through `VITE_MAX_UPLOAD_MB` with a 50 MB default. Reject ZIP and non-images. Do not store images in localStorage.
- **Status:** Accepted.

## D-019 — Button and navigation wording

- **Conflict:** Figma uses British spelling `Analyse photographs with AI`; the prompt specifies an `Analyze photos` button.
- **Decision:** Use `Analyze photos` for the primary action and the endpoint contract. The rest of the UI may keep British spelling only where it is part of Figma copy and does not conflict with a specified label.
- **Status:** Accepted.

## D-020 — Sidebar and navigation scope

- **Conflict:** Figma has a fixed sidebar with no desktop collapse and includes out-of-scope destinations.
- **Decision:** Keep the visual sidebar, add a desktop collapse control, and remove out-of-scope links. Mobile uses the Figma drawer + bottom-nav pattern.
- **Status:** Accepted.

## D-021 — Top bar controls

- **Conflict:** Figma's search, notification, help and profile controls are decorative.
- **Decision:** Implement:
  - global search (at least audit/company/workplace/report lookup),
  - organization switcher,
  - profile menu with logout,
  - help link.
  Notifications may remain a non-MVP icon only if it is clearly disabled and labelled; no fake destructive actions.
- **Status:** Accepted.

## D-022 — Roles and demo identities

- **Conflict:** Figma shows one `Grace Wanjiku — Lead Auditor` user. The prompt needs `admin`, `auditor`, `reviewer`, `viewer`.
- **Decision:** Seed Grace Wanjiku as the demo admin/lead auditor plus one profile per role. Role checks are UX-only; the backend remains the security gate. The UI will still handle 403 responses.
- **Status:** Accepted.

## D-023 — Mock data and dates

- **Decision:** Keep the Figma visual density and labels but use clearly fictional seed data. The prototype's 2025 dates may be retained as demo timestamps or updated consistently; no real client data. Photos will be local fictional placeholders or generated assets, not real inspection images.
- **Status:** Accepted.

## D-024 — Figma state coverage

- **Conflict:** Figma is largely static and has no loading, empty, error, disabled, focus or permission-denied states.
- **Decision:** Design and build these states using the same tokens and patterns. Every route gets rendering, loading, empty, error and permission-denied tests. This is an intentional extension of Figma, not a departure from its visual language.
- **Status:** Accepted.

## D-025 — Focus and accessibility

- **Conflict:** Figma CSS has no `:focus-visible` styling and several icon-only buttons have no accessible name.
- **Decision:** Add visible focus rings, accessible names, keyboard dialog behaviour and `aria-live` for upload/AI job status. Risk is never communicated by colour alone.
- **Status:** Accepted.

## D-026 — Report format naming

- **Conflict:** Figma says `Download Word` / `Generate Word report`; the prompt requires DOCX.
- **Decision:** Display `DOCX` and `PDF` in the interface and generate mock DOCX/PDF downloads in the mock API. Use `DOCX` in acceptance tests.
- **Status:** Accepted.

## D-027 — Data-source switch

- **Decision:** All data access goes through `src/api/client.ts`; `VITE_API_MODE=mock|real` and `VITE_API_BASE_URL` switch the source. MSW is used only in mock mode/test. No service-role or AI key is ever present in the frontend.
- **Status:** Accepted; to be proven by tests.

## D-028 — Single-page prototype routing

- **Conflict:** The published prototype uses local state and never changes the URL.
- **Decision:** Use React Router data routes and real URLs as required by the prompt. Screen transitions should still feel like the prototype.
- **Status:** Accepted.

## D-029 — Analytics/admin data in sidebar

- **Decision:** Remove the `Admin`, `Analytics` and `Settings` navigation entries from the MVP. The Figma-only screens remain documented in `FIGMA_INVENTORY.md` as out of scope so the gap is explicit.

## D-030 — Figma "company profile" and "workplace profile" links

- **Conflict:** Both links are labelled as profile links but open lists or the audit wizard.
- **Decision:** Implement proper company and workplace detail/edit routes as required by the prompt. Do not reproduce the misleading navigation.

---

## Assumptions to confirm later

These are not blocking; they are recorded so the team can challenge them:

- The active demo organization is Greenfield, not Figma's Apex Safety Group.
- Figma's client companies are retained as fictional Greenfield clients, but "Greenfield Workplace Solutions" is not duplicated as a client.
- One reviewer profile is enough for the pilot demo, but the UI supports multiple reviewers.
- Report previews are generated from the mock API as downloadable blobs; no real DOCX/PDF rendering service is required for the frontend MVP.
- Notifications are not an MVP feature; the bell can be omitted or marked unavailable.
