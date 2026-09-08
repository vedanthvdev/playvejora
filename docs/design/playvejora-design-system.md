# PlayVejora Design System

This document is the source of truth for PlayVejora's visual language. New pages and components must use these foundations before introducing new values. The aim is premium match-day energy: the hierarchy, restraint, and polish associated with Apple product pages, expressed through PlayVejora's football identity rather than copied branding.

## Design principles

1. **Make the next action obvious.** Each view has one dominant message and one primary action.
2. **Create energy through scale and composition.** Use bold display type, pitch geometry, score-like numerals, and contrast instead of visual clutter.
3. **Give content room.** Generous whitespace and short line lengths make the experience feel considered.
4. **Design mobile intentionally.** Mobile is a distinct composition, not a compressed desktop page.
5. **Use restraint consistently.** Green identifies the brand, lime identifies action, and motion confirms interaction.
6. **Keep football human.** Copy should feel welcoming and direct, not like enterprise software or luxury advertising.

## Brand tone

The interface should feel energetic, assured, social, and uncomplicated. It should not feel aggressive, childish, corporate, or overly glossy.

Use:

- Direct headings such as “Finish work. Play football.”
- Short supporting paragraphs with one idea each.
- Football cues in structure: pitch lines, score numerals, fixture-style labels, and team language.
- Photography that shows real people playing and socializing after work when approved imagery becomes available.

Avoid:

- Copying Apple product layouts, gradients, wording, or brand assets.
- Decorative football icons on every surface.
- Excessive neon, glass effects, shadows, gradients, or animation.
- Generic stock photography.
- Claims about venues, formats, charities, or awards that are not confirmed.

## Colour

All interface colours must be exposed as semantic CSS custom properties. Raw hex values should not appear in component styles.

### Brand palette

| Token | Value | Use |
| --- | --- | --- |
| `--pitch-950` | `#031C12` | Deepest hero and footer background |
| `--pitch-900` | `#06281A` | Primary dark brand surface |
| `--pitch-800` | `#0B3A26` | Elevated dark surface |
| `--pitch-700` | `#125334` | Primary button and strong accent |
| `--pitch-600` | `#17703F` | Links and active controls |
| `--pitch-500` | `#1F8A4C` | Graphic accents and focus treatment |
| `--lime-400` | `#B6F36B` | Primary action on dark surfaces |
| `--lime-300` | `#C8F989` | Primary-action hover |

### Neutral and state palette

| Token | Value | Use |
| --- | --- | --- |
| `--canvas` | `#F7F9F7` | Page background |
| `--surface` | `#FFFFFF` | Cards, forms, and tables |
| `--surface-subtle` | `#F0F4F1` | Quiet grouped areas |
| `--ink` | `#0D1512` | Primary text |
| `--ink-secondary` | `#46564E` | Body text |
| `--ink-tertiary` | `#718078` | Hints and metadata |
| `--border` | `#DEE6E0` | Standard dividers |
| `--border-strong` | `#C6D3CA` | Interactive and emphasized borders |
| `--success-bg` | `#E8F6EC` | Positive status background |
| `--success-ink` | `#125334` | Positive status text |
| `--warning-bg` | `#FDF3E2` | Waitlist status background |
| `--warning-ink` | `#8A5A12` | Waitlist status text |
| `--error-bg` | `#FBEDEC` | Error background |
| `--error-ink` | `#A4231F` | Error text |

White text on pitch surfaces and pitch text on lime are the preferred high-contrast brand combinations. Lime is reserved for calls to action, selected indicators, and small highlights; it is not a page background.

## Typography

The primary font is the native system sans stack:

```css
ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
Roboto, Helvetica, Arial, sans-serif
```

This uses San Francisco on Apple devices without distributing a proprietary font. No external font request is required, improving privacy and performance.

### Type scale

| Role | Desktop | Mobile | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| Wordmark | `29px` | `22px` | `730` | `1.1` | `-0.035em`, uppercase |
| Display | `80px` | `40px` | `680` | `0.98` | `-0.045em` |
| Page title | `60px` | `36px` | `680` | `1.02` | `-0.045em` |
| Section title | `40px` | `30px` | `650` | `1.1` | `-0.03em` |
| Card title | `18px` | `18px` | `620` | `1.25` | `-0.015em` |
| Lead | `18px` | `17px` | `400` | `1.55` | `0` |
| Body | `16px` | `16px` | `400` | `1.62` | `0` |
| Small | `14px` | `14px` | `450` | `1.5` | `0` |
| Label | `12px` | `12px` | `650` | `1.35` | `0.07em` |

