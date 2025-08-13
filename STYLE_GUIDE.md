# Authentic Sketch UI/UX Style Guide

*Authoritative style guide for ScriptForge AI - Based on authentic Sketch.com design language*

## Meta

* Project: ScriptForge AI - YouTube Transcript Generator
* Brand: ScriptForge AI
* Design Language: Authentic Sketch.com
* Version: 2.0 (Authentic Sketch Update)
* Updated: 2025-01-11
* Notes: Follow this guide when generating any UI. **Minimal colors, large serif typography, clean layouts**

---

## 1) Authentic Sketch Design Tokens

### Color System - Minimal Palette

```css
/* Authentic Sketch Colors */
--color-bg          : #FAFAFA;          /* very light gray background */
--color-surface     : #FFFFFF;          /* white cards/sections */
--color-text        : #262626;          /* warm dark gray text */
--color-text-muted  : #737373;          /* muted text */
--color-border      : #E6E6E6;          /* very light borders */
--color-accent      : #262626;          /* dark button background */
--color-accent-600  : #1A1A1A;          /* darker on hover */
--color-link        : #262626;          /* links same as text */
```

**Key Principle**: Sketch uses an extremely minimal color palette. No bright colors except for small accent badges.

### Typography Scale - Serif Headlines

```css
/* Font Families */
--font-heading  : "Crimson Text", Georgia, "Times New Roman", serif;  /* Large headlines */
--font-body     : "Inter", system-ui, -apple-system, sans-serif;      /* Body text */

/* Font Sizes - Large Scale */
--fs-hero       : clamp(60px, 8vw, 120px);  /* Very large serif */
--fs-h1         : clamp(40px, 6vw, 80px);   /* Large serif */
--fs-h2         : clamp(32px, 4vw, 60px);   /* Medium serif */
--fs-h3         : 24px;                     /* Small serif */
--fs-body-lg    : 20px;                     /* Large body text */
--fs-body       : 16px;                     /* Regular body */
--fs-small      : 14px;                     /* Small text */

/* Typography Characteristics */
--lh-tight      : 1.1;                      /* Very tight for serif headlines */
--lh-normal     : 1.5;                      /* Normal for body */
--lh-loose      : 1.7;                      /* Loose for descriptions */
```

**Key Principle**: Large serif headings create editorial feel. Body text remains sans-serif.

### Spacing & Layout - Generous Whitespace

```css
/* Border Radius - Larger, Softer */
--radius-sm   : 12px;    /* small elements */
--radius-md   : 16px;    /* cards */
--radius-lg   : 24px;    /* hero elements */
--radius-xl   : 32px;    /* large feature boxes */

/* Shadows - Very Subtle */
--shadow-soft : 0 4px 20px rgba(0,0,0,0.04);  /* Barely visible */
--shadow-card : 0 8px 40px rgba(0,0,0,0.06);  /* Subtle elevation */

/* Spacing Scale - More Generous */
--space-4     : 16px;
--space-6     : 24px;
--space-8     : 32px;
--space-12    : 48px;
--space-16    : 64px;
--space-20    : 80px;
--space-24    : 96px;

/* Layout */
--content-max : 1200px;   /* Wider than before */
```

---

## 2) Authentic Sketch Principles

* **Minimal Color Palette**: Use only grays, whites, and very subtle accent colors
* **Large Serif Typography**: Headlines use serif fonts for editorial feel
* **Generous Whitespace**: More space between elements than typical websites
* **Subtle Gradients**: Very light background gradients in feature boxes
* **No Bright Accents**: Avoid bright yellows, blues, etc. Keep it sophisticated
* **Product Screenshots**: Show actual interface mockups in rounded containers
* **Editorial Layout**: Content feels like a magazine or editorial publication

---

## 3) Layout System - Sketch Style

* Page width: `max-width: 1200px; margin: 0 auto; padding: 0 24px;`
* Section rhythm: `py-20` (80px) standard, `py-24` (96px) for hero sections
* Feature boxes use subtle gradients: `bg-gradient-to-br from-blue-50 to-indigo-100`
* All content is generously spaced and breathable
* Center-aligned content with wide, airy layouts

---

## 4) Authentic Sketch Components

### 4.1 Navigation Header
**Structure:** Minimal, clean white background
**Typography:** Inter sans-serif, medium weight
**CTA Button:** Dark gray (`#262626`), rounded corners, white text
**No logo clutter:** Simple text-based branding

### 4.2 Hero Section - Editorial Style
**Typography:** Large serif headline (60-120px), center-aligned
**Layout:** Generous vertical spacing, minimal CTAs
**Background:** Very light gray (`#FAFAFA`) 
**Content:** Editorial paragraph style, no marketing hype

