# Aurum Vault Luxury Design System
## Complete Design Token Implementation for NovaBank

### 🎨 Design Philosophy

The Aurum Vault design system transforms NovaBank into an ultra-luxurious banking platform through:

- **Navy/Gold Color Palette**: Sophisticated, trustworthy, and premium
- **Glassmorphism Effects**: Modern, elegant, and high-end visual appeal
- **Neumorphism Elements**: Subtle depth and tactile luxury feel
- **Metallic Animations**: Dynamic, premium interaction feedback
- **Banking-Specific Components**: Purpose-built for financial interfaces

---

## 🎯 Color System

### Primary Brand Colors

```typescript
export const aurumColors = {
  // Navy Spectrum - Primary Brand Color
  navy: {
    50: '#F8F9FB',   // Lightest navy tint
    100: '#E8EBF0',  // Very light navy
    200: '#D1D8E2',  // Light navy
    300: '#A8B4C8',  // Medium light navy
    400: '#7A8BA3',  // Medium navy
    500: '#4F617A',  // Base navy
    600: '#3D4B5F',  // Dark navy
    700: '#2E3744',  // Darker navy
    800: '#1D2128',  // Very dark navy (elevated surfaces)
    900: '#161A20',  // Darkest navy (hover/active)
    950: '#0E1014',  // Primary background (app shell)
  },

  // Gold Spectrum - Accent & Action Color
  gold: {
    50: '#FEFCF8',   // Lightest gold tint
    100: '#FDF9F0',  // Very light gold
    200: '#F8F2E1',  // Light gold backgrounds
    300: '#F0E4C1',  // Disabled states
    400: '#E4CFA1',  // Hover state / focus rings
    500: '#D5B978',  // Primary gold (action/primary text)
    600: '#C4A55E',  // Darker gold
    700: '#A68B47',  // Dark gold
    800: '#8A7138',  // Very dark gold
    900: '#6B5529',  // Darkest gold
  },

  // Slate Spectrum - Supporting Colors
  slate: {
    50: '#F8FAFC',   // Lightest slate
    100: '#F1F5F9',  // Very light slate
    200: '#E2E8F0',  // Light slate
    300: '#CBD5E1',  // Medium light slate
    400: '#94A3B8',  // Medium slate (borders)
    500: '#64748B',  // Base slate
    600: '#475569',  // Dark slate
    700: '#334155',  // Darker slate
    800: '#1E293B',  // Very dark slate
    900: '#0F172A',  // Darkest slate
  },
}
```

### Semantic Colors

```typescript
export const aurumSemanticColors = {
  // Status Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#46D68C',  // Successful transactions
    600: '#16A34A',
    900: '#14532D',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#FF5F56',  // Declined transactions
    600: '#DC2626',
    900: '#7F1D1D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#FFB443',  // SLA breaches
    600: '#D97706',
    900: '#78350F',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#4DAEFF',  // Information badges
    600: '#2563EB',
    900: '#1E3A8A',
  },
}
```

---

## ✨ Luxury Effects System

### Glassmorphism

```css
/* Primary Glassmorphic Effect */
.glass-primary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(14, 16, 20, 0.3);
}

/* Secondary Glassmorphic Effect */
.glass-secondary {
  background: rgba(213, 185, 120, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(213, 185, 120, 0.2);
  box-shadow: 0 4px 16px rgba(213, 185, 120, 0.2);
}

/* Dark Glassmorphic Effect */
.glass-dark {
  background: rgba(22, 26, 32, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

### Neumorphism

```css
/* Neumorphic Inset Effect */
.neuro-inset {
  box-shadow: 
    inset 1px 1px 2px rgba(255, 255, 255, 0.05),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4);
}

/* Neumorphic Raised Effect */
.neuro-raised {
  box-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
}

/* Neumorphic Pressed Effect */
.neuro-pressed {
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.4),
    inset -2px -2px 4px rgba(255, 255, 255, 0.03);
}
```

### Metallic Effects

```css
/* Metallic Gold Gradient */
.metallic-gold {
  background: linear-gradient(
    135deg,
    #D5B978 0%,
    #E4CFA1 25%,
    #F0E4C1 50%,
    #E4CFA1 75%,
    #D5B978 100%
  );
  background-size: 200% 200%;
  animation: metallic-sheen 3s ease-in-out infinite;
}

