import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const DATASET_DIR = "/home/anyaji/anim2code-dev/dataset";

const keyPath = path.join(process.cwd(), "firebase_key.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function main() {
  const snap = await db
    .collection("animations")
    .where("animationType", "==", "js")
    .get();

  console.log(`Found ${snap.size} JS animation docs to patch...`);

  let patched = 0;
  for (const doc of snap.docs) {
    const jsPath = path.join(DATASET_DIR, doc.id, "src", "script.js");
    if (!fs.existsSync(jsPath)) {
      console.log(`SKIP ${doc.id} (no script.js)`);
      continue;
    }
    const js = fs.readFileSync(jsPath, "utf-8");
    await doc.ref.update({ js });
    console.log(`PATCHED ${doc.id}`);
    patched++;
  }

  console.log(`Done. Patched ${patched} docs.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
