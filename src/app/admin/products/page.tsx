import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { products } from "@/data/site";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Products</p>
      <h1 className="mt-3 text-4xl font-black text-white">Product catalog control</h1>
      <p className="mt-4 max-w-3xl leading-7 text-slate-400">
        Current products are synchronized from the existing website. The next production step is replacing this JSON workflow with CMS product editing.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Link key={product.slug} href={`/products/${product.slug}`} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.08]">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-orange-300">{product.category}</span>
            <h2 className="mt-3 text-xl font-black text-white">{product.title}</h2>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{product.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.specs.slice(0, 3).map((spec) => (
                <span key={spec} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300">{spec}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
