import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerBulkUploadComponent } from './retailer-bulk-upload.component';

describe('RetailerBulkUploadComponent', () => {
  let component: RetailerBulkUploadComponent;
  let fixture: ComponentFixture<RetailerBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerBulkUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
