export async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Release memory immediately once the image is loaded into the Image element
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      try {
        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG. WebP encoding in Safari can occasionally cause memory spikes, and JPEG is natively hardware accelerated.
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Free up the canvas memory manually
        canvas.width = 0;
        canvas.height = 0;
        
        resolve(compressedBase64);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    
    img.src = objectUrl;
  });
}
