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

const NAVY = "#171A23";
const GOLD = "#E8C067";
const GOLD_DARK = "#C49A3C";
const SLATE = "#6B7280";
const LIGHT_BG = "#F8F6F0";
const WHITE = "#FFFFFF";
const DIVIDER = "#D4CFC4";

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
  let y = 0;

  // ─── Navy header band ─────────────────────────────────────
  doc.setFillColor(NAVY);
  doc.rect(0, 0, pw, 52, "F");

  // Gold accent line under header
  doc.setFillColor(GOLD);
  doc.rect(0, 52, pw, 1.2, "F");

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(GOLD);
  doc.text("PENINSULA EQUINE", ml, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor("#9CA3AF");
  doc.text("ENGINEERED INFRASTRUCTURE", ml, 23.5);

  // Quote number + date right side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(WHITE);
  doc.text("INVESTMENT OVERVIEW", pw - mr, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GOLD);
  doc.text(quote.quote_number || "DRAFT", pw - mr, 26, { align: "right" });

  // Expiry
  if (quote.expiry_date) {
    doc.setFontSize(7);
    doc.setTextColor("#9CA3AF");
    doc.text(`Valid until ${quote.expiry_date}`, pw - mr, 31, { align: "right" });
  }

  // Contact details in header
  doc.setFontSize(6.5);
  doc.setTextColor("#9CA3AF");
  doc.text("peninsulaequine.com.au  ·  info@peninsulaequine.com.au", ml, 44);

  y = 62;

  // ─── Client + Project info ─────────────────────────────────
  const colW = cw / 2 - 4;

  // Left column - Client
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(GOLD_DARK);
  doc.text("PREPARED FOR", ml, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.text(quote.client_name || "—", ml, y + 6);

  if (quote.client_email) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(SLATE);
    doc.text(quote.client_email, ml, y + 11);
  }

  // Right column - Project
  const rx = ml + colW + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(GOLD_DARK);
  doc.text("PROJECT", rx, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(NAVY);
  const projLines = doc.splitTextToSize(quote.project_type || "—", colW);
  doc.text(projLines, rx, y + 6);

  if (quote.location) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(SLATE);
    doc.text(quote.location, rx, y + 6 + projLines.length * 4);
  }

  y += 22;
  drawLine(doc, ml, y, pw - mr, DIVIDER, 0.3);
  y += 6;

  // ─── Scope Summary ────────────────────────────────────────
  if (quote.scope_summary) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(GOLD_DARK);
    doc.text("SCOPE OF WORKS", ml, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(NAVY);
    const scopeLines = doc.splitTextToSize(quote.scope_summary, cw);
    doc.text(scopeLines, ml, y);
    y += scopeLines.length * 3.8 + 4;
    drawLine(doc, ml, y, pw - mr, DIVIDER, 0.3);
    y += 6;
  }

  // ─── Line Items Table ──────────────────────────────────────
  if (lineItems.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(GOLD_DARK);
    doc.text("ITEMISED BREAKDOWN", ml, y);
    y += 6;

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
        // Check page break
        if (y > ph - 60) {
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
        doc.setTextColor(NAVY);

        const titleLines = doc.splitTextToSize(item.title || "—", cw - 76);
        doc.text(titleLines, ml + 2, y + 2);

        doc.setFontSize(7);
        doc.setTextColor(SLATE);
        doc.text(String(item.quantity), ml + cw - 68, y + 2, { align: "right" });
        doc.text(item.unit, ml + cw - 50, y + 2, { align: "center" });
        doc.text(fmt(item.unit_price), ml + cw - 28, y + 2, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.setTextColor(NAVY);
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

    y += 2;
  }

  // ─── Totals Box ────────────────────────────────────────────
  if (y > ph - 70) {
    doc.addPage();
    y = 20;
  }

  const totalsX = ml + cw - 68;
  const totalsW = 68;

  // Totals background
  doc.setFillColor(LIGHT_BG);
  doc.rect(totalsX, y, totalsW, 26, "F");

  // Gold top accent on totals box
  doc.setFillColor(GOLD);
  doc.rect(totalsX, y, totalsW, 0.8, "F");

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(SLATE);
  doc.text("Subtotal", totalsX + 3, y + 2);
  doc.setTextColor(NAVY);
  doc.text(fmt(quote.subtotal), totalsX + totalsW - 3, y + 2, { align: "right" });

  y += 6;
  doc.setTextColor(SLATE);
  doc.text("GST (10%)", totalsX + 3, y + 2);
  doc.setTextColor(NAVY);
  doc.text(fmt(quote.gst), totalsX + totalsW - 3, y + 2, { align: "right" });

  drawLine(doc, totalsX + 3, y + 5.5, totalsX + totalsW - 3, NAVY, 0.3);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(NAVY);
  doc.text("Total (inc. GST)", totalsX + 3, y + 2);
  doc.setTextColor(GOLD_DARK);
  doc.text(fmt(quote.total), totalsX + totalsW - 3, y + 2, { align: "right" });

  y += 14;

  // ─── Exclusions ────────────────────────────────────────────
  if (quote.exclusions) {
    if (y > ph - 50) {
      doc.addPage();
      y = 20;
    }

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
    y += exLines.length * 3.2 + 6;
  }

  // ─── Footer ────────────────────────────────────────────────
  const fy = ph - 16;
  doc.setFillColor(NAVY);
  doc.rect(0, fy - 2, pw, 20, "F");
  doc.setFillColor(GOLD);
  doc.rect(0, fy - 2, pw, 0.6, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor("#9CA3AF");
  doc.text("Peninsula Equine  ·  Engineered Infrastructure  ·  ABN XX XXX XXX XXX", ml, fy + 5);
  doc.text("peninsulaequine.com.au", pw - mr, fy + 5, { align: "right" });

  doc.setFontSize(5.5);
  doc.text("This document is confidential. Pricing valid for 30 days unless otherwise stated.", ml, fy + 9);

  // ─── Save ──────────────────────────────────────────────────
  const filename = `${quote.quote_number || "PE-Quote"}-${quote.client_name.replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}
