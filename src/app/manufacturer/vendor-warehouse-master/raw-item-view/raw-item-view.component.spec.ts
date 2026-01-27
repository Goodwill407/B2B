import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawItemViewComponent } from './raw-item-view.component';

describe('RawItemViewComponent', () => {
  let component: RawItemViewComponent;
  let fixture: ComponentFixture<RawItemViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawItemViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawItemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
