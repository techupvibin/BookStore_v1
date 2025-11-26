# BookStore Color Palette & Design System Guide

## Overview

This guide explains how to use the comprehensive color palette and design system implemented for the BookStore website. The system provides consistent colors, spacing, typography, and component styles across the entire application.

## 🎨 Color Palette System

### Primary Colors (Brand Colors)
- **Main Brand Color**: `#3b82f6` (Blue-500)
- **Light Variants**: `#60a5fa`, `#93c5fd`, `#bfdbfe`
- **Dark Variants**: `#2563eb`, `#1d4ed8`, `#1e40af`

### Secondary Colors (Accent Colors)
- **Main Accent Color**: `#ec4899` (Pink-500)
- **Light Variants**: `#f472b6`, `#f9a8d4`, `#fbcfe8`
- **Dark Variants**: `#db2777`, `#be185d`, `#9d174d`

### Semantic Colors
- **Success**: `#22c55e` (Green-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Error**: `#ef4444` (Red-500)
- **Info**: `#0ea5e9` (Sky-500)

### Neutral Colors (Grays)
- **Background**: `#f8fafc` to `#0f172a`
- **Text**: `#0f172a` to `#f8fafc`
- **Borders**: `#e2e8f0` to `#334155`

## 🎯 How to Use Colors

### 1. CSS Custom Properties (Recommended)

Use CSS custom properties for consistent theming:

```css
.my-component {
  background-color: var(--color-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}
```

### 2. Utility Classes

Use predefined utility classes for quick styling:

```html
<!-- Background colors -->
<div class="bg-primary">Primary background</div>
<div class="bg-secondary">Secondary background</div>
<div class="bg-success">Success background</div>

<!-- Text colors -->
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-brand">Brand color text</p>

<!-- Border colors -->
<div class="border-light">Light border</div>
<div class="border-brand">Brand border</div>
```

### 3. Color Scale Usage

Use specific color scales for different purposes:

```css
/* Primary color scale */
.element {
  background-color: var(--primary-500); /* Main brand color */
  color: var(--primary-50); /* Very light for backgrounds */
  border-color: var(--primary-200); /* Light for borders */
}

/* Semantic colors */
.success-element {
  background-color: var(--success-100);
  color: var(--success-800);
  border-color: var(--success-200);
}
```

## 📐 Design Tokens

### Spacing Scale
- **Base Unit**: 4px (0.25rem)
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px, 160px, 192px, 224px, 256px

```css
.element {
  margin: var(--spacing-4); /* 16px */
  padding: var(--spacing-6); /* 24px */
}
```

### Typography Scale
- **Font Sizes**: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px, 60px, 72px, 96px, 128px
- **Font Weights**: 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Line Heights**: 1, 1.25, 1.375, 1.5, 1.625, 2

```css
.heading {
  font-size: var(--text-3xl); /* 30px */
  font-weight: var(--font-bold); /* 700 */
  line-height: var(--leading-tight); /* 1.25 */
}
```

### Border Radius
- **Scale**: 0, 2px, 4px, 6px, 8px, 12px, 16px, 24px, 9999px

```css
.rounded-element {
  border-radius: var(--radius-lg); /* 8px */
}
```

### Shadows
- **Scale**: xs, sm, base, md, lg, xl, 2xl, inner

```css
.shadowed-element {
  box-shadow: var(--shadow-lg);
}
```

## 🧩 Component System

### Buttons

```html
<!-- Primary button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Secondary button -->
<button class="btn btn-secondary">Secondary Action</button>

<!-- Outline button -->
<button class="btn btn-outline">Outline Style</button>

<!-- Different sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Card subtitle</p>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Forms

```html
<div class="form-group">
  <label class="form-label">Email Address</label>
  <input type="email" class="form-input" placeholder="Enter your email">
</div>

<div class="form-group">
  <label class="form-label">Message</label>
  <textarea class="form-input form-textarea" placeholder="Enter your message"></textarea>
</div>
```

### Alerts

```html
<div class="alert alert-success">
  <div class="alert-title">Success!</div>
  <div class="alert-message">Your action was completed successfully.</div>
</div>

<div class="alert alert-error">
  <div class="alert-title">Error!</div>
  <div class="alert-message">Something went wrong. Please try again.</div>
</div>
```

## 🌙 Dark Theme Support

The color system automatically supports dark themes using the `[data-theme="dark"]` attribute:

```css
/* Dark theme overrides are automatically applied */
[data-theme="dark"] {
  --bg-primary: var(--neutral-900);
  --text-primary: var(--neutral-50);
  --border-light: var(--neutral-700);
}
```

To enable dark theme, add the attribute to your root element:

```javascript
// Enable dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Enable light theme
document.documentElement.setAttribute('data-theme', 'light');
```

## 📱 Responsive Design

Use responsive utility classes for different screen sizes:

```html
<!-- Mobile first approach -->
<div class="p-4 md:p-6 lg:p-8">
  <h1 class="text-2xl md:text-3xl lg:text-4xl">Responsive Heading</h1>
</div>
```

### Breakpoints
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up

## 🎨 Gradient System

Use predefined gradients for visual appeal:

```css
.gradient-element {
  background: var(--gradient-primary);
}

.hero-section {
  background: var(--gradient-hero);
}
```

Available gradients:
- `--gradient-primary`: Blue gradient
- `--gradient-secondary`: Pink gradient
- `--gradient-hero`: Blue to pink gradient
- `--gradient-card`: Subtle card gradient
- `--gradient-overlay`: Overlay gradient

## 🔧 Integration with Material-UI

### Theme-Aware Components
The system integrates seamlessly with Material-UI components:

```jsx
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from './AppThemeProvider';

const MyComponent = () => {
  const theme = useTheme();
  const { appearance } = useContext(ThemeContext);
  
  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary 
    }}>
      Content
    </Box>
  );
};
```

### Profile Section Theme Integration
The profile section now fully supports theme switching:

#### Before (Hardcoded White)
```jsx
// ❌ Old way - hardcoded white background
<Box sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
  Profile content
