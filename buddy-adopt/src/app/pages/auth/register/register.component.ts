import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SnackbackComponent } from '../../../shared/snackback/snackback.component';
import { UserService } from '../../../core/services/users/users.service';
import { Router, ɵEmptyOutletComponent } from '@angular/router';
import { BaseServiceService } from '../../../core/services/base-service.service';
import { SnackbackService } from '../../../core/services/snackback.service';
import { environment } from '../../../../enviroments/environment';
import { User } from '../../../core/models/user';
import {
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  takeUntil,
} from 'rxjs';
import { GooglePlacesServiceService } from '../../../core/services/google-places-service.service';
import { Constans } from '../../../core/consts';
import { googleAddressValidator } from '../../../core/validators/address.validator';
const endpoint = environment.baseUrlSpring + 'users';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SnackbackComponent,
    ɵEmptyOutletComponent,
  ],

  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, AfterViewInit  {
  registerForm: FormGroup;
  spinner: boolean = false;
  snackbarState = { message: '', type: 'info', show: true };
  isSend: boolean = false;
  checkingUsername: boolean = false;
  usernameExists: boolean = false;
  private destroy$ = new Subject<void>();
   @ViewChild('direccionInput') direccionInput!: ElementRef;
  tipeHome = Constans.HOUSETYPES

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private baseService: BaseServiceService,
    private snackbarService: SnackbackService,
    private placesService: GooglePlacesServiceService
  ) {
    this.snackbarService.snackbarState$.subscribe((state) => {
      this.snackbarState = state;
    });
    this.registerForm = this.fb.group({
      accountType: ['user', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.email]],
      name: ['', Validators.required],
      lastname: [''],
      phone: ['', Validators.required],
      address: [null, [Validators.required, googleAddressValidator]],

      houseType: ['', Validators.required],
      hasGarden: [false],
      hasKids: [false],
      hasOtherPets: [false],
      cif: [''],
      website: [''],
    });
  }
  ngAfterViewInit(): void {
  this.placesService.initAutocomplete(
    this.direccionInput.nativeElement,
    (place) => this.onPlaceSelected(place)
  );
}
  ngOnInit(): void {
    this.setValidatorFormsStatic();
    this.setupUsernameValidation('username');
    this.setupUsernameValidation('email');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
onPlaceSelected(place: any) {
  const fullAddress = place.formatted_address;

  this.registerForm.get('address')?.setValue({
    text: fullAddress,
    isGoogle: true
  });

  this.registerForm.get('address')?.updateValueAndValidity();
}
  setupUsernameValidation(controls: string) {
    // Suscribirse a cambios en el username con debounce
    this.registerForm
      .get(controls)
      ?.valueChanges.pipe(
        debounceTime(500), // Espera 500ms después de que el usuario deja de escribir
        distinctUntilChanged(), // Solo ejecuta si el valor cambió
        takeUntil(this.destroy$) // Limpiar suscripción al destruir componente
      )
      .subscribe((username) => {
        if (
          username &&
          username.length >= 3 &&
          this.registerForm.get(controls)?.valid
        ) {
          this.checkUsernameAvailability(username, controls);
        } else {
          this.usernameExists = false;
        }
      });
  }
googleAddressValidator(control: any) {
  return control.value?.isGoogle === true ? null : { notGoogleValid: true };
}
  checkUsernameAvailability(username: string, controls: string) {
    this.checkingUsername = true;
    const url = `${endpoint}/exist/${controls}/${encodeURIComponent(username)}`;

    this.baseService.getItems(url).subscribe({
      next: (response: any) => {
        if (response.result) {
          this.registerForm.get(controls)?.setErrors({ usernameTaken: true });
          if (controls === 'username') {
            this.snackbarService.show(
              `El ${
                this.registerForm.get('accountType')?.value === 'shelter'
                  ? 'nombre de protectora'
                  : 'nombre de usuario'
              } ya está en uso`,
              'error'
            );
          } else {
            this.snackbarService.show(`El email ya está en uso`, 'info');
          }
        } else {
          // Limpiar error si existe
          const errors = this.registerForm.get(controls)?.errors;
          if (errors && errors['usernameTaken']) {
            delete errors['usernameTaken'];
            this.registerForm
              .get(controls)
              ?.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      },
      error: (err) => {
        this.checkingUsername = false;
        console.error('Error verificando username:', err);
        // No marcamos error para no bloquear el registro por fallo en validación
      },
    });
  }

  // Validador asíncrono personalizado
  usernameValidator(control: AbstractControl) {
    return of(null); // Validación asíncrona se maneja en checkUsernameAvailability
  }

  // Método para obtener mensaje de error del username
  getUsernameError(controls: string): string {
    const control = this.registerForm.get(controls);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (control.errors['usernameTaken']) {
      return this.registerForm.get('accountType')?.value === 'shelter'
        ? 'Este nombre de protectora ya está registrado'
        : 'Este nombre de usuario ya está en uso';
    }

    return '';
  }

  setValidatorFormsStatic() {
  this.registerForm.get('accountType')!.valueChanges.subscribe((change) => {

    const name = this.registerForm.get('name')!;
    const lastname = this.registerForm.get('lastname')!;
    const houseType = this.registerForm.get('houseType')!;
    const cif = this.registerForm.get('cif')!;

    if (change === 'user') {
      // Limpio y aplico validadores
      name.setValidators(Validators.required);
      name.updateValueAndValidity({ onlySelf: true });

      lastname.setValidators(Validators.required);
      lastname.updateValueAndValidity({ onlySelf: true });

      houseType.setValidators(Validators.required);
      houseType.updateValueAndValidity({ onlySelf: true });

      cif.clearValidators();
      cif.updateValueAndValidity({ onlySelf: true });

    } else {
      name.clearValidators();
      name.updateValueAndValidity({ onlySelf: true });

      lastname.clearValidators();
      lastname.updateValueAndValidity({ onlySelf: true });

      houseType.clearValidators();
      houseType.updateValueAndValidity({ onlySelf: true });

      cif.setValidators(Validators.required);
      cif.updateValueAndValidity({ onlySelf: true });
    }
  });

  this.registerForm.valueChanges.subscribe(() => {
    const invalidControls = this.getInvalidControls();
    console.log('Campos inválidos:', invalidControls);
  });
}

  async onSubmit() {
    if (this.registerForm.valid) {
      const url = `${endpoint}/register`;
      let registerUser = this.registerForm.value;
      registerUser.address = this.registerForm.get('address')?.value.text
      this.spinner = true;
      this.baseService.postItem(url, registerUser).subscribe({
        next: () => {

        },
        error: (err) => {
          this.spinner = false;

          this.snackbarService.show(
            'Ha ocurrido un error al procesar el registro. Inténtalo más tarde.',
            'error'
          );
          console.error('Error en register:', err);
        },
        complete: () => {
          this.isSend = true;
          this.spinner = false;
          console.log('Petición completada');
        },
      });

      // Aquí llamas a tu servicio de login
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  getInvalidControls(): string[] {
    const invalid = [];
    const controls = this.registerForm.controls;

    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }


onAddressSelected(place: any) {
  this.registerForm.get('address')?.setValue(place.formattedAddress);
  this.registerForm.get('address')?.markAsDirty();
  this.registerForm.get('address')?.updateValueAndValidity();
}
}
