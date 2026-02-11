# Scripts Directory

Helper scripts for managing the vendor PWA.

## JSON File Management

### Quick Commands

```bash
# Show help
npm run json:validate

# Validate a file
node scripts/update-json-files.js attributes validate
node scripts/update-json-files.js categories validate

# Format a file (auto-creates backup)
node scripts/update-json-files.js attributes format

# Create backup
node scripts/update-json-files.js attributes backup

# Show file info
node scripts/update-json-files.js attributes info
```

### Available Files
- `categories` - Product categories
- `attributes` - Product attributes  
- `brands` - Product brands
- `locations` - Product locations

### Available Actions
- `validate` - Check JSON syntax
- `format` - Format JSON (with backup)
- `backup` - Create timestamped backup
- `info` - Show file information

## Download JSON Files

Download latest JSON files from the server:

```bash
npm run update-data
# or
node download-json-files.js
```

## Full Documentation

See `docs/MANUAL_JSON_UPDATE.md` for complete guide on manually updating JSON files.





