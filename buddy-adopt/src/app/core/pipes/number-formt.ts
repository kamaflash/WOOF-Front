import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return ''; // Devuelve una cadena vacía si el valor no es válido
    }

    const number = typeof value === 'string' ? parseFloat(value) : value;

    // Divide el número en parte entera y decimal
    const [integerPart, decimalPart] = number
      .toFixed(decimals) // Asegura que siempre haya el número correcto de decimales
      .split('.');

    // Agrega separadores de miles a la parte entera
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Une la parte entera y decimal con una coma
    return `${formattedInteger},${decimalPart}`;
  }
}
