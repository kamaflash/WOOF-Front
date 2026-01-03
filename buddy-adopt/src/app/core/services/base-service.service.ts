import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseServiceService {
  constructor(private http: HttpClient) {}

  // Obtener el token desde sessionStorage
  get token(): string {
    return sessionStorage?.getItem('token')! || '';
  }

  // Crear los encabezados con el token
  createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  postItem(url: string, formData: any, header: any = {}) {
    // Crear los encabezados con el token
    const headers = this.createHeaders(this.token);

    // Hacer la solicitud POST con el archivo (formData) y los encabezados
    return this.http.post(url, formData, {
      headers: headers,
    });
  }
  // Método POST sin token
  postItemSinToken(url: string, formData: any) {
    return this.http.post(url, formData);
  }

  // Método PUT con token
  putItem(url: string, formData: any) {
    const headers = this.createHeaders(this.token);
    return this.http.put(url, formData, {
      headers: headers
    });
  }
  delItem(url: string) {
    const headers = this.createHeaders(this.token);
    return this.http.delete(url,  {
      headers: headers
    });
  }

  // Método GET con token
  getItems(url: string) {
    const headers = this.createHeaders(this.token);
    return this.http.get(url, {
      headers: headers
    });
  }

  // Método GET con parámetros (para login u otros)
  getItemsWithParams(url: string, loginUser?: any) {
    const params = new HttpParams()
      .set('username', loginUser?.email || '')
      .set('password', loginUser?.password || '');

    return this.http.get(url, {
      params: params
    });
  }

  postItemImage(url: string, formData: any,header:any = {
    'x-token': this.token,
  }) {
    return this.http.post(url, formData, {
      headers: header,
    });
  }
}
