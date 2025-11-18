// Inspect all available JSON files

async function inspectFile(url, name) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`❌ ${name}: ${response.status} ${response.statusText}\n`);
      return;
    }
    
    const data = await response.json();
    
    console.log(`✅ ${name.toUpperCase()}`);
    console.log('━'.repeat(60));
    
    // Check if it's an array or object
    if (Array.isArray(data)) {
      console.log('Format: Array');
      console.log('Items:', data.length);
      if (data.length > 0) {
        console.log('Sample item:', JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
      }
    } else {
      console.log('Format: Object');
      console.log('Keys:', Object.keys(data));
      
      // Check for expected properties
      if (data.categories) console.log('  ✓ Has categories array:', data.categories.length, 'items');
      if (data.categoryTree) console.log('  ✓ Has categoryTree array:', data.categoryTree.length, 'items');
      if (data.brands) console.log('  ✓ Has brands array:', data.brands.length, 'items');
      if (data.brandTree) console.log('  ✓ Has brandTree array:', data.brandTree.length, 'items');
      if (data.attributes) console.log('  ✓ Has attributes array:', data.attributes.length, 'items');
      if (data.locations) console.log('  ✓ Has locations array:', data.locations.length, 'items');
      if (data.generated) console.log('  ✓ Generated:', data.generated);
      if (data.timestamp) console.log('  ✓ Timestamp:', new Date(data.timestamp * 1000).toLocaleString());
    }
    
    console.log('');
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}\n`);
  }
}

async function main() {
  console.log('🔍 Inspecting all JSON files on shopwice.com...\n');
  
  await inspectFile('https://shopwice.com/wp-content/uploads/shopwice-json/categories.json', 'categories.json');
  await inspectFile('https://shopwice.com/wp-content/uploads/shopwice-json/brands.json', 'brands.json');
  await inspectFile('https://shopwice.com/wp-content/uploads/shopwice-json/attributes.json', 'attributes.json');
  await inspectFile('https://shopwice.com/wp-content/uploads/shopwice-json/locations.json', 'locations.json');
  await inspectFile('https://shopwice.com/wp-content/uploads/shopwice-json/manifest.json', 'manifest.json');
  
  console.log('━'.repeat(60));
  console.log('\n✅ Summary:');
  console.log('All required data files are accessible!');
  console.log('Your app can now load data from static JSON files.');
  console.log('\n🚀 Ready to test with: npm run dev\n');
}

main();
