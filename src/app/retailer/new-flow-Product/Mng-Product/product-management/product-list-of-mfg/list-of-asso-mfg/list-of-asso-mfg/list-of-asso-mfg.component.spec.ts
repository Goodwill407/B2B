import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfAssoMfgComponent } from './list-of-asso-mfg.component';

describe('ListOfAssoMfgComponent', () => {
  let component: ListOfAssoMfgComponent;
  let fixture: ComponentFixture<ListOfAssoMfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfAssoMfgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListOfAssoMfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
