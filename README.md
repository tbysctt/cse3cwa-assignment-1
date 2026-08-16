# CSE3CWA Assessment: Phoneme Activity Builder

This is a three-part assignment:

1. Frontend design and usability
2. Full-stack cloud application implementation
3. The third stage extends the same project into a data-driven web application and reporting stage. The aim is to demonstrate that the Wordle and Word Search builder can store, process, monitor, and present data in a meaningful operational format.

The app itself is a phoneme acitivity builder, designed for teachers who want to prepare activities for Speech Pathology students. Teachers can configure settings, preview student gameplay, and download a **single self-contained `.html`** file for browser use.

**Accessibility and usability highlights:**

- Keyboard-navigable controls and action buttons
- Visible focus states and skip link
- Hint tooltips with phoneme-to-grapheme mapping (e.g. `/θ/ → TH (as in thin)`)
- Color + pattern feedback for Wordle status clarity
- Responsive layout across compact and wide screens

## Local development

```sh
# Install NPM dependencies
npm install

# Run the development server, available at localhost:3000
npm run dev

# Run the unit tests
npm run test

# Run ESLint
npm run lint

# Build the app for production
npm run build
```
