import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Flame, Search, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { BlueprintScene } from "@/components/BlueprintScene";

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50 });
        setProducts(data?.data?.products?.edges || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) => p.node.title.toLowerCase().includes(q) || p.node.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.node.title });
  };

  return (
    <Layout>
      {/* Hero — clean, legible */}
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-primary/75" />
        <BlueprintScene preset="elevation" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <p className="text-overline text-accent tracking-[0.25em]">From Dirt to Dynasty</p>
          <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            The Forge
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Custom steel fabrications, built to order.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-6 bg-card border-b border-border">
        <div className="section-container">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-11 pr-10 py-3 rounded-full border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              aria-label="Search products"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!loading && (
            <p className="text-center text-xs text-muted-foreground mt-3" aria-live="polite">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <Flame className="h-14 w-14 text-muted-foreground mx-auto" />
              <h2 className="font-serif text-2xl">
                {products.length === 0 ? "The forge is firing up" : "No matches"}
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                {products.length === 0
                  ? "Products coming soon."
                  : "Try a different search term."}
              </p>
              {products.length > 0 && (
                <button onClick={() => setSearchQuery("")} className="text-accent text-sm underline underline-offset-2">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const image = product.node.images.edges[0]?.node;
                const price = product.node.priceRange.minVariantPrice;
                return (
                  <div key={product.node.id} className="group border border-border rounded-lg overflow-hidden bg-card transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 flex flex-col">
                    <Link to={`/shop/${product.node.handle}`} className="block flex-1">
                      <div className="aspect-square bg-muted overflow-hidden">
                        {image ? (
                          <img
                            src={image.url}
                            alt={image.altText || product.node.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <Flame className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                          {product.node.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.node.description}</p>
                        <p className="font-semibold text-accent">
                          From ${parseFloat(price.amount).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {price.currencyCode}
                        </p>
                      </div>
                    </Link>
                    <div className="px-5 pb-5">
                      <Button
                        onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        disabled={isCartLoading}
                      >
                        {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4 mr-2" />Add to Cart</>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-5">
          <h2 className="font-serif text-2xl md:text-3xl">
            Need something <span className="text-accent">custom?</span>
          </h2>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs">
            <Link to="/contact">
              Request Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
