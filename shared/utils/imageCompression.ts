import { FILE_CONSTRAINTS } from '../constants';

/**
 * Compress image to meet file size constraints
 * @param file Image file from upload
 * @returns Base64 encoded compressed image
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate dimensions
        let width = img.width;
        let height = img.height;
        const maxWidth = 800;
        const maxHeight = 800;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress iteratively until under size limit
        let quality = FILE_CONSTRAINTS.PHOTO_QUALITY;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        let sizeKB = (base64.length * 0.75) / 1024;

        while (sizeKB > FILE_CONSTRAINTS.MAX_PHOTO_SIZE_KB && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality);
          sizeKB = (base64.length * 0.75) / 1024;
        }

        if (sizeKB > FILE_CONSTRAINTS.MAX_PHOTO_SIZE_KB) {
          reject(
            new Error(
              `Image still too large: ${sizeKB.toFixed(2)}KB (max: ${FILE_CONSTRAINTS.MAX_PHOTO_SIZE_KB}KB)`
            )
          );
        } else {
          resolve(base64);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const { ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE_KB } = FILE_CONSTRAINTS;

  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid image type. Allowed: ${ALLOWED_PHOTO_TYPES.join(', ')}`,
    };
  }

  const sizeKB = file.size / 1024;
  if (sizeKB > MAX_PHOTO_SIZE_KB) {
    return {
      valid: false,
      error: `Image too large: ${sizeKB.toFixed(2)}KB (max: ${MAX_PHOTO_SIZE_KB}KB)`,
    };
  }

  return { valid: true };
}
