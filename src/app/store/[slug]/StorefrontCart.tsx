"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { apiFetch } from "@/lib/api-client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceMinor: number;
  priceFormatted: string;
  imageUrl: string | null;
  inventoryQty: number | null;
}

export function StorefrontCart({ slug, products }: { slug: string; products: Product[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const items = Object.entries(cart).filter(([, qty]) => qty > 0);
  const total = items.reduce((sum, [id, qty]) => {
    const p = products.find((p) => p.id === id);
    return sum + (p ? p.priceMinor * qty : 0);
  }, 0);

  function setQty(id: string, qty: number) {
    setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));
  }

  async function onCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Add at least one product to your cart");
      return;
    }
    setLoading(true);
    const { ok, data } = await apiFetch<{ redirectUrl?: string }>(`/api/store/${slug}/checkout`, {
      method: "POST",
      body: {
        items: items.map(([productId, quantity]) => ({ productId, quantity })),
        customer,
      },
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Could not start checkout");
      return;
    }
    if (data.redirectUrl) router.push(data.redirectUrl);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {products.map((p) => (
          <Card key={p.id}>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{p.name}</p>
                {p.description && <p className="text-sm text-text-secondary">{p.description}</p>}
                <p className="mt-1 font-bold text-brand-primary">{p.priceFormatted}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setQty(p.id, (cart[p.id] ?? 0) - 1)}
                >
                  −
                </Button>
                <span className="w-6 text-center">{cart[p.id] ?? 0}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => setQty(p.id, (cart[p.id] ?? 0) + 1)}>
                  +
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="h-fit">
        <CardBody>
          <h2 className="font-semibold">Your order</h2>
          <p className="mt-2 text-2xl font-bold">
            ₦{(total / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}
          </p>

          <form onSubmit={onCheckout} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="cname">Your name</Label>
              <Input
                id="cname"
                required
                value={customer.name}
                onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cemail">Email address</Label>
              <Input
                id="cemail"
                type="email"
                required
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="cemail">Email address</Label>
              <Input
                id="cemail"
                type="email"
                required
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="cemail">Email address</Label>
              <Input
                id="cemail"
                type="email"
                required
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="cphone">Phone number</Label>
              <Input
                id="cphone"
                required
                value={customer.phone}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                placeholder="08012345678"
              />
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" className="w-full" isLoading={loading}>
              Pay now
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
