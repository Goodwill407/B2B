import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateRawItemComponent } from './add-update-raw-item.component';

describe('AddUpdateRawItemComponent', () => {
  let component: AddUpdateRawItemComponent;
  let fixture: ComponentFixture<AddUpdateRawItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateRawItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdateRawItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
