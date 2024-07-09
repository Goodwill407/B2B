import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarVerticalPosition, MatSnackBarHorizontalPosition } from "@angular/material/snack-bar";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
@Injectable({
    providedIn: 'root'
})
export class CommunicationService {

    constructor(private snackBar: MatSnackBar) { }
    exportToExcel(data: any[], fileName: string, sheetName: string): void {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    exportToCSV(data: any[], fileName: string): void {
        const csvContent = this.convertArrayToCSV(data);
        this.downloadFile(csvContent, `${fileName}.csv`, 'text/csv;charset=utf-8');
    }

    private convertArrayToCSV(array: any[]): string {
        const header = Object.keys(array[0]).join(',');
        const rows = array.map((row) => Object.values(row).join(','));
        return `${header}\n${rows.join('\n')}`;
    }

    private downloadFile(content: any, fileName: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        saveAs(blob, fileName);
    }

    showNotification(
        colorName: string,
        text: string,
        placementFrom: MatSnackBarVerticalPosition,
        placementAlign: MatSnackBarHorizontalPosition
    ) {
        this.snackBar.open(text, '', {
            duration: 2000,
            verticalPosition: placementFrom,
            horizontalPosition: placementAlign,
            panelClass: colorName,
        });
    }

    downloadPDF(data:any) {
        if (data) {
          html2canvas(data).then(canvas => {
            const imgWidth = 208; // A4 size width in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const contentDataURL = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // portrait, mm, A4 size page
            const position = 0;
            pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
            pdf.save('report.pdf'); // Generated PDF
          });
        }
      }
}