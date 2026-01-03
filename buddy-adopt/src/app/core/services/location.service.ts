import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
const endpoint: string = environment.baseUrlSpring;

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiKey = 'AIzaSyDMrtuq9gs0KuNFIsjz-bRwfPVs73VJ11M';

  constructor(private http: HttpClient) {}

  locationDis(dir1: string, dir2: string): Promise<number | null> {
  if (!dir1 || !dir2) return Promise.resolve(null);
    const url:string = `${endpoint}location/distance?address1=${encodeURIComponent(dir1)}&address2=${encodeURIComponent(dir2)}`;
  return this.http
    .get<number>(
      url
    )
    .toPromise()
    .then(res => res ?? null) // <-- asegura que nunca sea undefined
    .catch(() => null);
}

}
