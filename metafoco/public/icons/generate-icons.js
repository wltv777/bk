// Script to generate PNG icons from SVG
// Run with: node generate-icons.js
// Requires: npm install canvas (optional, for real PNG generation)
// For now we create SVG files that can be referenced

const svgContent192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="50%" stop-color="#F5A623"/>
      <stop offset="100%" stop-color="#FF6B35"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" fill="#000000" rx="32"/>
  <text x="96" y="125" text-anchor="middle" dominant-baseline="middle"
    fill="url(#grad)" font-family="Impact, Arial Black, sans-serif"
    font-size="72" font-weight="bold" letter-spacing="4">MF</text>
</svg>`;

console.log('SVG content created');
