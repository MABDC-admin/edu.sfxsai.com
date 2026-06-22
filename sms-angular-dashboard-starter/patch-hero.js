const fs = require('fs');
const path = require('path');

const files = [
  'src/app/pages/teacher/teacher-portal.component.scss',
  'src/app/pages/student/student-portal.component.scss',
  'src/app/pages/admin/teacher-management/teacher-management.component.scss',
  'src/app/pages/principal/principal-portal.component.scss'
];

const registrarHero = `display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  overflow: hidden;
  border: 1px solid rgba(20, 184, 166, 0.18);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(37, 99, 235, 0.08)),
    #ffffff;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
  padding: 22px 24px;`;

const newActions = `.hero-actions button,
.hero-actions a {
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  box-shadow: none;
}

.hero-actions button:first-child,
.hero-actions a:first-child {
  background: #0f766e;
  color: white;
  border-color: #0f766e;
}`;

for (const file of files) {
  const fullPath = path.resolve(__dirname, file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace the hero background and layout block
  content = content.replace(/\.(teacher-hero|student-hero|director-hero)\s*\{[\s\S]*?\n\}/, (match, p1) => {
    return `.${p1} {\n  ${registrarHero}\n}`;
  });

  // Remove the ::after block
  content = content.replace(/\.(teacher-hero|student-hero|director-hero)::after\s*\{[\s\S]*?\n\}/, '');

  // Remove the > * block
  content = content.replace(/\.(teacher-hero|student-hero|director-hero)\s*>\s*\*\s*\{[\s\S]*?\n\}/, '');

  // Update h1 color
  content = content.replace(/(\.(?:teacher-hero|student-hero|director-hero)\s*h1\s*\{[\s\S]*?)\}/, (match, p1) => {
    // If it has color: white, remove it. Add color: #0f172a;
    let newBlock = match.replace(/color:\s*[^;]+;/g, '');
    return newBlock.replace('{', '{\n  color: #0f172a;');
  });

  // Update p color
  content = content.replace(/(\.(?:teacher-hero|student-hero|director-hero)\s*p(?::not\([^)]+\))?\s*\{[\s\S]*?)\}/, (match, p1) => {
    let newBlock = match.replace(/color:\s*[^;]+;/g, '');
    return newBlock.replace('{', '{\n  color: #64748b;');
  });

  // Update eyebrow color and spacing
  content = content.replace(/\.eyebrow\s*\{[\s\S]*?\n\}/, `.eyebrow {
  margin: 0 0 6px;
  color: #0f766e;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}`);

  // Remove specific eyebrow color for hero
  content = content.replace(/\.(teacher-hero|student-hero|director-hero)\s*\.eyebrow\s*\{[\s\S]*?\n\}/, '');

  // Replace hero actions links/buttons
  content = content.replace(/\.hero-actions\s+(?:a|button)\s*\{[\s\S]*?\n\}/, newActions);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Patched ${file}`);
}
