import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueToLabel',
})
export class ValueToLabelPipe implements PipeTransform {
  transform(value: string | number, options: { value: string | number; label: string }[]): string {
    if (!options || !value) return 'Desconocido';

    const match = options.find((option) => option.value === value);
    return match ? match.label : 'Desconocido'; // Devuelve el label o 'Desconocido' si no se encuentra
  }
}
