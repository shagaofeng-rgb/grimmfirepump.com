"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxFileSize = 15 * 1024 * 1024;

function filename(name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()}` : "";
  const base = name.slice(0, name.length - extension.length).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base || "media-image"}${extension.toLowerCase()}`;
}

export function MediaUploadForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  async function uploadFile(file: File | undefined) {
    if (!file || uploading) return;
    if (!allowedTypes.includes(file.type) || file.size > maxFileSize) {
      setStatus("仅支持 JPG、PNG、WebP、AVIF，单个文件最大 15MB。");
      return;
    }
    setUploading(true);
    setStatus("正在上传图片...");
    try {
      const result = await upload(`media/${filename(file.name)}`, file, { access: "public", handleUploadUrl: "/api/admin/uploads", multipart: true });
      setUrl(result.url);
      setStatus("图片已上传，可补充资料后保存到资源库。");
    } catch (error) {
      setStatus(error instanceof Error ? `上传失败：${error.message}` : "上传失败，请稍后重试。");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }
  return <form action={action} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div><h2 className="text-xl font-black text-slate-950">上传媒体资源</h2><p className="mt-1 text-sm leading-6 text-slate-500">上传图片后自动填写文件地址；PDF、视频和其他资料可填写已托管的公开地址。</p></div>
    <input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void uploadFile(event.target.files?.[0])} />
    <div className="grid min-h-32 place-items-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center"><div className="grid justify-items-center gap-2">{uploading ? <LoaderCircle className="animate-spin text-orange-600" size={28} /> : <UploadCloud className="text-orange-600" size={28} />}<p className="text-sm font-bold text-slate-700">选择需要上传的图片</p><button className="button button-secondary min-h-10" type="button" onClick={() => input.current?.click()} disabled={uploading}><ImagePlus size={16} />{uploading ? "正在上传" : "选择图片"}</button></div></div>
    {status ? <p className="text-sm font-bold text-slate-600" aria-live="polite">{status}</p> : null}
    <label className="grid gap-2 text-sm font-bold text-slate-700">文件名称<input name="name" required className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">文件类型<select name="type" className="min-h-11 rounded-md border border-slate-300 px-3 font-normal"><option value="image">图片</option><option value="pdf">PDF</option><option value="video">视频</option><option value="document">Word/Excel</option><option value="cad">CAD</option><option value="archive">ZIP</option><option value="other">其他</option></select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">文件地址<input name="url" required value={url} onChange={(event) => setUrl(event.target.value)} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" placeholder="上传图片后自动填写，或粘贴公开地址" /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">资源分类<input name="folder" defaultValue="General" className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">替代文本<input name="alt" className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">关联位置<input name="usedBy" className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">说明<textarea name="description" rows={3} className="rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
    <button className="button button-primary" type="submit">保存到资源库</button>
  </form>;
}
