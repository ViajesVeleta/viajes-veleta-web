# Timeline Component Documentation

The `Timeline` component system consists of two parts: `Timeline` (the container) and `TimelineItem` (the individual entries).

## Usage in MDX

These components are available globally in the blog posts. You don't need to import them.

```mdx
<Timeline>
  <TimelineItem 
    date="8 Feb" 
    title="Destination Name" 
    image="/assets/blog-placeholder-2.jpg"
  >
    Detailed description of the day...
    
    *   **Highlights:** You can use markdown inside!
    *   **Arrows:** Bullet points are automatically converted to bold arrows (→).
  </TimelineItem>

  <TimelineItem date="9 Feb" title="Another Stop">
    More travel details here.
  </TimelineItem>
</Timeline>
```

## Features

- **Responsive Design**: Single-column layout optimized for both desktop and mobile.
- **Glassmorphism**: Premium cards with semi-transparent backgrounds and blur effects.
- **Micro-animations**: marker dots include a subtle pulse animation and cards elevate on hover.
- **Auto-alignment**: The central line and marker dots are mathematically centered for a perfect fit.

## Component Props

### Timeline
- `slot`: Content area for `TimelineItem` components.

### TimelineItem
- `date`: (Optional) String representing the date or time.
- `title`: (Optional) The main heading for the entry.
- `image`: (Optional) Path to a featured image.
- `slot`: The main content of the card (supports Markdown).
