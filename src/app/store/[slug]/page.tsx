import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNgn } from "@/lib/money";
import { brand } from "@/lib/brand";
import { StorefrontCart } from "./StorefrontCart";

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storefront = await prisma.storefront.findUnique({
    where: { slug },
    include: { business: { include: { products: { where: { deletedAt: null, isAvailable: true } } } } },
  });

  if (!storefront || !storefront.isPublished) {
    notFound();
  }

  const { business } = storefront;

  return (
    <main className="min-h-screen bg-surface-muted">
      <header
        className="px-4 py-10 text-white sm:py-16"
        style={{ backgroundColor: storefront.themeColor }}
      >
        <div className="mx-auto max-w-4xl">
          {storefront.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storefront.logoUrl} alt={business.name} className="mb-4 h-14 w-14 rounded-full object-cover" />
          )}
          <h1 className="text-3xl font-extrabold sm:text-4xl">{business.name}</h1>
          {storefront.headline && <p className="mt-2 text-lg text-white/90">{storefront.headline}</p>}
          <p className="mt-4 text-sm text-white/70">
            Powered by {brand.name} · {business.location}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-10">
        {business.products.length === 0 ? (
          <p className="text-text-secondary">This shop hasn&apos;t added any products yet.</p>
        ) : (
          <StorefrontCart
            slug={slug}
            products={business.products.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              priceMinor: p.priceMinor,
              priceFormatted: formatNgn(p.priceMinor),
              imageUrl: p.imageUrl,
              inventoryQty: p.inventoryQty,
            }))}
          />
        )}
      </section>
    </main>
  );
}
