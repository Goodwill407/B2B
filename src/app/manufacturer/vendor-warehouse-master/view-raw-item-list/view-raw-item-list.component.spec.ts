import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRawItemListComponent } from './view-raw-item-list.component';

describe('ViewRawItemListComponent', () => {
  let component: ViewRawItemListComponent;
  let fixture: ComponentFixture<ViewRawItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRawItemListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRawItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
