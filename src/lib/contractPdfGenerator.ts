import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./utils";
import type { BillingType, Currency } from "@/types";

export interface ContractDealPdfData {
  dealNumber: string;
  serviceTitle: string;
  client: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  billingType: BillingType;
  duration?: string;
  totalAmount: number;
  currency: Currency;
  receiptFileName?: string;
  signedDate: string;
  signerName?: string;
  signatureHash?: string;
  notes?: string;
}

export function generateContractPdf(data: ContractDealPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Palette
  const primaryColor: [number, number, number] = [17, 24, 39]; // Gray 900
  const accentColor: [number, number, number] = [124, 58, 237]; // Violet 600
  const emeraldColor: [number, number, number] = [5, 150, 105]; // Emerald 600
  const mutedColor: [number, number, number] = [107, 114, 128]; // Gray 500
  const borderColor: [number, number, number] = [229, 231, 235]; // Gray 200

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 5, "F");

  // 2. Header: Brand Wordmark & Document Meta
  let currentY = 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text("FURII", margin, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...mutedColor);
  doc.text("OPERATIONS & DIGITAL LABS", margin + 24, currentY - 1);

  doc.setFontSize(8);
  doc.text("Master Services Agreement & Digital Deal Execution Record", margin, currentY + 6);
  doc.text("Addis Ababa, Ethiopia  •  operations@furii.io  •  furii.io", margin, currentY + 10.5);

  // Right-aligned Execution Stamp
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...emeraldColor);
  doc.text("DIGITALLY EXECUTED DEAL", pageWidth - margin, currentY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  doc.text(`Agreement Ref: ${data.dealNumber}`, pageWidth - margin, currentY + 5.5, { align: "right" });
  doc.text(`Executed Date: ${data.signedDate}`, pageWidth - margin, currentY + 10, { align: "right" });

  currentY += 19;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // 3. Parties Section
  currentY += 8;

  // Client Party (Left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("CLIENT / AUTHORIZED PARTY", margin, currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.client.company || data.client.name, margin, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  if (data.client.company && data.client.name !== data.client.company) {
    doc.text(`Authorized Rep: ${data.client.name}`, margin, currentY + 10);
    if (data.client.email) doc.text(`Email: ${data.client.email}`, margin, currentY + 14.5);
  } else {
    if (data.client.email) doc.text(`Contact: ${data.client.email}`, margin, currentY + 10);
    if (data.client.phone) doc.text(`Phone: ${data.client.phone}`, margin, currentY + 14.5);
  }

  // Agency Party (Right)
  const rightX = pageWidth / 2 + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("SERVICE PROVIDER / EXECUTING AGENCY", rightX, currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Furii Agency Inc. (Operations Command)", rightX, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  doc.text("Design, Digital Architecture & Commercial Media", rightX, currentY + 10);
  doc.text("Jurisdiction: Federal Democratic Republic of Ethiopia", rightX, currentY + 14.5);

  // 4. Commercial Deal Specifications Table
  currentY += 24;

  const billingLabel =
    data.billingType === "monthly_retainer"
      ? "Monthly Retainer (30-Day Auto-Renewal Cycle)"
      : "One-Time Engagement (Fixed Milestone Scope)";

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: primaryColor,
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: mutedColor, cellWidth: 50 },
      1: { fontStyle: "normal", textColor: primaryColor },
    },
    body: [
      ["Service Engagement", data.serviceTitle],
      ["Billing Model", billingLabel],
      ["Cadence / Duration", data.duration || (data.billingType === "monthly_retainer" ? "Monthly Ongoing" : "4-Week Sprint")],
      ["Financial Commitment", `${data.totalAmount.toLocaleString()} ${data.currency}`],
      ["Payment Proof Slip", data.receiptFileName || "Transaction receipt attached to record"],
      ["Execution Status", "Electronically Verified & Agreed under MSA terms"],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 5. Terms & Conditions Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("Master Services Agreement Clauses", margin, currentY);

  currentY += 4;
  doc.setFillColor(249, 250, 251); // Gray 50
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth, 54, 2, 2, "FD");

  let clauseY = currentY + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81); // Gray 700

  const clauses = [
    "1. Scope & Execution: Furii Agency agrees to execute all agreed milestone deliverables specified in the catalog and client brief.",
    "2. Financial Settlement: Operations clearance and sprint dispatch commence upon verified clearance of the attached payment receipt.",
    data.billingType === "monthly_retainer"
      ? "3. Retainer Renewal: Operates on a 30-day recurring cadence. At the end of each billing month, a renewal receipt is required to maintain capacity."
      : "3. Delivery & Revisions: One-time engagement deliverables are submitted via the Client Vault for formal stakeholder sign-off and revisions.",
    "4. Intellectual Property: Complete title and copyright transfer to the client upon full settlement of all related invoices and service fees.",
    "5. Electronic Signature: Checking the agreement box and submitting constitutes an enforceable digital contract between both parties.",
  ];

  clauses.forEach((c) => {
    doc.text(c, margin + 4, clauseY, { maxWidth: contentWidth - 8 });
    clauseY += 9;
  });

  currentY += 62;

  // 6. Cryptographic Digital Signature Block
  doc.setFillColor(245, 243, 255); // Violet 50
  doc.setDrawColor(221, 214, 254); // Violet 200
  doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text("ELECTRONIC EXECUTION CERTIFICATE", margin + 5, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text(`Authorized Signer: ${data.signerName || data.client.name}`, margin + 5, currentY + 14);
  doc.text(`Organization: ${data.client.company || data.client.name}`, margin + 5, currentY + 19);
  doc.text(`Consent Timestamp: ${data.signedDate}`, margin + 5, currentY + 24);

  const hash =
    data.signatureHash ||
    `SHA256:${data.dealNumber.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}-FURII-VERIFIED`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text(`Digital Verification Hash: ${hash}`, margin + 5, currentY + 31);

  // Agency Verification Stamp (Right side of signature box)
  const stampX = pageWidth - margin - 50;
  doc.setDrawColor(...emeraldColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(stampX, currentY + 5, 45, 28, 1.5, 1.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...emeraldColor);
  doc.text("FURII OPERATIONS", stampX + 22.5, currentY + 11, { align: "center" });
  doc.setFontSize(9);
  doc.text("VERIFIED", stampX + 22.5, currentY + 17, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("DIGITAL CONTRACT SEAL", stampX + 22.5, currentY + 22, { align: "center" });
  doc.text("LEGAL DESK", stampX + 22.5, currentY + 27, { align: "center" });

  // 7. Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text(
    "Official digital agreement document issued by Furii Operations. Verified and stored in compliance with standard commercial terms.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

export function downloadContractPdf(data: ContractDealPdfData, customFileName?: string) {
  const doc = generateContractPdf(data);
  const cleanTitle = (data.serviceTitle || "Deal").replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);
  const name =
    customFileName ||
    `Furii-Contract-${cleanTitle}-${data.dealNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
  doc.save(name);
}
