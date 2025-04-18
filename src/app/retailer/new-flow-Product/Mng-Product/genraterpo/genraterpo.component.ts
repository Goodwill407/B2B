import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-genraterpo',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule],
  templateUrl: './genraterpo.component.html',
  styleUrl: './genraterpo.component.scss',
})
export class GenraterpoComponent {
  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
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
  };

  mergedProducts: any[] = [];

  responseData: any; // New variable to store response data
  distributorId: string;
  products: any[] = [];
  userProfile: any;
  filteredData: any;
  ProductDiscount: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;
  dicountprice: number = 0;
  sgst: any;
  igst: any;
  cgst: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.distributorId);
  }

  getAllProducts(distributorId: string) {
    const url = `retailer-cart-type2/place-order/products/${distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        // ✅ Ensure the discount is stored correctly in `purchaseOrder`
        const discountValue = res.retailer?.discountDetails?.productDiscount
          ? parseFloat(res.retailer.discountDetails.productDiscount)
          : 0;

        this.purchaseOrder = {
          supplierName:
            res.wholesaler.companyName || 'Company Name Not Provided',
          supplierDetails: res.wholesaler.fullName || 'Full Name Not Provided',
          supplierEmail: res.wholesaler.email || 'Email Not Provided',
          supplierAddress: `${res.wholesaler.address || ''} ${
            res.wholesaler.city || ''
          }   ${res.wholesaler.pinCode || ''} ${res.wholesaler.state || ''}`,
          supplierContact: `${
            res.wholesaler.mobNumber || 'Mobile Number Not Provided'
          }`,
          supplierGSTIN: res.wholesaler.GSTIN || 'GSTIN Not Provided',
          supplierPAN: res.wholesaler.pan || 'PAN Not Provided',
          buyerName: res.retailer.companyName || 'Company Name Not Provided',
          logoUrl: res.retailer.profileImg || 'assets/images/company_logo.jpg',
          buyerAddress: `${res.retailer.address || ''} ${
            res.retailer.city || ''
          }   ${res.retailer.pinCode || ''} ${res.retailer.state || ''}`,
          buyerPhone: res.retailer.mobNumber || 'Mobile Number Not Provided',
          buyerEmail: res.retailer.email || 'Email Not Provided',
          buyerDetails: res.retailer.fullName || 'Full Name Not Provided',
          buyerGSTIN: res.retailer.GSTIN || 'GSTIN Not Provided',
          buyerPAN: res.retailer.pan || 'PAN Not Provided',
          poDate: new Date().toLocaleDateString(),
          poNumber: res.poNumber,
          products: res.set || [],
          ProductDiscount: discountValue, // ✅ Store correctly parsed discount
        };

        if (res.set && Array.isArray(res.set) && res.set.length > 0) {
          this.extractSizesAndPrices(res.set);
          this.mergedProducts = this.processGroupedProducts(res.set);
          this.filteredData = res.set[0];

          if (this.filteredData) {
            this.mergedProducts = this.flattenProductData(res.set);
          }
        } else {
          this.filteredData = null;
          this.mergedProducts = [];
        }
      },
      (error) => {
        console.error('❌ Error fetching products:', error);
      }
    );
  }

  extractSizesAndPrices(productSet: any[]): void {
    const uniqueSizes = new Set<string>();
    this.priceHeaders = {}; // Reset size-price mapping

    productSet.forEach((product) => {
      if (product.size && product.price > 0) {
        uniqueSizes.add(product.size);
        this.priceHeaders[product.size] = product.price;
      }
    });

    this.sizeHeaders = Array.from(uniqueSizes); // Convert Set to Array for the table header
  }

  discountedTotal: number = 0; // Add this property

  processGroupedProducts(productSet: any[]): any[] {
    const groupedByDesignNumber: any = {};
    let totalSub = 0;
    let totalDiscounted = 0;

    // Get discount percentage
    const discountValue = this.purchaseOrder.ProductDiscount
      ? parseFloat(this.purchaseOrder.ProductDiscount)
      : 0;

    // Step 1: Group products by design number
    productSet.forEach((product) => {
      const designKey = product.designNumber;

      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          discountedTotal: 0,
        };
      }

      let existingRow = groupedByDesignNumber[designKey].rows.find(
        (row: any) => row.colourName === product.colourName
      );

      if (!existingRow) {
        existingRow = {
          colourName: product.colourName,
          quantities: {},
          totalPrice: 0,
        };
        groupedByDesignNumber[designKey].rows.push(existingRow);
      }

      existingRow.quantities[product.size] =
        (existingRow.quantities[product.size] || 0) + product.quantity;
      existingRow.totalPrice += product.quantity * parseFloat(product.price);
    });

    // Step 2: Calculate totals
    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce(
        (acc: number, row: any) => acc + this.calculateTotalPrice(row, false), // ✅ Now fetches full price first
        0
      );

      let discountAmount = 0;
      if (discountValue > 0) {
        discountAmount = (group.subTotal * discountValue) / 100;
      }

      group.discountedTotal = group.subTotal - discountAmount;

      totalSub += group.subTotal;
      totalDiscounted += group.discountedTotal;
    });

    this.Totalsub = totalSub;
    this.discountedTotal = totalDiscounted;
    this.calculateGST();

    return Object.values(groupedByDesignNumber);
  }

  calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
    let total = 0;

    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });

    // Extract discount percentage
    const discountValue = this.purchaseOrder.ProductDiscount
      ? parseFloat(this.purchaseOrder.ProductDiscount)
      : 0;

    let discountAmount = 0;
    if (applyDiscount && discountValue > 0) {
      discountAmount = (total * discountValue) / 100;
    }

    const finalPrice = total - discountAmount;

    return applyDiscount ? finalPrice : total; // 🔹 Now returns the correct price!
  }
  calculateGST() {
    const discountedTotal = this.discountedTotal; // Get total after discount
  
    // Extract states from API response
    const retailerState = this.purchaseOrder.buyerAddress.split(' ').pop()?.trim().toLowerCase();
    const wholesalerState = this.purchaseOrder.supplierAddress.split(' ').pop()?.trim().toLowerCase();
  
    console.log(`🏢 Retailer State: ${retailerState}, 🏭 Wholesaler State: ${wholesalerState}`);
  
    if (retailerState && wholesalerState) {
      if (retailerState === wholesalerState) {
        // ✅ Same state → Apply SGST + CGST (9% each)
        this.sgst = (discountedTotal * 9) / 100;
        this.cgst = (discountedTotal * 9) / 100;
        this.igst = 0;
        console.log(`✅ States Match → Applying SGST: ₹${this.sgst}, CGST: ₹${this.cgst}, IGST: ₹${this.igst}`);
      } else {
        // ✅ Different states → Apply IGST (18%)
        this.sgst = 0;
        this.cgst = 0;
        this.igst = (discountedTotal * 18) / 100;
        console.log(`✅ States Do Not Match → Applying IGST: ₹${this.igst}`);
      }
    } else {
      console.warn("⚠️ Could not determine states correctly!");
    }
  
    // ✅ Update Grand Total
    this.totalGrandTotal = discountedTotal + this.sgst + this.cgst + this.igst;
    console.log(`💰 Final Grand Total: ₹${this.totalGrandTotal}`);
  }
  

  calculateDiscountedTotal(subTotal: number): number {
    // Apply discount (for example, 2% in this case)
    const discount = (subTotal * 2) / 100;
    const discountedTotal = subTotal - discount;

    // Store discount for display
    this.dicountprice = discount;

    return discountedTotal;
  }

  calculateGrandTotal(
    subTotal: number,
    discount: number,
    igst: number
  ): number {
    const discountedSubtotal = subTotal - discount;
    const igstAmount = (discountedSubtotal * igst) / 100; // Apply 18% IGST
    return discountedSubtotal + igstAmount;
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some((row) => row.quantities[size] > 0);
  }

  addpo() {
    const cartBody = { ...this.responseData };
    console.log(cartBody);
  
    // Ensure required fields are included
    cartBody.email = this.userProfile?.email || ''; // Ensure email is added
    cartBody.productBy = this.responseData?.productBy || ''; // Ensure productBy is added
  
    // Remove unwanted fields
    delete cartBody.__v;
    delete cartBody._id;
    delete cartBody.productId;
  
    // Debugging: Log the final payload
    console.log('📤 Sending Purchase Order:', cartBody);
  
    // Post the cleaned data to the backend
    this.authService.post('retailer-purchase-order-type2', cartBody).subscribe(
      (res: any) => {
        this.communicationService.customSuccess('Purchase Order Generated Successfully');
      },
      (error) => {
        this.communicationService.customError1(error.error.message);
      }
    );
  }
  
  flattenProductData(productSet: any[]): any[] {
    const flatList: any[] = [];

    // Iterate through each product in the set
    productSet.forEach((product) => {
      const designKey = product.designNumber; // Assuming each product has a designNumber

      // Check if we already have a row for this designNumber + colourName
      let existingRow = flatList.find(
        (row) =>
          row.designNumber === designKey &&
          row.colourName === product.colourName
      );

      // If no existing row, create a new one
      if (!existingRow) {
        existingRow = {
          designNumber: product.designNumber,
          colourName: product.colourName,
          colourImage: product.colourImage,
          colour: product.colour,
          quantities: {},
          totalPrice: 0,
        };
        flatList.push(existingRow);
      }

      // Update quantities for this specific size
      if (product.size && product.quantity) {
        existingRow.quantities[product.size] =
          (existingRow.quantities[product.size] || 0) + product.quantity;
        existingRow.totalPrice += product.quantity * parseFloat(product.price); // Assuming price is a string
      }
    });

    return flatList;
  }

  printPO(): void {
    const data = document.getElementById('purchase-order');
    if (data) {
      html2canvas(data, {
        scale: 3, // Adjust scale for better quality
        useCORS: true,
      })
        .then((canvas) => {
          const imgWidth = 208; // A4 page width in mm
          const pageHeight = 295; // A4 page height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          const contentDataURL = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4'); // Create new PDF
          const margin = 10; // Margin for PDF
          let position = margin;

          // Add first page
          pdf.addImage(
            contentDataURL,
            'PNG',
            margin,
            position,
            imgWidth - 2 * margin,
            imgHeight
          );
          heightLeft -= pageHeight;

          // Loop over content to add remaining pages if content exceeds one page
          while (heightLeft > 0) {
            pdf.addPage(); // Add new page
            position = margin - heightLeft; // Position for the next page
            pdf.addImage(
              contentDataURL,
              'PNG',
              margin,
              position,
              imgWidth - 2 * margin,
              imgHeight
            );
            heightLeft -= pageHeight;
          }

          // Save PDF file
          pdf.save('purchase-order.pdf');
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    } else {
      console.error("Element with id 'purchase-order' not found.");
    }
  }

  navigateFun() {
    this.location.back();
  }

  getOriginalPrice(row: any): number {
    let total = 0;

    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });

    return total; // ✅ Returns the original price before discount
  }
}
