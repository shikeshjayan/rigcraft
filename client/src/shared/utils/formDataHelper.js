export const toFormData = (data, fieldMap = {}) => {
  const hasFile = Object.keys(fieldMap).some((frontField) => {
    const val = data[frontField];
    if (val instanceof File || val instanceof Blob) return true;
    if (Array.isArray(val)) return val.some((v) => v instanceof File || v instanceof Blob);
    return false;
  });
  if (!hasFile) return null;

  const fd = new FormData();
  const body = { ...data };

  Object.entries(fieldMap).forEach(([frontField, backField]) => {
    const val = body[frontField];
    delete body[frontField];
    if (val instanceof File || val instanceof Blob) {
      fd.append(backField, val);
    } else if (Array.isArray(val)) {
      const files = val.filter((v) => v instanceof File || v instanceof Blob);
      const nonFiles = val.filter((v) => !(v instanceof File || v instanceof Blob));
      files.forEach((f) => fd.append(backField, f));
      if (nonFiles.length > 0) body[frontField] = nonFiles;
    }
  });

  fd.append("body", JSON.stringify(body));
  return fd;
};
