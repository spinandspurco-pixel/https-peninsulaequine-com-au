import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, ArrowLeft, Flame } from "lucide-react";
import { toast } from "sonner";
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
        setProduct(data?.data?.product || null);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }
    if (handle) fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center min-h-[60vh] pt-32">
          <h2 className="font-serif text-2xl mb-4">Product not found</h2>
          <Button asChild variant="outline">
            <Link to="/shop"><ArrowLeft className="w-4 h-4 mr-2" />Back to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const variant = product.variants.edges[selectedVariantIdx]?.node;
  const images = product.images.edges;

  const handleAddToCart = async () => {
    if (!variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.title });
  };

  return (
    <Layout>
      <section className="pt-28 pb-16 md:py-32">
        <div className="section-container">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to The Forge
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                {images[selectedImage]?.node ? (
                  <img
                    src={images[selectedImage].node.url}
                    alt={images[selectedImage].node.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Flame className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        selectedImage === i ? "border-accent" : "border-transparent"
                      }`}
                    >
                      <img src={img.node.url} alt={img.node.altText || ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <h1 className="font-serif text-3xl md:text-4xl">{product.title}</h1>
              <p className="text-2xl font-semibold text-accent">
                {variant?.price.currencyCode} {parseFloat(variant?.price.amount || "0").toFixed(2)}
              </p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Options */}
              {product.options.filter(o => o.name !== "Title" || o.values.length > 1).map((option) => (
                <div key={option.name} className="space-y-2">
                  <label className="text-sm font-medium uppercase tracking-wider">{option.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const variantIdx = product.variants.edges.findIndex(
                        v => v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                      );
                      return (
                        <button
                          key={value}
                          onClick={() => variantIdx >= 0 && setSelectedVariantIdx(variantIdx)}
                          className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                            selectedVariantIdx === variantIdx
                              ? "border-accent bg-accent/10 text-accent-foreground"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full mt-4"
                disabled={isCartLoading || !variant?.availableForSale}
              >
                {isCartLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !variant?.availableForSale ? (
                  "Sold Out"
                ) : (
                  <><ShoppingCart className="w-4 h-4 mr-2" />Add to Cart</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
