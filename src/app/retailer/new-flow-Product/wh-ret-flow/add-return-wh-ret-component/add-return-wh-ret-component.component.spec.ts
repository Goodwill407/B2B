import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReturnWhRetComponentComponent } from './add-return-wh-ret-component.component';

describe('AddReturnWhRetComponentComponent', () => {
  let component: AddReturnWhRetComponentComponent;
  let fixture: ComponentFixture<AddReturnWhRetComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReturnWhRetComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddReturnWhRetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
