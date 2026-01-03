import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Customer } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customers: Customer[] = [];

  constructor() {
    this.generateCustomers();
  }

  getCustomersLarge() {
    // Simula una llamada HTTP con retraso de 1 segundo
    return of(this.customers).pipe(delay(1000)).toPromise();
  }

  private generateCustomers(): void {
    const statuses = ['unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal'];
    const names = ['Juan Pérez', 'Ana López', 'Carlos García', 'Marta Díaz', 'Luis Torres'];
    const companies = ['TechSoft', 'InnovaCorp', 'SmartBudget', 'EcoWorld', 'FinApp'];

    for (let i = 1; i <= 50; i++) {
      this.customers.push({
        id: i,
        name: names[i % names.length],
        company: companies[i % companies.length],
        date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: statuses[i % statuses.length],
        country: { name: 'España' },
        activity: Math.floor(Math.random() * 100),
        representative: {
          name: 'Rep ' + i,
          image: 'amyelsner.png'
        }
      });
    }
  }
}
