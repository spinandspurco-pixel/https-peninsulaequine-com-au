import { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";

// PE HQ + completed project locations around the Mornington Peninsula
const locations = [
  {
    id: "hq",
    name: "Peninsula Equine HQ",
    address: "59 Tubbarubba Road, Merricks North",
    type: "hq" as const,
    lat: -38.3833,
    lng: 145.1167,
  },
  {
    id: "main-ridge",
    name: "Main Ridge Private Arena",
    address: "Main Ridge, VIC",
    type: "project" as const,
    lat: -38.4100,
    lng: 144.9900,
  },
  {
    id: "aberdeen",
    name: "Aberdeen Farm Barn & Stonework",
    address: "Red Hill, VIC",
    type: "project" as const,
    lat: -38.3700,
    lng: 145.0200,
  },
  {
    id: "balnarring",
    name: "Balnarring Equine Facility",
    address: "Balnarring, VIC",
    type: "project" as const,
    lat: -38.3650,
    lng: 145.1600,
  },
  {
    id: "flinders",
    name: "Flinders Arena & Fencing",
    address: "Flinders, VIC",
    type: "project" as const,
    lat: -38.4800,
    lng: 145.0200,
  },
  {
    id: "somerville",
    name: "Somerville Training Complex",
    address: "Somerville, VIC",
    type: "project" as const,
    lat: -38.2300,
    lng: 145.1800,
  },
];

export function InteractiveMap() {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const hq = locations.find((l) => l.id === "hq")!;
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent("59 Tubbarubba Road, Merricks North VIC 3926 Australia")}&zoom=11&maptype=roadmap`;

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-semibold text-foreground">
        Our Location &amp; Completed Sites
      </h3>

      {/* Embedded Google Map */}
      <div className="aspect-video rounded-lg overflow-hidden border border-border shadow-sm">
        <iframe
          src={mapSrc}
          className="w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Peninsula Equine location map"
        />
      </div>

      {/* Project Location Pins */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
          Completed Project Sites
        </p>
        <ul className="space-y-1.5">
          {locations.map((loc) => (
            <li key={loc.id}>
              <button
                onClick={() => setActiveLocation(activeLocation === loc.id ? null : loc.id)}
                className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  loc.type === "hq"
                    ? "bg-accent/10 text-accent font-semibold"
                    : activeLocation === loc.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <MapPin
                  className={`h-4 w-4 mt-0.5 shrink-0 ${
                    loc.type === "hq" ? "text-accent" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0">
                  <p className="leading-tight">{loc.name}</p>
                  {(activeLocation === loc.id || loc.type === "hq") && (
                    <p className="text-xs text-muted-foreground mt-0.5">{loc.address}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Directions link */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("59 Tubbarubba Road, Merricks North VIC 3926 Australia")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-medium"
      >
        <ExternalLink className="h-4 w-4" />
        Get Directions
      </a>
    </div>
  );
}
