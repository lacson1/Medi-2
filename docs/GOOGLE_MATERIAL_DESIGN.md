# Google Material Design 3 Implementation

This document outlines the implementation of Google's Material Design 3 typography and color system in the MediFlow application.

## Typography System

### Font Families
- **Primary**: Roboto (Google's main font)
- **Secondary**: Google Sans (for headings and UI elements)
- **Fallback**: System fonts (San Francisco, Segoe UI, etc.)

### Typography Scale

#### Display Styles (Large headlines for hero sections)
- `.text-display-large` - 56px (3.5rem) - Weight: 400, Line-height: 1.2
- `.text-display-medium` - 45px (2.8125rem) - Weight: 400, Line-height: 1.2
- `.text-display-small` - 36px (2.25rem) - Weight: 400, Line-height: 1.2

#### Headline Styles (Section headers)
- `.text-headline-large` - 32px (2rem) - Weight: 400, Line-height: 1.25
- `.text-headline-medium` - 28px (1.75rem) - Weight: 400, Line-height: 1.25
- `.text-headline-small` - 24px (1.5rem) - Weight: 400, Line-height: 1.25

#### Title Styles (Card titles, dialog headers)
- `.text-title-large` - 22px (1.375rem) - Weight: 400, Line-height: 1.25
- `.text-title-medium` - 16px (1rem) - Weight: 500, Line-height: 1.5
- `.text-title-small` - 14px (0.875rem) - Weight: 500, Line-height: 1.43

#### Label Styles (Form labels, buttons)
- `.text-label-large` - 14px (0.875rem) - Weight: 500, Line-height: 1.43
- `.text-label-medium` - 12px (0.75rem) - Weight: 500, Line-height: 1.33
- `.text-label-small` - 11px (0.6875rem) - Weight: 500, Line-height: 1.45

#### Body Styles (Main content text)
- `.text-body-large` - 16px (1rem) - Weight: 400, Line-height: 1.5
- `.text-body-medium` - 14px (0.875rem) - Weight: 400, Line-height: 1.43
- `.text-body-small` - 12px (0.75rem) - Weight: 400, Line-height: 1.33

### Component-Specific Classes
- `.btn-text` - Button text styling
- `.input-text` - Input field text styling
- `.card-title` - Card title styling
- `.card-subtitle` - Card subtitle styling
- `.nav-text` - Navigation text styling
- `.badge-text` - Badge text styling

## Color System

### Primary Colors (Google Blue)
- `--primary` - Main brand color (217 91% 60%)
- `--primary-foreground` - Text on primary (0 0% 98%)
- `--primary-container` - Primary container background (217 100% 95%)
- `--on-primary-container` - Text on primary container (217 100% 10%)

### Secondary Colors
- `--secondary` - Secondary color (0 0% 96.1%)
- `--secondary-foreground` - Text on secondary (0 0% 9%)
- `--secondary-container` - Secondary container (0 0% 90%)
- `--on-secondary-container` - Text on secondary container (0 0% 20%)

### Surface Colors
- `--surface` - Main surface color (0 0% 100%)
- `--surface-foreground` - Text on surface (0 0% 3.9%)
- `--surface-variant` - Variant surface (0 0% 96.1%)
- `--on-surface-variant` - Text on surface variant (0 0% 45.1%)

### Error Colors
- `--error` - Error color (0 84.2% 60.2%)
- `--error-foreground` - Text on error (0 0% 98%)
- `--error-container` - Error container (0 100% 95%)
- `--on-error-container` - Text on error container (0 100% 10%)

### Outline Colors
- `--outline` - Outline color (0 0% 89.8%)
- `--outline-variant` - Variant outline (0 0% 89.8%)

## Usage Examples

### Typography
```tsx
// Page title
<h1 className="text-display-small text-foreground">
  Laboratory Management
</h1>

// Section header
<h2 className="text-headline-medium text-foreground">
  Patient Overview
</h2>

// Card title
<h3 className="text-title-large text-foreground">
  Recent Appointments
</h3>

// Body text
<p className="text-body-large text-muted-foreground">
  Here's what's happening in your practice today
</p>

// Button text
<Button className="btn-text">
  Save Changes
</Button>
```

### Colors
```tsx
// Primary button
<Button className="bg-primary text-primary-foreground">
  Primary Action
</Button>

// Secondary surface
<div className="bg-secondary text-secondary-foreground">
  Secondary content
</div>

// Error state
<div className="bg-error-container text-on-error-container">
  Error message
</div>

// Card with surface colors
<Card className="bg-surface text-surface-foreground border-outline">
  <CardTitle className="card-title">Title</CardTitle>
  <CardDescription className="card-subtitle">Description</CardDescription>
</Card>
```

### Tailwind Classes
```tsx
// Using Tailwind font sizes
<h1 className="text-headline-large font-roboto">
  Google Material Design
</h1>

// Using Tailwind colors
<div className="bg-primary text-primary-foreground">
  Primary content
</div>
```

## Dark Mode Support

The color system automatically adapts to dark mode with appropriate contrast ratios and color adjustments. Dark mode colors are defined in the `.dark` class and will be applied when the dark mode is enabled.

## Migration Guide

### From Old Typography
- Replace `text-2xl font-bold` with `text-headline-large`
- Replace `text-lg font-semibold` with `text-title-large`
- Replace `text-sm font-medium` with `text-label-large`
- Replace `text-base` with `text-body-large`

### From Old Colors
- Replace `text-gray-900` with `text-foreground`
- Replace `text-gray-600` with `text-muted-foreground`
- Replace `bg-white` with `bg-surface`
- Replace `border-gray-200` with `border-outline`
- Replace `text-blue-600` with `text-primary`

## Best Practices

1. **Consistency**: Always use the predefined typography classes instead of custom font sizes
2. **Hierarchy**: Use display styles for hero sections, headlines for sections, titles for cards
3. **Accessibility**: Ensure proper contrast ratios between text and background colors
4. **Responsive**: Typography scales appropriately across different screen sizes
5. **Semantic**: Use appropriate text styles for their intended purpose (labels for forms, body for content)

## Resources

- [Material Design 3 Typography](https://m3.material.io/styles/typography/overview)
- [Material Design 3 Color System](https://m3.material.io/styles/color/overview)
- [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)
- [Google Fonts - Google Sans](https://fonts.google.com/specimen/Google+Sans)