Body copy should not exceed `65ch`. Hero copy should not exceed `46ch`. Avoid more than three weights on one page.

## Spacing and sizing

Use the following 4px-based spacing scale:

| Token | Pixels |
| --- | --- |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-20` | `80px` |

Prefer values on this scale. A component may use a different value only when a visual or accessibility constraint requires it, and the reason should be documented beside the style.

Interactive controls must have a minimum height of `44px`. Standard buttons and text fields are `48px` tall. Compact controls may be `44px`, but never smaller on touch layouts.

## Layout

### Breakpoints

| Name | Range | Content gutter |
| --- | --- | --- |
| Mobile | `0–639px` | `20px` |
| Tablet | `640–959px` | `32px` |
| Desktop | `960px+` | `48–72px` |

Breakpoints follow content pressure rather than device names. Components can adapt earlier if their content no longer fits.

### Page frame

Layout is full-width by default. Coloured sections span the entire viewport edge to edge; only their inner content is constrained. This is the `bleed` and `wrap` pattern:

- A full-width band carries the background (`.bleed`).
- An inner container centres the content (`.wrap`) with `max-width: 1440px` and the breakpoint gutter.

Rules:

- Maximum content width: `1440px`.
- Reading content width: `640px` for prose, `46rem` for page introductions.
- Desktop section padding: `48–96px` block.
- Mobile section padding: `48px` block.

### Vertical rhythm

Two tokens own the space between top-level blocks: `--rhythm` (`48–96px`) for standard sections and `--rhythm-sm` (`32–56px`) for tighter trailing blocks such as a closing callout.

Every top-level block sets `padding-block`, never a top margin. Two adjacent constrained blocks would otherwise stack two paddings and create a gap roughly twice the intended size, so `.main > .wrap + .wrap` drops the second block's top padding. A constrained block that follows a full-bleed band keeps its own top padding, because the band contributes no outside spacing. The result is one predictable gap between any two blocks.

Do not combine `page-top` with `section-tight` on the same element; the two padding declarations fight and the winner depends on source order.

### Card grids

`.cards` fits tracks to the card count rather than fixing three columns, so a three-card page and a four-step page both fill a single row and neither strands an orphan card. Below `960px` the grid drops to two columns, and below `640px` to one.
- Desktop hero block padding: `56–136px`; mobile `56px`.
- Hero, stats, and closing bands are full-bleed and square-cornered. Cards, panels, and callouts stay rounded inside the wrap.
- Cards use three columns on desktop, two on tablet, and one on mobile.

The first screen should establish the page purpose without forcing the primary action below the fold on common mobile heights.

### Mobile composition

- The header splits into two rows: a `60px` identity row holding the wordmark and the register action, and a `44px` scrollable row holding the remaining links. The register action never scrolls out of reach.
- Horizontal navigation must hide its scrollbar visually while remaining keyboard and touch scrollable, and must not clip a link mid-word on load.
- Hero text remains left-aligned. Decorative pitch elements may crop, but never overlap copy.
- Primary actions become full-width when adjacent buttons would fall below `144px` each.
- Stats become stacked fixture-style rows rather than independent narrow cards.
- Cards use `20px` internal padding and retain clear separation.
- Progress steps prioritize numbers and current-step context; labels may shorten but must remain understandable.
- Registration player rows keep the field and removal action usable without placing controls below `44px`.
- Data tables use horizontal scrolling with the first column remaining visually prominent. They do not shrink text below `14px`.
- No page may cause document-level horizontal overflow at `320px` width.

## Shape, border, and elevation

| Element | Radius |
| --- | --- |
| Small control | `10px` |
| Button | `999px` |
| Card | `16px` |
| Feature panel and hero | `24px` desktop, `20px` mobile |
| Status pill | `999px` |

Use a `1px` border before adding shadow. Shadows should provide separation, not decoration:

```css
--shadow-sm: 0 1px 2px rgba(3, 28, 18, 0.06);
--shadow-md: 0 18px 50px -24px rgba(3, 28, 18, 0.35);
```

Avoid stacking multiple shadows or using shadow on every card.

## Components

### Header

The header is translucent only when backdrop filtering is supported; its opaque fallback must remain legible. It stays visible while scrolling. The register action is the only filled navigation item. The header is `68px` tall on desktop and `60px` on mobile.

### Wordmark

The wordmark is set in uppercase at `730` weight with tight tracking, preceded by a pitch-green dot with a soft ring. It is deliberately the largest text in the header and must not be visually outweighed by navigation. Keep the accessible name as `PlayVejora`; uppercase is applied with CSS so screen readers and page titles stay in title case.

It is two-tone: `PLAY` uses `--ink` and `VEJORA` uses `--pitch-600`. The split comes from `site.wordmark` in `lib/site-copy.ts` so the two halves always concatenate back to the product name. Never introduce a third colour, a gradient, or a space between the halves.

### Hero

Use one dark pitch surface, full-bleed to the viewport edges, with a restrained field-line treatment. A hero contains one eyebrow, one headline, one lead, and at most two actions. Decorative layers must use `pointer-events: none` and maintain text contrast.

### Buttons

- Primary on dark: lime background with pitch text.
- Primary on light: pitch background with white text.
- Secondary: transparent or white with a visible border.
- Use action-led labels such as “Register a team,” not “Click here.”
- Hover may shift colour; active may move by `1px`; focus uses a visible `3px` ring.
- Disabled controls must remain readable and must not rely on opacity alone.

### Cards

Cards group related information. They are not used around every paragraph. Match-day cards may use large step or score numerals, but supporting copy remains calm.

### Forms

Labels always remain visible above fields. Placeholder text never replaces a label. Errors appear beside the relevant stage and are announced accessibly. Form progress communicates current, complete, and upcoming steps without colour alone.

### Tables

Admin tables prioritize team, status, and captain. Status uses text inside a coloured pill. Long player lists may wrap. The surrounding container owns horizontal scrolling on small screens.

## Imagery and graphics

Approved photography should be candid, naturally lit, and centered on real Edinburgh teams. Use wide action images for hero or section transitions and close social moments for origin stories. Preserve natural skin tones and avoid heavy green overlays.

Until approved photography exists, use abstract pitch geometry made from CSS: center circles, touchlines, and diagonal mowing bands. These should be subtle enough that removing them does not affect comprehension.

Icons are optional. When needed, use a consistent `20px` outlined set with `1.5–2px` strokes. Do not mix filled emoji, platform symbols, and vector icons.

## Motion

| Interaction | Duration | Easing |
| --- | --- | --- |
| Hover and focus | `120ms` | `ease-out` |
| Component state change | `180ms` | `ease-out` |
| Section reveal | `240ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

