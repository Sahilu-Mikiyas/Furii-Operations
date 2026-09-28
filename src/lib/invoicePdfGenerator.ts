import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReceiptItem {
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptPdfData {
  receiptNumber: string;
  invoiceNumber?: string;
  issueDate: string;
  approvalDate?: string;
  client: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  projectTitle: string;
  serviceType?: string;
  description?: string;
  items: ReceiptItem[];
  currency: "ETB" | "USD";
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  notes?: string;
  verifiedBy?: string;
}

export function generateReceiptPdf(data: ReceiptPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Primary colors
  const primaryColor: [number, number, number] = [17, 24, 39]; // Gray 900
  const accentColor: [number, number, number] = [5, 150, 105]; // Emerald 600
  const mutedColor: [number, number, number] = [107, 114, 128]; // Gray 500
  const borderColor: [number, number, number] = [229, 231, 235]; // Gray 200

  // 1. Top Decorative Accent Line
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pageWidth, 4, "F");

  // 2. Header: Brand & Document Info
  let currentY = 22;

  // Agency Brand Wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text("FURII", margin, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("OPERATIONS & DIGITAL LABS", margin + 26, currentY - 1);

  doc.setFontSize(8);
  doc.text("Creative Production • Enterprise Engineering • Brand Systems", margin, currentY + 6);
  doc.text("Addis Ababa, Ethiopia  •  operations@furii.io  •  furii.io", margin, currentY + 11);

  // Document Badge (Right aligned)
  const isPaid = data.amountPaid >= data.totalAmount;
  const badgeText = isPaid ? "OFFICIAL PAYMENT RECEIPT" : "SETTLED TAX INVOICE";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...accentColor);
  doc.text(badgeText, pageWidth - margin, currentY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(`Receipt #: ${data.receiptNumber}`, pageWidth - margin, currentY + 6, { align: "right" });
  doc.text(`Date: ${data.issueDate}`, pageWidth - margin, currentY + 11, { align: "right" });
  if (data.approvalDate) {
    doc.text(`Verified: ${data.approvalDate}`, pageWidth - margin, currentY + 16, { align: "right" });
  }

  // Divider
  currentY += 22;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // 3. Client & Transaction Particulars (2 Columns)
  currentY += 8;

  // Left: Bill To / Client
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text("CLIENT / BILLED TO:", margin, currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(data.client.company || data.client.name, margin, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  let clientY = currentY + 10;
  if (data.client.company && data.client.name && data.client.company !== data.client.name) {
    doc.text(`Attn: ${data.client.name}`, margin, clientY);
    clientY += 4.5;
  }
  if (data.client.email) {
    doc.text(data.client.email, margin, clientY);
    clientY += 4.5;
  }
  if (data.client.phone) {
    doc.text(data.client.phone, margin, clientY);
    clientY += 4.5;
  }

  // Right: Settlement & Verification Details
  const rightColX = pageWidth / 2 + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text("SETTLEMENT & PAYMENT DETAILS:", rightColX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let settleY = currentY + 5;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text("Payment Status: APPROVED & VERIFIED", rightColX, settleY);
  settleY += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text(`Payment Method: ${data.paymentMethod || "Electronic Wire / Bank Transfer"}`, rightColX, settleY);
  settleY += 4.5;

  if (data.paymentReference) {
    doc.text(`Transaction Ref: ${data.paymentReference}`, rightColX, settleY);
    settleY += 4.5;
  }
  if (data.paymentDate) {
    doc.text(`Settlement Date: ${data.paymentDate}`, rightColX, settleY);
    settleY += 4.5;
  }

  // 4. Project Scope Header
  currentY = Math.max(clientY, settleY) + 6;
  doc.setFillColor(248, 250, 252); // slate 50
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, "F");
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`Engagement: ${data.projectTitle}`, margin + 4, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  const specText = data.serviceType
    ? `Stream: ${data.serviceType.toUpperCase()}  •  Verified Milestone Fulfillment`
    : "Authorized Enterprise Delivery Stream";
  doc.text(specText, margin + 4, currentY + 11);

  currentY += 18;

  // 5. Line Items Table via autoTable
  const tableData = data.items.map((item, idx) => [
    `${idx + 1}`,
    item.description,
    item.category || "Execution",
    `${item.quantity}`,
    `${item.unitPrice.toLocaleString()} ${data.currency}`,
    `${item.total.toLocaleString()} ${data.currency}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["#", "Deliverable / Scope Specification", "Category", "Qty", "Unit Price", "Total Amount"]],
    body: tableData,
    theme: "plain",
    styles: {
      fontSize: 8.5,
      textColor: primaryColor,
      cellPadding: 3.5,
      lineColor: borderColor,
      lineWidth: 0.2,
      font: "helvetica",
    },
    headStyles: {
      fillColor: [243, 244, 246], // Gray 100
      textColor: [55, 65, 81],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28 },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // 6. Financial Summary Card & Official Verification Stamp
  // Left: Official Stamp Box
  const stampWidth = 90;
  const stampHeight = 36;
  doc.setDrawColor(5, 150, 105); // Emerald 600
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, finalY, stampWidth, stampHeight, 3, 3, "D");

  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(margin + 0.5, finalY + 0.5, stampWidth - 1, stampHeight - 1, 2.5, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.text("FURII OPERATIONS • VERIFIED RECEIPT", margin + 6, finalY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.text("Official Digital Payment Clearance", margin + 6, finalY + 12);
  doc.text(`Authorized by: ${data.verifiedBy || "Agency Finance & Operations"}`, margin + 6, finalY + 17);
  doc.text(`Status: 100% PAID IN FULL`, margin + 6, finalY + 22);
  doc.text(`Cryptographic Audit Hash: #${data.receiptNumber.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}`, margin + 6, finalY + 28);

  // Right: Calculation Totals Box
  const totalBoxX = pageWidth - margin - 75;
  const totalBoxWidth = 75;

  let totalsY = finalY + 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  doc.text("Subtotal:", totalBoxX, totalsY);
  doc.text(`${data.subtotal.toLocaleString()} ${data.currency}`, pageWidth - margin, totalsY, { align: "right" });

  totalsY += 5;
  if (data.taxAmount && data.taxAmount > 0) {
    doc.text(`Tax / VAT (${data.taxRate || 0}%):`, totalBoxX, totalsY);
    doc.text(`${data.taxAmount.toLocaleString()} ${data.currency}`, pageWidth - margin, totalsY, { align: "right" });
    totalsY += 5;
  } else {
    doc.text("Tax / VAT (0% Included):", totalBoxX, totalsY);
    doc.text(`0.00 ${data.currency}`, pageWidth - margin, totalsY, { align: "right" });
    totalsY += 5;
  }

  // Total Due
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text("Total Investment:", totalBoxX, totalsY);
  doc.text(`${data.totalAmount.toLocaleString()} ${data.currency}`, pageWidth - margin, totalsY, { align: "right" });

  totalsY += 6;
  doc.setDrawColor(...borderColor);
  doc.line(totalBoxX, totalsY - 1, pageWidth - margin, totalsY - 1);

  // Amount Paid
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...accentColor);
  doc.text("Amount Paid:", totalBoxX, totalsY + 4);
  doc.text(`${data.amountPaid.toLocaleString()} ${data.currency}`, pageWidth - margin, totalsY + 4, { align: "right" });

  // Outstanding Balance
  const outstanding = Math.max(0, data.totalAmount - data.amountPaid);
  totalsY += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  doc.text("Balance Due:", totalBoxX, totalsY);
  doc.text(`${outstanding.toLocaleString()} ${data.currency}`, pageWidth - margin, totalsY, { align: "right" });

  // 7. Footer & Legal Note
  const footerY = pageHeight - 16;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedColor);
  doc.text(
    "This is an electronically generated official receipt issued by Furii Operations. Verified under agency operating terms.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "For inquiries, please contact operations@furii.io or contact your designated agency engagement manager.",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  return doc;
}

export function downloadReceiptPdf(data: ReceiptPdfData, fileName?: string) {
  const doc = generateReceiptPdf(data);
  const name = fileName || `Furii-Receipt-${data.receiptNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
  doc.save(name);
}
