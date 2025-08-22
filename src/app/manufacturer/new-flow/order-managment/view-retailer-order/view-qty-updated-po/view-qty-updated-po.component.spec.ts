import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQtyUpdatedPoComponent } from './view-qty-updated-po.component';

describe('ViewQtyUpdatedPoComponent', () => {
  let component: ViewQtyUpdatedPoComponent;
  let fixture: ComponentFixture<ViewQtyUpdatedPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQtyUpdatedPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewQtyUpdatedPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
