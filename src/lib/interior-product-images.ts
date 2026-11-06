const importedMainPhotos = new Set([
  "2-electric-plus-jockey-pump-set.jpg",
  "diesel-engine-fire-pump.png",
  "diesel-engine-irrigation-pump-trailer-type.jpg",
  "diesel-engine-long-shaft-fire-pump.png",
  "diesel-engine-plus-jockey-pump-set.jpg",
  "edj-fire-pump-set.jpg",
  "electric-horizontal-split-end-suction-pump.png",
  "electric-long-shaft-fire-pump.png",
  "frequency-conversion-water-supply-equipment.jpg",
  "horizontal-booster-pump-group.jpg",
  "integrated-prefabricated-pump-station-frp.jpg",
  "submersible-sewage-pump.png",
  "vertical-stainless-steel-multistage-pump-jockey-pump.png",
]);

export function interiorProductPhoto(src: string) {
  const prefix = "/assets/synced/products/";
  const name = src.startsWith(prefix) ? src.slice(prefix.length) : "";
  return importedMainPhotos.has(name) ? `${prefix}interior/${name.replace(/\.(jpg|png)$/, ".webp")}` : src;
}
