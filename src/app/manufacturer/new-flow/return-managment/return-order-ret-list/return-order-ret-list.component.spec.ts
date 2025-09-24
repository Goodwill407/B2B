import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnOrderRetListComponent } from './return-order-ret-list.component';

describe('ReturnOrderRetListComponent', () => {
  let component: ReturnOrderRetListComponent;
  let fixture: ComponentFixture<ReturnOrderRetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnOrderRetListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnOrderRetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
