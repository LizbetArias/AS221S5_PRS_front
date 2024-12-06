import { TestBed } from '@angular/core/testing';

import { ReportTrimesterService } from './report-trimester.service';

describe('ReportTrimesterService', () => {
  let service: ReportTrimesterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportTrimesterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
