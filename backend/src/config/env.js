const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (
    process.env.JWT_SECRET &&
    process.env.JWT_SECRET.length < 32 &&
    process.env.NODE_ENV === "production"
  ) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  if (
    process.env.JWT_SECRET &&
    process.env.JWT_SECRET.length < 32 &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn("Warning: JWT_SECRET should be at least 32 characters long before production.");
  }
};

module.exports = {
  validateEnv,
};
