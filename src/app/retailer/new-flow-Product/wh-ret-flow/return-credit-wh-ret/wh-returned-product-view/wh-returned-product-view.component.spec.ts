import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhReturnedProductViewComponent } from './wh-returned-product-view.component';

describe('WhReturnedProductViewComponent', () => {
  let component: WhReturnedProductViewComponent;
  let fixture: ComponentFixture<WhReturnedProductViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhReturnedProductViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhReturnedProductViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
