import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerMnfAssociatedListComponent } from './retailer-mnf-associated-list.component';

describe('RetailerMnfAssociatedListComponent', () => {
  let component: RetailerMnfAssociatedListComponent;
  let fixture: ComponentFixture<RetailerMnfAssociatedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerMnfAssociatedListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerMnfAssociatedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
