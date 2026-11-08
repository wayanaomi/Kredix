"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { formatNgn } from "@/lib/money";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceMinor: number;
  imageUrl: string | null;
  isAvailable: boolean;
  inventoryQty: number | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", priceNaira: "", imageUrl: "", inventoryQty: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await apiFetch<{ products: Product[] }>("/api/products");
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await apiFetch("/api/products", { method: "POST", body: { ...form, isAvailable: true } });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Could not add product");
      return;
    }
    setForm({ name: "", description: "", priceNaira: "", imageUrl: "", inventoryQty: "" });
    load();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await apiFetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleAvailability(p: Product) {
    await apiFetch(`/api/products/${p.id}`, { method: "PATCH", body: { isAvailable: !p.isAvailable } });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-text-secondary">Add what you sell so customers can browse and buy.</p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="priceNaira">Price (₦)</Label>
              <Input
                id="priceNaira"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.priceNaira}
                onChange={(e) => setForm((f) => ({ ...f, priceNaira: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="inventoryQty">Stock quantity (optional)</Label>
              <Input
                id="inventoryQty"
                type="number"
                min={0}
                value={form.inventoryQty}
                onChange={(e) => setForm((f) => ({ ...f, inventoryQty: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Product image (optional)"
                kind="product-image"
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldError message={error ?? undefined} />
              <Button type="submit" isLoading={loading}>
                Add product
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add products to start building your storefront."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardBody className="space-y-2">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-44 w-full rounded-xl object-cover"
                  />
                )}
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{p.name}</p>
                  <Badge tone={p.isAvailable ? "success" : "neutral"}>
                    {p.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-brand-primary">{formatNgn(p.priceMinor)}</p>
                {p.inventoryQty !== null && (
                  <p className="text-sm text-text-secondary">{p.inventoryQty} in stock</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleAvailability(p)}>
                    {p.isAvailable ? "Mark unavailable" : "Mark available"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(p.id)}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
