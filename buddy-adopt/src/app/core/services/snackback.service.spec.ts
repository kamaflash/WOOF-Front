import { TestBed } from '@angular/core/testing';

import { SnackbackService } from './snackback.service';

describe('SnackbackService', () => {
  let service: SnackbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
