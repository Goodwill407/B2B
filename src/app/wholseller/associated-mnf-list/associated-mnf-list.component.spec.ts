import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedMnfListComponent } from './associated-mnf-list.component';

describe('AssociatedMnfListComponent', () => {
  let component: AssociatedMnfListComponent;
  let fixture: ComponentFixture<AssociatedMnfListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociatedMnfListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssociatedMnfListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
