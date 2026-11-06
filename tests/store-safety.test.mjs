import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import ts from "typescript";
import * as neonDriver from "@neondatabase/serverless";

const require = createRequire(import.meta.url);
const { neonConfig } = neonDriver;
async function compile(file, dependencies = {}) {
  const source = await readFile(new URL(`../src/lib/${file}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } });
  const module = { exports: {} };
  new Function("module", "exports", "require", outputText)(module, module.exports, (name) => dependencies[name] || require(name));
  return module.exports;
}

test("atomic lead mutations, request replay, date filtering, and rate limiting", async () => {
  const dir = await mkdtemp(join(tmpdir(), "grimm-store-test-"));
  const originalDir = process.cwd();
  const variables = ["DATABASE_URL", "POSTGRES_URL", "VERCEL", "VERCEL_ENV", "NODE_ENV"];
  const originalEnv = new Map(variables.map((name) => [name, process.env[name]]));
  let db;
  const savedFetch = neonConfig.fetchFunction;
  try {
    process.chdir(dir);
    for (const name of variables) delete process.env[name];
    const pg = process.env.QA_PGLITE_MODULE;
    if (pg) {
      const { PGlite } = require(pg);
      db = new PGlite();
      process.env.POSTGRES_URL = "postgresql://isolated:isolated@localhost/grimm_test";
      process.env.NODE_ENV = "production";
      neonConfig.fetchFunction = async (_, { body }) => {
        const { query, params } = JSON.parse(body);
        try {
          const result = await db.query(query, params, { rowMode: "array" });
          result.rows = result.rows.map((row) => row.map((cell) => cell === null ? null : typeof cell === "object" ? JSON.stringify(cell) : String(cell)));
          return Response.json(result);
        } catch (error) {
          return Response.json({ message: error.message, code: error.code }, { status: 400 });
        }
      };
    }
    const store = await compile("local-store", { "./admin-listing": await compile("admin-listing"), "@neondatabase/serverless": neonDriver });
    const file = "inquiries.json";
    const createdAt = "2026-11-06T16:00:00.000Z";
    const item = { id: "first", createdAt, name: "Isolated test", status: "new", visitorId: "qa-visitor" };
    const saved = await Promise.all(Array.from({ length: 12 }, () => store.insertStoreItem(file, item)));
    assert.equal(saved.filter(Boolean).length, 1);
    await Promise.all([
      store.patchStoreItem(file, "first", { status: "quoted" }),
      store.patchStoreItem(file, "first", { notes: "kept" }),
      store.appendStore(file, { ...item, id: "second", createdAt: "2026-11-06T15:59:59.000Z" }),
      store.appendStore(file, { ...item, id: "third" }),
    ]);
    assert.deepEqual(await store.readStoreItem(file, "first"), { ...item, notes: "kept", status: "quoted" });
    assert.equal(await store.countPendingInquiries(), 2);
    assert.deepEqual((await store.readStoreRange(file, { from: "2026-11-07", to: "2026-11-07", match: { field: "visitorId", value: "qa-visitor" } })).map(({ id }) => id).sort(), ["first", "third"]);
    await Promise.all([store.deleteStoreItem(file, "first"), store.appendStore(file, { ...item, id: "fourth" })]);
    assert.deepEqual((await store.readStore(file, [])).map(({ id }) => id).sort(), ["fourth", "second", "third"]);
    const time = Date.parse(createdAt);
    const counts = await Promise.all(Array.from({ length: 12 }, () => store.incrementRequestWindow("test-window", 1000, time)));
    assert.deepEqual(counts.map(({ count }) => count).sort((a,b) => a - b), Array.from({ length: 12 }, (_, index) => index + 1));
    assert.equal((await store.incrementRequestWindow("test-window", 1000, time + 1000)).count, 1);
    assert.equal(store.submissionId("inq", "repeatable", "a"), store.submissionId("inq", "repeatable", "a"));
    assert.notEqual(store.submissionId("inq", "repeatable", "a"), store.submissionId("inq", "repeatable", "b"));
  } finally {
    neonConfig.fetchFunction = savedFetch;
    for (const [name, value] of originalEnv) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await db?.close();
    process.chdir(originalDir);
    await rm(dir, { recursive: true, force: true });
  }
});
