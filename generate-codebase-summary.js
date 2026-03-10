/**
 * generate-codebase-summary.js
 * 
 * Run: node generate-codebase-summary.js
 * 
 * Yeh script aapki poori codebase scan karke
 * ek codebaseSummary.js file banayega jo AI ke
 * system prompt mein inject hogi.
 * 
 * Place this file in: backend/
 */

const fs   = require('fs');
const path = require('path');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const PROJECT_ROOT = __dirname; // Since script is in root
const OUTPUT_FILE  = path.join(__dirname, 'codebaseSummary.js');

// Jin folders ko scan karna hai
const SCAN_DIRS = [
  'backend/controllers',
  'backend/models',
  'backend/routes',
  'frontend/src/pages',
  'frontend/src/components',
];

// Jin files ko skip karna hai
const SKIP_FILES = [
  'node_modules', '.git', 'dist', 'build',
  '.env', 'package-lock.json', 'yarn.lock',
  'codebaseSummary.js', 'generate-codebase-summary.js'
];

// In extensions ko read karna hai
const READ_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function shouldSkip(name) {
  return SKIP_FILES.some(skip => name.includes(skip));
}

// File se important info extract karo
function extractFileInfo(filePath, content) {
  const info = { path: filePath, routes: [], functions: [], models: [], imports: [] };

  // Express routes: router.get/post/put/delete
  const routeMatches = content.matchAll(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
  for (const m of routeMatches) info.routes.push(`${m[1].toUpperCase()} ${m[2]}`);

  // Function/const exports
  const fnMatches = content.matchAll(/(?:exports\.(\w+)|const\s+(\w+)\s*=\s*async|function\s+(\w+))/g);
  for (const m of fnMatches) {
    const name = m[1] || m[2] || m[3];
    if (name && name.length > 2 && !['req', 'res', 'err', 'next'].includes(name)) {
      info.functions.push(name);
    }
  }

  // Mongoose model name
  const modelMatch = content.match(/mongoose\.model\s*\(\s*['"`](\w+)['"`]/);
  if (modelMatch) info.models.push(modelMatch[1]);

  // React component name (for JSX files)
  const compMatch = content.match(/(?:export default function|export default class|const)\s+(\w+)/);
  if (compMatch) info.functions.unshift(compMatch[1]);

  return info;
}

// Recursive directory scan
function scanDir(dirPath, results = []) {
  if (!fs.existsSync(dirPath)) return results;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldSkip(entry.name)) continue;

    const fullPath = path.join(dirPath, entry.name);
    const relPath  = path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      scanDir(fullPath, results);
    } else if (READ_EXTENSIONS.includes(path.extname(entry.name))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const info    = extractFileInfo(relPath, content);
        results.push(info);
      } catch (e) {
        // skip unreadable files
      }
    }
  }

  return results;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function generateSummary() {
  console.log('🔍 Scanning codebase...\n');

  const allFiles = [];

  for (const dir of SCAN_DIRS) {
    const absDir = path.join(PROJECT_ROOT, dir);
    const files  = scanDir(absDir);
    allFiles.push(...files);
    console.log(`  ✅ ${dir} — ${files.length} files`);
  }

  // Build a clean text summary
  let summary = `## CODEBASE STRUCTURE\n\n`;
  summary += `Total Files Scanned: ${allFiles.length}\n`;
  summary += `Generated: ${new Date().toLocaleString('en-PK')}\n\n`;

  // Group by folder type
  const controllers = allFiles.filter(f => f.path.includes('controller'));
  const models      = allFiles.filter(f => f.path.includes('model'));
  const routes      = allFiles.filter(f => f.path.includes('route'));
  const pages       = allFiles.filter(f => f.path.includes('pages'));
  const components  = allFiles.filter(f => f.path.includes('components'));

  // Controllers
  summary += `### BACKEND CONTROLLERS\n`;
  for (const f of controllers) {
    summary += `\n📁 ${f.path}\n`;
    if (f.functions.length) summary += `   Functions: ${[...new Set(f.functions)].slice(0, 8).join(', ')}\n`;
  }

  // Models
  summary += `\n### DATABASE MODELS (MongoDB/Mongoose)\n`;
  for (const f of models) {
    summary += `\n📁 ${f.path}\n`;
    if (f.models.length) summary += `   Model: ${f.models.join(', ')}\n`;
    if (f.functions.length) summary += `   Schema fields hint: ${[...new Set(f.functions)].slice(0, 6).join(', ')}\n`;
  }

  // Routes
  summary += `\n### API ROUTES\n`;
  for (const f of routes) {
    if (f.routes.length === 0) continue;
    summary += `\n📁 ${f.path}\n`;
    for (const r of f.routes) summary += `   ${r}\n`;
  }

  // Frontend Pages
  summary += `\n### FRONTEND PAGES\n`;
  for (const f of pages) {
    summary += `  • ${f.path}`;
    if (f.functions[0]) summary += ` → ${f.functions[0]}`;
    summary += '\n';
  }

  // Frontend Components
  summary += `\n### FRONTEND COMPONENTS\n`;
  for (const f of components) {
    summary += `  • ${f.path}`;
    if (f.functions[0]) summary += ` → ${f.functions[0]}`;
    summary += '\n';
  }

  // Write output file
  const outputContent = `// AUTO-GENERATED — Do not edit manually
// Run: node generate-codebase-summary.js to regenerate

const CODEBASE_SUMMARY = \`
${summary}
\`;

module.exports = CODEBASE_SUMMARY;
`;

  fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');

  console.log(`\n✅ Summary generated! → backend/codebaseSummary.js`);
  console.log(`📊 ${allFiles.length} files scanned`);
  console.log(`\nNext step: import this in your aiChat-controller.js`);
}

generateSummary();
