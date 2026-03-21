import jsPDF from "jspdf";
import { format } from "date-fns";

const NAVY = "#1a1d26";
const NAVY_DEEP = "#12141b";
const GOLD = "#E8C067";
const GOLD_MUTED = "#B8995A";
const SLATE = "#6B7280";
const WHITE = "#FFFFFF";
const WARM_WHITE = "#FAF9F6";
const DIVIDER = "#E0DCD2";

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function generateOnboardingPDF(clientName: string, projectName: string) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 24;
  const totalPages = 4;
  const date = format(new Date(), "d MMMM yyyy");

  function addFooter(page: number) {
    pdf.setFontSize(7);
    pdf.setTextColor(...hexToRgb(SLATE));
    pdf.text("Peninsula Equine", M, H - 12);
    pdf.text(`${page} / ${totalPages}`, W - M, H - 12, { align: "right" });
    pdf.setDrawColor(...hexToRgb(DIVIDER));
    pdf.setLineWidth(0.3);
    pdf.line(M, H - 16, W - M, H - 16);
  }

  // ─── PAGE 1 — Cover ───────────────────────────
  pdf.setFillColor(...hexToRgb(NAVY_DEEP));
  pdf.rect(0, 0, W, H, "F");

  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(GOLD_MUTED));
  pdf.text("PENINSULA EQUINE", M, 40);

  pdf.setDrawColor(...hexToRgb(GOLD));
  pdf.setLineWidth(0.5);
  pdf.line(M, 50, M + 30, 50);

  pdf.setFontSize(28);
  pdf.setTextColor(...hexToRgb(WHITE));
  pdf.text("Client", M, 80);
  pdf.text("Onboarding", M, 92);

  pdf.setFontSize(11);
  pdf.setTextColor(...hexToRgb(GOLD));
  pdf.text(projectName, M, 110);

  pdf.setFontSize(9);
  pdf.setTextColor(...hexToRgb(SLATE));
  pdf.text(`Prepared for ${clientName}`, M, 125);
  pdf.text(date, M, 133);

  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(SLATE));
  const coverNote = "This document outlines your project structure, build stages,\nand what to expect throughout the process.";
  pdf.text(coverNote, M, H - 50);

  // ─── PAGE 2 — Project Overview ─────────────────
  pdf.addPage();
  pdf.setFillColor(...hexToRgb(WARM_WHITE));
  pdf.rect(0, 0, W, H, "F");

  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(GOLD_MUTED));
  pdf.text("01 — PROJECT OVERVIEW", M, 32);

  pdf.setDrawColor(...hexToRgb(GOLD));
  pdf.setLineWidth(0.5);
  pdf.line(M, 38, M + 25, 38);

  pdf.setFontSize(18);
  pdf.setTextColor(...hexToRgb(NAVY));
  pdf.text(projectName, M, 55);

  pdf.setFontSize(9);
  pdf.setTextColor(...hexToRgb(SLATE));
  const overview = [
    "Your project has been designed with three priorities in mind:",
    "",
    "•  Performance — built to handle daily use, weather, and wear",
    "•  Access — practical flow for horses, vehicles, and people",
    "•  Longevity — materials and methods chosen for the long term",
    "",
    "Every decision — from drainage to surface selection — has been",
    "considered as part of a single, cohesive system rather than",
    "individual elements assembled separately.",
  ];
  let y = 72;
  overview.forEach((line) => {
    pdf.text(line, M, y);
    y += 6;
  });

  // Communication expectations
  y += 10;
  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(GOLD_MUTED));
  pdf.text("COMMUNICATION", M, y);
  y += 10;

  pdf.setFontSize(9);
  pdf.setTextColor(...hexToRgb(SLATE));
  const comms = [
    "•  Weekly project updates every Friday",
    "•  Direct phone access to your project lead",
    "•  Photo documentation at key milestones",
    "•  Prompt responses within one business day",
  ];
  comms.forEach((line) => {
    pdf.text(line, M, y);
    y += 6;
  });

  addFooter(2);

  // ─── PAGE 3 — Build Stages ─────────────────────
  pdf.addPage();
  pdf.setFillColor(...hexToRgb(WARM_WHITE));
  pdf.rect(0, 0, W, H, "F");

  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(GOLD_MUTED));
  pdf.text("02 — BUILD STAGES", M, 32);

  pdf.setDrawColor(...hexToRgb(GOLD));
  pdf.setLineWidth(0.5);
  pdf.line(M, 38, M + 25, 38);

  const stages = [
    {
      num: "01",
      title: "Project Secured",
      desc: "Initial deposit to secure schedule and begin planning. Your position in our build calendar is confirmed.",
    },
    {
      num: "02",
      title: "Planning & Site Phase",
      desc: "Scope refinement, site preparation planning, and final build specifications. We'll walk the property together.",
    },
    {
      num: "03",
      title: "Groundworks",
      desc: "Site preparation and foundational work. Drainage, access, and base layers are established.",
    },
    {
      num: "04",
      title: "Structure & Systems",
      desc: "Core construction, materials installation, and system integration. The build takes physical shape.",
    },
    {
      num: "05",
      title: "Completion & Handover",
      desc: "Final works, quality inspection, and formal project handover. Documentation and care guidance provided.",
    },
  ];

  y = 55;
  stages.forEach((stage) => {
    // Number + gold line
    pdf.setFontSize(10);
    pdf.setTextColor(...hexToRgb(GOLD));
    pdf.text(stage.num, M, y);
    pdf.setDrawColor(...hexToRgb(GOLD));
    pdf.setLineWidth(0.3);
    pdf.line(M + 10, y - 1, M + 10, y + 10);

    // Title
    pdf.setFontSize(11);
    pdf.setTextColor(...hexToRgb(NAVY));
    pdf.text(stage.title, M + 16, y);

    // Description
    pdf.setFontSize(8.5);
    pdf.setTextColor(...hexToRgb(SLATE));
    const lines = pdf.splitTextToSize(stage.desc, W - M * 2 - 16);
    pdf.text(lines, M + 16, y + 7);
    y += 35;
  });

  addFooter(3);

  // ─── PAGE 4 — What to Expect ───────────────────
  pdf.addPage();
  pdf.setFillColor(...hexToRgb(WARM_WHITE));
  pdf.rect(0, 0, W, H, "F");

  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(GOLD_MUTED));
  pdf.text("03 — WHAT TO EXPECT", M, 32);

  pdf.setDrawColor(...hexToRgb(GOLD));
  pdf.setLineWidth(0.5);
  pdf.line(M, 38, M + 25, 38);

  pdf.setFontSize(18);
  pdf.setTextColor(...hexToRgb(NAVY));
  pdf.text("Working With Us", M, 55);

  pdf.setFontSize(9);
  pdf.setTextColor(...hexToRgb(SLATE));

  const expectations = [
    "We take on a limited number of builds each year to maintain",
    "quality and delivery standards.",
    "",
    "Your project will receive dedicated attention from start to",
    "finish. We don't subcontract core work, and the same team",
    "that plans your build will be on-site delivering it.",
    "",
    "After completion, we'll check in at two weeks and again at",
    "two months to ensure everything is performing as expected.",
    "",
    "If anything comes up between those check-ins — or at any",
    "point after — we're always available.",
  ];

  y = 72;
  expectations.forEach((line) => {
    pdf.text(line, M, y);
    y += 6;
  });

  // Contact
  y += 16;
  pdf.setDrawColor(...hexToRgb(DIVIDER));
  pdf.setLineWidth(0.3);
  pdf.line(M, y, W - M, y);
  y += 10;

  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(GOLD_MUTED));
  pdf.text("CONTACT", M, y);
  y += 8;

  pdf.setFontSize(9);
  pdf.setTextColor(...hexToRgb(NAVY));
  pdf.text("Peninsula Equine", M, y);
  y += 6;
  pdf.setTextColor(...hexToRgb(SLATE));
  pdf.text("peninsulaequine.com.au", M, y);
  y += 6;
  pdf.text("Mornington Peninsula, Victoria", M, y);

  addFooter(4);

  // ─── Save ──────────────────────────────────────
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  pdf.save(`PE-Onboarding-${safeName}.pdf`);
}
