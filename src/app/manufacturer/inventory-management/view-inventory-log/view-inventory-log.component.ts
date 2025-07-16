import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '@core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-inventory-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-inventory-log.component.html',
  styleUrl: './view-inventory-log.component.scss'
})
export class ViewInventoryLogComponent implements OnInit {
  logData: any;     // First API data (from navigation or fetch)
  stockData: any;   // Second API data (fetch on init)
  grouped: any = {}; // Grouped history by color/size

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    // You may receive logData via navigation state or service
    // For demo, get it from history.state (adjust if using service)
    this.logData = history.state.data;
    if (!this.logData?.designNumber) return;

    // Get latest stock for this design
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.authService.get(
      `manufacture-inventory?userEmail=${currentUser.email}&search=${encodeURIComponent(this.logData.designNumber)}`
    ).subscribe((res: any) => {
      this.stockData = res.results?.[0];
    });

    // Prepare grouped movements
    this.groupEntries();
  }


  get groupedKeys(): string[] {
  return Object.keys(this.grouped || {});
}


  groupEntries() {
    if (!this.logData?.entries) return;
    this.grouped = {};
    this.logData.entries.forEach((entry: any) => {
      const key = `${entry.colourName}|||${entry.brandSize}|||${entry.standardSize}`;
      if (!this.grouped[key]) this.grouped[key] = [];
      this.grouped[key].push(entry);
    });
  }

  // Find current stock for color/size from second API
  findCurrentStock(colourName: string, brandSize: string, standardSize: string) {
    if (!this.stockData?.entries) return null;
    return this.stockData.entries.find(
      (e: any) => e.colourName === colourName && e.brandSize === brandSize && e.standardSize === standardSize
    );
  }

  formatDate(dateStr: string) {
    // Example: 15/Jul/2025 5:43 PM
    const d = new Date(dateStr);
    const options: any = { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    return d.toLocaleString('en-GB', options).replace(',', '');
  }

  // PDF Export logic (handles multipage)
downloadPDFTable() {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Report title
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 120);
  doc.text(`Inventory Log Report`, 105, 15, { align: 'center' });

  // Summary block with background
  doc.setFillColor(230, 240, 255);
  doc.rect(10, 22, 190, 22, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0,0,0);
  doc.text(`Design No: ${this.logData?.designNumber || ''}`, 14, 30);
  doc.text(`Brand Name: ${this.logData?.brandName || ''}`, 110, 30);
  doc.text(`Total Updates: ${this.logData?.totalUpdates || 0}`, 14, 38);
  doc.text(`Total Qty Added: ${this.logData?.totalQuantityAdded || 0}`, 70, 38);
  doc.text(`Total Qty Removed: ${this.logData?.totalQuantityRemoved || 0}`, 130, 38);
  doc.text(`Latest Update: ${this.formatDate(this.logData?.latestUpdatedAt) || ''}`, 14, 46);

  let currentY = 54;

  for (let key of this.groupedKeys) {
    const group = this.grouped[key];
    if (!group) continue;

    const { colourName, brandSize, standardSize } = group[0];

    // --- Group Section Header ---
    doc.setFillColor(220, 230, 255);
    doc.rect(10, currentY-2, 190, 10, 'F');
    doc.setFontSize(13);
    doc.setTextColor(0, 70, 140);
    doc.text(
      `Color: ${colourName}    Brand Size: ${brandSize}    Std Size: ${standardSize}`,
      14, currentY+5
    );
    doc.setTextColor(0,0,0);
    currentY += 12;

    // --- Table for this group ---
    const tableData = group.map((entry: any) => [
      entry.records.status === 'stock_added' ? 'Added' : 'Removed',
      entry.records.updatedQuantity,
      entry.records.previousRemainingQuantity,
      this.formatDate(entry.records.lastUpdatedAt),
      entry.records.lastUpdatedBy
    ]);
    const columns = ['Status', 'Qty Changed', 'Prev Qty', 'Updated Date', 'Updated By'];

    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: currentY,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      headStyles: {
        fillColor: [24, 90, 170],
        textColor: [255,255,255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245,250,255] },
      styles: { cellPadding: 2 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // --- Current Stock Footer and Horizontal Line ---
    const curStock = this.findCurrentStock(colourName, brandSize, standardSize);
    let footerText = '';
    if (curStock) {
      // Highlight for footer
      doc.setFillColor(230, 255, 230);
      doc.rect(14, currentY, 180, 8, 'F');
      doc.setFontSize(10);
      doc.setTextColor(curStock.isLowStock ? 200 : 20, curStock.isLowStock ? 10 : 110, 10);
      footerText = `Current stock: ${curStock.quantity}   Minimum: ${curStock.minimumQuantityAlert}   Low Stock: ${curStock.isLowStock ? 'Yes' : 'No'}`;
      doc.text(footerText, 18, currentY + 6);
      doc.setTextColor(0,0,0);
      currentY += 12;

      // Draw horizontal line
      doc.setDrawColor(200, 200, 200); // light grey
      doc.setLineWidth(0.4);
      doc.line(14, currentY, 194, currentY); // x1, y1, x2, y2
      currentY += 3;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(180, 60, 60);
      doc.text('Stock not found in summary data', 18, currentY + 6);
      doc.setTextColor(0,0,0);
      currentY += 10;

      // Draw horizontal line
      doc.setDrawColor(200, 200, 200); // light grey
      doc.setLineWidth(0.4);
      doc.line(14, currentY, 194, currentY);
      currentY += 3;
    }
  }

  // --- Page numbers (TypeScript-safe) ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`${this.logData?.designNumber || 'inventory-log'}.pdf`);
}

}
