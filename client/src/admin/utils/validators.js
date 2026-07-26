export const required = (value) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return "This field is required";
  }
  return undefined;
};

export const minLength = (min) => (value) => {
  if (value && value.length < min) {
    return `Must be at least ${min} characters`;
  }
  return undefined;
};

export const maxLength = (max) => (value) => {
  if (value && value.length > max) {
    return `Must be at most ${max} characters`;
  }
  return undefined;
};

export const isEmail = (value) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Invalid email address";
  }
  return undefined;
};

export const isPositiveNumber = (value) => {
  if (value !== undefined && value !== null && (isNaN(value) || Number(value) <= 0)) {
    return "Must be a positive number";
  }
  return undefined;
};

export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return undefined;
};
