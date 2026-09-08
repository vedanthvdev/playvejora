# PlayVejora Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/design/playvejora-design-system.md` executable in CSS so every current page uses the same tokens, and so mobile layouts feel intentionally composed rather than compressed.

**Architecture:** Global CSS custom properties are the runtime source of truth. `app/layout.tsx` keeps a single sticky header row with horizontally scrolling navigation on small screens. Page markup stays the same except where a class is needed for mobile composition. A filesystem test pins required tokens so later UI work cannot silently drop the contract.

**Tech Stack:** Next.js App Router, global CSS, Vitest.

## Global Constraints

- Sequential keys `VVD-0001` onward; this branch is `VVD-0001` with exactly one amended commit.
- Do not copy Apple branding, product layouts, or wording.
- Lime is for actions only; pitch green is the brand surface.
- No document-level horizontal overflow at `320px`.
- Interactive controls are at least `44px` tall.
- Native system sans stack only; no webfont request.
- Amend the existing `VVD-0001` commit rather than creating a second commit.

## File map

- Modify: `app/globals.css` — tokens, type, layout, motion, mobile rules.
- Modify: `app/layout.tsx` — one-row header, scrollable nav markup if needed.
- Modify: `app/register/RegisterWizard.tsx` — only if player-row classes need a wrapper for 44px remove actions.
- Modify: `README.md` — point builders at the design document.
- Create: `lib/design-system.test.ts` — assert documented tokens exist in CSS.
- Keep: `docs/design/playvejora-design-system.md` as the written contract.

### Task 1: Token contract test

**Files:**
- Create: `lib/design-system.test.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Write the failing test** asserting `:root` contains `--pitch-950`, `--canvas`, `--surface`, `--ink-secondary`, `--lime-400`, `--space-4`, `--radius-card`, and `--shadow-md`.
- [ ] **Step 2: Run `npm test -- lib/design-system.test.ts` and confirm it fails.**
- [ ] **Step 3: Add the documented tokens to `:root` in `app/globals.css`.**
- [ ] **Step 4: Re-run the test and confirm it passes.**

### Task 2: Apply the system across existing UI

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `README.md`

- [ ] **Step 1:** Replace leftover hardcoded hex in component rules with semantic tokens.
- [ ] **Step 2:** Keep the header as one `56px` row; navigation scrolls horizontally on mobile with no wrap and a visually hidden scrollbar.
- [ ] **Step 3:** Compose mobile: tighter hero inset, stacked fixture-style stats, full-width primary actions, 44px player remove, progress that can scroll, tables that scroll inside `.table-wrap`.
- [ ] **Step 4:** Add pitch geometry on the hero (`pointer-events: none`) and `prefers-reduced-motion` support.
- [ ] **Step 5:** Link the design document from `README.md`.
- [ ] **Step 6:** Run `npm test` and `npm run build`. Check 320px composition by rendering CSS media rules and a live page if a server is available.

### Task 3: Single-commit branch

- [ ] **Step 1:** Amend `VVD-0001` so the commit covers the spec, CSS, tests, and README.
