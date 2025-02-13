import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenPoRetailerManComponent } from './gen-po-retailer-man.component';

describe('GenPoRetailerManComponent', () => {
  let component: GenPoRetailerManComponent;
  let fixture: ComponentFixture<GenPoRetailerManComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenPoRetailerManComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenPoRetailerManComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
