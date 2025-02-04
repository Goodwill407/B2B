import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerWholAssociatedListComponent } from './retailer-whol-associated-list.component';

describe('RetailerWholAssociatedListComponent', () => {
  let component: RetailerWholAssociatedListComponent;
  let fixture: ComponentFixture<RetailerWholAssociatedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerWholAssociatedListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerWholAssociatedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