/* Metallic Animation */
@keyframes metallic-sheen {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Metallic Text Effect */
.metallic-text {
  background: linear-gradient(
    90deg,
    #D5B978 0%,
    #E4CFA1 50%,
    #D5B978 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: metallic-text-shine 2s ease-in-out infinite;
}

@keyframes metallic-text-shine {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
```

---

## 🎭 Animation System

### Luxury Animations

```css
/* Vault Float Animation */
@keyframes vault-float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
  }
  50% { 
    transform: translateY(-8px) rotate(0.5deg);
  }
}

/* Count Up Animation */
@keyframes count-up {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Seal Stamp Animation */
@keyframes seal-stamp {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(-90deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Luxury Slide Up */
@keyframes luxury-slide-up {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Pulse Glow */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(213, 185, 120, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(213, 185, 120, 0.8);
  }
}
```

### Transition System

```css
/* Standard Transitions */
.transition-fast {
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-normal {
  transition: all 240ms cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-slow {
  transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Spring Transitions */
.transition-spring {
  transition: all 240ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Dramatic Transitions */
.transition-dramatic {
  transition: all 600ms cubic-bezier(0.19, 1, 0.22, 1);
}
```

---

## 📐 Typography System

### Font Hierarchy

```typescript
export const aurumTypography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  
  fontSize: {
    // Display Sizes (Headers)
    'display-2xl': {
      size: '36px',
      lineHeight: '40px',
      letterSpacing: '-0.3px',
      weight: 700,
    },
    'display-xl': {
      size: '28px',
      lineHeight: '32px',
      letterSpacing: '-0.2px',
      weight: 600,
    },
    'display-lg': {
      size: '22px',
      lineHeight: '28px',
      letterSpacing: '-0.1px',
      weight: 600,
    },
    
    // Body Sizes
    'body-xl': {
      size: '18px',
      lineHeight: '26px',
      letterSpacing: '0px',
      weight: 500,
    },
    'body-lg': {
      size: '16px',
      lineHeight: '24px',
      letterSpacing: '0px',
      weight: 500,
    },
    'body-md': {
      size: '14px',
      lineHeight: '20px',
      letterSpacing: '0px',
      weight: 400,
    },
    'body-sm': {
      size: '12px',
      lineHeight: '16px',
      letterSpacing: '0.1px',
      weight: 400,
    },
    'body-xs': {
      size: '10px',
      lineHeight: '14px',
      letterSpacing: '0.1px',
      weight: 400,
    },
  },
}
```

### Typography Classes

```css
/* Display Typography */
.text-display-2xl {
  font-size: 36px;
  line-height: 40px;
  letter-spacing: -0.3px;
  font-weight: 700;
}

.text-display-xl {
  font-size: 28px;
  line-height: 32px;
  letter-spacing: -0.2px;
  font-weight: 600;
}

.text-display-lg {
  font-size: 22px;
  line-height: 28px;
  letter-spacing: -0.1px;
  font-weight: 600;
}

/* Body Typography */
.text-body-xl {
  font-size: 18px;
  line-height: 26px;
  letter-spacing: 0px;
  font-weight: 500;
}

.text-body-lg {
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0px;
  font-weight: 500;
}

.text-body-md {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0px;
  font-weight: 400;
}

.text-body-sm {
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
  font-weight: 400;
}
```

---

## 📏 Spacing & Layout System

### 4-Point Spacing Scale

```typescript
export const aurumSpacing = {
  // Base 4-point scale
  0: '0px',
  1: '4px',    // xs - smallest spacing unit
  2: '8px',    // sm - small gaps
  3: '12px',   // md-sm - compact layouts
  4: '16px',   // md - standard spacing
  5: '20px',   // md-lg - medium-large spacing
  6: '24px',   // lg - section spacing
  7: '28px',   // lg-xl - large spacing
  8: '32px',   // xl - large gaps
  10: '40px',  // 2xl - very large gaps
  12: '48px',  // 3xl - major section spacing
  16: '64px',  // 4xl - huge spacing
  20: '80px',  // 5xl - massive spacing
  24: '96px',  // 6xl - extreme spacing
}
```

### Component Sizing

```typescript
export const aurumComponentSizes = {
  // KPI Cards - Exact specifications
  kpiCard: {
    width: '240px',
    height: '120px',
    borderRadius: '12px',
    padding: '16px',
  },
  
  // Sidebar Dimensions
  sidebar: {
    expanded: '240px',
    collapsed: '64px',
    transition: '240ms ease-in-out',
  },
  
  // Queue Row Heights
  queueRow: {
    height: '56px',
    padding: '12px 16px',
  },
  
  // Detail Drawer
  detailDrawer: {
    width: '480px',
    maxHeight: '100vh',
  },
  
  // SLA Clock
  slaClock: {
    diameter: '20px',
    strokeWidth: '2px',
  },
  
  // Balance Ring
  balanceRing: {
    small: '120px',   // Mobile
    medium: '150px',  // Tablet
    large: '180px',   // Desktop
  },
  
  // Buttons
  button: {
    sm: { height: '32px', padding: '0 12px', fontSize: '12px' },
    md: { height: '40px', padding: '0 16px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 24px', fontSize: '16px' },
    xl: { height: '56px', padding: '0 32px', fontSize: '18px' },
  },
}
```

---

## 🎨 Component Variants

### Button Variants

```css
/* Primary Gold Button */
.btn-primary {
  background: linear-gradient(135deg, #D5B978 0%, #E4CFA1 100%);
  color: #0E1014;
  border: none;
  font-weight: 600;
  transition: all 240ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #E4CFA1 0%, #F0E4C1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(213, 185, 120, 0.4);
}

/* Secondary Navy Button */
.btn-secondary {
  background: #161A20;
  color: #D5B978;
  border: 1px solid #D5B978;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #1D2128;
  border-color: #E4CFA1;
  color: #E4CFA1;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: #D5B978;
  border: 1px solid rgba(213, 185, 120, 0.3);
}

.btn-ghost:hover {
  background: rgba(213, 185, 120, 0.1);
  border-color: #D5B978;
}
```

### Card Variants

```css
/* Primary Glass Card */
.card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(14, 16, 20, 0.3);
}

/* KPI Card */
.card-kpi {
  width: 240px;
  height: 120px;
  background: #161A20;
  border: 1px solid #242933;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.card-kpi::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #D5B978 0%, #E4CFA1 100%);
}

/* Transaction Card */
.card-transaction {
  background: #1D2128;
  border: 1px solid #242933;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 120ms ease-out;
}

.card-transaction:hover {
  background: #242933;
  border-color: #2B3139;
  transform: translateY(-1px);
}
```

---

## 🔧 Implementation Guide

### 1. Tailwind Configuration

```javascript
// tailwind.config.js
const { aurumColors, aurumSemanticColors } = require('./src/styles/aurum-colors');
const { aurumTypography, aurumSpacing } = require('./src/styles/aurum-tokens');

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ...aurumColors,
        ...aurumSemanticColors,
        
        // Shadcn/UI integration
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: aurumColors.gold[500],
          foreground: aurumColors.navy[950],
        },
        secondary: {
          DEFAULT: aurumColors.navy[800],
          foreground: aurumColors.gold[400],
        },
      },
      
      fontFamily: aurumTypography.fontFamily,
      fontSize: aurumTypography.fontSize,
      spacing: aurumSpacing,
      
      animation: {
        'vault-float': 'vault-float 6s ease-in-out infinite',
        'metallic-sheen': 'metallic-sheen 3s ease-in-out infinite',
        'count-up': 'count-up 0.6s ease-out',
        'seal-stamp': 'seal-stamp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'luxury-slide-up': 'luxury-slide-up 0.4s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 2. CSS Variables

```css
/* globals.css */
:root {
  /* Aurum Vault Color Variables */
  --aurum-navy-950: #0E1014;
  --aurum-navy-900: #161A20;
  --aurum-navy-800: #1D2128;
  --aurum-navy-700: #242933;
  --aurum-gold-500: #D5B978;
  --aurum-gold-400: #E4CFA1;
  --aurum-gold-300: #F0E4C1;
  
  /* Shadcn/UI Variables */
  --background: var(--aurum-navy-950);
  --foreground: var(--aurum-gold-400);
  --card: var(--aurum-navy-800);
  --card-foreground: var(--aurum-gold-400);
  --popover: var(--aurum-navy-800);
  --popover-foreground: var(--aurum-gold-400);
  --primary: var(--aurum-gold-500);
  --primary-foreground: var(--aurum-navy-950);
  --secondary: var(--aurum-navy-800);
  --secondary-foreground: var(--aurum-gold-400);
  --muted: var(--aurum-navy-700);
  --muted-foreground: var(--aurum-slate-300);
  --accent: var(--aurum-gold-400);
  --accent-foreground: var(--aurum-navy-950);
  --destructive: #FF5F56;
  --destructive-foreground: var(--aurum-gold-400);
  --border: var(--aurum-navy-700);
  --input: var(--aurum-navy-700);
  --ring: var(--aurum-gold-400);
  --radius: 0.5rem;
}
```

### 3. Component Usage Examples

```tsx
// Luxury Button Component
import { Button } from "@/components/ui/button"

<Button className="btn-primary metallic-gold">
  Transfer Funds
</Button>

// Glass Card Component
<div className="card-glass p-6">
  <h3 className="text-display-lg text-gold-400 metallic-text">
    Account Balance
  </h3>
  <p className="text-body-lg text-slate-200">
    $1,234,567.89
  </p>
</div>

// KPI Card with Animation
<div className="card-kpi group hover:scale-105 transition-spring">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-body-sm text-slate-300">Total Assets</p>
      <p className="text-display-lg text-gold-400 animate-count-up">
        $2.4M
      </p>
    </div>
    <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
      <TrendingUpIcon className="w-4 h-4 text-gold-400" />
    </div>
  </div>
  <div className="mt-2">
    <span className="text-body-xs text-success-500">+12.5%</span>
    <span className="text-body-xs text-slate-400 ml-2">vs last month</span>
  </div>
</div>
```

---

## 📱 Responsive Design

### Breakpoint System

```typescript
export const aurumBreakpoints = {
  xs: '320px',   // Mobile small
  sm: '640px',   // Mobile large
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop small
  xl: '1280px',  // Desktop large
  '2xl': '1536px', // Desktop extra large
}
```

### Responsive Utilities

```css
/* Mobile First Approach */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}

@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

*This design system provides the complete foundation for transforming NovaBank into the luxury Aurum Vault banking experience with consistent, premium visual design and interactions.*