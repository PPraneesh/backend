import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

const isDev = process.env.NODE_ENV === "development";

const env = {
  // utility credentials
  FRONTEND_URL: isDev ? "http://localhost:5173" : getEnv("FRONTEND_URL_PROD"),
  PORT: getEnv("PORT", "3000"),
};

export { env };
