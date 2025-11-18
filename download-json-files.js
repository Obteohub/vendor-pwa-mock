// Download JSON files from shopwice.com and save them locally

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urls = [
  {
    url: 'https://shopwice.com/wp-content/uploads/shopwice-json/categories.json',
    filename: 'categories.json'
  },
  {
    url: 'https://shopwice.com/wp-content/uploads/shopwice-json/brands.json',
    filename: 'brands.json'
  },
  {
    url: 'https://shopwice.com/wp-content/uploads/shopwice-json/attributes.json',
    filename: 'attributes.json'
  },
  {
    url: 'https://shopwice.com/wp-content/uploads/shopwice-json/locations.json',
    filename: 'locations.json'
  }
];

const outputDir = path.join(__dirname, 'public', 'data');

async function downloadFile(url, filename) {
  try {
    console.log(`📥 Downloading ${filename}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const outputPath = path.join(outputDir, filename);
    
    // Write file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    const size = (fs.statSync(outputPath).size / 1024).toFixed(2);
    const itemCount = Array.isArray(data) ? data.length : 'N/A';
    
    console.log(`✅ ${filename} saved (${size} KB, ${itemCount} items)`);
    return true;
  } catch (error) {
    console.log(`❌ ${filename} failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Downloading JSON files from shopwice.com...\n');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }
  
  let successCount = 0;
  for (const { url, filename } of urls) {
    const success = await downloadFile(url, filename);
    if (success) successCount++;
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log(`\n✅ Downloaded ${successCount}/${urls.length} files successfully!`);
  console.log(`📂 Files saved to: ${outputDir}\n`);
  
  if (successCount === urls.length) {
    console.log('🎉 All files downloaded!');
    console.log('📝 Next: Update dataSyncService.js to load from /data/ instead of external URL\n');
  }
}

main();
