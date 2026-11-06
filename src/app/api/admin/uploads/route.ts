import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentAdmin } from "@/lib/admin-auth";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "未登录或登录已过期。" }, { status: 401 });
  if (!["super_admin", "product_manager", "content_manager"].includes(admin.role)) return Response.json({ error: "没有上传权限。" }, { status: 403 });
  const body = await request.json().catch(() => null) as HandleUploadBody | null;
  if (!body || body.type !== "blob.generate-client-token") {
    return Response.json({ error: "无效的上传请求。" }, { status: 400 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "图片存储尚未配置，请联系管理员启用媒体存储。" }, { status: 503 });
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^(products|media)\/[a-z0-9][a-z0-9._-]{0,175}\.(jpe?g|png|webp|avif)$/i.test(pathname)) throw new Error("Invalid upload path.");

        return {
          allowedContentTypes: imageTypes,
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
    });

    return Response.json(response);
  } catch {
    return Response.json({ error: "图片上传失败，请检查图片格式和大小后重试。" }, { status: 400 });
  }
}
