const sanitizeValue = (value) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  return Object.keys(value).reduce((sanitized, key) => {
    if (key.startsWith("$") || key.includes(".")) {
      return sanitized;
    }

    sanitized[key] = sanitizeValue(value[key]);
    return sanitized;
  }, {});
};

const mongoSanitize = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      if (key.startsWith("$") || key.includes(".")) {
        delete req.params[key];
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (key.startsWith("$") || key.includes(".")) {
        delete req.query[key];
      } else {
        req.query[key] = sanitizeValue(req.query[key]);
      }
    });
  }

  next();
};

module.exports = mongoSanitize;
