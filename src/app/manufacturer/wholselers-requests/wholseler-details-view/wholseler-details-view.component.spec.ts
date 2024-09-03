import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholselerDetailsViewComponent } from './wholseler-details-view.component';

describe('WholselerDetailsViewComponent', () => {
  let component: WholselerDetailsViewComponent;
  let fixture: ComponentFixture<WholselerDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholselerDetailsViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholselerDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
