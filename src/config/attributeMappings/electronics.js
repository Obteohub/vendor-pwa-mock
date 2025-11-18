/**
 * Category-Attribute Mapping Configuration
 * 
 * Add your category-attribute mappings below.
 * Format: 'category-slug': ['attribute-slug-1', 'attribute-slug-2']
 */

/**
 * Combined category-attribute map
 * Add your mappings here
 */
export const categoryAttributeMap = {
  // ==========================================
  // ELECTRONICS
  // ==========================================
  
  // Main Electronics Category
  'electronics': ['brand', 'color', 'warranty', 'condition'],
  
  // Mobile Devices & Tablets
  'mobile-devices': ['brand', 'color', 'storage', 'ram', 'screen-size', 'network'],
  'phones': ['brand', 'color', 'storage', 'ram', 'screen-size', 'network', 'camera'],
  'smartphones': ['brand', 'color', 'storage', 'ram', 'screen-size', 'network', 'camera', 'battery'],
  'feature-phones': ['brand', 'color', 'battery', 'dual-sim'],
  'tablets': ['brand', 'color', 'storage', 'screen-size', 'connectivity', 'ram'],
  'phone-accessories': ['brand', 'color', 'compatibility', 'material'],
  'phone-cases': ['brand', 'color', 'compatibility', 'material', 'protection-level'],
  'screen-protectors': ['brand', 'compatibility', 'material', 'type'],
  'chargers': ['brand', 'compatibility', 'power', 'fast-charging'],
  'power-banks': ['brand', 'capacity', 'ports', 'fast-charging'],
  
  // Computers & Laptops
  'computers': ['brand', 'processor', 'ram', 'storage', 'os'],
  'laptops': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os', 'graphics'],
  'notebooks': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os'],
  'ultrabooks': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'weight'],
  'gaming-laptops': ['brand', 'processor', 'ram', 'storage', 'graphics', 'screen-size', 'refresh-rate'],
  'desktops': ['brand', 'processor', 'ram', 'storage', 'os', 'graphics'],
  'all-in-one-pcs': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os'],
  'workstations': ['brand', 'processor', 'ram', 'storage', 'graphics', 'os'],
  
  // Computer Components
  'computer-components': ['brand', 'compatibility', 'type'],
  'processors': ['brand', 'cores', 'speed', 'socket'],
  'motherboards': ['brand', 'socket', 'chipset', 'form-factor'],
  'ram': ['brand', 'capacity', 'speed', 'type'],
  'graphics-cards': ['brand', 'memory', 'chipset', 'ports'],
  'hard-drives': ['brand', 'capacity', 'type', 'speed'],
  'ssds': ['brand', 'capacity', 'interface', 'speed'],
  'power-supplies': ['brand', 'wattage', 'efficiency', 'modular'],
  'pc-cases': ['brand', 'size', 'color', 'cooling'],
  'cooling': ['brand', 'type', 'size', 'noise-level'],
  
  // Monitors & Displays
  'monitors': ['brand', 'screen-size', 'resolution', 'refresh-rate', 'panel-type'],
  'gaming-monitors': ['brand', 'screen-size', 'resolution', 'refresh-rate', 'response-time'],
  'professional-monitors': ['brand', 'screen-size', 'resolution', 'color-accuracy', 'panel-type'],
  'portable-monitors': ['brand', 'screen-size', 'resolution', 'connectivity'],
  
  // Computer Accessories
  'computer-accessories': ['brand', 'color', 'connectivity'],
  'keyboards': ['brand', 'connection-type', 'switch-type', 'layout', 'backlight'],
  'mechanical-keyboards': ['brand', 'switch-type', 'layout', 'backlight', 'hot-swappable'],
  'gaming-keyboards': ['brand', 'switch-type', 'backlight', 'macro-keys'],
  'mice': ['brand', 'connection-type', 'dpi', 'sensor-type'],
  'gaming-mice': ['brand', 'dpi', 'sensor-type', 'programmable-buttons', 'weight'],
  'mouse-pads': ['size', 'material', 'rgb', 'surface-type'],
  'webcams': ['brand', 'resolution', 'frame-rate', 'microphone'],
  'usb-hubs': ['brand', 'ports', 'usb-version', 'power-delivery'],
  'laptop-stands': ['material', 'adjustable', 'cooling', 'portability'],
  'docking-stations': ['brand', 'ports', 'power-delivery', 'display-support'],
  
  // Audio Equipment
  'audio': ['brand', 'color', 'connection-type'],
  'headphones': ['brand', 'color', 'connection-type', 'noise-cancellation', 'driver-size'],
  'gaming-headsets': ['brand', 'connection-type', 'microphone', 'surround-sound'],
  'earbuds': ['brand', 'color', 'connection-type', 'noise-cancellation', 'water-resistance'],
  'true-wireless-earbuds': ['brand', 'color', 'noise-cancellation', 'battery-life', 'water-resistance'],
  'speakers': ['brand', 'color', 'connection-type', 'power', 'water-resistance'],
  'bluetooth-speakers': ['brand', 'color', 'battery-life', 'water-resistance', 'power'],
  'soundbars': ['brand', 'channels', 'power', 'connectivity', 'subwoofer'],
  'microphones': ['brand', 'type', 'connection-type', 'polar-pattern'],
  'audio-interfaces': ['brand', 'inputs', 'outputs', 'sample-rate'],
  
  // Cameras & Photography
  'cameras': ['brand', 'megapixels', 'sensor-size', 'lens-mount', 'video-resolution'],
  'dslr-cameras': ['brand', 'megapixels', 'sensor-size', 'lens-mount', 'video-resolution'],
  'mirrorless-cameras': ['brand', 'megapixels', 'sensor-size', 'lens-mount', 'video-resolution'],
  'action-cameras': ['brand', 'resolution', 'water-resistant', 'stabilization', 'frame-rate'],
  'instant-cameras': ['brand', 'film-type', 'color'],
  'camera-lenses': ['brand', 'focal-length', 'aperture', 'mount', 'image-stabilization'],
  'camera-accessories': ['brand', 'compatibility', 'type'],
  'tripods': ['brand', 'height', 'weight-capacity', 'material'],
  'camera-bags': ['brand', 'size', 'material', 'weather-resistant'],
  
  // TVs & Home Entertainment
  'televisions': ['brand', 'screen-size', 'resolution', 'panel-type', 'smart-tv'],
  'smart-tvs': ['brand', 'screen-size', 'resolution', 'os', 'hdr'],
  '4k-tvs': ['brand', 'screen-size', 'hdr', 'refresh-rate', 'smart-tv'],
  '8k-tvs': ['brand', 'screen-size', 'hdr', 'refresh-rate', 'smart-tv'],
  'oled-tvs': ['brand', 'screen-size', 'resolution', 'hdr', 'smart-tv'],
  'qled-tvs': ['brand', 'screen-size', 'resolution', 'hdr', 'smart-tv'],
  'projectors': ['brand', 'resolution', 'brightness', 'throw-distance', 'connectivity'],
  'streaming-devices': ['brand', 'resolution', 'os', 'voice-control'],
  'tv-mounts': ['size-compatibility', 'type', 'weight-capacity', 'adjustable'],
  
  // Gaming
  'gaming': ['brand', 'platform', 'genre'],
  'gaming-consoles': ['brand', 'storage', 'color', 'generation'],
  'console-accessories': ['brand', 'compatibility', 'type'],
  'gaming-controllers': ['brand', 'compatibility', 'wireless', 'programmable'],
  'vr-headsets': ['brand', 'resolution', 'refresh-rate', 'tracking', 'standalone'],
  'gaming-chairs': ['brand', 'material', 'adjustable', 'weight-capacity'],
  
  // Wearables & Smart Devices
  'wearables': ['brand', 'color', 'compatibility'],
  'smartwatches': ['brand', 'color', 'compatibility', 'water-resistance', 'battery-life'],
  'fitness-trackers': ['brand', 'color', 'water-resistance', 'battery-life', 'heart-rate'],
  'smart-bands': ['brand', 'color', 'water-resistance', 'battery-life'],
  'smart-glasses': ['brand', 'connectivity', 'battery-life'],
  
  // Networking & Smart Home
  'networking': ['brand', 'speed', 'connectivity'],
  'routers': ['brand', 'speed', 'wifi-standard', 'coverage', 'ports'],
  'mesh-wifi': ['brand', 'speed', 'coverage', 'nodes'],
  'modems': ['brand', 'speed', 'compatibility', 'ports'],
  'network-switches': ['brand', 'ports', 'speed', 'managed'],
  'wifi-extenders': ['brand', 'speed', 'coverage', 'wifi-standard'],
  'smart-home': ['brand', 'compatibility', 'connectivity'],
  'smart-lights': ['brand', 'color', 'brightness', 'compatibility'],
  'smart-plugs': ['brand', 'power', 'compatibility', 'energy-monitoring'],
  'smart-speakers': ['brand', 'assistant', 'audio-quality', 'smart-home-hub'],
  
  // Storage & Memory
  'storage': ['brand', 'capacity', 'type'],
  'external-hard-drives': ['brand', 'capacity', 'interface', 'portable'],
  'external-ssds': ['brand', 'capacity', 'interface', 'speed'],
  'usb-flash-drives': ['brand', 'capacity', 'usb-version', 'speed'],
  'memory-cards': ['brand', 'capacity', 'speed', 'type'],
  'nas': ['brand', 'bays', 'capacity', 'raid'],
  
  // Printers & Scanners
  'printers': ['brand', 'type', 'color-printing', 'connectivity'],
  'inkjet-printers': ['brand', 'color-printing', 'connectivity', 'duplex'],
  'laser-printers': ['brand', 'color-printing', 'speed', 'connectivity'],
  '3d-printers': ['brand', 'build-volume', 'technology', 'resolution'],
  'scanners': ['brand', 'type', 'resolution', 'connectivity'],
  'printer-ink': ['brand', 'compatibility', 'color', 'yield'],
  
  // Cables & Adapters
  'cables-adapters': ['type', 'length', 'version'],
  'hdmi-cables': ['length', 'version', 'resolution-support'],
  'usb-cables': ['type', 'length', 'version', 'speed'],
  'charging-cables': ['type', 'length', 'compatibility', 'fast-charging'],
  'adapters': ['type', 'compatibility', 'ports'],
  'converters': ['type', 'input', 'output'],
  
  // Add more electronics categories as needed...
};

/**
 * Get attributes for a category
 * @param {string} categorySlug - The category slug
 * @returns {string[]} Array of attribute slugs
 */
export function getAttributesForCategory(categorySlug) {
  return categoryAttributeMap[categorySlug] || [];
}

/**
 * Get attributes for multiple categories (union)
 * @param {string[]} categorySlugs - Array of category slugs
 * @returns {string[]} Array of unique attribute slugs
 */
export function getAttributesForCategories(categorySlugs) {
  const attributeSet = new Set();
  
  categorySlugs.forEach(slug => {
    const attributes = getAttributesForCategory(slug);
    attributes.forEach(attr => attributeSet.add(attr));
  });
  
  return Array.from(attributeSet);
}

/**
 * Check if a category has specific attribute mapping
 * @param {string} categorySlug - The category slug
 * @returns {boolean}
 */
export function hasAttributeMapping(categorySlug) {
  return categorySlug in categoryAttributeMap;
}
