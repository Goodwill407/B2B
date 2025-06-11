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
  selector: 'app-view-place-order-po',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
  templateUrl: './view-place-order-po.component.html',
  styleUrl: './view-place-order-po.component.scss'
})
export class ViewPlaceOrderPoComponent {
  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
    orderNo: 'PO123',
    orderDate: new Date().toLocaleDateString(),
    deliveryDate: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    products: [],
    totalAmount: 0,
    totalInWords: '',
    ProductDiscount: '',
  };

  mergedProducts: any[] = [];
  sgst: any
  igst: any
  cgst: any
  responseData: any; // New variable to store response data
  distributorId: string = '';
  distributorId2: string = '';
  pono: string = '';
  products: any[] = [];
  userProfile: any;
  filteredData: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;

  discountAmount: number = 0;
  id: any;
  discountedTotal:number  = 0;

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
    this.distributorId = this.route.snapshot.queryParamMap.get('memail') ?? '';
    this.distributorId2 = this.route.snapshot.queryParamMap.get('wemail') ?? '';
    this.id = this.route.snapshot.queryParamMap.get('id')?? '';
    this.pono = this.route.snapshot.queryParamMap.get('poNumber') ?? '';
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts();
  }

  getAllProducts() {
    const id = this.route.snapshot.queryParamMap.get('id') || '';
    this.authService.get(`po-wholesaler-to-manufacture/${id}`)
      .subscribe((res: any) => {
        this.responseData = res;

        // 1. Seed purchaseOrder fields
        this.purchaseOrder = {
          // supplier = manufacturer
          supplierName:    res.manufacturer.companyName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.pinCode} - ${res.manufacturer.state}`,
          supplierContact: res.manufacturer.mobNumber,
          supplierEmail:   res.manufacturer.email,
          supplierGSTIN:   res.manufacturer.GSTIN || '',
          supplierPAN:     res.manufacturer.GSTIN?.substring(2, 12) || '',

          // buyer = wholesaler
          buyerName:    res.wholesaler.companyName,
          buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.pinCode} - ${res.wholesaler.state}`,
          buyerPhone:   res.wholesaler.mobNumber,
          buyerEmail:   res.wholesaler.email,
          buyerGSTIN:   res.wholesaler.GSTIN || '',
          buyerPAN:     res.wholesaler.GSTIN?.substring(2, 12) || '',

          logoUrl: res.wholesaler.profileImg,
          poDate: new Date(res.wholesalerPODateCreated).toLocaleDateString(),
          poNumber: res.poNumber,
          ProductDiscount: parseFloat(res.wholesaler.productDiscount || '0'),
        };

        // 2. Build a clean display array
        const displayItems = res.set.map((item: any) => ({
          designNumber: item.designNumber,
          colourName:   item.colourName,
          size:         item.size,
          price:        parseFloat(item.price) || 0,
          quantity:     item.totalQuantity || 0,
          gender:       item.gender,
          clothing:     item.clothing 
        }));

        // 3. Chunk for pagination in table and recalc totals
        this.chunkArray(displayItems);
        this.calculateTotalsFromRawData(displayItems);
      },
      err => console.error('Error fetching PO:', err));
  }

  /** 
   * Calculate subtotal, discount, GST breakdown and grand total 
   * based on an array of { price, quantity } items 
   */
  calculateTotalsFromRawData(items: { price: number; quantity: number }[]) {
    // Subtotal
    const sub = items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );
    this.Totalsub = sub;

    // Discount
    const discPct = this.purchaseOrder.ProductDiscount || 0;
    this.discountAmount = (sub * discPct) / 100;
    this.discountedTotal = sub - this.discountAmount;

    // GST
    const wState = this.responseData.manufacturer.state?.trim().toLowerCase();
    const rState = this.responseData.wholesaler.state?.trim().toLowerCase();
    if (wState && rState && wState === rState) {
      this.sgst = (this.discountedTotal * 9) / 100;
      this.cgst = (this.discountedTotal * 9) / 100;
      this.igst = 0;
    } else {
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (this.discountedTotal * 18) / 100;
    }

    this.totalGrandTotal = +(
      this.discountedTotal +
      this.sgst +
      this.cgst +
      this.igst
    ).toFixed(2);
  }
 
  flattenProductData(productSet: any[]): any[] {
    const flatList: any[] = [];

    // Iterate through each product in the set
    productSet.forEach((product) => {
        const designKey = product.designNumber; // Assuming each product has a designNumber

        // Check if we already have a row for this designNumber + colourName
        let existingRow = flatList.find(row => row.designNumber === designKey && row.colourName === product.colourName);

        // If no existing row, create a new one
        if (!existingRow) {
            existingRow = {
                designNumber: product.designNumber,
                colourName: product.colourName,
                colourImage: product.colourImage,
                colour: product.colour,
                quantities: {},
                totalPrice: 0
            };
            flatList.push(existingRow);
        }

        // Update quantities for this specific size
        if (product.size && product.quantity) {
            existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
            existingRow.totalPrice += product.quantity * parseFloat(product.price); // Assuming price is a string
        }
    });

    return flatList;
}

tableChunks: any[][] = [];
serialOffset: number[] = [];

 /** Chunk into 20 items on first page, 30 on subsequent pages */
chunkArray(array: any[]): void {
  this.tableChunks = [];
  this.serialOffset = [];

  const firstPage = 20; // items on first page
  const restPages = 30; // items on subsequent pages

  if (array.length <= firstPage) {
    this.tableChunks.push(array);
    this.serialOffset.push(0);
  } else {
    this.tableChunks.push(array.slice(0, firstPage));
    this.serialOffset.push(0);

    let start = firstPage;
    while (start < array.length) {
      this.tableChunks.push(array.slice(start, start + restPages));
      this.serialOffset.push(start);
      start += restPages;
    }
  }
}


printPO(): void {
  const fullId = 'purchase-order';
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const chunkCount = this.tableChunks.length;
  let currentChunk = 0;

  const renderChunk = () => {
    const fullContent = document.getElementById(fullId);
    if (!fullContent) return;

    const fullClone = fullContent.cloneNode(true) as HTMLElement;

    // ✅ Hide all table chunks except current one
    const chunks = fullClone.querySelectorAll('.table-chunk');
    chunks.forEach((div, i) => {
      (div as HTMLElement).style.display = i === currentChunk ? 'block' : 'none';
    });

    // ✅ Remove the header on all pages after the first
    if (currentChunk > 0) {
      const header = fullClone.querySelector('#purchase-header');
      if (header) header.remove();
    }

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
        renderChunk();
      } else {
        pdf.save('purchase-order.pdf');
      }
    });
  };

  renderChunk();
}

navigateFun(){
  this.location.back();
}
  
}
