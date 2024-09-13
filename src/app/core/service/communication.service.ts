import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarVerticalPosition, MatSnackBarHorizontalPosition } from "@angular/material/snack-bar";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { state } from "@angular/animations";
import { AuthService } from "./auth.service";
import Swal from 'sweetalert2';
@Injectable({
    providedIn: 'root'
})
export class CommunicationService {

    constructor(private snackBar: MatSnackBar, private authService:AuthService) { }
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

    downloadPDF(data: any) {
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
    openImg(path: string) {
      window.open(this.authService.cdnPath + path, '_blank');
    }

    allState(){
       const states = [
      {
        "name": "Andhra Pradesh",
        "cities": ["Visakhapatnam", "Vijayawada", "Guntur"]
      },
      {
        "name": "Arunachal Pradesh",
        "cities": ["Itanagar", "Tawang", "Pasighat"]
      },
      {
        "name": "Assam",
        "cities": ["Guwahati", "Dibrugarh", "Silchar"]
      },
      {
        "name": "Bihar",
        "cities": ["Patna", "Gaya", "Bhagalpur"]
      },
      {
        "name": "Chhattisgarh",
        "cities": ["Raipur", "Bilaspur", "Durg"]
      },
      {
        "name": "Goa",
        "cities": ["Panaji", "Margao", "Vasco da Gama"]
      },
      {
        "name": "Gujarat",
        "cities": ["Ahmedabad", "Surat", "Vadodara"]
      },
      {
        "name": "Haryana",
        "cities": ["Chandigarh", "Gurugram", "Faridabad"]
      },
      {
        "name": "Himachal Pradesh",
        "cities": ["Shimla", "Manali", "Dharamshala"]
      },
      {
        "name": "Jharkhand",
        "cities": ["Ranchi", "Jamshedpur", "Dhanbad"]
      },
      {
        "name": "Karnataka",
        "cities": ["Bengaluru", "Mysuru", "Mangalore"]
      },
      {
        "name": "Kerala",
        "cities": ["Thiruvananthapuram", "Kochi", "Kozhikode"]
      },
      {
        "name": "Madhya Pradesh",
        "cities": ["Bhopal", "Indore", "Gwalior"]
      },
      {
        "name": "Maharashtra",
        "cities": ["Mumbai", "Pune", "Nagpur"]
      },
      {
        "name": "Manipur",
        "cities": ["Imphal", "Bishnupur", "Thoubal"]
      },
      {
        "name": "Meghalaya",
        "cities": ["Shillong", "Tura", "Nongstoin"]
      },
      {
        "name": "Mizoram",
        "cities": ["Aizawl", "Lunglei", "Champhai"]
      },
      {
        "name": "Nagaland",
        "cities": ["Kohima", "Dimapur", "Mokokchung"]
      },
      {
        "name": "Odisha",
        "cities": ["Bhubaneswar", "Cuttack", "Rourkela"]
      },
      {
        "name": "Punjab",
        "cities": ["Chandigarh", "Ludhiana", "Amritsar"]
      },
      {
        "name": "Rajasthan",
        "cities": ["Jaipur", "Udaipur", "Jodhpur"]
      },
      {
        "name": "Sikkim",
        "cities": ["Gangtok", "Namchi", "Pelling"]
      },
      {
        "name": "Tamil Nadu",
        "cities": ["Chennai", "Coimbatore", "Madurai"]
      },
      {
        "name": "Telangana",
        "cities": ["Hyderabad", "Warangal", "Nizamabad"]
      },
      {
        "name": "Tripura",
        "cities": ["Agartala", "Dharmanagar", "Udaipur"]
      },
      {
        "name": "Uttar Pradesh",
        "cities": ["Lucknow", "Kanpur", "Varanasi"]
      },
      {
        "name": "Uttarakhand",
        "cities": ["Dehradun", "Haridwar", "Nainital"]
      },
      {
        "name": "West Bengal",
        "cities": ["Kolkata", "Darjeeling", "Siliguri"]
      }
      // Add more states and cities as needed
    ]
        return states;
    }   
    success() {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 8px; font-weight: 500">Added Succesfully</span> <img style="float: right;padding-top: 10px" src="../assets/icons/cross.png">', position: 'bottom', timer: 4000, showCancelButton: false, width: 400, showConfirmButton: false, background: "#E8FFF3", color: "#47BE7D", backdrop: false
      })
    }
  
    delete() {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 8px; font-weight: 500">Delete Succesfully</span> <img style="float: right;padding-top: 10px" src="../assets/icons/cross.png">', position: 'bottom', timer: 4000, showCancelButton: false, width: 400, showConfirmButton: false, background: "#E8FFF3", color: "#47BE7D", backdrop: false
      })
    }
  
    error() {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 10px; font-weight: 500">Something went wrong</span> <i class="bi bi-exclamation" style="font-size: 32px"></i>', position: 'bottom', timer: 4000, showCancelButton: false, width: 400, showConfirmButton: false, background: "#FF4433", color: "#fff", backdrop: false
      })
    }
  
    login() {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 8px; font-weight: 500">Login Succesfully</span> <img style="float: right;padding-top: 10px" src="../assets/icons/cross.png">', position: 'bottom', timer: 4000, showCancelButton: false, width: 400, showConfirmButton: false, background: "#E8FFF3", color: "#47BE7D", backdrop: false
      })
    }
  
    loginError() {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 10px; font-weight: 500">Incorrect username or password</span> <i class="bi bi-exclamation" style="font-size: 32px"></i>', position: 'bottom', timer: 4000, showCancelButton: false, width: 400, showConfirmButton: false, background: "#FF4433", color: "#fff", backdrop: false
      })
    }
  
    setPassword() {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 8px; font-weight: 500">Password has been set Succesfully</span> <img style="float: right;padding-top: 10px" src="../assets/icons/cross.png">', position: 'bottom', timer: 4000, showCancelButton: false, width: 400, showConfirmButton: false, background: "#E8FFF3", color: "#47BE7D", backdrop: false
      })
    }
    customError(message: any) {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 5px; font-weight: 500; font-size: 14px;">' +
          message +
          '</span> <i class="bi bi-exclamation" style="font-size: 18px; padding-top: 5px; float: right;"></i>',
        position: 'bottom',
        timer: 3000,
        showCancelButton: false,
        width: '300px',
        showConfirmButton: false,
        background: '#FF6F61', // Slightly muted red
        color: '#fff',
        backdrop: false,
        customClass: {
          popup: 'custom-swal-width',
        },
      });
    }
    
    customSuccess(message: any) {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 5px; font-weight: 500; font-size: 14px;">' +
          message +
          '</span> <img style="float: right; padding-top: 5px; width: 24px; height: 24px;" ',
        position: 'bottom',
        timer: 3000,
        showCancelButton: false,
        width: '300px',
        showConfirmButton: false,
        background: '#DFF2E2', // Softer green
        color: '#47BE7D',
        backdrop: false,
        customClass: {
          popup: 'custom-swal-width',
        },
      });
    }
     
    customError1(message: any) {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 10px; font-weight: 500">' + message + '</span> <i class="bi bi-exclamation" style="font-size: 32px"></i>', position: 'bottom', timer: 3100, showCancelButton: false, width: 500, showConfirmButton: false, background: "#FF6F61", color: "#fff", backdrop: false
      })
    }
  
    customSuccess1(message: any) {
      Swal.fire({
        html:
          '<span style="float: left; padding-top: 8px; font-weight: 500">' + message + '</span> <img style="float: right;padding-top: 10px" src="../assets/icons/cross.png">', position: 'bottom', timer: 3100, showCancelButton: false, width: 450, showConfirmButton: false, background: "#E8FFF3", color: "#47BE7D", backdrop: false
      })
    }
}