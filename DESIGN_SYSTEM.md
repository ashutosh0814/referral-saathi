# ReferralSaathi Design System

## Overview

ReferralSaathi uses a modern, professional design system inspired by leading SaaS products. The design emphasizes clarity, consistency, and accessibility.

## Design Principles

1. **Professional & Minimal** - Clean interfaces without unnecessary decoration
2. **Consistent** - Reusable patterns and predictable behavior
3. **Accessible** - WCAG 2.1 AA compliant with proper focus states
4. **Responsive** - Mobile-first design that scales beautifully
5. **Performance-focused** - Optimized animations and lightweight components

## Color System

### Primary Colors (Indigo)
Used for primary actions, links, and interactive elements.

```css
--color-primary-50: #eef2ff   /* Lightest backgrounds */
--color-primary-100: #e0e7ff
--color-primary-200: #c7d2fe
--color-primary-300: #a5b4fc
--color-primary-400: #818cf8
--color-primary-500: #6366f1
--color-primary-600: #4f46e5  /* Primary action color */
--color-primary-700: #4338ca  /* Primary hover state */
--color-primary-800: #3730a3
--color-primary-900: #312e81
--color-primary-950: #1e1b4b  /* Darkest */
```

**Usage:**
- Primary buttons: `--color-primary-600` with hover `--color-primary-700`
- Links: `--color-primary-600`
- Focus indicators: `--color-primary-500`
- Badges/pills: `--color-primary-50` background with `--color-primary-700` text

### Neutral Colors (Slate)
Used for text, borders, backgrounds, and subtle UI elements.

```css
--color-neutral-50: #f8fafc   /* Page background */
--color-neutral-100: #f1f5f9  /* Subtle backgrounds */
--color-neutral-200: #e2e8f0  /* Borders */
--color-neutral-300: #cbd5e1  /* Disabled states */
--color-neutral-400: #94a3b8  /* Placeholder text */
--color-neutral-500: #64748b  /* Secondary text */
--color-neutral-600: #475569  /* Body text (secondary) */
--color-neutral-700: #334155  /* Body text (primary) */
--color-neutral-800: #1e293b  /* Headings (secondary) */
--color-neutral-900: #0f172a  /* Headings (primary) */
--color-neutral-950: #020617  /* Darkest */
```

**Usage:**
- Headings: `--color-neutral-900`
- Body text: `--color-neutral-700`
- Secondary text: `--color-neutral-600`
- Borders: `--color-neutral-200`
- Page background: `--color-neutral-50`

### Semantic Colors

#### Success (Green)
```css
--color-success-50: #f0fdf4
--color-success-500: #22c55e
--color-success-600: #16a34a
--color-success-700: #15803d
```

#### Warning (Amber)
```css
--color-warning-50: #fffbeb
--color-warning-500: #f59e0b
--color-warning-600: #d97706
--color-warning-700: #b45309
```

#### Error (Red)
```css
--color-error-50: #fef2f2
--color-error-500: #ef4444
--color-error-600: #dc2626
--color-error-700: #b91c1c
```

#### Info (Blue)
```css
--color-info-50: #eff6ff
--color-info-500: #3b82f6
--color-info-600: #2563eb
--color-info-700: #1d4ed8
```

## Typography

### Font Families
```css
--font-family-base: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
```

### Font Sizes
```css
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.125rem    /* 18px */
--font-size-xl: 1.25rem     /* 20px */
--font-size-2xl: 1.5rem     /* 24px */
--font-size-3xl: 1.875rem   /* 30px */
--font-size-4xl: 2.25rem    /* 36px */
--font-size-5xl: 3rem       /* 48px */
```

### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Line Heights
```css
--line-height-tight: 1.25    /* Headings */
--line-height-normal: 1.5    /* Body text */
--line-height-relaxed: 1.75  /* Long-form content */
```

### Typography Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| h1 | 36px | 600 | 1.25 | Page titles |
| h2 | 30px | 600 | 1.25 | Section headers |
| h3 | 24px | 600 | 1.25 | Subsection headers |
| h4 | 20px | 600 | 1.25 | Card titles |
| h5 | 18px | 600 | 1.25 | Small headings |
| h6 | 16px | 600 | 1.25 | Tiny headings |
| body | 16px | 400 | 1.5 | Default text |
| small | 14px | 400 | 1.5 | Secondary text |
| xs | 12px | 400 | 1.5 | Labels, captions |

## Spacing Scale

```css
--spacing-1: 0.25rem   /* 4px */
--spacing-2: 0.5rem    /* 8px */
--spacing-3: 0.75rem   /* 12px */
--spacing-4: 1rem      /* 16px */
--spacing-5: 1.25rem   /* 20px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
--spacing-10: 2.5rem   /* 40px */
--spacing-12: 3rem     /* 48px */
--spacing-16: 4rem     /* 64px */
--spacing-20: 5rem     /* 80px */
```

