import { TestBed } from '@angular/core/testing';

import { GooglePlacesServiceService } from './google-places-service.service';

describe('GooglePlacesServiceService', () => {
  let service: GooglePlacesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GooglePlacesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
