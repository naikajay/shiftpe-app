const MAX_LIMIT = 20;

const getPagination = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const requestedLimit = Number(query.limit) || MAX_LIMIT;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

module.exports = {
  getPagination,
};
