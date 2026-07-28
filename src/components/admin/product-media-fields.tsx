"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, LoaderCircle, Star, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

type ProductMediaFieldsProps = {
  initialMainImage?: string;
  initialGallery?: string[];
  initialOgImage?: string;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxFileSize = 15 * 1024 * 1024;

function safeFilename(name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()}` : "";
  const base = name.slice(0, name.length - extension.length).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base || "product-image"}${extension.toLowerCase()}`;
}

export function ProductMediaFields({ initialMainImage = "", initialGallery = [], initialOgImage = "" }: ProductMediaFieldsProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [mainImage, setMainImage] = useState(initialMainImage);
  const [gallery, setGallery] = useState(initialGallery);
  const [ogImage, setOgImage] = useState(initialOgImage || initialMainImage);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length || isUploading) return;

    const invalid = files.find((file) => !allowedTypes.includes(file.type) || file.size > maxFileSize);
    if (invalid) {
      setStatus("仅支持 JPG、PNG、WebP、AVIF 格式，单张最大 15MB。");
      return;
    }

    setIsUploading(true);
    setStatus(`正在上传 0/${files.length} 张图片…`);
    setProgress(0);

    try {
      const uploadedUrls: string[] = [];
      for (const [index, file] of files.entries()) {
        const result = await upload(`products/${safeFilename(file.name)}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/uploads",
          clientPayload: JSON.stringify({ source: "product-editor" }),
          multipart: true,
          onUploadProgress: ({ percentage }) => {
            setProgress(Math.round(((index + percentage / 100) / files.length) * 100));
          },
        });
        uploadedUrls.push(result.url);
      }

      setMainImage((current) => current || uploadedUrls[0] || "");
      setOgImage((current) => current || uploadedUrls[0] || "");
      setGallery((current) => [...current, ...uploadedUrls.filter((url) => !current.includes(url))]);
      setProgress(100);
      setStatus(`${uploadedUrls.length} 张图片已上传。首张图片已自动设为主图。`);
    } catch (error) {
      setStatus(error instanceof Error ? `上传失败：${error.message}` : "上传失败，请稍后重试。");
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const setAsMain = (url: string) => {
    setMainImage(url);
    if (!ogImage) setOgImage(url);
  };

  return (
    <div className="grid gap-5 md:col-span-2">
      <input type="hidden" name="mainImage" value={mainImage} />
      <input type="hidden" name="gallery" value={gallery.join(", ")} />
      <input type="hidden" name="ogImage" value={ogImage} />

      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(event) => void uploadFiles(event.target.files || [])}
      />

      <div
        className="grid min-h-48 place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50/40"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void uploadFiles(event.dataTransfer.files);
        }}
      >
        <div className="grid justify-items-center gap-3">
          {isUploading ? <LoaderCircle className="animate-spin text-orange-500" size={32} /> : <UploadCloud className="text-orange-500" size={32} />}
          <div>
            <p className="font-black text-slate-900">直接上传产品图片</p>
            <p className="mt-1 text-sm text-slate-500">拖入图片或选择文件。支持 JPG、PNG、WebP、AVIF，单张最大 15MB。</p>
          </div>
          <button className="button button-primary min-h-10" type="button" disabled={isUploading} onClick={() => fileInput.current?.click()}>
            <ImagePlus size={17} />
            {isUploading ? "正在上传" : "选择图片"}
          </button>
          {isUploading ? <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} /></div> : null}
          {status ? <p className="text-sm font-bold text-slate-600" aria-live="polite">{status}</p> : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          主图 URL（上传后自动填写）
          <input value={mainImage} onChange={(event) => setMainImage(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2.5 font-normal text-slate-700" placeholder="上传图片或粘贴 URL" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          OG 图片 URL（上传后可调整）
          <input value={ogImage} onChange={(event) => setOgImage(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2.5 font-normal text-slate-700" placeholder="默认使用产品主图" />
        </label>
      </div>

      {gallery.length ? (
        <div className="grid gap-3">
          <p className="text-sm font-black text-slate-900">产品图库</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {gallery.map((url) => (
              <figure key={url} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img src={url} alt="产品图库预览" className="aspect-square w-full object-contain bg-slate-50 p-3" />
                <figcaption className="flex items-center justify-between gap-2 border-t border-slate-200 p-2">
                  <button type="button" onClick={() => setAsMain(url)} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-black ${mainImage === url ? "bg-orange-100 text-orange-700" : "text-slate-600 hover:bg-slate-100"}`}>
                    <Star size={14} fill={mainImage === url ? "currentColor" : "none"} /> 主图
                  </button>
                  <button type="button" onClick={() => setGallery((current) => current.filter((item) => item !== url))} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="移除图片">
                    <Trash2 size={16} />
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
