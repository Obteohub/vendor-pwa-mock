// Generate a report of missing attributes and suggest fixes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read attributes
const attrsPath = path.join(__dirname, '..', 'public', 'data', 'attributes.json');
const attributes = JSON.parse(fs.readFileSync(attrsPath, 'utf8'));

// Create lookup
const attributeSlugs = new Set(attributes.map(a => (a.slug || '').toLowerCase()));
const attributeNames = new Map(attributes.map(a => [a.name.toLowerCase(), a]));

// Read categoryAttributeMap
const mapPath = path.join(__dirname, '..', 'src', 'config', 'categoryAttributeMap.js');
// We'll need to import it differently, but for now let's read mapping files

const mappingsDir = path.join(__dirname, '..', 'src', 'config', 'attributeMappings');
const allMappedSlugs = new Set();
const missingSlugs = [];

// Read all mapping files
const mappingFiles = [
  'automotive.js',
  'booksMedia.js',
  'electronics.js',
  'fashion.js',
  'gardenOutdoor.js',
  'groceryFood.js',
  'healthBeauty.js',
  'healthWellness.js',
  'homeAppliances.js',
  'homeGarden.js',
  'petSupplies.js',
  'sportsFitness.js',
  'stationeryOffice.js',
  'toysBaby.js'
];

mappingFiles.forEach(file => {
  const filePath = path.join(mappingsDir, file);
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.matchAll(/(?:'|")([^'"]+)(?:'|")/g);
  
  for (const match of matches) {
    const slug = match[1].toLowerCase().trim();
    if (slug && !slug.startsWith('//') && slug.length > 1) {
      allMappedSlugs.add(slug);
      
      if (!attributeSlugs.has(slug)) {
        // Try to find similar
        const similar = Array.from(attributeSlugs).filter(s => {
          if (s === slug) return true;
          if (s.includes(slug) || slug.includes(s)) return true;
          const slugParts = slug.split('-');
          const sParts = s.split('-');
          return slugParts.some(p => sParts.includes(p) && p.length > 2);
        }).slice(0, 3);
        
        missingSlugs.push({ slug, similar });
      }
    }
  }
});

// Generate report
const report = {
  totalAttributes: attributes.length,
  totalMappedSlugs: allMappedSlugs.size,
  missingCount: missingSlugs.length,
  matchRate: ((allMappedSlugs.size - missingSlugs.length) / allMappedSlugs.size * 100).toFixed(1),
  missing: missingSlugs.slice(0, 100) // First 100
};

console.log(JSON.stringify(report, null, 2));

// Also save to file
const reportPath = path.join(__dirname, '..', 'mapping-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n✅ Report saved to: ${reportPath}`);





