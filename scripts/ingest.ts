import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

const DATASET_DIR = "/home/anyaji/anim2code-dev/dataset";
const MANIFEST_PATH = path.join(DATASET_DIR, "_record_manifest.json");
const STORAGE_BUCKET = "anim2code-annotate.firebasestorage.app";
const CONCURRENCY = 5;

const keyPath = path.join(process.cwd(), "firebase_key.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: STORAGE_BUCKET,
  });
}

const db = getFirestore();
const storage = getStorage();

interface ManifestEntry {
  folder: string;
  status: string;
  animationType: string;
  durationS: number;
}

async function fileExistsInStorage(filePath: string): Promise<boolean> {
  try {
    const [exists] = await storage.bucket().file(filePath).exists();
    return exists;
  } catch {
    return false;
  }
}

async function uploadVideo(localPath: string, storagePath: string): Promise<string> {
  await storage.bucket().upload(localPath, {
    destination: storagePath,
    metadata: { contentType: "video/mp4" },
    public: true,
  });
  return `https://storage.googleapis.com/${STORAGE_BUCKET}/${storagePath}`;
}

function detectAnimationType(folderPath: string, html: string): string {
  const scriptJsPath = path.join(folderPath, "src", "script.js");
  if (fs.existsSync(scriptJsPath)) return "js";
  if (/<script[\s>]/i.test(html)) return "js";
  return "css";
}

async function ingestFolder(
  folder: string,
  index: number,
  total: number,
  manifestMap: Map<string, ManifestEntry>
) {
  const docRef = db.collection("animations").doc(folder);
  const existing = await docRef.get();
  if (existing.exists) {
    console.log(`[${index}/${total}] SKIP ${folder} (already ingested)`);
    return;
  }

  const folderPath = path.join(DATASET_DIR, folder);
  const metadataPath = path.join(folderPath, "metadata.json");
  const htmlPath = path.join(folderPath, "src", "index.html");
  const cssPath = path.join(folderPath, "src", "style.css");
  const jsPath = path.join(folderPath, "src", "script.js");
  const videoPath = path.join(folderPath, "animation.mp4");

  if (!fs.existsSync(metadataPath) || !fs.existsSync(videoPath)) {
    console.log(`[${index}/${total}] SKIP ${folder} (missing files)`);
    return;
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf-8") : "";
  const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf-8") : "";
  const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, "utf-8") : undefined;

  const manifestEntry = manifestMap.get(folder);
  const animationType = manifestEntry?.animationType ?? detectAnimationType(folderPath, html);
  const durationS = manifestEntry?.durationS ?? 0;

  const storagePath = `animations/${folder}/animation.mp4`;
  const alreadyUploaded = await fileExistsInStorage(storagePath);
  let videoUrl: string;

  if (alreadyUploaded) {
    videoUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${storagePath}`;
  } else {
    console.log(`[${index}/${total}] Uploading: ${folder}`);
    videoUrl = await uploadVideo(videoPath, storagePath);
  }

  const doc: Record<string, unknown> = {
    title: metadata.title ?? folder,
    url: metadata.url ?? "",
    animationType,
    durationS,
    videoUrl,
    html,
    css,
  };
  if (js !== undefined) doc.js = js;

  await docRef.set(doc);

  console.log(`[${index}/${total}] DONE ${folder} — "${metadata.title}"`);
}

async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  concurrency: number
) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      await fn(items[i], i).catch((err) =>
        console.error(`Error on item ${i}:`, err)
      );
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const manifestMap = new Map<string, ManifestEntry>(
    manifest.results.map((r: ManifestEntry) => [r.folder, r])
  );

  const folders = fs
    .readdirSync(DATASET_DIR)
    .filter((f) => f.startsWith("codepen-"))
    .sort();

  console.log(`Found ${folders.length} folders. Starting ingestion (concurrency=${CONCURRENCY})...`);

  await runWithConcurrency(
    folders,
    (folder, i) => ingestFolder(folder, i + 1, folders.length, manifestMap),
    CONCURRENCY
  );

  console.log("Ingestion complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