</Box>
```

#### After (Theme-Aware)
```jsx
// ✅ New way - theme-aware background
const getBackgroundColor = () => {
  return theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.95)' // Dark slate
    : 'rgba(255, 255, 255, 0.95)'; // White
};

<Box sx={{ backgroundColor: getBackgroundColor() }}>
  Profile content
</Box>
```

#### Profile Features
- **User Profile Panel**: Changes from white to dark slate in dark theme
- **Navigation Sidebar**: Adapts background and text colors
- **Selected Menu Items**: Highlight with primary color
- **User Icon**: Maintains primary color across themes
- **Text Colors**: Automatically adjust for proper contrast

### Admin Dashboard Theme Integration
The admin dashboard and all admin pages now fully support theme switching:

#### AdminShell Component
- **Sidebar**: Changes from white to dark theme background
- **AppBar**: Adapts to theme with proper contrast
- **Menu Items**: Selected items highlight with primary color
- **Drawer**: Theme-aware borders and backgrounds
- **Profile Menu**: Theme-aware dropdown styling

#### Admin Management Pages
- **Dialog Titles**: Use theme-aware colors instead of hardcoded white
- **Tables**: Proper contrast in both themes
- **Forms**: Theme-aware input styling
- **Buttons**: Consistent with theme colors
- **Cards**: Background colors adapt to theme

#### Before (Hardcoded Colors)
```jsx
// ❌ Old way - hardcoded white text
<DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
  Dialog Title
</DialogTitle>
```

#### After (Theme-Aware)
```jsx
// ✅ New way - theme-aware colors
<DialogTitle sx={{ 
  bgcolor: theme.palette.primary.main, 
  color: theme.palette.primary.contrastText 
}}>
  Dialog Title
</DialogTitle>
```

#### Admin Features
- **Dashboard Cards**: Background colors adapt to theme
- **Navigation Sidebar**: Full theme support
- **Data Tables**: Proper contrast and readability
- **Dialog Windows**: Theme-aware styling
- **Form Elements**: Consistent with theme
- **Status Indicators**: Maintain visibility in both themes

### Caption Integration
For Material-UI Typography components, use the ThemeAwareCaption component:

```jsx
import ThemeAwareCaption from './components/ThemeAwareCaption';

// Instead of Typography variant="caption"
<ThemeAwareCaption variant="timestamp">
  {timestamp}
</ThemeAwareCaption>
```

## 📋 Best Practices

### 1. Use Semantic Colors
```css
/* ✅ Good - Use semantic colors */
.success-message { color: var(--color-success); }
.error-message { color: var(--color-error); }

