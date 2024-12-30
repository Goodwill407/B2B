import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalProductWhComponent } from './final-product-wh.component';

describe('FinalProductWhComponent', () => {
  let component: FinalProductWhComponent;
  let fixture: ComponentFixture<FinalProductWhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalProductWhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinalProductWhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
