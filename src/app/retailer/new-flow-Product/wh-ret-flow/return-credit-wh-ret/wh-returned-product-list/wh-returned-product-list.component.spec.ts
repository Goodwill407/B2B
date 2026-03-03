import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhReturnedProductListComponent } from './wh-returned-product-list.component';

describe('WhReturnedProductListComponent', () => {
  let component: WhReturnedProductListComponent;
  let fixture: ComponentFixture<WhReturnedProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhReturnedProductListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhReturnedProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