Motion should explain state or hierarchy. Do not autoplay looping decorative animation. Under `prefers-reduced-motion: reduce`, remove transforms and nonessential transitions.

## Accessibility and quality

- Meet WCAG 2.2 AA contrast for text and controls.
- Show keyboard focus on every interactive element.
- Maintain at least `44px` touch targets.
- Do not communicate status using colour alone.
- Support zoom to 200% without loss of content or function.
- Test at `320px`, `375px`, `768px`, `1024px`, and `1440px`.
- Respect reduced-motion and increased-contrast user preferences where practical.
- Keep decorative graphics out of the accessibility tree.
- Prefer semantic HTML before adding ARIA.

## Repository implementation

- CSS variables in `app/globals.css` are the executable representation of this document.
- Reusable values belong in `:root`; component selectors consume semantic tokens.
- A new colour, spacing value, radius, type role, or motion duration must be added here before it becomes a reusable token.
- Page-specific exceptions should remain local and must not redefine global tokens.
- UI reviews should compare both this document and the rendered mobile and desktop views.

## Delivery convention

PlayVejora work uses sequential Jira-style keys beginning with `VVD-0001`, then `VVD-0002`, and so on. A key identifies exactly one branch and one commit. Additional work on that branch amends the existing commit rather than creating another commit. New branches begin from the latest `master`.

## Review checklist

Before merging a UI change, confirm:

- The page has one clear primary action.
- All visual values use documented tokens.
- The layout works without horizontal page overflow at `320px`.
- Controls meet the `44px` touch target minimum.
- Text hierarchy and line lengths follow the type rules.
- Hover, focus, disabled, error, success, and waitlist states remain distinct.
- Reduced-motion preferences are respected.
- Tests and the production build pass.
