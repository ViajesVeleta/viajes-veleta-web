---
description: Web Development Best Practices and Standards
---

# Web Development Standards

## Core Principle: Use Standard Solutions First

**Before writing custom code, ALWAYS ask:**
1. Is there a native CSS solution?
2. Is there a standard HTML attribute/feature?
3. Is there a well-established pattern?

**Only use JavaScript when:**
- CSS/HTML cannot accomplish the task
- You need dynamic data manipulation
- You need to interact with APIs
- Complex state management is required

---

## Common Scenarios & Best Practices

### 1. Responsive Design

#### ❌ WRONG: JavaScript-based responsive toggling
```javascript
// DON'T: Calculate widths and toggle visibility with JS
function checkOverflow() {
    if (menuWidth > screenWidth) {
        hideDesktopMenu();
        showMobileMenu();
    }
}
window.addEventListener('resize', checkOverflow);
```

**Problems:**
- Flickering during resize
- Performance issues
- State management complexity
- Race conditions

#### ✅ CORRECT: CSS Media Queries
```css
/* DO: Use standard CSS media queries */
@media (max-width: 1100px) {
    .desktop-menu { display: none; }
    .mobile-menu { display: flex; }
}
```

**Benefits:**
- Browser-optimized
- Zero flickering
- No JavaScript overhead
- Standard, reliable, maintainable

---

### 2. Animations & Transitions

#### ❌ WRONG: JavaScript animations
```javascript
// DON'T: Manually animate with JS
function slideIn() {
    let pos = 0;
    const interval = setInterval(() => {
        pos += 5;
        element.style.left = pos + 'px';
    }, 16);
}
```

#### ✅ CORRECT: CSS Transitions/Animations
```css
/* DO: Use CSS for animations */
.menu {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}
.menu.open {
    transform: translateX(0);
}
```

---

### 3. Layout & Positioning

#### ❌ WRONG: JavaScript layout calculations
```javascript
// DON'T: Calculate positions with JS
function centerElement() {
    const parent = element.parentElement;
    element.style.left = (parent.width - element.width) / 2 + 'px';
}
```

#### ✅ CORRECT: Flexbox or Grid
```css
/* DO: Use CSS layout systems */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

---

### 4. Styling & Visual States

#### ❌ WRONG: Toggle classes for simple state changes
```javascript
// DON'T: Use JS for hover states
element.addEventListener('mouseenter', () => {
    element.classList.add('hovered');
});
```

#### ✅ CORRECT: CSS Pseudo-classes
```css
/* DO: Use CSS pseudo-classes */
.button:hover {
    background: blue;
}
.button:active {
    transform: scale(0.95);
}
```

---

## Decision-Making Framework

### When evaluating a solution, ask in this order:

1. **Can CSS do this?**
   - Layout: Flexbox, Grid
   - Responsive: Media queries
   - Animation: Transitions, keyframes
   - States: Pseudo-classes (`:hover`, `:focus`, `:active`)
   - → Use CSS

2. **Can HTML do this?**
   - Forms: Native input types
   - Validation: HTML5 validation attributes
   - Semantics: Proper HTML5 elements
   - → Use HTML

3. **Is there a Web API for this?**
   - Intersection Observer for scroll detection
   - ResizeObserver for size changes
   - localStorage for persistence
   - → Use the Web API

4. **Only then consider custom JavaScript**
   - Complex business logic
   - API integration
   - Dynamic data manipulation
   - Advanced interactivity

---

## Red Flags: When You're Probably Doing It Wrong

🚩 **Writing resize event listeners** → Use media queries
🚩 **Calculating element positions** → Use Flexbox/Grid
🚩 **Manual animation loops** → Use CSS transitions
🚩 **Toggle visibility on resize** → Use media queries
🚩 **Measuring element widths for layout** → Use CSS
🚩 **setTimeout for animations** → Use CSS transitions
🚩 **Complex state to track UI** → Simplify with CSS

---

## The Complexity Hierarchy

```
Most Simple & Reliable ↓

1. CSS (declarative, browser-optimized)
   ↓
2. HTML (semantic, accessible)
   ↓
3. Web APIs (standard, well-tested)
   ↓
4. Minimal JavaScript (only when necessary)
   ↓
5. Complex JavaScript (last resort)

Most Complex & Error-Prone ↑
```

---

## Example: Responsive Menu (This Repository)

### What We Initially Did Wrong ❌
- JavaScript overflow detection
- Width calculations on every resize
- State management with hysteresis
- Complex toggling logic
- ~100 lines of buggy JavaScript

### What We Should Have Done ✅
```css
@media (max-width: 1100px) {
    .desktop-menu { display: none !important; }
    .mobile-menu { display: flex !important; }
}
```
- 4 lines of CSS
- Zero bugs
- Perfect reliability
- Standard solution

---

## Guidelines for AI Agents & Developers

### Before implementing ANY web feature:

1. **Research first**: "How do most websites handle this?"
2. **Check MDN**: Look for native CSS/HTML solutions
3. **Prefer simplicity**: The simpler solution is usually better
4. **Avoid premature optimization**: Don't over-engineer
5. **Test with CSS first**: Try the declarative approach
6. **Question complexity**: If it feels complex, there's probably a simpler way

### When reviewing code:

- **Can this CSS be replaced with a standard media query?** → Do it
- **Can this JS calculation be replaced with Flexbox?** → Do it
- **Can this state management be replaced with CSS classes?** → Do it
- **Is this feature available natively in modern browsers?** → Use the native feature

---

## Summary

**The Golden Rule:**
> "Use the least powerful language suitable for a given task"
> - CSS over JavaScript
> - HTML over CSS
> - Standard over custom

**Remember:**
- CSS is declarative, performant, and browser-optimized
- JavaScript should be for **behavior**, not **presentation**
- Standards exist because they work
- Complexity is technical debt

---

## References

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)
- [Web.dev](https://web.dev/)
- [Can I Use](https://caniuse.com/)
