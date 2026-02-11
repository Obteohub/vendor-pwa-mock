// Generate PHP array from extracted attributes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extractedFile = path.join(__dirname, '..', 'extracted-attributes.txt');
const phpFile = path.join(__dirname, '..', 'bulk-create-attributes.php');

// Read extracted attributes
const content = fs.readFileSync(extractedFile, 'utf8');
const lines = content.split('\n');

// Extract attribute slugs (skip header and empty lines)
const attributes = [];
let inList = false;
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed === '' || trimmed.startsWith('Total:') || trimmed.startsWith('PHP')) {
    if (trimmed.startsWith('PHP')) inList = false;
    continue;
  }
  if (trimmed.match(/^[a-z0-9-]+$/)) {
    attributes.push(trimmed);
  }
}

console.log(`Found ${attributes.length} attributes`);

// Generate PHP array entries
const phpEntries = attributes.map(slug => {
  // Convert slug to proper name
  const name = slug
    .split('-')
    .map(word => {
      // Handle special cases
      if (word === 'usb') return 'USB';
      if (word === 'uv') return 'UV';
      if (word === 'ram') return 'RAM';
      if (word === 'ssd') return 'SSD';
      if (word === 'hdd') return 'HDD';
      if (word === 'hdmi') return 'HDMI';
      if (word === 'wifi') return 'WiFi';
      if (word === 'btu') return 'BTU';
      if (word === 'gpm') return 'GPM';
      if (word === 'psi') return 'PSI';
      if (word === 'cfm') return 'CFM';
      if (word === 'dpi') return 'DPI';
      if (word === 'os') return 'OS';
      if (word === 'pc') return 'PC';
      if (word === 'tv') return 'TV';
      if (word === 'led') return 'LED';
      if (word === 'lcd') return 'LCD';
      if (word === 'oled') return 'OLED';
      if (word === 'qled') return 'QLED';
      if (word === '4k') return '4K';
      if (word === '8k') return '8K';
      if (word === 'hdr') return 'HDR';
      if (word === 'epa') return 'EPA';
      if (word === 'dha') return 'DHA';
      if (word === 'npk') return 'NPK';
      if (word === 'spf') return 'SPF';
      if (word === 'upf') return 'UPF';
      if (word === 'nrr') return 'NRR';
      if (word === 'otc') return 'OTC';
      if (word === 'ph') return 'pH';
      if (word === 'id') return 'ID';
      if (word === 'api') return 'API';
      if (word === 'url') return 'URL';
      if (word === 'ip') return 'IP';
      if (word === 'gps') return 'GPS';
      if (word === 'nfc') return 'NFC';
      if (word === 'bluetooth') return 'Bluetooth';
      if (word === 'wifi') return 'WiFi';
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  
  return `    array(
        'name' => '${name}',
        'slug' => '${slug}',
        'type' => 'select',
        'has_archives' => true
    ),`;
}).join('\n');

// Read the PHP file
let phpContent = fs.readFileSync(phpFile, 'utf8');

// Find and replace the attributes array
const startMarker = '// ============================================\n// DEFINE YOUR ATTRIBUTES HERE';
const endMarker = '$attributes_to_create = array(';

const startIndex = phpContent.indexOf(startMarker);
const endIndex = phpContent.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers in PHP file');
  process.exit(1);
}

// Replace the section
const before = phpContent.substring(0, endIndex + endMarker.length);
const after = phpContent.substring(phpContent.indexOf(');', endIndex) || phpContent.length);

const newContent = before + '\n\n' + phpEntries + '\n);\n\n' + after.substring(after.indexOf('echo'));

// Write back
fs.writeFileSync(phpFile, newContent);

console.log(`✅ Updated ${phpFile} with ${attributes.length} attributes`);
