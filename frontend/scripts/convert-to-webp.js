import imagemin from "imagemin";
import webp from "imagemin-webp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const inputFolder = path.join(__dirname, "../img");
  const outputFolder = path.join(__dirname, "../img");

  await imagemin([`${inputFolder}/*.{jpg,jpeg,png}`], {
    destination: outputFolder,
    plugins: [
      webp({ quality: 80 })
    ]
  });

  console.log("✅ WebP dönüştürme tamamlandı.");
})();
