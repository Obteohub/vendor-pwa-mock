// Test if JSON files are accessible on shopwice.com

const urls = [
  'https://shopwice.com/wp-content/uploads/shopwice-json/categories.json',
  'https://shopwice.com/wp-content/uploads/shopwice-json/brands.json',
  'https://shopwice.com/wp-content/uploads/shopwice-json/attributes.json',
  'https://shopwice.com/wp-content/uploads/shopwice-json/locations.json',
  'https://shopwice.com/wp-content/uploads/shopwice-json/manifest.json'
];

async function testUrl(url) {
  try {
    const response = await fetch(url);
    const status = response.status;
    
    if (status === 200) {
      const data = await response.json();
      const size = JSON.stringify(data).length;
      console.log(`✅ ${url}`);
      console.log(`   Status: ${status}, Size: ${(size / 1024).toFixed(2)} KB`);
      
      // Show data summary
      if (data.categories) console.log(`   Categories: ${data.categories.length}`);
      if (data.brands) console.log(`   Brands: ${data.brands.length}`);
      if (data.attributes) console.log(`   Attributes: ${data.attributes.length}`);
      if (data.locations) console.log(`   Locations: ${data.locations.length}`);
      if (data.files) console.log(`   Manifest version: ${data.version}`);
      
      return true;
    } else {
      console.log(`❌ ${url}`);
      console.log(`   Status: ${status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAll() {
  console.log('🔍 Testing JSON files on shopwice.com...\n');
  
  let successCount = 0;
  for (const url of urls) {
    const success = await testUrl(url);
    if (success) successCount++;
    console.log('');
  }
  
  console.log('━'.repeat(60));
  console.log(`\n📊 Results: ${successCount}/${urls.length} files accessible\n`);
  
  if (successCount === urls.length) {
    console.log('✅ All JSON files are accessible!');
    console.log('✅ Ready to use static JSON loading');
  } else {
    console.log('⚠️  Some files are missing or inaccessible');
    console.log('💡 Run generate-static-data.php on WordPress to create them');
  }
}

testAll();
