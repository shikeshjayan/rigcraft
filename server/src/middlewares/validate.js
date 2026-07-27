import ApiError from '../utils/ApiError.js';

const validate = (schema) => (req, res, next) => {
  if (typeof req.body?.body === 'string') {
    try {
      const parsed = JSON.parse(req.body.body);
      delete req.body.body;
      Object.assign(req.body, parsed);
    } catch (e) {}
  }
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    throw ApiError.badRequest('Validation failed', errors);
  }
  req.body = result.data;
  next();
};

export default validate;
