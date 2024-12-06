import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamiliaReportComponent } from './familia-report.component';

describe('FamiliaReportComponent', () => {
  let component: FamiliaReportComponent;
  let fixture: ComponentFixture<FamiliaReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamiliaReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FamiliaReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
