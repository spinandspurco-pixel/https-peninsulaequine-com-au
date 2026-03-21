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

const NAVY = "#1a1d26";
const GOLD = "#E8C067";
const GOLD_DARK = "#C49A3C";
const SLATE = "#6B7280";
const LIGHT_BG = "#F8F6F0";
const WHITE = "#FFFFFF";
const DIVIDER = "#D4CFC4";
const CHARCOAL = "#2d2418";

const fmt = (v: number) =>
  `$${v.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function drawLine(doc: jsPDF, x1: number, y: number, x2: number, color = DIVIDER, width = 0.3) {
  doc.setDrawColor(color);
  doc.setLineWidth(width);
  doc.line(x1, y, x2, y);
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    earthworks: "Earthworks",
    groundlock: "GroundLock™",
    fencing: "Fencing",
    construction: "Construction",
    drainage: "Drainage",
    surface: "Surface",
    services: "Services",
    logistics: "Logistics",
    general: "General",
  };
  return labels[cat] || cat;
}

export function generateQuotePDF(quote: QuoteData, lineItems: QuoteLineItem[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = 210;
  const ph = 297;
  const ml = 22;
  const mr = 22;
  const cw = pw - ml - mr;

  // ═══════════════════════════════════════════════════════════
  // PAGE 1 — COVER PAGE
  // ═══════════════════════════════════════════════════════════
  
  // Full navy background
  doc.setFillColor(NAVY);
  doc.rect(0, 0, pw, ph, "F");

  // Gold accent line
  doc.setFillColor(GOLD);
  doc.rect(ml, 60, 40, 0.8, "F");

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(GOLD);
  doc.text("PENINSULA EQUINE", ml, 72);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor("#7a7f8c");
  doc.text("ENGINEERED INFRASTRUCTURE", ml, 77);

  // Project name — large
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(WHITE);
  const projectLines = doc.splitTextToSize(quote.project_type || "Project Brief", cw);
  doc.text(projectLines, ml, 110);

  // Location
  if (quote.location) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor("#9CA3AF");
    doc.text(quote.location, ml, 110 + projectLines.length * 12 + 6);
  }

  // Client name
  const clientY = 180;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(GOLD_DARK);
  doc.text("PREPARED FOR", ml, clientY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(WHITE);
  doc.text(quote.client_name || "—", ml, clientY + 8);

  if (quote.client_email) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#7a7f8c");
    doc.text(quote.client_email, ml, clientY + 14);
  }

  // Quote number + date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor("#7a7f8c");
  doc.text(quote.quote_number || "DRAFT", ml, clientY + 26);
  if (quote.expiry_date) {
    doc.text(`Valid until ${quote.expiry_date}`, ml, clientY + 31);
  }

  // Cover footer
  const coverFooterY = ph - 24;
  doc.setFillColor(GOLD);
  doc.rect(ml, coverFooterY, 40, 0.5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor("#7a7f8c");
  doc.text("peninsulaequine.org  ·  info@peninsulaequine.org", ml, coverFooterY + 6);
  doc.setFontSize(5.5);
  doc.setTextColor("#555b66");
  doc.text("Private projects · Discreet builds · Built for long-term ownership", ml, coverFooterY + 11);

  // ═══════════════════════════════════════════════════════════
  // PAGE 2 — CONCEPT SUMMARY
  // ═══════════════════════════════════════════════════════════
  doc.addPage();
  let y = 32;

  // Concept header
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(GOLD_DARK);
  doc.text("PROJECT OVERVIEW", ml, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(CHARCOAL);
  doc.text("Concept Summary", ml, y);
  y += 10;

  drawLine(doc, ml, y, pw - mr, GOLD, 0.5);
  y += 10;

  // Concept intro — priorities
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(CHARCOAL);
  const conceptIntro = "This project is structured around three priorities:";
  doc.text(conceptIntro, ml, y);
  y += 7;

  const priorities = [
    "Performance — ensuring consistent, safe riding conditions",
    "Access — clean movement for horses, vehicles, and daily use",
    "Longevity — materials and systems designed to last",
  ];
  priorities.forEach((p) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(CHARCOAL);
    doc.text(`•  ${p}`, ml + 4, y);
    y += 5;
  });
  y += 4;

  // Cohesion statement
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(SLATE);
  const cohesionLine = "The layout, materials, and systems have been considered together — not as separate elements — to create a cohesive and durable result.";
  const cohesionLines = doc.splitTextToSize(cohesionLine, cw);
  doc.text(cohesionLines, ml, y);
  y += cohesionLines.length * 3.8 + 8;

  // Scope of works
  if (quote.scope_summary) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(GOLD_DARK);
    doc.text("SCOPE OF WORKS", ml, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(CHARCOAL);
    const scopeLines = doc.splitTextToSize(quote.scope_summary, cw);
    doc.text(scopeLines, ml, y);
    y += scopeLines.length * 3.8 + 10;
  }

  // Exclusions on concept page
  if (quote.exclusions) {
    drawLine(doc, ml, y, pw - mr, DIVIDER, 0.3);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(GOLD_DARK);
    doc.text("EXCLUSIONS & ASSUMPTIONS", ml, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(SLATE);
    const exLines = doc.splitTextToSize(quote.exclusions, cw);
    doc.text(exLines, ml, y);
    y += exLines.length * 3.2 + 10;
  }

  // Page 2 footer
  drawPageFooter(doc, pw, ph, ml, mr);

  // ═══════════════════════════════════════════════════════════
  // PAGE 3 — ITEMISED SCOPE + INVESTMENT
  // ═══════════════════════════════════════════════════════════
  if (lineItems.length > 0) {
    doc.addPage();
    y = 32;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(GOLD_DARK);
    doc.text("SCOPE BREAKDOWN", ml, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(CHARCOAL);
    doc.text("Itemised Specification", ml, y);
    y += 10;

    drawLine(doc, ml, y, pw - mr, GOLD, 0.5);
    y += 8;

    // Table header
    doc.setFillColor(NAVY);
    doc.rect(ml, y - 1, cw, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(WHITE);
    doc.text("ITEM", ml + 2, y + 3.5);
    doc.text("QTY", ml + cw - 68, y + 3.5, { align: "right" });
    doc.text("UNIT", ml + cw - 50, y + 3.5, { align: "center" });
    doc.text("RATE", ml + cw - 28, y + 3.5, { align: "right" });
    doc.text("TOTAL", ml + cw - 2, y + 3.5, { align: "right" });

    y += 9;

    // Group by category
    const grouped: Record<string, QuoteLineItem[]> = {};
    lineItems.forEach((item) => {
      const cat = item.category || "general";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    let isAlt = false;
    Object.entries(grouped).forEach(([cat, items]) => {
      // Category subheader
      doc.setFillColor("#EDEBE5");
      doc.rect(ml, y - 1, cw, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(GOLD_DARK);
      doc.text(categoryLabel(cat).toUpperCase(), ml + 2, y + 3);
      y += 7;

      items.forEach((item) => {
        if (y > ph - 60) {
          drawPageFooter(doc, pw, ph, ml, mr);
          doc.addPage();
          y = 20;
        }

        if (isAlt) {
          doc.setFillColor(LIGHT_BG);
          doc.rect(ml, y - 2, cw, 7, "F");
        }
        isAlt = !isAlt;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(CHARCOAL);

        const titleLines = doc.splitTextToSize(item.title || "—", cw - 76);
        doc.text(titleLines, ml + 2, y + 2);

        doc.setFontSize(7);
        doc.setTextColor(SLATE);
        doc.text(String(item.quantity), ml + cw - 68, y + 2, { align: "right" });
        doc.text(item.unit, ml + cw - 50, y + 2, { align: "center" });
        doc.text(fmt(item.unit_price), ml + cw - 28, y + 2, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.setTextColor(CHARCOAL);
        doc.text(fmt(item.quantity * item.unit_price), ml + cw - 2, y + 2, { align: "right" });

        const rowH = Math.max(7, titleLines.length * 4 + 3);

        if (item.description) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(6.5);
          doc.setTextColor(SLATE);
          const descLines = doc.splitTextToSize(item.description, cw - 76);
          doc.text(descLines, ml + 2, y + rowH);
          y += rowH + descLines.length * 3;
        } else {
          y += rowH;
        }
      });

      y += 2;
    });

    y += 6;

    // ─── Investment Box ─────────────────────────────────────
    if (y > ph - 80) {
      drawPageFooter(doc, pw, ph, ml, mr);
      doc.addPage();
      y = 32;
    }

    drawLine(doc, ml, y, pw - mr, GOLD, 0.5);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(GOLD_DARK);
    doc.text("ESTIMATED INVESTMENT", ml, y);
    y += 8;

    const totalsX = ml + cw - 80;
    const totalsW = 80;

    // Subtle background
    doc.setFillColor(LIGHT_BG);
    doc.rect(totalsX, y - 2, totalsW, 30, "F");
    doc.setFillColor(GOLD);
    doc.rect(totalsX, y - 2, totalsW, 0.8, "F");

    y += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(SLATE);
    doc.text("Subtotal", totalsX + 4, y + 2);
    doc.setTextColor(CHARCOAL);
    doc.text(fmt(quote.subtotal), totalsX + totalsW - 4, y + 2, { align: "right" });

    y += 7;
    doc.setTextColor(SLATE);
    doc.text("GST (10%)", totalsX + 4, y + 2);
    doc.setTextColor(CHARCOAL);
    doc.text(fmt(quote.gst), totalsX + totalsW - 4, y + 2, { align: "right" });

    drawLine(doc, totalsX + 4, y + 6, totalsX + totalsW - 4, CHARCOAL, 0.3);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(CHARCOAL);
    doc.text("Total (inc. GST)", totalsX + 4, y + 2);
    doc.setTextColor(GOLD_DARK);
    doc.text(fmt(quote.total), totalsX + totalsW - 4, y + 2, { align: "right" });

    y += 20;

    // ─── Close line ──────────────────────────────────────────
    if (y > ph - 40) {
      drawPageFooter(doc, pw, ph, ml, mr);
      doc.addPage();
      y = 32;
    }

    drawLine(doc, ml, y, pw - mr, DIVIDER, 0.3);
    y += 8;

    // Investment disclaimer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(SLATE);
    const disclaimer = "Final cost will depend on site conditions, material selections, and confirmed scope.";
    doc.text(disclaimer, ml, y);
    y += 8;

    drawLine(doc, ml, y, pw - mr, DIVIDER, 0.3);
    y += 8;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(SLATE);
    const closeLine = "We take on a limited number of builds each year to maintain quality and delivery standards. If you'd like to move forward, we can lock this into schedule and move into planning.";
    const closeLines = doc.splitTextToSize(closeLine, cw);
    doc.text(closeLines, ml, y);

    drawPageFooter(doc, pw, ph, ml, mr);
  }

  // ─── Save ──────────────────────────────────────────────────
  const filename = `${quote.quote_number || "PE-Brief"}-${quote.client_name.replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}

function drawPageFooter(doc: jsPDF, pw: number, ph: number, ml: number, mr: number) {
  const fy = ph - 14;
  doc.setFillColor(NAVY);
  doc.rect(0, fy - 2, pw, 18, "F");
  doc.setFillColor(GOLD);
  doc.rect(0, fy - 2, pw, 0.5, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor("#7a7f8c");
  doc.text("Peninsula Equine  ·  Engineered Infrastructure  ·  peninsulaequine.org", ml, fy + 4);
  doc.setFontSize(5);
  doc.text("This document is confidential. Pricing valid for 30 days unless otherwise stated.", ml, fy + 8);
}
