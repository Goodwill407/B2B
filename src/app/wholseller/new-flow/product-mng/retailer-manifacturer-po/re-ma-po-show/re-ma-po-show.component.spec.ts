import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReMaPoShowComponent } from './re-ma-po-show.component';

describe('ReMaPoShowComponent', () => {
  let component: ReMaPoShowComponent;
  let fixture: ComponentFixture<ReMaPoShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReMaPoShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReMaPoShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
