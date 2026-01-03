import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  transform(value: Date | string | null): string {
    if (!value) return '';

    const date = new Date(value); // Convierte el valor a un objeto Date
    const day = date.getDate();
    const monthNames = [
      'Ene',
      'Febr',
      'Marz',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Agost',
      'Sept',
      'Octub',
      'Nov',
      'Dic',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Devuelve el formato deseado
  }
}
