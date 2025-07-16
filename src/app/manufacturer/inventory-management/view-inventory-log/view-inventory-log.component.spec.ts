import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInventoryLogComponent } from './view-inventory-log.component';

describe('ViewInventoryLogComponent', () => {
  let component: ViewInventoryLogComponent;
  let fixture: ComponentFixture<ViewInventoryLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewInventoryLogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewInventoryLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
