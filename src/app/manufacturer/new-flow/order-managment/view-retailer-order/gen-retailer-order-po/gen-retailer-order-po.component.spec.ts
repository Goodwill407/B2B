import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenRetailerOrderPoComponent } from './gen-retailer-order-po.component';

describe('GenRetailerOrderPoComponent', () => {
  let component: GenRetailerOrderPoComponent;
  let fixture: ComponentFixture<GenRetailerOrderPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenRetailerOrderPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenRetailerOrderPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
