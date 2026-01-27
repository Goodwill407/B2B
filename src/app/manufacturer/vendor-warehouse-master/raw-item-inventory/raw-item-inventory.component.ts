import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, CommunicationService } from '@core'; 

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple'; 

// PDF Generation Imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-raw-item-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    TooltipModule,
    TagModule,
    RippleModule,
    InputTextareaModule
  ],
  templateUrl: './raw-item-inventory.component.html',
  styleUrl: './raw-item-inventory.component.scss'
})
export class RawItemInventoryComponent implements OnInit {

  // Data
  inventoryList: any[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  manufacturerEmail: string = '';

  // Pagination defaults
  first: number = 0;
  rows: number = 10;
  
  // Row Expansion State
  expandedRows: { [key: string]: boolean } = {};

  // Dialogs
  showDetailsDialog: boolean = false;
  showStockDialog: boolean = false;
  
  selectedItem: any = null; 
  stockForm!: FormGroup;

  // Stock Update Options
  changeTypes = [
    { label: 'Add Stock', value: 'stock_added' },
    { label: 'Remove Stock', value: 'stock_removed' },
  ];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.manufacturerEmail = currentUser?.email || '';

    this.initStockForm();
  }

  initStockForm() {
    this.stockForm = this.fb.group({
      quantity: [null, [Validators.required, Validators.min(1)]],
      changeType: ['stock_added', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  // --- API: Load List ---
  loadInventoryData(event: any) {
    this.loading = true;
    
    const first = event.first || 0;
    const rows = event.rows || 10;
    const page = (first / rows) + 1;

    let params = new HttpParams()
      .set('manufacturerEmail', this.manufacturerEmail)
      .set('page', page.toString())
      .set('limit', rows.toString());

    this.authService.get(`manufacture-raw-material-inventory-logs?${params.toString()}`).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.inventoryList = data.results || [];
        this.totalRecords = data.totalResults || 0;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

// --- PDF Download Method - ENHANCED WITH VENDOR & WAREHOUSE SIDE BY SIDE ---
downloadItemPdf(item: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const leftColX = 14;
  const rightColX = 110; // Positioned for side-by-side layout
  const colWidth = 85;

  // -- Header --
  doc.setFontSize(18);
  doc.setTextColor(0, 32, 128); // Dark blue
  doc.text('Inventory Item Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);

  let yPos = 35;
  
  // -- Item Details Section --
  doc.setFontSize(12);
  doc.setTextColor(0, 32, 128);
  doc.setFont('helvetica', 'bold');
  doc.text(`${item.itemName}`, 14, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Code: ${item.code} | Category: ${item.categoryName} / ${item.subcategoryName}`, 14, yPos);
  yPos += 6;
  doc.text(`Current Stock: ${item.currentStock} ${item.stockUnit || ''} | Min Level: ${item.minimumStockLevel}`, 14, yPos);
  yPos += 12;

  // -- VENDOR & WAREHOUSE SIDE BY SIDE --
  
  // Left Column: VENDOR DETAILS
  doc.setFontSize(11);
  doc.setTextColor(0, 32, 128);
  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Details', leftColX, yPos);
  
  // Right Column: WAREHOUSE DETAILS
  doc.text('Warehouse Details', rightColX, yPos);
  
  yPos += 6;

  doc.setFontSize(8.5);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

  // Vendor Details - Left Column
  if (item.vendorDetails) {
    const vendorLines = [
      `Name: ${item.vendorDetails.vendorName || 'N/A'}`,
      `Company: ${item.vendorDetails.companyName || 'N/A'}`,
      `Contact: ${item.vendorDetails.contactNumber || 'N/A'}`,
      `Email: ${item.vendorDetails.vendorEmail || 'N/A'}`,
      `GST: ${item.vendorDetails.gstNumber || 'N/A'}`,
      `PAN: ${item.vendorDetails.panNumber || 'N/A'}`,
      `Address: ${item.vendorDetails.address?.line1 || ''}`,
      `${item.vendorDetails.address?.line2 || ''}`,
      `${item.vendorDetails.address?.city || ''}, ${item.vendorDetails.address?.state || ''} ${item.vendorDetails.address?.pinCode || ''}`
    ];

    let vendorYPos = yPos;
    vendorLines.forEach(line => {
      // Use splitTextToSize to handle wrapping within the column width
      const wrappedText = doc.splitTextToSize(line, colWidth - 2);
      doc.text(wrappedText, leftColX, vendorYPos);
      vendorYPos += wrappedText.length > 1 ? 4 : 4;
    });
  } else {
    doc.text('No vendor details', leftColX, yPos);
  }

  // Warehouse Details - Right Column
  if (item.warehouseDetails) {
    const warehouseLines = [
      `Name: ${item.warehouseDetails.warehouseName || 'N/A'}`,
      `Code: ${item.warehouseDetails.code || 'N/A'}`,
      `Capacity: ${item.warehouseDetails.storageCapacity || 'N/A'}`,
      `Contact: ${item.warehouseDetails.contactNumber || 'N/A'}`,
      `Email: ${item.warehouseDetails.email || 'N/A'}`,
      `Primary: ${item.warehouseDetails.isPrimary ? 'Yes' : 'No'}`,
      `Address: ${item.warehouseDetails.address?.line1 || ''}`,
      `${item.warehouseDetails.address?.line2 || ''}`,
      `${item.warehouseDetails.address?.city || ''}, ${item.warehouseDetails.address?.state || ''} ${item.warehouseDetails.address?.pinCode || ''}`
    ];

    let warehouseYPos = yPos;
    warehouseLines.forEach(line => {
      const wrappedText = doc.splitTextToSize(line, colWidth - 2);
      doc.text(wrappedText, rightColX, warehouseYPos);
      warehouseYPos += wrappedText.length > 1 ? 4 : 4;
    });
  } else {
    doc.text('No warehouse details', rightColX, yPos);
  }

  yPos += 50; // Move down after vendor/warehouse section

  // -- Rack/Row Mappings (if available) --
  if (item.rackRowMappings && item.rackRowMappings.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(0, 32, 128);
    doc.setFont('helvetica', 'bold');
    doc.text('Storage Locations', 14, yPos);
    yPos += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    item.rackRowMappings.forEach((rack: any) => {
      doc.text(`Rack: ${rack.rackName} | Row: ${rack.rowName}`, 14, yPos);
      yPos += 4;
    });

    yPos += 3;
  }

  // Check if we need a new page for the table
  if (yPos > 200) {
    doc.addPage();
    yPos = 14;
  }

  // -- Inventory Logs Table --
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 32, 128);
  doc.text('Stock History Logs', 14, yPos);

  // Prepare Table Data - FIXED DOUBLE MINUS ISSUE
  const tableBody = (item.inventoryLogs || []).map((log: any) => {
    const change = log.updatedStock - log.previousStock;
    const changeSign = change >= 0 ? '+' : ''; // Don't add minus, it's already in change
    
    return [
      new Date(log.updatedAt).toLocaleDateString(),
      log.changeType === 'stock_added' ? 'Added' : 'Removed',
      log.reason || '-',
      log.previousStock.toString(),
      `${changeSign}${change}`, // FIX: This will be like "+33", "-2", "+123" without double minus
      log.updatedStock.toString(),
      log.updatedBy
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push(['No logs available', '-', '-', '-', '-', '-', '-']);
  }

   autoTable(doc, {
      startY: yPos + 8,
      head: [['Date', 'Type', 'Reason', 'Prev', 'Change', 'New', 'User']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [0, 32, 128], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 24 },
        2: { cellWidth: 35 },
        4: { halign: 'center' }
      }
    });

  // Save
  doc.save(`${item.code}_inventory_report.pdf`);
}

  // --- Actions ---

  openDetails(item: any) {
    this.selectedItem = item;
    this.showDetailsDialog = true;
  }

  openStockUpdate(item: any) {
    this.selectedItem = item;
    this.stockForm.reset({
      quantity: null,
      changeType: 'stock_added',
      reason: ''
    });
    this.showStockDialog = true;
  }

  submitStockUpdate() {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    if (!this.selectedItem) return;

    this.loading = true;
    const formVal = this.stockForm.value;

    const payload = {
      masterItemId: this.selectedItem.masterItemId, 
      quantity: formVal.quantity,
      changeType: formVal.changeType,
      reason: formVal.reason,
      updatedBy: this.manufacturerEmail
    };

    const inventoryId = this.selectedItem.id || this.selectedItem._id;

    this.authService.patchpimage(`manufacture-raw-material-inventory-logs/${inventoryId}`, payload).subscribe({
      next: () => {
        this.communicationService.customSuccess('Stock updated successfully');
        this.showStockDialog = false;
        this.loadInventoryData({ first: this.first, rows: this.rows }); 
        this.loading = false;
      },
      error: (err) => {
        this.communicationService.customError1(err.error?.message || 'Failed to update stock');
        this.loading = false;
      }
    });
  }
}
