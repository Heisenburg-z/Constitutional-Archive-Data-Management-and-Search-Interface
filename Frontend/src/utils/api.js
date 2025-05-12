export const decodeAzureBlobPath = (encodedPath) => {
    if (!encodedPath) return '#';
    
    try {
      const base64 = encodedPath.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const decoded = atob(padded);
      return decodeURIComponent(decoded);
    } catch (error) {
      console.error('Failed to decode blob path:', error);
      return '#';
    }
  };