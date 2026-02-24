import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlsrInventoryLogsListComponent } from './whlsr-inventory-logs-list.component';

describe('WhlsrInventoryLogsListComponent', () => {
  let component: WhlsrInventoryLogsListComponent;
  let fixture: ComponentFixture<WhlsrInventoryLogsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlsrInventoryLogsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlsrInventoryLogsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
