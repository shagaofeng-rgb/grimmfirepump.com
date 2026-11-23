import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

async function compile(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } });
  const evaluate = new Function("module", "exports", "require", outputText);
  return (dependencies = {}) => {
    const module = { exports: {} };
    evaluate(module, module.exports, (name) => dependencies[name] || require(name));
    return module.exports;
  };
}

const evaluate = await compile("../src/app/api/webhook/send_article/route.ts");
const articleContent = (await compile("../src/lib/article-content.ts"))();
const blogTaxonomy = (await compile("../src/lib/blog-taxonomy.ts"))();

async function usingWebhook(run) {
  const sign = randomUUID();
  const envBefore = process.env.WEBHOOK_ARTICLE_SIGN;
  process.env.WEBHOOK_ARTICLE_SIGN = sign;
  const rows = new Map();
  const audits = [];
  const cacheOperations = [];
  const { GET, POST } = evaluate({
    "next/cache": {
      revalidatePath: (path) => cacheOperations.push(path),
      revalidateTag: (tag) => cacheOperations.push(tag),
    },
    "@/lib/article-content": articleContent,
    "@/lib/blog-taxonomy": blogTaxonomy,
    "@/lib/admin-cms": {
      isLegacyImportedBlogSlug: () => false,
      logAudit: async (log) => audits.push(log),
      cmsStore: {
        findNewsBySlug: async (slug) => [...rows.values()].filter((row) => row.slug === slug),
        getNews: async (id) => rows.get(id),
        insertNews: async (post) => {
          if (rows.has(post.id)) return false;
          rows.set(post.id, post);
          return true;
        },
      },
    },
  });
  const endpoint = "http://localhost/api/webhook/send_article";
  const submit = async (fields) => {
    const res = await POST(new Request(endpoint, {
      method: "POST", body: new URLSearchParams({ sign, class_id: "blog", ...fields }),
    }));
    assert.equal(res.status, 200);
    return res.json();
  };
  try {
    await run({ submit, verifyGet: async () => (await GET(new Request(`${endpoint}?${new URLSearchParams({ sign })}`))).json(), rows, audits, cacheOperations });
  } finally {
    if (envBefore === undefined) delete process.env.WEBHOOK_ARTICLE_SIGN;
    else process.env.WEBHOOK_ARTICLE_SIGN = envBefore;
  }
}

const article = {
  title: "Fire Pump Project Documentation",
  content: "<h2>Factory documentation</h2><p>A project submittal keeps the specified duty point and the equipment schedule together.</p>\n<p>The review team can compare both records before equipment is released.</p>",
  author_id: "partner",
  image_url: "/assets/applications/hero-edj.webp",
};

test("signed probes and invalid submissions do not create public posts", async () => {
  await usingWebhook(async ({ submit, verifyGet, rows, audits }) => {
    assert.deepEqual(await verifyGet(), { code: 1, msg: "验证成功" });
    assert.deepEqual(await submit({}), { code: 1, msg: "验证成功" });
    assert.deepEqual(await submit({ title: "Test", content: "Test body" }), { code: 1, msg: "验证成功" });
    assert.deepEqual(await submit({ ...article, sign: "invalid-key" }), { code: 0, msg: "秘钥错误" });
    assert.equal((await submit({ ...article, content: "<!-- The contributor has not yet written the article. -->" })).code, 0);
    assert.equal(rows.size, 0);
    assert.deepEqual(audits.map((log) => log.action), ["webhook_auth_failed", "webhook_invalid_article"]);
  });
});

test("a concurrent delivery creates one published, indexable Blog article", async () => {
  await usingWebhook(async ({ submit, rows, audits, cacheOperations }) => {
    const started = Date.now();
    const results = await Promise.all(Array.from({ length: 6 }, () => submit(article)));
    assert.ok(results.every((result) => result.code === 1 && result.msg === "发布成功"));
    assert.equal(rows.size, 1);
    const [post] = rows.values();
    assert.equal(post.title, article.title);
    assert.equal(post.status, "published");
    assert.equal(post.category, "Technical Articles");
    assert.equal(post.indexable, true);
    assert.equal(post.author, "partner");
    assert.equal(post.coverImage, article.image_url);
    assert.match(post.content, /^## Factory documentation\n\nA project submittal/);
    assert.match(post.content, /The review team can compare/);
    assert.ok(Date.parse(post.publishAt) >= started && Date.parse(post.publishAt) <= Date.now());
    assert.deepEqual(audits.map((log) => log.action), ["publish_webhook_blog"]);
    assert.ok(["cms-blog", "sitemap-data", "/blog", `/blog/${post.slug}`, "/blog-sitemap.xml", "/sitemap.xml"]
      .every((operation) => cacheOperations.includes(operation)));
  });
});

test("the legacy Blog ID uses the same category and custom class IDs are preserved", async () => {
  await usingWebhook(async ({ submit, rows }) => {
    assert.equal((await submit({ ...article, class_id: "31" })).code, 1);
    assert.equal((await submit({ ...article, class_id: "special" })).code, 1);
    assert.deepEqual([...rows.values()].map((post) => post.category), ["Technical Articles", "External Blog special"]);
  });
});

test("existing legacy drafts, archived articles and editorial decisions remain untouched", async () => {
  await usingWebhook(async ({ submit, rows, audits }) => {
    for (const [status, indexable] of [["draft", false], ["archived", false], ["published", false], ["published", true]]) {
      const title = `${article.title} ${status} ${indexable}`;
      const hash = createHash("sha256").update(["blog", title, article.author_id].join("\\n")).digest("hex");
      const id = `webhook_blog_${hash.slice(0, 20)}`;
      const original = { id, slug: `legacy-${status}-${indexable}`, status, indexable, category: "Original category", content: "Editorial copy", publishAt: "2026-09-19T07:00:00Z" };
      rows.set(id, original);
      const result = await submit({ ...article, title });
      assert.deepEqual(result, { code: 1, msg: status === "published" ? "发布成功" : "文章已存在，保留原有状态" });
      assert.deepEqual(rows.get(id), original);
    }
    assert.equal(rows.size, 4);
    assert.deepEqual(audits, []);
  });
});
