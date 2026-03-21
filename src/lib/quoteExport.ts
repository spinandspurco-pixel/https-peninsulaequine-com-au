import jsPDF from "jspdf";

interface QuoteLineItem {
  title: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  category: string;
}

interface QuoteData {
  quote_number: string;
  client_name: string;
  client_email: string;
  project_type: string;
  location: string;
  scope_summary: string;
  exclusions: string;
  subtotal: number;
  gst: number;
  total: number;
  expiry_date: string;
}

// ─── Brand Palette ───────────────────────────────────────
const NAVY = "#1a1d26";
const NAVY_DEEP = "#12141b";
const GOLD = "#E8C067";
const GOLD_DARK = "#C49A3C";
const GOLD_MUTED = "#B8995A";
const SLATE = "#6B7280";
const LIGHT_BG = "#F8F6F0";
const WHITE = "#FFFFFF";
const WARM_WHITE = "#FAF9F6";
const CHARCOAL = "#2d2418";
const DIVIDER = "#E0DCD2";
const FAINT = "#F2F0EA";

const fmt = (v: number) =>
  `$${v.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    earthworks: "Earthworks",
    groundlock: "GroundLock™ Systems",
    fencing: "Fencing & Boundaries",
    construction: "Construction",
    drainage: "Drainage & Water Management",
    surface: "Surface & Arena",
    services: "Services",
    logistics: "Logistics & Access",
    general: "General",
  };
  return labels[cat] || cat;
}

// ─── Helpers ─────────────────────────────────────────────

function drawPageNumber(doc: jsPDF, pw: number, ph: number, page: number, total: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor("#9CA3AF");
  doc.text(`${page} / ${total}`, pw / 2, ph - 10, { align: "center" });
}

function drawFooterBar(doc: jsPDF, pw: number, ph: number, ml: number) {
  doc.setFillColor(NAVY_DEEP);
  doc.rect(0, ph - 18, pw, 18, "F");
  doc.setFillColor(GOLD);
  doc.rect(0, ph - 18, pw, 0.4, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor("#5a5f6b");
  doc.text("Peninsula Equine  ·  Engineered Infrastructure  ·  peninsulaequine.org", ml, ph - 8);
  doc.setFontSize(4.5);
  doc.setTextColor("#484d57");
  doc.text("This document is confidential. Investment figures are indicative and subject to confirmed scope.", ml, ph - 4.5);
}

function drawSectionLabel(doc: jsPDF, label: string, x: number, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(GOLD_MUTED);
  doc.text(label.toUpperCase(), x, y);
}

function drawGoldRule(doc: jsPDF, x: number, y: number, w: number) {
  doc.setFillColor(GOLD);
  doc.rect(x, y, w, 0.4, "F");
}

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════

export function generateQuotePDF(quote: QuoteData, lineItems: QuoteLineItem[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = 210;
  const ph = 297;
  const ml = 24;
  const mr = 24;
  const cw = pw - ml - mr;
  const totalPages = 7;

  // ═══════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════════════════

  // Full dark background
  doc.setFillColor(NAVY_DEEP);
  doc.rect(0, 0, pw, ph, "F");

  // Subtle vertical accent line
  doc.setFillColor(GOLD);
  doc.rect(ml, 48, 0.6, 80, "F");

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(GOLD);
  doc.text("PENINSULA EQUINE", ml + 6, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor("#5a5f6b");
  doc.text("ENGINEERED EQUESTRIAN INFRASTRUCTURE", ml + 6, 61);

  // Project name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(WHITE);
  const projectTitle = quote.project_type || "Project Pack";
  const titleLines = doc.splitTextToSize(projectTitle, cw - 10);
  doc.text(titleLines, ml + 6, 88);

  // Location beneath title
  if (quote.location) {
    const titleBottom = 88 + titleLines.length * 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#7a7f8c");
    doc.text(quote.location, ml + 6, titleBottom + 4);
  }

  // Client block — lower third
  const clientBlockY = 180;
  drawGoldRule(doc, ml, clientBlockY, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(GOLD_MUTED);
  doc.text("PREPARED FOR", ml, clientBlockY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(WHITE);
  doc.text(quote.client_name || "—", ml, clientBlockY + 17);

  if (quote.client_email) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor("#7a7f8c");
    doc.text(quote.client_email, ml, clientBlockY + 24);
  }

  // Meta
  const metaY = clientBlockY + 38;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor("#5a5f6b");
  doc.text(quote.quote_number || "DRAFT", ml, metaY);
  const dateStr = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(dateStr, ml, metaY + 5);

  // Cover footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor("#3e424d");
  doc.text("Private projects  ·  Discreet builds  ·  Designed for long-term ownership", ml, ph - 20);

  drawPageNumber(doc, pw, ph, 1, totalPages);

  // ═══════════════════════════════════════════════════════════
  // PAGE 2 — PROJECT OVERVIEW
  // ═══════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(WARM_WHITE);
  doc.rect(0, 0, pw, ph, "F");

  let y = 38;

  drawSectionLabel(doc, "01 — Project Overview", ml, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(CHARCOAL);
  doc.text("Project Overview", ml, y);
  y += 6;

  drawGoldRule(doc, ml, y, 36);
  y += 14;

  // Intro
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(CHARCOAL);
  doc.text("This project is structured around three priorities:", ml, y);
  y += 12;

  // Priorities as clean blocks
  const priorities = [
    { label: "Performance", desc: "Ensuring consistent, safe riding conditions year-round." },
    { label: "Access", desc: "Clean movement for horses, vehicles, and daily operations." },
    { label: "Longevity", desc: "Materials and systems designed to last, not just to install." },
  ];

  priorities.forEach((p, i) => {
    // Faint background block
    doc.setFillColor(FAINT);
    doc.roundedRect(ml, y - 2, cw, 16, 1, 1, "F");

    // Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(GOLD_DARK);
    doc.text(`0${i + 1}`, ml + 5, y + 5);

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(CHARCOAL);
    doc.text(p.label, ml + 16, y + 5);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(SLATE);
    doc.text(p.desc, ml + 16, y + 11);

    y += 20;
  });

  y += 6;

  // Supporting paragraph
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(SLATE);
  const cohesion = "The layout, materials, and systems have been considered together — not as separate elements — to create a cohesive and durable result.";
  const cohesionLines = doc.splitTextToSize(cohesion, cw);
  doc.text(cohesionLines, ml, y);
  y += cohesionLines.length * 4 + 10;

  // Scope summary if exists
  if (quote.scope_summary) {
    drawGoldRule(doc, ml, y, 20);
    y += 8;

    drawSectionLabel(doc, "Scope Summary", ml, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(CHARCOAL);
    const scopeLines = doc.splitTextToSize(quote.scope_summary, cw);
    doc.text(scopeLines, ml, y);
    y += scopeLines.length * 4 + 6;
  }

  // Exclusions
  if (quote.exclusions) {
    y += 4;
    drawSectionLabel(doc, "Exclusions & Assumptions", ml, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(SLATE);
    const exLines = doc.splitTextToSize(quote.exclusions, cw);
    doc.text(exLines, ml, y);
  }

  drawFooterBar(doc, pw, ph, ml);
  drawPageNumber(doc, pw, ph, 2, totalPages);

  // ═══════════════════════════════════════════════════════════
  // PAGE 3 — SCOPE BREAKDOWN
  // ═══════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(WHITE);
  doc.rect(0, 0, pw, ph, "F");

  y = 38;

  drawSectionLabel(doc, "02 — Scope Breakdown", ml, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(CHARCOAL);
  doc.text("Scope Breakdown", ml, y);
  y += 6;

  drawGoldRule(doc, ml, y, 36);
  y += 12;

  if (lineItems.length > 0) {
    // Group by category
    const grouped: Record<string, QuoteLineItem[]> = {};
    lineItems.forEach((item) => {
      const cat = item.category || "general";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    Object.entries(grouped).forEach(([cat, items]) => {
      if (y > ph - 50) {
        drawFooterBar(doc, pw, ph, ml);
        doc.addPage();
        doc.setFillColor(WHITE);
        doc.rect(0, 0, pw, ph, "F");
        y = 30;
      }

      // Category header
      doc.setFillColor(NAVY);
      doc.roundedRect(ml, y - 1, cw, 8, 0.5, 0.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(GOLD);
      doc.text(categoryLabel(cat).toUpperCase(), ml + 4, y + 4);
      y += 11;

      items.forEach((item) => {
        if (y > ph - 40) {
          drawFooterBar(doc, pw, ph, ml);
          doc.addPage();
          doc.setFillColor(WHITE);
          doc.rect(0, 0, pw, ph, "F");
          y = 30;
        }

        // Item row — clean, no table borders
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(CHARCOAL);
        const titleLines = doc.splitTextToSize(item.title || "—", cw * 0.6);
        doc.text(titleLines, ml + 4, y);

        // Amount right-aligned
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(CHARCOAL);
        doc.text(fmt(item.quantity * item.unit_price), ml + cw - 4, y, { align: "right" });

        // Quantity + unit inline
        doc.setFontSize(6.5);
        doc.setTextColor(SLATE);
        const qtyText = `${item.quantity} ${item.unit} @ ${fmt(item.unit_price)}`;
        doc.text(qtyText, ml + cw - 4, y + 4, { align: "right" });

        const rowH = Math.max(6, titleLines.length * 3.5 + 2);

        if (item.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(SLATE);
          const descLines = doc.splitTextToSize(item.description, cw * 0.6);
          doc.text(descLines, ml + 4, y + rowH);
          y += rowH + descLines.length * 3 + 3;
        } else {
          y += rowH + 3;
        }

        // Faint separator
        doc.setDrawColor(DIVIDER);
        doc.setLineWidth(0.15);
        doc.line(ml + 4, y, ml + cw - 4, y);
        y += 4;
      });

      y += 4;
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(SLATE);
    doc.text("Detailed scope to be confirmed following site assessment.", ml, y);
  }

  drawFooterBar(doc, pw, ph, ml);
  drawPageNumber(doc, pw, ph, 3, totalPages);

  // ═══════════════════════════════════════════════════════════
  // PAGE 4 — VISUAL REFERENCE
  // ═══════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(WARM_WHITE);
  doc.rect(0, 0, pw, ph, "F");

  y = 38;

  drawSectionLabel(doc, "03 — Visual Reference", ml, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(CHARCOAL);
  doc.text("Project Direction", ml, y);
  y += 6;

  drawGoldRule(doc, ml, y, 36);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(SLATE);
  doc.text("These references represent the intended outcome, materials, and overall build direction.", ml, y);
  y += 14;

  // 4 image placeholders in a 2×2 grid
  const imgW = (cw - 8) / 2;
  const imgH = 70;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const ix = ml + col * (imgW + 8);
      const iy = y + row * (imgH + 8);

      doc.setFillColor(FAINT);
      doc.setDrawColor(DIVIDER);
      doc.setLineWidth(0.3);
      doc.roundedRect(ix, iy, imgW, imgH, 1.5, 1.5, "FD");

      // Placeholder text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor("#B8B4A8");
      doc.text("Visual Reference", ix + imgW / 2, iy + imgH / 2, { align: "center" });
    }
  }

  y += 2 * (imgH + 8) + 8;

  // Caption
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(SLATE);
  doc.text("Images are indicative of style and intent. Final specification may vary.", ml, y);

  drawFooterBar(doc, pw, ph, ml);
  drawPageNumber(doc, pw, ph, 4, totalPages);

  // ═══════════════════════════════════════════════════════════
  // PAGE 5 — INVESTMENT
  // ═══════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(WHITE);
  doc.rect(0, 0, pw, ph, "F");

  y = 38;

  drawSectionLabel(doc, "04 — Investment", ml, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(CHARCOAL);
  doc.text("Estimated Investment", ml, y);
  y += 6;

  drawGoldRule(doc, ml, y, 36);
  y += 18;

  // Investment range display
  const rangeMin = Math.round(quote.total * 0.9);
  const rangeMax = Math.round(quote.total * 1.1);

  // Large range
  doc.setFillColor(FAINT);
  doc.roundedRect(ml, y - 4, cw, 36, 2, 2, "F");
  drawGoldRule(doc, ml, y - 4, cw);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(GOLD_MUTED);
  doc.text("ESTIMATED RANGE (INC. GST)", ml + 8, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(CHARCOAL);
  doc.text(`${fmt(rangeMin)}  —  ${fmt(rangeMax)}`, ml + 8, y + 20);

  y += 44;

  // Breakdown
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(SLATE);

  const breakdownItems = [
    ["Subtotal", fmt(quote.subtotal)],
    ["GST (10%)", fmt(quote.gst)],
    ["Total (inc. GST)", fmt(quote.total)],
  ];

  breakdownItems.forEach(([label, value], i) => {
    const isTotal = i === breakdownItems.length - 1;

    if (isTotal) {
      doc.setDrawColor(CHARCOAL);
      doc.setLineWidth(0.3);
      doc.line(ml, y - 2, ml + cw, y - 2);
      y += 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(CHARCOAL);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(SLATE);
    }

    doc.text(label, ml, y + 2);
    doc.text(value, ml + cw, y + 2, { align: "right" });
    y += 8;
  });

  y += 12;

  // Disclaimer
  doc.setDrawColor(DIVIDER);
  doc.setLineWidth(0.15);
  doc.line(ml, y, ml + cw, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(SLATE);
  doc.text("Final cost will depend on site conditions, material selections, and confirmed scope.", ml, y);
  y += 6;

  if (quote.expiry_date) {
    doc.text(`This estimate is valid until ${quote.expiry_date}.`, ml, y);
  }

  drawFooterBar(doc, pw, ph, ml);
  drawPageNumber(doc, pw, ph, 5, totalPages);

  // ═══════════════════════════════════════════════════════════
  // PAGE 6 — CLOSING
  // ═══════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(NAVY_DEEP);
  doc.rect(0, 0, pw, ph, "F");

  // Vertical gold accent
  doc.setFillColor(GOLD);
  doc.rect(ml, 70, 0.6, 60, "F");

  // Closing statement
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(WHITE);
  const closeLine1 = "We take on a limited number of builds each year";
  const closeLine2 = "to maintain quality and delivery standards.";
  doc.text(closeLine1, ml + 6, 82);
  doc.text(closeLine2, ml + 6, 90);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor("#9CA3AF");
  const nextStep = "If this aligns with what you're looking to build,\nthe next step is to move into planning\nand secure a position in schedule.";
  doc.text(nextStep, ml + 6, 106);

  // Contact block
  const contactY = 170;
  drawGoldRule(doc, ml, contactY, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(GOLD_MUTED);
  doc.text("GET IN TOUCH", ml, contactY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#9CA3AF");
  doc.text("peninsulaequine.org", ml, contactY + 16);
  doc.text("info@peninsulaequine.org", ml, contactY + 22);

  // Brand mark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(GOLD);
  doc.text("PENINSULA EQUINE", ml, ph - 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor("#3e424d");
  doc.text("Private projects  ·  Discreet builds  ·  Designed for long-term ownership", ml, ph - 30);

  drawPageNumber(doc, pw, ph, 6, totalPages);

  // ─── Save ──────────────────────────────────────────────────
  const filename = `${quote.quote_number || "PE-ProjectPack"}-${quote.client_name.replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}
