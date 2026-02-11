/**
 * Image Validator for Product Uploads
 * Validates image dimensions, format, and size
 */

export const IMAGE_REQUIREMENTS = {
  minWidth: 200, // Lowered from 500
  minHeight: 200, // Lowered from 500
  maxSizeMB: 10,
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
  preferredFormats: ['image/webp', 'image/avif'],
  mustBeSquare: false // Relaxed: most products are not square
};

/**
 * Validate a single image file
 * @param {File} file - The image file to validate
 * @returns {Promise<{valid: boolean, error?: string, warnings?: string[], dimensions?: {width: number, height: number}}>}
 */
export async function validateImage(file) {
  const result = {
    valid: false,
    warnings: []
  };

  // Check file type
  if (!IMAGE_REQUIREMENTS.allowedFormats.includes(file.type)) {
    result.error = `Invalid format. Please use: ${IMAGE_REQUIREMENTS.allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`;
    return result;
  }

  // Suggest better formats
  if (!IMAGE_REQUIREMENTS.preferredFormats.includes(file.type)) {
    result.warnings.push(`Consider using WebP or AVIF format for better web performance`);
  }

  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > IMAGE_REQUIREMENTS.maxSizeMB) {
    result.error = `File too large (${sizeMB.toFixed(1)}MB). Maximum size is ${IMAGE_REQUIREMENTS.maxSizeMB}MB`;
    return result;
  }

  // Check dimensions
  try {
    const dimensions = await getImageDimensions(file);
    result.dimensions = dimensions;

    // Check minimum dimensions
    if (dimensions.width < IMAGE_REQUIREMENTS.minWidth || dimensions.height < IMAGE_REQUIREMENTS.minHeight) {
      result.error = `Image too small (${dimensions.width}x${dimensions.height}px). Minimum size is ${IMAGE_REQUIREMENTS.minWidth}x${IMAGE_REQUIREMENTS.minHeight}px`;
      return result;
    }

    // Check if square
    if (IMAGE_REQUIREMENTS.mustBeSquare && dimensions.width !== dimensions.height) {
      result.error = `Image must be square. Current size: ${dimensions.width}x${dimensions.height}px`;
      return result;
    }

    // Recommend higher resolution
    if (dimensions.width < 1000 || dimensions.height < 1000) {
      result.warnings.push(`Consider using higher resolution (1000x1000px or larger) for better quality`);
    }

    result.valid = true;
    return result;

  } catch (error) {
    result.error = 'Failed to read image. Please try another file.';
    return result;
  }
}

/**
 * Get image dimensions from file
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>}
 */
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate multiple images
 * @param {File[]} files - Array of image files
 * @returns {Promise<{valid: boolean, results: Array, errors: string[], warnings: string[]}>}
 */
export async function validateImages(files) {
  const results = await Promise.all(files.map(file => validateImage(file)));

  const errors = results
    .filter(r => !r.valid)
    .map((r, i) => `Image ${i + 1}: ${r.error}`);

  const warnings = results
    .flatMap((r, i) => (r.warnings || []).map(w => `Image ${i + 1}: ${w}`));

  return {
    valid: errors.length === 0,
    results,
    errors,
    warnings
  };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
