// Check which mapping slugs exist in attributes.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read attributes
const attrsPath = path.join(__dirname, '..', 'public', 'data', 'attributes.json');
const attributes = JSON.parse(fs.readFileSync(attrsPath, 'utf8'));

// Create slug set
const attributeSlugs = new Set(attributes.map(a => (a.slug || '').toLowerCase()));

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

const mappingsDir = path.join(__dirname, '..', 'src', 'config', 'attributeMappings');
const allMappedSlugs = new Set();
const categorySlugMap = {};

mappingFiles.forEach(file => {
  const filePath = path.join(mappingsDir, file);
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract category-attribute mappings
  const matches = content.matchAll(/'([^']+)':\s*\[(.*?)\]/g);
  
  for (const match of matches) {
    const categorySlug = match[1];
    const attrsStr = match[2];
    const attrSlugs = attrsStr.match(/(?:'|")([^'"]+)(?:'|")/g)?.map(s => s.replace(/['"]/g, '')) || [];
    
    categorySlugMap[categorySlug] = attrSlugs;
    attrSlugs.forEach(slug => allMappedSlugs.add(slug.toLowerCase()));
  }
});

console.log('📊 Mapping Coverage Analysis\n');
console.log(`Total attributes in JSON: ${attributes.length}`);
console.log(`Total unique attribute slugs in JSON: ${attributeSlugs.size}`);
console.log(`Total unique slugs in mappings: ${allMappedSlugs.size}\n`);

// Check which mapped slugs exist
const existing = [];
const missing = [];

allMappedSlugs.forEach(slug => {
  if (attributeSlugs.has(slug)) {
    existing.push(slug);
  } else {
    missing.push(slug);
  }
});

console.log(`✅ Existing in JSON: ${existing.length} (${((existing.length / allMappedSlugs.size) * 100).toFixed(1)}%)`);
console.log(`❌ Missing from JSON: ${missing.length} (${((missing.length / allMappedSlugs.size) * 100).toFixed(1)}%)\n`);

if (missing.length > 0) {
  console.log('❌ Missing attribute slugs (first 20):');
  missing.slice(0, 20).forEach(slug => {
    // Try to find similar
    const similar = Array.from(attributeSlugs).filter(s => 
      s.includes(slug) || slug.includes(s) || 
      s.split('-').some(p => slug.includes(p)) || 
      slug.split('-').some(p => s.includes(p))
    ).slice(0, 3);
    
    console.log(`  - ${slug}`);
    if (similar.length > 0) {
      console.log(`    💡 Similar found: ${similar.join(', ')}`);
    }
  });
  
  if (missing.length > 20) {
    console.log(`  ... and ${missing.length - 20} more`);
  }
}

// Check categories with low match rates
console.log('\n📋 Categories with missing attributes:');
let categoriesWithIssues = 0;
Object.entries(categorySlugMap).slice(0, 10).forEach(([catSlug, slugs]) => {
  const missingInCat = slugs.filter(s => !attributeSlugs.has(s.toLowerCase()));
  if (missingInCat.length > 0) {
    categoriesWithIssues++;
    console.log(`  ${catSlug}: ${missingInCat.length}/${slugs.length} missing`);
    console.log(`    Missing: ${missingInCat.slice(0, 3).join(', ')}${missingInCat.length > 3 ? '...' : ''}`);
  }
});

console.log(`\n📊 Summary: ${categoriesWithIssues} categories have missing attribute mappings`);





