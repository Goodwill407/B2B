import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-link-channel-partner',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgClass,
    FormsModule,
    TooltipModule
  ],
  templateUrl: './link-channel-partner.component.html',
  styleUrl: './link-channel-partner.component.scss'
})
export class LinkChannelPartnerComponent {

  user: any;
  searchKey: string = '';
  searchResults: any[] = [];
  isSearching: boolean = false;
  searchPerformed: boolean = false;
  linkingEmail: string = ''; // tracks which CP is being linked (for loader)

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
  }

  searchChannelPartners() {
    if (!this.searchKey || this.searchKey.trim() === '') {
      this.communicationService.showNotification(
        'snackbar-danger',
        'Please enter a name, company or email to search',
        'bottom',
        'center'
      );
      return;
    }

    this.isSearching = true;
    this.searchPerformed = true;

    const body = {
      search: this.searchKey.trim(),
      page: 1,
      limit: 20,
      // excludeLinked: false
    };

    this.authService.post('channel-partner/global-search', body).subscribe({
      next: (res: any) => {
        this.searchResults = res.results || [];
        this.isSearching = false;
      },
      error: (err: any) => {
        this.isSearching = false;
        this.communicationService.showNotification(
          'snackbar-danger',
          'Search failed. Please try again.',
          'bottom',
          'center'
        );
      }
    });
  }

  onSearchInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchChannelPartners();
    }
  }

  isAlreadyLinked(cp: any): boolean {
    return cp.linkedManufacturers?.some(
      (m: any) => m.manufacturerEmail === this.user.email
    );
  }

  linkChannelPartner(cp: any) {
    this.linkingEmail = cp.email;

    this.authService.post('channel-partner/link', { cpEmail: cp.email }).subscribe({
      next: (res: any) => {
        this.linkingEmail = '';
        this.communicationService.showNotification(
          'snackbar-success',
          'Channel Partner linked successfully',
          'bottom',
          'center'
        );
        // update local result so button reflects linked state
        const found = this.searchResults.find((r: any) => r.email === cp.email);
        if (found) {
          if (!found.linkedManufacturers) found.linkedManufacturers = [];
          found.linkedManufacturers.push({
            manufacturerEmail: this.user.email,
            isApproved: true
          });
        }
      },
      error: (err: any) => {
        this.linkingEmail = '';
        this.communicationService.showNotification(
          'snackbar-danger',
          err?.error?.message || 'Failed to link channel partner',
          'bottom',
          'center'
        );
      }
    });
  }

  viewChannelPartner(cp: any) {
    this.router.navigate(['/mnf/view-ch-partner', cp.email], {
      queryParams: { from: 'link' }
    });
  }

  navigateBack() {
    this.router.navigate(['/mnf/list-ch-partner']);
  }
}