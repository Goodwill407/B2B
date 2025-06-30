import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoQuantityUpdateFromMfgComponent } from './po-quantity-update-from-mfg.component';

describe('PoQuantityUpdateFromMfgComponent', () => {
  let component: PoQuantityUpdateFromMfgComponent;
  let fixture: ComponentFixture<PoQuantityUpdateFromMfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoQuantityUpdateFromMfgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PoQuantityUpdateFromMfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
