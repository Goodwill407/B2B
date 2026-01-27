import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawItemInventoryComponent } from './raw-item-inventory.component';

describe('RawItemInventoryComponent', () => {
  let component: RawItemInventoryComponent;
  let fixture: ComponentFixture<RawItemInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawItemInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawItemInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
