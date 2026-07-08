# GRIMM Fire Pump 后台交付说明

## 当前已实现

- `/admin/login` 中文登录页：用户名、密码、记住登录、失败限流、登录日志。
- `/admin/dashboard` 数据概览：产品、新闻、询盘、下载、事件、审计日志。
- `/admin/products` 产品列表、筛选、CSV 导出、编辑入口。
- `/admin/products/new` 与 `/admin/products/[id]/edit` 产品新增/编辑。
- `/admin/product-categories` 产品分类管理。
- `/admin/news` 新闻列表、发布状态、CSV 导出、编辑入口。
- `/admin/news/new` 与 `/admin/news/[id]/edit` 新闻新增/编辑。
- `/admin/leads` 询盘 CRM：状态、意向等级、负责人、备注、删除、CSV 导出。
- `/admin/downloads` 下载资料管理与下载线索查看。
- `/admin/media` 媒体资源登记。
- `/admin/pages` 页面可控字段管理。
- `/admin/seo` SEO/GEO 配置状态与基础审计。
- `/admin/analytics` 网站自有事件统计；第三方未配置时明确显示未配置。
- `/admin/forms` Contact、Product Inquiry、Download Gate、OEM/ODM、Facebook Lead Ads 入口说明。
- `/admin/users` 默认管理员、角色权限说明、后台改密。
- `/admin/logs` 登录日志与操作审计。
- `/admin/settings` 公司信息、SEO、统计和公开集成配置。

## 数据存储

当前线上可直接使用 Neon/Vercel Postgres。为了快速上线，系统使用 `lead_store` JSONB 表保存 CMS、线索和日志数据。没有数据库环境变量时，本地会回退到 `data/runtime`。

需要配置其中一个：

- `DATABASE_URL`
- `POSTGRES_URL`

推荐后续阶段按 `database/admin-schema.sql` 迁移成更标准的多表结构。

## 安全配置

推荐使用哈希密码：

```bash
node scripts/hash-admin-password.mjs "your-strong-password"
```

把输出写入 Vercel 环境变量 `ADMIN_PASSWORD_HASH`。同时配置：

- `ADMIN_USERNAME`
- `ADMIN_DISPLAY_NAME`
- `ADMIN_ROLE`
- `ADMIN_SESSION_SECRET`

`ADMIN_PASSWORD` 仅作为旧版兼容，不建议长期使用。

## 第三方集成

Facebook Lead Ads Webhook：

- 验证接口：`GET /api/integrations/meta-leads`
- 接收接口：`POST /api/integrations/meta-leads`
- 必需环境变量：`META_LEADS_VERIFY_TOKEN`

未配置时接口会返回“未配置”，不会伪造第三方数据。

## 导出接口

登录后台后可下载：

- `/api/admin/export?type=leads`
- `/api/admin/export?type=products`
- `/api/admin/export?type=news`
- `/api/admin/export?type=downloads`
- `/api/admin/export?type=events`

导出接口受管理员登录保护，并处理了 CSV 公式注入风险。

## 维护建议

- 定期导出线索与下载记录做备份。
- 上线后尽快把 `ADMIN_PASSWORD` 替换成 `ADMIN_PASSWORD_HASH`。
- 如果要多人协作，下一阶段应把 JSONB 存储迁移到 `database/admin-schema.sql` 的标准表。
- 如果需要真实上传文件，建议接入 Vercel Blob 或 S3，并把 `/admin/media` 从 URL 登记升级为上传管理。
