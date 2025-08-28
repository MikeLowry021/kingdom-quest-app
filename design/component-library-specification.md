# KingdomQuest Component Library Specification

*Complete design system components for Christian family app with WCAG AA+ accessibility*

---

## Component Library Philosophy

The KingdomQuest component library provides a comprehensive set of reusable interface elements designed specifically for multigenerational Christian audiences. Every component prioritizes accessibility, biblical authenticity, and spiritual appropriateness while maintaining modern usability standards and visual appeal across all age groups.

### Design System Principles

1. **Accessibility Excellence**: WCAG AA+ compliance with enhanced features for diverse abilities
2. **Multigenerational Support**: Components work seamlessly for users aged 5-85+
3. **Spiritual Appropriateness**: Design language that honors Christian values and contexts
4. **Consistent Experience**: Unified visual language across all components
5. **Developer Friendly**: Clear specifications and implementation guidelines

---

## Responsive Design Framework

### Breakpoint System
Based on device usage patterns and accessibility research for multigenerational users:

```css
/* KingdomQuest Responsive Breakpoints */
:root {
  --breakpoint-xs: 475px;  /* Large phones in landscape */
  --breakpoint-sm: 640px;  /* Small tablets */
  --breakpoint-md: 768px;  /* Standard tablets */
  --breakpoint-lg: 1024px; /* Small desktops/laptops */
  --breakpoint-xl: 1280px; /* Large desktops */
  --breakpoint-2xl: 1536px; /* Very large displays */
}
```

### Touch Target Guidelines
All interactive components meet enhanced accessibility standards:
- **Minimum**: 44×44px (WCAG 2.2 AA requirement)
- **Recommended**: 48×48px (optimal for adults)
- **Children**: 75×75px (enhanced for ages 5-12)
- **Spacing**: 8px minimum between adjacent touch targets

---

## Basic UI Components

### 1. Button Component

#### Button Variants

##### Primary Button
**Purpose**: Main actions, call-to-action elements
**Usage**: "Start Quest", "Save Prayer", "Next Story"

```css
.button-primary {
  /* Sizing & Layout */
  min-height: 2.75rem;           /* 44px minimum touch target */
  padding: 0.75rem 1.5rem;       /* 12px 24px */
  border-radius: 0.5rem;         /* 8px rounded corners */
  
  /* Typography */
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;               /* 16px */
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  
  /* Colors */
  background: var(--color-primary-500);
  color: var(--color-white);
  border: 2px solid var(--color-primary-500);
  
  /* Interaction */
  cursor: pointer;
  transition: all 200ms var(--ease-gentle);
  
  /* Focus & Hover */
  &:hover {
    background: var(--color-primary-600);
    border-color: var(--color-primary-600);
    transform: scale(1.02);
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}
```

##### Secondary Button
**Purpose**: Secondary actions, navigation elements
**Usage**: "Skip", "Back", "Learn More"

```css
.button-secondary {
  /* Inherits primary button base styles */
  background: transparent;
  color: var(--color-primary-500);
  border: 2px solid var(--color-primary-500);
  
  &:hover {
    background: var(--color-primary-50);
    color: var(--color-primary-700);
  }
}
```

##### Tertiary Button
**Purpose**: Low-emphasis actions, links
**Usage**: "Cancel", "Maybe Later", informational links

```css
.button-tertiary {
  background: transparent;
  color: var(--color-primary-600);
  border: none;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
  
  &:hover {
    color: var(--color-primary-800);
    text-decoration-thickness: 2px;
  }
}
```

##### Golden Button (Special Actions)
**Purpose**: Celebration, achievements, premium actions
**Usage**: "Claim Reward", "Complete Quest", "Share Achievement"

```css
.button-golden {
  background: var(--color-secondary-500);
  color: var(--color-primary-900);
  border: 2px solid var(--color-secondary-600);
  font-weight: 800;
  
  &:hover {
    background: var(--color-secondary-600);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }
}
```

#### Size Variations
```css
.button-sm { 
  min-height: 2.5rem; 
  padding: 0.5rem 1rem; 
  font-size: 0.875rem; 
}
.button-lg { 
  min-height: 3.5rem; 
  padding: 1rem 2rem; 
  font-size: 1.125rem; 
}
.button-children { 
  min-height: 4.6875rem; /* 75px for children */
  padding: 1.25rem 2.5rem;
  font-size: 1.25rem;
}
```

### 2. Input Components

#### Text Input
**Purpose**: Single-line text entry
**Accessibility**: Full keyboard navigation, screen reader support

