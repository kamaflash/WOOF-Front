import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private loaded = false;

  load(): Promise<void> {
    return new Promise((resolve) => {
      if (this.loaded) {
        resolve();
        return;
      }

      // Script de Maps
      const mapsScript = document.createElement('script');
      mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&libraries=places&callback=Function.prototype`;
      mapsScript.defer = true;

      // Script de componentes extendidos
      const componentsScript = document.createElement('script');
      componentsScript.src =
        'https://unpkg.com/@googlemaps/extended-component-library@0.6';
      componentsScript.defer = true;

      componentsScript.onload = () => {
        this.loaded = true;
        resolve();
      };

      document.head.appendChild(mapsScript);
      document.head.appendChild(componentsScript);
    });
  }
}
