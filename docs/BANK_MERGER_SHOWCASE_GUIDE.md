# Bank Merger Showcase - Customization Guide

## Overview

The Bank Merger Showcase section has been successfully integrated into the homepage, replacing the "Our Legacy by Numbers" section. It displays a beautiful animated marquee of merged banking institutions with trust indicators.

## Location

- **Component**: `/corporate-website/components/commercial/BankMergerShowcase.tsx`
- **Used in**: `/corporate-website/app/page.tsx` (Homepage)

## How to Customize

### 1. Replace Logo Placeholders

The component currently shows placeholder logos with initials. To use actual logo images:

**Step 1**: Add your logo files to `/corporate-website/public/assets/merged-banks/`

**Step 2**: Update the logo display in the `LogoCard` component (around line 282):

Replace this section:

```tsx
{/* Logo placeholder - replace with actual logo image */}
<div style={{
  width: '100px',
  height: '100px',
  background: `linear-gradient(135deg, ${isHovered ? '#7D9B7B' : '#C8D5C7'}, ${isHovered ? '#D4AF7A' : '#E8DCC8'})`,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  fontFamily: "'Playfair Display', serif",
  fontSize: '20px',
  fontWeight: '700',
  color: '#ffffff',
  filter: isHovered ? 'none' : 'grayscale(0.3)',
  transition: 'all 0.3s ease',
  position: 'relative',
  zIndex: 1
}}>
  {institution.logo}
</div>
```

With this:

```tsx
{/* Actual logo image */}
<img 
  src={`/assets/merged-banks/${institution.logo}`}
  alt={`${institution.name} logo`}
  style={{
    width: '100px',
    height: 'auto',
    marginBottom: '16px',
    filter: isHovered ? 'none' : 'grayscale(0.3)',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1
  }}
/>
```

### 2. Update Institution Data

Replace the `institutions` array (around line 17) with your actual bank data:

```tsx
const institutions: Institution[] = [
  {
    id: 1,
    name: "Your Bank Name",
    type: "acquisition", // or "partnership"
    year: 2024,
    logo: "bank-logo.svg" // filename in /public/assets/merged-banks/
  },
  {
    id: 2,
    name: "Another Bank Name",
    type: "partnership",
    year: 2023,
    logo: "another-bank-logo.png"
  },
  // Add more institutions as needed
];
```

**Institution Types:**

- `"acquisition"` - For banks that were acquired
- `"partnership"` - For strategic partnerships

### 3. Customize Trust Badges

Update the statistics in the trust indicators section (around line 189) to match your bank's actual metrics:

```tsx
<TrustBadge 
  number="100+"
  label="Years Combined Experience"
/>
<TrustBadge 
  number="5"
  label="Trusted Institutions United"
/>
<TrustBadge 
  number="$2B+"
  label="Assets Under Management"
/>
```

Change the `number` and `label` props to reflect your actual data.

### 4. Customize Section Text

Update the header text (around line 106):

```tsx
<h2 style={{...}}>
  Built on a Legacy of Trust
</h2>
<p style={{...}}>
  Through strategic partnerships and acquisitions, we've united 5 trusted financial 
  institutions under one roof. Expanded services, broader reach, same local expertise.
</p>
```

### 5. Adjust Animation Speed

To change the marquee scroll speed, modify the animation duration in the inline style (around line 165):

```tsx
animation: isPaused ? 'none' : 'scroll 30s linear infinite',
```

- Increase `30s` for slower scrolling
- Decrease `30s` for faster scrolling

### 6. Customize Colors

The component uses these main colors:

- **Primary Green**: `#7D9B7B`
- **Gold Accent**: `#D4AF7A`
- **Dark Text**: `#2C3E2A`
- **Light Text**: `#5A6C57`
- **Background**: `#f8f9f7`

You can find and replace these hex values throughout the component to match your brand colors.

## File Structure

```
corporate-website/
├── components/
│   └── commercial/
│       └── BankMergerShowcase.tsx  ← Main component
├── public/
│   └── assets/
│       └── merged-banks/           ← Add your logo images here
│           ├── bank1-logo.svg
│           ├── bank2-logo.png
│           └── ...
└── app/
    └── page.tsx                    ← Homepage using the component
```

## Features

✅ **Smooth Animations**: Infinite marquee scroll with pause on hover
✅ **Responsive Design**: Works on all screen sizes
✅ **Interactive Cards**: Hover effects with smooth transitions
✅ **Accessibility**: Respects `prefers-reduced-motion` settings
✅ **TypeScript**: Full type safety with proper interfaces

## Notes

- The component uses inline styles for maximum portability
- Fonts are loaded from Google Fonts (Playfair Display & Inter)
- The marquee duplicates institutions 3 times for seamless infinite scroll
- All animations pause when user hovers over the section
