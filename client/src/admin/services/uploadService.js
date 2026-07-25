export const buildFormData = (data, fileFields = {}) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && !fileFields[key]) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }

  for (const [field, files] of Object.entries(fileFields)) {
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append(field, file));
    } else if (files) {
      formData.append(field, files);
    }
  }

  return formData;
};

export const getUploadConfig = () => ({
  headers: { "Content-Type": "multipart/form-data" },
});
