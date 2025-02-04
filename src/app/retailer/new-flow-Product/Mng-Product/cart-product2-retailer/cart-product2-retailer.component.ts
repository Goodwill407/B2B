import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
interface PriceHeaders {
  [wholesaler: string]: {
      [designNumber: string]: {
          [size: string]: number;
      };
  };
}


// Interface Definitions
interface ProductSet {
  productBy: string;
  colourName: string;
  colourImage: string;
  colour: string;
  quantity: number;
  size: string;
  price: number;
  designNumber: string;
}

interface Wholesaler {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  profileImg: string;
  GSTIN: string;
}

interface Product {
  _id: string;
  set: ProductSet[];
  email: string;
  wholesalerEmail: string;
  productBy: string;
  cartAddedDate: string;
  wholesaler: Wholesaler;
  groupedProducts?: any[];
}

@Component({
  selector: 'app-cart-product2-retailer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    AccordionModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './cart-product2-retailer.component.html',
  styleUrls: ['./cart-product2-retailer.component.scss']
})
export class CartProduct2RetailerComponent implements OnInit {
  products: Product[] = [];
  userProfile: any;
  sizeHeaders: string[] = [];
  priceHeaders: PriceHeaders = {};
  wholesalerTotals: {
    [wholesaler: string]: {
      subtotal: number;
      gst: number;
      grandTotal: number;
      sgst?: number; // Optional property for SGST
      cgst?: number; // Optional property for CGST
      igst?: number; // Optional property for IGST
    };
  } = {};

  bottomAdImage: string[] = ['assets/images/adv/ads2.jpg', 'assets/images/adv/ads.jpg'];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
  }

  getAllProducts(email: string): void {
    const url = `retailer-cart-type2?email=${email}`;
    this.authService.get(url).subscribe(
      (res: { results: Product[] }) => {
        if (res?.results) {
          this.products = res.results.map((product: Product) => {
            product.groupedProducts = this.processGroupedProducts(product.set, product.wholesaler.fullName); // Group products
            return product;
          });
          this.extractSizesAndPrices(this.products); // Extract sizes and prices
        }
      },
      (error) => // console.error(error)
    );
  }

extractSizesAndPrices(products: Product[]): void {
    const sizeHeadersSet = new Set<string>();
    const priceHeaders: {
        [wholesaler: string]: {
            [designNumber: string]: {
                [size: string]: number;
            };
        };
    } = {};

    products.forEach((product) => {
        const wholesaler = product.wholesaler?.fullName;
        if (!wholesaler) {
            // console.error('Wholesaler missing for product:', product);
            return;
        }

        if (!priceHeaders[wholesaler]) {
            priceHeaders[wholesaler] = {};
        }

        product.set.forEach((productSet) => {
            const { size, price, designNumber } = productSet;

            sizeHeadersSet.add(size); // Collect all unique sizes

            if (!priceHeaders[wholesaler][designNumber]) {
                priceHeaders[wholesaler][designNumber] = {};
            }

            priceHeaders[wholesaler][designNumber][size] = parseFloat(price.toString());
        });
    });

    this.sizeHeaders = Array.from(sizeHeadersSet).sort(); // Sorted sizes for consistent display
    this.priceHeaders = priceHeaders;
}



processGroupedProducts(productSet: ProductSet[], wholesalerName: string): any[] {
  const grouped: any = {};
  let wholesalerSubtotal = 0;

  productSet.forEach((product) => {
      const key = product.designNumber;
      if (!grouped[key]) {
          grouped[key] = { designNumber: key, rows: [], subTotal: 0 };
      }

      let row = grouped[key].rows.find((r: any) => r.colourName === product.colourName);
      if (!row) {
          row = { colourName: product.colourName, quantities: {}, totalPrice: 0 };
          grouped[key].rows.push(row);
      }

      row.quantities[product.size] = (row.quantities[product.size] || 0) + product.quantity;
      row.totalPrice += product.price * product.quantity;

      wholesalerSubtotal += product.price * product.quantity;
  });

  // Determine GST based on state matching
  const isStateMatch = this.isStateMatch(wholesalerName);
  const gstDetails = this.calculateGSTDetails(wholesalerSubtotal, isStateMatch);

  // Save totals for this wholesaler
  this.wholesalerTotals[wholesalerName] = {
      subtotal: wholesalerSubtotal,
      ...gstDetails // Spread GST and total details
  };

  return Object.values(grouped);
}

isStateMatch(wholesalerName: string): boolean {
  const wholesalerState = this.products.find(p => p.wholesaler.fullName === wholesalerName)?.wholesaler.state;
  return wholesalerState === this.userProfile.state; // Compare wholesaler's state with retailer's state
}

calculateGSTDetails(subtotal: number, isStateMatch: boolean) {
  if (isStateMatch) {
      const sgst = parseFloat((subtotal * 0.09).toFixed(2)); // 9% SGST
      const cgst = parseFloat((subtotal * 0.09).toFixed(2)); // 9% CGST
      return {
          sgst,
          cgst,
          gst: sgst + cgst,
          grandTotal: parseFloat((subtotal + sgst + cgst).toFixed(2))
      };
  } else {
      const igst = parseFloat((subtotal * 0.18).toFixed(2)); // 18% IGST
      return {
          igst,
          gst: igst,
          grandTotal: parseFloat((subtotal + igst).toFixed(2))
      };
  }
}


  placeOrder(prod: Product): void {
    this.router.navigate(['/retailer/new/poretailor', prod._id]);
  }
}
