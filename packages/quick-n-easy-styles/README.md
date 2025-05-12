# Quick 'n Easy Styles (QNE Styles)

**A super simple, variable-driven CSS library for rapidly styling websites with diverse aesthetics.**

QNE Styles is designed to make it easy to get a good-looking website up and running quickly. By primarily adjusting a small set of CSS root variables, you can dramatically alter the visual appearance of your site to achieve styles like Neo-Brutalism, Minimalism, Flat Design, Material-inspired looks, or clean Dark/Light modes without writing extensive custom CSS.

The library also provides basic styling for semantic HTML elements (class-less approach) and includes a set of common UI components.

**Live Demo & Full Documentation:** See `index.html` in this repository for a live demonstration, component examples, a theme switcher, and detailed documentation.

## Features

* **Variable-Driven:** Customize the entire look and feel by changing ~10 core CSS variables.
* **Derived Styles:** Lighter/darker accent shades, border colors, surface colors, and spacing/typography scales are automatically derived from the core variables.
* **Class-less Basics:** Standard HTML elements (`<h1>`, `<p>`, `<table>`, `<nav>`, etc.) are styled by default for a clean look without needing extra classes.
* **Component Library:** Includes common UI components like Hero, Card, Grid, Accordion, Modal, Login Form, Tabs, and Carousel.
* **Single CSS File:** All styles are contained in `quick-n-easy-styles.css`.
* **Optional JavaScript:** A single `quick-n-easy-scripts.js` file provides interactivity for components like modals, accordions, tabs, and carousels.
* **Easy to Get Started:** Link the CSS and JS, and you're ready to go!

## Getting Started

1.  **Download:** Get the `quick-n-easy-styles.css` and `quick-n-easy-scripts.js` files.
2.  **Link Files in Your HTML:**
    Add the CSS file to the `<head>` of your HTML document:
    ```html
    <link rel="stylesheet" href="path/to/quick-n-easy-styles.css">
    ```
    Add the JavaScript file just before the closing `</body>` tag (use `defer` for better performance):
    ```html
    <script src="path/to/quick-n-easy-scripts.js" defer></script>
    ```
3.  **Start Building:** Use semantic HTML. For more complex elements, use the provided component classes (see `index.html` for examples).
4.  **Customize:** Modify the core CSS variables (see below) in `quick-n-easy-styles.css` or by overriding them in your own stylesheet or a `<style>` tag in your HTML head.

## Core Customizable CSS Variables

These 10 variables are the primary controls for the library's appearance. They are defined within the `:root` selector in `quick-n-easy-styles.css`.

* `--qne-bg-color`: Main background color of the page.
    * *Example:* `#ffffff` (white), `#121212` (dark grey for dark mode)
* `--qne-text-color`: Main text color.
    * *Example:* `#333333` (dark grey), `#e0e0e0` (light grey for dark mode)
* `--qne-accent-color`: Primary color for links, buttons, active states, and other highlights.
    * *Example:* `#007bff` (blue), `#ff5722` (orange)
* `--qne-accent-text-color`: Text color for elements with an accent background (e.g., text on buttons).
    * *Example:* `#ffffff` (white), `#000000` (black)
* `--qne-page-width`: Maximum width of the main content area.
    * *Example:* `1100px`, `960px`
* `--qne-border-radius`: Controls the roundness of corners for elements like cards, buttons, and inputs.
    * *Example:* `8px` (rounded), `0px` (sharp/Brutalist), `20px` (very rounded)
* `--qne-gap-size`: Base unit for spacing (padding, margins, layout gaps).
    * *Example:* `1.5rem`, `2rem` (for more spacious layouts)
* `--qne-font-size-base`: Base font size for the document (affects `rem` units).
    * *Example:* `16px`, `15px`
* `--qne-font-family-base`: Default font stack for the site.
    * *Example:* `system-ui, -apple-system, sans-serif`, `'Courier New', monospace`
* `--qne-shadow-definition`: Defines the `box-shadow` style used across components. This is crucial for achieving different aesthetics.
    * *Flat/Minimalist:* `none`
    * *Neo-Brutalist:* `3px 3px 0px var(--qne-text-color)` (or a fixed color like `#000`)
    * *Material/Soft:* `0 4px 12px rgba(0,0,0,0.1)`

## Achieving Different Styles

The power of QNE Styles lies in how these variables interact. Here are some examples:

* **Neo-Brutalism:**
    * `--qne-border-radius: 0px;`
    * `--qne-shadow-definition: 3px 3px 0px #000000;` (or `var(--qne-text-color)`)
    * `--qne-bg-color: #FFFF00;` (or another bright color)
    * `--qne-text-color: #000000;`
    * `--qne-accent-color: #FF00FF;` (another contrasting bright color)
    * `--qne-font-family-base: 'Arial Black', Gadget, sans-serif;` (or a monospace font)
    * `--qne-gap-size: 2rem;` (or larger)
* **Minimalist/Flat:**
    * `--qne-shadow-definition: none;`
    * `--qne-border-radius: 0px;` (or very small)
    * Use a muted or monochromatic color palette for `*-color` variables.
    * Focus on typography and whitespace (adjust `--qne-gap-size`).
* **Clean Dark Mode:**
    * `--qne-bg-color: #1e272e;`
    * `--qne-text-color: #e0e0e0;`
    * `--qne-accent-color: #3498db;`
    * `--qne-shadow-definition: 0 5px 15px rgba(0, 0, 0, 0.3);` (subtle, darker shadows)
* **Material Inspired:**
    * `--qne-border-radius: 4px;`
    * `--qne-shadow-definition: 0 2px 4px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.08);`
    * `--qne-font-family-base: 'Roboto', sans-serif;`
    * Use Material Design color palettes.

Experiment with these variables to create your desired look!

## Class-less Styling

Many common HTML elements are styled by default to provide a clean and consistent appearance without needing to add specific classes. This includes:

* Headings (`h1` through `h6`)
* Paragraphs (`p`)
* Links (`a`)
* Lists (`ul`, `ol`, `li`)
* Blockquotes (`blockquote`)
* Tables (`table`, `th`, `td`)
* Forms (`form`, `label`, `input`, `select`, `textarea`, `button`, `fieldset`, `legend`)
* Horizontal rules (`hr`)
* Basic page structure (`header`, `nav`, `main`, `footer`) - `nav > ul > li > a` is automatically styled as a navbar.

## Components

For more complex UI patterns, QNE Styles provides a set of components. These require specific CSS classes (prefixed with `qne-`) and some rely on `quick-n-easy-scripts.js` for interactivity.

* `.qne-hero`
* `.qne-card` (with `.qne-card-title`, `.qne-card-content`)
* `.qne-grid-3col` (for arranging cards or other content)
* `.qne-accordion`, `.qne-accordion-item`, etc. (JS dependent)
* `.qne-modal`, `.qne-modal-content`, etc. (JS dependent)
* `.qne-form-container` (often used with `.qne-card`)
* `.qne-tabs`, `.qne-tab-list`, `.qne-tab-button`, etc. (JS dependent)
* `.qne-carousel`, `.qne-carousel-inner`, `.qne-carousel-item`, etc. (JS dependent)

Refer to the `index.html` file for detailed HTML structures and examples of these components in action.

## Contributing

This is a simple library, but suggestions for improvement or new, commonly used components are welcome! Feel free to open an issue or submit a pull request.

## License

This project is open source and available under the [MIT License](LICENSE.txt) (You would create a LICENSE.txt file with the MIT license text).
