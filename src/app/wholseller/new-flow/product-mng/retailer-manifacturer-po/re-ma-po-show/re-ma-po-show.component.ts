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
    selector: 'app-re-ma-po-show',
    standalone: true,
    imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
    templateUrl: './re-ma-po-show.component.html',
    styleUrl: './re-ma-po-show.component.scss'
  })
  export class ReMaPoShowComponent {
    distributorId = '';
  distributorId2 = '';
  purchaseOrder: any = {
    supplierName: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    supplierPAN: '',
    supplierEmail: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    buyerPAN: '',
    buyerEmail: '',
    logoUrl: '',
    poDate: '',
    poNumber: '',
    products: [],
    ProductDiscount: 0,
  };

  // Totals
  Totalsub = 0;
  discountAmount = 0;
  sgst = 0;
  cgst = 0;
  igst = 0;
  totalGrandTotal = 0;

  responseData: any;

    constructor(
      public authService: AuthService,
      private router: Router,
      private communicationService: CommunicationService,
      private route: ActivatedRoute,
      private location: Location
      
    ) 
    {
    }

     ngOnInit(): void {
    this.distributorId  = this.route.snapshot.queryParamMap.get('memail') ?? '';
    this.distributorId2 = this.route.snapshot.queryParamMap.get('wemail') ?? '';
    this.getAllProducts();
  }

     getAllProducts(): void {
    const url = `po-wholesaler-to-manufacture/generate-po-data-to-manufacturer/${this.distributorId2}/${this.distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res.data;
        const d = this.responseData;

        // Header info
        this.purchaseOrder = {
          supplierName:     d.manufacturer.companyName,
          supplierAddress:  d.manufacturer.address,
          supplierContact:  d.manufacturer.mobNumber,
          supplierGSTIN:    d.manufacturer.GSTIN || 'N/A',
          supplierPAN:      d.manufacturer.PAN ?? d.manufacturer.GSTIN?.substring(2,12) ?? 'N/A',
          supplierEmail:    d.manufacturer.email,

          buyerName:        d.wholesaler.companyName,
          buyerAddress:     `${d.wholesaler.address}, ${d.wholesaler.pinCode} - ${d.wholesaler.state}`,
          buyerPhone:       d.wholesaler.mobNumber,
          buyerGSTIN:       d.wholesaler.GSTIN || 'N/A',
          buyerPAN:         d.wholesaler.PAN ?? d.wholesaler.GSTIN?.substring(2,12) ?? 'N/A',
          buyerEmail:       d.wholesaler.email,

          logoUrl:          d.wholesaler.profileImg,
          poDate:           new Date().toLocaleDateString(),
          poNumber:         d.poNumber,
          products:         Array.isArray(d.set) ? d.set : [],
          ProductDiscount:  parseFloat(d.wholesaler.productDiscount || '0'),
        };

        // Calculate subtotal
        const items = this.purchaseOrder.products;
        this.Totalsub = items.reduce((sum:any, p:any) => 
          sum + (p.totalQuantity * parseFloat(p.manufacturerPrice)), 0
        );

        // Calculate discount & post-discount total
        this.discountAmount = (this.Totalsub * this.purchaseOrder.ProductDiscount) / 100;
        const discountedSub = this.Totalsub - this.discountAmount;

        // Choose SGST/CGST or IGST
        const st1 = d.manufacturer.state?.trim().toLowerCase();
        const st2 = d.wholesaler.state?.trim().toLowerCase();
        if (st1 && st2 && st1 === st2) {
          this.sgst = (discountedSub * 9) / 100;
          this.cgst = (discountedSub * 9) / 100;
          this.igst = 0;
        } else {
          this.sgst = 0;
          this.cgst = 0;
          this.igst = (discountedSub * 18) / 100;
        }

        // Grand total
        this.totalGrandTotal = discountedSub + this.sgst + this.cgst + this.igst;
      },
      (err) => {
        console.error('Error fetching PO data', err);
      }
    );
  }

    addpo(): void {
  // use the full response data as payload
  const payload = { ...this.responseData };

  // strip out mongoose internals if you want
  delete payload.__v;
  delete payload._id;
  delete payload.productId;

  this.authService
    .post('po-wholesaler-to-manufacture', payload)
    .subscribe(
      () =>{
      this.communicationService.customSuccess('PO successfully generated for manufacturer');
      this.navigateFun();
      },
      (error) => {
        this.communicationService.customError1(error.error.message)
      }
    );
}


  

  printPO(): void {
    const data = document.getElementById('purchase-order');
    if (data) {
      html2canvas(data, {
        scale: 3,  // Adjust scale for better quality
        useCORS: true,
      }).then((canvas) => {
        const imgWidth = 208;  // A4 page width in mm
        const pageHeight = 295;  // A4 page height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');  // Create new PDF
        const margin = 10;  // Margin for PDF
        let position = margin;

        // Add first page
        pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
        heightLeft -= pageHeight;

        // Loop over content to add remaining pages if content exceeds one page
        while (heightLeft > 0) {
          pdf.addPage();  // Add new page
          position = margin - heightLeft;  // Position for the next page
          pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
          heightLeft -= pageHeight;
        }
        const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
        const poNumber = this.purchaseOrder.poNumber || 'no-number';
        pdf.save(`PO_${poDate}_${poNumber}.pdf`);
      }).catch((error) => {
        console.error("Error generating PDF:", error);
      });
    } else {
      console.error("Element with id 'purchase-order' not found.");
    }
  }

  navigateFun() {
    this.location.back();
  }

  
  }
