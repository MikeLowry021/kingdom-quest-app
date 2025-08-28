# Image Lazy Loading Migration Guide

## Overview
This guide outlines the steps to implement comprehensive image lazy loading and motion preference support across the KingdomQuest application.

## ✅ Completed Implementation

### 1. OptimizedImage Component
- **Location**: `components/ui/optimized-image.tsx`
- **Features**:
  - Automatic lazy loading with Intersection Observer
  - `prefers-reduced-motion` support
  - Error handling and fallbacks
  - Next.js Image optimization integration
  - Custom loading thresholds

### 2. Accessibility Motion CSS
- **Location**: `styles/accessibility-motion.css`
- **Features**:
  - Global `prefers-reduced-motion` support
  - Animation and transition reductions
  - Enhanced focus indicators
  - Loading state accessibility

### 3. Global CSS Integration
- **Location**: `app/globals.css`
- **Status**: ✅ Updated to import accessibility-motion.css

## 🔧 Migration Steps

### Phase 1: Core Components (Priority)
1. **Navigation Component** ✅ COMPLETED
   - Migrated to OptimizedImage
   - Logo now uses lazy loading and motion preferences

2. **LocationTooltip Component** ✅ PARTIALLY COMPLETED
   - Already uses `loading="lazy"` attribute
   - Should be migrated to OptimizedImage for consistency

### Phase 2: Marketing Site
**Files to Update**:
- `marketing/site/kingdomquest-marketing/src/components/sections/Hero.tsx`
- `marketing/site/kingdomquest-marketing/src/components/layout/Footer.tsx`
- `marketing/site/kingdomquest-marketing/src/components/layout/Header.tsx`

**Current Issues**:
- Using regular `<img>` tags instead of optimized components
- No lazy loading implemented
- No motion preference handling

**Recommended Changes**:
```tsx
// Before:
<img src="/images/logo.png" alt="Logo" />

// After:
<OptimizedImage 
  src="/images/logo.png" 
  alt="Logo"
  width={200}
  height={60}
  loading="lazy"
/>
```

### Phase 3: Application Components
1. Update any remaining `<img>` tags to use OptimizedImage
2. Add proper alt text for accessibility
3. Implement appropriate width/height attributes
4. Configure lazy loading thresholds based on content importance

## 🎨 CSS Classes for Motion Preferences

The following CSS classes are now available:

```css
.motion-safe-fade      /* Fade transitions that respect motion preferences */
.motion-safe-scale     /* Scale transforms that respect motion preferences */
.motion-safe-slide     /* Slide animations that respect motion preferences */
.loading-accessible    /* Loading states with motion preference support */
```

## 🧪 Testing Guidelines

### Manual Testing
1. **Enable "Reduce Motion" in OS settings**:
   - macOS: System Preferences > Accessibility > Display > Reduce Motion
   - Windows: Settings > Ease of Access > Display > Show animations
   - Linux: depends on desktop environment

2. **Test scenarios**:
   - Page load animations should be simplified/removed
   - Hover effects should be immediate
   - Loading states should be static
   - Focus indicators should be clearly visible

### Browser DevTools Testing
1. Open Chrome DevTools
2. Go to Rendering tab
3. Enable "Emulate CSS media feature prefers-reduced-motion"
4. Verify animations are disabled

## 📊 Performance Impact

### Benefits:
- **Faster page loads**: Images load only when needed
- **Reduced data usage**: Especially beneficial on mobile
- **Better UX**: Respects user accessibility preferences
- **SEO benefits**: Improved Core Web Vitals

### Metrics to Monitor:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

## 🚀 Deployment Checklist

- [x] OptimizedImage component created
- [x] Accessibility CSS implemented
- [x] Global CSS updated
- [x] Navigation component migrated
- [ ] LocationTooltip component migrated
- [ ] Marketing site components migrated
- [ ] All `<img>` tags identified and catalogued
- [ ] Manual accessibility testing completed
- [ ] Performance regression testing completed

## 📈 Expected Results

After full implementation:
- **Lighthouse Performance**: Should improve from 87 to 90+
- **Lighthouse Accessibility**: Should improve from 88 to 95+
- **User Experience**: Better for users with motion sensitivity
- **Mobile Performance**: Significant improvement on slower connections

