import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesServiceService {

   constructor() {}

  initAutocomplete(input: HTMLInputElement, callback: (data: any) => void) {
    if (!google || !google.maps || !google.maps.places) {
      console.error('Google Places no está cargado.');
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: 'es' }  // 🇪🇸 Cambia país si quieres
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      callback(place);
    });
  }
}
