import { certificates } from "@/data/site";

// These public derivatives have date pixels redacted in the image itself.
const previews = [
  { source: "iso-9001-quality.png", file: "iso-9001.jpg", label: "ISO 9001" },
  { source: "iso-14001-environmental.png", file: "iso-14001.jpg", label: "ISO 14001" },
  { source: "iso-45001-ohs.png", file: "iso-45001.jpg", label: "ISO 45001" },
  { source: "fire-pump-emc-attestation.jpg", file: "emc-attestation.jpg", label: "Machinery & EMC" },
];

export const certificatePreviews = previews.flatMap(({ source, file, label }) => {
  const original = certificates.find(({ src }) => src.endsWith(`/${source}`));
  return original ? [{ ...original, src: `/assets/certificates/interior/${file}`, label }] : [];
});
