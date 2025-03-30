import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

const isDev = process.env.NODE_ENV === "development";

const env = {
  // utility credentials
  FRONTEND_URL: isDev ? "http://localhost:5173" : getEnv("FRONTEND_URL_PROD"),
  ADMIN_URL: isDev ? "http://localhost:5174" : getEnv("ADMIN_URL_PROD"),
  PORT: getEnv("PORT", "8080"),

  // firebase collections
  REGISTRATIONS_COLLECTION: "participants",
  STATS_COLLECTION: "stats",
  FEEDBACK_COLLECTION: "feedbacks",
  ADMIN_USERS_COLLECTION: "admins",

  // google cloud credentials for storage
  GOOGLE_CLOUD_PROJECT_ID: getEnv("GOOGLE_CLOUD_PROJECT_ID"),
  GOOGLE_CLOUD_PRIVATE_KEY: getEnv("GOOGLE_CLOUD_PRIVATE_KEY"),
  GOOGLE_CLOUD_CLIENT_EMAIL: getEnv("GOOGLE_CLOUD_CLIENT_EMAIL"),

  // more utily credentials
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRY: getEnv("JWT_EXPIRY"),
  EMAIL: getEnv("LOGIN_EMAIL"),
  PASSWORD: getEnv("PASSWORD"),
};

export { env };
