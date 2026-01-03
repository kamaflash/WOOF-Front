import { Injectable } from '@angular/core';
import { Product } from '../interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
   private _dataSource = new BehaviorSubject<any[]>([]); // BehaviorSubject para emitir cambios

    // Getter para obtener el observable del dataSource
    get dataSource$() {
      return this._dataSource.asObservable();
    }

    // Setter para actualizar el valor de dataSource
    set dataSource(value: any[]) {
      this._dataSource.next(value); // Emite el nuevo valor
    }

    // Método para obtener el valor actual de dataSource
    get dataSource(): any[] {
      return this._dataSource.getValue();
    }
  constructor() {}

  // Método para obtener productos simulados
  getProductsSmall(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.dataSource);
      }, 1000); // Simula un retraso de 1 segundo
    });
  }
}
