import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholesalerProfileComponent } from './wholesaler-profile.component';

describe('WholesalerProfileComponent', () => {
  let component: WholesalerProfileComponent;
  let fixture: ComponentFixture<WholesalerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholesalerProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholesalerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
