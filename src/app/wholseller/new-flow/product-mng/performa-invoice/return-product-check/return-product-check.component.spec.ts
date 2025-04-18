import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnProductCheckComponent } from './return-product-check.component';

describe('ReturnProductCheckComponent', () => {
  let component: ReturnProductCheckComponent;
  let fixture: ComponentFixture<ReturnProductCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnProductCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnProductCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
