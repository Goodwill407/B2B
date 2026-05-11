import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpSendRequestByBrandComponent } from './cp-send-request-by-brand.component';

describe('CpSendRequestByBrandComponent', () => {
  let component: CpSendRequestByBrandComponent;
  let fixture: ComponentFixture<CpSendRequestByBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpSendRequestByBrandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpSendRequestByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
