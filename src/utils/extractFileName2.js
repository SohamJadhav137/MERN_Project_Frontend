export const extractCleanFileName = (url) => {
  if (!url) return '';

  const fileName = url.split('/').pop(); // 1768299861199-img1.jpg

  // Remove leading timestamp + dash
  return fileName.replace(/^\d+-/, '');
};
