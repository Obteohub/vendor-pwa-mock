// Update all has_archives to false in bulk-create-attributes.php
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phpFile = path.join(__dirname, '..', 'bulk-create-attributes.php');

let content = fs.readFileSync(phpFile, 'utf8');

// Replace all 'has_archives' => true with 'has_archives' => false
content = content.replace(/'has_archives' => true/g, "'has_archives' => false");

// Also update the function default parameter
content = content.replace(/function create_wc_attribute\([^)]*has_archives = true/g, "function create_wc_attribute(\$name, \$slug = '', \$type = 'select', \$has_archives = false");

fs.writeFileSync(phpFile, content);

console.log('✅ Updated all has_archives to false');
console.log('   - Function default parameter updated');
console.log('   - All attribute entries updated');





