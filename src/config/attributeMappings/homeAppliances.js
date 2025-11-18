/**
 * Home Appliances Category Attribute Mappings
 * 
 * Comprehensive mappings for home appliances and household equipment
 */

export const homeAppliancesMappings = {
  // Main Home Appliances
  'home-appliances': ['brand', 'color', 'size', 'energy-rating', 'warranty'],
  'appliances': ['brand', 'color', 'capacity', 'energy-rating', 'warranty'],
  
  // Kitchen Appliances - Major
  'kitchen-appliances': ['brand', 'color', 'size', 'capacity', 'energy-rating'],
  'refrigerators': ['brand', 'capacity', 'color', 'type', 'energy-rating', 'ice-maker', 'water-dispenser'],
  'french-door-refrigerators': ['brand', 'capacity', 'color', 'energy-rating', 'ice-maker', 'water-dispenser', 'smart'],
  'side-by-side-refrigerators': ['brand', 'capacity', 'color', 'energy-rating', 'ice-maker', 'water-dispenser'],
  'top-freezer-refrigerators': ['brand', 'capacity', 'color', 'energy-rating', 'reversible-door'],
  'bottom-freezer-refrigerators': ['brand', 'capacity', 'color', 'energy-rating', 'drawer-door'],
  'mini-fridges': ['brand', 'capacity', 'color', 'energy-rating', 'freezer', 'reversible-door'],
  'wine-coolers': ['brand', 'capacity', 'zones', 'temperature-range', 'freestanding-built-in'],
  'freezers': ['brand', 'capacity', 'color', 'type', 'energy-rating', 'defrost-type'],
  'chest-freezers': ['brand', 'capacity', 'color', 'energy-rating', 'baskets', 'lock'],
  'upright-freezers': ['brand', 'capacity', 'color', 'energy-rating', 'shelves', 'frost-free'],
  
  'ranges': ['brand', 'size', 'fuel-type', 'color', 'convection', 'self-cleaning'],
  'gas-ranges': ['brand', 'size', 'color', 'burners', 'convection', 'self-cleaning', 'griddle'],
  'electric-ranges': ['brand', 'size', 'color', 'burners', 'convection', 'self-cleaning', 'smooth-top'],
  'dual-fuel-ranges': ['brand', 'size', 'color', 'burners', 'convection', 'self-cleaning'],
  'slide-in-ranges': ['brand', 'size', 'fuel-type', 'color', 'convection', 'self-cleaning'],
  'freestanding-ranges': ['brand', 'size', 'fuel-type', 'color', 'convection', 'self-cleaning'],
  
  'cooktops': ['brand', 'size', 'fuel-type', 'color', 'burners', 'downdraft'],
  'gas-cooktops': ['brand', 'size', 'color', 'burners', 'continuous-grates', 'sealed-burners'],
  'electric-cooktops': ['brand', 'size', 'color', 'burners', 'smooth-top-coil', 'hot-surface-indicator'],
  'induction-cooktops': ['brand', 'size', 'color', 'burners', 'boost-function', 'timer'],
  
  'wall-ovens': ['brand', 'size', 'fuel-type', 'color', 'convection', 'self-cleaning', 'single-double'],
  'single-wall-ovens': ['brand', 'size', 'fuel-type', 'color', 'convection', 'self-cleaning'],
  'double-wall-ovens': ['brand', 'size', 'fuel-type', 'color', 'convection', 'self-cleaning'],
  
  'microwaves': ['brand', 'capacity', 'wattage', 'color', 'type', 'sensor-cooking'],
  'countertop-microwaves': ['brand', 'capacity', 'wattage', 'color', 'sensor-cooking', 'turntable'],
  'over-range-microwaves': ['brand', 'capacity', 'wattage', 'color', 'venting', 'sensor-cooking'],
  'built-in-microwaves': ['brand', 'capacity', 'wattage', 'color', 'trim-kit', 'sensor-cooking'],
  'microwave-drawers': ['brand', 'capacity', 'wattage', 'color', 'sensor-cooking'],
  
  'dishwashers': ['brand', 'color', 'capacity', 'noise-level', 'energy-rating', 'cycles'],
  'built-in-dishwashers': ['brand', 'color', 'capacity', 'noise-level', 'energy-rating', 'third-rack'],
  'portable-dishwashers': ['brand', 'color', 'capacity', 'noise-level', 'energy-rating', 'wheels'],
  'countertop-dishwashers': ['brand', 'color', 'capacity', 'noise-level', 'cycles'],
  'drawer-dishwashers': ['brand', 'color', 'drawers', 'noise-level', 'energy-rating'],


  'range-hoods': ['brand', 'size', 'color', 'cfm', 'ducted-ductless', 'noise-level'],
  'under-cabinet-hoods': ['brand', 'size', 'color', 'cfm', 'ducted-ductless', 'lights'],
  'wall-mount-hoods': ['brand', 'size', 'color', 'cfm', 'ducted-ductless', 'chimney-height'],
  'island-hoods': ['brand', 'size', 'color', 'cfm', 'ducted-ductless', 'chimney-height'],
  'downdraft-vents': ['brand', 'size', 'color', 'cfm', 'retractable', 'blower-location'],
  
  // Kitchen Appliances - Small
  'small-kitchen-appliances': ['brand', 'color', 'capacity', 'wattage', 'material'],
  'coffee-makers': ['brand', 'type', 'capacity', 'color', 'programmable', 'carafe-type'],
  'drip-coffee-makers': ['brand', 'capacity', 'color', 'programmable', 'thermal-glass', 'brew-strength'],
  'single-serve-coffee-makers': ['brand', 'color', 'pod-type', 'water-reservoir', 'brew-sizes'],
  'espresso-machines': ['brand', 'type', 'color', 'pressure', 'milk-frother', 'programmable'],
  'french-press': ['brand', 'capacity', 'material', 'color', 'dishwasher-safe'],
  'pour-over-coffee-makers': ['brand', 'capacity', 'material', 'color', 'filter-type'],
  'cold-brew-makers': ['brand', 'capacity', 'material', 'color', 'brew-time'],
  'coffee-grinders': ['brand', 'type', 'capacity', 'grind-settings', 'burr-blade'],
  
  'blenders': ['brand', 'capacity', 'wattage', 'color', 'speeds', 'material'],
  'countertop-blenders': ['brand', 'capacity', 'wattage', 'color', 'speeds', 'pitcher-material'],
  'personal-blenders': ['brand', 'capacity', 'wattage', 'color', 'cups-included', 'to-go-lids'],
  'immersion-blenders': ['brand', 'wattage', 'color', 'speeds', 'attachments', 'cordless'],
  'high-performance-blenders': ['brand', 'capacity', 'wattage', 'color', 'programs', 'tamper'],
  
  'food-processors': ['brand', 'capacity', 'wattage', 'color', 'speeds', 'attachments'],
  'stand-mixers': ['brand', 'capacity', 'wattage', 'color', 'speeds', 'attachments', 'tilt-head-bowl-lift'],
  'hand-mixers': ['brand', 'wattage', 'color', 'speeds', 'beaters-included', 'storage-case'],
  
  'toasters': ['brand', 'slots', 'color', 'width', 'settings', 'bagel-function'],
  'toaster-ovens': ['brand', 'capacity', 'wattage', 'color', 'functions', 'convection'],
  'air-fryers': ['brand', 'capacity', 'wattage', 'color', 'temperature-range', 'presets'],
  'air-fryer-toaster-ovens': ['brand', 'capacity', 'wattage', 'color', 'functions', 'accessories'],
  
  'slow-cookers': ['brand', 'capacity', 'color', 'settings', 'programmable', 'removable-pot'],
  'pressure-cookers': ['brand', 'capacity', 'color', 'pressure-settings', 'safety-features'],
  'multi-cookers': ['brand', 'capacity', 'wattage', 'color', 'functions', 'programmable'],
  'instant-pots': ['brand', 'capacity', 'color', 'functions', 'programmable', 'accessories'],
  'rice-cookers': ['brand', 'capacity', 'color', 'functions', 'keep-warm', 'steamer-basket'],
  
  'electric-kettles': ['brand', 'capacity', 'wattage', 'color', 'material', 'temperature-control'],
  'tea-kettles': ['brand', 'capacity', 'material', 'color', 'whistle', 'stovetop-electric'],
  'water-dispensers': ['brand', 'type', 'capacity', 'hot-cold-room', 'bottle-size', 'energy-saving'],
  
  'juicers': ['brand', 'type', 'wattage', 'color', 'pulp-container', 'dishwasher-safe'],
  'citrus-juicers': ['brand', 'capacity', 'wattage', 'color', 'pulp-control', 'auto-reverse'],
  'centrifugal-juicers': ['brand', 'wattage', 'color', 'speeds', 'pulp-container', 'wide-mouth'],
  'masticating-juicers': ['brand', 'wattage', 'color', 'rpm', 'attachments', 'reverse-function'],
  
  'waffle-makers': ['brand', 'size', 'color', 'plates', 'non-stick', 'indicator-lights'],
  'griddles': ['brand', 'size', 'wattage', 'color', 'non-stick', 'temperature-control'],
  'panini-presses': ['brand', 'size', 'wattage', 'color', 'floating-hinge', 'removable-plates'],
  'sandwich-makers': ['brand', 'size', 'wattage', 'color', 'plates', 'indicator-lights'],
  'electric-grills': ['brand', 'size', 'wattage', 'color', 'temperature-control', 'removable-plates'],
  'indoor-grills': ['brand', 'size', 'wattage', 'color', 'smokeless', 'temperature-control'],
  'deep-fryers': ['brand', 'capacity', 'wattage', 'color', 'temperature-control', 'oil-filtration'],
  'popcorn-makers': ['brand', 'type', 'capacity', 'color', 'hot-air-oil', 'butter-melter'],
  'ice-cream-makers': ['brand', 'capacity', 'type', 'color', 'compressor-freezer-bowl', 'timer'],
  'yogurt-makers': ['brand', 'capacity', 'jars', 'color', 'timer', 'temperature-control'],
  'bread-makers': ['brand', 'capacity', 'color', 'programs', 'crust-settings', 'delay-timer'],
  'pasta-makers': ['brand', 'type', 'capacity', 'color', 'attachments', 'electric-manual'],
  'food-dehydrators': ['brand', 'trays', 'wattage', 'color', 'temperature-range', 'timer'],
  'sous-vide-machines': ['brand', 'wattage', 'color', 'temperature-range', 'timer', 'wifi'],
  'electric-can-openers': ['brand', 'color', 'type', 'knife-sharpener', 'bottle-opener'],
  'electric-knives': ['brand', 'color', 'blade-length', 'cordless', 'storage-case'],
  'food-scales': ['brand', 'capacity', 'units', 'color', 'digital-mechanical', 'tare-function'],
  'kitchen-timers': ['brand', 'type', 'color', 'digital-mechanical', 'magnetic', 'multiple-timers'],
  
  // Laundry Appliances
  'laundry-appliances': ['brand', 'color', 'capacity', 'energy-rating', 'type'],
  'washing-machines': ['brand', 'capacity', 'color', 'type', 'energy-rating', 'cycles'],
  'top-load-washers': ['brand', 'capacity', 'color', 'agitator-impeller', 'energy-rating', 'cycles'],
  'front-load-washers': ['brand', 'capacity', 'color', 'energy-rating', 'cycles', 'steam', 'stackable'],
  'washer-dryer-combos': ['brand', 'capacity', 'color', 'energy-rating', 'ventless', 'cycles'],
  'portable-washers': ['brand', 'capacity', 'color', 'type', 'wheels', 'faucet-adapter'],
  
  'dryers': ['brand', 'capacity', 'color', 'type', 'energy-rating', 'cycles'],
  'electric-dryers': ['brand', 'capacity', 'color', 'energy-rating', 'cycles', 'steam', 'sensor-dry'],
  'gas-dryers': ['brand', 'capacity', 'color', 'energy-rating', 'cycles', 'steam', 'sensor-dry'],
  'ventless-dryers': ['brand', 'capacity', 'color', 'type', 'energy-rating', 'cycles'],
  'portable-dryers': ['brand', 'capacity', 'color', 'type', 'ventless', 'foldable'],
  
  'washer-dryer-sets': ['brand', 'capacity', 'color', 'energy-rating', 'stackable', 'pedestals-included'],
  'laundry-centers': ['brand', 'capacity', 'color', 'energy-rating', 'cycles'],
  'ironing-systems': ['brand', 'type', 'board-size', 'steam-generator', 'foldable'],
  'garment-steamers': ['brand', 'type', 'capacity', 'heat-up-time', 'handheld-standing'],
  'irons': ['brand', 'wattage', 'color', 'steam-output', 'soleplate-type', 'auto-shutoff'],
  'steam-irons': ['brand', 'wattage', 'color', 'steam-output', 'soleplate-type', 'vertical-steam'],
  'clothes-drying-racks': ['brand', 'size', 'material', 'foldable', 'tiers', 'weight-capacity'],
  
  // Cleaning Appliances
  'cleaning-appliances': ['brand', 'type', 'power-source', 'capacity', 'filtration'],
  'vacuum-cleaners': ['brand', 'type', 'power-source', 'capacity', 'filtration', 'attachments'],
  'upright-vacuums': ['brand', 'power-source', 'capacity', 'filtration', 'hepa', 'bagless-bagged'],
  'canister-vacuums': ['brand', 'power-source', 'capacity', 'filtration', 'hepa', 'attachments'],
  'stick-vacuums': ['brand', 'power-source', 'runtime', 'filtration', 'convertible', 'attachments'],
  'handheld-vacuums': ['brand', 'power-source', 'runtime', 'capacity', 'filtration', 'wet-dry'],
  'robot-vacuums': ['brand', 'runtime', 'filtration', 'mapping', 'app-control', 'self-emptying'],
  'shop-vacs': ['brand', 'capacity', 'horsepower', 'wet-dry', 'attachments', 'blower-function'],
  'carpet-cleaners': ['brand', 'type', 'capacity', 'cleaning-path', 'heat', 'attachments'],
  'steam-cleaners': ['brand', 'type', 'capacity', 'heat-up-time', 'attachments', 'handheld-canister'],
  'floor-scrubbers': ['brand', 'type', 'power-source', 'tank-capacity', 'cleaning-path'],
  'steam-mops': ['brand', 'water-capacity', 'heat-up-time', 'pads-included', 'swivel-head'],

  // Heating & Cooling
  'heating-cooling': ['brand', 'type', 'coverage', 'energy-rating', 'power-source'],
  'air-conditioners': ['brand', 'type', 'btu', 'coverage', 'energy-rating', 'remote'],
  'window-air-conditioners': ['brand', 'btu', 'coverage', 'energy-rating', 'remote', 'dehumidifier'],
  'portable-air-conditioners': ['brand', 'btu', 'coverage', 'energy-rating', 'hose-type', 'dehumidifier'],
  'through-wall-air-conditioners': ['brand', 'btu', 'coverage', 'energy-rating', 'remote', 'heat'],
  'mini-split-systems': ['brand', 'btu', 'coverage', 'energy-rating', 'zones', 'heat-pump'],
  
  'fans': ['brand', 'type', 'size', 'speeds', 'oscillating', 'remote'],
  'ceiling-fans': ['brand', 'blade-span', 'blades', 'light-kit', 'remote', 'reversible'],
  'tower-fans': ['brand', 'height', 'speeds', 'oscillating', 'remote', 'timer'],
  'pedestal-fans': ['brand', 'diameter', 'speeds', 'oscillating', 'adjustable-height', 'remote'],
  'box-fans': ['brand', 'size', 'speeds', 'window-mount', 'reversible'],
  'desk-fans': ['brand', 'size', 'speeds', 'oscillating', 'usb-plug'],
  'bladeless-fans': ['brand', 'size', 'speeds', 'oscillating', 'remote', 'air-multiplier'],
  
  'space-heaters': ['brand', 'type', 'wattage', 'coverage', 'thermostat', 'safety-features'],
  'ceramic-heaters': ['brand', 'wattage', 'coverage', 'thermostat', 'oscillating', 'timer'],
  'oil-filled-heaters': ['brand', 'wattage', 'coverage', 'thermostat', 'timer', 'wheels'],
  'infrared-heaters': ['brand', 'wattage', 'coverage', 'thermostat', 'remote', 'timer'],
  'panel-heaters': ['brand', 'wattage', 'coverage', 'thermostat', 'wall-freestanding'],
  'baseboard-heaters': ['brand', 'wattage', 'length', 'thermostat', 'hardwired-plug-in'],
  
  'dehumidifiers': ['brand', 'capacity', 'coverage', 'energy-rating', 'continuous-drain', 'pump'],
  'humidifiers': ['brand', 'type', 'capacity', 'coverage', 'runtime', 'filter-type'],
  'cool-mist-humidifiers': ['brand', 'capacity', 'coverage', 'runtime', 'filter-type', 'ultrasonic-evaporative'],
  'warm-mist-humidifiers': ['brand', 'capacity', 'coverage', 'runtime', 'medicine-cup'],
  'whole-house-humidifiers': ['brand', 'capacity', 'coverage', 'installation-type', 'automatic'],
  
  'air-purifiers': ['brand', 'coverage', 'filtration', 'cadr', 'noise-level', 'smart'],
  'hepa-air-purifiers': ['brand', 'coverage', 'cadr', 'filter-life', 'noise-level', 'smart'],
  'uv-air-purifiers': ['brand', 'coverage', 'cadr', 'uv-bulb-life', 'noise-level'],
  'ionic-air-purifiers': ['brand', 'coverage', 'cadr', 'ozone-free', 'noise-level'],
  
  'thermostats': ['brand', 'type', 'compatibility', 'wifi', 'touchscreen', 'voice-control'],
  'programmable-thermostats': ['brand', 'compatibility', 'programs', 'touchscreen', 'backlight'],
  'smart-thermostats': ['brand', 'compatibility', 'wifi', 'voice-control', 'learning', 'sensors'],
  
  // Water Treatment
  'water-treatment': ['brand', 'type', 'capacity', 'filtration', 'flow-rate'],
  'water-filters': ['brand', 'type', 'capacity', 'filtration', 'flow-rate', 'filter-life'],
  'pitcher-water-filters': ['brand', 'capacity', 'filtration', 'filter-life', 'bpa-free'],
  'faucet-water-filters': ['brand', 'filtration', 'flow-rate', 'filter-life', 'compatibility'],
  'under-sink-filters': ['brand', 'stages', 'filtration', 'flow-rate', 'filter-life', 'faucet-included'],
  'whole-house-filters': ['brand', 'flow-rate', 'filtration', 'filter-life', 'capacity'],
  'reverse-osmosis-systems': ['brand', 'stages', 'capacity', 'flow-rate', 'tank-size', 'filter-life'],
  'water-softeners': ['brand', 'capacity', 'type', 'regeneration', 'salt-based-salt-free'],
  'water-heaters': ['brand', 'capacity', 'type', 'fuel-type', 'energy-rating', 'recovery-rate'],
  'tankless-water-heaters': ['brand', 'flow-rate', 'fuel-type', 'temperature-range', 'whole-house-point-of-use'],

  // Personal Care Appliances
  'personal-care-appliances': ['brand', 'type', 'power-source', 'attachments', 'warranty'],
  'hair-dryers': ['brand', 'wattage', 'heat-settings', 'speed-settings', 'ionic', 'attachments'],
  'hair-straighteners': ['brand', 'plate-material', 'heat-settings', 'plate-width', 'auto-shutoff'],
  'curling-irons': ['brand', 'barrel-size', 'heat-settings', 'material', 'auto-shutoff', 'rotating'],
  'hot-air-brushes': ['brand', 'wattage', 'heat-settings', 'barrel-size', 'ionic', 'rotating'],
  'hair-clippers': ['brand', 'power-source', 'blade-material', 'length-settings', 'attachments'],
  'trimmers': ['brand', 'power-source', 'blade-type', 'wet-dry', 'attachments', 'runtime'],
  'electric-shavers': ['brand', 'type', 'heads', 'wet-dry', 'runtime', 'cleaning-station'],
  'epilators': ['brand', 'power-source', 'heads', 'wet-dry', 'speed-settings', 'attachments'],
  'electric-toothbrushes': ['brand', 'type', 'modes', 'timer', 'pressure-sensor', 'battery-life'],
  'water-flossers': ['brand', 'type', 'capacity', 'pressure-settings', 'tips-included', 'cordless'],
  'bathroom-scales': ['brand', 'capacity', 'type', 'digital-mechanical', 'body-composition', 'app-sync'],
  'massagers': ['brand', 'type', 'power-source', 'heat', 'intensity-levels', 'attachments'],
  'foot-massagers': ['brand', 'type', 'heat', 'intensity-levels', 'shiatsu', 'air-compression'],
  'heating-pads': ['brand', 'size', 'heat-settings', 'auto-shutoff', 'moist-dry', 'washable'],
  
  // Sewing & Fabric Care
  'sewing-machines': ['brand', 'type', 'stitches', 'computerized-mechanical', 'automatic-threading', 'speed'],
  'sergers': ['brand', 'threads', 'stitches', 'differential-feed', 'rolled-hem', 'speed'],
  'embroidery-machines': ['brand', 'hoop-size', 'designs', 'touchscreen', 'usb', 'wifi'],
  'fabric-steamers': ['brand', 'type', 'capacity', 'heat-up-time', 'handheld-standing', 'attachments'],
  'lint-removers': ['brand', 'type', 'power-source', 'blade-size', 'container-capacity'],
  
  // Home Comfort
  'fireplaces': ['brand', 'type', 'size', 'heat-output', 'flame-effect', 'remote'],
  'electric-fireplaces': ['brand', 'size', 'heat-output', 'flame-effect', 'remote', 'mantel-insert'],
  'fireplace-inserts': ['brand', 'type', 'size', 'heat-output', 'blower', 'remote'],
  'electric-blankets': ['brand', 'size', 'heat-settings', 'auto-shutoff', 'dual-controls', 'washable'],
  'heated-mattress-pads': ['brand', 'size', 'heat-settings', 'auto-shutoff', 'dual-controls', 'washable'],
  
  // Smart Home Appliances
  'smart-home-appliances': ['brand', 'type', 'connectivity', 'voice-control', 'app-control'],
  'smart-displays': ['brand', 'screen-size', 'resolution', 'assistant', 'camera', 'speakers'],
  'smart-speakers': ['brand', 'assistant', 'audio-quality', 'smart-home-hub', 'display'],
  'smart-plugs': ['brand', 'power-rating', 'voice-control', 'scheduling', 'energy-monitoring'],
  'smart-switches': ['brand', 'type', 'voice-control', 'dimmer', 'neutral-wire', 'hub-required'],
  'smart-bulbs': ['brand', 'wattage', 'color', 'brightness', 'voice-control', 'hub-required'],
  'smart-locks': ['brand', 'type', 'connectivity', 'keypad', 'auto-lock', 'voice-control'],
  'video-doorbells': ['brand', 'resolution', 'field-of-view', 'two-way-audio', 'night-vision', 'subscription'],
  'security-cameras': ['brand', 'resolution', 'field-of-view', 'night-vision', 'two-way-audio', 'storage'],
  'smart-sensors': ['brand', 'type', 'connectivity', 'battery-life', 'range', 'hub-required'],
  
  // Miscellaneous Appliances
  'trash-compactors': ['brand', 'capacity', 'compaction-ratio', 'odor-control', 'built-in-freestanding'],
  'garbage-disposals': ['brand', 'horsepower', 'grinding-stages', 'noise-level', 'continuous-feed'],
  'wine-refrigerators': ['brand', 'capacity', 'zones', 'temperature-range', 'freestanding-built-in'],
  'beverage-coolers': ['brand', 'capacity', 'temperature-range', 'glass-door', 'freestanding-built-in'],
  'kegerators': ['brand', 'capacity', 'keg-size', 'temperature-range', 'co2-tank', 'tap-tower'],
};
