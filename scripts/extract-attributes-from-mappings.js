// Extract all unique attributes from mapping files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappingsDir = path.join(__dirname, '..', 'src', 'config', 'attributeMappings');
const files = [
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

const allAttributes = new Set();

// Read each mapping file and extract attributes
files.forEach(file => {
  const filePath = path.join(mappingsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all attribute arrays using regex
  // Pattern: ['attr1', 'attr2', 'attr3']
  const attributeArrays = content.match(/\[(?:'|")(?:[^'"]+)(?:'|")(?:\s*,\s*(?:'|")(?:[^'"]+)(?:'|"))*\]/g) || [];
  
  attributeArrays.forEach(arr => {
    // Extract individual attributes from the array
    const attrs = arr.match(/(?:'|")([^'"]+)(?:'|")/g) || [];
    attrs.forEach(attr => {
      // Remove quotes
      const cleanAttr = attr.replace(/['"]/g, '');
      if (cleanAttr && cleanAttr.trim()) {
        allAttributes.add(cleanAttr.trim());
      }
    });
  });
});

// Convert to sorted array
const sortedAttributes = Array.from(allAttributes).sort();

console.log(`\n📊 Found ${sortedAttributes.length} unique attributes:\n`);
console.log(sortedAttributes.join('\n'));

// Generate PHP array format
const phpArray = sortedAttributes.map(attr => {
  // Convert slug to proper name
  const name = attr
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `    array(
        'name' => '${name}',
        'slug' => '${attr}',
        'type' => 'select',
        'has_archives' => true
    ),`;
}).join('\n');

console.log('\n\n📝 PHP Array Format:\n');
console.log(phpArray);

// Save to file
const outputPath = path.join(__dirname, '..', 'extracted-attributes.txt');
fs.writeFileSync(outputPath, `Total: ${sortedAttributes.length} unique attributes\n\n${sortedAttributes.join('\n')}\n\n\nPHP Format:\n\n${phpArray}`);
console.log(`\n✅ Saved to: ${outputPath}`);
