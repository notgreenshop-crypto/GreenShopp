// makeAdmin.js
import admin from "firebase-admin";
import { readFileSync } from "fs";

// 🔹 Load your Firebase service account key
const serviceAccount = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function makeAdmin() {
  const uid = "ukT15s2fKIOVhRLdTrF544RP5T22"; // your admin UID
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`✅ Admin rights granted to UID: ${uid}`);
}

makeAdmin().catch(console.error);
