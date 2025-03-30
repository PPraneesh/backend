import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env";

const serviceAccountKey: ServiceAccount = {
  projectId: env.GOOGLE_CLOUD_PROJECT_ID,
  privateKey: env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  clientEmail: env.GOOGLE_CLOUD_CLIENT_EMAIL,
};

const app = initializeApp({ credential: cert(serviceAccountKey) });
const db = getFirestore(app);

if (db) {
  console.log("Firebase initialized successfully");
} else {
  throw new Error("Failed to initialise firebase");
}

export { db };
