import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventryStockComponent } from './inventry-stock.component';

describe('InventryStockComponent', () => {
  let component: InventryStockComponent;
  let fixture: ComponentFixture<InventryStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventryStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InventryStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
