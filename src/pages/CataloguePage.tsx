import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package, Plus, Trash2, Edit, Send } from "lucide-react";

interface Product {
  id: string; name: string; description: string | null; price: number;
  currency: string; sku: string | null; imageUrl: string | null;
  category: string | null; inStock: boolean; createdAt: string;
}

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchProducts = async () => {
    try {
      const r = await fetch("/catalogue", { credentials: "include" });
      const d = await r.json();
      setProducts(d.data ?? []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async () => {
    if (!name.trim() || !price) { toast.error("Name and price required"); return; }
    try {
      const r = await fetch("/catalogue", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, price: parseFloat(price), sku: sku.trim() || undefined, category: category.trim() || undefined, imageUrl: imageUrl.trim() || undefined }),
      });
      if (!r.ok) throw new Error("Failed");
      toast.success("Product created");
      setShowForm(false); setName(""); setDescription(""); setPrice(""); setSku(""); setCategory(""); setImageUrl("");
      fetchProducts();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await fetch(`/catalogue/${p.id}`, { method: "DELETE", credentials: "include" });
      toast.success("Product deleted"); fetchProducts();
    } catch { toast.error("Failed"); }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Package className="h-4 w-4" /> Product Catalogue
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage your products</h1>
                <p className="mt-4 text-muted-foreground">Add products to send product cards via WhatsApp messages.</p>
              </div>
              <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Add Product</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">SKU</label>
                <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Image URL</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleCreate()}>Create Product</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5"><h2 className="font-display text-lg font-semibold text-foreground">Products ({products.length})</h2></div>
          {loading ? <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
          : products.length > 0 ? (
            <div className="divide-y divide-border">
              {products.map((p) => (
                <div key={p.id} className="px-6 py-4 hover:bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    : <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">₹{p.price} {p.sku ? `· SKU: ${p.sku}` : ""} {p.category ? `· ${p.category}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="px-6 py-12 text-center"><Package className="mx-auto h-10 w-10 text-muted-foreground/40" /><p className="mt-3 text-sm font-semibold">No products yet</p></div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
