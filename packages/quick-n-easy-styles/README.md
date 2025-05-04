# Quick-n-Easy Styles

A classless CSS library with variable-driven theming for the Quick-n-Easy ecosystem. This library allows you to define a single primary color and automatically generates an entire theme based on it.

## Features

- **Variable-driven**: Almost everything is controlled by CSS variables
- **Relative color API**: Generate an entire color palette from a single primary color
- **Classless**: Styles are applied directly to HTML elements without requiring classes
- **Customizable**: Easy to override any aspect of the styling

## Usage

### Basic Setup

```html
<link rel="stylesheet" href="node_modules/quick-n-easy-styles/quickNEasyStyles.css">
```

Or import in your JavaScript/TypeScript file:

```js
import 'quick-n-easy-styles/quickNEasyStyles.css';
```

### Customizing the Theme

To customize the theme, simply override the CSS variables in your own stylesheet:

```css
:root {
  /* Change the primary color to customize the entire theme */
  --qne-primary-color: #9c27b0; /* Purple instead of blue */
  
  /* Optionally override other variables */
  --qne-container-width: 1000px;
  --qne-space-md: 1.25rem;
}
```

## Available Variables

### Colors

- `--qne-primary-color`: The main color of your application
- `--qne-primary-light`: A lighter version of the primary color
- `--qne-primary-lighter`: An even lighter version of the primary color
- `--qne-primary-dark`: A darker version of the primary color
- `--qne-primary-darker`: An even darker version of the primary color

### Semantic Colors

- `--qne-success`: For success states and messages
- `--qne-warning`: For warning states and messages
- `--qne-danger`: For error states and dangerous actions
- `--qne-info`: For informational states and messages

### Spacing

- `--qne-space-xs`: Extra small spacing (0.25rem)
- `--qne-space-sm`: Small spacing (0.5rem)
- `--qne-space-md`: Medium spacing (1rem)
- `--qne-space-lg`: Large spacing (1.5rem)
- `--qne-space-xl`: Extra large spacing (2rem)
- `--qne-space-xxl`: Extra extra large spacing (3rem)

### Layout

- `--qne-container-width`: Maximum width of containers
- `--qne-container-padding`: Padding applied to containers
- `--qne-grid-gap-x`: Horizontal gap in grid layouts
- `--qne-grid-gap-y`: Vertical gap in grid layouts

### Typography

- `--qne-font-family`: Default font family
- `--qne-font-size-xs` through `--qne-font-size-xxxl`: Font size scale
- `--qne-line-height-tight`, `--qne-line-height-normal`, `--qne-line-height-loose`: Line height options

## Integration with Quick-n-Easy Ecosystem

This library is designed to work seamlessly with other Quick-n-Easy packages:

- **quick-n-easy-orm**: For database operations
- **quick-n-easy-api**: For API creation
- **quick-n-easy-inputs**: For form generation

When used together, these packages provide a complete solution for rapidly building web applications with consistent styling.