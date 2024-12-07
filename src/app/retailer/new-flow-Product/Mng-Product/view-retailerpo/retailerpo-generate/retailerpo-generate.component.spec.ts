import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerpoGenerateComponent } from './retailerpo-generate.component';

describe('RetailerpoGenerateComponent', () => {
  let component: RetailerpoGenerateComponent;
  let fixture: ComponentFixture<RetailerpoGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerpoGenerateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerpoGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
