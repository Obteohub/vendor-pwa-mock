// Script to help manually update JSON data files
// Usage: node scripts/update-json-files.js [file] [action]
// Actions: validate, format, backup

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const FILES = {
  categories: 'categories.json',
  attributes: 'attributes.json',
  brands: 'brands.json',
  locations: 'locations.json'
};

function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Check if it's an array
    if (!Array.isArray(data)) {
      console.log('⚠️  Warning: File is not an array format');
      return { valid: true, data, isArray: false };
    }
    
    console.log(`✅ Valid JSON: ${data.length} items`);
    return { valid: true, data, isArray: true, count: data.length };
  } catch (error) {
    console.error(`❌ Invalid JSON: ${error.message}`);
    return { valid: false, error: error.message };
  }
}

function formatJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const formatted = JSON.stringify(data, null, 2);
    
    fs.writeFileSync(filePath, formatted, 'utf8');
    console.log(`✅ Formatted ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error formatting: ${error.message}`);
    return false;
  }
}

function backupFile(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup-${timestamp}`;
  
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backup created: ${path.basename(backupPath)}`);
    return backupPath;
  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    return null;
  }
}

function showFileInfo(filePath) {
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  const size = (stats.size / 1024).toFixed(2);
  
  console.log(`\n📄 File: ${path.basename(filePath)}`);
  console.log(`   Size: ${size} KB`);
  console.log(`   Items: ${Array.isArray(data) ? data.length : 'N/A'}`);
  console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
  
  if (Array.isArray(data) && data.length > 0) {
    console.log(`\n   First item structure:`);
    console.log(JSON.stringify(data[0], null, 4));
  }
}

function main() {
  const [fileKey, action = 'info'] = process.argv.slice(2);
  
  if (!fileKey || !FILES[fileKey]) {
    console.log('📝 JSON File Updater\n');
    console.log('Usage: node scripts/update-json-files.js [file] [action]\n');
    console.log('Files:');
    Object.keys(FILES).forEach(key => {
      console.log(`  - ${key}`);
    });
    console.log('\nActions:');
    console.log('  - validate  : Check if JSON is valid');
    console.log('  - format    : Format JSON with proper indentation');
    console.log('  - backup    : Create a backup copy');
    console.log('  - info      : Show file information (default)');
    console.log('\nExamples:');
    console.log('  node scripts/update-json-files.js categories validate');
    console.log('  node scripts/update-json-files.js attributes format');
    console.log('  node scripts/update-json-files.js brands backup');
    return;
  }
  
  const filePath = path.join(DATA_DIR, FILES[fileKey]);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  switch (action) {
    case 'validate':
      validateJSON(filePath);
      break;
    case 'format':
      backupFile(filePath);
      formatJSON(filePath);
      break;
    case 'backup':
      backupFile(filePath);
      break;
    case 'info':
    default:
      showFileInfo(filePath);
      break;
  }
}

main();