### 4.3 Feature Sections - Product Focus
**Cards:** Soft gradient backgrounds with rounded corners (24-32px)
**Content:** Product mockups showing actual interface
**Typography:** Serif headings, clean sans-serif descriptions
**Colors:** Pastels (blue-50, pink-50, etc.) for subtle differentiation

### 4.4 Testimonials - Minimal Styling  
**Layout:** Large quote text, simple author attribution
**Typography:** Light font weight for quotes, normal for attribution
**Background:** White or very light surface color
**No elaborate styling:** Clean, readable, professional

### 4.5 Product Screenshots
**Style:** Rounded containers with browser-like header elements
**Content:** Show actual product interface, not abstract illustrations
**Context:** Include realistic product details and workflow steps
**Background:** Subtle gradients to elevate the screenshots

---

## 5) Sketch-Inspired Tailwind Classes

### Typography System
```css
/* Serif Headlines */
.heading-hero { 
  @apply font-sketch-serif text-6xl md:text-7xl lg:text-8xl leading-none text-sketch-text; 
}
.heading-large { 
  @apply font-sketch-serif text-4xl md:text-5xl leading-tight text-sketch-text; 
}
.heading-medium { 
  @apply font-sketch-serif text-3xl leading-tight text-sketch-text; 
}

/* Body Text */
.body-large { @apply text-xl leading-relaxed text-sketch-text-muted; }
.body-text { @apply text-base leading-relaxed text-sketch-text; }
.body-small { @apply text-sm text-sketch-text-muted; }
```

### Button System - Minimal
```css
/* Primary Button - Dark */
.btn-primary {
  @apply bg-sketch-accent text-white font-medium px-8 py-4 rounded-xl;
  @apply hover:bg-sketch-accent-600 transition-all duration-200;
}

/* No secondary buttons in Sketch style - keep it minimal */
```

### Layout Components
```css
/* Feature Boxes */
.feature-box {
  @apply bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8;
}

.feature-box-alt {
  @apply bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl p-8;
}

/* Product Screenshots */
.product-screenshot {
  @apply bg-white rounded-xl shadow-lg p-6;
}
```

---

## 6) Page Templates - Sketch Style

### Homepage Structure (Authentic Sketch)
1. **Navigation** - minimal, clean
2. **Hero** - large serif headline, single CTA
3. **Product Showcase** - split layout with mockup
4. **Testimonial** - large quote, simple attribution  
5. **Feature Grid** - gradient boxes with product info
6. **Final CTA** - serif headline, single button
7. **Brand Footer** - minimal brand logos

### Key Differences from Previous Design:
- **No yellow accent color** - removed entirely
- **Serif typography** - for all major headings
- **Minimal color palette** - grays and whites primarily
- **Product-focused** - actual interface mockups
- **Editorial feel** - like a design publication

---

## 7) Content Strategy - Sketch Voice

* **Tone:** Professional, design-focused, minimal
* **Language:** Clear, no marketing hype, product-focused
* **CTAs:** Simple and direct ("Get started for free")
* **Case Style:** Sentence case, no ALL CAPS except small badges
* **Copy Length:** Concise, editorial style

---

## 8) Implementation Notes

### Using Authentic Sketch Tokens
```jsx
// Large serif headlines
<h1 className="font-sketch-serif text-6xl md:text-7xl lg:text-8xl text-sketch-text leading-none">
  Transform YouTube into Professional Scripts
</h1>

// Feature boxes with gradients
<div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8">
  <h3 className="font-sketch-serif text-3xl text-sketch-text mb-4">
    Feature Title
  </h3>
</div>

// Minimal buttons
<button className="bg-sketch-accent text-white px-8 py-4 rounded-xl font-medium hover:bg-sketch-accent-600">
  Get started for free
</button>
```

### Design Principles in Practice:
- Use `font-sketch-serif` for all major headlines
- Apply subtle gradients to feature boxes
- Include actual product mockups, not illustrations
- Keep color palette minimal (grays, whites, subtle pastels)
- Use generous spacing and large typography

---

## 9) Component Library Status - Authentic Sketch

| Component | Status | Notes |
|-----------|--------|-------|
| Homepage | ✅ Complete | Authentic Sketch design implemented |
| AppHeader | ⏳ Needs Update | Convert to minimal Sketch style |
| AppFooter | ⏳ Needs Update | Simplify to match Sketch aesthetic |
| Studio | ⏳ Needs Update | Apply Sketch design principles |
| Dashboard | ⏳ Needs Update | Minimal Sketch styling needed |
| Buttons | ✅ Complete | Dark buttons match Sketch |
| Typography | ✅ Complete | Serif headlines implemented |

---

*This style guide reflects the authentic Sketch.com design language: minimal colors, large serif typography, generous whitespace, and product-focused content. The bright yellow accent has been removed in favor of Sketch's sophisticated gray palette.*