import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Flame, Search, X, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { BlueprintScene } from "@/components/BlueprintScene";
import { PEFencePost, PESaddle, PEStonework, PEBarn } from "@/components/icons/PEIcons";
import blueprintDrawingLoop from "@/assets/videos/blueprint-drawing-loop.mp4";
import blueprintConstructionLoop from "@/assets/videos/blueprint-construction-loop.mp4";
import ropeRing from "@/assets/pe-rope-ring.png";

const categories = [
  { id: "all", label: "All Products" },
  { id: "Custom Gates & Panels", label: "Gates & Panels" },
  { id: "Steel Fixtures", label: "Steel Fixtures" },
  { id: "Decorative Metalwork", label: "Decorative Metalwork" },
  { id: "Structural Steel", label: "Structural Steel" },
];

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroVisual, setHeroVisual] = useState<"drawing" | "construction">("drawing");
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
    let items = products;
    if (activeCategory !== "all") {
      items = items.filter((p) => {
        const title = p.node.title.toLowerCase();
        const desc = p.node.description.toLowerCase();
        const cat = activeCategory.toLowerCase();
        if (cat.includes("gate") || cat.includes("panel")) {
          return title.includes("gate") || title.includes("panel") || desc.includes("gate") || desc.includes("panel");
        }
        if (cat.includes("fixture")) {
          return title.includes("tie-up") || title.includes("saddle") || title.includes("rack") || title.includes("fixture") || desc.includes("fixture");
        }
        if (cat.includes("decorative")) {
          return title.includes("sign") || title.includes("ornamental") || title.includes("bracket") || desc.includes("decorative") || desc.includes("ornamental");
        }
        if (cat.includes("structural")) {
          return title.includes("structural") || title.includes("beam") || title.includes("fencing") || title.includes("arena perimeter") || desc.includes("structural");
        }
        return true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((p) => p.node.title.toLowerCase().includes(q) || p.node.description.toLowerCase().includes(q));
    }
    return items;
  }, [products, activeCategory, searchQuery]);

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
      <section className="relative pt-32 pb-24 text-primary-foreground overflow-hidden bg-primary">
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${heroVisual === "drawing" ? "opacity-45" : "opacity-0"}`}
          autoPlay loop muted playsInline preload="metadata"
        >
          <source src={blueprintDrawingLoop} type="video/mp4" />
        </video>
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${heroVisual === "construction" ? "opacity-45" : "opacity-0"}`}
          autoPlay loop muted playsInline preload="metadata"
        >
          <source src={blueprintConstructionLoop} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-primary/68" />
        <BlueprintScene preset="elevation" className="absolute inset-0" />

        <div className="section-container relative z-10 text-center stack-md">
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => setHeroVisual("drawing")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.14em] border transition-colors ${heroVisual === "drawing" ? "bg-accent text-accent-foreground border-accent" : "bg-primary/40 text-primary-foreground border-primary-foreground/25"}`}
            >
              Drawing Motion
            </button>
            <button
              onClick={() => setHeroVisual("construction")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.14em] border transition-colors ${heroVisual === "construction" ? "bg-accent text-accent-foreground border-accent" : "bg-primary/40 text-primary-foreground border-primary-foreground/25"}`}
            >
              Build Motion
            </button>
          </div>

          <div>
            <p className="text-overline text-accent mb-4">From Dirt to Dynasty</p>
            <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              The Forge <span className="text-accent">at P.E.</span>
            </h1>
            <p className="text-body-lg max-w-3xl mx-auto text-primary-foreground/80 mt-5">
              Interactive, blueprint-led commerce for custom steel fabrications, gates, fixtures, and decorative metalwork.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-primary-foreground/80">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.18em]">Tap between animation layers</p>
          </div>

          <img src={ropeRing} alt="Decorative rope emblem" className="h-24 w-24 object-contain mx-auto animate-rope-drift" loading="lazy" />
        </div>
      </section>

      <section className="py-8 bg-card border-b border-border">
        <div className="section-container space-y-5">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-11 pr-10 py-3 rounded-full border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
              aria-label="Search products"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center" role="radiogroup" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="radio"
                aria-checked={activeCategory === cat.id}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeCategory === cat.id
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {!loading && (
            <p className="text-center text-xs text-muted-foreground" aria-live="polite">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              {activeCategory !== "all" && ` in ${categories.find((c) => c.id === activeCategory)?.label}`}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-border">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl mb-3">Shop by <span className="text-accent">Category</span></h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Every piece is built to order — heavy-gauge steel, hot-dip galvanised, with horsemen's tolerances.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: PEFencePost, title: "Custom Gates & Panels", desc: "Swing gates, sliding gates & modular stable panels built to your dimensions.", from: "$1,450", filter: "Custom Gates & Panels" },
              { Icon: PESaddle, title: "Steel Fixtures", desc: "Tie-up rails, saddle racks & wash-bay fittings — crafted for professional-grade durability.", from: "$380", filter: "Steel Fixtures" },
              { Icon: PEStonework, title: "Decorative Metalwork", desc: "Laser-cut property signs, ornamental brackets & bespoke embellishments.", from: "$580", filter: "Decorative Metalwork" },
              { Icon: PEBarn, title: "Structural Steel", desc: "I-beam brackets, arena perimeter fencing & load-bearing fabrications.", from: "$4,200", filter: "Structural Steel" },
            ].map((cat) => (
              <div key={cat.title} className="group border border-border rounded-lg p-6 bg-card card-hover-glow transition-all duration-300 flex flex-col">
                <cat.Icon size={32} className="text-accent mb-4 transition-transform duration-300 group-hover:scale-110" />
                <h3 className="font-serif text-lg font-semibold mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{cat.desc}</p>
                <p className="text-accent font-semibold mb-4">From {cat.from}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setActiveCategory(cat.filter)}>
                    View Products
                  </Button>
                  <Button asChild size="sm" className="flex-1 text-xs bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link to="/contact">Get Quote</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <Flame className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="font-serif text-2xl mb-3">
                {products.length === 0 ? "The forge is firing up" : "No matches"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {products.length === 0
                  ? "No products yet — tell us in the chat what you'd like to sell and we'll get them listed."
                  : "Try a different category or search term."}
              </p>
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-accent text-sm underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const image = product.node.images.edges[0]?.node;
                const price = product.node.priceRange.minVariantPrice;
                return (
                  <div key={product.node.id} className="group border border-border rounded-lg overflow-hidden bg-card card-hover-glow transition-all duration-300 flex flex-col">
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
                            <Flame className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                          {product.node.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.node.description}</p>
                        <p className="font-semibold text-accent text-lg">
                          From ${parseFloat(price.amount).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {price.currencyCode}
                        </p>
                      </div>
                    </Link>
                    <div className="px-5 pb-5">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
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

      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" />
        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <Flame className="h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Need Something <span className="text-accent">Custom?</span>
          </h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            Don't see exactly what you need? Every property is different. Send us your specs and we'll quote a bespoke fabrication — no job too big, no detail too small.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider">
            <Link to="/contact">
              Request Custom Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
