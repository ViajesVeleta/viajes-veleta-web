# Design System Documentation

This document describes the modular CSS architecture and design system for Viajes Veleta.

## Table of Contents
- [Overview](#overview)
- [Styles Directory Structure](#styles-directory-structure)
- [File Organization](#file-organization)
- [Import Order](#import-order)
- [Usage Examples](#usage-examples)
- [Component Patterns](#component-patterns)
- [Utility Classes](#utility-classes)
- [Animation System](#animation-system)
- [Color System](#color-system)
- [Typography](#typography)
- [Best Practices](#best-practices)

## Overview

The design system follows a **modular CSS approach** with clear separation of concerns. Each CSS file has a single responsibility, making the codebase maintainable, scalable, and easy to understand.

### Key Principles
- ✅ **Modular** - Each file has a single, clear responsibility
- ✅ **Maintainable** - Easy to find and update specific styles
- ✅ **Scalable** - Simple to add new patterns without bloating existing files
- ✅ **Reusable** - Component patterns and utilities reduce duplication
- ✅ **Performance** - Browser can cache individual modules
- ✅ **Accessible** - Respects user preferences (reduced motion, color schemes)

## Styles Directory Structure

```
src/styles/
├── colors.css       (3.1 KB) - Color tokens & theme variables
├── reset.css        (719 B)  - Modern CSS reset & core defaults
├── typography.css   (1.7 KB) - Typography styles
├── layout.css       (2.3 KB) - Layout utilities & containers
├── components.css   (4.7 KB) - Reusable component patterns
├── animations.css   (4.1 KB) - Animation utilities
├── utilities.css    (6.1 KB) - Utility classes
└── global.css       (1.3 KB) - Main entry point
```

**Total Size:** ~23 KB (uncompressed)

## File Organization

### Core Files (Foundation)

#### `reset.css` (719 B)
Modern CSS reset & core defaults
- Box-sizing for all elements
- Form element defaults
- Media element defaults (img, video, canvas, svg)
- Table defaults
- Touch interaction optimizations

#### `colors.css` (3.1 KB)
Color tokens & theme variables
- Light theme color palette
- Dark theme color palette (`[data-theme="dark"]`)
- Material Design 3 color system
- Primary, secondary, tertiary, quaternary colors
- Surface colors and variants
- Outline colors
- Utility colors (shadows, gradients)
- CSS custom properties for theming

#### `typography.css` (1.7 KB)
Typography styles
- Font families (Lato)
- Base font size and line height
- Heading styles (h1-h6) with modular scale
- Link styles with hover effects
- Paragraph spacing
- Code and pre blocks
- Blockquote styles
- Responsive typography

### Layout & Structure

#### `layout.css` (2.3 KB)
Layout utilities & containers

**Main Layout:**
- `main` element styling
- Responsive padding

**Container Utilities:**
- `.container` - Standard container (max-width: 1200px)
- `.container-narrow` - Narrow container (max-width: 720px)
- `.container-wide` - Wide container (max-width: 1400px)

**Flexbox Utilities:**
- `.flex`, `.flex-col`, `.flex-row`, `.flex-wrap`
- `.items-start`, `.items-center`, `.items-end`, `.items-stretch`
- `.justify-start`, `.justify-center`, `.justify-end`, `.justify-between`, `.justify-around`

**Gap Utilities:**
- `.gap-1` (0.5rem) through `.gap-8` (4rem)

**Grid Utilities:**
- `.grid`, `.grid-cols-1` through `.grid-cols-4`
- Responsive grid (collapses on mobile)

**Section Spacing:**
- `.section`, `.section-sm`, `.section-lg`

### Component Patterns

#### `components.css` (4.7 KB)
Reusable component patterns

**Buttons:**
- `.btn` - Base button
- `.btn-primary`, `.btn-secondary`, `.btn-outline` - Variants
- `.btn-sm`, `.btn-lg` - Sizes

**Cards:**
- `.card` - Base card with shadow and hover effect
- `.card-header`, `.card-body`, `.card-footer` - Card sections

**Badges:**
- `.badge` - Primary badge
- `.badge-secondary`, `.badge-tertiary`, `.badge-quaternary` - Color variants

**Chips:**
- `.chip` - Interactive chip component

**Dividers:**
- `.divider` - Horizontal divider
- `.divider-vertical` - Vertical divider

**Links:**
- `.link` - Styled link
- `.link-subtle` - Subtle link variant

**Lists:**
- `.list-reset` - Remove list styling
- `.list-inline` - Inline list with flex

**Images:**
- `.img-rounded`, `.img-circle`, `.img-cover`

**Overlays:**
- `.overlay` - Full-screen overlay

**Loading:**
- `.spinner`, `.spinner-sm`, `.spinner-lg` - Loading spinners

### Animations & Transitions

#### `animations.css` (4.1 KB)
Animation utilities

**Keyframe Animations:**
- `fadeIn`, `fadeOut`
- `fadeInUp`, `fadeInDown`
- `slideInLeft`, `slideInRight`
- `scaleIn`
- `bounce`, `pulse`, `shake`

**Animation Classes:**
- `.animate-fade-in`, `.animate-fade-out`
- `.animate-fade-in-up`, `.animate-fade-in-down`
- `.animate-slide-in-left`, `.animate-slide-in-right`
- `.animate-scale-in`
- `.animate-bounce`, `.animate-pulse`, `.animate-shake`

**Animation Delays:**
- `.animate-delay-100` through `.animate-delay-500`

**Transition Utilities:**
- `.transition-none`, `.transition-all`
- `.transition-colors`, `.transition-transform`
- `.transition-opacity`, `.transition-shadow`

**Duration Modifiers:**
- `.duration-100` through `.duration-700`

**Hover Effects:**
- `.hover-lift` - Lift on hover
- `.hover-scale` - Scale on hover
- `.hover-rotate` - Rotate on hover
- `.hover-brightness` - Brightness on hover

**Accessibility:**
- Respects `prefers-reduced-motion`
- Smooth scroll behavior

### Utilities

#### `utilities.css` (6.1 KB)
Comprehensive utility classes

**Spacing:**
- Margin: `.m-0` through `.m-4`, `.m-auto`
- Margin Top: `.mt-0` through `.mt-8`
- Margin Bottom: `.mb-0` through `.mb-8`
- Margin Left: `.ml-0` through `.ml-4`, `.ml-auto`
- Margin Right: `.mr-0` through `.mr-4`, `.mr-auto`
- Padding: `.p-0` through `.p-8`
- Padding directional: `.pt-*`, `.pb-*`, `.pl-*`, `.pr-*`

**Display:**
- `.hidden`, `.block`, `.inline`, `.inline-block`

**Position:**
- `.relative`, `.absolute`, `.fixed`, `.sticky`

**Text:**
- Alignment: `.text-left`, `.text-center`, `.text-right`, `.text-justify`
- Weight: `.font-light` through `.font-bold`
- Size: `.text-xs` through `.text-3xl`
- Transform: `.uppercase`, `.lowercase`, `.capitalize`
- Decoration: `.underline`, `.no-underline`, `.line-through`

**Sizing:**
- Width: `.w-full`, `.w-auto`, `.w-screen`
- Height: `.h-full`, `.h-auto`, `.h-screen`

**Borders:**
- `.rounded-none` through `.rounded-full`

**Shadows:**
- `.shadow-none`, `.shadow-sm`, `.shadow`, `.shadow-lg`

**Cursor:**
- `.cursor-pointer`, `.cursor-default`, `.cursor-not-allowed`

**Pointer Events:**
- `.pointer-events-none`, `.pointer-events-auto`

**Z-Index:**
- `.z-0` through `.z-50`

**Responsive:**
- `.mobile-hidden`, `.mobile-visible`
- `.desktop-hidden`, `.desktop-visible`
- `.tablet-hidden`, `.tablet-visible`

**Overflow:**
- `.overflow-auto`, `.overflow-hidden`, `.overflow-visible`, `.overflow-scroll`

**Visibility:**
- `.visible`, `.invisible`

### Main Entry Point

#### `global.css` (1.3 KB)
Main entry point that imports all modules

**Imports (in order):**
1. `colors.css` - Define variables first
2. `reset.css` - Reset browser defaults
3. `typography.css` - Base typography
4. `layout.css` - Layout structure
5. `components.css` - Component patterns
6. `animations.css` - Animations & transitions
7. `utilities.css` - Utility classes

**Global Styles:**
- Body background with gradient
- Horizontal rule styling
- Screen reader utility (`.sr-only`)
- Performance optimizations (`content-visibility`)
- Theme transition animations

## Import Order

The import order in `global.css` is critical:

```css
@import "./colors.css";      /* 1. Variables first */
@import "./reset.css";       /* 2. Reset defaults */
@import "./typography.css";  /* 3. Base typography */
@import "./layout.css";      /* 4. Layout structure */
@import "./components.css";  /* 5. Components */
@import "./animations.css";  /* 6. Animations */
@import "./utilities.css";   /* 7. Utilities (highest specificity) */
```

This ensures:
- CSS custom properties are available before use
- Resets happen before styling
- Utilities can override component styles when needed
- Proper cascade and specificity

## Usage Examples

### Layout Examples

```html
<!-- Container with flexbox -->
<div class="container">
  <div class="flex items-center justify-between gap-4">
    <h1>Title</h1>
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Grid layout -->
<div class="container">
  <div class="grid grid-cols-3 gap-4">
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
    <div class="card">Card 3</div>
  </div>
</div>

<!-- Section spacing -->
<section class="section">
  <div class="container-narrow">
    <h2>Section Title</h2>
    <p>Section content</p>
  </div>
</section>
```

### Component Examples

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary btn-lg">Large Secondary</button>
<button class="btn btn-outline btn-sm">Small Outline</button>

<!-- Card -->
<div class="card hover-lift">
  <div class="card-header">
    <h3 class="font-bold">Card Title</h3>
    <span class="badge">New</span>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Badges and Chips -->
<span class="badge">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<div class="chip">
  <span>Filter</span>
</div>

<!-- Loading Spinner -->
<div class="flex items-center justify-center">
  <div class="spinner"></div>
</div>
```

### Animation Examples

```html
<!-- Fade in animation -->
<div class="animate-fade-in-up">
  Content appears with animation
</div>

<!-- Delayed animation -->
<div class="animate-slide-in-left animate-delay-200">
  Delayed slide in
</div>

<!-- Hover effects -->
<div class="card hover-lift transition-all">
  Lifts on hover
</div>

<button class="btn btn-primary hover-scale">
  Scales on hover
</button>

<!-- Continuous animations -->
<div class="animate-pulse">
  Pulsing element
</div>
```

### Utility Examples

```html
<!-- Spacing -->
<div class="mt-4 mb-2 p-3">
  Content with spacing
</div>

<!-- Text styling -->
<h2 class="font-bold text-2xl text-center mb-2">
  Centered Bold Heading
</h2>
<p class="text-sm text-left">
  Small left-aligned text
</p>

<!-- Responsive visibility -->
<div class="mobile-hidden">
  Only visible on desktop
</div>
<div class="desktop-hidden">
  Only visible on mobile
</div>

<!-- Combining utilities -->
<div class="flex items-center gap-2 p-4 rounded-lg shadow">
  <img src="icon.svg" class="w-8 h-8" alt="Icon">
  <span class="font-semibold">Combined utilities</span>
</div>
```

## Component Patterns

### Button Pattern

```html
<!-- Basic button -->
<button class="btn btn-primary">Click Me</button>

<!-- With icon -->
<button class="btn btn-primary flex items-center gap-2">
  <svg>...</svg>
  <span>With Icon</span>
</button>

<!-- Loading state -->
<button class="btn btn-primary" disabled>
  <span class="spinner spinner-sm"></span>
  <span>Loading...</span>
</button>
```

### Card Pattern

```html
<article class="card hover-lift animate-fade-in-up">
  <div class="card-header flex items-center justify-between">
    <h3 class="font-bold text-xl">Article Title</h3>
    <span class="badge badge-secondary">Featured</span>
  </div>
  <div class="card-body">
    <p class="mb-2">Article description goes here...</p>
    <div class="flex gap-2">
      <span class="chip">Tag 1</span>
      <span class="chip">Tag 2</span>
    </div>
  </div>
  <div class="card-footer flex justify-between items-center">
    <span class="text-sm">2 days ago</span>
    <button class="btn btn-outline btn-sm">Read More</button>
  </div>
</article>
```

### Form Pattern

```html
<form class="card p-4">
  <div class="mb-3">
    <label class="block font-semibold mb-1">Email</label>
    <input type="email" class="w-full p-2 rounded border">
  </div>
  <div class="mb-4">
    <label class="block font-semibold mb-1">Message</label>
    <textarea class="w-full p-2 rounded border" rows="4"></textarea>
  </div>
  <button class="btn btn-primary w-full">Submit</button>
</form>
```

## Color System

### Using Color Variables

All colors are defined as CSS custom properties in `colors.css`:

```css
/* Light theme */
:root {
  --primary: #1976d2;
  --on-primary: #ffffff;
  --secondary: #40c4ff;
  --surface: #ffffff;
  --on-surface: #1a1c1e;
  /* ... more colors */
}

/* Dark theme */
[data-theme="dark"] {
  --primary: #9fd0ff;
  --on-primary: #003258;
  --surface: #0b0d0f;
  --on-surface: #f0f1f5;
  /* ... more colors */
}
```

### Color Usage

```css
/* In custom styles */
.my-component {
  background-color: var(--primary);
  color: var(--on-primary);
}

/* Surface colors */
.my-card {
  background-color: var(--surface-container);
  color: var(--on-surface);
}
```

## Typography

### Type Scale

The typography system uses a modular scale:

- **h1**: 3.052em
- **h2**: 2.441em
- **h3**: 1.953em
- **h4**: 1.563em
- **h5**: 1.25em
- **h6**: 1em (default)
- **body**: 20px (18px on mobile)

### Font Families

- **Primary**: Lato, sans-serif

### Usage

```html
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<p>Body text with good readability</p>
<code>Inline code</code>
<pre><code>Code block</code></pre>
```

## Best Practices

### 1. Use Utility Classes First

Before writing custom CSS, check if utility classes can achieve the desired result:

```html
<!-- ✅ Good: Using utilities -->
<div class="flex items-center gap-2 p-4">
  <span class="font-bold">Name</span>
</div>

<!-- ❌ Avoid: Custom CSS for simple layouts -->
<div class="custom-flex-container">
  <span class="custom-bold-text">Name</span>
</div>
```

### 2. Combine Component Patterns with Utilities

```html
<!-- ✅ Good: Component + utilities -->
<button class="btn btn-primary mt-4 w-full">
  Submit
</button>
```

### 3. Use Semantic HTML

```html
<!-- ✅ Good: Semantic -->
<article class="card">
  <header class="card-header">
    <h2>Title</h2>
  </header>
  <section class="card-body">
    <p>Content</p>
  </section>
</article>

<!-- ❌ Avoid: Div soup -->
<div class="card">
  <div class="card-header">
    <div>Title</div>
  </div>
</div>
```

### 4. Respect User Preferences

The system automatically respects:
- `prefers-reduced-motion` - Reduces animations
- `prefers-color-scheme` - Can be extended for auto dark mode

### 5. Component-Specific Styles

For component-specific styles that don't fit the design system, use Astro's scoped `<style>` blocks:

```astro
---
// Component logic
---

<div class="card custom-component">
  <!-- Component markup -->
</div>

<style>
  .custom-component {
    /* Component-specific styles */
  }
</style>
```

### 6. Maintain Consistency

- Use design tokens (CSS variables) for colors
- Use utility classes for spacing
- Use component patterns for common UI elements
- Keep custom styles minimal and scoped

### 7. Performance Considerations

- The `.sr-only` class is available for screen reader text
- Use `content-visibility: auto` for below-the-fold content (already applied to `footer` and non-first `section` elements)
- Leverage browser caching of individual CSS modules

## Migration Notes

### What Changed

1. **Extracted** `main` layout styles from `global.css` → `layout.css`
2. **Moved** `prefers-reduced-motion` from `reset.css` → `animations.css`
3. **Fixed** missing `h5` in typography heading selector
4. **Added** 4 new modular CSS files (layout, components, animations, utilities)

### No Breaking Changes

All existing styles continue to work. The new files add capabilities without removing existing functionality.

### Component Styles

Components in `src/components/*.astro` still use scoped `<style>` blocks for component-specific styles. The new CSS files provide:
- Reusable patterns to reduce duplication
- Utility classes for common styling needs
- Consistent design tokens across the application

## Future Enhancements

Potential additions to the design system:

- [ ] Form component patterns (inputs, selects, checkboxes, radio buttons)
- [ ] Modal/Dialog patterns
- [ ] Toast/Notification patterns
- [ ] Navigation patterns (tabs, breadcrumbs, pagination)
- [ ] Data display patterns (tables, lists, grids)
- [ ] Icon system integration
- [ ] Spacing scale refinement
- [ ] Additional color variants
- [ ] Print styles
- [ ] RTL support

---

**Last Updated:** 2026-01-29  
**Version:** 1.0.0