/* ❌ Avoid - Hard-coded colors */
.success-message { color: #22c55e; }
```

### 2. Use Design Tokens
```css
/* ✅ Good - Use design tokens */
.spacing { margin: var(--spacing-4); }
.typography { font-size: var(--text-lg); }

/* ❌ Avoid - Hard-coded values */
.spacing { margin: 16px; }
.typography { font-size: 18px; }
```

### 3. Use Utility Classes
```html
<!-- ✅ Good - Use utility classes -->
<div class="bg-primary text-inverse p-4 rounded-lg shadow-md">
  Content
</div>

<!-- ❌ Avoid - Custom CSS for common patterns -->
<div style="background-color: #3b82f6; color: white; padding: 16px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  Content
</div>
```

### 4. Maintain Accessibility
```css
/* ✅ Good - Ensure sufficient contrast */
.text-on-primary {
  color: var(--text-inverse); /* High contrast on primary background */
}

/* ✅ Good - Use focus indicators */
.focusable:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## 🎯 Component Examples

### Book Card Component
```html
<div class="card">
  <img src="book-cover.jpg" alt="Book Title" class="w-full h-48 object-cover">
  <div class="card-body">
    <h3 class="card-title">Book Title</h3>
    <p class="text-secondary mb-4">Author Name</p>
    <div class="flex justify-between items-center">
      <span class="text-lg font-bold text-brand">$19.99</span>
      <button class="btn btn-primary btn-sm">Add to Cart</button>
    </div>
  </div>
</div>
```

### Navigation Component
```html
<nav class="bg-elevated border-b border-light">
  <div class="container mx-auto px-4 py-3">
    <div class="flex items-center justify-between">
      <a href="/" class="text-xl font-bold text-brand">BookStore</a>
      <div class="flex gap-4">
        <a href="/books" class="nav-item">Books</a>
        <a href="/cart" class="nav-item">Cart</a>
        <a href="/account" class="nav-item">Account</a>
      </div>
    </div>
  </div>
</nav>
```

### Form Component
```html
<form class="max-w-md mx-auto p-6">
  <h2 class="text-2xl font-bold mb-6">Login</h2>
  
  <div class="form-group">
    <label class="form-label">Email</label>
    <input type="email" class="form-input" placeholder="Enter your email">
  </div>
  
  <div class="form-group">
    <label class="form-label">Password</label>
    <input type="password" class="form-input" placeholder="Enter your password">
  </div>
  
  <button type="submit" class="btn btn-primary w-full">Sign In</button>
</form>
```

## 🔄 Migration Guide

### From Hard-coded Colors
```css
/* Before */
.old-component {
  background-color: #3b82f6;
  color: #ffffff;
  padding: 16px;
  border-radius: 8px;
}

/* After */
.new-component {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}
```

### From Inline Styles
```html
<!-- Before -->
<div style="background-color: #3b82f6; color: white; padding: 16px; border-radius: 8px;">
  Content
</div>

<!-- After -->
<div class="bg-primary text-inverse p-4 rounded-lg">
  Content
</div>
```

### From Hardcoded White Backgrounds
```jsx
// Before
<Box sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
  Content
</Box>

// After
<Box sx={{ backgroundColor: theme.palette.background.paper }}>
  Content
</Box>
```

## 📚 Additional Resources

- **CSS Custom Properties**: [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- **Design Tokens**: [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- **Color Accessibility**: [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## 🤝 Contributing

When adding new components or modifying existing ones:

1. Use the established color palette and design tokens
2. Follow the naming conventions
3. Ensure accessibility compliance
4. Test in both light and dark themes
5. Update this documentation if adding new patterns

---

This color palette system provides a solid foundation for consistent, accessible, and maintainable styling across the entire BookStore application.

## 🎯 Troubleshooting

### Theme Not Switching
- Ensure `AppThemeProvider` wraps your app
- Check that `data-theme` attribute is being set on `document.documentElement`
- Verify CSS custom properties are defined for both themes

### Caption Colors Not Updating
- Use `ThemeAwareCaption` component instead of `Typography variant="caption"`
- Ensure proper theme context is available
- Check that CSS custom properties are properly defined

### Profile Section Not Changing
- Verify that `useTheme()` hook is being used
- Check that background colors use theme-aware functions
- Ensure all text colors reference `theme.palette.text.primary/secondary`

### Material-UI Theme Conflicts
- The system automatically syncs Material-UI and CSS themes
- Use `useTheme()` hook for Material-UI components
- Use CSS custom properties for custom styling
