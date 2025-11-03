import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRetMfgPoPartialNewComponent } from './update-ret-mfg-po-partial-new.component';

describe('UpdateRetMfgPoPartialNewComponent', () => {
  let component: UpdateRetMfgPoPartialNewComponent;
  let fixture: ComponentFixture<UpdateRetMfgPoPartialNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateRetMfgPoPartialNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateRetMfgPoPartialNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
