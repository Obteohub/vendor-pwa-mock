// Quick script to download only attributes.json
// Usage: node scripts/download-attributes.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATTRIBUTES_URL = 'https://api.shopwice.com/wp-content/uploads/shopwice-json/attributes.json';
const outputDir = path.join(__dirname, '..', 'public', 'data');
const outputPath = path.join(outputDir, 'attributes.json');

async function downloadAttributes() {
  try {
    console.log('📥 Downloading attributes.json from api.shopwice.com...\n');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}\n`);
    }
    
    const response = await fetch(ATTRIBUTES_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Backup existing file if it exists
    if (fs.existsSync(outputPath)) {
      const backupPath = `${outputPath}.backup-${Date.now()}`;
      fs.copyFileSync(outputPath, backupPath);
      console.log(`💾 Backup created: ${path.basename(backupPath)}\n`);
    }
    
    // Write new file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    const size = (fs.statSync(outputPath).size / 1024).toFixed(2);
    const itemCount = Array.isArray(data) ? data.length : 'N/A';
    
    console.log('━'.repeat(60));
    console.log(`✅ attributes.json downloaded successfully!`);
    console.log(`   Size: ${size} KB`);
    console.log(`   Items: ${itemCount} attributes`);
    console.log(`   Saved to: ${outputPath}`);
    console.log('━'.repeat(60));
    console.log('\n💡 Tip: Refresh your app to see the updated attributes!\n');
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to download attributes: ${error.message}`);
    return false;
  }
}

downloadAttributes();





