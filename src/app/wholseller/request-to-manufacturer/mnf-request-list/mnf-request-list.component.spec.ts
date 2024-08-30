import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnfRequestListComponent } from './mnf-request-list.component';

describe('MnfRequestListComponent', () => {
  let component: MnfRequestListComponent;
  let fixture: ComponentFixture<MnfRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnfRequestListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MnfRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
