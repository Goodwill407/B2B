import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';

interface Subcategory {
  id: string;
  categoryId: string;
  categoryName: string;
  subcategoryName: string;
  subcategoryCode: string;
  description: string;
  isActive: boolean;
  note: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  note: string;
  subcategories?: Subcategory[];
}

@Component({
  selector: 'app-list-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    AccordionModule,
    TagModule,
    PaginatorModule
  ],
  providers: [ConfirmationService],
  templateUrl: './list-categories.component.html',
  styleUrl: './list-categories.component.scss',
})
export class ListCategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  manufacturerEmail = '';
  searchTerm = '';
  expandedCategoryIds = new Set<string>();

  currentPage = 1;
pageSize = 10;
totalRecords = 0;

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.manufacturerEmail = currentUser?.email || '';
    this.loadCategories();
  }

  loadCategories(): void {
  this.loading = true;
  
  const url = `manufacture-category?page=${this.currentPage}&limit=${this.pageSize}&manufacturerEmail=${this.manufacturerEmail}`;
  
  this.authService.get(url).subscribe(
    (res: any) => {
      const data = res.data || res;
      this.categories = data.results || [];
      this.filteredCategories = [...this.categories];
      this.totalRecords = data.totalResults || 0;
      this.loading = false;
    },
    () => {
      this.communicationService.customError1('Failed to load categories');
      this.loading = false;
    }
  );
}

onPageChange(event: any): void {
  this.currentPage = event.page + 1;
  this.pageSize = event.rows;
  this.loadCategories();
}

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCategories = this.categories.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        cat.code.toLowerCase().includes(term)
      );
    }
  }

  loadSubcategories(category: Category): void {
    if (category.subcategories) {
      return;
    }

    const url = `manufacture-subcategory?categoryId=${category.id}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        const data = res.data || res;
        category.subcategories = data.results || [];
      },
      () => {
        category.subcategories = [];
      }
    );
  }

  onAccordionOpen(event: any, category: Category): void {
    if (!this.expandedCategoryIds.has(category.id)) {
      this.expandedCategoryIds.add(category.id);
      this.loadSubcategories(category);
    }
  }

  addCategory(): void {
    this.router.navigate(['/mnf/add-category']);
  }

  editCategory(category: Category): void {
    this.router.navigate(['/mnf/update-category', category.id]);
  }

  deleteCategory(category: Category): void {
    this.confirmationService.confirm({
      message: `Delete category "${category.name}" and all its subcategories?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.authService.delete2(`manufacture-category/${category.id}`).subscribe(
          () => {
            this.communicationService.customSuccess('Category deleted successfully');
            this.loadCategories();
          },
          () => {
            this.communicationService.customError1('Failed to delete category');
          }
        );
      },
    });
  }

  toggleCategoryStatus(category: Category): void {
    const url = `manufacture-category/${category.id}`;
    
    const updatedData = { 
      isActive: !category.isActive,
      manufacturerEmail: this.manufacturerEmail
    };

    this.authService.patchpimage(url, updatedData).subscribe(
      () => {
        this.communicationService.customSuccess(
          `Category ${updatedData.isActive ? 'activated' : 'deactivated'}`
        );
        this.loadCategories();
      },
      () => {
        this.communicationService.customError1('Failed to update category status');
      }
    );
  }

  addSubcategory(categoryId: string): void {
    this.router.navigate(['/mnf/add-category'], {
      queryParams: { categoryId },
    });
  }

  editSubcategory(subcategory: Subcategory): void {
    this.router.navigate(['/mnf/update-category', subcategory.id], {
      queryParams: { isSubcategory: true },
    });
  }

  deleteSubcategory(subcategory: Subcategory): void {
  this.confirmationService.confirm({
    message: `Delete subcategory "${subcategory.subcategoryName}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.authService.delete2(`manufacture-subcategory/${subcategory.id}`).subscribe(
        () => {
          this.communicationService.customSuccess('Subcategory deleted successfully');
          
          // Find parent category and reload only its subcategories
          const parentCategory = this.categories.find(c => c.id === subcategory.categoryId);
          if (parentCategory) {
            parentCategory.subcategories = undefined; // Clear to trigger reload
            this.loadSubcategories(parentCategory);
          }
        },
        () => {
          this.communicationService.customError1('Failed to delete subcategory');
        }
      );
    },
  });
}


  toggleSubcategoryStatus(subcategory: Subcategory): void {
  const url = `manufacture-subcategory/${subcategory.id}`;
  
  const updatedData = { 
    isActive: !subcategory.isActive,
    manufacturerEmail: this.manufacturerEmail
  };

  this.authService.patchpimage(url, updatedData).subscribe(
    () => {
      this.communicationService.customSuccess(
        `Subcategory ${updatedData.isActive ? 'activated' : 'deactivated'}`
      );
      
      // Find parent category and reload only its subcategories
      const parentCategory = this.categories.find(c => c.id === subcategory.categoryId);
      if (parentCategory) {
        parentCategory.subcategories = undefined; // Clear to trigger reload
        this.loadSubcategories(parentCategory);
      }
    },
    () => {
      this.communicationService.customError1('Failed to update subcategory status');
    }
  );
}

}
