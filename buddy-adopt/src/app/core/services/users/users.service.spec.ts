import { TestBed } from '@angular/core/testing';
import { UserService } from './users.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../models/user';

fdescribe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: Router, useValue: routerMock },
        { provide: PLATFORM_ID, useValue: 'browser' }, // simulamos navegador
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

    // Limpiar sessionStorage
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get and set user', () => {
    const user = new User(
      'type',
      'username',
      'email',
      'lastname',
      'name',
      'id'
    );
    service.user = user;
    expect(service.user).toEqual(user);
    expect(service.user).toEqual(
      jasmine.objectContaining({
        id: user.id,
        username: user.username,
        email: user.email,
      })
    );

    service.user = null;
    expect(service.user).toBeNull();
    expect(sessionStorage.getItem('us')).toBeNull();
  });

  it('should get token from sessionStorage', () => {
    sessionStorage.setItem('token', 'abc123');
    expect(service.token).toBe('abc123');
  });

  it('should login successfully', () => {
    const loginData = { usernamemail: 'test', password: '123' };
    const mockResp = { access_token: 'token123' };

    service.login(loginData).subscribe((resp: any) => {
      expect(resp).toEqual(mockResp);
      expect(sessionStorage.getItem('token')).toBe('token123');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/login'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResp);
  });

  it('should handle login error', () => {
    const loginData = { usernamemail: 'test', password: '123' };

    service.login(loginData).subscribe({
      next: () => fail('should have failed'),
      error: (error: Error) => {
        expect(error.message).toContain('Credenciales incorrectas');
      },
    });

    const req = httpMock.expectOne((r) => r.url.includes('/login'));
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('should logout and navigate', () => {
    sessionStorage.setItem('token', 'abc');
    service.logout();
    expect(service.user).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should validate token success', () => {
    sessionStorage.setItem('token', 'abc123');
    const mockResp = { access_token: 'newToken' };

    service.validateToken().subscribe((result: any) => {
      expect(result).toBeTrue();
      expect(sessionStorage.getItem('token')).toBe('newToken');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/valid'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResp);
  });

  it('should return false on validate token error', () => {
    service.validateToken().subscribe((result: any) => {
      expect(result).toBeFalse();
    });

    const req = httpMock.expectOne((r) => r.url.includes('/valid'));
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('should loginGoogle', () => {
    const token = 'googleToken';
    const mockResp = { token: 'newToken' };

    service.loginGoogle(token).subscribe((resp: any) => {
      expect(resp).toEqual(mockResp);
      expect(sessionStorage.getItem('token')).toBe('newToken');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/login/google'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResp);
  });

  it('should create user', () => {
    const data = { username: 'test' };
    service.createUser(data).subscribe((resp: any) => {
      expect(resp).toEqual(data);
    });

    const req = httpMock.expectOne((r) => r.url.includes('/user'));
    expect(req.request.method).toBe('POST');
    req.flush(data);
  });

  it('should update user', () => {
    const user = new User(
      'type',
      'username',
      'email',
      'lastname',
      'name',
      'id'
    );
    service.updateUser(user).subscribe((resp: any) => {
      expect(resp).toEqual(user);
    });

    const req = httpMock.expectOne((r) => r.url.includes(`/user/${user.id}`));
    expect(req.request.method).toBe('PUT');
    req.flush(user);
  });

  it('should get users with delay and map', (done) => {
    const mockResp = { usuarios: [{ id: '1', username: 'u1' }], total: 1 };

    service.getUsers().subscribe((result: any) => {
      expect(result.Users.length).toBe(1);
      expect(result.total).toBe(1);
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('/user'));
    req.flush(mockResp);
  });

  it('should get user by UID', (done) => {
    const uid = '123';
    const mockResp = { user: { id: uid }, favoritesProtected: [] };

    service.getUserByUID(uid).subscribe((result: any) => {
      expect(result.user.id).toBe(uid);
      expect(result.favoritesProtected).toEqual([]);
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes(`/user/${uid}`));
    req.flush(mockResp);
  });
});
