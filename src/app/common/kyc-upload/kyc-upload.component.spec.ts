import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycUploadComponent } from './kyc-upload.component';

describe('KycUploadComponent', () => {
  let component: KycUploadComponent;
  let fixture: ComponentFixture<KycUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KycUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
