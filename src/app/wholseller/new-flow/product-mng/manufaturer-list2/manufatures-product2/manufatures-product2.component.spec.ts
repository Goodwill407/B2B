import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufaturesProduct2Component } from './manufatures-product2.component';

describe('ManufaturesProduct2Component', () => {
  let component: ManufaturesProduct2Component;
  let fixture: ComponentFixture<ManufaturesProduct2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufaturesProduct2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManufaturesProduct2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
