import { mkdir, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
const sharp = createRequire(import.meta.url)("sharp");

const source = fileURLToPath(new URL("../public/assets/synced/products/", import.meta.url));
const output = join(source, "interior");
await mkdir(output, { recursive: true });

for (const file of await readdir(source)) {
  if (!/\.(jpg|png)$/.test(file)) continue;
  const target = join(output, `${basename(file, extname(file))}.webp`);
  await sharp(join(source, file))
    .rotate()
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 14 })
    .resize({ width: 1120, height: 1120, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(target);
}
