import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IndianCurrencyPipe } from 'app/custom.pipe';

@Component({
  selector: 'app-view-wholesaler-po',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
  templateUrl: './view-wholesaler-po.component.html',
  styleUrl: './view-wholesaler-po.component.scss'
})
export class ViewWholesalerPoComponent {
   purchaseOrder: any = {};
  tableChunks: any[][] = [];
  serialOffset: number[] = [];
  Totalsub = 0;
  discountAmount = 0;
  discountedTotal = 0;
  sgst = 0;
  cgst = 0;
  igst = 0;
  totalGrandTotal = 0;
  private distributorId = ''; 

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location
  ) 
  {
  }

  ngOnInit() {
    this.distributorId = this.route.snapshot.paramMap.get('id') || '';
    this.loadPurchaseOrder();
  }

   private loadPurchaseOrder() {
    this.authService.get(`po-wholesaler-to-manufacture/${this.distributorId}`)
      .subscribe((res: any) => {
        // ─── Map PO metadata ────────────────────────────
        this.purchaseOrder = {
          poNumber:        res.poNumber,
          poDate:          new Date (res.wholesalerPODateCreated).toLocaleDateString(),
          supplierName:    res.manufacturer.companyName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.pinCode} - ${res.manufacturer.state}`,
          supplierContact: res.manufacturer.mobNumber,
          supplierEmail:   res.manufacturer.email,
          supplierGSTIN:   res.manufacturer.GSTIN,
          supplierPAN:     res.manufacturer.GSTIN?.substring(2,12) || '',
          buyerName:       res.wholesaler.companyName,
          buyerAddress:    `${res.wholesaler.address}, ${res.wholesaler.pinCode} - ${res.wholesaler.state}`,
          buyerPhone:      res.wholesaler.mobNumber,
          buyerEmail:      res.wholesaler.email,
          buyerGSTIN:      res.wholesaler.GSTIN,
          buyerPAN:        res.wholesaler.GSTIN?.substring(2,12) || '',
          logoUrl:         res.wholesaler.profileImg,
          ProductDiscount: parseFloat(res.wholesaler.productDiscount || '0'),
        };

        // ─── Build rows & recalc totals ─────────────────
        this.buildTable(res.set, res.manufacturer.state, res.wholesaler.state);
      });
  }

  private buildTable(items: any[], mState: string, wState: string) {
    const rows = items.map(i => ({
      designNumber: i.designNumber,
      colourName:   i.colourName,
      size:         i.size,
      price:        parseFloat(i.price) || 0,
      quantity:     i.totalQuantity,
      gender:       i.gender,
      clothing:     i.clothing
    }));

    this.chunkArray(rows);

    this.Totalsub = rows.reduce((s,r) => s + r.price * r.quantity, 0);
    this.discountAmount  = (this.Totalsub * this.purchaseOrder.ProductDiscount)/100;
    this.discountedTotal = this.Totalsub - this.discountAmount;

    const ms = mState.trim().toLowerCase();
    const ws = wState.trim().toLowerCase();
    if (ms === ws || ms.includes(ws) || ws.includes(ms)) {
      this.sgst = this.discountedTotal * 0.09;
      this.cgst = this.discountedTotal * 0.09;
      this.igst = 0;
    } else {
      this.sgst = 0;
      this.cgst = 0;
      this.igst = this.discountedTotal * 0.18;
    }
    this.totalGrandTotal = this.discountedTotal + this.sgst + this.cgst + this.igst;
  }

  /** Unchanged: paginate rows into chunks */
chunkArray(array: any[]): void {
  this.tableChunks = [];
  this.serialOffset = [];

  const firstChunkSize = 20;
  const nextChunkSize = 30;

  if (array.length > 0) {
    this.tableChunks.push(array.slice(0, firstChunkSize));
    this.serialOffset.push(0);

    let start = firstChunkSize;
    while (start < array.length) {
      this.tableChunks.push(array.slice(start, start + nextChunkSize));
      this.serialOffset.push(start);
      start += nextChunkSize;
    }
  }
}

  /** Unchanged: your multi-page PDF logic */
 printPurchaseOrder(): void {
  const fullId = 'purchase-order';
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const chunkCount = this.tableChunks.length || 1;  // fallback to 1 chunk
  let currentChunk = 0;

  const renderChunk = () => {
    const fullContent = document.getElementById(fullId);
    if (!fullContent) return;

    const fullClone = fullContent.cloneNode(true) as HTMLElement;

    // Hide all rows except for the current chunk
    const tableBody = fullClone.querySelector('p-table');
    const rows = fullClone.querySelectorAll('tbody tr');

    // Show all rows if chunking not enabled
    if (this.tableChunks.length > 0) {
      rows.forEach((row, i) => {
        const start = this.serialOffset[currentChunk];
        const end = start + this.tableChunks[currentChunk].length;
        if (i < start || i >= end) {
          (row as HTMLElement).style.display = 'none';
        }
      });
    }

    // Remove the page-header-content on next pages
    if (currentChunk > 0) {
      const headerContent = fullClone.querySelector('.page-header-content');
      if (headerContent) headerContent.remove();
    }

    // Copy styles
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((tag) => {
      fullClone.appendChild(tag.cloneNode(true));
    });

    // Temp container to render DOM off-screen
    const tempWrapper = document.createElement('div');
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.top = '-10000px';
    tempWrapper.style.left = '-10000px';
    tempWrapper.style.width = '1000px';
    tempWrapper.style.zIndex = '-9999';
    tempWrapper.style.opacity = '0';
    tempWrapper.appendChild(fullClone);
    document.body.appendChild(tempWrapper);

    html2canvas(fullClone, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (currentChunk > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

      document.body.removeChild(tempWrapper);
      currentChunk++;

      if (currentChunk < chunkCount) {
        renderChunk(); // Process next chunk
      } else {
        const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
        const poNumber = this.purchaseOrder.poNumber || 'no-number';
        pdf.save(`PO_${poDate}_${poNumber}.pdf`);
      }
    });
  };

  renderChunk();
}


  navigateFun() {
    this.location.back();
  }

  
}