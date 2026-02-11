// Update PHP file with all extracted attributes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const attributesFile = path.join(__dirname, '..', 'extracted-attributes.json');
const phpFile = path.join(__dirname, '..', 'bulk-create-attributes.php');

// Read extracted attributes
const attributes = JSON.parse(fs.readFileSync(attributesFile, 'utf8'));

// Convert slug to proper name
function slugToName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate PHP array code
let phpCode = '';
attributes.forEach((slug, index) => {
  const name = slugToName(slug);
  // Escape single quotes in name
  const escapedName = name.replace(/'/g, "\\'");
  phpCode += `    array('name' => '${escapedName}', 'slug' => '${slug}', 'type' => 'select', 'has_archives' => true)`;
  if (index < attributes.length - 1) {
    phpCode += ',';
  }
  phpCode += '\n';
});

console.log(`✅ Generated PHP code for ${attributes.length} attributes\n`);

// Read the PHP file
let phpContent = fs.readFileSync(phpFile, 'utf8');

// Find and replace the attributes array
const startMarker = '$attributes_to_create = array(';
const endMarker = '\n\n// ============================================\n// EXECUTE';

const startIndex = phpContent.indexOf(startMarker);
const endIndex = phpContent.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = phpContent.substring(0, startIndex + startMarker.length) + '\n';
  const after = '\n' + phpContent.substring(endIndex);
  
  phpContent = before + phpCode + after;
  
  // Write back
  fs.writeFileSync(phpFile, phpContent);
  console.log(`✅ Updated ${phpFile} with ${attributes.length} attributes\n`);
  console.log(`📝 File size: ${(fs.statSync(phpFile).size / 1024).toFixed(2)} KB\n`);
} else {
  console.log('⚠️  Could not find markers in PHP file');
  console.log('Start marker found:', startIndex !== -1);
  console.log('End marker found:', endIndex !== -1);
}

