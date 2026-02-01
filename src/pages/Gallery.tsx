import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

import heroSunset from "@/assets/hero-sunset.png";
import ciroWithHorse from "@/assets/ciro-with-horse.png";
import horseAction from "@/assets/horse-action.png";
import hatDetail from "@/assets/hat-detail.png";
import ciroWide from "@/assets/ciro-wide.png";
import spurDetail from "@/assets/spur-detail.png";

const galleryImages = [
  { id: 1, src: heroSunset, alt: "Horse silhouette at sunset", category: "Facility" },
  { id: 2, src: ciroWithHorse, alt: "Ciro working with a horse", category: "People" },
  { id: 3, src: horseAction, alt: "Horse in training", category: "Action" },
  { id: 4, src: hatDetail, alt: "Akubra hat with braided band", category: "Details" },
  { id: 5, src: ciroWide, alt: "Ciro with horse - wide shot", category: "People" },
  { id: 6, src: spurDetail, alt: "Boot and spur detail", category: "Details" },
];

const categories = ["All", "Facility", "People", "Action", "Details"];

function PageHeader() {
  return (
    <section className="pt-32 pb-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="max-w-3xl">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h1 className="heading-display mb-6">Gallery</h1>
          <p className="text-lg text-primary-foreground/80">
            A glimpse into our work, our craftsmanship, and the equestrian lifestyle 
            that drives everything we do.
          </p>
        </div>
      </div>
    </section>
  );
}

function Lightbox({
  image,
  onClose,
}: {
  image: typeof galleryImages[0] | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-8 w-8" />
      </button>
      <img
        src={image.src}
        alt={image.alt}
        className="max-w-full max-h-[85vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<typeof galleryImages[0] | null>(null);

  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <Layout>
      <PageHeader />

      <section className="section-padding">
        <div className="section-container">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
              <button
                key={image.id}
                onClick={() => setLightboxImage(image)}
                className="group aspect-[4/5] overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card">
        <div className="section-container text-center">
          <h2 className="heading-section text-foreground mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            These images represent just a fraction of what's possible. Let's discuss 
            how we can bring your vision to life.
          </p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/contact">
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Layout>
  );
}
