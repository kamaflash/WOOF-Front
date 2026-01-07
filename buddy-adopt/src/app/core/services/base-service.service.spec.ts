import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { BaseServiceService } from './base-service.service';

fdescribe('BaseServiceService', () => {
  let service: BaseServiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BaseServiceService]
    });

    service = TestBed.inject(BaseServiceService);
    httpMock = TestBed.inject(HttpTestingController);

    sessionStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return token from sessionStorage', () => {
    expect(service.token).toBe('mock-token');
  });

  it('should create headers with token', () => {
    const headers = service.createHeaders('test-token');
    expect(headers.get('Authorization')).toBe('Bearer test-token');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should POST item with token', () => {
    const url = '/api/test';
    const body = { test: true };

    service.postItem(url, body).subscribe(response => {
      expect(response).toEqual(body);
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(body);
  });

  it('should POST item without token', () => {
    const url = '/api/public';
    const body = { test: true };

    service.postItemSinToken(url, body).subscribe(response => {
      expect(response).toEqual(body);
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(body);
  });

  it('should PUT item with token', () => {
    const url = '/api/put';
    const body = { updated: true };

    service.putItem(url, body).subscribe(response => {
      expect(response).toEqual(body);
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(body);
  });

  it('should DELETE item with token', () => {
    const url = '/api/delete';

    service.delItem(url).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush({ success: true });
  });

  it('should GET items with token', () => {
    const url = '/api/items';
    const mockResponse = [{ id: 1 }];

    service.getItems(url).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockResponse);
  });

  it('should GET items with params', () => {
    const url = '/api/login';
    const loginUser = { email: 'test@mail.com', password: '1234' };

    service.getItemsWithParams(url, loginUser).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(
      r =>
        r.url === url &&
        r.params.get('username') === 'test@mail.com' &&
        r.params.get('password') === '1234'
    );

    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });

  it('should POST image with custom headers', () => {
    const url = '/api/image';
    const formData = new FormData();
    formData.append('file', 'test');

    service.postItemImage(url, formData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    req.flush({ uploaded: true });
  });
});
