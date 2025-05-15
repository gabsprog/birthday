// src/lib/cloudinaryUpload.js
// This version uses a more reliable client-side upload method

/**
 * Upload an image directly to Cloudinary from the client
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} The upload result
 */
export async function uploadToCloudinary(file, onProgress = null) {
  try {
    // Get upload signature from our API
    const signatureResponse = await fetch('/api/cloudinary-signature');
    
    if (!signatureResponse.ok) {
      const errorData = await signatureResponse.json();
      throw new Error(`Failed to get upload signature: ${errorData.error || signatureResponse.statusText}`);
    }
    
    const { signature, timestamp, cloudName, apiKey, folder } = await signatureResponse.json();
    
    // Create a FormData object for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    
    // Add transformations for optimization
    formData.append('transformation', 'w_1200,c_limit,q_auto:good');
    
    // Upload the file directly to Cloudinary
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Setup progress tracking if a callback was provided
      if (onProgress && typeof onProgress === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }
      
      // Handle the response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              url: result.secure_url,
              public_id: result.public_id
            });
          } catch (error) {
            reject(new Error('Invalid response from Cloudinary'));
          }
        } else {
          // Try to parse the error
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(`Upload failed: ${errorData.error?.message || xhr.statusText}`));
          } catch (e) {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      };
      
      // Handle network errors
      xhr.onerror = () => reject(new Error('Network error during upload'));
      
      // Open and send the request
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}