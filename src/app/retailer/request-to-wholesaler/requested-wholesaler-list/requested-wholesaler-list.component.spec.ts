import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestedWholesalerListComponent } from './requested-wholesaler-list.component';

describe('RequestedWholesalerListComponent', () => {
  let component: RequestedWholesalerListComponent;
  let fixture: ComponentFixture<RequestedWholesalerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestedWholesalerListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestedWholesalerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
