import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/users/users.service';
import { Router } from '@angular/router';
import { BaseServiceService } from '../../../core/services/base-service.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../enviroments/environment';
import { User } from '../../../core/models/user';
import { response } from 'express';
import { SnackbackService } from '../../../core/services/snackback.service';
import { SnackbackComponent } from '../../../shared/snackback/snackback.component';
const endpoint = environment.baseUrlSpring + 'users';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, SnackbackComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  spinner: boolean = false;
  snackbarState = { message: '', type: 'info', show: true };
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private baseService: BaseServiceService,
    private snackbarService: SnackbackService
  ) {
    this.snackbarService.snackbarState$.subscribe((state) => {
      this.snackbarState = state;
    });
    this.loginForm = this.fb.group({
      usernamemail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const url = `${endpoint}/validate`;
      const loginUser = this.loginForm.value;
      this.spinner = true;
      this.baseService.postItemSinToken(url, loginUser).subscribe((resp) => {
        if (resp) {
          this.userService.user = resp as User;
          this.userService.login(this.loginForm.value).subscribe({
            next: (response) => {
              setTimeout(() => {
                this.spinner = false;
              }, 500);
              this.router.navigate(['']);
              // Maneja la respuesta del login, por ejemplo, redirigir al usuario
            },
            error: (error) => {
              console.error('Error en el login:', error);
              this.snackbarService.show('Error en credenciales', 'success');
              this.spinner = false;

              // Maneja el error, por ejemplo, mostrar un mensaje al usuario

            },
            complete:() => {
              setTimeout(() => {
                this.spinner = false;
              }, 500);
            }
          });
        } else {
          setTimeout(() => {
            this.spinner = false;
          }, 500);
          this.snackbarService.show(
            'Algo ha fallado. Consulte con administrador',
            'error'
          );
        }
      });

      // Aquí llamas a tu servicio de login
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
