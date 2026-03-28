# Landcube Studio

## Current State
The site uses a dark concrete aesthetic with electric lime-green accent (oklch 0.82 0.22 130) throughout -- headings, borders, hover states, buttons, and highlights all use this accent color. Animations exist on hero and some sections but are not comprehensive.

## Requested Changes (Diff)

### Add
- Per-section scroll-triggered entrance animations on every section (hero, projects, services, about, contact, footer) with variety (fade, slide, scale)

### Modify
- Color theme: replace electric lime-green accent with pure white/light gray. Background stays pure black (#000 / oklch 0 0 0), foreground stays white. Accent becomes white (oklch 1 0 0) with foreground becoming black for contrast. All green highlights, borders, hover states replaced with white/light gray equivalents.
- index.css: update --accent to white (1 0 0), --accent-foreground to black (0 0 0), borders and secondary to dark grays

### Remove
- All instances of lime-green accent color usage (oklch 0.82 0.22 130)

## Implementation Plan
1. Update index.css CSS variables: --accent becomes white (1 0 0), --accent-foreground becomes black (0.08 0 0), adjust --background to pure black (0.05 0 0), keep foreground white
2. Update HomePage.tsx: change all `text-accent` to `text-white` or `text-foreground`, `border-accent` to `border-white`, `hover:border-accent` to `hover:border-white`, `bg-accent` to `bg-white`, `text-accent-foreground` to `text-black`. Add scroll-triggered entrance animations to every section and their children.
3. Update Navbar.tsx: replace accent-colored pill/highlights with white/gray versions
4. Update Footer.tsx: add entrance animation
5. Validate build
