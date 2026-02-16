// Pricing tiers and FAQ per service

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export const servicePricingTiers: Record<string, PricingTier[]> = {
  "arena-construction": [
    { name: "Essential", price: "$25,000+", description: "Outdoor arena with quality footing", features: ["Up to 20×40m arena", "Base preparation & grading", "Standard sand footing", "Basic drainage"] },
    { name: "Professional", price: "$55,000+", description: "Full-spec training arena", features: ["Up to 40×60m arena", "Engineered drainage system", "Premium footing blend", "Dust control system", "Perimeter fencing"], popular: true },
    { name: "Competition", price: "$95,000+", description: "Competition-grade covered arena", features: ["60×80m+ covered arena", "All-weather footing", "Lighting & PA infrastructure", "Spectator areas", "Warm-up zone integration"] },
  ],
  "barn-construction": [
    { name: "Starter", price: "$40,000+", description: "Functional 4-stall barn", features: ["4 stalls (3.6×3.6m)", "Central aisle", "Basic tack room", "Natural ventilation"] },
    { name: "Standard", price: "$80,000+", description: "8-stall barn with amenities", features: ["8 stalls with rubber matting", "Wash rack", "Feed & hay storage", "Tack room with fit-out", "Electrical & lighting"], popular: true },
    { name: "Premium", price: "$150,000+", description: "12+ stall custom barn", features: ["12+ custom stalls", "Cross-ventilation design", "Owner's lounge", "Vet treatment bay", "Fireproof materials", "Hot & cold wash rack"] },
  ],
  "fencing": [
    { name: "Basic", price: "$5,000+", description: "Standard paddock fencing", features: ["Post & rail timber", "Up to 200m run", "Standard gate"] },
    { name: "Enhanced", price: "$12,000+", description: "Safe equine fencing system", features: ["Flex or no-climb mesh", "Up to 500m run", "Double-gate entry", "Corner reinforcement"], popular: true },
    { name: "Estate", price: "$25,000+", description: "Premium estate fencing", features: ["Custom timber or pipe rail", "Unlimited run length", "Automated gates", "Matching property aesthetic", "Electric tape top-line"] },
  ],
  "infrastructure": [
    { name: "Essentials", price: "$15,000+", description: "Basic site preparation", features: ["Land clearing", "Access road (up to 100m)", "Basic drainage"] },
    { name: "Full Site", price: "$40,000+", description: "Complete site infrastructure", features: ["Grading & contouring", "Drainage network", "Water supply & trough lines", "Electrical conduit", "Gravel access roads"], popular: true },
    { name: "Turnkey", price: "$80,000+", description: "End-to-end property setup", features: ["All Full Site features", "Bore/well installation", "Landscaping & revegetation", "Lighting throughout", "Waste management systems"] },
  ],
  "round-pens": [
    { name: "Portable", price: "$8,000+", description: "Portable panel round pen", features: ["15m diameter", "Steel panel construction", "Single gate", "Portable/relocatable"] },
    { name: "Permanent", price: "$18,000+", description: "Fixed round pen with footing", features: ["18m diameter", "Timber or pipe rail", "Prepared footing", "Double gate", "Shade sail option"], popular: true },
    { name: "Training Complex", price: "$35,000+", description: "Round pen + paddock system", features: ["20m+ round pen", "Adjacent holding paddocks", "Viewing area", "All-weather surface", "Integrated fencing"] },
  ],
  "renovations": [
    { name: "Refresh", price: "$3,000+", description: "Targeted repairs & upgrades", features: ["Arena resurfacing", "Fence repairs", "Minor structural fixes"] },
    { name: "Upgrade", price: "$15,000+", description: "Significant facility improvements", features: ["Stall refurbishment", "Drainage overhaul", "Ventilation improvements", "Safety compliance updates"], popular: true },
    { name: "Full Reno", price: "$40,000+", description: "Complete facility transformation", features: ["Full structural assessment", "Major rebuilds", "Code compliance", "New fixtures throughout", "Design consultation"] },
  ],
  "full-facility": [
    { name: "Boutique", price: "$150,000+", description: "Small private facility", features: ["Arena + 4-stall barn", "Paddock fencing", "Basic infrastructure", "Site planning"] },
    { name: "Professional", price: "$350,000+", description: "Full training facility", features: ["Arena + 8-stall barn", "Round pen & paddocks", "Complete infrastructure", "3D renders & permits", "Project management"], popular: true },
    { name: "Estate", price: "$600,000+", description: "Premium equestrian estate", features: ["Multiple arenas", "12+ stall barn complex", "Staff quarters", "Full landscaping", "Event-ready infrastructure", "Complete project management"] },
  ],
  "clinics-events": [
    { name: "Clinic Ready", price: "$50,000+", description: "Weekend clinic venue", features: ["Competition arena", "Temporary stabling", "Basic spectator area"] },
    { name: "Event Venue", price: "$120,000+", description: "Multi-day event facility", features: ["Main + warm-up arenas", "Permanent stabling", "Spectator seating", "PA & scoring setup", "Amenities block"], popular: true },
    { name: "Championship", price: "$250,000+", description: "Major competition venue", features: ["FEI-spec arenas", "100+ stable complex", "VIP & media facilities", "Full lighting", "Broadcast infrastructure", "Parking & logistics"] },
  ],
};

