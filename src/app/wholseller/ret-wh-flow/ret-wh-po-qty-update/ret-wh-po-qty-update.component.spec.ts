import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhPoQtyUpdateComponent } from './ret-wh-po-qty-update.component';

describe('RetWhPoQtyUpdateComponent', () => {
  let component: RetWhPoQtyUpdateComponent;
  let fixture: ComponentFixture<RetWhPoQtyUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhPoQtyUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhPoQtyUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