```css
.input-text {
  /* Layout */
  width: 100%;
  min-height: 2.75rem;           /* 44px touch target */
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-neutral-300);
  border-radius: 0.375rem;
  
  /* Typography */
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;               /* 16px prevents zoom on iOS */
  line-height: 1.5;
  
  /* States */
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }
  
  &:invalid {
    border-color: var(--color-error-500);
  }
  
  &[aria-describedby] {
    /* Connected to error/help text */
    margin-bottom: 0.25rem;
  }
}
```

#### Textarea
**Purpose**: Multi-line text entry (prayers, reflections)

```css
.input-textarea {
  /* Extends text input styles */
  min-height: 4.5rem;            /* 72px minimum */
  resize: vertical;
  font-family: 'Crimson Pro', serif; /* For spiritual content */
  line-height: 1.6;
}
```

#### Select Dropdown
**Purpose**: Choose from predefined options

```css
.input-select {
  /* Base input styles plus: */
  appearance: none;
  background-image: url('data:image/svg+xml;base64,...'); /* Custom arrow */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 3rem;
  
  /* Enhanced touch target for mobile */
  @media (max-width: 768px) {
    min-height: 3rem;
  }
}
```

#### Form Field Container
```css
.form-field {
  margin-bottom: 1.5rem;
  
  .form-label {
    display: block;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .form-help {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
  }
  
  .form-error {
    font-size: 0.875rem;
    color: var(--color-error-600);
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
```

### 3. Card Components

#### Base Card
**Purpose**: Container for grouped content
**Usage**: Story previews, content sections, feature highlights

```css
.card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.75rem;         /* 12px rounded */
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 200ms var(--ease-gentle);
  
  /* Hover state for interactive cards */
  &.card-interactive {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--color-primary-200);
    }
    
    &:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
  }
}
```

#### Card Header
```css
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  .card-title {
    font-family: 'Crimson Pro', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .card-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary-500);
  }
}
```

### 4. Navigation Components

#### Primary Navigation
**Purpose**: Main app navigation
**Accessibility**: Keyboard navigation, screen reader support

```css
.nav-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--color-primary-500);
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    min-height: 2.75rem;
    border-radius: 0.5rem;
    color: var(--color-white);
    text-decoration: none;
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    transition: all 200ms var(--ease-gentle);
    
    &:hover, &[aria-current="page"] {
      background: rgba(255, 255, 255, 0.1);
    }
    
    &:focus-visible {
      outline: 2px solid var(--color-white);
      outline-offset: 2px;
    }
  }
}
```

#### Breadcrumb Navigation
```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  
  .breadcrumb-item {
    color: var(--color-text-secondary);
    
    &:not(:last-child)::after {
      content: '›';
      margin-left: 0.5rem;
      color: var(--color-text-tertiary);
    }
    
    &:last-child {
      color: var(--color-text-primary);
      font-weight: 600;
    }
  }
}
```

### 5. Feedback Components

#### Toast Notifications
```css
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  max-width: 24rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 50;
  
  /* Animation */
  animation: gentle-slide-in 300ms var(--ease-gentle);
  
  &.toast-success {
    background: var(--color-success-50);
    border: 1px solid var(--color-success-200);
    color: var(--color-success-800);
  }
  
  &.toast-error {
    background: var(--color-error-50);
    border: 1px solid var(--color-error-200);
    color: var(--color-error-800);
  }
}
```

#### Progress Components
```css
.progress {
  width: 100%;
  height: 0.5rem;
  background: var(--color-neutral-200);
  border-radius: 0.25rem;
  overflow: hidden;
  
  .progress-bar {
    height: 100%;
    background: var(--color-primary-500);
    transition: width 300ms var(--ease-gentle);
    border-radius: inherit;
  }
  
  /* Spiritual growth variant */
  &.progress-spiritual {
    .progress-bar {
      background: linear-gradient(90deg, 
        var(--color-accent-500) 0%, 
        var(--color-secondary-500) 100%);
    }
  }
}
```

---

## Specialized Christian Components

### 1. StoryCard Component

**Purpose**: Display Bible stories and Christian narratives with engaging visuals
**Target Users**: All ages, with special considerations for children

