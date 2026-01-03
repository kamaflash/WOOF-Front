import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Hace que el servicio esté disponible en toda la aplicación
})
export class CustomerService {
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

  private _dataSourceSub = new BehaviorSubject<any[]>([]); // BehaviorSubject para emitir cambios

  // Getter para obtener el observable del dataSource
  get dataSourceSub$() {
    return this._dataSourceSub.asObservable();
  }

  // Setter para actualizar el valor de dataSource
  set dataSourceSub(value: any[]) {
    this._dataSourceSub.next(value); // Emite el nuevo valor
  }

  // Método para obtener el valor actual de dataSource
  get dataSourceSub(): any[] {
    return this._dataSourceSub.getValue();
  }


  private _dataSourceSecond = new BehaviorSubject<any[]>([]); // BehaviorSubject para emitir cambios

  // Getter para obtener el observable del dataSource
  get dataSourceSecond$() {
    return this._dataSourceSub.asObservable();
  }

  // Setter para actualizar el valor de dataSource
  set dataSourceSecond(value: any[]) {
    this._dataSourceSub.next(value); // Emite el nuevo valor
  }

  // Método para obtener el valor actual de dataSource
  get dataSourceSecond(): any[] {
    return this._dataSourceSub.getValue();
  }



  constructor() {}

  // Simula la obtención de datos de clientes
  getCustomersLarge(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.dataSource);
      }, 1000); // Simula un retraso de 1 segundo
    });
  }
}
