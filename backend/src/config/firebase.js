const path = require("path");
const admin = require("firebase-admin");

const resolveServiceAccountPath = () => {
  const configuredPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(__dirname, "../../", configuredPath);
  }

  return null;
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin;
  }

  const serviceAccountPath = resolveServiceAccountPath();

  if (!serviceAccountPath) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS is required"
    );
  }

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
};

module.exports = {
  getFirebaseAdmin: initializeFirebaseAdmin,
};