#### Anatomy
```html
<div class="story-card" role="article" tabindex="0">
  <div class="story-card-image">
    <img src="..." alt="..." loading="lazy" />
    <div class="story-card-badge">
      <icon name="scroll" /> New Testament
    </div>
  </div>
  
  <div class="story-card-content">
    <h3 class="story-card-title">Jesus Feeds 5000</h3>
    <p class="story-card-summary">Discover how Jesus showed God's provision...</p>
    
    <div class="story-card-metadata">
      <span class="story-age-group">Ages 5-12</span>
      <span class="story-duration">
        <icon name="clock" /> 8 min read
      </span>
    </div>
    
    <div class="story-card-actions">
      <button class="button-primary">Start Story</button>
      <button class="button-secondary">
        <icon name="bookmark" /> Save
      </button>
    </div>
  </div>
</div>
```

#### Styling
```css
.story-card {
  /* Base card styles extended */
  max-width: 20rem;
  overflow: hidden;
  
  .story-card-image {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 300ms var(--ease-gentle);
    }
    
    .story-card-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(30, 58, 95, 0.9);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }
  
  .story-card-content {
    padding: 1.5rem;
  }
  
  .story-card-title {
    font-family: 'Crimson Pro', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary-800);
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }
  
  .story-card-summary {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .story-card-metadata {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
  }
  
  .story-age-group {
    background: var(--color-accent-100);
    color: var(--color-accent-800);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 600;
  }
  
  &:hover {
    .story-card-image img {
      transform: scale(1.05);
    }
  }
}
```

### 2. QuizCard Component

**Purpose**: Interactive Bible knowledge and comprehension testing
**Accessibility**: Full keyboard navigation, screen reader announcements

#### Anatomy
```html
<div class="quiz-card" role="region" aria-labelledby="quiz-title">
  <div class="quiz-header">
    <h3 id="quiz-title" class="quiz-title">Bible Knowledge Check</h3>
    <div class="quiz-progress">
      <span class="quiz-progress-text">Question 3 of 5</span>
      <div class="progress">
        <div class="progress-bar" style="width: 60%"></div>
      </div>
    </div>
  </div>
  
  <div class="quiz-content">
    <div class="quiz-question">
      <p>What did Jesus use to feed the 5000 people?</p>
    </div>
    
    <div class="quiz-options" role="radiogroup" aria-labelledby="quiz-title">
      <label class="quiz-option">
        <input type="radio" name="quiz-answer" value="a" />
        <span class="quiz-option-text">5 loaves and 2 fish</span>
      </label>
      
      <label class="quiz-option">
        <input type="radio" name="quiz-answer" value="b" />
        <span class="quiz-option-text">Bread from heaven</span>
      </label>
      
      <!-- More options... -->
    </div>
  </div>
  
  <div class="quiz-actions">
    <button class="button-primary" disabled id="quiz-submit">
      Check Answer
    </button>
    <button class="button-tertiary">
      <icon name="lightbulb" /> Hint
    </button>
  </div>
</div>
```

#### Styling & Behavior
```css
.quiz-card {
  /* Extended card styling */
  border: 2px solid var(--color-accent-200);
  
  .quiz-header {
    border-bottom: 1px solid var(--color-border-primary);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .quiz-title {
    font-family: 'Crimson Pro', serif;
    color: var(--color-primary-800);
    margin-bottom: 0.75rem;
  }
  
  .quiz-progress-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
    display: block;
  }
  
  .quiz-question {
    font-size: 1.125rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--color-tertiary-50);
    border-radius: 0.5rem;
    border-left: 4px solid var(--color-secondary-500);
  }
  
  .quiz-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .quiz-option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border: 2px solid var(--color-neutral-200);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 200ms var(--ease-gentle);
    min-height: 2.75rem;
    
    input[type="radio"] {
      margin-top: 0.125rem;
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .quiz-option-text {
      font-size: 1rem;
      line-height: 1.5;
    }
    
    &:hover {
      border-color: var(--color-primary-300);
      background: var(--color-primary-25);
    }
    
    &:has(input:checked) {
      border-color: var(--color-primary-500);
      background: var(--color-primary-50);
    }
    
    /* Correct/Incorrect states */
    &.quiz-option-correct {
      border-color: var(--color-success-500);
      background: var(--color-success-50);
    }
    
    &.quiz-option-incorrect {
      border-color: var(--color-error-500);
      background: var(--color-error-50);
    }
  }
}
```

### 3. PrayerCard Component

**Purpose**: Facilitate prayer requests, thanksgiving, and spiritual reflection
**Sensitivity**: Respectful handling of personal spiritual content

