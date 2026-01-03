import { AbstractControl, ValidationErrors } from '@angular/forms';

export function googleAddressValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) return { invalidAddress: true };

  // Validar estructura esperada
  if (typeof value !== 'object') return { invalidAddress: true };

  if (!value.text || !value.isGoogle) return { invalidAddress: true };

  return null;
}
