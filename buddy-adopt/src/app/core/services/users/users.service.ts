import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  delay,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { User } from '../../models/user';
import { environment } from '../../../../enviroments/environment';

const endpoint = environment.baseUrlSpring;
const loginUrl = environment.baseUrlLogin;

@Injectable({ providedIn: 'root' })
export class UserService {
  private _userSubject = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (this.isBrowser()) {
      const storedUser = this.getStoredUser();
      this._userSubject.next(storedUser);
    }
  }

  // --- Public Getters ---
  get user(): User | null {
    return this._userSubject.value;
  }

  get userChange(): Observable<User | null> {
    return this._userSubject.asObservable();
  }

  get token(): string {
    return this.isBrowser() ? sessionStorage.getItem('token') || '' : '';
  }

  // --- Public Setters ---
  set user(newUser: User | null) {
    this._userSubject.next(newUser);
    if (this.isBrowser()) {
      if (newUser) {
        sessionStorage.setItem('us', JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem('us');
      }
    }
  }

  // --- Session Storage Utils ---
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getStoredUser(): User | null {
    const stored = sessionStorage.getItem('us');
    return stored ? JSON.parse(stored) : null;
  }

  private setToken(token: string) {
    if (this.isBrowser()) {
      sessionStorage.setItem('token', token);
    }
  }

  private clearSession() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('us');
  }

  // --- Auth ---
  login(formData: { usernamemail: string; password: string }): Observable<any> {
    const params = new HttpParams()
      .set('username', formData.usernamemail)
      .set('password', formData.password);

    return this.http.post(`${loginUrl}login`, null, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      params,
      withCredentials: true,
    }).pipe(
      tap((resp: any) => {
        this.setToken(resp.access_token);
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  }

  logout() {
    this.clearSession();
    this.user = null;
    this.router.navigateByUrl('/login');
  }

  validateToken(): Observable<boolean> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${loginUrl}valid`, { headers }).pipe(
      map((resp: any) => {
        this.setToken(resp.access_token);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  loginGoogle(token: string): Observable<any> {
    return this.http.post(`${endpoint}/login/google`, { token }).pipe(
      tap((resp: any) => {
        this.setToken(resp.token);
      })
    );
  }

  // --- User CRUD ---
  createUser(formData: any): Observable<any> {
    return this.http.post(`${endpoint}/user`, formData);
  }

  updateUser(newUser: User): Observable<any> {
    return this.http.put(`${endpoint}/user/${newUser.id}`, newUser, {
      headers: this.authHeaders(),
    });
  }

  getUsers(desde: number = 0): Observable<{ Users: User[]; total: number }> {
    return this.http.get(`${endpoint}/user`, {
      headers: this.authHeaders(),
      params: new HttpParams().set('desde', desde),
    }).pipe(
      delay(500),
      map((resp: any) => {
        const Users = (resp.usuarios as User[]).map((user) =>
          new User(
            user.accountType,
            user.username,
            user.email,
            user.lastname,
            user.name,
            user.id,
            user.bio,
            user.password,
            user.roles,
            user.avatarUrl,
            user.enabled,
            user.createdAt,
            user.updatedAt,
            user.direction,
            user.phone,
            user.website
          )
        );
        return {
          Users,
          total: resp.total,
        };
      })
    );
  }

  getUserByUID(uid: string): Observable<{ user: User; favoritesProtected: any }> {
    return this.http.get(`${endpoint}/user/${uid}`, {
      headers: this.authHeaders(),
    }).pipe(
      delay(500),
      map((resp: any) => ({
        user: resp.user as User,
        favoritesProtected: resp.favoritesProtected,
      }))
    );
  }

  // --- Helpers ---
  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-token': this.token,
      'Content-Type': 'application/json'
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'No se pudo conectar al servidor. Verifica tu conexión.';
    } else if (error.status >= 400 && error.status < 500) {
      return 'Credenciales incorrectas. Por favor, verifica e intenta nuevamente.';
    } else if (error.status >= 500) {
      return 'Hubo un problema en el servidor. Intenta más tarde.';
    } else {
      return 'Ocurrió un error inesperado. Intenta más tarde.';
    }
  }
}
