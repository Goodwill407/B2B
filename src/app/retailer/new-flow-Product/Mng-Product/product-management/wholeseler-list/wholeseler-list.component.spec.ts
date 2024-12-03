import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholeselerListComponent } from './wholeseler-list.component';

describe('WholeselerListComponent', () => {
  let component: WholeselerListComponent;
  let fixture: ComponentFixture<WholeselerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholeselerListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholeselerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
