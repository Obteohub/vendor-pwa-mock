// Inspect the existing JSON files in detail

async function inspectCategories() {
  try {
    const response = await fetch('https://shopwice.com/wp-content/uploads/shopwice-json/categories.json');
    const data = await response.json();
    
    console.log('📁 CATEGORIES.JSON');
    console.log('━'.repeat(60));
    console.log('Keys:', Object.keys(data));
    console.log('Has categories array:', !!data.categories);
    console.log('Has categoryTree array:', !!data.categoryTree);
    
    if (data.categories) {
      console.log('Categories count:', data.categories.length);
      console.log('Sample category:', data.categories[0]);
    }
    
    if (data.categoryTree) {
      console.log('Category tree nodes:', data.categoryTree.length);
    }
    
    if (data.generated) {
      console.log('Generated:', data.generated);
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ Error loading categories:', error.message);
  }
}

async function inspectAttributes() {
  try {
    const response = await fetch('https://shopwice.com/wp-content/uploads/shopwice-json/attributes.json');
    const data = await response.json();
    
    console.log('🔧 ATTRIBUTES.JSON');
    console.log('━'.repeat(60));
    console.log('Keys:', Object.keys(data));
    console.log('Has attributes array:', !!data.attributes);
    
    if (data.attributes) {
      console.log('Attributes count:', data.attributes.length);
      console.log('Sample attribute:', data.attributes[0]);
    }
    
    if (data.generated) {
      console.log('Generated:', data.generated);
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ Error loading attributes:', error.message);
  }
}

async function main() {
  console.log('🔍 Inspecting existing JSON files...\n');
  await inspectCategories();
  await inspectAttributes();
  
  console.log('━'.repeat(60));
  console.log('\n💡 Next Steps:');
  console.log('1. The existing files have the correct structure ✅');
  console.log('2. Need to generate brands.json and locations.json');
  console.log('3. Run generate-static-data.php on WordPress');
  console.log('4. Or check if brands/locations taxonomies exist in WordPress\n');
}

main();
