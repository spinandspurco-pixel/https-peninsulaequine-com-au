import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Flame } from "lucide-react";
import { toast } from "sonner";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

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
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, currentColor 40px, currentColor 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)",
          }} />
        </div>
        <div className="section-container relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Flame className="h-8 w-8 text-accent" />
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-tight">
              The Forge <span className="text-accent">at P.E.</span>
            </h1>
            <Flame className="h-8 w-8 text-accent" />
          </div>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-80 font-light">
            Custom steel fabrications, gates, fixtures & decorative metalwork — forged by horsemen, for horsemen.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <Flame className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="font-serif text-2xl mb-3">The forge is firing up</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                No products yet — tell us in the chat what you'd like to sell and we'll get them listed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const image = product.node.images.edges[0]?.node;
                const price = product.node.priceRange.minVariantPrice;
                return (
                  <div key={product.node.id} className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow duration-300">
                    <Link to={`/shop/${product.node.handle}`} className="block">
                      <div className="aspect-square bg-muted overflow-hidden">
                        {image ? (
                          <img
                            src={image.url}
                            alt={image.altText || product.node.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Flame className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                          {product.node.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {product.node.description}
                        </p>
                        <p className="font-semibold text-accent">
                          {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                    <div className="px-5 pb-5">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className="w-full"
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
    </Layout>
  );
}
