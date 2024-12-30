import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributeMProductComponent } from './distribute-m-product.component';

describe('DistributeMProductComponent', () => {
  let component: DistributeMProductComponent;
  let fixture: ComponentFixture<DistributeMProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributeMProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributeMProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