export const serviceFaqs: Record<string, ServiceFaq[]> = {
  "arena-construction": [
    { question: "How long does arena construction take?", answer: "A standard outdoor arena takes 2–4 weeks. Covered arenas typically 6–12 weeks depending on size and council approvals." },
    { question: "What footing do you recommend?", answer: "It depends on your discipline. We match footing blends to dressage, jumping, or general use—and Ciro personally tests every surface before sign-off." },
    { question: "Can you resurface my existing arena?", answer: "Absolutely. We assess the existing base, drainage, and footing, then recommend the most cost-effective upgrade path." },
  ],
  "barn-construction": [
    { question: "What stall sizes do you offer?", answer: "Standard stalls are 3.6×3.6m (12×12ft). We also build larger foaling stalls and can customise dimensions to suit your breed." },
    { question: "How do you handle ventilation?", answer: "Every barn is designed with cross-ventilation, ridge vents, and strategic openings to maintain airflow and reduce respiratory issues." },
    { question: "Are your barns bushfire rated?", answer: "We can build to BAL ratings as required by your council. Fireproof cladding and ember-guard mesh are available on all designs." },
  ],
  "fencing": [
    { question: "What fencing is safest for horses?", answer: "We recommend flex rail or no-climb mesh for horse safety. We never use barbed wire or materials with sharp edges." },
    { question: "How deep are your fence posts?", answer: "Minimum 600mm (2ft) for standard paddock fencing, deeper for corner and gate posts. We assess soil conditions on every project." },
    { question: "Do you install electric fencing?", answer: "Yes—both permanent and portable electric systems, including solar-powered energisers for remote paddocks." },
  ],
  "infrastructure": [
    { question: "Do you handle council permits?", answer: "Yes, we manage all permits, engineering drawings, and council liaison from start to finish." },
    { question: "Can you work on sloped land?", answer: "Absolutely. We specialise in cut-and-fill operations and retaining wall design to make challenging sites work." },
    { question: "What drainage solutions do you use?", answer: "Ag-pipe networks, swales, French drains, and retention systems—designed for your specific soil and rainfall profile." },
  ],
  "round-pens": [
    { question: "What diameter round pen do you recommend?", answer: "15m for groundwork and lunging, 18–20m for liberty work and young horse starting. We'll advise based on your goals." },
    { question: "Can I relocate a portable pen later?", answer: "Yes—our portable panel pens are designed to be disassembled and moved. Permanent pens use in-ground posts." },
    { question: "What footing goes in a round pen?", answer: "We typically use a compacted base with 75–100mm of sand or sand-rubber blend for cushioning and traction." },
  ],
  "renovations": [
    { question: "How do you assess what needs fixing?", answer: "We do a full structural and functional walkthrough, then provide a prioritised report with costed recommendations." },
    { question: "Can you match existing materials?", answer: "We source matching timbers, stonework, and finishes wherever possible to maintain the look of your facility." },
    { question: "Do I need to move my horses during renos?", answer: "Depends on scope. For most projects we stage the work so horses can stay on-site with minimal disruption." },
  ],
  "full-facility": [
    { question: "How long does a full facility build take?", answer: "Typically 6–18 months from design approval to handover, depending on scale, weather, and council timelines." },
    { question: "Do you provide 3D renders?", answer: "Yes—we produce concept renders and master site plans so you can visualise the finished property before we break ground." },
    { question: "Can I stage the build over time?", answer: "Absolutely. We design with future stages in mind so you can build the arena first and add the barn later without rework." },
  ],
  "clinics-events": [
    { question: "Can you build to FEI specifications?", answer: "Yes. We build competition arenas to FEI, EA, and other governing body specifications as required." },
    { question: "Do you install lighting for night events?", answer: "Yes—LED floodlighting designed for equestrian use with minimal shadow and glare, on timer or manual control." },
    { question: "What about spectator facilities?", answer: "We design covered seating, amenities blocks, food service areas, and accessible viewing—scaled to your event needs." },
  ],
};
