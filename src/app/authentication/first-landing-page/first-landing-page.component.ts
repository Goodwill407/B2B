import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-first-landing-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './first-landing-page.component.html',
  styleUrl: './first-landing-page.component.scss'
})
export class FirstLandingPageComponent {

  constructor(private fb: FormBuilder, public dialog: MatDialog, private route: Router) { }
  notices: string[] = [
    " Key project team appointed.",
    " Social media channels dedicated to the project are now active.",
    " Students and schools can now login and explore the platform. ",
    " Team induction and training has been conducted."
  ];
  currentNotice: any;
  noticeIndex: number = 0;
  intervalId: any;


  ngOnInit(): void {
    this.currentNotice = this.notices[this.noticeIndex];
    this.startNoticeRotation();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startNoticeRotation(): void {
    this.intervalId = setInterval(() => {
      this.noticeIndex = (this.noticeIndex + 1) % this.notices.length;
      this.currentNotice = this.notices[this.noticeIndex];
    }, 3000); // Change notice every 3 seconds
  }
  navigateFunction() {
    this.route.navigateByUrl('/authentication/signin')
  }

  navigateScholarship() {
    window.open('https://dmfkjr-scholarship.odisha.gov.in/', '_self');
  }


}