**Usage Guidelines:**
- Component padding: `--spacing-4` to `--spacing-6`
- Section padding: `--spacing-12` to `--spacing-16`
- Element gaps: `--spacing-2` to `--spacing-4`
- Form field spacing: `--spacing-4`

## Border Radius

```css
--radius-sm: 0.375rem   /* 6px - Small elements */
--radius-md: 0.5rem     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem    /* 12px - Cards */
--radius-xl: 1rem       /* 16px - Large cards */
--radius-2xl: 1.5rem    /* 24px - Hero sections */
--radius-full: 9999px   /* Circular elements */
```

## Shadows

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

**Usage:**
- Cards: `--shadow-sm` (default) or `--shadow-md` (elevated)
- Dropdowns: `--shadow-lg`
- Modals: `--shadow-xl`
- Buttons: `--shadow-sm`

## Components

### Buttons

#### Primary Button
```jsx
<button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
  Primary Action
</button>
```

#### Secondary Button
```jsx
<button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors bg-white">
  Secondary Action
</button>
```

#### Ghost Button
```jsx
<button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
  Ghost Action
</button>
```

#### Button Sizes
- **Small**: `px-3 py-1.5 text-xs`
- **Medium** (default): `px-4 py-2 text-sm`
- **Large**: `px-6 py-3 text-base`

### Cards

```jsx
// Basic Card
<div className="card p-6">
  <h3 className="text-lg font-semibold text-slate-900 mb-2">Card Title</h3>
  <p className="text-sm text-slate-600">Card content goes here</p>
</div>

// Hoverable Card
<div className="card card-hover p-6">
  <h3 className="text-lg font-semibold text-slate-900 mb-2">Card Title</h3>
  <p className="text-sm text-slate-600">Card content goes here</p>
</div>
```

### Icons

We use [Lucide React](https://lucide.dev) for all icons.

**Icon Sizes:**
- Small: `w-4 h-4` (16px)
- Medium: `w-5 h-5` (20px)
- Large: `w-6 h-6` (24px)
- Extra Large: `w-8 h-8` (32px)

**Color Usage:**
- Primary actions: `text-indigo-600`
- Success: `text-emerald-500`
- Warning: `text-amber-500`
- Error: `text-red-500`
- Neutral: `text-slate-400` or `text-slate-600`

## Layout

### Container
```jsx
<div className="container-app">
  {/* Content with responsive padding */}
</div>
```

**Breakpoints:**
- Mobile: < 640px (padding: 16px)
- Tablet: ≥ 640px (padding: 24px)
- Desktop: ≥ 1024px (padding: 32px)
- Max width: 1280px (centered)

### Grid System
```jsx
// 3-column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

## Animations

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Animation Classes
- `.animate-fade-in` - Fade in on load
- `.animate-slide-in-up` - Slide up with fade
- `.animate-slide-in-down` - Slide down with fade

**Usage:**
```jsx
<div className="animate-slide-in-up">
  {/* Animated content */}
</div>
```

## Focus States

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

## Responsive Design

### Mobile-First Approach
Design for mobile first, then enhance for larger screens.

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Common Patterns
```jsx
// Stack on mobile, side-by-side on tablet+
<div className="flex flex-col md:flex-row gap-4">

// 1 col on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Show on mobile, hide on desktop
<div className="block lg:hidden">
```

## Accessibility

### Focus Management
- All interactive elements must be keyboard accessible
- Focus indicators are always visible
- Logical tab order maintained

### Color Contrast
- Body text: 7:1 contrast ratio (AAA)
- UI elements: 4.5:1 contrast ratio (AA)
- Large text: 3:1 contrast ratio (AA)

### Screen Readers
- Use semantic HTML
- Include `aria-label` for icon-only buttons
- Provide alt text for images
- Use proper heading hierarchy

## Best Practices

1. **Consistency** - Use design tokens instead of hardcoded values
2. **Spacing** - Use the spacing scale for all margins and padding
3. **Colors** - Stick to the defined color palette
4. **Typography** - Use the typography scale for all text
5. **Shadows** - Use sparingly; prefer borders for subtle separation
6. **Animations** - Keep subtle and purposeful
7. **Icons** - Use Lucide React consistently
8. **Accessibility** - Test with keyboard navigation and screen readers

## File Structure

```
src/
├── index.css              # Design system CSS with tokens
├── App.jsx                # Example implementation
└── components/            # Reusable components (future)
```

## Usage Example

```jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

function ExampleCard() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Success State
        </h3>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        This is an example of our design system in action.
      </p>
      <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
        Take Action
      </button>
    </div>
  );
}
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
