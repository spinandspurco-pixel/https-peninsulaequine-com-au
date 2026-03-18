import jsPDF from "jspdf";

const BRAND = {
  name: "Peninsula Equine",
  system: "GroundLock™",
  tagline: "GroundLock™ is a system developed by Peninsula Equine.",
};

const PAGE = { margin: 25, width: 160, lineHeight: 7 };

function addHeader(doc: jsPDF, title: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, PAGE.margin, 30);
  doc.setDrawColor(180, 155, 100);
  doc.setLineWidth(0.5);
  doc.line(PAGE.margin, 35, PAGE.margin + PAGE.width, 35);
  return 48;
}

function addClause(doc: jsPDF, y: number, num: string, title: string, lines: string[]): number {
  if (y > 255) { doc.addPage(); y = 25; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${num}. ${title}`, PAGE.margin, y);
  y += PAGE.lineHeight + 1;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const line of lines) {
    if (y > 272) { doc.addPage(); y = 25; }
    const wrapped = doc.splitTextToSize(line, PAGE.width);
    doc.text(wrapped, PAGE.margin, y);
    y += wrapped.length * (PAGE.lineHeight - 1);
  }
  return y + 4;
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(BRAND.tagline, PAGE.margin, 288);
    doc.text(`Page ${i} of ${pages}`, PAGE.margin + PAGE.width, 288, { align: "right" });
    doc.setTextColor(0);
  }
}

function addSignatureBlock(doc: jsPDF, y: number): number {
  if (y > 240) { doc.addPage(); y = 25; }
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("SIGNATURES", PAGE.margin, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const col1 = PAGE.margin;
  const col2 = PAGE.margin + 85;

  doc.text("Peninsula Equine (System Owner)", col1, y);
  doc.text("[Installer Name / Business]", col2, y);
  y += 16;
  doc.line(col1, y, col1 + 70, y);
  doc.line(col2, y, col2 + 70, y);
  y += 5;
  doc.text("Signature", col1, y);
  doc.text("Signature", col2, y);
  y += 12;
  doc.text("Date: _______________", col1, y);
  doc.text("Date: _______________", col2, y);
  return y + 10;
}

export function generateInstallerAgreement() {
  const doc = new jsPDF();
  let y = addHeader(doc, "GroundLock™ Installer Agreement");

  y = addClause(doc, y, "1", "PARTIES", [
    "This Agreement is between:",
    "Peninsula Equine (the \"System Owner\")",
    "and",
    "[Installer Name / Business] (the \"Installer\")",
  ]);

  y = addClause(doc, y, "2", "PURPOSE", [
    "The System Owner grants the Installer limited rights to install and implement the GroundLock™ system in accordance with the methodology provided.",
  ]);

  y = addClause(doc, y, "3", "INTELLECTUAL PROPERTY", [
    "The GroundLock™ system, including all methods, designs, and materials, remains the exclusive property of Peninsula Equine.",
    "",
    "The Installer:",
    "• may not copy, reproduce, or modify the system",
    "• may not teach or transfer the system to third parties",
    "• may not rebrand the system",
  ]);

  y = addClause(doc, y, "4", "PERMITTED USE", [
    "The Installer is permitted to:",
    "• install GroundLock™ systems",
    "• promote GroundLock™ installations in their own projects",
    "",
    "Provided that:",
    "• installations follow the approved method",
    "• quality standards are maintained",
  ]);

  y = addClause(doc, y, "5", "QUALITY CONTROL", [
    "The System Owner reserves the right to:",
    "• review installations",
    "• request corrections if standards are not met",
    "• revoke access if quality is compromised",
  ]);

  y = addClause(doc, y, "6", "RESTRICTIONS", [
    "The Installer may not:",
    "• alter system structure",
    "• substitute key materials without approval",
    "• market competing systems under the GroundLock™ name",
  ]);

  y = addClause(doc, y, "7", "FEES", [
    "Installer agrees to:",
    "• pay onboarding fee (if applicable)",
    "  AND/OR",
    "• purchase materials through approved supply channels",
  ]);

  y = addClause(doc, y, "8", "TERM", [
    "This agreement continues unless:",
    "• terminated by either party",
    "• revoked due to breach of standards",
  ]);

  y = addClause(doc, y, "9", "TERMINATION", [
    "The System Owner may terminate access if:",
    "• misuse of system",
    "• poor workmanship",
    "• breach of agreement",
    "",
    "Upon termination:",
    "• Installer must cease using GroundLock™ branding",
  ]);

  y = addClause(doc, y, "10", "LIABILITY", [
    "Installer is responsible for:",
    "• their own work",
    "• site conditions",
    "• client agreements",
  ]);

  addSignatureBlock(doc, y);
  addFooter(doc);
  doc.save("GroundLock-Installer-Agreement.pdf");
}

export function generateSupplyAgreement() {
  const doc = new jsPDF();
  let y = addHeader(doc, "GroundLock™ Supply Agreement");

  y = addClause(doc, y, "1", "PURPOSE", [
    "Installer agrees to source GroundLock™ system components through Peninsula Equine or approved suppliers.",
  ]);

  y = addClause(doc, y, "2", "SUPPLY TERMS", [
    "• No substitutions without prior written approval",
    "• System must be installed correctly per approved methodology",
    "• All GroundLock™ branding must remain intact",
  ]);

  y = addClause(doc, y, "3", "PAYMENT", [
    "• Materials purchased per project",
    "• Pricing subject to current supply terms",
    "• Payment terms as agreed between parties",
  ]);

  y = addClause(doc, y, "4", "QUALITY", [
    "All supplied materials must be used in accordance with the GroundLock™ installation methodology. Peninsula Equine reserves the right to audit installations to ensure compliance.",
  ]);

  addSignatureBlock(doc, y);
  addFooter(doc);
  doc.save("GroundLock-Supply-Agreement.pdf");
}

export function generateBrandUsageRules() {
  const doc = new jsPDF();
  let y = addHeader(doc, "GroundLock™ Brand Usage Rules");

  y = addClause(doc, y, "1", "PERMITTED USAGE", [
    "The following uses are allowed:",
    '• "GroundLock™ System"',
    '• "Installed using GroundLock™ methodology"',
    '• "GroundLock™ certified installation"',
  ]);

  y = addClause(doc, y, "2", "PROHIBITED USAGE", [
    "The following are NOT allowed:",
    "• Renaming the system",
    "• Creating variations of the GroundLock™ name",
    "• Claiming ownership of the system or methodology",
    "• Using the name in a way that implies independent ownership",
  ]);

  y = addClause(doc, y, "3", "ATTRIBUTION", [
    "All references to GroundLock™ must include the trademark symbol (™).",
    "",
    "The following attribution line must be included where the name is used commercially:",
    "",
    "\"GroundLock™ is a system developed by Peninsula Equine.\"",
  ]);

  y = addClause(doc, y, "4", "ENFORCEMENT", [
    "Peninsula Equine reserves the right to:",
    "• request removal of non-compliant usage",
    "• revoke installer access for repeated violations",
    "• pursue legal remedies for wilful misuse",
  ]);

  addFooter(doc);
  doc.save("GroundLock-Brand-Usage-Rules.pdf");
}
