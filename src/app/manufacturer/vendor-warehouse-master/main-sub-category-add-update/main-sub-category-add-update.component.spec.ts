import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSubCategoryAddUpdateComponent } from './main-sub-category-add-update.component';

describe('MainSubCategoryAddUpdateComponent', () => {
  let component: MainSubCategoryAddUpdateComponent;
  let fixture: ComponentFixture<MainSubCategoryAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainSubCategoryAddUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainSubCategoryAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
