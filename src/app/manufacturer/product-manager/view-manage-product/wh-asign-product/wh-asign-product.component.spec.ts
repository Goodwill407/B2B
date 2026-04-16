import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhAsignProductComponent } from './wh-asign-product.component';

describe('WhAsignProductComponent', () => {
  let component: WhAsignProductComponent;
  let fixture: ComponentFixture<WhAsignProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhAsignProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhAsignProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