#### Anatomy
```html
<div class="prayer-card" role="region" aria-labelledby="prayer-title">
  <div class="prayer-header">
    <div class="prayer-type-badge">
      <icon name="praying-hands" />
      Prayer Request
    </div>
    <time class="prayer-date" datetime="2025-08-25">
      August 25, 2025
    </time>
  </div>
  
  <div class="prayer-content">
    <h3 id="prayer-title" class="prayer-title">
      Healing for Grandma
    </h3>
    
    <div class="prayer-text">
      <p>Please pray for my grandmother's recovery from surgery...</p>
    </div>
    
    <div class="prayer-scripture" role="region" aria-label="Related Scripture">
      <blockquote class="scripture-quote">
        "The prayer of a righteous person is powerful and effective."
        <cite>James 5:16</cite>
      </blockquote>
    </div>
  </div>
  
  <div class="prayer-actions">
    <button class="button-secondary prayer-action">
      <icon name="heart" />
      Praying (23)
    </button>
    
    <button class="button-tertiary prayer-action">
      <icon name="share" />
      Share with Family
    </button>
    
    <button class="button-tertiary prayer-action">
      <icon name="check" />
      Mark Answered
    </button>
  </div>
</div>
```

#### Styling
```css
.prayer-card {
  /* Base card with spiritual reverence */
  background: var(--color-surface-primary);
  border: 1px solid var(--color-tertiary-200);
  box-shadow: var(--shadow-sm);
  position: relative;
  
  /* Gentle divine glow animation */
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: linear-gradient(135deg, 
      var(--color-secondary-200), 
      transparent 50%, 
      var(--color-accent-200));
    border-radius: inherit;
    z-index: -1;
    opacity: 0.3;
  }
  
  .prayer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    .prayer-type-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--color-accent-100);
      color: var(--color-accent-800);
      padding: 0.5rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .prayer-date {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
  }
  
  .prayer-title {
    font-family: 'Crimson Pro', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary-800);
    margin-bottom: 1rem;
  }
  
  .prayer-text {
    line-height: 1.7;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }
  
  .scripture-quote {
    font-family: 'Crimson Pro', serif;
    font-style: italic;
    padding: 1rem;
    background: var(--color-tertiary-50);
    border-left: 4px solid var(--color-secondary-500);
    border-radius: 0.375rem;
    margin-bottom: 1.5rem;
    
    cite {
      display: block;
      text-align: right;
      font-weight: 600;
      color: var(--color-primary-600);
      margin-top: 0.5rem;
    }
  }
  
  .prayer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border-primary);
  }
}
```

### 4. FamilyAltar Widget

**Purpose**: Daily family devotion and worship time coordinator
**Features**: Multi-user interaction, scheduled content, progress tracking

#### Anatomy
```html
<div class="family-altar-widget" role="region" aria-labelledby="altar-title">
  <div class="altar-header">
    <h2 id="altar-title" class="altar-title">
      <icon name="family-tree" />
      Family Altar Time
    </h2>
    <div class="altar-date">Today - August 25</div>
  </div>
  
  <div class="altar-content">
    <div class="altar-verse-of-day">
      <h3>Today's Verse</h3>
      <blockquote class="daily-scripture">
        "As for me and my house, we will serve the Lord."
        <cite>Joshua 24:15</cite>
      </blockquote>
    </div>
    
    <div class="altar-family-status">
      <h4>Family Participation</h4>
      <div class="family-members">
        <div class="family-member family-member-present" 
             data-member="parent1">
          <div class="member-avatar">
            <icon name="user" />
          </div>
          <span class="member-name">Mom</span>
          <span class="member-status">Ready</span>
        </div>
        
        <div class="family-member family-member-waiting" 
             data-member="child1">
          <div class="member-avatar">
            <icon name="user" />
          </div>
          <span class="member-name">Sarah</span>
          <span class="member-status">Joining...</span>
        </div>
        
        <!-- More family members... -->
      </div>
    </div>
    
    <div class="altar-today-plan">
      <h4>Today's Plan</h4>
      <ol class="altar-activities">
        <li class="altar-activity">
          <icon name="music" />
          <span>Worship Song (5 min)</span>
          <button class="activity-start button-sm">Start</button>
        </li>
        <li class="altar-activity">
          <icon name="scroll" />
          <span>Bible Reading</span>
          <button class="activity-start button-sm">Read</button>
        </li>
        <li class="altar-activity">
          <icon name="praying-hands" />
          <span>Family Prayer</span>
          <button class="activity-start button-sm">Pray</button>
        </li>
      </ol>
    </div>
  </div>
  
  <div class="altar-actions">
    <button class="button-primary button-lg">
      <icon name="play" />
      Begin Family Time
    </button>
    
    <button class="button-secondary">
      <icon name="settings" />
      Customize Plan
    </button>
  </div>
</div>
```

