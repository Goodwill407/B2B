import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedRetailersListComponent } from './rejected-retailers-list.component';

describe('RejectedRetailersListComponent', () => {
  let component: RejectedRetailersListComponent;
  let fixture: ComponentFixture<RejectedRetailersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedRetailersListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectedRetailersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
