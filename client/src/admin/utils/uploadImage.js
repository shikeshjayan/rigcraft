export const validateImage = (file) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 2 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, WebP, and GIF are allowed" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be under 2MB" };
  }

  return { valid: true, error: null };
};

export const previewImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
