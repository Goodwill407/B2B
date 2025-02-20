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
    selector: 'app-genratepo',
    standalone: true,
    imports: [CommonModule, FormsModule, AccordionModule, TableModule],
    templateUrl: './genratepo.component.html',
    styleUrls: ['./genratepo.component.scss'],
  })
  export class GenratepoComponent implements OnInit {
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
      ProductDiscount:'',
    };

    mergedProducts: any[] = [];
    sgst: any
    igst: any
    cgst: any
    responseData: any; // New variable to store response data
    distributorId: string;
    products: any[] = [];
    userProfile: any;
    filteredData: any;
    sizeHeaders: string[] = [];
    priceHeaders: { [size: string]: number } = {};

    totalGrandTotal: number = 0;
    gst: number = 0;
    Totalsub: number = 0;

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
      const url = `type2-cart/place-order/products/${distributorId}`;
      this.authService.get(url).subscribe(
        (res: any) => {
          console.log('ProductDiscount:', res.wholesaler.ProductDiscount),
          this.responseData = res; // Store the response in responseData
          console.log(res)
          // Update purchaseOrder from the response
          this.purchaseOrder = {
            supplierName: res.manufacturer.companyName,
            supplierDetails: res.manufacturer.fullName,
            supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.city}, ${res.manufacturer.state} - ${res.manufacturer.pinCode}`,
            supplierContact: `${res.manufacturer.mobNumber}`,
            supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
            buyerName: res.wholesaler.companyName,
            logoUrl: res.wholesaler.profileImg,
            buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
            buyerPhone: res.wholesaler.mobNumber,
            buyerEmail: res.wholesaler.email,
            buyerDetails: res.wholesaler.fullName,
            buyerGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
            poDate: new Date().toLocaleDateString(),
            poNumber: res.poNumber,
            products: res.products || [],
            ProductDiscount: res.wholesaler.ProductDiscount !== undefined && res.wholesaler.ProductDiscount !== '' ? parseFloat(res.wholesaler.ProductDiscount) : 0,  // Ensure we handle undefined and empty values properly
          };
          
          

          if (res.set && Array.isArray(res.set) && res.set.length > 0) {
            this.extractSizesAndPrices(res.set); // <-- Ensure this is called
    
            // Process grouped products and update mergedProducts
            this.mergedProducts = this.processGroupedProducts(res.set);
            this.filteredData = res.set[0];
          
        
            // Proceed if filteredData is not empty
            if (this.filteredData) {
                // Flatten the set into mergedProducts
                this.mergedProducts = this.flattenProductData(res.set);  // Pass the entire set array
                
            }
          }
 
         else {
            
            this.filteredData = null;
            this.mergedProducts = [];
        }
        
        
        },
        (error) => {
          
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

    processGroupedProducts(productSet: any[]): any[] {
      const groupedByDesignNumber: any = {};
      let totalGrandTotal = 0;
      let totalSub = 0;
      let totalDiscounted = 0;
      let totalDiscounted2= 0;
    
      // Step 1: Group products by design number
      productSet.forEach((product) => {
        const designKey = product.designNumber;
    
        if (!groupedByDesignNumber[designKey]) {
          groupedByDesignNumber[designKey] = {
            designNumber: product.designNumber,
            rows: [],
            subTotal: 0,
            discountedTotal: 0,
            grandTotal: 0,
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
    
        existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
        existingRow.totalPrice += product.quantity * product.price;
      });
    
      // Step 2: Calculate totals for all products
      Object.values(groupedByDesignNumber).forEach((group: any) => {
        group.subTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, false), 0);
        group.discountedTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, true), 0);
    
        totalSub += group.subTotal;
        totalDiscounted +=group.discountedTotal;
        group.discountedTotal;
        totalDiscounted2 += group.discountedTotal;
      });
    
      // Step 3: Calculate GST based on the total discounted value (not per product)
      this.discountedTotal = totalDiscounted;  // Use final discounted total for all products
      this.calculateGST();  // Calculate GST based on the final discounted total
    
      // Step 4: Calculate the Grand Total for each group
      Object.values(groupedByDesignNumber).forEach((group: any) => {
        group.grandTotal = group.discountedTotal + this.sgst + this.cgst + this.igst;
        totalGrandTotal += group.grandTotal;
      });
    
      // Store the final totals
      this.Totalsub = totalSub;
      this.totalGrandTotal = totalGrandTotal;
      console.log('Subtotal:', totalSub);
      console.log('Total Discounted:', totalDiscounted);  // This should be the final discounted total
      console.log('GST (SGST, CGST, IGST):', this.sgst, this.cgst, this.igst);
      console.log('Grand Total:', this.totalGrandTotal);
      
      return Object.values(groupedByDesignNumber);
    }
    
    
    
    calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
      let total = 0;
    
      // Loop through each size header and calculate the total price
      this.sizeHeaders.forEach((size) => {
        // If there is a quantity for the current size, add to the total
        if (row.quantities[size] > 0) {
          total += row.quantities[size] * (this.priceHeaders[size] || 0);
        }
      });
    
      // Apply the discount if flag is true and discount is greater than 0
      if (applyDiscount && this.purchaseOrder.ProductDiscount > 0) {
        const discount = (total * this.purchaseOrder.ProductDiscount) / 100;
        total -= discount;
      }
    
      // Return the final calculated total price (round to 2 decimal places for consistency)
      return parseFloat(total.toFixed(2));  // Optional: rounds off the value to 2 decimal points
    }
    
    
    
    discountedTotal: number = 0;

    calculateGST() {
      const discountedTotal = this.discountedTotal; // Already discounted total
    
      // Now apply GST calculation logic as before
      const retailerState = this.getStateFromAddress(this.purchaseOrder.buyerAddress);
      const wholesalerState = this.getStateFromAddress(this.purchaseOrder.supplierAddress);
    
      console.log('Retailer State:', retailerState);
      console.log('Wholesaler State:', wholesalerState);
    
      if (retailerState && wholesalerState) {
        if (retailerState !== wholesalerState) {
          // States don't match, apply IGST
          const gstRate = 18; // IGST
          this.sgst = 0;
          this.cgst = 0;
          this.igst = (discountedTotal * gstRate) / 100;
          console.log('Applying IGST:', this.igst);
        } else {
          // States match, apply SGST and CGST
          const gstRate = 9; // SGST and CGST
          this.sgst = (discountedTotal * gstRate) / 100;
          this.cgst = (discountedTotal * gstRate) / 100;
          this.igst = 0;
          console.log('Applying SGST and CGST:', this.sgst, this.cgst);
        }
      } else {
        console.error('Invalid state information. Cannot calculate GST.');
        this.sgst = 0;
        this.cgst = 0;
        this.igst = 0;
      }
    
      console.log('SGST:', this.sgst);
      console.log('CGST:', this.cgst);
      console.log('IGST:', this.igst);
    
      // Calculate Grand Total
      this.totalGrandTotal = discountedTotal + this.sgst + this.cgst + this.igst;
      console.log('Grand Total:', this.totalGrandTotal);
    }
    
    
    getStateFromAddress(address: string): string | null {
      if (!address) {
        console.error('Address is empty or invalid:', address);
        return null;  // Address is missing or invalid
      }
    
      console.log('Address:', address);  // Debug the address string
    
      // Split the address by commas to separate the components
      const addressParts = address.split(',');
    
      console.log('Address Parts:', addressParts);  // Log the parts for debugging
    
      // If there are at least two parts, assume the second to last part is the state
      if (addressParts.length >= 2) {
        const state = addressParts[addressParts.length - 1]?.trim();  // Second last part should be the state
    
        // Ensure that the state is a valid non-numeric string
        if (state && isNaN(parseInt(state))) {
          return state;
        } else {
          console.error('Invalid state detected:', state);
        }
      }
    
      // If state is missing or invalid, return null
      return null;
    } 
    dicountprice: number = 0;
    calculateDiscountedTotal(subTotal: number): number {
      // Apply discount (for example, 2% in this case)
      const discount = (subTotal * 2) / 100;
      const discountedTotal = subTotal - discount;
    
      // Store discount for display
      this.dicountprice = discount;  
    
      return discountedTotal;
    }
    

    calculateGrandTotal(subTotal: number, discount: number, igst: number): number {
      const discountedSubtotal = subTotal - discount;
      const igstAmount = (discountedSubtotal * igst) / 100;  // Apply 18% IGST
      return discountedSubtotal + igstAmount;
    }

    isSizeAvailable(rows: any[], size: string): boolean {
      return rows.some((row) => row.quantities[size] > 0);
    }
    addpo() {
      const cartBody = { ...this.responseData }; // Create a copy of the response data
    
      // Remove unwanted fields
      delete cartBody.__v;
      delete cartBody._id;
      delete cartBody.productId;
    
      // Post the cleaned data to the backend
      this.authService.post('type2-purchaseorder', cartBody).subscribe(
        (res: any) => {
          this.communicationService.customSuccess('Purchace Order Genrated Succesfully');
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
  
  printPurchaseOrder(): void {
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
  
        // Save PDF file
        pdf.save('purchase-order.pdf');
      }).catch((error) => {
        console.error("Error generating PDF:", error);
      });
    } else {
      console.error("Element with id 'purchase-order' not found.");
    }
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

        // Save PDF file
        pdf.save('purchase-order.pdf');
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
