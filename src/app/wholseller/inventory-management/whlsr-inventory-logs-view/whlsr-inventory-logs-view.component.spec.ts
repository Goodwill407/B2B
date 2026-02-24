import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlsrInventoryLogsViewComponent } from './whlsr-inventory-logs-view.component';

describe('WhlsrInventoryLogsViewComponent', () => {
  let component: WhlsrInventoryLogsViewComponent;
  let fixture: ComponentFixture<WhlsrInventoryLogsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlsrInventoryLogsViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlsrInventoryLogsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