#### Styling & Behavior
```css
.family-altar-widget {
  /* Enhanced card styling for special component */
  background: linear-gradient(135deg, 
    var(--color-surface-primary) 0%, 
    var(--color-tertiary-25) 100%);
  border: 2px solid var(--color-secondary-200);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  max-width: 32rem;
  
  .altar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-secondary-200);
    
    .altar-title {
      font-family: 'Crimson Pro', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary-800);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .altar-date {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }
  }
  
  .daily-scripture {
    font-family: 'Crimson Pro', serif;
    font-size: 1.125rem;
    line-height: 1.8;
    font-style: italic;
    text-align: center;
    padding: 1.5rem;
    background: var(--color-secondary-50);
    border-radius: 0.75rem;
    margin: 1rem 0;
    
    cite {
      display: block;
      margin-top: 1rem;
      font-weight: 700;
      color: var(--color-primary-700);
    }
  }
  
  .family-members {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  
  .family-member {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid var(--color-neutral-200);
    border-radius: 0.75rem;
    min-width: 5rem;
    transition: all 200ms var(--ease-gentle);
    
    .member-avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: var(--color-primary-100);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary-600);
    }
    
    .member-name {
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .member-status {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    
    &.family-member-present {
      border-color: var(--color-success-300);
      background: var(--color-success-25);
      
      .member-avatar {
        background: var(--color-success-100);
        color: var(--color-success-600);
      }
      
      .member-status {
        color: var(--color-success-700);
        font-weight: 600;
      }
    }
    
    &.family-member-waiting {
      border-color: var(--color-warning-300);
      background: var(--color-warning-25);
      
      .member-avatar {
        background: var(--color-warning-100);
        color: var(--color-warning-600);
      }
    }
  }
  
  .altar-activities {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }
  
  .altar-activity {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    transition: background 200ms var(--ease-gentle);
    
    &:hover {
      background: var(--color-primary-25);
    }
    
    svg {
      color: var(--color-secondary-600);
      width: 1.25rem;
      height: 1.25rem;
    }
    
    span {
      flex: 1;
      font-weight: 500;
    }
    
    .activity-start {
      margin-left: auto;
    }
  }
}
```

---

## Implementation Guidelines

### React Component Example
```jsx
// StoryCard Component Implementation
import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

export const StoryCard = ({
  title,
  summary,
  imageUrl,
  ageGroup,
  duration,
  category,
  onStart,
  onSave,
  className = '',
  ...props
}) => {
  return (
    <article 
      className={`story-card ${className}`}
      tabIndex={0}
      {...props}
    >
      <div className="story-card-image">
        <img 
          src={imageUrl} 
          alt={`${title} illustration`}
          loading="lazy"
        />
        <div className="story-card-badge">
          <Icon name="scroll" size={16} />
          {category}
        </div>
      </div>
      
      <div className="story-card-content">
        <h3 className="story-card-title">{title}</h3>
        <p className="story-card-summary">{summary}</p>
        
        <div className="story-card-metadata">
          <span className="story-age-group">{ageGroup}</span>
          <span className="story-duration">
            <Icon name="clock" size={16} />
            {duration}
          </span>
        </div>
        
        <div className="story-card-actions">
          <Button 
            variant="primary" 
            onClick={onStart}
            aria-label={`Start reading ${title}`}
          >
            Start Story
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={onSave}
            aria-label={`Save ${title} for later`}
          >
            <Icon name="bookmark" size={16} />
            Save
          </Button>
        </div>
      </div>
    </article>
  );
};
```

### Accessibility Testing Checklist
- [ ] All interactive elements have minimum 44px touch targets
- [ ] Color contrast ratios exceed 7:1 for enhanced readability
- [ ] Components work with keyboard navigation only
- [ ] Screen readers announce all content meaningfully
- [ ] Focus indicators are clearly visible
- [ ] Components respect `prefers-reduced-motion` settings
- [ ] Text scales appropriately up to 200% without horizontal scrolling
- [ ] Components work across all supported browsers and devices

---

*"Let all things be done decently and in order." - 1 Corinthians 14:40*

**Author:** MiniMax Agent  
**Document Version:** 1.0  
**Last Updated:** August 25, 2025